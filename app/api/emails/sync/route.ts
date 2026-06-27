import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { getGmailClientForUser } from '@/lib/gmailClient'
import { parseGmailMessage } from '@/lib/gmailParser'
import { analyzeEmail } from '@/lib/aiAnalysis'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { withRetry } from '@/lib/withRetry'
import { checkEmailQuota, incrementEmailUsage } from '@/lib/quota'

// Limite volontaire du premier import / de chaque synchro manuelle, pour
// éviter une facture IA surprise et rester sous le timeout des fonctions
// serverless Vercel (cf. analyse de risques : 60s max sur le plan Hobby).
const MAX_MESSAGES_PER_SYNC = 15

// Structure d'erreur détaillée renvoyée au lieu d'un simple 500 générique.
// `step` identifie précisément quelle opération a échoué, pour pouvoir
// diagnostiquer sans avoir à éplucher les logs serveur en premier réflexe.
interface SyncErrorPayload {
  ok: false
  step: string
  gmailMessageId?: string
  error: string
  errorCode?: string
}

function buildErrorPayload(step: string, err: unknown, gmailMessageId?: string): SyncErrorPayload {
  const error = err instanceof Error ? err.message : String(err)
  const errorCode = (err as { code?: string })?.code
  return {
    ok: false,
    step,
    ...(gmailMessageId ? { gmailMessageId } : {}),
    error,
    ...(errorCode ? { errorCode } : {}),
  }
}

export async function POST() {
  console.log('[STEP] sync — démarrage')

  const user = await getCurrentUser()
  if (!user) {
    console.error('[ERROR] sync — utilisateur non authentifié')
    return NextResponse.json({ ok: false, step: 'auth', error: 'unauthenticated' }, { status: 401 })
  }
  console.log(`[STEP] sync — utilisateur résolu (id=${user.id}, email=${user.email})`)

  const quota = await checkEmailQuota(user.id)
  if (!quota.allowed) {
    console.log(
      `[STEP] sync — quota d'emails atteint (plan=${quota.plan}, used=${quota.used}/${quota.limit}), synchro annulée`
    )
    return NextResponse.json(
      {
        ok: false,
        step: 'quota_exceeded',
        quotaType: 'emails',
        plan: quota.plan,
        limit: quota.limit,
        used: quota.used,
        error: 'quota_exceeded',
      },
      { status: 403 }
    )
  }

  let gmail: Awaited<ReturnType<typeof getGmailClientForUser>>

  try {
    console.log('[STEP] getGmailClientForUser — démarrage')
    gmail = await getGmailClientForUser(user.id)
    console.log('[STEP] getGmailClientForUser — succès, client Gmail prêt')
  } catch (err) {
    console.error('[ERROR] getGmailClientForUser — échec', err)
    return NextResponse.json(buildErrorPayload('get_gmail_client', err), { status: 500 })
  }

  let messageRefs: { id?: string | null }[] = []

  try {
    console.log('[STEP] gmail.users.messages.list — démarrage', {
      maxResults: MAX_MESSAGES_PER_SYNC,
    })

    const listResponse = await withRetry(
      () =>
        gmail.users.messages.list({
          userId: 'me',
          maxResults: MAX_MESSAGES_PER_SYNC,
          q: 'in:inbox',
        }),
      { label: 'gmail.users.messages.list' }
    )

    messageRefs = listResponse.data.messages || []
    console.log(`[STEP] gmail.users.messages.list — succès, ${messageRefs.length} référence(s) reçue(s)`)
  } catch (err) {
    console.error('[ERROR] gmail.users.messages.list — échec définitif', err)
    return NextResponse.json(buildErrorPayload('gmail_messages_list', err), { status: 500 })
  }

  if (messageRefs.length === 0) {
    console.log('[STEP] sync — aucun message dans la boîte, fin anticipée')
    return NextResponse.json({ ok: true, synced: 0, analyzed: 0 })
  }

  let newRefs: { id?: string | null }[] = []

  try {
    console.log('[STEP] supabase — recherche des emails déjà connus')
    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('emails')
      .select('gmail_message_id')
      .eq('user_id', user.id)
      .in('gmail_message_id', messageRefs.map((m) => m.id || ''))

    if (existingError) {
      throw existingError
    }

    const existingIds = new Set((existingRows || []).map((r) => r.gmail_message_id))
    newRefs = messageRefs.filter((m) => m.id && !existingIds.has(m.id))
    console.log(
      `[STEP] supabase — ${existingIds.size} email(s) déjà connus, ${newRefs.length} nouveau(x) à traiter`
    )
  } catch (err) {
    console.error('[ERROR] supabase — échec de la vérification des doublons', err)
    return NextResponse.json(buildErrorPayload('supabase_check_existing', err), { status: 500 })
  }

  let analyzedCount = 0
  const failedMessageIds: string[] = []
  let quotaExceededDuringLoop = false

  for (const ref of newRefs) {
    if (!ref.id) continue
    const gmailMessageId = ref.id

    // Re-vérifié à chaque itération (pas seulement avant la boucle) : un lot
    // de 15 emails peut faire passer l'utilisateur au-delà de sa limite en
    // cours de route. On arrête proprement dès que c'est le cas, plutôt que
    // de continuer à consommer des appels IA au-delà du quota.
    const loopQuota = await checkEmailQuota(user.id)
    if (!loopQuota.allowed) {
      console.log(
        `[STEP] sync — quota atteint en cours de boucle (plan=${loopQuota.plan}, used=${loopQuota.used}/${loopQuota.limit}), arrêt anticipé`
      )
      quotaExceededDuringLoop = true
      break
    }

    console.log(`[STEP] traitement de l'email ${gmailMessageId} — démarrage`)

    // 1. Récupération du contenu complet depuis Gmail.
    let fullMessage
    try {
      console.log(`[STEP] gmail.users.messages.get(${gmailMessageId}) — démarrage`)
      fullMessage = await withRetry(
        () =>
          gmail.users.messages.get({
            userId: 'me',
            id: gmailMessageId,
            format: 'full',
          }),
        { label: `gmail.users.messages.get(${gmailMessageId})` }
      )
      console.log(`[STEP] gmail.users.messages.get(${gmailMessageId}) — succès`)
    } catch (err) {
      console.error(`[ERROR] gmail.users.messages.get(${gmailMessageId}) — échec définitif après retries`, err)
      failedMessageIds.push(gmailMessageId)
      // On continue avec les autres emails plutôt que de faire échouer toute
      // la synchro pour un seul message Gmail défaillant.
      continue
    }

    // 2. Parsing du message MIME.
    let parsed
    try {
      console.log(`[STEP] parseGmailMessage(${gmailMessageId}) — démarrage`)
      parsed = parseGmailMessage(fullMessage.data)
      console.log(
        `[STEP] parseGmailMessage(${gmailMessageId}) — succès (expéditeur=${parsed.senderEmail}, sujet="${parsed.subject}")`
      )
    } catch (err) {
      console.error(`[ERROR] parseGmailMessage(${gmailMessageId}) — échec`, err)
      failedMessageIds.push(gmailMessageId)
      continue
    }

    // 3. Insertion en base avant analyse, pour ne jamais perdre un email déjà
    // récupéré même si l'IA échoue ensuite.
    let insertedEmailId: string
    try {
      console.log(`[STEP] supabase.insert(emails, ${gmailMessageId}) — démarrage`)
      const { data: insertedEmail, error: insertError } = await supabaseAdmin
        .from('emails')
        .insert({
          user_id: user.id,
          gmail_message_id: parsed.gmailMessageId,
          gmail_thread_id: parsed.gmailThreadId,
          sender_email: parsed.senderEmail,
          sender_name: parsed.senderName,
          subject: parsed.subject,
          body_preview: parsed.bodyText.slice(0, 200),
          body_full: parsed.bodyHtml ?? parsed.bodyText,
          received_at: parsed.receivedAt,
          status: 'analyzing',
        })
        .select('id')
        .single()

      if (insertError || !insertedEmail) {
        throw insertError || new Error('insertion sans erreur mais sans ligne retournée')
      }

      insertedEmailId = insertedEmail.id
      console.log(`[STEP] supabase.insert(emails, ${gmailMessageId}) — succès (id=${insertedEmailId})`)
    } catch (err) {
      console.error(`[ERROR] supabase.insert(emails, ${gmailMessageId}) — échec`, err)
      failedMessageIds.push(gmailMessageId)
      continue
    }

    // 4. Analyse IA (classification + résumé + brouillon). Un échec ici ne
    // doit pas faire disparaître l'email : il reste visible, juste sans
    // résumé ni brouillon, à régénérer plus tard depuis l'interface.
    try {
      console.log(`[STEP] analyzeEmail(${gmailMessageId}) — démarrage`)
      const analysis = await analyzeEmail({
        subject: parsed.subject,
        senderName: parsed.senderName,
        senderEmail: parsed.senderEmail,
        bodyText: parsed.bodyText,
      })
      console.log(
        `[STEP] analyzeEmail(${gmailMessageId}) — succès (catégorie=${analysis.category}, priorité=${analysis.priority})`
      )

      await supabaseAdmin
        .from('emails')
        .update({
          category: analysis.category,
          priority: analysis.priority,
          summary: analysis.summary,
          status: analysis.draft ? 'draft_ready' : 'new',
        })
        .eq('id', insertedEmailId)

      if (analysis.draft) {
        await supabaseAdmin.from('drafts').insert({
          email_id: insertedEmailId,
          ai_generated_content: analysis.draft,
        })
      }

      analyzedCount += 1
      await incrementEmailUsage(user.id)
      console.log(`[STEP] traitement de l'email ${gmailMessageId} — terminé avec succès`)
    } catch (err) {
      console.error(`[ERROR] analyzeEmail(${gmailMessageId}) — échec`, err)
      await supabaseAdmin.from('emails').update({ status: 'new' }).eq('id', insertedEmailId)
      failedMessageIds.push(gmailMessageId)
    }
  }

  try {
    console.log('[STEP] supabase.update(users.last_synced_at) — démarrage')
    await supabaseAdmin
      .from('users')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', user.id)
    console.log('[STEP] supabase.update(users.last_synced_at) — succès')
  } catch (err) {
    // Non bloquant : la synchro a déjà fait son travail, on log seulement.
    console.error('[ERROR] supabase.update(users.last_synced_at) — échec (non bloquant)', err)
  }

  console.log(
    `[STEP] sync — terminé. synced=${newRefs.length}, analyzed=${analyzedCount}, failed=${failedMessageIds.length}, quotaExceeded=${quotaExceededDuringLoop}`
  )

  return NextResponse.json({
    ok: true,
    synced: newRefs.length,
    analyzed: analyzedCount,
    failed: failedMessageIds,
    quotaExceeded: quotaExceededDuringLoop,
  })
}
