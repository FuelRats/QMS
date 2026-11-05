# Install dependencies only when needed
FROM node:24-alpine AS deps
ENV NEXT_TELEMETRY_DISABLED=1
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:24-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# Production image: the standalone server with only the traced dependencies
FROM node:24-alpine AS runner
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Read at runtime: server-side env (the standalone build copies only .env and
# .env.production) and the next-i18next config for serverSideTranslations.
COPY --from=builder /app/.env.local ./.env.local
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js


USER nextjs

EXPOSE 3000

ENV PORT=3000
# Docker sets HOSTNAME to the container ID; listen on all interfaces instead.
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
