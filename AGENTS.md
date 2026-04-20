# AGENTS.md

## Project assumptions
- This is a pnpm-based Next.js project.
- Prefer existing patterns and conventions already present in the repo.
- If a task is ambiguous, inspect nearby similar implementations before proposing new patterns.
- This is NOT the Next.js you know：This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
- This project is managed by pnpm.

## Project Structure
- `src` project source code dir
- `content` blog original article dir
- `docs` project docs dir

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
  - `pnpm test`
  - `pnpm lint`
  - `pnpm typecheck`
- If one check fails, explain the likely cause before making another edit.

## Output expectations
- Summarize changed files
- Explain the implementation approach briefly
- List residual risks or follow-up work