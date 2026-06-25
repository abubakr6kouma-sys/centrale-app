'use client'

import { PLAN_LABELS, Plan } from '@/lib/planTypes'

interface UsageStatsProps {
  plan: Plan
  emailsAnalyzedThisMonth: number
  emailsLimit: number | null
  prospectsDetected: number
  minutesSaved: number
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m}`
}

// Bandeau de statistiques simples affiché en haut du dashboard, juste sous le
// header de la liste d'emails — données réelles issues de /api/usage, pas de
// chiffres statiques.
export default function UsageStats({
  plan,
  emailsAnalyzedThisMonth,
  emailsLimit,
  prospectsDetected,
  minutesSaved,
}: UsageStatsProps) {
  const quotaLabel = emailsLimit === null ? `${emailsAnalyzedThisMonth}` : `${Math.max(emailsLimit - emailsAnalyzedThisMonth, 0)}`

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-[22px] py-4 border-b border-linelight bg-[#fcfbf7] max-md:px-[18px] max-md:py-3">
      <StatCard icon="📧" label="Emails analysés" value={`${emailsAnalyzedThisMonth}`} sub="ce mois-ci" />
      <StatCard
        icon="📊"
        label="Quota restant"
        value={quotaLabel}
        sub={emailsLimit === null ? `plan ${PLAN_LABELS[plan]} · illimité` : `sur ${emailsLimit} (${PLAN_LABELS[plan]})`}
      />
      <StatCard icon="🎯" label="Prospects détectés" value={`${prospectsDetected}`} sub="au total" />
      <StatCard icon="⏱" label="Temps économisé" value={formatMinutes(minutesSaved)} sub="estimation" />
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white border border-[#ebe7dd] px-4 py-3 min-w-0">
      <div className="flex items-center gap-[7px] mb-1">
        <span className="text-[15px] flex-none" aria-hidden="true">{icon}</span>
        <span className="text-[11px] font-semibold text-faint tracking-[0.04em] truncate">{label}</span>
      </div>
      <div className="font-display text-[19px] font-semibold text-ink leading-tight truncate">{value}</div>
      <div className="text-[11px] text-faint truncate">{sub}</div>
    </div>
  )
}
