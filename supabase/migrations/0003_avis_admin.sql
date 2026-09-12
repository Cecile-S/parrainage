-- Système de demande d'avis multi-plateformes (pondéré) + back-office admin
--
-- Inspiration : Yuccan (collecte d'avis multi-plateformes + redirection),
-- Ambassador.com (multi-programme unifié parrainage + avis), LoyaltyLion /
-- BrandChamp (missions à points). Voir section 2 de l'analyse comparative.

-- ============================================================
-- 1. Rôle admin : fonction utilitaire pour les policies RLS
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- 2. Plateformes d'avis (par activité, extensible, pondérées)
-- ============================================================

create table review_platforms (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities (id) on delete cascade,
  name text not null,              -- 'Google', 'Immodvisor', 'Trustpilot'...
  url text not null,               -- lien direct vers la page de dépôt d'avis
  weight int not null default 1 check (weight > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index review_platforms_activity_id_idx on review_platforms (activity_id);

alter table review_platforms enable row level security;

create policy "Les plateformes actives sont lisibles par tout utilisateur connecté"
  on review_platforms for select
  using (auth.role() = 'authenticated');

create policy "Un admin gère les plateformes d'avis"
  on review_platforms for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 3. Table "avis" : on complète la table existante plutôt que d'en
--    créer une nouvelle (elle ne contenait qu'un stub jusqu'ici)
-- ============================================================

alter table reviews add column if not exists activity_id uuid references activities (id) on delete cascade;
alter table reviews add column if not exists platform_id uuid references review_platforms (id) on delete set null;
alter table reviews add column if not exists confirmed_at timestamptz;

create index if not exists reviews_activity_id_idx on reviews (activity_id);
create index if not exists reviews_platform_id_idx on reviews (platform_id);

-- ============================================================
-- 4. Policies admin (accès complet multi-activités) sur les tables
--    existantes, en plus des policies "chacun voit les siennes" déjà
--    en place pour le rôle ambassadeur.
-- ============================================================

create policy "Un admin gère toutes les activités"
  on activities for all
  using (is_admin())
  with check (is_admin());

create policy "Un admin gère tous les programmes"
  on programs for all
  using (is_admin())
  with check (is_admin());

create policy "Un admin voit tous les parrainages"
  on referrals for select
  using (is_admin());

create policy "Un admin voit tous les consentements"
  on referee_consents for select
  using (is_admin());

create policy "Un admin voit toutes les récompenses"
  on rewards for select
  using (is_admin());

create policy "Un admin voit tous les avis"
  on reviews for select
  using (is_admin());

create policy "Un admin voit tous les profils"
  on profiles for select
  using (is_admin());

-- ============================================================
-- 5. Amorçage : plateformes d'avis par activité + rôle admin
-- ============================================================

insert into review_platforms (activity_id, name, url, weight)
select a.id, v.name, v.url, v.weight
from activities a
join (values
  ('capifrance', 'Google', 'https://g.page/r/REMPLACER-PAR-TON-LIEN-GOOGLE/review', 5),
  ('capifrance', 'Immodvisor', 'https://www.immodvisor.com/avis-deposer', 3),
  ('moonee', 'Google', 'https://g.page/r/REMPLACER-PAR-TON-LIEN-GOOGLE/review', 5)
) as v(activity_slug, name, url, weight) on v.activity_slug = a.slug
on conflict do nothing;

update profiles set role = 'admin' where email = 'cecile@cecilesow.fr';
