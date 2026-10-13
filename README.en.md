# Level Insouciant

[简体中文](./README.md)

Level Insouciant is a self-hosted small blog CMS built with Astro and PostgreSQL. It combines a responsive public blog with an administration console, making it suitable both as a deployable personal blog and as a foundation for custom content-driven sites.

Live demo: [blog.moeblue.top](https://blog.moeblue.top)

## Features

- Markdown/MDX articles with GFM, mathematics, syntax highlighting, and a table of contents.
- Drafts, categories, tags, full-text search, revision history, and cover management.
- Responsive home, archive, article, category, tag, search, and about pages.
- Generated Sitemap, RSS, robots.txt, and Open Graph images.
- User registration and sign-in, profiles, threaded comments, likes, and view statistics.
- Administration for articles, comments, tags, media, statistics, and site settings.
- Media storage on Alibaba Cloud OSS, Tencent Cloud COS, or Cloudflare R2.
- Docker Compose deployment with automatic Prisma migrations before the Web service starts.

## Technology

- Astro 7 SSR + Node adapter, React 19, and TypeScript
- Tailwind CSS 4, Radix UI, and Motion
- Tiptap, CodeMirror, and MDX
- PostgreSQL and Prisma 7
- Auth.js Core
- Vitest, Testing Library, and ESLint
- pnpm 11 and Docker Compose

## Quick start

You can deploy with Docker Compose or run a local development environment. Both paths require PostgreSQL.

### Local development

Local development requires Node.js 24, pnpm 11, and an accessible PostgreSQL database.

```bash
git clone https://github.com/Insouciant21/level-insouciant.git
cd level-insouciant
corepack enable
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

The development server runs at <http://localhost:4321> by default. Set `SITE_URL` to the URL you actually use during development.

## Environment variables

`.env.example` is a non-secret configuration template. `.env` is ignored by Git; never commit passwords, access keys, or sensitive production URL parameters.

### Application and authentication

| Variable                 | Required | Description                                                                                                                |
| ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | Yes      | PostgreSQL connection URL used by the application and, by default, migrations.                                             |
| `DIRECT_URL`             | No       | Direct migration URL for providers where the runtime URL uses a connection pooler.                                         |
| `SITE_URL`   | Yes      | Public site URL for SEO; restart after changing it. The legacy `NEXT_PUBLIC_SITE_URL` is also accepted. |
| `AUTH_SECRET`            | Yes      | Random secret used by Auth.js to protect sessions and tokens.                                                              |
| `ADMIN_EMAIL`            | Yes      | Bootstrap administrator email address.                                                                                     |
| `ADMIN_PASSWORD`         | Yes      | Bootstrap administrator password. The administrator is created on the first login with these credentials.                  |
| `DATABASE_HOST_OVERRIDE` | No       | Replaces the host in `DATABASE_URL` at container runtime; Compose sets it to `postgresql`.                                 |
| `DATABASE_NAME_OVERRIDE` | No       | Replaces the database name at container runtime; Compose sets it to `level-insouciant`.                                    |

`ADMIN_EMAIL` and `ADMIN_PASSWORD` only bootstrap the first administrator. If no user with that email exists, a login whose credentials match these variables creates the administrator. Changing the variables later does not change the password already stored in the database; manage the existing account from the administration console.

### Media storage

Set `MEDIA_STORAGE_PROVIDER` to `oss`, `cos`, or `r2`, then configure the corresponding variables. The blog and article editor remain usable without media storage, but image uploads fail with a configuration message.

| Provider          | Variables                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Alibaba Cloud OSS | `OSS_REGION`, `OSS_BUCKET`, `OSS_ACCESS_KEY_ID`, `OSS_ACCESS_KEY_SECRET`, and `OSS_PUBLIC_BASE_URL`; `OSS_ENDPOINT` is optional. |
| Tencent Cloud COS | `COS_REGION`, `COS_BUCKET`, `COS_SECRET_ID`, `COS_SECRET_KEY`, and `COS_PUBLIC_BASE_URL`.                                        |
| Cloudflare R2     | `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_PUBLIC_BASE_URL`; `R2_ENDPOINT` is optional.   |

Each `*_PUBLIC_BASE_URL` must point to a domain from which uploaded objects can be read publicly. A trailing slash is optional.

## Bootstrap administrator

After applying migrations, open `/admin/login` and sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `.env`. The application creates the `ADMIN` user after the first successful credential check. Change the password from the account page after the initial login, and rotate the bootstrap password in the deployment environment to avoid accidental reuse.

Regular users can register at `/register`. The bootstrap administrator email is reserved and cannot be claimed through regular registration.

## Importing articles

Articles can be created and edited in the administration console. A bulk import script is also available. It reads `content/article-seeds/` first, falls back to `content/articles/`, and creates or updates articles by `slug`:

```bash
pnpm articles:import
```

Each `.mdx` file must contain the following frontmatter:

```mdx
---
title: Example article
desc: A short article summary
date: 2026-08-05
tags:
  - Astro
category: Engineering
cover: ""
draft: true
slug: example-post
---

Article body.
```

`content/` is ignored by Git by default and is suitable for local import sources. Published article data is stored in PostgreSQL.

## Commands

| Command                           | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `pnpm dev`                        | Start the development server.            |
| `pnpm build`                      | Create a production build.               |
| `pnpm start`                      | Start the local production server.       |
| `pnpm test`                       | Run the Vitest suite.                    |
| `pnpm lint`                       | Run ESLint.                              |
| `pnpm typecheck`                  | Run the TypeScript type checker.         |
| `pnpm prisma generate`            | Generate Prisma Client.                  |
| `pnpm prisma migrate dev`         | Create and apply development migrations. |
| `pnpm prisma studio`              | Open Prisma Studio.                      |
| `pnpm articles:import`            | Import articles from local MDX files.    |
| `docker compose run --rm migrate` | Reapply committed migrations in Docker.  |

## Project structure

```text
src/
├── pages/        Astro SSR pages, API endpoints, and metadata routes
├── layouts/      HTML document, SEO, and assets
├── views/        React page views and interactive islands
├── server/       Server loaders, operations, and HTTP handlers
├── actions/      Astro Actions form entrypoints
├── components/   Blog, administration, and shared UI components
├── config/       Site-level constants
├── hooks/        Shared React Hooks
├── lib/          Authentication, content, database, media, and SEO logic
├── styles/       Styling helpers
└── types/        Shared TypeScript types
prisma/           Data model and versioned migrations
scripts/          Content import and maintenance scripts
docker/           Container entrypoint and database URL utilities
public/           Static assets
content/          Local article import sources (ignored by Git by default)
```

## Data and upgrades

- PostgreSQL is the persistent source of truth for articles, users, comments, engagement, site settings, and media metadata.
- Object storage contains uploaded media; PostgreSQL stores its metadata and public URLs.
- Back up both PostgreSQL and object storage before production upgrades.
- `docker compose up --build -d` runs `prisma migrate deploy` before starting the Web service. The Web service stays stopped if migrations fail.
- If the database container name, network, or database name changes, update the network and override values in `compose.yaml`.