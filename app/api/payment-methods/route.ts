import { NextResponse } from 'next/server'
import { getConfiguredPaymentMethods } from '@/lib/payments'

// Endpoint public et volontairement minimal : ne renvoie qu'une liste de
// méthodes ('paypal' | 'card'), jamais une clé ni un identifiant. Utilisé
// par PricingCards (composant client) pour savoir s'il faut activer un
// vrai bouton de paiement ou afficher "Bientôt disponible" — la décision
// reste basée sur les variables d'environnement serveur, jamais dupliquée
// côté client.
export async function GET() {
  return NextResponse.json({ ok: true, methods: getConfiguredPaymentMethods() })
}
