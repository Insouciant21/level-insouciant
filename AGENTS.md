# AGENTS.md

## Project assumptions
- This is a pnpm-based Next.js project.
- Prefer existing patterns and conventions already present in the repo.
- If a task is ambiguous, inspect nearby similar implementations before proposing new patterns.
- This is NOT the Next.js you know：This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
- This project is managed by pnpm.

## Project Structure
- `src/` main application source
  - `src/app/` Next.js App Router entries (pages, layouts, route handlers, metadata routes)
  - `src/components/` reusable UI and feature components (`blog`, `admin`, `ui`, motion, layout)
  - `src/lib/` domain/business logic and shared server/client utilities (auth, content, prisma access, SEO, helpers)
  - `src/hooks/` shared React hooks
  - `src/config/` site-level configuration and constants
  - `src/styles/` style modules and cross-page styling helpers
  - `src/types/` shared TypeScript type declarations
- `content/` content source files
  - `content/posts/` published blog posts (MD/MDX)
  - `content/article-seeds/` seed/import article sources used by content workflows
- `prisma/` database layer
  - `prisma/schema.prisma` Prisma schema definition
  - `prisma/migrations/` versioned database migrations
- `scripts/` project maintenance/import scripts (for example article import)
- `public/` static assets served directly by Next.js
- `docs/` internal project documentation
- `ui_sample/` standalone UI playground/sample app used for design exploration and references

## Working style
- For feature work touching more than 3 files, start by proposing a plan.
- Prefer minimal, high-confidence diffs over broad refactors.
- Reuse existing utilities, hooks, components, and service patterns when possible.
- Do not introduce new dependencies unless necessary and explicitly justified.

## Environment
- Ubuntu 25.01 in WSL2

## Run
- `pnpm run dev` to run as debug

## Validation
- After code changes, run the relevant checks:
  - `pnpm lint`
  - `pnpm typecheck`
- If one check fails, explain the likely cause before making another edit.

## Output expectations
- Summarize changed files
- Explain the implementation approach briefly
- List residual risks or follow-up work