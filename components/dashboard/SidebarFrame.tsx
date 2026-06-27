'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface SidebarFrameProps {
  userName: string
  userEmail: string
  activeLink?: 'subscription' | 'settings'
  /** Contenu central de la sidebar (filtres sur le dashboard, rien sur les pages simples). */
  children?: React.ReactNode
}

// Coquille commune de la sidebar : logo, bloc "Nouveau message" (dashboard
// uniquement, masqué ici par défaut sur les pages simples), liens
// Abonnement/Paramètres, et bloc utilisateur avec déconnexion. Réutilisée par
// le Dashboard (via Sidebar.tsx, qui ajoute les filtres dans `children`) et
// par les pages Abonnement/Paramètres pour garder une navigation identique
// sur tout le tableau de bord.
export default function SidebarFrame({ userName, userEmail, activeLink, children }: SidebarFrameProps) {
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <aside
      className="
        w-[252px] flex-none bg-creamdark border-r border-line flex flex-col
        p-[14px] pb-[18px] h-screen overflow-y-auto sticky top-0
        max-lg:w-full max-lg:h-auto max-lg:flex-row max-lg:items-center max-lg:gap-[14px]
        max-lg:px-4 max-lg:py-[11px] max-lg:border-r-0 max-lg:border-b max-lg:overflow-visible max-lg:sticky max-lg:top-0 max-lg:z-20
      "
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-[10px] px-2 pt-3 pb-[18px] no-underline text-ink max-lg:p-0 max-lg:flex-none"
      >
        <span className="text-ink flex items-center flex-none">
          <Logo size={28} />
        </span>
        <span className="font-display font-semibold text-base text-ink max-lg:hidden">
          CentralY
        </span>
        <span className="ml-auto text-[11px] font-semibold text-gold-text bg-gold-bg px-[7px] py-[2px] rounded-md max-lg:hidden">
          PRO
        </span>
      </Link>

      {children}

      <div className="mt-5 flex flex-col gap-0.5 max-lg:hidden">
        <Link
          href="/dashboard/subscription"
          className={`flex items-center gap-[10px] px-[11px] py-2 rounded-lg text-[13.5px] no-underline hover:bg-[#ebe7dd] ${
            activeLink === 'subscription' ? 'bg-[#e7e3d9] text-[#2a2a26] font-semibold' : 'text-muted'
          }`}
        >
          <span className="w-4 text-center">◆</span> Abonnement
        </Link>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-[10px] px-[11px] py-2 rounded-lg text-[13.5px] no-underline hover:bg-[#ebe7dd] ${
            activeLink === 'settings' ? 'bg-[#e7e3d9] text-[#2a2a26] font-semibold' : 'text-muted'
          }`}
        >
          <span className="w-4 text-center">⚙</span> Paramètres
        </Link>
      </div>

      <div className="mt-auto pt-4 mb-3 flex flex-col gap-[1px] max-lg:hidden border-t border-line">
        <Link href="/contact" className="text-[12px] text-muted px-[11px] py-[6px] rounded-md no-underline hover:bg-[#ebe7dd] transition-colors">
          Contact & support
        </Link>
        <Link href="/privacy" className="text-[12px] text-muted px-[11px] py-[6px] rounded-md no-underline hover:bg-[#ebe7dd] transition-colors">
          Confidentialité
        </Link>
        <Link href="/data-deletion" className="text-[12px] text-muted px-[11px] py-[6px] rounded-md no-underline hover:bg-[#ebe7dd] transition-colors">
          Supprimer mon compte
        </Link>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-[10px] p-[10px] rounded-[10px] bg-white border border-line text-left cursor-pointer max-lg:hidden"
      >
        <div className="w-8 h-8 rounded-full bg-[#2a2a26] flex items-center justify-center text-white font-bold text-[13px] flex-none">
          {initials || '?'}
        </div>
        <div className="leading-[1.35] min-w-0">
          <div className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {userName}
          </div>
          <div className="text-[11.5px] text-faint whitespace-nowrap overflow-hidden text-ellipsis">
            {userEmail}
          </div>
        </div>
        <span className="ml-auto text-faint text-[15px] flex-none">⎋</span>
      </button>

      {/* Navigation compacte tablette/mobile : sous 1024px, le bloc complet
          ci-dessus (Abonnement/Paramètres/déconnexion) est masqué pour gagner
          de la place dans la barre horizontale — sans cet équivalent compact,
          ces actions deviendraient totalement inaccessibles sous 1024px. */}
      <div className="hidden max-lg:flex items-center gap-[6px] ml-auto flex-none">
        <Link
          href="/dashboard/subscription"
          aria-label="Abonnement"
          className={`w-9 h-9 rounded-full border flex items-center justify-center flex-none no-underline ${
            activeLink === 'subscription' ? 'bg-ink text-cream border-ink' : 'border-line text-muted bg-cream'
          }`}
        >
          ◆
        </Link>
        <Link
          href="/dashboard/settings"
          aria-label="Paramètres"
          className={`w-9 h-9 rounded-full border flex items-center justify-center flex-none no-underline ${
            activeLink === 'settings' ? 'bg-ink text-cream border-ink' : 'border-line text-muted bg-cream'
          }`}
        >
          ⚙
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Se déconnecter"
          className="w-9 h-9 rounded-full border border-line text-muted bg-cream flex items-center justify-center flex-none cursor-pointer"
        >
          ⎋
        </button>
      </div>
    </aside>
  )
}
