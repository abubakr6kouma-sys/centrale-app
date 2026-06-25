// Client-safe plan constants — no server dependencies (no Supabase, no Node.js).
// Import from here in 'use client' components; import from lib/quota for server logic.

export type Plan = 'free' | 'pro' | 'business'

export interface PlanLimits {
  emailsPerMonth: number | null
  draftsPerMonth: number | null
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { emailsPerMonth: 50, draftsPerMonth: 10 },
  pro: { emailsPerMonth: 1000, draftsPerMonth: null },
  business: { emailsPerMonth: 5000, draftsPerMonth: null },
}

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  business: 'Business',
}
