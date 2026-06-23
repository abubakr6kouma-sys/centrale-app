export default function LandingDashboardPreview() {
  return (
    <section id="dashboard" className="relative z-10 max-w-[1180px] mx-auto px-10 mt-[180px]">
      <div data-reveal className="text-center mb-16">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          VOTRE BOÎTE, EN CLAIR
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] max-w-[620px] mx-auto text-[#f5f3ee]">
          Tout ce qui compte, visible d&apos;un coup d&apos;œil.
        </h2>
      </div>

      <div
        data-reveal
        className="relative rounded-[22px] p-[26px]"
        style={{
          background: 'linear-gradient(180deg,#1a1916,#121211)',
          border: '1px solid rgba(245,243,238,0.1)',
          boxShadow: '0 50px 130px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="rounded-[14px] overflow-hidden bg-cream grid min-h-[430px]"
          style={{ gridTemplateColumns: '230px 1fr', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
        >
          <div className="bg-creamdark border-r border-line p-[18px] px-[14px]">
            <div className="flex items-center gap-[9px] mb-[22px]">
              <span className="text-ink flex items-center">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                  <path d="M36.26 13.71A16 16 0 1 0 36.26 34.29" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  <path d="M18 17 24 26 30 17M24 26 24 33" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-display font-semibold text-[15px] text-ink">CentralY</span>
            </div>
            <div className="flex items-center gap-[9px] px-[11px] py-2 rounded-lg bg-[#e7e3d9] text-[#2a2a26] font-semibold text-[13px]">
              Boîte intelligente
              <span className="ml-auto text-[11px] font-bold text-cream bg-[#0a0a0a] px-[7px] py-[1px] rounded-full">3</span>
            </div>
            <div className="text-[11px] font-semibold text-faint tracking-[0.06em] pt-5 px-[11px] pb-[10px]">
              CATÉGORIES
            </div>
            <div className="flex flex-col gap-[9px] px-[11px]">
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px] bg-cat-commercial" />Commercial
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px] bg-cat-support" />Support
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px] bg-cat-admin" />Administratif
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px] bg-cat-urgent" />Urgent
              </div>
            </div>
          </div>

          <div className="px-[26px] py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-[38px] h-[38px] rounded-full bg-[#2a2a26] flex items-center justify-center text-cream font-bold text-[13px]">
                MD
              </div>
              <div>
                <div className="font-semibold text-[14.5px] text-ink">Marie Dubois</div>
                <div className="text-xs text-[#9a9893]">Demande de devis — commande récurrente Q3</div>
              </div>
              <span className="ml-auto text-[11px] font-semibold text-gold-text bg-gold-bg px-[10px] py-1 rounded-[7px]">
                Commercial
              </span>
            </div>

            <div className="border border-[#ebe7dd] rounded-[13px] px-[18px] py-4 mb-[14px] bg-white">
              <div className="text-[10.5px] tracking-[0.1em] text-faint font-semibold mb-2">
                RÉSUMÉ IA
              </div>
              <div className="text-[13.5px] text-[#3a3a36] leading-[1.6]">
                Devis demandé pour une commande trimestrielle récurrente. Budget validé. Réponse
                attendue avant vendredi.
              </div>
            </div>

            <div className="border border-[#ebe7dd] rounded-[13px] px-[18px] py-4 bg-white">
              <div className="text-[10.5px] tracking-[0.1em] text-faint font-semibold mb-2">
                BROUILLON DE RÉPONSE
              </div>
              <div className="text-[13.5px] text-[#3a3a36] leading-[1.6] mb-4">
                Bonjour Marie, merci pour votre message. Vous trouverez ci-joint le devis actualisé
                pour votre commande du troisième trimestre…
              </div>
              <div className="flex gap-[10px] items-center">
                <div className="text-xs text-[#9a9893] flex items-center gap-[7px]">
                  <span className="w-[7px] h-[7px] rounded-full bg-cat-support" />
                  Prêt à envoyer
                </div>
                <div className="ml-auto flex gap-[9px]">
                  <div className="text-[12.5px] font-semibold text-muted border border-[#dcd7cc] px-4 py-[9px] rounded-[9px]">
                    Modifier
                  </div>
                  <div className="text-[12.5px] font-semibold text-cream bg-[#0a0a0a] px-[18px] py-[9px] rounded-[9px]">
                    Valider &amp; envoyer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-reveal
        className="flex justify-center gap-9 flex-wrap mt-[34px] text-[13.5px] text-[#9b9890]"
      >
        <span>Catégories automatiques</span>
        <span className="text-[#3a3a37]">·</span>
        <span>Résumés IA instantanés</span>
        <span className="text-[#3a3a37]">·</span>
        <span>Brouillons prêts à valider</span>
      </div>
    </section>
  )
}
