import LandingNav from '@/components/landing/LandingNav'
import LandingHero from '@/components/landing/LandingHero'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingHowItWorks from '@/components/landing/LandingHowItWorks'
import LandingDashboardPreview from '@/components/landing/LandingDashboardPreview'
import LandingHumanControl from '@/components/landing/LandingHumanControl'
import LandingPricing from '@/components/landing/LandingPricing'
import { LandingFinalCta, LandingFooter } from '@/components/landing/LandingFooterCta'
import ScrollReveal from '@/components/landing/ScrollReveal'
import AuthRedirect from '@/components/landing/AuthRedirect'

// Page racine de l'application : la Landing remplace désormais l'ancien
// écran "Entry" (logo animé, bouton Enter). Parcours utilisateur demandé :
// Landing (/) → Connexion Google → Dashboard (/dashboard). Le bouton
// "Essayer gratuitement" (dans LandingNav et LandingHero) déclenche
// directement signIn('google'), sans étape intermédiaire. Un utilisateur
// déjà connecté qui revient sur cette page est redirigé automatiquement
// vers /dashboard par AuthRedirect (comportement repris de l'ancien Entry).
export default function HomePage() {
  return (
    <div className="font-sans bg-[#0a0a0a] text-[#f5f3ee] overflow-hidden relative">
      <AuthRedirect />
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
