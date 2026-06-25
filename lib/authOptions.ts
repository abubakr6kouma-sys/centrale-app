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

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

// NextAuth only sets Expires (absolute date) on the session cookie by default.
// Safari on macOS/iOS sometimes treats such cookies as session-only and clears
// them on full quit. Setting Max-Age explicitly forces the browser to honor a
// relative expiry and guarantees the cookie survives browser restarts.
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://')
const cookiePrefix = useSecureCookies ? '__Secure-' : ''

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
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !!useSecureCookies,
        maxAge: SESSION_MAX_AGE,
      },
    },
  },
  callbacks: {
    // Appelé à chaque connexion réussie côté Google. Deux responsabilités
    // bien séparées ici, volontairement :
    // 1. Valider que Google a bien renvoyé ce dont on a besoin (identité +
    //    access_token) — un échec ici est un vrai motif de refus.
    // 2. Persister l'utilisateur et ses tokens Gmail dans Supabase — un échec
    //    ici est un problème d'infrastructure, PAS une raison de refuser la
    //    connexion. Avant cette correction, toute panne Supabase (clé
    //    d'environnement absente, RLS mal configuré, contrainte SQL,
    //    timeout réseau...) se traduisait silencieusement par l'écran
    //    "Access Denied" de NextAuth, sans aucune indication de la vraie
    //    cause. On journalise désormais l'échec en détail et on laisse
    //    l'utilisateur se connecter malgré tout : le pire cas possible est
    //    alors une synchronisation Gmail qui échouera plus tard avec un
    //    message clair, plutôt qu'un refus de connexion incompréhensible.
    async signIn({ user, account }) {
      if (!account?.access_token) {
        console.error('[auth] signIn refusé : aucun access_token renvoyé par Google', {
          provider: account?.provider,
        })
        return false
      }
      if (!user.email) {
        console.error('[auth] signIn refusé : aucun email renvoyé par Google')
        return false
      }

      try {
        const expiresAt = account.expires_at
          ? new Date(account.expires_at * 1000).toISOString()
          : null

        const { data: existing, error: selectError } = await supabaseAdmin
          .from('users')
          .select('id, gmail_refresh_token')
          .eq('email', user.email)
          .maybeSingle()

        if (selectError) {
          throw selectError
        }

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
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update(payload)
            .eq('id', existing.id)
          if (updateError) throw updateError
          console.log('[auth] signIn — utilisateur existant mis à jour', { email: user.email })
        } else {
          const { error: insertError } = await supabaseAdmin.from('users').insert(payload)
          if (insertError) throw insertError
          console.log('[auth] signIn — nouvel utilisateur créé', { email: user.email })
        }
      } catch (err) {
        // Échec de la persistance Supabase : on journalise en détail pour
        // pouvoir diagnostiquer (clé service_role manquante, RLS, contrainte
        // SQL, réseau...), mais on NE bloque PAS la connexion Google pour
        // autant. L'utilisateur authentifié légitimement par Google ne doit
        // jamais voir "Access Denied" à cause d'un problème côté Supabase.
        console.error(
          '[auth] échec de la persistance Supabase pendant signIn (connexion autorisée malgré tout)',
          {
            email: user.email,
            error: err instanceof Error ? err.message : err,
          }
        )
      }

      return true
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
