# CentralY — Phase 1 (backend fonctionnel)

Application Next.js 14 (App Router, TypeScript, Tailwind) reconstruisant fidèlement
le design CentralY fourni, avec le backend complet de la Phase 1 branché :
authentification, Gmail OAuth, classification IA, génération de brouillons,
validation manuelle, envoi réel, historique, Supabase.

## Ce qui a été reconstruit depuis le design original

Les fichiers `.dc.html` fournis ne sont pas du code Next.js (export d'un outil
de prototypage propriétaire). Chaque écran a été reconstruit en composants
React/Tailwind identiques visuellement :

- `app/page.tsx` → écran Entry (logo animé, connexion Google)
- `app/landing/page.tsx` → Landing marketing (6 sections)
- `app/dashboard/page.tsx` → Dashboard (sidebar, liste, détail + IA)

Seule différence volontaire : les catégories utilisées dans la logique métier
sont Prospect / Client / Support / Facture / Urgent / Autre (demandées
explicitement), avec le même style visuel que la maquette d'origine.

## Configuration requise avant le premier lancement

### 1. Google Cloud (OAuth + Gmail API)

1. Créez un projet sur console.cloud.google.com
2. Activez l'API Gmail (API & Services > Library > Gmail API > Enable)
3. Configurez l'écran de consentement OAuth (mode Test au départ — jusqu'à
   100 utilisateurs sans vérification complète)
4. Créez des identifiants OAuth 2.0 (Credentials > Create > OAuth client ID,
   type "Web application")
5. Ajoutez ces URIs de redirection autorisées :
   - http://localhost:3000/api/auth/callback/google (développement)
   - https://votre-domaine.vercel.app/api/auth/callback/google (production)
6. Ajoutez vos comptes de test (et les vôtres) dans "Test users" tant que
   l'app est en mode Test
7. Copiez le Client ID et le Client Secret dans .env.local

### 2. Supabase

1. Créez un projet sur supabase.com
2. Allez dans SQL Editor > New query, collez le contenu de
   supabase/schema.sql, exécutez
3. **Si le projet existait déjà avant la Phase 2 (abonnements/quotas)** :
   exécutez aussi supabase/migration_002_plans_quotas.sql dans SQL Editor —
   sans danger à rejouer plusieurs fois, ajoute les colonnes de plan et de
   quota sur la table users sans toucher aux données existantes
4. Dans Project Settings > API, copiez l'URL du projet et la clé
   service_role (jamais la clé anon pour ce backend — service_role
   contourne RLS et n'est utilisée que côté serveur)

### 3. Clé de chiffrement des tokens

openssl rand -hex 32

Copiez le résultat dans TOKEN_ENCRYPTION_KEY.

### 4. Clé API Anthropic

Récupérez une clé sur console.anthropic.com et placez-la dans
ANTHROPIC_API_KEY.

### 5. Secret NextAuth

openssl rand -base64 32

Copiez le résultat dans NEXTAUTH_SECRET.

Remplissez ensuite .env.local à partir de .env.example avec toutes ces
valeurs.

## Lancer en local

npm install
npm run dev

## Déployer sur Vercel

1. Poussez le projet sur un repo Git
2. Importez-le dans Vercel
3. Renseignez toutes les variables de .env.example dans Vercel (Settings >
   Environment Variables) — y compris en production
4. Mettez à jour NEXTAUTH_URL avec votre domaine Vercel final
5. Ajoutez l'URI de callback de production dans Google Cloud (voir étape 1.5)
6. Déployez

## Limites connues de cette Phase 1 (volontaires)

- Synchronisation manuelle uniquement (bouton "Rafraîchir"), pas de cron
  automatique — cohérent avec la limite du plan Vercel Hobby (1 cron/jour)
  identifiée dans l'analyse de risques. Un bouton manuel évite cette
  dépendance dès le départ.
- Gmail uniquement, pas Outlook.
- 15 emails maximum par synchronisation, pour rester sous le timeout des
  fonctions serverless et maîtriser le coût IA.
- Mode Test Google : jusqu'à 100 utilisateurs sans vérification complète.
  Au-delà, voir la section CASA de l'analyse de risques.

## Structure du backend

lib/
  authOptions.ts      configuration NextAuth (provider Google, scopes Gmail)
  supabaseAdmin.ts     client Supabase côté serveur (clé service_role)
  tokenCrypto.ts       chiffrement AES-256-GCM des tokens Gmail
  gmailClient.ts        client Gmail authentifié par utilisateur, refresh auto
  gmailParser.ts         parsing MIME des messages, construction des envois
  aiAnalysis.ts           appel Claude : classification + résumé + brouillon
  currentUser.ts          résolution session NextAuth vers ligne Supabase

app/api/
  auth/[...nextauth]/route.ts    endpoint NextAuth
  emails/route.ts                  GET : liste des emails + brouillons
  emails/sync/route.ts             POST : synchronise Gmail, analyse via IA
  emails/[id]/draft/route.ts       POST : régénère le brouillon d'un email
  emails/[id]/send/route.ts        POST : envoi réel, garde anti-double-envoi

middleware.ts             protège /dashboard (redirige vers / si non connecté)
supabase/schema.sql        schéma complet (users, emails, drafts)
