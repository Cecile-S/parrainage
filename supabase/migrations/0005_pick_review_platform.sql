-- Algorithme d'équilibrage des demandes d'avis entre plateformes
--
-- Chaque plateforme a un poids (review_platforms.weight) reflétant son
-- importance relative. À chaque nouvelle demande, on choisit la plateforme
-- dont la part réelle des avis est la plus en retard par rapport à sa part
-- cible (déficit pondéré) — un "smooth weighted round-robin" classique.
-- Tourne en security definer car un ambassadeur n'a normalement pas accès
-- aux avis des autres (RLS) : seule la décision finale (un platform_id)
-- est exposée, jamais les comptages bruts des autres ambassadeurs.

create or replace function public.pick_review_platform(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_weight numeric;
  v_total_count numeric;
  v_platform_id uuid;
begin
  select coalesce(sum(weight), 0) into v_total_weight
  from review_platforms
  where activity_id = p_activity_id and active;

  if v_total_weight = 0 then
    return null;
  end if;

  select count(*) into v_total_count
  from reviews
  where activity_id = p_activity_id;

  select rp.id into v_platform_id
  from review_platforms rp
  left join (
    select platform_id, count(*) as cnt
    from reviews
    where activity_id = p_activity_id
    group by platform_id
  ) c on c.platform_id = rp.id
  where rp.activity_id = p_activity_id and rp.active
  order by
    (rp.weight::numeric / v_total_weight) - (coalesce(c.cnt, 0)::numeric / (v_total_count + 1)) desc,
    rp.weight desc
  limit 1;

  return v_platform_id;
end;
$$;

grant execute on function public.pick_review_platform(uuid) to authenticated;
