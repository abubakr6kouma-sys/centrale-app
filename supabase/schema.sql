-- Schéma CentralY — Phase 1 (Gmail uniquement)
-- À exécuter dans Supabase : SQL Editor > New query

create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- Un utilisateur = un compte Google = une boîte Gmail connectée.
-- Les tokens sont stockés chiffrés (AES-256-GCM, voir lib/tokenCrypto.ts) :
-- jamais en clair, même dans cette base.
-- ============================================================
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  google_id text unique,
  email text unique not null,
  name text,
  gmail_access_token text,
  gmail_refresh_token text,
  gmail_token_expires_at timestamptz,
  last_sync_history_id text,
  last_synced_at timestamptz,
  -- Abonnement et quotas (Phase 2). Tout nouvel utilisateur démarre en
  -- 'free'. Le paiement réel (PayPal) n'est pas encore branché : ces colonnes
  -- existent pour que la logique de quota soit déjà fonctionnelle, et pour
  -- qu'un changement de plan (manuel ou futur webhook PayPal) n'ait qu'à
  -- mettre à jour une ligne existante plutôt qu'exiger une migration.
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  -- Compteurs remis à zéro chaque mois par reset_monthly_usage_if_needed()
  -- (voir lib/quota.ts), pas par un cron — évite toute dépendance à un job
  -- planifié externe pour une fonctionnalité qui doit rester simple en V1.
  emails_analyzed_this_month integer not null default 0,
  drafts_generated_this_month integer not null default 0,
  usage_period_started_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- EMAILS
-- Un email synchronisé depuis Gmail, avec classification et résumé IA.
-- ============================================================
create table if not exists emails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  gmail_message_id text not null,
  gmail_thread_id text,
  sender_email text not null,
  sender_name text,
  subject text,
  body_preview text,
  body_full text,
  received_at timestamptz not null,
  category text check (category in ('Prospect', 'Client', 'Support', 'Facture', 'Urgent', 'Autre')),
  priority text check (priority in ('haute', 'normale', 'basse')),
  summary text,
  status text not null default 'new' check (status in ('new', 'analyzing', 'draft_ready', 'replied', 'archived')),
  created_at timestamptz default now(),
  unique (user_id, gmail_message_id)
);

create index if not exists idx_emails_user_received on emails(user_id, received_at desc);
create index if not exists idx_emails_user_status on emails(user_id, status);

-- ============================================================
-- DRAFTS
-- Le brouillon généré par l'IA pour un email, et son contenu final
-- (potentiellement édité par l'utilisateur) une fois envoyé.
-- ============================================================
create table if not exists drafts (
  id uuid primary key default uuid_generate_v4(),
  email_id uuid not null references emails(id) on delete cascade,
  ai_generated_content text not null,
  final_content text,
  sent_at timestamptz,
  created_at timestamptz default now(),
  unique (email_id)
);

create index if not exists idx_drafts_email on drafts(email_id);
