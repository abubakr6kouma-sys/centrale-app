import { Plan } from '@/lib/quota'
import { applySubscriptionEvent } from '@/lib/payments/applyEvent'
import {
  PaymentProvider,
  CreateSubscriptionParams,
  CreateSubscriptionResult,
  CancelSubscriptionParams,
  SubscriptionEvent,
  SubscriptionStatus,
  WebhookRequest,
} from '@/lib/payments/types'

// ============================================================
// Fournisseur PayPal — préparé, pas encore branché.
//
// Aucun appel réseau réel n'est fait par ce module tant que les variables
// d'environnement PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID
// ne sont pas renseignées (isConfigured() renvoie false). Le jour où les
// identifiants arrivent :
//   1. Renseigner les variables d'environnement (voir .env.example).
//   2. Implémenter le corps des fonctions marquées "TODO PAYPAL" ci-dessous
//      (signatures, types d'entrée/sortie déjà corrects, ne changent pas).
//   3. Rien d'autre à modifier ailleurs dans l'app : ce module est consommé
//      uniquement via lib/payments/index.ts (PAYMENT_PROVIDERS.paypal),
//      jamais importé directement par une route API ou un composant.
//
// Référence API utilisée pour cette préparation : PayPal Subscriptions REST
// API v1 (/v1/billing/subscriptions/{id}), format d'id "I-XXXXXXXXXXXX", et
// les événements webhook BILLING.SUBSCRIPTION.{ACTIVATED,CANCELLED,SUSPENDED,
// EXPIRED} ainsi que BILLING.SUBSCRIPTION.PAYMENT.FAILED.
// ============================================================

interface PaypalConfig {
  clientId: string
  clientSecret: string
  webhookId: string
  environment: 'sandbox' | 'live'
}

function getConfig(): PaypalConfig | null {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!clientId || !clientSecret || !webhookId) return null

  return {
    clientId,
    clientSecret,
    webhookId,
    environment: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox',
  }
}

function getApiBase(config: PaypalConfig): string {
  return config.environment === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

// Associe chaque plan interne CentralY à l'id du plan de facturation créé
// côté PayPal (Catalog Products + Billing Plans API), créé une fois dans le
// dashboard PayPal — pas à chaque appel.
const PAYPAL_PLAN_IDS: Partial<Record<Plan, string>> = {
  pro: process.env.PAYPAL_PLAN_ID_PRO,
  business: process.env.PAYPAL_PLAN_ID_BUSINESS,
}

function planIdToInternalPlan(planId: string | undefined): Plan {
  if (planId === PAYPAL_PLAN_IDS.pro) return 'pro'
  if (planId === PAYPAL_PLAN_IDS.business) return 'business'
  return 'free'
}

function mapEventTypeToStatus(eventType: string): SubscriptionStatus | null {
  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      return 'active'
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
      return 'suspended'
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      return 'cancelled'
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      return 'expired'
    default:
      return null
  }
}

// ------------------------------------------------------------
// TODO PAYPAL — Authentification OAuth2 (client_credentials).
// Doc : POST {apiBase}/v1/oauth2/token avec Basic Auth (clientId:clientSecret).
// Retourne un access_token à réutiliser (durée de vie ~9h). Prévoir un cache
// simple en mémoire pour éviter de redemander un token à chaque requête.
// ------------------------------------------------------------
async function getAccessToken(_config: PaypalConfig): Promise<string> {
  throw new Error('PayPal: getAccessToken non implémenté — identifiants pas encore branchés.')
}

export const paypalProvider: PaymentProvider = {
  method: 'paypal',

  isConfigured(): boolean {
    return getConfig() !== null
  },

  // ------------------------------------------------------------
  // TODO PAYPAL — Création d'un abonnement.
  // Doc : POST {apiBase}/v1/billing/subscriptions avec { plan_id, custom_id,
  // application_context: { return_url, cancel_url } }. `custom_id` doit
  // recevoir `params.userId` pour retrouver l'utilisateur CentralY depuis le
  // webhook. La réponse contient un lien rel="approve" : c'est `redirectUrl`.
  // ------------------------------------------------------------
  async createSubscription(_params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
    throw new Error('PayPal: createSubscription non implémenté — identifiants pas encore branchés.')
  },

  // ------------------------------------------------------------
  // TODO PAYPAL — Annulation d'un abonnement.
  // Doc : POST {apiBase}/v1/billing/subscriptions/{subscriptionId}/cancel
  // avec { reason }. Ne met pas à jour Supabase directement : c'est le
  // webhook BILLING.SUBSCRIPTION.CANCELLED qui le fait (source de vérité
  // unique), pour ne jamais désynchroniser l'état si l'annulation est aussi
  // déclenchée depuis le dashboard PayPal directement.
  // ------------------------------------------------------------
  async cancelSubscription(_params: CancelSubscriptionParams): Promise<void> {
    throw new Error('PayPal: cancelSubscription non implémenté — identifiants pas encore branchés.')
  },

  // ------------------------------------------------------------
  // TODO PAYPAL — Vérification de signature webhook.
  // Doc : POST {apiBase}/v1/notifications/verify-webhook-signature avec
  // { transmission_id, transmission_time, cert_url, auth_algo,
  //   transmission_sig, webhook_id, webhook_event } (en-têtes PayPal
  // correspondants : paypal-transmission-id, paypal-transmission-time,
  // paypal-cert-url, paypal-auth-algo, paypal-transmission-sig). Doit renvoyer
  // false si verification_status !== 'SUCCESS' — jamais lever d'exception ici,
  // c'est à la route API de répondre 400 dans ce cas.
  // ------------------------------------------------------------
  async verifyWebhook(_request: WebhookRequest): Promise<boolean> {
    throw new Error('PayPal: verifyWebhook non implémenté — identifiants pas encore branchés.')
  },

  // Volontairement déjà fonctionnelle (pas un throw) : le parsing du JSON
  // webhook PayPal et la normalisation vers SubscriptionEvent ne dépendent
  // pas des identifiants, seule verifyWebhook en a besoin avant cet appel.
  async parseWebhookEvent(request: WebhookRequest): Promise<SubscriptionEvent | null> {
    let payload: any
    try {
      payload = JSON.parse(request.rawBody)
    } catch {
      return null
    }

    const status = mapEventTypeToStatus(payload?.event_type)
    if (!status) return null

    const resource = payload?.resource || {}
    const subscriptionId = resource.id
    if (!subscriptionId) return null

    const planId = resource.plan_id as string | undefined

    return {
      subscriptionId,
      status,
      plan: status === 'active' ? planIdToInternalPlan(planId) : 'free',
      renewsAt: resource.billing_info?.next_billing_time,
    }
  },
}

// Réexporté pour que la future route webhook (/api/billing/paypal/webhook)
// puisse appliquer l'événement après vérification, sans avoir à connaître
// applyEvent.ts directement.
export { applySubscriptionEvent }
