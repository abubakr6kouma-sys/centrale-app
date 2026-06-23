import { google } from 'googleapis'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { encryptToken, decryptToken } from '@/lib/tokenCrypto'

interface UserTokenRow {
  id: string
  gmail_access_token: string | null
  gmail_refresh_token: string | null
  gmail_token_expires_at: string | null
}

// Construit un client Gmail API authentifié pour un utilisateur donné.
// Si le token d'accès est expiré (ou proche de l'être), il est rafraîchi
// via le refresh_token, et la nouvelle valeur est persistée en base chiffrée.
export async function getGmailClientForUser(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, gmail_access_token, gmail_refresh_token, gmail_token_expires_at')
    .eq('id', userId)
    .single<UserTokenRow>()

  if (error || !user) {
    throw new Error('Utilisateur introuvable ou boîte Gmail non connectée.')
  }
  if (!user.gmail_refresh_token) {
    throw new Error(
      'Aucun refresh token Gmail disponible. L\'utilisateur doit se reconnecter pour autoriser à nouveau l\'accès.'
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  const refreshToken = decryptToken(user.gmail_refresh_token)
  const accessToken = user.gmail_access_token ? decryptToken(user.gmail_access_token) : undefined
  const expiryDate = user.gmail_token_expires_at
    ? new Date(user.gmail_token_expires_at).getTime()
    : 0

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  })

  // googleapis rafraîchit automatiquement le token si expiré lors du premier
  // appel, et émet cet événement avec les nouvelles credentials : on les
  // persiste immédiatement pour ne pas perdre le bénéfice du refresh.
  oauth2Client.on('tokens', async (tokens) => {
    const update: { gmail_access_token?: string; gmail_token_expires_at?: string } = {}
    if (tokens.access_token) update.gmail_access_token = encryptToken(tokens.access_token)
    if (tokens.expiry_date) {
      update.gmail_token_expires_at = new Date(tokens.expiry_date).toISOString()
    }
    if (Object.keys(update).length > 0) {
      await supabaseAdmin.from('users').update(update).eq('id', userId)
    }
  })

  // IMPORTANT : on force googleapis à utiliser le fetch natif de Node (undici)
  // plutôt que la dépendance interne node-fetch@2 (via gaxios). C'est un bug
  // documenté et confirmé sur l'écosystème googleapis/gaxios : node-fetch déclenche
  // un faux-positif "ERR_STREAM_PREMATURE_CLOSE" / "Invalid response body" lors de
  // la réutilisation de sockets keep-alive, en particulier sur des réponses de
  // taille moyenne à grande (typiquement 25-100 Ko) — exactement le profil d'un
  // messages.get(format: 'full'). Le fetch natif (Node 18+, disponible sur Vercel)
  // n'est pas affecté par ce bug.
  return google.gmail({
    version: 'v1',
    auth: oauth2Client,
    fetchImplementation: fetch,
  })
}
