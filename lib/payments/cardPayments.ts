import { Plan } from '@/lib/quota'
import {
  PaymentProvider,
  CreateSubscriptionParams,
  CreateSubscriptionResult,
  CancelSubscriptionParams,
  SubscriptionEvent,
  WebhookRequest,
} from '@/lib/payments/types'

// ============================================================
// Fournisseur Carte bancaire — préparé, pas encore branché, et
// volontairement agnostique du processeur réel (Stripe, PayPal Advanced
// Card Processing, ou autre — décision pas encore prise).
//
// Comme pour PayPal, isConfigured() renvoie false tant que les variables
// d'environnement CARD_* ne sont pas renseignées : aucun appel réseau n'est
// fait, aucun bouton de paiement carte ne s'active dans l'UI.
//
// Pourquoi ce module reste agnostique : les concepts (créer un abonnement,
// l'annuler, vérifier une signature webhook, normaliser un événement) sont
// communs à n'importe quel processeur de carte — seuls les noms exacts des
// champs et endpoints diffèrent. Choisir le processeur plus tard ne demande
// donc que de remplir les TODO CARTE ci-dessous avec la doc du processeur
// retenu, sans changer la moindre signature ni le reste de l'app : ce module
// est consommé uniquement via lib/payments/index.ts (PAYMENT_PROVIDERS.card),
// jamais importé directement par une route API ou un composant.
// ============================================================

interface CardPaymentConfig {
  apiKey: string
  webhookSecret: string
  /** Id du produit/plan créé côté processeur, par plan interne. */
  priceIds: Partial<Record<Plan, string>>
}

function getConfig(): CardPaymentConfig | null {
  const apiKey = process.env.CARD_PAYMENTS_API_KEY
  const webhookSecret = process.env.CARD_PAYMENTS_WEBHOOK_SECRET
  if (!apiKey || !webhookSecret) return null

  return {
    apiKey,
    webhookSecret,
    priceIds: {
      pro: process.env.CARD_PAYMENTS_PRICE_ID_PRO,
      business: process.env.CARD_PAYMENTS_PRICE_ID_BUSINESS,
    },
  }
}

export const cardPaymentsProvider: PaymentProvider = {
  method: 'card',

  isConfigured(): boolean {
    return getConfig() !== null
  },

  // ------------------------------------------------------------
  // TODO CARTE — Création d'un abonnement par carte.
  // Selon le processeur retenu :
  //   - Stripe : POST /v1/checkout/sessions (mode 'subscription'), renvoie
  //     une session.url à utiliser comme redirectUrl. Passer
  //     client_reference_id = params.userId pour relier le webhook plus tard.
  //   - PayPal Advanced Card Processing : passe par l'API Orders v2 de PayPal
  //     (différente de l'API Subscriptions utilisée par lib/payments/paypal.ts) ;
  //     dans ce cas, harmoniser avec ce module plutôt que dupliquer l'appel
  //     OAuth2 PayPal.
  // Quel que soit le choix, le contrat ne change pas : renvoyer
  // { subscriptionId, redirectUrl }.
  // ------------------------------------------------------------
  async createSubscription(_params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
    throw new Error('Carte bancaire: createSubscription non implémenté — processeur pas encore choisi.')
  },

  // ------------------------------------------------------------
  // TODO CARTE — Annulation d'un abonnement par carte.
  // Stripe : DELETE /v1/subscriptions/{id} (ou update cancel_at_period_end).
  // Comme pour PayPal, ne pas mettre à jour Supabase directement ici : c'est
  // l'événement webhook qui doit le faire, pour rester cohérent si
  // l'annulation est aussi déclenchée depuis le dashboard du processeur.
  // ------------------------------------------------------------
  async cancelSubscription(_params: CancelSubscriptionParams): Promise<void> {
    throw new Error('Carte bancaire: cancelSubscription non implémenté — processeur pas encore choisi.')
  },

  // ------------------------------------------------------------
  // TODO CARTE — Vérification de signature webhook.
  // Stripe : en-tête 'stripe-signature', vérifié avec le webhookSecret via
  // la méthode de vérification HMAC du SDK officiel (ne jamais réimplémenter
  // la vérification HMAC à la main si un SDK officiel existe). Doit renvoyer
  // false sur signature invalide, jamais lever d'exception ici.
  // ------------------------------------------------------------
  async verifyWebhook(_request: WebhookRequest): Promise<boolean> {
    throw new Error('Carte bancaire: verifyWebhook non implémenté — processeur pas encore choisi.')
  },

  // ------------------------------------------------------------
  // TODO CARTE — Normalisation d'un événement webhook.
  // Mapper les événements du processeur retenu (ex: Stripe
  // 'customer.subscription.updated' / '.deleted') vers SubscriptionEvent.
  // Peut rester un throw jusqu'au choix du processeur, contrairement à
  // PayPal où le parsing JSON générique pouvait déjà être écrit.
  // ------------------------------------------------------------
  async parseWebhookEvent(_request: WebhookRequest): Promise<SubscriptionEvent | null> {
    throw new Error('Carte bancaire: parseWebhookEvent non implémenté — processeur pas encore choisi.')
  },
}
