const FEATURES = [
  {
    icon: '🗂',
    title: 'Tri intelligent des emails',
    text: 'Chaque email reçu est classé automatiquement — prospect, client, support, facture ou urgent — sans aucune règle à configurer.',
  },
  {
    icon: '✎',
    title: 'Brouillons rédigés par l\'IA',
    text: 'Une réponse professionnelle est préparée pour chaque email, prête à être relue, modifiée et envoyée en un clic.',
  },
  {
    icon: '🎯',
    title: 'Détection automatique des prospects',
    text: 'Les nouvelles opportunités commerciales sont repérées dès leur arrivée, pour ne plus jamais laisser une demande sans réponse.',
  },
  {
    icon: '🧵',
    title: 'Suivi des conversations',
    text: 'Chaque échange reste visible dans son contexte, avec un historique clair de ce qui a déjà été traité ou envoyé.',
  },
]

export default function LandingFeatures() {
  return (
    <section className="relative z-10 max-w-[1080px] mx-auto px-10 mt-[180px] max-md:px-5 max-md:mt-[100px]">
      <div data-reveal className="text-center mb-[64px] max-md:mb-10">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          FONCTIONNALITÉS
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee] max-md:text-[28px]">
          Tout ce qu&apos;il faut pour traiter votre boîte sans y passer vos journées.
        </h2>
      </div>

      <div data-reveal className="grid grid-cols-2 gap-7 max-md:grid-cols-1 max-md:gap-5">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-[16px] p-7 max-md:p-5"
            style={{ background: 'rgba(245,243,238,0.03)', border: '1px solid rgba(245,243,238,0.1)' }}
          >
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center text-xl mb-5 flex-none"
              style={{ background: 'rgba(201,184,150,0.12)' }}
              aria-hidden="true"
            >
              {f.icon}
            </div>
            <h3 className="font-display text-[19px] font-semibold mb-2.5 text-[#f5f3ee]">{f.title}</h3>
            <p className="text-[14.5px] text-[#9b9890] leading-[1.65] m-0">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
