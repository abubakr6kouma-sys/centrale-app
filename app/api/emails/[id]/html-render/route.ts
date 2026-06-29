import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getGmailClientForUser } from '@/lib/gmailClient'
import { gmail_v1 } from 'googleapis'

// ── MIME parsing ───────────────────────────────────────────────

function b64decode(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

interface MimeResult {
  html: string | null
  htmlAttachmentId: string | null
  plain: string | null
}

// DFS over the MIME tree — collects first text/html and text/plain found.
// Also records attachmentId when body.data is absent (large body stored separately).
function findParts(part: gmail_v1.Schema$MessagePart, log: string[], d = 0): MimeResult {
  const pad = '  '.repeat(d)
  log.push(`${pad}${part.mimeType ?? '?'} data=${part.body?.data?.length ?? 0} attachId=${part.body?.attachmentId ?? '-'} parts=${part.parts?.length ?? 0}`)

  const result: MimeResult = { html: null, htmlAttachmentId: null, plain: null }

  if (part.mimeType === 'text/html') {
    if (part.body?.data) {
      result.html = b64decode(part.body.data)
      log.push(`${pad}  → HTML inline ${result.html.length}c`)
    } else if (part.body?.attachmentId) {
      result.htmlAttachmentId = part.body.attachmentId
      log.push(`${pad}  → HTML via attachmentId=${result.htmlAttachmentId}`)
    }
    return result
  }

  if (part.mimeType === 'text/plain' && part.body?.data) {
    result.plain = b64decode(part.body.data)
  }

  for (const sub of part.parts ?? []) {
    const sub_r = findParts(sub, log, d + 1)
    if (!result.html && !result.htmlAttachmentId) {
      result.html = sub_r.html
      result.htmlAttachmentId = sub_r.htmlAttachmentId
    }
    if (!result.plain) result.plain = sub_r.plain
    if ((result.html || result.htmlAttachmentId) && result.plain) break
  }

  return result
}

// ── HTML preparation ───────────────────────────────────────────

// Script injected BY OUR SERVER — runs in the sandboxed iframe.
// • Cleans up <a> whose visible text is a raw URL (shows domain instead)
// • Sends content height to parent for auto-resize
const SCRIPT = `<script>
(function(){
  function clean(){
    document.querySelectorAll('a').forEach(function(a){
      var t=(a.textContent||'').trim();
      if(!/^https?:\/\//.test(t))return;
      try{a.textContent=new URL(t).hostname.replace(/^www\./,'');}
      catch(e){a.textContent='→';}
    });
  }
  function height(){
    var h=Math.max(document.documentElement.scrollHeight,
                   document.body?document.body.scrollHeight:0,200);
    parent.postMessage({type:'email-height',h:h},'*');
  }
  function run(){clean();height();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();
  // Re-send height after images finish loading
  window.addEventListener('load',height);
  if(window.ResizeObserver) new ResizeObserver(height).observe(document.documentElement);
})();
</script>`

// Minimal base: open links in new tab + keep images within iframe width.
// We do NOT override font/color/background — let the email's own CSS control those.
const BASE = `<base target="_blank">
<style>img{max-width:100%!important}table{border-collapse:collapse}</style>`

function wrap(raw: string): string {
  // Remove only email-authored scripts (we inject our own trusted one)
  let h = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')

  // Inject BASE inside <head>
  if (/<\/head>/i.test(h)) {
    h = h.replace(/<\/head>/i, BASE + '</head>')
  } else if (/<html[^>]*>/i.test(h)) {
    h = h.replace(/(<html[^>]*>)/i, '$1<head>' + BASE + '</head>')
  } else {
    h = `<!DOCTYPE html><html><head><meta charset="UTF-8">${BASE}</head><body>${h}</body></html>`
  }

  // Inject our script before </body>
  return /<\/body>/i.test(h)
    ? h.replace(/<\/body>/i, SCRIPT + '</body>')
    : h + SCRIPT
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Decode &#NNN; and &#xNNN; HTML entities to their Unicode characters,
// so they don't get double-escaped by esc() and appear visible as "&#8199;" etc.
function decodeNumericEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => {
      const cp = Number(n)
      return cp > 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const cp = parseInt(h, 16)
      return cp > 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : ''
    })
}

// Plain-text emails: URLs become domain links, never raw URL text
function plainWrap(text: string): string {
  // Decode HTML numeric entities first (e.g. &#8199; → invisible char)
  // so esc() doesn't double-escape them into visible "&#8199;" text
  const decoded = decodeNumericEntities(text)
  const body = esc(decoded).replace(/(https?:\/\/[^\s<>"]+[^\s<>".,!?;:)]+)/g, (url) => {
    let lbl = '→'
    try { lbl = new URL(url).hostname.replace(/^www\./, '') } catch {}
    return `<a href="${url}" style="color:#1a73e8">${lbl}</a>`
  })
  return `<!DOCTYPE html><html>
<head><meta charset="UTF-8">${BASE}</head>
<body style="font-family:Google Sans,Roboto,Arial,sans-serif;font-size:14px;color:#202124;line-height:1.6;padding:0;margin:0">
<div style="padding:8px 0"><pre style="white-space:pre-wrap;margin:0;font-family:inherit;font-size:inherit">${body}</pre></div>
${SCRIPT}
</body></html>`
}

function htmlRes(c: string) {
  return new Response(c, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  })
}

// ── Route handler ──────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return htmlRes('<p>Non autorisé</p>')

  const { data: row } = await supabaseAdmin
    .from('emails')
    .select('id, gmail_message_id, body_full')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row) return htmlRes('<p>Introuvable</p>')

  // 1. Serve from DB cache if already HTML
  const stored = (row.body_full ?? '').trimStart()
  if (stored.startsWith('<') && /<(html|body|div|table)/i.test(stored.slice(0, 600))) {
    console.log(`[html-render] ${params.id} cache hit ${stored.length}c`)
    return htmlRes(wrap(stored))
  }

  // 2. Re-fetch from Gmail
  const log: string[] = []
  try {
    const gmail = await getGmailClientForUser(user.id)
    const { data: msg } = await gmail.users.messages.get({
      userId: 'me',
      id: row.gmail_message_id,
      format: 'full',
    })

    console.log(`[html-render] ${params.id} top=${msg.payload?.mimeType}`)
    const parts = msg.payload ? findParts(msg.payload, log) : { html: null, htmlAttachmentId: null, plain: null }
    console.log(`[html-render] MIME:\n${log.join('\n')}`)

    let htmlBody = parts.html

    // Fetch large HTML body stored as an attachment (Gmail API puts large bodies here)
    if (!htmlBody && parts.htmlAttachmentId) {
      console.log(`[html-render] ${params.id} fetching HTML via attachmentId=${parts.htmlAttachmentId}`)
      const att = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: row.gmail_message_id,
        id: parts.htmlAttachmentId,
      })
      if (att.data?.data) {
        htmlBody = b64decode(att.data.data)
        console.log(`[html-render] ${params.id} HTML via attachment ${htmlBody.length}c`)
      }
    }

    if (htmlBody) {
      console.log(`[html-render] ${params.id} HTML ${htmlBody.length}c — caching`)
      await supabaseAdmin.from('emails').update({ body_full: htmlBody }).eq('id', row.id)
      return htmlRes(wrap(htmlBody))
    }

    const fallback = parts.plain || stored || msg.snippet || ''
    console.log(`[html-render] ${params.id} no HTML — plain ${fallback.length}c`)
    return htmlRes(plainWrap(fallback))
  } catch (err) {
    console.error(`[html-render] ${params.id}`, err)
    return htmlRes(plainWrap(stored))
  }
}
