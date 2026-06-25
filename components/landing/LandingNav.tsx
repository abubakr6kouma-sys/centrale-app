'use client'

import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function LandingNav() {
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
    <nav className="relative z-20 max-w-[1180px] mx-auto px-10 py-[30px] flex items-center justify-between max-md:px-5 max-md:py-5">
      <div className="flex items-center gap-[11px] min-w-0">
        <span className="text-[#f5f3ee] flex items-center flex-none">
          <Logo size={30} />
        </span>
        <span className="font-display font-semibold text-[17px] tracking-[-0.01em] text-[#f5f3ee] truncate">
          CentralY
        </span>
      </div>

      <div className="flex items-center gap-6 max-md:gap-3">
        <Link
          href="/tarifs"
          className="text-sm font-medium text-[#c6c4bd] no-underline max-sm:hidden"
        >
          Tarifs
        </Link>
        <button
          onClick={handleCTA}
          className="text-sm font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-[18px] py-[9px] rounded-full cursor-pointer border-none whitespace-nowrap"
        >
          Essayer gratuitement
        </button>
      </div>
    </nav>
  )
}
