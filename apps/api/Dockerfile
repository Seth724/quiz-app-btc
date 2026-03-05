# QuizApp API Dockerfile
# Multi-stage build for production

# ───────────────────────────────────────
# Stage 1: Install ALL dependencies (for building)
# ───────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/quiz-contracts/package.json ./packages/quiz-contracts/

# Increase npm timeout for slow/unreliable networks
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm ci

# ───────────────────────────────────────
# Stage 2: Install PRODUCTION-only deps (parallel with builder)
# ───────────────────────────────────────
FROM node:20-alpine AS prod-deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/quiz-contracts/package.json ./packages/quiz-contracts/

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm ci --omit=dev

# ───────────────────────────────────────
# Stage 3: Build application
# ───────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/turbo.json ./turbo.json

COPY apps/api ./apps/api
COPY packages/quiz-contracts ./packages/quiz-contracts

# Copy workspace-specific node_modules (binaries like nest, prisma may not be hoisted)
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/quiz-contracts/node_modules ./packages/quiz-contracts/node_modules

# Build contracts first
RUN npm run build -w packages/quiz-contracts

# Generate Prisma client BEFORE building API (API imports generated types)
WORKDIR /app/apps/api
RUN npx prisma generate

# Build API
WORKDIR /app
RUN npm run build -w apps/api

# ───────────────────────────────────────
# Stage 4: Production image
# ───────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache curl openssl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

WORKDIR /app

# Use production-only deps from prod-deps stage (no second npm ci!)
COPY --from=prod-deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy package files for module resolution
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/turbo.json ./turbo.json
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json

# Copy built application + contracts
COPY --from=builder --chown=nodeuser:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodeuser:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/packages/quiz-contracts/dist ./packages/quiz-contracts/dist
COPY --from=builder --chown=nodeuser:nodejs /app/packages/quiz-contracts/package.json ./packages/quiz-contracts/package.json

# Copy Prisma schema + generated client
COPY --from=builder --chown=nodeuser:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nodeuser:nodejs /app/apps/api/generated ./apps/api/generated

RUN mkdir -p /app/logs && chown nodeuser:nodejs /app/logs

USER nodeuser

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3002/api/health || exit 1

CMD ["node", "apps/api/dist/src/main.js"]
