import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { encryptToken } from '@/lib/tokenCrypto'

// Scopes minimaux : lecture des emails + envoi + identité de base.
// Volontairement PAS gmail.modify ni https://mail.google.com/ (accès complet).
// Statut de vérification Google (à date) : gmail.send est un scope "sensible"
// (vérification standard) ; gmail.readonly est classé "restreint" et peut donc
// déclencher un audit de sécurité tiers (CASA) une fois au-delà du mode Test
// à 100 utilisateurs — voir l'analyse de risques et le README pour l'anticiper.
const GMAIL_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ')

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: GMAIL_SCOPES,
          access_type: 'offline', // nécessaire pour obtenir un refresh_token
          prompt: 'consent', // force le renvoi du refresh_token à chaque connexion
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    // Appelé à chaque connexion réussie : on enregistre / met à jour l'utilisateur
    // et ses tokens Gmail chiffrés dans Supabase.
    async signIn({ user, account }) {
      if (!account?.access_token || !user.email) return false

      try {
        const expiresAt = account.expires_at
          ? new Date(account.expires_at * 1000).toISOString()
          : null

        const { data: existing } = await supabaseAdmin
          .from('users')
          .select('id, gmail_refresh_token')
          .eq('email', user.email)
          .maybeSingle()

        // Google ne renvoie un refresh_token qu'à la première autorisation
        // (ou quand prompt=consent force un nouveau consentement). On ne
        // l'écrase donc jamais avec une valeur vide si on en a déjà un en base.
        const refreshTokenToStore = account.refresh_token
          ? encryptToken(account.refresh_token)
          : existing?.gmail_refresh_token || null

        const payload = {
          email: user.email,
          name: user.name || null,
          google_id: account.providerAccountId,
          gmail_access_token: encryptToken(account.access_token),
          gmail_refresh_token: refreshTokenToStore,
          gmail_token_expires_at: expiresAt,
        }

        if (existing) {
          await supabaseAdmin.from('users').update(payload).eq('id', existing.id)
        } else {
          await supabaseAdmin.from('users').insert(payload)
        }

        return true
      } catch (err) {
        console.error('[auth] échec de la persistance utilisateur Supabase', err)
        // On bloque la connexion plutôt que de laisser un utilisateur sans
        // ligne en base, ce qui casserait silencieusement toute la suite.
        return false
      }
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
