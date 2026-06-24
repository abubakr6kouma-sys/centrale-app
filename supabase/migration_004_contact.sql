-- Migration 004 — Formulaire de contact / Support
-- À exécuter dans Supabase SQL Editor. Sans danger à rejouer (idempotent).
--
-- Stocke les messages envoyés depuis /contact, consultables depuis le
-- dashboard Supabase (Table Editor) en attendant un branchement d'envoi
-- d'email réel (voir le commentaire dans app/api/contact/route.ts).

create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  -- Nullable : un visiteur non connecté peut aussi utiliser le formulaire
  -- (page Contact accessible publiquement), pas seulement un utilisateur du dashboard.
  user_id uuid references users(id) on delete set null,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz default now()
);

create index if not exists idx_contact_messages_created_at on contact_messages(created_at desc);
