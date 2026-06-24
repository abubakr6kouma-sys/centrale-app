import { Plan } from '@/lib/quota'

export interface PlanDefinition {
  id: Plan
  name: string
  tagline: string
  priceLabel: string
  priceSubLabel: string
  features: string[]
  cta: string
  highlighted: boolean
}

// Source unique des 3 plans affichés sur la Landing et la page Tarifs — les
// chiffres (prix, quotas) doivent rester cohérents avec lib/quota.ts
// (PLAN_LIMITS), qui définit les vraies limites appliquées côté serveur.
export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Gratuit',
    tagline: 'Pour découvrir CentralY.',
    priceLabel: '0€',
    priceSubLabel: 'pour toujours',
    features: ['50 emails analysés par mois', '10 brouillons IA par mois', 'Validation avant envoi'],
    cta: 'Essayer gratuitement',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les professionnels actifs.',
    priceLabel: '29€',
    priceSubLabel: '/ mois',
    features: [
      '1000 emails analysés par mois',
      'Brouillons IA illimités',
      'Détection avancée des prospects',
      'Relances automatiques',
      'Support prioritaire',
    ],
    cta: 'Passer au plan Pro',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pour les équipes et agences.',
    priceLabel: '79€',
    priceSubLabel: '/ mois',
    features: [
      '5000 emails analysés par mois',
      'Plusieurs boîtes Gmail',
      'Priorité de traitement',
      'Support prioritaire',
      'Tout Pro inclus',
    ],
    cta: 'Choisir Business',
    highlighted: false,
  },
]
