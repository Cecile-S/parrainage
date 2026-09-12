# Parrainage — app ambassadeurs multi-activités

Squelette d'architecture pour l'app de parrainage/ambassadeurs (Capifrance
immo, Moonee courtage & assurance), basé sur l'analyse comparative des
plateformes existantes (Yuccan, Boast, JeudiMerci, Linkupp + références US).

## Stack (gratuite pour démarrer)

- **Next.js** (App Router, TypeScript, Tailwind) — open source, gratuit.
- **Supabase** — Postgres + Auth (lien magique) + Storage. Le [plan gratuit](https://supabase.com/pricing)
  suffit largement pour un MVP (500 Mo de base de données, 50 000 utilisateurs
  actifs/mois sur l'auth, 1 Go de stockage). Tu ne paies que si le projet
  grossit vraiment.
- **PWA** installable (manifest.json), sans passage par les stores.

Aucun coût fixe à ce stade : hébergement du front sur Vercel (plan gratuit)
+ Supabase (plan gratuit) = 0 €/mois pour développer et tester.

## Mise en route

1. Crée un projet sur [supabase.com](https://supabase.com/dashboard) (gratuit).
2. Dans le SQL editor du projet, exécute le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) — il crée toutes les tables,
   les policies RLS et le trigger de création de profil.
3. Copie `.env.local.example` vers `.env.local` et renseigne les clés
   (Project Settings → API dans le dashboard Supabase).
4. Lance le serveur de développement :

   ```bash
   npm run dev
   ```

5. Va sur [http://localhost:3000](http://localhost:3000) — tu es redirigé
   vers `/login`, entre un email, le lien magique arrive dans la boîte mail
   associée au projet Supabase (en dev, Supabase utilise son propre service
   mail, limité en volume — un provider mail dédié sera à configurer avant
   la prod, dans Project Settings → Auth → SMTP).

## Ce que contient ce squelette

- **Auth par lien magique** (`src/app/login`, `src/app/auth/callback`) —
  aucun mot de passe, session gérée via cookies (`src/lib/supabase`,
  `src/middleware.ts`).
- **Modèle de données complet** (`supabase/schema.sql`) : profils, activités,
  programmes, parrainages, consentements filleul, étapes de gamification,
  récompenses, avis — voir section 8 de l'analyse.
- **Back-office multi-activités** (`src/app/(app)`) : layout protégé avec
  liste des activités de l'utilisateur, tableau de bord listant ses
  parrainages.
- **Espace RGPD** (`src/app/(app)/mes-donnees`) : page stub pour
  export/suppression des données (à implémenter en P0).
- **PWA** : `public/manifest.json` référencé dans le layout racine. Il manque
  encore les icônes (`public/icons/icon-192.png`, `icon-512.png`) — à générer
  avant la mise en prod.

## Ce qui n'est volontairement PAS encore fait

Ce squelette pose l'architecture ; le développement fonctionnel reste à
faire, dans l'ordre de priorité de l'analyse :

**P0**
- Formulaire de déclaration d'un filleul par l'ambassadeur
- Flux de double opt-in du filleul (case à cocher horodatée ou lien de
  confirmation envoyé directement au filleul) — **obligatoire avant tout
  contact commercial**, voir section 5 de l'analyse (loi n° 2025-594 du
  11 août 2026)
- Paiement/récompense (au moins un mode : cash ou carte-cadeau)
- Export et suppression réels des données personnelles

**P1**
- Parcours de gamification en étapes (les 9 actions, section 4)
- Collecte d'avis multi-plateformes
- Relances automatiques des ambassadeurs inactifs

**P2**
- Widget de preuve sociale pour site web
- Système de points/paliers avancé
- Génération automatique de visuels (kits réseaux sociaux)
- Dons à association comme récompense alternative

## Points d'attention RGPD / conformité (déjà dans le schéma, à câbler)

- `referee_consents` stocke la preuve du consentement (date, canal, texte
  accepté) — mais **aucun flux ne l'alimente encore**. Tant que ce flux
  n'existe pas, ne pas déclencher de contact commercial vers un filleul
  depuis cette app.
- Les policies RLS actuelles sont volontairement simples ("chacun voit ses
  propres données"). Avant le MVP P0, il faudra ajouter des policies pour le
  rôle `pro` (accès aux parrainages de son activité uniquement) et `admin`.

## Déploiement

Le plus simple : [Vercel](https://vercel.com) (plan gratuit), en connectant
ce dossier une fois poussé sur GitHub. Dis-moi quand tu veux le mettre sur
GitHub, je peux préparer le repo.
