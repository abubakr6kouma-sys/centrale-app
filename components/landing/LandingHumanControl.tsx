export default function LandingHumanControl() {
  return (
    <section className="relative z-10 max-w-[1080px] mx-auto px-10 mt-[200px]">
      <div data-reveal className="text-center max-w-[680px] mx-auto">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          CONTRÔLE HUMAIN
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee]">
          L&apos;IA ne répond <span className="font-serif italic font-normal text-[#c9b896]">jamais seule.</span>
        </h2>
        <p className="text-lg leading-[1.6] text-[#9b9890] mt-[22px] max-w-[540px] mx-auto">
          Chaque réponse est préparée, jamais envoyée. Rien ne part tant que vous n&apos;avez pas
          validé. Votre voix reste la vôtre.
        </p>
      </div>

      <div data-reveal className="flex items-center justify-center mt-16 max-w-[760px] mx-auto">
        <div className="flex-1 text-center">
          <div
            className="w-[54px] h-[54px] mx-auto mb-4 rounded-2xl flex items-center justify-center text-[#9b9890] text-xl"
            style={{ border: '1px solid rgba(245,243,238,0.14)' }}
          >
            ✎
          </div>
          <div className="text-sm font-semibold text-[#e7e5de]">Brouillon IA</div>
          <div className="text-[12.5px] text-[#6a6862] mt-1">préparé pour vous</div>
        </div>

        <div
          className="w-[60px] h-px"
          style={{
            background:
              'linear-gradient(90deg, rgba(245,243,238,0.12), rgba(201,184,150,0.5))',
          }}
        />

        <div className="flex-1 text-center">
          <div
            className="w-[62px] h-[62px] mx-auto mb-4 rounded-2xl bg-[#f5f3ee] flex items-center justify-center text-[#0a0a0a] text-2xl"
            style={{ boxShadow: '0 0 0 6px rgba(201,184,150,0.12)' }}
          >
            ✓
          </div>
          <div className="text-sm font-bold text-[#f5f3ee]">Votre validation</div>
          <div className="text-[12.5px] text-[#c9b896] mt-1">l&apos;étape qui vous appartient</div>
        </div>

        <div
          className="w-[60px] h-px"
          style={{
            background:
              'linear-gradient(90deg, rgba(201,184,150,0.5), rgba(245,243,238,0.12))',
          }}
        />

        <div className="flex-1 text-center">
          <div
            className="w-[54px] h-[54px] mx-auto mb-4 rounded-2xl flex items-center justify-center text-[#9b9890] text-xl"
            style={{ border: '1px solid rgba(245,243,238,0.14)' }}
          >
            ↗
          </div>
          <div className="text-sm font-semibold text-[#e7e5de]">Envoi</div>
          <div className="text-[12.5px] text-[#6a6862] mt-1">après votre accord</div>
        </div>
      </div>
    </section>
  )
}
