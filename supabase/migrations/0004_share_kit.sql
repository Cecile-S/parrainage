-- Kit de partage réseaux sociaux pour les ambassadeurs
--
-- Inspiration : Boast (contenu prêt à partager pour aider les parrains à
-- recruter via les réseaux sociaux) — voir section 3 de l'analyse
-- comparative ("Kit de contenu prêt à partager").

create table share_templates (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities (id) on delete cascade,
  channel text not null,   -- 'linkedin', 'instagram_story', 'sms', 'whatsapp', 'email'
  label text not null,     -- 'Post LinkedIn', 'Story Instagram'...
  content text not null,   -- texte du template, {ambassadeur} et {activite} interpolés côté app
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index share_templates_activity_id_idx on share_templates (activity_id);

alter table share_templates enable row level security;

create policy "Les templates actifs sont lisibles par tout utilisateur connecté"
  on share_templates for select
  using (auth.role() = 'authenticated');

create policy "Un admin gère les templates de partage"
  on share_templates for all
  using (is_admin())
  with check (is_admin());

insert into share_templates (activity_id, channel, label, content)
select a.id, v.channel, v.label, v.content
from activities a
join (values
  ('capifrance', 'linkedin', 'Post LinkedIn',
   'Je suis ambassadeur/ambassadrice {activite} et j''accompagne des projets immobiliers. Vous vendez, achetez ou connaissez quelqu''un qui s''y met ? Parlons-en, je vous mets en relation avec {ambassadeur}.'),
  ('capifrance', 'instagram_story', 'Story Instagram',
   'Un projet immo en tête ? Je peux vous recommander {ambassadeur}, mon conseiller Capifrance de confiance. DM moi !'),
  ('capifrance', 'sms', 'SMS',
   'Salut ! Je pensais à toi pour ton projet immo — je te recommande {ambassadeur} (Capifrance), tu peux le/la contacter de ma part.'),
  ('moonee', 'linkedin', 'Post LinkedIn',
   'Besoin d''une assurance de prêt ou d''un courtage sur-mesure ? Je vous recommande {ambassadeur} chez Moonee — parlons-en.'),
  ('moonee', 'instagram_story', 'Story Instagram',
   'Un prêt ou une assurance à comparer ? Je te recommande {ambassadeur} chez Moonee, DM moi !')
) as v(activity_slug, channel, label, content) on v.activity_slug = a.slug
on conflict do nothing;
