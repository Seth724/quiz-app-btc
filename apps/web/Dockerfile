# QuizApp Web Dockerfile
# Multi-stage build for Next.js production (standalone output)

# ───────────────────────────────────────
# Stage 1: Dependencies
# ───────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json turbo.json ./

# Copy workspace package files
COPY apps/web/package.json ./apps/web/
COPY packages/quiz-contracts/package.json ./packages/quiz-contracts/

# Install dependencies (with retry config for slow networks)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm ci

# ───────────────────────────────────────
# Stage 2: Builder
# ───────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/turbo.json ./turbo.json

# Copy source code
COPY apps/web ./apps/web
COPY packages/quiz-contracts ./packages/quiz-contracts

# Build contracts first (dependency)
WORKDIR /app/packages/quiz-contracts
RUN npm run build

# Build web app
WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CHAIN
ARG NEXT_PUBLIC_NETWORK
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_TEACHER_MOD_SPEC
ARG NEXT_PUBLIC_STUDENT_MOD_SPEC
ARG NEXT_PUBLIC_QUIZ_MOD_SPEC
ARG NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC
ARG NEXT_PUBLIC_PAYMENT_MOD_SPEC
ARG NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC
ARG NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CHAIN=$NEXT_PUBLIC_CHAIN
ENV NEXT_PUBLIC_NETWORK=$NEXT_PUBLIC_NETWORK
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_TEACHER_MOD_SPEC=$NEXT_PUBLIC_TEACHER_MOD_SPEC
ENV NEXT_PUBLIC_STUDENT_MOD_SPEC=$NEXT_PUBLIC_STUDENT_MOD_SPEC
ENV NEXT_PUBLIC_QUIZ_MOD_SPEC=$NEXT_PUBLIC_QUIZ_MOD_SPEC
ENV NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=$NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC
ENV NEXT_PUBLIC_PAYMENT_MOD_SPEC=$NEXT_PUBLIC_PAYMENT_MOD_SPEC
ENV NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=$NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC
ENV NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=$NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ───────────────────────────────────────
# Stage 3: Production (standalone)
# ───────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache curl openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

WORKDIR /app

# Standalone output bundles its own node_modules — no npm ci needed

# Copy standalone server (includes minimal node_modules)
COPY --from=builder --chown=nodeuser:nodejs /app/apps/web/.next/standalone ./

# Copy static assets and public files (not included in standalone)
COPY --from=builder --chown=nodeuser:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy public dir if it exists (create empty fallback)
RUN mkdir -p ./apps/web/public
COPY --from=builder --chown=nodeuser:nodejs /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Set environment variable for standalone mode
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NODE_ENV=production

# Start command
CMD ["node", "apps/web/server.js"]
