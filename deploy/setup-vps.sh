#!/bin/bash
# ═══════════════════════════════════════════════════
# QuizApp — GCP VPS Initial Setup Script
# Run this ONCE on a fresh GCP Compute Engine VM
# ═══════════════════════════════════════════════════
#
# Usage:
#   1. Create a GCP Compute Engine VM (Ubuntu 22.04+, e2-medium or better)
#   2. SSH into it:  gcloud compute ssh <vm-name> --zone <zone>
#   3. Run:  bash setup-vps.sh
#
set -euo pipefail

echo "═══════════════════════════════════════"
echo "  QuizApp — GCP VPS Setup"
echo "═══════════════════════════════════════"

# ── 1. System updates ──
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ── 2. Install Docker ──
echo "[2/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo bash
    sudo usermod -aG docker "$USER"
    echo "Docker installed. You may need to log out and back in for group changes."
else
    echo "Docker already installed: $(docker --version)"
fi

# ── 3. Install Docker Compose plugin ──
echo "[3/5] Ensuring Docker Compose plugin..."
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
fi
echo "Docker Compose: $(docker compose version)"

# ── 4. Install git ──
echo "[4/5] Installing git..."
sudo apt-get install -y git

# ── 5. Setup firewall ──
echo "[5/5] Configuring firewall (UFW)..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # Web app
sudo ufw allow 3002/tcp  # API
sudo ufw allow 1031/tcp  # BCN node (only if external access needed)
sudo ufw --force enable

echo ""
echo "═══════════════════════════════════════"
echo "  VPS Setup Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Log out and back in (for docker group)"
echo "  2. Clone your repo:"
echo "     git clone <your-repo-url> /opt/quizapp"
echo "  3. cd /opt/quizapp"
echo "  4. Copy env files:"
echo "     cp .env.bcn.template .env.bcn"
echo "     # Edit .env.api and .env.web with production values"
echo "  5. Run deployment:"
echo "     bash deploy/deploy.sh"
echo ""
