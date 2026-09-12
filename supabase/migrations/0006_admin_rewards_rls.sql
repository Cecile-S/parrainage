-- Permet à l'admin de gérer les parrainages (changer le statut) et les
-- récompenses (créer, marquer payé) — jusqu'ici lecture seule.

create policy "Un admin gère tous les parrainages"
  on referrals for all
  using (is_admin())
  with check (is_admin());

create policy "Un admin gère toutes les récompenses"
  on rewards for all
  using (is_admin())
  with check (is_admin());
