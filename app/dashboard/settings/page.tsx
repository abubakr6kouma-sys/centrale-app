'use client'

import { useSession, signOut } from 'next-auth/react'
import SidebarFrame from '@/components/dashboard/SidebarFrame'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="font-sans bg-cream text-ink min-h-screen flex max-lg:flex-col">
      <SidebarFrame
        userName={session?.user?.name || 'Mon compte'}
        userEmail={session?.user?.email || ''}
        activeLink="settings"
      />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-12 pt-12 pb-20 max-lg:px-8 max-lg:pt-8 max-md:px-5 max-md:pt-6">
          <h1 className="font-display text-[26px] font-semibold text-ink mb-2">Paramètres</h1>
          <p className="text-[14.5px] text-muted leading-relaxed mb-8">
            Gérez votre compte et votre connexion Gmail.
          </p>

          <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-linelight">
              <div className="text-[11px] font-semibold text-faint tracking-[0.06em]">COMPTE</div>
            </div>
            <div className="px-6 py-5 flex items-center gap-4 flex-wrap">
              <div className="w-11 h-11 flex-none rounded-full bg-[#2a2a26] flex items-center justify-center text-white font-bold text-sm">
                {(session?.user?.name || session?.user?.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold truncate">
                  {session?.user?.name || 'Compte connecté'}
                </div>
                <div className="text-[13px] text-faint truncate">{session?.user?.email}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-linelight">
              <div className="text-[11px] font-semibold text-faint tracking-[0.06em]">CONNEXION GMAIL</div>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-[7px] h-[7px] rounded-full bg-[#7d8471] flex-none" />
                <span className="text-[13.5px] font-semibold">Connectée</span>
              </div>
              <p className="text-[13.5px] text-muted leading-relaxed m-0 mb-4">
                CentralY peut lire vos emails entrants et envoyer une réponse uniquement après
                votre validation. Aucun email n&apos;est jamais envoyé automatiquement.
              </p>
              <p className="text-[12.5px] text-faint leading-relaxed m-0">
                Pour révoquer l&apos;accès, rendez-vous dans les paramètres de sécurité de votre
                compte Google (myaccount.google.com/permissions) et retirez l&apos;accès à
                CentralY. La synchronisation s&apos;arrête immédiatement.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-linelight">
              <div className="text-[11px] font-semibold text-faint tracking-[0.06em]">SESSION</div>
            </div>
            <div className="px-6 py-5">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="border border-[#ddd6c9] bg-white cursor-pointer text-[13.5px] font-semibold text-muted px-[18px] py-[11px] rounded-[10px] hover:bg-[#f6f3ec]"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
