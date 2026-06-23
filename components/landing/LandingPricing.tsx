import Link from 'next/link'

const PLANS = [
  {
    name: 'Starter',
    tagline: 'Pour démarrer en solo.',
    features: [
      '1 boîte Gmail connectée',
      'Analyse & classification IA',
      'Résumés instantanés',
      'Validation avant envoi',
    ],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    name: 'Pro',
    tagline: 'Pour les professionnels actifs.',
    features: [
      'Tout Starter, et plus',
      'Brouillons IA illimités',
      'Catégories personnalisées',
      'Priorisation intelligente',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
    highlighted: true,
  },
  {
    name: 'Business',
    tagline: 'Pour les équipes et agences.',
    features: [
      'Tout Pro, et plus',
      'Boîtes multiples',
      'Espace équipe partagé',
      'Rôles & permissions',
      'Accompagnement dédié',
    ],
    cta: 'Nous contacter',
    highlighted: false,
  },
]

export default function LandingPricing() {
  return (
    <section id="tarifs" className="relative z-10 max-w-[1120px] mx-auto px-10 mt-[200px]">
      <div data-reveal className="text-center max-w-[620px] mx-auto mb-[60px]">
        <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
          ABONNEMENTS
        </div>
        <h2 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee]">
          Un plan pour chaque équipe.
        </h2>
        <p className="text-[17px] leading-[1.6] text-[#9b9890] mt-5 max-w-[480px] mx-auto">
          Trois formules pensées pour grandir avec vous. Tarification détaillée bientôt
          disponible.
        </p>
      </div>

      <div data-reveal className="grid grid-cols-3 gap-5 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="relative flex flex-col rounded-[18px] px-[26px] py-[30px]"
            style={
              plan.highlighted
                ? {
                    background:
                      'linear-gradient(180deg, rgba(201,184,150,0.1), rgba(201,184,150,0.02))',
                    border: '1px solid rgba(201,184,150,0.4)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                  }
                : {
                    background: 'rgba(245,243,238,0.02)',
                    border: '1px solid rgba(245,243,238,0.1)',
                  }
            }
          >
            {plan.highlighted && (
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-[0.08em] text-[#0a0a0a] bg-[#c9b896] px-3 py-1 rounded-full">
                RECOMMANDÉ
              </div>
            )}
            <div className="font-display font-semibold text-[19px] mb-1.5 text-[#f5f3ee]">
              {plan.name}
            </div>
            <div className="text-[13.5px] text-[#9b9890] mb-[22px]">{plan.tagline}</div>
            <div
              className="font-display text-[28px] font-semibold tracking-[-0.02em]"
              style={{ color: plan.highlighted ? '#f5f3ee' : '#6a6862' }}
            >
              Bientôt
            </div>
            <div
              className="h-px my-6"
              style={{
                background: plan.highlighted
                  ? 'rgba(201,184,150,0.25)'
                  : 'rgba(245,243,238,0.08)',
              }}
            />
            <div className="flex flex-col gap-[13px] text-sm text-[#c6c4bd] flex-1">
              {plan.features.map((f) => (
                <div key={f} className="flex gap-[10px]">
                  <span className="text-[#c9b896]">✓</span> {f}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-7 text-center text-[14.5px] font-semibold rounded-[11px] py-3 no-underline"
              style={
                plan.highlighted
                  ? { color: '#0a0a0a', background: '#f5f3ee' }
                  : { color: '#e7e5de', border: '1px solid rgba(245,243,238,0.16)' }
              }
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
