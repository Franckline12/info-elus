# Infos Élus — contexte projet

Média web pour les élus de CSE (Comité Social et Économique) : articles juridiques,
actualité, guides, quiz, annuaire de prestataires, newsletter.
Cahier des charges complet : `docs/cahier-des-charges.md` — c'est la référence,
relis la section concernée avant chaque tâche.

## Stack (déjà installée, ne pas changer)

- Next.js 16 (App Router, Turbopack) + Payload CMS 3 intégré dans la même app
- PostgreSQL 17 dans Docker (`docker-compose.yml`, conteneur `infos-elus-db`, port hôte 5433)
- Variable de connexion : `DATABASE_URL` dans `.env` (ne jamais committer `.env`)
- TypeScript strict, `moduleResolution: bundler`
- Material UI (MUI) + Emotion pour le front public, intégré via `@mui/material-nextjs`
  (thème dans `src/theme/theme.ts`, jetons partagés dans `src/theme/tokens.ts`).
  Pas de Tailwind. Icônes : importées une par une depuis `@mui/icons-material/<Nom>`
- Admin Payload en français (`i18n` dans `payload.config.ts`)
- La skill Payload est installée dans le projet : consulte-la pour les conventions Payload

## Conventions

- Noms de champs, variables, fonctions et fichiers en anglais (`title`, `excerpt`,
  `publishedAt`). Les libellés visibles dans l'admin (`label`, `labels`,
  `admin.description`, options de select) restent en français : l'équipe
  éditoriale est francophone
- Chaque collection : `labels` singulier/pluriel en français, `admin.useAsTitle`, `admin.defaultColumns`
- Taxonomies dans `admin.group: 'Taxonomies'`, contenus dans `admin.group: 'Contenus'`
- Slugs générés automatiquement depuis le titre via un hook `beforeValidate` partagé
  (`src/hooks/formatSlug.ts`), modifiables manuellement, uniques et indexés
- Contenus publics : `access.read` public uniquement pour les documents publiés
- Après toute modification de collection : `npm run generate:types` puis `npx tsc --noEmit`
- Pages de contenu en SSG/ISR (SEO prioritaire), données lues via la Local API Payload
  (`getPayload`), jamais via fetch HTTP vers sa propre API
- Accessibilité : focus clavier visible, contraste AA, `alt` obligatoire sur les médias

## Identité visuelle (pas de maquette : se baser sur la section 5 du cahier des charges)

Variables CSS : --color-paper #F3F0E6, --color-paper-raised #FBFAF4, --color-ink #10152B,
--color-text-secondary #565C78, --color-blue-deep #12193B, --color-blue-mid #24356F,
--color-blue-bright #3E63E0, --color-blue-pale #E4E9FB, --color-accent-quiz #E3A23E.
Polices : Space Grotesk (titres + texte, en attendant Roc Grotesk), Source Serif 4 (chapôs, citations).
Style éditorial type journal : masthead, filets fins. PAS de cartes arrondies avec ombre.
L'ocre est réservé exclusivement à la section Jeux & Quiz.
Breakpoints : 900px (tablette, menu en accordéon) et 600px (mobile).

## Environnement

- Linux, projet sur une partition NTFS montée : si une install npm semble incomplète,
  le signaler plutôt que contourner
