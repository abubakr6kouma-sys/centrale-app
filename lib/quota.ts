import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Plan, PlanLimits } from '@/lib/planTypes'
import { PLAN_LIMITS, PLAN_LABELS } from '@/lib/planTypes'
export type { Plan, PlanLimits }
export { PLAN_LIMITS, PLAN_LABELS }

export interface UsageRow {
  id: string
  plan: Plan
  emails_analyzed_this_month: number
  drafts_generated_this_month: number
  usage_period_started_at: string
}

// Une période d'usage dure 30 jours glissants depuis son démarrage, pas un
// mois calendaire strict — plus simple à calculer sans cron, suffisant pour
// l'objectif (éviter qu'un compteur ne se remette jamais à zéro).
const PERIOD_MS = 30 * 24 * 60 * 60 * 1000

// Remet les compteurs à zéro si la période de 30 jours est dépassée. Appelée
// avant toute vérification de quota plutôt que par un job planifié externe :
// volontairement simple, cohérent avec le choix déjà fait pour la
// synchronisation Gmail (bouton manuel plutôt que cron Vercel).
export async function resetUsageIfNeeded(userId: string, row: UsageRow): Promise<UsageRow> {
  const periodStart = new Date(row.usage_period_started_at).getTime()
  if (Date.now() - periodStart < PERIOD_MS) {
    return row
  }

  const resetPayload = {
    emails_analyzed_this_month: 0,
    drafts_generated_this_month: 0,
    usage_period_started_at: new Date().toISOString(),
  }

  await supabaseAdmin.from('users').update(resetPayload).eq('id', userId)

  return { ...row, ...resetPayload }
}

export interface QuotaCheckResult {
  allowed: boolean
  plan: Plan
  limit: number | null
  used: number
}

// Vérifie le quota d'emails analysés (utilisé par /api/emails/sync : chaque
// email qui passe par l'analyse IA compte). N'incrémente pas — l'appelant
// incrémente lui-même seulement après un traitement réellement effectué.
export async function checkEmailQuota(userId: string): Promise<QuotaCheckResult> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, plan, emails_analyzed_this_month, drafts_generated_this_month, usage_period_started_at')
    .eq('id', userId)
    .single<UsageRow>()

  if (error || !data) {
    // En cas d'échec de lecture du quota, on n'invente jamais un quota
    // dépassé : on autorise plutôt que de bloquer sur une panne infra (même
    // principe que la correction du callback signIn — une panne Supabase ne
    // doit jamais se traduire par un refus opaque côté utilisateur).
    console.error('[quota] échec de lecture du quota, vérification ignorée', error)
    return { allowed: true, plan: 'free', limit: null, used: 0 }
  }

  const usage = await resetUsageIfNeeded(userId, data)
  const limit = PLAN_LIMITS[usage.plan].emailsPerMonth

  if (limit === null) {
    return { allowed: true, plan: usage.plan, limit: null, used: usage.emails_analyzed_this_month }
  }

  return {
    allowed: usage.emails_analyzed_this_month < limit,
    plan: usage.plan,
    limit,
    used: usage.emails_analyzed_this_month,
  }
}

// Vérifie le quota de brouillons (utilisé par /api/emails/[id]/draft, qui
// sert à la fois à la génération automatique à l'ouverture et à "Régénérer").
export async function checkDraftQuota(userId: string): Promise<QuotaCheckResult> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, plan, emails_analyzed_this_month, drafts_generated_this_month, usage_period_started_at')
    .eq('id', userId)
    .single<UsageRow>()

  if (error || !data) {
    console.error('[quota] échec de lecture du quota, vérification ignorée', error)
    return { allowed: true, plan: 'free', limit: null, used: 0 }
  }

  const usage = await resetUsageIfNeeded(userId, data)
  const limit = PLAN_LIMITS[usage.plan].draftsPerMonth

  if (limit === null) {
    return { allowed: true, plan: usage.plan, limit: null, used: usage.drafts_generated_this_month }
  }

  return {
    allowed: usage.drafts_generated_this_month < limit,
    plan: usage.plan,
    limit,
    used: usage.drafts_generated_this_month,
  }
}

export async function incrementEmailUsage(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('increment_email_usage', { p_user_id: userId })

  if (error) {
    // Fallback si la fonction SQL n'existe pas encore (migration 003 non
    // appliquée) : lecture + écriture classique, moins atomique en cas de
    // requêtes concurrentes mais fonctionnelle, pour ne jamais bloquer le
    // produit sur ce détail d'infrastructure.
    const { data } = await supabaseAdmin
      .from('users')
      .select('emails_analyzed_this_month')
      .eq('id', userId)
      .single()
    await supabaseAdmin
      .from('users')
      .update({ emails_analyzed_this_month: (data?.emails_analyzed_this_month || 0) + 1 })
      .eq('id', userId)
  }
}

export async function incrementDraftUsage(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('increment_draft_usage', { p_user_id: userId })

  if (error) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('drafts_generated_this_month')
      .eq('id', userId)
      .single()
    await supabaseAdmin
      .from('users')
      .update({ drafts_generated_this_month: (data?.drafts_generated_this_month || 0) + 1 })
      .eq('id', userId)
  }
}
