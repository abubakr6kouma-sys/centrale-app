import LandingNav from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooterCta'
import PricingCards from '@/components/PricingCards'
import ScrollReveal from '@/components/landing/ScrollReveal'

export default function TarifsPage() {
  return (
    <div className="font-sans bg-[#0a0a0a] text-[#f5f3ee] min-h-screen overflow-hidden relative">
      <ScrollReveal />

      <div
        className="absolute -top-[340px] left-1/2 -translate-x-1/2 w-[1100px] h-[760px] blur-[20px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(closest-side, rgba(201,184,150,0.10), rgba(201,184,150,0) 70%)',
        }}
      />

      <LandingNav />

      <section className="relative z-10 max-w-[1120px] mx-auto px-10 pt-[50px] pb-[120px] max-md:px-5 max-md:pt-[30px] max-md:pb-[80px]">
        <div data-reveal className="text-center max-w-[640px] mx-auto mb-[60px]">
          <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
            TARIFS
          </div>
          <h1 className="font-display font-semibold text-[48px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee] max-md:text-[32px]">
            Un plan pour chaque équipe.
          </h1>
          <p className="text-[17px] leading-[1.6] text-[#9b9890] mt-5 max-w-[480px] mx-auto max-md:text-[15px]">
            Commencez gratuitement avec 50 emails analysés par mois. Passez au plan Pro dès que
            votre boîte grandit.
          </p>
        </div>

        <PricingCards variant="dark" />

        <div data-reveal className="text-center mt-16">
          <p className="text-[13.5px] text-[#6a6862]">
            Une question sur les abonnements ?{' '}
            <a href="/contact" className="text-[#c9b896] no-underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
