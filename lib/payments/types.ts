import { Plan } from '@/lib/quota'

// ============================================================
// Contrat commun à tous les fournisseurs de paiement.
//
// CentralY prévoit exactement deux moyens de paiement : PayPal et la carte
// bancaire (Visa, Mastercard, etc.). Ce fichier ne contient aucune logique
// ni aucun nom de fournisseur tiers — uniquement les concepts universels
// (créer un abonnement, l'annuler, vérifier puis appliquer un événement de
// webhook) que chaque fournisseur implémente à sa façon dans son propre
// module (lib/payments/paypal.ts, lib/payments/cardPayments.ts).
//
// Pour ajouter un futur fournisseur sans toucher au reste de l'app : créer
// un nouveau module qui implémente PaymentProvider, puis l'enregistrer dans
// lib/payments/index.ts (PAYMENT_PROVIDERS). Aucune route API, aucun
// composant UI n'a besoin de connaître l'identité du fournisseur — ils
// passent par PAYMENT_PROVIDERS[method], jamais par un import direct de
// lib/payments/paypal.ts ou lib/payments/cardPayments.ts.
// ============================================================

export type PaymentMethod = 'paypal' | 'card'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paypal: 'PayPal',
  card: 'Carte bancaire',
}

export interface CreateSubscriptionParams {
  userId: string
  plan: Plan
  /** URL vers laquelle l'utilisateur est redirigé après une action réussie. */
  returnUrl: string
  /** URL vers laquelle l'utilisateur est redirigé s'il annule/abandonne. */
  cancelUrl: string
}

export interface CreateSubscriptionResult {
  /** Identifiant de l'abonnement côté fournisseur (peu importe son format exact). */
  subscriptionId: string
  /**
   * URL vers laquelle rediriger l'utilisateur pour finaliser le paiement
   * (lien d'approbation PayPal, Checkout Session Stripe, etc.). Toujours
   * une redirection complète : aucun fournisseur ne s'intègre en inline ici,
   * pour garder le même parcours quel que soit le moyen de paiement choisi.
   */
  redirectUrl: string
}

export interface CancelSubscriptionParams {
  userId: string
  subscriptionId: string
  reason?: string
}

export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'expired'

export interface SubscriptionEvent {
  subscriptionId: string
  status: SubscriptionStatus
  plan: Plan
  /** Date de la prochaine échéance si le fournisseur la communique. */
  renewsAt?: string
}

// Une requête webhook brute, indépendante du fournisseur : chaque module
// (paypal.ts, cardPayments.ts) sait extraire ce dont il a besoin depuis
// `headers`/`rawBody` selon son propre format de signature.
export interface WebhookRequest {
  headers: Record<string, string>
  rawBody: string
}

export interface PaymentProvider {
  method: PaymentMethod

  /**
   * Indique si ce fournisseur a ses identifiants configurés. Tant que ce
   * n'est pas le cas, l'UI doit afficher "Bientôt disponible" plutôt que
   * d'appeler la moindre fonction ci-dessous.
   */
  isConfigured(): boolean

  /** Démarre un abonnement et renvoie l'URL de redirection pour le finaliser. */
  createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult>

  /** Annule un abonnement existant côté fournisseur. */
  cancelSubscription(params: CancelSubscriptionParams): Promise<void>

  /**
   * Vérifie l'authenticité d'une requête webhook entrante. Doit retourner
   * false (jamais lever par défaut) si la signature est invalide — c'est à
   * l'appelant (la route API) de répondre 400 dans ce cas, sans traiter
   * l'événement.
   */
  verifyWebhook(request: WebhookRequest): Promise<boolean>

  /**
   * Extrait un événement d'abonnement normalisé depuis une requête déjà
   * vérifiée (verifyWebhook doit avoir renvoyé true avant cet appel).
   * Retourne null si l'événement reçu n'est pas un événement d'abonnement
   * pertinent (ex: notification d'un autre type, à ignorer silencieusement).
   */
  parseWebhookEvent(request: WebhookRequest): Promise<SubscriptionEvent | null>
}
