# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm dlx turbo@2.9.14 prune @repo/db --docker

FROM base AS runner
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .

WORKDIR /app/packages/db
CMD ["pnpm", "db:push"]
