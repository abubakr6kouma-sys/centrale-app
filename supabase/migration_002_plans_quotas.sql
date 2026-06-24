-- Migration 002 — Abonnements et quotas
-- À exécuter dans Supabase SQL Editor sur un projet où schema.sql (la V1)
-- a déjà été appliqué. Sans danger à rejouer plusieurs fois (idempotent).

alter table users
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  add column if not exists emails_analyzed_this_month integer not null default 0,
  add column if not exists drafts_generated_this_month integer not null default 0,
  add column if not exists usage_period_started_at timestamptz not null default now();

-- Incrémentation atomique (évite une race condition lecture-puis-écriture
-- si deux requêtes arrivent en même temps pour le même utilisateur).
create or replace function increment_email_usage(p_user_id uuid)
returns void as $$
begin
  update users set emails_analyzed_this_month = emails_analyzed_this_month + 1
  where id = p_user_id;
end;
$$ language plpgsql;

create or replace function increment_draft_usage(p_user_id uuid)
returns void as $$
begin
  update users set drafts_generated_this_month = drafts_generated_this_month + 1
  where id = p_user_id;
end;
$$ language plpgsql;
