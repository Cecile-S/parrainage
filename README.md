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

## Ce qui n'est volontairement PAS encore fait

**P0 — reste à faire**
- Envoi automatique du lien de consentement par email/SMS au filleul
  (aujourd'hui l'ambassadeur doit le copier-coller lui-même) — nécessite un
  SMTP applicatif séparé de celui de Supabase Auth
- Paiement/récompense (au moins un mode : cash ou carte-cadeau)
- Export et suppression réels des données personnelles (RGPD)
- Policies RLS plus fines pour les rôles `pro` (accès aux parrainages de son
  activité) et `admin` (multi-activités) — actuellement seul le rôle
  `ambassadeur` a des policies

**P1**
- Parcours de gamification en étapes (les 9 actions, section 4 de l'analyse)
- Collecte d'avis multi-plateformes
- Relances automatiques des ambassadeurs inactifs

**P2**
- Widget de preuve sociale pour site web
- Système de points/paliers avancé
- Génération automatique de visuels (kits réseaux sociaux)
- Dons à association comme récompense alternative

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
- **Mettre à jour la prod** après un push sur `main` :

  ```bash
  ssh -i ~/.ssh/contabo_parrainage root@84.247.161.15
  cd /root/parrainage-app && git pull origin main && docker compose up -d --build
  ```

- Le fichier `.env` de production (clés Supabase, URL du site) vit
  uniquement sur le serveur, dans `/root/parrainage-app/.env` — jamais
  commité.
