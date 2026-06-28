import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getGmailClientForUser } from '@/lib/gmailClient'
import { parseGmailMessage } from '@/lib/gmailParser'

function isAlreadyHtml(s: string): boolean {
  const t = s.trimStart().slice(0, 500)
  return t.startsWith('<') && /<(html|body|div|table|p\b|span|a\b|img\b|h[1-6])[^>]*>/i.test(t)
}

// Fetches the raw HTML body of an email from Gmail on demand.
// Also updates body_full in the DB so subsequent loads are instant.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { data: emailRow } = await supabaseAdmin
    .from('emails')
    .select('id, gmail_message_id, body_full')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!emailRow) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  // Already stored as HTML — return immediately
  if (emailRow.body_full && isAlreadyHtml(emailRow.body_full)) {
    return NextResponse.json({ ok: true, html: emailRow.body_full })
  }

  // Re-fetch from Gmail to get the HTML body
  try {
    const gmail = await getGmailClientForUser(user.id)
    const { data: message } = await gmail.users.messages.get({
      userId: 'me',
      id: emailRow.gmail_message_id,
      format: 'full',
    })

    const parsed = parseGmailMessage(message)

    if (parsed.bodyHtml) {
      // Cache in DB so next time is instant
      await supabaseAdmin
        .from('emails')
        .update({ body_full: parsed.bodyHtml })
        .eq('id', emailRow.id)

      return NextResponse.json({ ok: true, html: parsed.bodyHtml })
    }

    // Email has no HTML version — plain text only
    return NextResponse.json({ ok: true, html: null })
  } catch (err) {
    console.error('[html-body] gmail fetch failed', err)
    return NextResponse.json({ ok: false, error: 'gmail_failed' }, { status: 500 })
  }
}
