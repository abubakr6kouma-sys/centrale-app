import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getGmailClientForUser } from '@/lib/gmailClient'
import { buildRawEmail } from '@/lib/gmailParser'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const finalContent = body?.content
  if (!finalContent || typeof finalContent !== 'string' || !finalContent.trim()) {
    return NextResponse.json({ ok: false, error: 'empty_content' }, { status: 400 })
  }

  const { data: email, error: emailError } = await supabaseAdmin
    .from('emails')
    .select('*, drafts(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (emailError || !email) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  const emailRow = email as Record<string, any>
  const draft = Array.isArray(emailRow.drafts) ? emailRow.drafts[0] : emailRow.drafts
  if (!draft) {
    return NextResponse.json({ ok: false, error: 'no_draft' }, { status: 400 })
  }

  // Garde anti-double-envoi : c'est la vérification qui compte vraiment,
  // jamais seulement l'état désactivé du bouton côté interface (cf. analyse
  // de risques F1 — un double-clic ou un bug front ne doit jamais pouvoir
  // déclencher un second envoi réel).
  if (draft.sent_at) {
    return NextResponse.json({ ok: false, error: 'already_sent' }, { status: 409 })
  }

  try {
    const gmail = await getGmailClientForUser(user.id)

    const raw = buildRawEmail({
      to: emailRow.sender_email,
      from: user.email,
      subject: emailRow.subject ? `Re: ${emailRow.subject}` : 'Re:',
      body: finalContent,
      inReplyToMessageId: emailRow.gmail_message_id,
    })

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        threadId: emailRow.gmail_thread_id || undefined,
      },
    })

    const sentAt = new Date().toISOString()

    await supabaseAdmin
      .from('drafts')
      .update({ final_content: finalContent, sent_at: sentAt })
      .eq('id', draft.id)

    await supabaseAdmin.from('emails').update({ status: 'replied' }).eq('id', emailRow.id)

    return NextResponse.json({ ok: true, sentAt })
  } catch (err) {
    console.error('[send] échec de l\'envoi Gmail', err)
    const message = err instanceof Error ? err.message : 'Échec de l\'envoi.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
