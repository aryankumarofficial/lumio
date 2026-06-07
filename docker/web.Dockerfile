# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm dlx turbo@2.9.14 prune @repo/web --docker

FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm turbo build --filter=@repo/web...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
