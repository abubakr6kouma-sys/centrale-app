'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LandingHero() {
  const { status } = useSession()
  const router = useRouter()

  function handleCTA() {
    if (status === 'authenticated') {
      router.push('/dashboard')
    } else {
      signIn('google', { callbackUrl: '/dashboard' })
    }
  }

  return (
    <section className="relative z-10 max-w-[1080px] mx-auto px-10 pt-[90px] text-center max-md:px-5 max-md:pt-[60px]">
      <div
        data-reveal
        className="inline-flex items-center gap-[9px] px-4 py-[7px] rounded-full text-[13px] text-[#a3a09a] mb-10"
        style={{ border: '1px solid rgba(245,243,238,0.12)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9b896] animate-breathe shadow-[0_0_10px_rgba(201,184,150,0.8)]" />
        Assistant email IA · validation humaine
      </div>

      <h1
        data-reveal
        className="font-display font-semibold text-[74px] leading-[1.05] tracking-[-0.035em] mx-auto max-w-[880px] text-[#f5f3ee] max-md:text-[40px] max-md:leading-[1.15]"
      >
        L&apos;IA traite vos emails.
        <br />
        Vous gardez toujours{' '}
        <span className="font-serif italic font-normal text-[#c9b896]">le contrôle.</span>
      </h1>

      <p
        data-reveal
        className="text-[19px] leading-[1.6] text-[#9b9890] max-w-[620px] mx-auto mt-7 max-md:text-[16px]"
      >
        Tri intelligent de votre boîte, brouillons rédigés par l&apos;IA, détection automatique
        des prospects et suivi de chaque conversation — pour ne plus jamais repartir d&apos;une
        page blanche.
      </p>

      <div data-reveal className="flex items-center justify-center gap-[13px] mt-[38px] flex-wrap">
        <button
          onClick={handleCTA}
          className="text-[15.5px] font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-[26px] py-[14px] rounded-full cursor-pointer border-none"
        >
          Essayer gratuitement
        </button>
        <a
          href="#dashboard"
          className="text-[15.5px] font-medium text-[#e7e5de] px-6 py-[14px] rounded-full no-underline"
          style={{ border: '1px solid rgba(245,243,238,0.16)' }}
        >
          Voir le dashboard
        </a>
      </div>
      <p data-reveal className="text-[13px] text-[#6a6862] mt-4">
        Sans carte bancaire · Compatible Gmail
      </p>

      <div data-reveal className="relative mx-auto mt-[72px] max-w-[820px] max-md:mt-12">
        <div
          className="relative rounded-[18px] bg-[#121211] overflow-hidden text-left animate-float"
          style={{
            border: '1px solid rgba(245,243,238,0.1)',
            boxShadow: '0 50px 130px rgba(0,0,0,0.7)',
          }}
        >
          <div
            className="flex items-center gap-[7px] px-[18px] py-[14px]"
            style={{ borderBottom: '1px solid rgba(245,243,238,0.07)' }}
          >
            <div className="w-[11px] h-[11px] rounded-full bg-[#3a3a37]" />
            <div className="w-[11px] h-[11px] rounded-full bg-[#3a3a37]" />
            <div className="w-[11px] h-[11px] rounded-full bg-[#3a3a37]" />
            <div className="ml-[14px] text-[12.5px] text-[#6a6862] truncate">
              CentralY — Boîte intelligente
            </div>
          </div>
          <div className="p-6 max-md:p-4">
            <div className="flex items-center gap-[13px] mb-[18px] flex-wrap">
              <div className="w-[42px] h-[42px] rounded-full bg-[#26241f] flex items-center justify-center text-[#c9b896] font-bold text-sm flex-none">
                MD
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] text-[#f5f3ee]">Marie Dubois</div>
                <div className="text-[12.5px] text-[#6a6862] truncate">marie@acme.fr · il y a 2 min</div>
              </div>
              <span
                className="ml-auto text-[11.5px] font-semibold text-[#c9b896] px-[11px] py-1 rounded-full flex-none"
                style={{ border: '1px solid rgba(201,184,150,0.35)' }}
              >
                Prospect
              </span>
            </div>
            <div className="font-semibold text-base mb-[18px] text-[#f5f3ee]">
              Demande de devis — commande récurrente Q3
            </div>
            <div className="pt-[18px]" style={{ borderTop: '1px solid rgba(245,243,238,0.07)' }}>
              <div className="text-[11px] tracking-[0.12em] text-[#c9b896] font-semibold mb-2">
                RÉSUMÉ IA
              </div>
              <div className="text-sm text-[#cbc8c0] leading-[1.6] mb-5">
                Devis demandé pour une commande trimestrielle récurrente. Budget validé. Réponse
                attendue avant vendredi.
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className="flex-1 min-w-[140px] px-[14px] py-3 rounded-[11px] bg-[#1b1a18] text-[13px] text-[#8c897f] truncate"
                  style={{ border: '1px solid rgba(245,243,238,0.08)' }}
                >
                  Brouillon de réponse préparé…
                </div>
                <div className="px-5 py-3 rounded-[11px] bg-[#f5f3ee] text-[#0a0a0a] font-semibold text-[13.5px] whitespace-nowrap">
                  Valider &amp; envoyer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
