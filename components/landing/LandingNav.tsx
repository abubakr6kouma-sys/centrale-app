import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LandingNav() {
  return (
    <nav className="relative z-20 max-w-[1180px] mx-auto px-10 py-[30px] flex items-center justify-between">
      <div className="flex items-center gap-[11px]">
        <span className="text-[#f5f3ee] flex items-center">
          <Logo size={30} />
        </span>
        <span className="font-display font-semibold text-[17px] tracking-[-0.01em] text-[#f5f3ee]">
          CentralY
        </span>
      </div>
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-[18px] py-[9px] rounded-full no-underline"
      >
        Essayer gratuitement
      </Link>
    </nav>
  )
}
