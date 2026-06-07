# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm dlx turbo@2.9.14 prune @repo/api --docker

FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN pnpm turbo build --filter=@repo/api...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs api

COPY --from=installer --chown=api:nodejs /app /app

USER api
WORKDIR /app/apps/api
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
