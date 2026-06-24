import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Plan } from '@/lib/quota'
import { PaymentMethod, SubscriptionEvent } from '@/lib/payments/types'

// Point d'écriture unique en base pour tout événement d'abonnement, quel que
// soit le fournisseur qui l'a déclenché (PayPal ou carte). Chaque module
// fournisseur normalise son propre format d'événement vers SubscriptionEvent
// (voir parseWebhookEvent dans types.ts), puis appelle cette fonction —
// aucun module fournisseur n'écrit directement dans Supabase lui-même.
export async function applySubscriptionEvent(
  method: PaymentMethod,
  event: SubscriptionEvent
): Promise<void> {
  const plan: Plan = event.status === 'active' ? event.plan : 'free'

  const column = method === 'paypal' ? 'paypal_subscription_id' : 'card_subscription_id'

  const { error, count } = await supabaseAdmin
    .from('users')
    .update({
      plan,
      [column]: event.subscriptionId,
      subscription_status: event.status,
      subscription_method: method,
      subscription_renews_at: event.renewsAt || null,
    })
    .eq(column, event.subscriptionId)

  if (error) {
    console.error('[payments] échec de mise à jour Supabase suite à un webhook', {
      method,
      subscriptionId: event.subscriptionId,
      error,
    })
    throw error
  }

  if (count === 0) {
    // Arrive si le webhook ACTIVATED initial n'a pas encore pu être relié
    // (ex: custom_id absent côté fournisseur, ou abonnement créé hors de
    // notre flux). Journalisé pour investigation manuelle plutôt que
    // silencieusement ignoré.
    console.error('[payments] aucun utilisateur trouvé pour cet abonnement', {
      method,
      subscriptionId: event.subscriptionId,
    })
  }

  console.log('[payments] événement appliqué', {
    method,
    subscriptionId: event.subscriptionId,
    plan,
    status: event.status,
  })
}
