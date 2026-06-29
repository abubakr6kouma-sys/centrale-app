import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getGmailClientForUser } from '@/lib/gmailClient'
import { gmail_v1 } from 'googleapis'

// ──────────────────────────────────────────────────────────────
// MIME helpers — independent of gmailParser.ts to avoid any
// abstraction layering that might silently drop parts
// ──────────────────────────────────────────────────────────────

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

/**
 * Depth-first search that logs every MIME part and returns the first text/html found.
 * Written maximally defensively so nothing can silently skip a part.
 */
function findHtmlPartWithLog(
  part: gmail_v1.Schema$MessagePart,
  depth = 0,
  log: string[]
): string | null {
  const indent = '  '.repeat(depth)
  const size = part.body?.data ? part.body.data.length : 0
  log.push(`${indent}[${part.mimeType ?? '(no-type)'}] data=${size}b parts=${part.parts?.length ?? 0}`)

  if (part.mimeType === 'text/html' && part.body?.data) {
    const decoded = decodeBase64Url(part.body.data)
    log.push(`${indent}  ✅ HTML found — ${decoded.length} chars`)
    return decoded
  }

  for (const sub of part.parts ?? []) {
    const found = findHtmlPartWithLog(sub, depth + 1, log)
    if (found) return found
  }

  return null
}

function findPlainText(part: gmail_v1.Schema$MessagePart): string | null {
  if (part.mimeType === 'text/plain' && part.body?.data) {
    return decodeBase64Url(part.body.data)
  }
  for (const sub of part.parts ?? []) {
    const found = findPlainText(sub)
    if (found) return found
  }
  return null
}

// ──────────────────────────────────────────────────────────────
// HTML preparation
// ──────────────────────────────────────────────────────────────

// Script injected by OUR server (not from the email) — safe to allow-scripts
const RESIZE_SCRIPT = `
<script>
(function(){
  function sendH(){
    var h=document.documentElement.scrollHeight||document.body&&document.body.scrollHeight||300;
    parent.postMessage({type:'email-height',h:h},'*');
  }
  if(document.readyState==='complete')sendH();
  else window.addEventListener('load',sendH);
  if(window.ResizeObserver){new ResizeObserver(sendH).observe(document.documentElement);}
})();
</script>`

const BASE_INJECT = `<base target="_blank">
<style>
  img{max-width:100%!important;height:auto!important;display:block}
  *{box-sizing:border-box;max-width:100%}
  body{margin:0;padding:4px;word-break:break-word}
  table{border-collapse:collapse}
  a{word-break:break-all}
</style>`

function prepareEmailHtml(rawHtml: string): string {
  // Strip email scripts (we'll inject our own trusted resize script instead)
  let h = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '')

  if (/<\/head>/i.test(h)) {
    h = h.replace(/<\/head>/i, BASE_INJECT + '</head>')
  } else if (/<body[^>]*>/i.test(h)) {
    h = h.replace(/(<body[^>]*>)/i, '$1' + BASE_INJECT)
  } else {
    h = `<!DOCTYPE html><html><head><meta charset="UTF-8">${BASE_INJECT}</head><body>${h}</body></html>`
  }

  // Inject resize script before </body>
  h = h.replace(/<\/body>/i, RESIZE_SCRIPT + '</body>')
  if (!h.includes(RESIZE_SCRIPT)) h += RESIZE_SCRIPT

  return h
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function plainToHtml(text: string): string {
  const linked = escHtml(text).replace(
    /(https?:\/\/[^\s<>"]+[^\s<>".,!?;:)]+)/g,
    '<a href="$1">$1</a>'
  )
  return `<!DOCTYPE html><html>
<head><meta charset="UTF-8"><base target="_blank">
<style>
  body{margin:0;padding:4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13.5px;color:#3a3a36;line-height:1.7;word-break:break-word}
  pre{white-space:pre-wrap;margin:0}
  a{color:#8a6648;word-break:break-all}
</style>
</head>
<body><pre>${linked}</pre>${RESIZE_SCRIPT}</body></html>`
}

// ──────────────────────────────────────────────────────────────
// Route handler
// ──────────────────────────────────────────────────────────────

function htmlResponse(content: string): Response {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return htmlResponse('<p>Non autorisé</p>')

  const { data: emailRow } = await supabaseAdmin
    .from('emails')
    .select('id, gmail_message_id, body_full')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!emailRow) return htmlResponse('<p>Email introuvable</p>')

  // ── 1. Already stored as HTML in DB ───────────────────────
  const stored = (emailRow.body_full ?? '').trimStart()
  if (stored.startsWith('<') && /<(html|body|div|table)/i.test(stored.slice(0, 500))) {
    console.log(`[html-render] ${params.id}: serving cached HTML from DB (${stored.length} chars)`)
    return htmlResponse(prepareEmailHtml(stored))
  }

  // ── 2. Re-fetch from Gmail ─────────────────────────────────
  const mimeLog: string[] = []
  try {
    console.log(`[html-render] ${params.id}: fetching from Gmail (gmail_id=${emailRow.gmail_message_id})`)
    const gmail = await getGmailClientForUser(user.id)
    const { data: message } = await gmail.users.messages.get({
      userId: 'me',
      id: emailRow.gmail_message_id,
      format: 'full',
    })

    const topPart = message.payload
    if (!topPart) {
      console.log(`[html-render] ${params.id}: no payload in Gmail response`)
      return htmlResponse(plainToHtml(stored))
    }

    console.log(`[html-render] ${params.id}: top-level mimeType=${topPart.mimeType}`)

    const htmlBody = findHtmlPartWithLog(topPart, 0, mimeLog)
    console.log(`[html-render] MIME tree:\n${mimeLog.join('\n')}`)

    if (htmlBody) {
      console.log(`[html-render] ${params.id}: HTML found (${htmlBody.length} chars) — caching in DB`)
      await supabaseAdmin.from('emails').update({ body_full: htmlBody }).eq('id', emailRow.id)
      return htmlResponse(prepareEmailHtml(htmlBody))
    }

    // No HTML part — use plain text
    const plainBody = findPlainText(topPart) ?? stored ?? message.snippet ?? ''
    console.log(`[html-render] ${params.id}: no HTML found, rendering plain text (${plainBody.length} chars)`)
    return htmlResponse(plainToHtml(plainBody))
  } catch (err) {
    console.error(`[html-render] ${params.id}: Gmail fetch failed`, err)
    console.log(`[html-render] MIME tree so far:\n${mimeLog.join('\n')}`)
    return htmlResponse(plainToHtml(stored))
  }
}
