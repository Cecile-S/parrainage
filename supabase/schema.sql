-- Schéma initial — App de parrainage / ambassadeurs multi-activités
-- (Capifrance immo / Moonee courtage & assurance)
--
-- À exécuter dans le SQL editor du projet Supabase (ou via `supabase db push`
-- si tu utilises la CLI Supabase avec ce dossier comme migrations).
--
-- Correspond au modèle de données de l'analyse comparative, section 8 :
-- Utilisateur, Activité, Programme, Parrainage, Consentement filleul,
-- Étape gamification, Récompense, Avis.

-- ============================================================
-- 1. Profils utilisateurs (étend auth.users géré par Supabase Auth)
-- ============================================================

create type user_role as enum ('ambassadeur', 'pro', 'admin');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  phone text,
  role user_role not null default 'ambassadeur',
  rgpd_consent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. Activités (une marque / ligne de métier par activité)
-- ============================================================

create table activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,                -- ex: "Capifrance", "Moonee"
  slug text not null unique,         -- ex: "capifrance", "moonee"
  branding jsonb not null default '{}',  -- couleurs, logo, ton éditorial
  created_at timestamptz not null default now()
);

-- Rattachement d'un utilisateur "pro" à une ou plusieurs activités
create table profile_activities (
  profile_id uuid not null references profiles (id) on delete cascade,
  activity_id uuid not null references activities (id) on delete cascade,
  primary key (profile_id, activity_id)
);

-- ============================================================
-- 3. Programmes (règles de récompense par activité)
-- ============================================================

create table programs (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities (id) on delete cascade,
  name text not null,
  reward_rules jsonb not null default '{}',  -- ex: { "cash_amount": 100, "currency": "EUR" }
  points_scale jsonb not null default '{}',  -- ex: { "sms": 5, "appel": 10, "cafe": 20 }
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. Parrainages
-- ============================================================

create type referral_status as enum (
  'en_attente',
  'consentement_obtenu',
  'en_cours',
  'conclu',
  'refuse'
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references profiles (id) on delete cascade,
  activity_id uuid not null references activities (id) on delete restrict,
  program_id uuid references programs (id) on delete set null,
  referee_name text not null,
  referee_email text,
  referee_phone text,
  status referral_status not null default 'en_attente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index referrals_referrer_id_idx on referrals (referrer_id);
create index referrals_activity_id_idx on referrals (activity_id);

-- ============================================================
-- 5. Consentement du filleul (obligatoire avant tout contact commercial —
--    loi n° 2025-594 du 11 août 2026, art. 13 : opt-in strict)
-- ============================================================

create type consent_channel as enum ('email', 'sms');

create table referee_consents (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals (id) on delete cascade,
  consented_at timestamptz,          -- null tant que le filleul n'a pas confirmé
  channel consent_channel not null,
  accepted_text text,                -- texte exact présenté et accepté
  proof jsonb not null default '{}', -- log brut : ip, user-agent, token, etc.
  created_at timestamptz not null default now()
);

create index referee_consents_referral_id_idx on referee_consents (referral_id);

-- ============================================================
-- 6. Étapes de gamification (les 9 actions du parcours, section 4)
-- ============================================================

create type gamification_action as enum (
  'en_parler',
  'sms',
  'appel',
  'email',
  'story',
  'conversation_a_3',
  'cafe',
  'dejeuner',
  'post_partage'
);

create type gamification_status as enum ('proposee', 'faite');

create table gamification_steps (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals (id) on delete cascade,
  action_type gamification_action not null,
  status gamification_status not null default 'proposee',
  points int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index gamification_steps_referral_id_idx on gamification_steps (referral_id);

-- ============================================================
-- 7. Récompenses
-- ============================================================

create type reward_type as enum ('cash', 'carte_cadeau', 'don');
create type payment_status as enum ('en_attente', 'paye', 'echoue');

create table rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals (id) on delete cascade,
  type reward_type not null,
  amount numeric(10, 2),
  payment_status payment_status not null default 'en_attente',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index rewards_referral_id_idx on rewards (referral_id);

-- ============================================================
-- 8. Avis collectés
-- ============================================================

create table reviews (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references profiles (id) on delete cascade,
  platform text not null,   -- 'google', 'trustpilot', 'pages_jaunes', ...
  status text not null default 'en_attente',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 9. Row Level Security
-- ============================================================
-- Politique de base pour ce squelette : chacun voit/gère ses propres données.
-- À affiner avant le MVP P0 pour le rôle "pro" (accès aux parrainages de son
-- activité uniquement) et "admin" (accès multi-activités) — voir README.

alter table profiles enable row level security;
alter table activities enable row level security;
alter table profile_activities enable row level security;
alter table programs enable row level security;
alter table referrals enable row level security;
alter table referee_consents enable row level security;
alter table gamification_steps enable row level security;
alter table rewards enable row level security;
alter table reviews enable row level security;

create policy "Un profil peut lire/modifier ses propres données"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Les activités sont lisibles par tout utilisateur connecté"
  on activities for select
  using (auth.role() = 'authenticated');

create policy "Les programmes sont lisibles par tout utilisateur connecté"
  on programs for select
  using (auth.role() = 'authenticated');

create policy "Un ambassadeur gère ses propres parrainages"
  on referrals for all
  using (auth.uid() = referrer_id)
  with check (auth.uid() = referrer_id);

create policy "Un ambassadeur voit les consentements de ses parrainages"
  on referee_consents for select
  using (
    exists (
      select 1 from referrals
      where referrals.id = referee_consents.referral_id
      and referrals.referrer_id = auth.uid()
    )
  );

create policy "Un ambassadeur voit les étapes de ses parrainages"
  on gamification_steps for all
  using (
    exists (
      select 1 from referrals
      where referrals.id = gamification_steps.referral_id
      and referrals.referrer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from referrals
      where referrals.id = gamification_steps.referral_id
      and referrals.referrer_id = auth.uid()
    )
  );

create policy "Un ambassadeur voit les récompenses de ses parrainages"
  on rewards for select
  using (
    exists (
      select 1 from referrals
      where referrals.id = rewards.referral_id
      and referrals.referrer_id = auth.uid()
    )
  );

create policy "Un ambassadeur gère ses propres avis"
  on reviews for all
  using (auth.uid() = ambassador_id)
  with check (auth.uid() = ambassador_id);

-- ============================================================
-- 10. Création automatique du profil à l'inscription
-- ============================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone)
  values (new.id, new.email, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
