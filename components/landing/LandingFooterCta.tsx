'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import Logo from '@/components/Logo'

export function LandingFinalCta() {
  return (
    <section className="relative z-10 max-w-[900px] mx-auto px-10 mt-[180px] text-center max-md:px-5 max-md:mt-[100px]">
      <div data-reveal>
        <h2 className="font-display font-semibold text-[56px] leading-[1.06] tracking-[-0.035em] mx-auto max-w-[640px] text-[#f5f3ee] max-md:text-[32px]">
          Laissez l&apos;IA préparer.
          <br />
          Gardez le <span className="font-serif italic font-normal text-[#c9b896]">dernier mot.</span>
        </h2>
        <div className="flex items-center justify-center gap-[13px] mt-[42px] flex-wrap">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="text-base font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-7 py-[15px] rounded-full cursor-pointer border-none"
          >
            Essayer gratuitement
          </button>
          <Link
            href="/tarifs"
            className="text-base font-medium text-[#e7e5de] px-[26px] py-[15px] rounded-full no-underline"
            style={{ border: '1px solid rgba(245,243,238,0.16)' }}
          >
            Voir les tarifs
          </Link>
        </div>
        <p className="text-[13px] text-[#6a6862] mt-[22px]">Sans carte bancaire · Compatible Gmail</p>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer
      className="relative z-10 max-w-[1180px] mx-auto px-10 mt-[140px] py-[34px] flex items-center justify-between flex-wrap gap-4 max-md:px-5 max-md:mt-[80px]"
      style={{ borderTop: '1px solid rgba(245,243,238,0.08)' }}
    >
      <div className="flex items-center gap-[10px]">
        <span className="text-[#f5f3ee] flex items-center">
          <Logo size={26} />
        </span>
        <span className="font-display font-semibold text-[15px] text-[#f5f3ee]">CentralY</span>
      </div>

      <div className="flex items-center gap-6 flex-wrap max-md:gap-4">
        <Link href="/tarifs" className="text-[13px] text-[#9b9890] no-underline">
          Tarifs
        </Link>
        <Link href="/contact" className="text-[13px] text-[#9b9890] no-underline">
          Contact
        </Link>
      </div>

      <div className="text-[13px] text-[#6a6862]">© 2026 CentralY AI</div>
    </footer>
  )
}
