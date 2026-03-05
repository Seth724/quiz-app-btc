#!/bin/bash
# ═══════════════════════════════════════════════════
# QuizApp — Deploy / Update Script
# Run this on the GCP VPS to build & start everything
# ═══════════════════════════════════════════════════
#
# Usage:
#   cd /opt/quizapp
#   bash deploy/deploy.sh
#
# Options:
#   bash deploy/deploy.sh --rebuild    Force rebuild all images
#   bash deploy/deploy.sh --pull-only  Only pull latest code, don't restart
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

REBUILD=false
PULL_ONLY=false

for arg in "$@"; do
    case $arg in
        --rebuild) REBUILD=true ;;
        --pull-only) PULL_ONLY=true ;;
    esac
done

echo "═══════════════════════════════════════"
echo "  QuizApp — Deployment"
echo "  Directory: $APP_DIR"
echo "═══════════════════════════════════════"

# ── 1. Pull latest code ──
echo ""
echo "[1/6] Pulling latest code..."
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "Git pull skipped (not a git repo or no remote)"

# ── 2. Verify env files ──
echo "[2/6] Checking environment files..."

missing_env=false
for envfile in .env.bcn .env.api .env.web; do
    if [ ! -f "$envfile" ]; then
        echo "  ✗ Missing: $envfile"
        missing_env=true
    else
        echo "  ✓ Found: $envfile"
    fi
done

if [ "$missing_env" = true ]; then
    echo ""
    echo "ERROR: Missing environment files. Create them first:"
    echo "  cp .env.bcn.template .env.bcn"
    echo "  # Create .env.api and .env.web with your values"
    exit 1
fi

if [ "$PULL_ONLY" = true ]; then
    echo "Pull-only mode. Exiting."
    exit 0
fi

# ── 3. Build images ──
echo ""
echo "[3/6] Building Docker images..."

if [ "$REBUILD" = true ]; then
    echo "  (forced rebuild — no cache)"
    docker compose -f docker-compose.prod.yml build --no-cache quiz-api quiz-web
else
    docker compose -f docker-compose.prod.yml build quiz-api quiz-web
fi

# ── 4. Start BCN stack first ──
echo ""
echo "[4/6] Starting Bitcoin Computer node stack..."
docker compose -f docker-compose.prod.yml up -d bcn-db bcn-node

echo "  Waiting for bcn-db to be healthy..."
timeout 60 bash -c 'until docker compose -f docker-compose.prod.yml ps bcn-db | grep -q healthy; do sleep 2; done' || true

echo "  Running BCN database migration..."
docker compose -f docker-compose.prod.yml up bcn-migrate
echo "  Migration complete."

docker compose -f docker-compose.prod.yml up -d bcn bcn-sync

echo "  Waiting for BCN to be healthy..."
timeout 120 bash -c 'until docker compose -f docker-compose.prod.yml ps bcn | grep -q healthy; do sleep 5; done' || {
    echo "  WARNING: BCN health check timed out. It may still be starting..."
}

# ── 5. Start QuizApp ──
echo ""
echo "[5/6] Starting QuizApp services..."
docker compose -f docker-compose.prod.yml up -d quiz-api

echo "  Waiting for API to be healthy..."
timeout 60 bash -c 'until docker compose -f docker-compose.prod.yml ps quiz-api | grep -q healthy; do sleep 3; done' || {
    echo "  WARNING: API health check timed out. Check logs: docker compose -f docker-compose.prod.yml logs quiz-api"
}

docker compose -f docker-compose.prod.yml up -d quiz-web

# ── 6. Status ──
echo ""
echo "[6/6] Cleaning up old images..."
docker image prune -f 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════"
echo "  Deployment Complete!"
echo "═══════════════════════════════════════"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Services:"
echo "  Web:  http://$(hostname -I | awk '{print $1}'):3000"
echo "  API:  http://$(hostname -I | awk '{print $1}'):3002/api"
echo "  BCN:  http://$(hostname -I | awk '{print $1}'):1031"
echo ""
echo "Useful commands:"
echo "  docker compose -f docker-compose.prod.yml logs -f quiz-web"
echo "  docker compose -f docker-compose.prod.yml logs -f quiz-api"
echo "  docker compose -f docker-compose.prod.yml logs -f bcn"
echo "  docker compose -f docker-compose.prod.yml restart quiz-web"
echo ""
