# Parrainage — app ambassadeurs multi-activités

App de parrainage/ambassadeurs (Capifrance immo, Moonee courtage &
assurance), basée sur l'analyse comparative des plateformes existantes
(Yuccan, Boast, JeudiMerci, Linkupp + références US).

**En ligne :** https://piringa.cecilesow.fr

## Stack

- **Next.js** (App Router, TypeScript, Tailwind).
- **Supabase** — Postgres + Auth (connexion par code à 6 chiffres) + RLS.
- **PWA** installable (manifest.json).
- **Déploiement** : Docker sur le VPS Contabo de production, derrière Nginx
  (reverse proxy + certificat Let's Encrypt), aux côtés des autres services
  déjà hébergés là (Odoo, n8n, etc.) — voir section Déploiement plus bas.
- **Emails transactionnels (Auth)** : SMTP custom via la boîte
  `parrainage@cecilesow.fr` (hébergement O2switch), configuré dans Supabase
  Project Settings → Auth → SMTP. Remplace le service mail interne de
  Supabase, trop limité en volume pour un usage réel.

## Mise en route (développement local)

1. Copie `.env.local.example` vers `.env.local` et renseigne les clés
   (Project Settings → API dans le dashboard Supabase).
2. Lance le serveur de développement :

   ```bash
   npm run dev
   ```

3. Va sur [http://localhost:3000](http://localhost:3000) — tu es redirigé
   vers `/login`, entre un email, tu reçois un code à 6 chiffres par email
   (via `parrainage@cecilesow.fr`).

Le schéma de base (`supabase/schema.sql`) et les migrations
(`supabase/migrations/`) sont déjà appliqués sur le projet Supabase de
production — à exécuter uniquement sur un nouveau projet Supabase.

## Ce que contient l'app aujourd'hui

- **Auth par code à 6 chiffres** (`src/app/login`) — aucun mot de passe,
  session gérée via cookies. Un code plutôt qu'un lien cliquable : les liens
  se sont révélés invalidés par des scanners de sécurité email avant que
  l'utilisateur ne clique dessus.
- **Modèle de données complet** (`supabase/schema.sql`) : profils, activités,
  programmes, parrainages, consentements filleul, étapes de gamification,
  récompenses, avis.
- **Back-office multi-activités** (`src/app/(app)`) : layout protégé,
  tableau de bord listant les parrainages de l'ambassadeur.
- **Déclaration de filleul + consentement (P0)** :
  - `src/app/(app)/dashboard` : formulaire de déclaration d'un filleul
    (nom, email/téléphone, activité) → génère un lien de consentement à
    usage unique à partager au filleul.
  - `src/app/consentement/[id]` : page publique (non authentifiée) où le
    filleul confirme son accord — horodaté, texte exact enregistré, preuve
    (IP, user-agent) — via deux fonctions SQL `security definer`
    (`get_referral_for_consent`, `confirm_referee_consent`) qui exposent
    uniquement cette ligne précise, sans ouvrir l'accès public au reste de
    la table.
- **Espace RGPD** (`src/app/(app)/mes-donnees`) : page stub pour
  export/suppression des données (reste à implémenter).
- **PWA** : `public/manifest.json` référencé dans le layout racine. Il manque
  encore les icônes (`public/icons/icon-192.png`, `icon-512.png`).
- **Demande d'avis multi-plateformes, pondérée** (inspiré de Yuccan) :
  - `review_platforms` : plateformes d'avis extensibles par activité
    (Google, Immodvisor... ajoutables sans toucher au code), chacune avec un
    poids configurable.
  - `pick_review_platform()` (SQL, `security definer`) : à chaque demande,
    choisit la plateforme dont la part réelle est la plus en retard sur sa
    part cible (déficit pondéré, "smooth weighted round-robin") — vérifié
    par simulation : poids 5/3 → répartition exacte 10/6 sur 16 demandes.
  - Le tableau de bord ambassadeur propose "Laisser un avis", affiche la
    plateforme choisie + lien direct, et un bouton d'auto-confirmation (pas
    d'API pour vérifier automatiquement qu'un avis a été posté).
- **Kit de partage réseaux sociaux** (inspiré de Boast, `share_templates`) :
  messages prêts à personnaliser par canal (LinkedIn, story Instagram,
  SMS...) pour aider l'ambassadeur à recruter des filleuls sur les réseaux
  sociaux, affichés sur le tableau de bord avec bouton copier.
- **Back-office admin** (`src/app/admin`, rôle `admin` uniquement) :
  - Vue d'ensemble (compteurs tous activités confondues)
  - Gestion des activités, des programmes (récompense par activité,
    multi-programme — plusieurs programmes possibles par activité)
  - Gestion des plateformes d'avis et de leurs poids (avec % de répartition
    affiché en direct)
  - Gestion du kit de partage
  - Suivi complet : tous les parrainages et tous les avis, toutes
    activités et tous ambassadeurs confondus
  - Ton compte (`cecile@cecilesow.fr`) a le rôle `admin`.

## Ce qui n'est volontairement PAS encore fait

**P0 — reste à faire**
- Envoi automatique du lien de consentement par email/SMS au filleul
  (aujourd'hui l'ambassadeur doit le copier-coller lui-même) — nécessite un
  SMTP applicatif séparé de celui de Supabase Auth
- Paiement/récompense (au moins un mode : cash ou carte-cadeau) — le montant
  est configurable côté admin (`programs.reward_rules`), et son suivi
  (créer/marquer payée) se fait désormais depuis le kanban `/admin/parrainages`
  — mais aucun paiement n'est réellement déclenché (pas d'intégration
  bancaire/Stripe)
- Policies RLS pour le rôle `pro` (accès aux parrainages de sa propre
  activité uniquement, sans être admin multi-activités) — pas encore créées

**P1**
- **Synchro Notion → Piringa pour le statut du lead** (direction précisée
  par Cécile le 12/09/2026) : Notion (pages "Études" Capifrance/Moonee,
  propriétés "Etat Capifrance"/"Etat Moonee") doit être la source de
  vérité du statut d'un lead — une mise à jour dans Notion doit se
  répercuter sur `referrals.status` dans Piringa, pas l'inverse. Nécessite :
  1. un moyen fiable de relier une page Notion "Études" à un `referrals.id`
     (aujourd'hui aucune correspondance n'existe — matching par nom/email à
     concevoir, ou ajouter un champ "id Piringa" côté Notion)
  2. un workflow n8n (Notion Trigger → appel à une fonction Supabase qui
     met à jour `referrals.status`) — n8n a déjà des credentials Notion
     configurés sur cette instance, réutilisables
  3. les credentials Supabase du workflow n8n (à configurer par Cécile
     directement dans n8n, je ne dois pas les manipuler)
- Parcours de gamification en étapes (les 9 actions, section 4 de l'analyse)
- Relances automatiques des ambassadeurs inactifs (relance manuelle en un
  clic déjà en place sur `/admin/avis`)
- Vérification automatique qu'un avis a bien été posté (nécessiterait les
  API Google Business Profile / Immodvisor, payantes ou à négocier — liée
  au point Notion ci-dessus)
- Nom affiché de l'ambassadeur (aujourd'hui dérivé de l'email dans le kit de
  partage, faute d'un champ "nom" sur le profil)

**P2**
- Widget de preuve sociale pour site web
- Système de points/paliers avancé
- Génération automatique de visuels (au-delà du texte du kit de partage)
- Dons à association comme récompense alternative

## ⚠️ À faire avant usage réel

Les liens Google seedés dans `review_platforms` sont des **placeholders**
(`REMPLACER-PAR-TON-LIEN-GOOGLE`) — à remplacer par tes vrais liens depuis
`/admin/plateformes-avis` avant de proposer "Laisser un avis" à un vrai
ambassadeur (le lien Google d'avis direct se trouve dans Google Business
Profile → Demander des avis → copier le lien).

## Point d'attention RGPD / conformité

Le flux de consentement (section 5 de l'analyse, loi n° 2025-594 du
11 août 2026) est désormais fonctionnel : aucun filleul n'est déclaré
"consentement obtenu" sans être passé par la case à cocher horodatée sur
`/consentement/[id]`. Ne jamais déclencher de contact commercial vers un
filleul dont `referrals.status` n'est pas `consentement_obtenu`.

## Déploiement (production)

- **Serveur** : VPS Contabo (`84.247.161.15`), Ubuntu 24.04, accès SSH via
  clé dédiée (`~/.ssh/contabo_parrainage`).
- **Conteneur** : `docker-compose.yml` à la racine — build multi-stage
  (`Dockerfile`, sortie Next.js `standalone`), exposé uniquement sur
  `127.0.0.1:3010`.
- **Reverse proxy** : Nginx, config dédiée dans
  `/etc/nginx/sites-available/piringa.cecilesow.fr` sur le serveur (pas
  versionnée dans ce repo), certificat Let's Encrypt auto-renouvelé.
  `proxy_buffer_size`/`proxy_buffers` relevés à 32k (défaut Nginx trop
  petit pour les en-têtes de session Supabase → 502 "upstream sent too big
  header" constaté et corrigé le 12/09/2026).
- **Mettre à jour la prod** après un push sur `main` :

  ```bash
  ssh -i ~/.ssh/contabo_parrainage root@84.247.161.15
  cd /root/parrainage-app && git pull origin main && docker compose up -d --build
  ```

- Le fichier `.env` de production (clés Supabase, URL du site) vit
  uniquement sur le serveur, dans `/root/parrainage-app/.env` — jamais
  commité.
