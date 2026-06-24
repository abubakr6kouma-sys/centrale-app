import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { resetUsageIfNeeded, PLAN_LIMITS, UsageRow } from '@/lib/quota'

// Expose les chiffres d'usage du mois pour le dashboard (emails analysés,
// quota restant, prospects détectés, temps économisé) et pour la modale de
// quota atteint. Lecture seule — l'incrémentation se fait uniquement dans
// /api/emails/sync et /api/emails/[id]/draft, au moment réel de la consommation.
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, plan, emails_analyzed_this_month, drafts_generated_this_month, usage_period_started_at')
    .eq('id', user.id)
    .single<UsageRow>()

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 500 })
  }

  const usage = await resetUsageIfNeeded(user.id, data)
  const limits = PLAN_LIMITS[usage.plan]

  // "Prospects détectés" et "temps économisé" : calculés à la volée à partir
  // des emails déjà en base, pas des compteurs persistés — ce sont des
  // statistiques de lecture, pas des quotas, donc pas besoin de les stocker
  // séparément ni de risquer qu'ils se désynchronisent des emails réels.
  const { count: prospectsCount } = await supabaseAdmin
    .from('emails')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('category', 'Prospect')

  const { count: draftReadyOrRepliedCount } = await supabaseAdmin
    .from('emails')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['draft_ready', 'replied'])

  // Estimation volontairement simple et transparente : 3 minutes économisées
  // par brouillon déjà préparé par l'IA (lecture + rédaction qu'on n'a pas eu
  // à faire de zéro), affichée en heures/minutes arrondies.
  const MINUTES_SAVED_PER_DRAFT = 3
  const minutesSaved = (draftReadyOrRepliedCount || 0) * MINUTES_SAVED_PER_DRAFT

  return NextResponse.json({
    ok: true,
    plan: usage.plan,
    emailsAnalyzedThisMonth: usage.emails_analyzed_this_month,
    emailsLimit: limits.emailsPerMonth,
    draftsGeneratedThisMonth: usage.drafts_generated_this_month,
    draftsLimit: limits.draftsPerMonth,
    prospectsDetected: prospectsCount || 0,
    minutesSaved,
  })
}
