'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import SidebarFrame from '@/components/dashboard/SidebarFrame'
import PricingCards from '@/components/PricingCards'
import { PLAN_LABELS, Plan } from '@/lib/planTypes'

interface UsageData {
  plan: Plan
  emailsAnalyzedThisMonth: number
  emailsLimit: number | null
  draftsGeneratedThisMonth: number
  draftsLimit: number | null
}

// Page Abonnement : affiche le vrai plan et la vraie consommation de
// l'utilisateur (issus de /api/usage), puis la grille de plans pour changer.
// Le paiement réel (PayPal) n'est pas encore branché — voir PricingCards.
export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUsage({
            plan: data.plan,
            emailsAnalyzedThisMonth: data.emailsAnalyzedThisMonth,
            emailsLimit: data.emailsLimit,
            draftsGeneratedThisMonth: data.draftsGeneratedThisMonth,
            draftsLimit: data.draftsLimit,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="font-sans bg-cream text-ink min-h-screen flex max-lg:flex-col">
      <SidebarFrame
        userName={session?.user?.name || 'Mon compte'}
        userEmail={session?.user?.email || ''}
        activeLink="subscription"
      />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[920px] mx-auto px-12 pt-12 pb-20 max-lg:px-8 max-lg:pt-8 max-md:px-5 max-md:pt-6">
          <h1 className="font-display text-[26px] font-semibold text-ink mb-2">Abonnement</h1>
          <p className="text-[14.5px] text-muted leading-relaxed mb-8">
            Gérez votre formule CentralY et suivez votre utilisation.
          </p>

          {!loading && usage && (
            <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden mb-10">
              <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-5 border-b border-linelight">
                <div>
                  <div className="text-[11px] font-semibold text-faint tracking-[0.06em] mb-1">FORMULE ACTUELLE</div>
                  <div className="font-display text-lg font-semibold">{PLAN_LABELS[usage.plan]}</div>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <UsageBar
                  label="Emails analysés ce mois"
                  used={usage.emailsAnalyzedThisMonth}
                  limit={usage.emailsLimit}
                />
                <UsageBar
                  label="Brouillons générés ce mois"
                  used={usage.draftsGeneratedThisMonth}
                  limit={usage.draftsLimit}
                />
              </div>
            </div>
          )}

          <h2 className="font-display text-[19px] font-semibold text-ink mb-5">Changer de formule</h2>
          <PricingCards variant="light" />

          <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden mt-10">
            <div className="px-6 py-5 border-b border-linelight">
              <div className="text-[11px] font-semibold text-faint tracking-[0.06em]">BESOIN D&apos;AIDE ?</div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[13.5px] text-muted leading-relaxed m-0">
                Pour toute question sur votre abonnement,{' '}
                <a href="/contact" className="text-ink font-semibold no-underline">
                  contactez-nous
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const percent = limit ? Math.min((used / limit) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12.5px] text-muted">{label}</span>
        <span className="text-[12.5px] font-semibold text-ink">
          {used}
          {limit !== null ? ` / ${limit}` : ' · illimité'}
        </span>
      </div>
      {limit !== null && (
        <div className="h-1.5 rounded-full bg-[#ebe7dd] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, background: percent >= 100 ? '#b5524f' : '#b08968' }}
          />
        </div>
      )}
    </div>
  )
}
