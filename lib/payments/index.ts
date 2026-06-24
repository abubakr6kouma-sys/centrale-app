import { PaymentMethod, PaymentProvider } from '@/lib/payments/types'
import { paypalProvider } from '@/lib/payments/paypal'
import { cardPaymentsProvider } from '@/lib/payments/cardPayments'

// Point d'entrée unique vers les fournisseurs de paiement. Toute route API
// ou composant UI qui a besoin d'agir sur un paiement passe par
// getPaymentProvider(method) — jamais par un import direct de
// lib/payments/paypal.ts ou lib/payments/cardPayments.ts. C'est ce qui
// permet d'ajouter un futur fournisseur (ou de changer le processeur de
// carte choisi) sans modifier la moindre route API ni le moindre composant :
// seul ce fichier et le nouveau module concerné changent.
export const PAYMENT_PROVIDERS: Record<PaymentMethod, PaymentProvider> = {
  paypal: paypalProvider,
  card: cardPaymentsProvider,
}

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  return PAYMENT_PROVIDERS[method]
}

// Utilisé par l'UI (PricingCards) pour savoir quels boutons de paiement
// activer réellement plutôt qu'afficher "Bientôt disponible".
export function getConfiguredPaymentMethods(): PaymentMethod[] {
  return (Object.keys(PAYMENT_PROVIDERS) as PaymentMethod[]).filter((method) =>
    PAYMENT_PROVIDERS[method].isConfigured()
  )
}

export * from '@/lib/payments/types'
