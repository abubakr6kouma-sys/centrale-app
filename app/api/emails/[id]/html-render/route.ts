import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getGmailClientForUser } from '@/lib/gmailClient'
import { gmail_v1 } from 'googleapis'

// ── MIME parsing ───────────────────────────────────────────────

function b64decode(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

function findHtml(part: gmail_v1.Schema$MessagePart, log: string[], d = 0): string | null {
  const pad = '  '.repeat(d)
  log.push(`${pad}${part.mimeType ?? '?'} data=${part.body?.data?.length ?? 0} parts=${part.parts?.length ?? 0}`)
  if (part.mimeType === 'text/html' && part.body?.data) {
    const s = b64decode(part.body.data)
    log.push(`${pad}  → HTML ${s.length}c`)
    return s
  }
  for (const sub of part.parts ?? []) {
    const r = findHtml(sub, log, d + 1)
    if (r) return r
  }
  return null
}

function findPlain(part: gmail_v1.Schema$MessagePart): string | null {
  if (part.mimeType === 'text/plain' && part.body?.data) return b64decode(part.body.data)
  for (const sub of part.parts ?? []) { const r = findPlain(sub); if (r) return r }
  return null
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

// Plain-text emails: URLs become domain links, never raw URL text
function plainWrap(text: string): string {
  const body = esc(text).replace(/(https?:\/\/[^\s<>"]+[^\s<>".,!?;:)]+)/g, (url) => {
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
    headers: { 'Content-Type': 'text/html;charset=utf-8', 'X-Frame-Options': 'SAMEORIGIN' },
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
    const htmlPart = msg.payload ? findHtml(msg.payload, log) : null
    console.log(`[html-render] MIME tree:\n${log.join('\n')}`)

    if (htmlPart) {
      console.log(`[html-render] ${params.id} HTML found ${htmlPart.length}c — caching`)
      await supabaseAdmin.from('emails').update({ body_full: htmlPart }).eq('id', row.id)
      return htmlRes(wrap(htmlPart))
    }

    const plain = msg.payload ? findPlain(msg.payload) : null
    const fallback = plain || stored || msg.snippet || ''
    console.log(`[html-render] ${params.id} no HTML, plain ${fallback.length}c`)
    return htmlRes(plainWrap(fallback))
  } catch (err) {
    console.error(`[html-render] ${params.id}`, err)
    return htmlRes(plainWrap(stored))
  }
}
