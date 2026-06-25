import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/authOptions'
import LandingNav from '@/components/landing/LandingNav'
import LandingHero from '@/components/landing/LandingHero'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingHowItWorks from '@/components/landing/LandingHowItWorks'
import LandingDashboardPreview from '@/components/landing/LandingDashboardPreview'
import LandingHumanControl from '@/components/landing/LandingHumanControl'
import LandingPricing from '@/components/landing/LandingPricing'
import { LandingFinalCta, LandingFooter } from '@/components/landing/LandingFooterCta'
import ScrollReveal from '@/components/landing/ScrollReveal'

// Page racine : si l'utilisateur est déjà connecté on le redirige côté
// serveur avant que React ne monte, ce qui évite le flash de la landing et
// tout problème de timing avec useSession().
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="font-sans bg-[#0a0a0a] text-[#f5f3ee] overflow-hidden relative">
      <ScrollReveal />

      <div
        className="absolute -top-[340px] left-1/2 -translate-x-1/2 w-[1100px] h-[760px] blur-[20px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(closest-side, rgba(201,184,150,0.10), rgba(201,184,150,0) 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingDashboardPreview />
      <LandingHumanControl />
      <LandingPricing />
      <LandingFinalCta />
      <LandingFooter />
    </div>
  )
}
