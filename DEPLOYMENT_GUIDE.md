# QuizApp — Complete Deployment Guide

This guide takes you from zero to a running QuizApp on a GCP VPS with a custom domain via Cloudflare.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create GCP VPS](#2-create-gcp-vps)
3. [Connect to VPS](#3-connect-to-vps)
4. [Install Docker on VPS](#4-install-docker-on-vps)
5. [Connect VPS to GitHub Repo](#5-connect-vps-to-github-repo)
6. [Configure Environment](#6-configure-environment)
7. [Build & Deploy](#7-build--deploy)
8. [Deploy Smart Contracts](#8-deploy-smart-contracts)
9. [Set Up Domain with Cloudflare](#9-set-up-domain-with-cloudflare)
10. [Set Up GitHub Actions CI/CD](#10-set-up-github-actions-cicd)
11. [Maintenance & Troubleshooting](#11-maintenance--troubleshooting)

---

## 1. Prerequisites

- A Google Cloud account (free tier works for initial setup)
- A GitHub account with the QuizApp repo pushed
- A domain name (from Namecheap, GoDaddy, etc.)
- A Cloudflare account (free plan)

---

## 2. Create GCP VPS

### Step 1: Go to GCP Console

1. Open https://console.cloud.google.com
2. Create a new project (or use an existing one): click the project dropdown at the top → **New Project** → name it `quizapp` → **Create**
3. Make sure billing is enabled (hamburger menu → **Billing**)

### Step 2: Create a VM Instance

1. Go to **Compute Engine** → **VM Instances** (hamburger menu → Compute Engine → VM instances)
2. Click **Create Instance**
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `quizapp-prod` |
| **Region/Zone** | Pick one close to your users (e.g., `us-central1-a`, `asia-southeast1-a`) |
| **Machine type** | `e2-medium` (2 vCPU, 4 GB RAM) — minimum for building Docker images |
| **Boot disk** | Click **Change** → Ubuntu 22.04 LTS → **Size: 30 GB** → SSD → **Select** |
| **Firewall** | Check both **Allow HTTP traffic** and **Allow HTTPS traffic** |

4. Click **Create** and wait ~1 minute

### Step 3: Set Up Firewall Rules

1. Go to **VPC Network** → **Firewall** (hamburger menu → VPC network → Firewall)
2. Click **Create Firewall Rule**:

| Setting | Value |
|---------|-------|
| **Name** | `allow-quizapp-ports` |
| **Targets** | All instances in the network |
| **Source IP ranges** | `0.0.0.0/0` |
| **Protocols and ports** | TCP: `3000,3002,1031` |

3. Click **Create**

### Step 4: Reserve a Static IP (important!)

1. Go to **VPC Network** → **IP Addresses** (or search "External IP" in the search bar)
2. Find your VM's IP → click **Reserve** to make it static
3. **Write down this IP** — you'll need it everywhere. Let's call it `YOUR_VPS_IP`

---

## 3. Connect to VPS

### Option A: gcloud CLI (recommended)

```bash
# Install gcloud CLI if you haven't: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud compute ssh quizapp-prod --zone YOUR_ZONE
```

### Option B: SSH from terminal

```bash
# Your SSH key should already be set up if you checked "Add SSH key" during VM creation
ssh -i ~/.ssh/google_compute_engine YOUR_USERNAME@YOUR_VPS_IP
```

### Option C: Browser SSH

On the VM instances page, click **SSH** button next to your VM → opens terminal in browser.

---

## 4. Install Docker on VPS

Once connected to the VPS:

```bash
# Download and run the setup script (or paste commands manually)
# Option 1: If repo is already cloned
bash deploy/setup-vps.sh

# Option 2: Manual commands
sudo apt-get update -y && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin git

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3002/tcp
sudo ufw allow 1031/tcp
sudo ufw --force enable

# IMPORTANT: Log out and back in for docker group to take effect
exit
```

After logging back in, verify:

```bash
docker --version
docker compose version
```

---

## 5. Connect VPS to GitHub Repo

### Step 1: Generate SSH Key on VPS

```bash
ssh-keygen -t ed25519 -C "quizapp-vps" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
```

Copy the output (starts with `ssh-ed25519 ...`).

### Step 2: Add Deploy Key to GitHub

1. Go to your GitHub repo → **Settings** → **Deploy keys**
2. Click **Add deploy key**
3. Title: `QuizApp VPS`
4. Paste the public key
5. Do NOT check "Allow write access" (only needs read)
6. Click **Add key**

### Step 3: Configure SSH and Clone

```bash
# Tell SSH to use this key for GitHub
cat >> ~/.ssh/config << 'EOF'
Host github.com
    IdentityFile ~/.ssh/github_deploy
    StrictHostKeyChecking no
EOF

# Clone the repo
sudo mkdir -p /opt/quizapp
sudo chown $USER:$USER /opt/quizapp
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git /opt/quizapp
cd /opt/quizapp
```

---

## 6. Configure Environment

```bash
cd /opt/quizapp

# Create env files from templates
cp .env.bcn.template .env.bcn
cp .env.api.template .env.api
cp .env.web.template .env.web
```

### Edit `.env.api`:

```bash
nano .env.api
```

Change these values:

```dotenv
DATABASE_URL="mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/quizapp?retryWrites=true&w=majority"
JWT_SECRET=GENERATE_A_RANDOM_STRING_HERE
NODE_ENV=production
BLOCKCHAIN_URL=http://bcn:1031
CORS_ORIGIN=http://YOUR_VPS_IP:3000
```

> Tip: Generate a random JWT secret: `openssl rand -base64 32`

### Edit `.env.web`:

```bash
nano .env.web
```

Change these values:

```dotenv
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3002/api
NEXT_PUBLIC_URL=http://YOUR_VPS_IP:1031
```

### `.env.bcn` — Usually no changes needed (defaults work for regtest)

---

## 7. Build & Deploy

```bash
cd /opt/quizapp

# Run the deploy script (builds images + starts services)
bash deploy/deploy.sh
```

This will:
1. Pull latest code
2. Build Docker images for API and Web (~5-10 minutes first time)
3. Start BCN stack (postgres + litecoind + bcn + bcn-sync)
4. Wait for BCN to be healthy
5. Start API and Web

### Verify everything is running:

```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show `Up` and `healthy`:

```
quiz-bcn-db       running (healthy)
quiz-bitcoin-node running
quiz-bcn          running (healthy)
quiz-bcn-sync     running
quiz-api          running (healthy)
quiz-web          running (healthy)
```

### Test it:

- Web: `http://YOUR_VPS_IP:3000`
- API: `http://YOUR_VPS_IP:3002/api/health`
- BCN: `http://YOUR_VPS_IP:1031`

---

## 8. Deploy Smart Contracts

After the BCN node is running, deploy the smart contracts:

```bash
cd /opt/quizapp

# Install dependencies locally (needed for contract deployment script)
npm ci

# Build contracts
npm run build -w packages/quiz-contracts

# Fund the deployment wallet first
npx ts-node packages/quiz-contracts/scripts/fund-wallet.ts

# Deploy contracts
npx ts-node packages/quiz-contracts/scripts/deploy.ts
```

The deploy script will output module spec hashes. Copy them and update both env files:

```bash
nano .env.api   # Update all NEXT_PUBLIC_*_MOD_SPEC values
nano .env.web   # Update all NEXT_PUBLIC_*_MOD_SPEC values
```

Then rebuild the web image (mod specs are baked in at build time for Next.js):

```bash
docker compose -f docker-compose.prod.yml build quiz-web
docker compose -f docker-compose.prod.yml up -d quiz-api quiz-web
```

---

## 9. Set Up Domain with Cloudflare

### Step 1: Add Domain to Cloudflare

1. Go to https://dash.cloudflare.com → **Add a site**
2. Enter your domain (e.g., `quizapp.com`) → Select **Free** plan
3. Cloudflare will scan your existing DNS records

### Step 2: Change Nameservers

1. Cloudflare gives you 2 nameservers (e.g., `anna.ns.cloudflare.com`, `ricky.ns.cloudflare.com`)
2. Go to your domain registrar (Namecheap, GoDaddy, etc.)
3. Change nameservers to the Cloudflare ones
4. Wait 10-30 minutes for propagation

### Step 3: Add DNS Records

In Cloudflare DNS settings, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `YOUR_VPS_IP` | DNS only (grey cloud) |
| A | `api` | `YOUR_VPS_IP` | DNS only (grey cloud) |

> Use "DNS only" (grey cloud) for now. You can enable the orange proxy later after confirming things work.

### Step 4: Update Environment for Domain

SSH into VPS and update env files:

```bash
cd /opt/quizapp

# Update .env.web
nano .env.web
# Change: NEXT_PUBLIC_API_URL=http://api.yourdomain.com:3002/api
# Change: NEXT_PUBLIC_URL=http://yourdomain.com:1031

# Update .env.api
nano .env.api
# Change: CORS_ORIGIN=http://yourdomain.com:3000

# Rebuild web (NEXT_PUBLIC vars are baked at build time)
docker compose -f docker-compose.prod.yml build quiz-web
docker compose -f docker-compose.prod.yml up -d quiz-web
```

### Optional: Add SSL with Nginx Reverse Proxy

For proper HTTPS, add an Nginx reverse proxy in front. Create `nginx.conf` and add it as a service in docker-compose. This is optional for development/testing but recommended for production.

---

## 10. Set Up GitHub Actions CI/CD

This lets GitHub automatically deploy when you push to `main`.

### Step 1: Generate SSH Key for GitHub Actions

On your VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # Copy this PRIVATE key
```

### Step 2: Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Value |
|-------------|-------|
| `VPS_IP` | Your GCP VM's static IP |
| `VPS_USER` | Your SSH username (usually your Google account username) |
| `VPS_SSH_KEY` | The **private** key from Step 1 (entire content including `-----BEGIN/END-----`) |

### Step 3: Create GitHub Environment

1. Go to repo **Settings** → **Environments** → **New environment**
2. Name it `production`
3. Optionally add a required reviewer (someone must approve before deploy)

### Do You Need a Self-Hosted Runner?

**No.** The CD workflow uses `appleboy/ssh-action` which runs on GitHub's hosted runners and SSHes into your VPS. You don't need to install a GitHub runner on your VPS.

### How It Works

1. You push to `main`
2. **CI** (`ci.yml`): Runs lint + type check on GitHub's servers
3. **CD** (`cd.yml`): SSHes into your VPS → runs `deploy/deploy.sh` → pulls code, builds images, restarts services

---

## 11. Maintenance & Troubleshooting

### View logs

```bash
cd /opt/quizapp

# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f quiz-api
docker compose -f docker-compose.prod.yml logs -f quiz-web
docker compose -f docker-compose.prod.yml logs -f bcn
```

### Restart a service

```bash
docker compose -f docker-compose.prod.yml restart quiz-api
```

### Full redeploy

```bash
bash deploy/deploy.sh --rebuild
```

### Check disk space

```bash
df -h
docker system df
# Clean up unused images/containers
docker system prune -a
```

### Update to latest code

```bash
cd /opt/quizapp
git pull
bash deploy/deploy.sh
```

---

## Project Structure (Deployment Files)

```
QuizApp/
├── .dockerignore              # Keeps Docker build context small
├── .env.api.template          # Template — copy to .env.api on VPS
├── .env.web.template          # Template — copy to .env.web on VPS
├── .env.bcn.template          # Template — copy to .env.bcn on VPS
├── docker-compose.prod.yml    # Orchestrates all services
├── bcn-setup/
│   └── litecoin.conf          # LTC regtest node config
├── deploy/
│   ├── setup-vps.sh           # One-time VPS setup (Docker, firewall)
│   └── deploy.sh              # Build & start all services
├── .github/workflows/
│   ├── ci.yml                 # Lint + type check (runs on every push/PR)
│   └── cd.yml                 # Deploy to VPS (runs on push to main)
├── apps/
│   ├── api/Dockerfile         # NestJS API image
│   └── web/Dockerfile         # Next.js Web image
```
