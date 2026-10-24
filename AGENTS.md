# AGENTS.md

## Project assumptions
- This is a pnpm-based Astro 7 SSR project with React islands (not Next.js).
- Prefer existing patterns and conventions already present in the repo.
- If a task is ambiguous, inspect nearby similar implementations before proposing new patterns.
- This is NOT the Astro you know：Astro 7 APIs and conventions may differ from older versions in your training data. Verify against the installed `node_modules/astro` types or the official Astro docs before writing code.
- This project is managed by pnpm.

## Project Structure
- `src/` main application source
  - `src/pages/` Astro SSR pages (`.astro`), API route handlers (`.ts` under `api/`), and metadata routes (rss.xml, sitemap.xml, robots.txt, opengraph-image)
  - `src/layouts/` HTML layout (`BaseLayout.astro`: SEO meta, site config, admin/public shell switch)
  - `src/views/` React page views rendered as islands by the `.astro` routes
  - `src/server/` server-side page data loaders (`server/pages/`, one per route), Astro Actions implementations (`server/actions/`), endpoints, public page cache, request context
  - `src/actions/` Astro Actions entry (`index.ts`)
  - `src/middleware.ts` origin check, request-scoped storage, public page cache integration
  - `src/auth.ts` Auth.js Core handler config
  - `src/components/` reusable UI and feature components (`blog`, `admin`, `account`, `ui`, motion, providers)
  - `src/lib/` domain/business logic and shared server/client utilities (auth, content, prisma access, media, validation, SEO, MDX, helpers)
  - `src/styles/` style modules and cross-page styling helpers
  - `src/types/` shared TypeScript type declarations
- `content/` optional local article import sources (`article-seeds/` preferred, `articles/` fallback); git-ignored and not required to exist
- `prisma/` database layer
  - `prisma/schema.prisma` Prisma schema definition
  - `prisma/migrations/` versioned database migrations
- `scripts/` project maintenance/import scripts (for example article import)
- `public/` static assets served directly by Astro
- `docker/` container entrypoint and database URL normalization
- `docs/` internal project documentation

## Working style
- For feature work touching more than 3 files, start by proposing a plan.
- Prefer minimal, high-confidence diffs over broad refactors.
- Reuse existing utilities, hooks, components, and service patterns when possible.
- Do not introduce new dependencies unless necessary and explicitly justified.
- If you are uncertain about something (requirement), you should ask instead of assuming.
- Test your solutions before implementing it.
- If there are uncommitted changes before your response, commit them with your commit message.

## Environment
- Ubuntu 25.01 in WSL2

## Run
- `pnpm dev` to run as debug (Astro dev server on http://localhost:4321, bound to 0.0.0.0)

## Clean
- After code changes, you should check whether there are codes no more functions and clear them.

## Validation
- After clean, run the relevant checks:
  - `pnpm lint`
  - `pnpm typecheck`
- If one check fails, explain the likely cause before making another edit.

## Output expectations
- Summarize changed files
- Explain the implementation approach briefly
- List residual risks or follow-up work
