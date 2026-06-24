export default function LandingDashboardPreview() {
  return (
    <section id="dashboard" className="relative z-10 max-w-[1180px] mx-auto px-10 mt-[180px] max-md:px-5 max-md:mt-[100px]">
      <div data-reveal className="text-center mb-16 max-md:mb-10">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          VOTRE BOÎTE, EN CLAIR
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] max-w-[620px] mx-auto text-[#f5f3ee] max-md:text-[28px]">
          Tout ce qui compte, visible d&apos;un coup d&apos;œil.
        </h2>
      </div>

      <div
        data-reveal
        className="relative rounded-[22px] p-[26px] max-md:p-3"
        style={{
          background: 'linear-gradient(180deg,#1a1916,#121211)',
          border: '1px solid rgba(245,243,238,0.1)',
          boxShadow: '0 50px 130px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="rounded-[14px] overflow-hidden bg-cream grid min-h-[430px] max-md:grid-cols-1 max-md:min-h-0"
          style={{ gridTemplateColumns: '230px 1fr', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
        >
          <div className="bg-creamdark border-r border-line p-[18px] px-[14px] max-md:hidden">
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
              Tous les emails
              <span className="ml-auto text-[11px] font-bold text-cream bg-[#0a0a0a] px-[7px] py-[1px] rounded-full">4</span>
            </div>
            <div className="text-[11px] font-semibold text-faint tracking-[0.06em] pt-5 px-[11px] pb-[10px]">
              FILTRES
            </div>
            <div className="flex flex-col gap-[9px] px-[11px]">
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: '#b08968' }} />Prospects
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: '#7d8471' }} />Clients
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: '#8a8170' }} />Support
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: '#9a8c7a' }} />Factures
              </div>
              <div className="flex items-center gap-[9px] text-[12.5px] text-muted">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: '#b5524f' }} />Urgents
              </div>
            </div>
          </div>

          <div className="px-[26px] py-6 max-md:px-4 max-md:py-4">
            <div className="grid grid-cols-4 gap-2 mb-5 max-md:grid-cols-2">
              <MiniStat icon="📧" label="Emails analysés" value="32" />
              <MiniStat icon="📊" label="Quota restant" value="18" />
              <MiniStat icon="🎯" label="Prospects" value="6" />
              <MiniStat icon="⏱" label="Temps gagné" value="1h36" />
            </div>

            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="w-[38px] h-[38px] rounded-full bg-[#2a2a26] flex items-center justify-center text-cream font-bold text-[13px] flex-none">
                MD
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[14.5px] text-ink">Marie Dubois</div>
                <div className="text-xs text-[#9a9893] truncate">Demande de devis — commande récurrente Q3</div>
              </div>
              <span className="ml-auto text-[11px] font-semibold text-gold-text bg-gold-bg px-[10px] py-1 rounded-[7px] flex-none">
                Prospect
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
              <div className="flex gap-[10px] items-center flex-wrap">
                <div className="text-xs text-[#9a9893] flex items-center gap-[7px]">
                  <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#7d8471' }} />
                  Prêt à envoyer
                </div>
                <div className="ml-auto flex gap-[9px]">
                  <div className="text-[12.5px] font-semibold text-muted border border-[#dcd7cc] px-4 py-[9px] rounded-[9px]">
                    Modifier
                  </div>
                  <div className="text-[12.5px] font-semibold text-cream bg-[#0a0a0a] px-[18px] py-[9px] rounded-[9px] whitespace-nowrap">
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
        className="flex justify-center gap-9 flex-wrap mt-[34px] text-[13.5px] text-[#9b9890] max-md:gap-4 max-md:text-[12.5px]"
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

function MiniStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-white border border-[#ebe7dd] px-3 py-2 min-w-0">
      <div className="text-[10px] text-faint truncate mb-0.5">
        <span aria-hidden="true">{icon}</span> {label}
      </div>
      <div className="font-display text-[15px] font-semibold text-ink truncate">{value}</div>
    </div>
  )
}
