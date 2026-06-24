import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { analyzeEmail } from '@/lib/aiAnalysis'
import { checkDraftQuota, incrementDraftUsage } from '@/lib/quota'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const quota = await checkDraftQuota(user.id)
  if (!quota.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'quota_exceeded',
        quotaType: 'drafts',
        plan: quota.plan,
        limit: quota.limit,
        used: quota.used,
      },
      { status: 403 }
    )
  }

  const { data: email, error } = await supabaseAdmin
    .from('emails')
    .select('*, drafts(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !email) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  const emailRow = email as Record<string, any>
  const existingDraft = Array.isArray(emailRow.drafts) ? emailRow.drafts[0] : emailRow.drafts
  if (existingDraft?.sent_at) {
    return NextResponse.json(
      { ok: false, error: 'already_sent' },
      { status: 409 }
    )
  }

  try {
    const analysis = await analyzeEmail({
      subject: emailRow.subject,
      senderName: emailRow.sender_name,
      senderEmail: emailRow.sender_email,
      bodyText: emailRow.body_full || emailRow.body_preview || '',
    })

    await supabaseAdmin
      .from('emails')
      .update({
        category: analysis.category,
        priority: analysis.priority,
        summary: analysis.summary,
        status: analysis.draft ? 'draft_ready' : 'new',
      })
      .eq('id', emailRow.id)

    if (existingDraft) {
      await supabaseAdmin
        .from('drafts')
        .update({ ai_generated_content: analysis.draft })
        .eq('id', existingDraft.id)
    } else {
      await supabaseAdmin.from('drafts').insert({
        email_id: emailRow.id,
        ai_generated_content: analysis.draft,
      })
    }

    await incrementDraftUsage(user.id)

    return NextResponse.json({ ok: true, draft: analysis.draft, summary: analysis.summary })
  } catch (err) {
    console.error('[draft] échec de régénération', err)
    return NextResponse.json({ ok: false, error: 'ai_failed' }, { status: 500 })
  }
}
