# Infos Élus

Média web pour les élus de CSE — Next.js 16 (App Router) + Payload CMS 3 + PostgreSQL 17.
Contexte et conventions : `CLAUDE.md`. Spécifications : `cahier-des-charges.md`.

## Installation (première fois)

Prérequis : **Node 20+** (testé en 22), **npm**, **Docker** + plugin Compose, **Git** avec une
clé SSH autorisée sur l'organisation `studio-BoandCo`.

```bash
git clone git@github.com:studio-BoandCo/info-elus.git
cd info-elus
git checkout dev            # branche d'intégration

cp .env.example .env        # puis remplir les valeurs (voir ci-dessous)
docker compose up -d        # démarre PostgreSQL 17 sur le port hôte 5433
npm install                 # npm, pas pnpm : c'est package-lock.json qui fait foi
npm run generate:types      # régénère src/payload-types.ts
npm run dev                 # http://localhost:3000
```

### Variables d'environnement

`.env` n'est **pas** versionné : demande les valeurs à l'équipe, ou génère les tiennes.

| Variable                 | Rôle                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `DB_PASSWORD`            | mot de passe du conteneur PostgreSQL                                  |
| `DATABASE_URL`           | `postgres://infos_elus_user:<DB_PASSWORD>@localhost:5433/infos_elus`  |
| `PAYLOAD_SECRET`         | clé de signature des sessions (`openssl rand -hex 32`)                |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` en local                                      |

`DB_PASSWORD` est lu par `docker-compose.yml` au premier démarrage du conteneur : il doit
correspondre exactement au mot de passe présent dans `DATABASE_URL`. Si le volume a déjà été
créé avec un autre mot de passe, il faut le supprimer (`docker compose down -v`) pour le
réinitialiser.

### Premier lancement

1. Ouvrir `http://localhost:3000/admin` et créer le premier compte administrateur.
2. `npm run seed` pour charger le jeu de démonstration (guides, PDF générés). Le seed est
   rejouable : il remplace les documents existants au lieu d'empiler des doublons.

Les fichiers uploadés (`/media`) ne sont pas versionnés : chaque poste a son propre dossier.

## Commandes

| Commande                   | Effet                                                       |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev`              | serveur de développement (Turbopack)                         |
| `npm run devsafe`          | idem après suppression du cache `.next`                      |
| `npm run generate:types`   | régénère `src/payload-types.ts` après tout changement de collection |
| `npm run generate:importmap` | régénère la carte d'imports de l'admin après ajout d'un composant custom |
| `npm run seed`             | jeu de données de démonstration                              |
| `npm run test:int`         | tests d'intégration + unitaires (Vitest, base requise)       |
| `npm run test:e2e`         | tests end-to-end (Playwright)                                |
| `npm run lint`             | ESLint                                                       |
| `npx tsc --noEmit`         | vérification TypeScript                                      |

⚠️ `npm run test` échoue : le script appelle `pnpm`. Lancer `test:int` et `test:e2e` séparément.

Avant un premier `npm run test:e2e` : `npx playwright install`.

## Workflow Git

Branche d'intégration : `dev`. Une branche par lot de travail (`feature/<sujet>`), PR vers
`dev`, puis `dev` → `main`. Avant de pousser : `npm run generate:types`, `npx tsc --noEmit`,
`npm run lint`, `npm run test:int`.

## Dépannage

- **`ECONNREFUSED ... 5433`** : le conteneur n'est pas lancé → `docker compose up -d`, puis
  `docker compose ps` pour vérifier l'état `healthy`.
- **Port 5433 déjà utilisé** : un autre PostgreSQL tourne, l'arrêter ou changer le port hôte
  dans `docker-compose.yml` **et** dans `DATABASE_URL`.
- **Types Payload désynchronisés** : `npm run generate:types`.
- **Erreurs de peer deps à l'install** : `.npmrc` active déjà `legacy-peer-deps`, vérifier
  qu'il est bien présent.
- **Projet sur partition NTFS** : si une install npm semble incomplète, le signaler plutôt
  que de contourner.

---

# Documentation du template Payload (référence)

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URL` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URL` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URL` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/3.x/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
