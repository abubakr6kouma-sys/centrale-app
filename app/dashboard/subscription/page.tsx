'use client'

import { useSession } from 'next-auth/react'
import SidebarFrame from '@/components/dashboard/SidebarFrame'

// Page placeholder fonctionnelle. Pas de connexion Stripe en Phase 1 (cf.
// architecture validée : la facturation est volontairement reportée). Cette
// page existe pour que le lien de navigation ne mène jamais à une 404, et
// pour donner un point d'accroche clair le jour où la facturation est ajoutée.
export default function SubscriptionPage() {
  const { data: session } = useSession()

  return (
    <div className="font-sans bg-cream text-ink min-h-screen flex max-lg:flex-col">
      <SidebarFrame
        userName={session?.user?.name || 'Mon compte'}
        userEmail={session?.user?.email || ''}
        activeLink="subscription"
      />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-12 pt-12 pb-20 max-lg:px-8 max-lg:pt-8 max-md:px-5 max-md:pt-6">
          <h1 className="font-display text-[26px] font-semibold text-ink mb-2">Abonnement</h1>
          <p className="text-[14.5px] text-muted leading-relaxed mb-8">
            Gérez votre formule CentralY et suivez votre utilisation.
          </p>

          <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-5 border-b border-linelight">
              <div>
                <div className="text-[11px] font-semibold text-faint tracking-[0.06em] mb-1">FORMULE ACTUELLE</div>
                <div className="font-display text-lg font-semibold">Pro</div>
              </div>
              <span className="text-[11px] font-semibold text-gold-text bg-gold-bg px-[10px] py-1 rounded-md flex-none">
                Bêta — gratuit
              </span>
            </div>
            <div className="px-6 py-5">
              <p className="text-[13.5px] text-muted leading-relaxed m-0">
                CentralY est actuellement en phase bêta : toutes les fonctionnalités sont
                accessibles gratuitement, sans engagement. La facturation sera activée
                ultérieurement, avec un préavis envoyé par email avant tout changement.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-linelight">
              <div className="text-[11px] font-semibold text-faint tracking-[0.06em]">BESOIN D&apos;AIDE ?</div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[13.5px] text-muted leading-relaxed m-0">
                Pour toute question sur votre abonnement, écrivez-nous à{' '}
                <a href="mailto:bonjour@centraly.ai" className="text-ink font-semibold no-underline">
                  bonjour@centraly.ai
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
