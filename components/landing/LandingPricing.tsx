import PricingCards from '@/components/PricingCards'

export default function LandingPricing() {
  return (
    <section id="tarifs" className="relative z-10 max-w-[1120px] mx-auto px-10 mt-[200px] max-md:px-5 max-md:mt-[120px]">
      <div data-reveal className="text-center max-w-[620px] mx-auto mb-[60px]">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          ABONNEMENTS
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee] max-md:text-[30px]">
          Un plan pour chaque équipe.
        </h2>
        <p className="text-[17px] leading-[1.6] text-[#9b9890] mt-5 max-w-[480px] mx-auto max-md:text-[15px]">
          Commencez gratuitement, passez au plan supérieur quand vous en avez besoin.
        </p>
      </div>

      <PricingCards variant="dark" />
    </section>
  )
}
