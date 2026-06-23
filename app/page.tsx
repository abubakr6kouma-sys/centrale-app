'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function EntryPage() {
  const { status } = useSession()
  const router = useRouter()
  const [hovering, setHovering] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  function handleEnter() {
    setEntering(true)
    setTimeout(() => {
      signIn('google', { callbackUrl: '/dashboard' })
    }, 480)
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans"
      style={{
        background:
          'radial-gradient(130% 100% at 50% 38%, #121110 0%, #0a0a0b 45%, #08080a 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 42%, transparent 50%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <div
        className="absolute top-[42%] left-1/2 w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[14px] pointer-events-none animate-breathe transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(closest-side, rgba(201,184,150,0.20), rgba(201,184,150,0) 70%)',
          opacity: hovering ? 1.4 : undefined,
        }}
      />

      <button
        onClick={handleEnter}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label="Entrer dans CentralY"
        className="relative z-10 flex flex-col items-center justify-center gap-[30px] p-12 bg-transparent border-none cursor-pointer"
      >
        <span
          className="flex text-[#f5f3ee] transition-[filter] duration-400"
          style={{
            filter: hovering
              ? 'drop-shadow(0 0 38px rgba(201,184,150,0.34))'
              : 'drop-shadow(0 0 30px rgba(201,184,150,0.14))',
            transform: entering ? 'scale(1.18)' : undefined,
            opacity: entering ? 0.2 : 1,
            transition:
              'filter 0.4s ease, transform 0.55s cubic-bezier(0.7,0,0.84,0), opacity 0.55s ease',
          }}
        >
          <Logo size={240} />
        </span>
        <span
          className="text-[13px] uppercase animate-rise transition-[color,letter-spacing] duration-400"
          style={{
            color: hovering ? '#c9b896' : '#83807a',
            letterSpacing: hovering ? '0.36em' : '0.26em',
          }}
        >
          Enter
        </span>
      </button>

      <div
        className="absolute inset-0 bg-[#08080a] pointer-events-none transition-opacity duration-[550ms] z-20"
        style={{ opacity: entering ? 1 : 0 }}
      />
    </div>
  )
}
