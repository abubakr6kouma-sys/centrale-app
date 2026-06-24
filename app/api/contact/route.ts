import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getCurrentUser } from '@/lib/currentUser'

// Reçoit les messages du formulaire de la page /contact. Stocke en base
// plutôt que d'envoyer un email directement : aucune dépendance d'envoi
// transactionnel (Resend, Postmark...) n'est encore branchée dans ce projet,
// et stocker en base fonctionne immédiatement sans nouvelle clé d'API à
// configurer. Les messages sont consultables dans Supabase (Table Editor,
// table contact_messages) en attendant.
//
// TODO SUPPORT — pour notifier réellement une boîte mail à la réception
// d'un message (plutôt que de devoir consulter Supabase manuellement) :
// brancher un appel à un service d'envoi transactionnel ici, juste après
// l'insertion réussie. Ne jamais exposer l'adresse de destination côté
// client — elle ne doit exister que dans une variable d'environnement
// serveur (ex: SUPPORT_NOTIFICATION_EMAIL), lue uniquement dans ce fichier.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : null
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }
  if (!email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  // Si l'expéditeur est connecté, on relie le message à son compte — utile
  // pour le support, jamais requis pour utiliser le formulaire.
  const currentUser = await getCurrentUser()

  const { error } = await supabaseAdmin.from('contact_messages').insert({
    user_id: currentUser?.id || null,
    name,
    email,
    subject,
    message,
  })

  if (error) {
    console.error('[contact] échec de l\'enregistrement du message', error)
    return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
