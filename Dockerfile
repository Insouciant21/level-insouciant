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

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm build \
  && mkdir -p /app/.prisma-generated \
  && cp -a node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client /app/.prisma-generated/client

FROM deps AS migrate
ENV NODE_ENV=production
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY docker ./docker
ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs astro
COPY --from=prod-deps --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/.prisma-generated/client ./node_modules/.prisma/client
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json
COPY --chown=astro:nodejs docker ./docker
USER astro
EXPOSE 3000
ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["node", "dist/server/entry.mjs"]
