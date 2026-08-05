FROM node:24-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder

ARG NEXT_PUBLIC_SITE_URL=http://localhost:21544
ARG BUILD_DATABASE_HOST=localhost
ARG BUILD_DATABASE_NAME=level-insouciant
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_HOST_OVERRIDE=$BUILD_DATABASE_HOST
ENV DATABASE_NAME_OVERRIDE=$BUILD_DATABASE_NAME

COPY . .
RUN --mount=type=secret,id=database_url,env=DATABASE_URL \
  DATABASE_URL="$(node /app/docker/normalize-database-url.mjs DATABASE_URL)" pnpm build

FROM deps AS migrate

ENV NODE_ENV=production

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY docker ./docker

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs docker ./docker

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["node", "server.js"]
