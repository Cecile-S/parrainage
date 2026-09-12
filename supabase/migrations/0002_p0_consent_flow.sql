-- P0 : formulaire de déclaration d'un filleul + flux de consentement
--
-- À exécuter dans le SQL editor Supabase après supabase/schema.sql.

-- ============================================================
-- 1. Activités de départ
-- ============================================================

insert into activities (name, slug)
values ('Capifrance', 'capifrance'), ('Moonee', 'moonee')
on conflict (slug) do nothing;

-- ============================================================
-- 2. L'ambassadeur peut créer le consentement en attente de son filleul
-- ============================================================

create policy "Un ambassadeur crée le consentement de ses parrainages"
  on referee_consents for insert
  with check (
    exists (
      select 1 from referrals
      where referrals.id = referee_consents.referral_id
      and referrals.referrer_id = auth.uid()
    )
  );

-- ============================================================
-- 3. Fonctions publiques restreintes pour la page de consentement
--    (le filleul n'est pas authentifié ; l'id du parrainage, un UUID
--    non devinable, fait office de jeton d'accès à cette seule ligne)
-- ============================================================

create or replace function public.get_referral_for_consent(p_referral_id uuid)
returns table (referee_name text, already_consented boolean)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
    select r.referee_name, (rc.consented_at is not null) as already_consented
    from referrals r
    left join referee_consents rc on rc.referral_id = r.id
    where r.id = p_referral_id;
end;
$$;

create or replace function public.confirm_referee_consent(
  p_referral_id uuid,
  p_channel consent_channel,
  p_accepted_text text,
  p_proof jsonb
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_updated int;
begin
  update referee_consents
  set consented_at = now(), channel = p_channel, accepted_text = p_accepted_text, proof = p_proof
  where referral_id = p_referral_id and consented_at is null;

  get diagnostics v_updated = row_count;

  if v_updated > 0 then
    update referrals set status = 'consentement_obtenu', updated_at = now()
    where id = p_referral_id;
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.get_referral_for_consent(uuid) to anon, authenticated;
grant execute on function public.confirm_referee_consent(uuid, consent_channel, text, jsonb) to anon, authenticated;

-- ============================================================
-- 4. Rattrapage : comptes auth.users créés avant l'existence du
--    trigger on_auth_user_created (ex: comptes de test antérieurs
--    au déploiement du schéma) — sans ça, ils n'ont pas de profil
--    et ne peuvent pas déclarer de parrainage.
-- ============================================================

insert into public.profiles (id, email, phone)
select u.id, u.email, u.phone
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
