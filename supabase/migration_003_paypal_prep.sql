-- Migration 003 — Préparation paiements (PayPal + carte bancaire)
-- À exécuter dans Supabase SQL Editor sur un projet où migration_002 a déjà
-- été appliquée. Sans danger à rejouer plusieurs fois (idempotent).
--
-- Colonnes génériques (subscription_status, subscription_method) plutôt que
-- spécifiques à un seul fournisseur : CentralY prévoit deux moyens de
-- paiement (PayPal et carte bancaire, voir lib/payments/), partageant le
-- même statut et la même date de renouvellement. Seul l'identifiant
-- d'abonnement a une colonne par fournisseur, car leurs formats d'id sont
-- incompatibles entre eux (PayPal: "I-XXXXXXXX", carte: dépend du processeur
-- choisi plus tard).
--
-- Ces colonnes ne sont pas encore utilisées par aucune route API tant que ni
-- PayPal ni un processeur de carte n'est configuré (voir isConfigured() dans
-- lib/payments/paypal.ts et lib/payments/cardPayments.ts) : elles préparent
-- le terrain pour éviter une migration en urgence au moment du branchement.

alter table users
  -- Identifiant de l'abonnement côté PayPal (ex: "I-BW452GLLEP1G").
  add column if not exists paypal_subscription_id text unique,
  -- Identifiant de l'abonnement côté processeur de carte (format dépendant
  -- du processeur choisi plus tard — Stripe, PayPal Advanced Card Processing...).
  add column if not exists card_subscription_id text unique,
  -- Quel fournisseur a créé l'abonnement actif, pour savoir vers quel
  -- module de lib/payments/ router une action (annulation, etc.).
  add column if not exists subscription_method text
    check (subscription_method in ('paypal', 'card')),
  -- Statut renvoyé par le fournisseur (webhook) — source de vérité unique,
  -- jamais déduit autrement.
  add column if not exists subscription_status text
    check (subscription_status in ('active', 'suspended', 'cancelled', 'expired')),
  add column if not exists subscription_renews_at timestamptz;

-- Recherche rapide par identifiant d'abonnement depuis un webhook (le
-- fournisseur envoie l'id de l'abonnement, pas l'email ni l'id interne).
create index if not exists idx_users_paypal_subscription_id
  on users(paypal_subscription_id)
  where paypal_subscription_id is not null;

create index if not exists idx_users_card_subscription_id
  on users(card_subscription_id)
  where card_subscription_id is not null;
