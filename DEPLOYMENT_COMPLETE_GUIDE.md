# QuizApp GCP Deployment - Complete Guide

**Deployment Date:** March 6, 2026  
**VPS:** GCP Compute Engine (quizapp-prod)  
**IP:** 34.93.217.29  
**Domain:** quizapp.sethna.me  
**Status:** ✅ Working (HTTP)

---

## 📋 Table of Contents

1. [Current Configuration](#current-configuration)
2. [What Works](#what-works)
3. [Known Issues](#known-issues)
4. [Deployment Steps Summary](#deployment-steps-summary)
5. [Environment Files](#environment-files)
6. [Troubleshooting](#troubleshooting)
7. [Future Improvements](#future-improvements)

---

## Current Configuration

### Infrastructure
| Component | Value |
|-----------|-------|
| **Cloud Provider** | Google Cloud Platform |
| **VM Instance** | quizapp-prod (e2-medium, 2.6GB RAM, 10GB disk) |
| **Static IP** | 34.93.217.29 |
| **Firewall Rules** | HTTP (80), HTTPS (443), 3000, 3002, 1031 |
| **Domain** | sethna.me (Cloudflare DNS) |
| **Subdomain** | quizapp.sethna.me |

### Docker Services
| Service | Container Name | Port | Status |
|---------|---------------|------|--------|
| Web Frontend | quiz-web | 3000 | ✅ Running |
| API Backend | quiz-api | 3002 | ✅ Running |
| BCN Node | quiz-bcn | 1031 | ✅ Running |
| BCN Sync | quiz-bcn-sync | - | ⚠️ Unstable |
| BCN Database | quiz-bcn-db | 5432 | ✅ Running |
| Bitcoin Node | quiz-bitcoin-node | 19332, 19444 | ✅ Running |
| Nginx | quiz-nginx | 80, 443 | ⚠️ Configured but not used |

### Access URLs
| Service | URL | Protocol |
|---------|-----|----------|
| Web App | http://quizapp.sethna.me:3000 | HTTP |
| API | http://quizapp.sethna.me:3002/api | HTTP |
| BCN Node | http://quizapp.sethna.me:1031 | HTTP |

---

## What Works

### ✅ Working Features
- [x] User authentication (teacher/student)
- [x] Quiz creation (teachers)
- [x] Quiz taking (students)
- [x] Blockchain-based quiz storage
- [x] Entry fee payments (regtest)
- [x] Reward distribution (regtest)
- [x] Wallet connection
- [x] Leaderboard display
- [x] Gallery view
- [x] Docker Compose deployment
- [x] Domain access (quizapp.sethna.me)
- [x] SSL certificates installed (not currently used)

### ⚠️ Partially Working
- [x] BCN node running
- [ ] BCN sync service (crashes with "Not all workers have reorged")
- [ ] HTTPS (configured but disabled due to BCN issues)

---

## Known Issues

### 1. BCN Sync Service Crashes ⚠️ **CRITICAL**

**Symptom:**
```
error [wid 1 pid: 18]: synchronizing failed with error 'Not all workers have reorged'
```

**Impact:**
- `/v1/LTC/regtest/...` API endpoints return 404
- Wallet balance queries fail
- Transaction broadcasting may fail

**Root Cause:**
- BCN-Sync service has a known bug with worker reorganization
- Happens after container restarts or network issues
- BCN version 0.26.0-beta.0 is unstable

**Workaround:**
```bash
# Restart bcn-sync service
docker compose -f docker-compose.prod.yml restart bcn-sync

# If still failing, restart entire BCN stack
docker compose -f docker-compose.prod.yml restart bcn bcn-sync bcn-node bcn-db

# Wait 2-3 minutes for sync
sleep 120
docker compose -f docker-compose.prod.yml logs bcn-sync | tail -30
```

**Permanent Fix Needed:**
- Wait for BCN stable release (non-beta)
- OR migrate to different blockchain (Polygon recommended)

---

### 2. HTTPS Disabled ⚠️ **SECURITY**

**Why Disabled:**
- Mixed content errors (browser blocks HTTP requests from HTTPS pages)
- BCN endpoints only work over HTTP
- Nginx proxy configuration complex with BCN network isolation

**Current Status:**
- SSL certificates: ✅ Installed (`/etc/letsencrypt/live/quizapp.sethna.me/`)
- Nginx config: ✅ Created (`/opt/quizapp/nginx/nginx.conf`)
- Access: ❌ HTTP only (ports 3000, 3002, 1031)

**To Re-enable HTTPS:**
1. Fix BCN sync service first
2. Update nginx.conf with correct `/bcn` proxy
3. Add nginx to `bcn-network` in docker-compose
4. Change env files to use `https://quizapp.sethna.me`
5. Rebuild all containers

---

### 3. Public Key Serialization Bug ✅ **FIXED**

**Symptom:**
```
BCN logs show: [object Object] instead of public key hex
Payment queries fail with malformed URL
```

**Root Cause:**
- `computer.getPublicKey()` returns Buffer/Uint8Array
- Code was passing Buffer directly to URL string
- BCN couldn't parse `[object Object]` as public key

**Files Fixed (7 total):**
1. `apps/web/src/services/bc/BrowserAttemptClient.ts` - getOUTXOs → getUtxos
2. `apps/web/src/services/bc/BrowserQuizClient.ts` - getOUTXOs → getUtxos
3. `apps/web/src/services/bc/BrowserAccessClient.ts` - getOUTXOs → getUtxos
4. `apps/web/src/common-components/bc/src/Wallet.tsx` - getOUTXOs → getUtxos + publicKey fix
5. `apps/web/src/common-components/Wallet.tsx` - getOUTXOs → getUtxos + publicKey fix
6. `apps/web/src/common-components/Gallery.tsx` - getOUTXOs → getUtxos
7. `apps/web/src/common-components/bc/src/Gallery.tsx` - getOUTXOs → getUtxos

**Fix Applied:**
```typescript
// BEFORE (wrong)
const publicKey = computer.getPublicKey() // Returns Buffer
const url = `${BASE_URL}/address/${publicKey}/balance` // [object Object]

// AFTER (correct)
const publicKey = computer.getPublicKey()
const publicKeyHex = Buffer.from(publicKey).toString('hex') // Convert to hex string
const url = `${BASE_URL}/address/${publicKeyHex}/balance` // Works!
```

---

### 4. Method Name Typo ✅ **FIXED**

**Symptom:**
```
TypeError: computer.getOUTXOs is not a function
```

**Root Cause:**
- BCN library uses `getUtxos` (lowercase)
- Code had `getOUTXOs` (uppercase OUTXO)

**Fix:**
Changed all instances of `getOUTXOs` → `getUtxos` in 7 files (see above)

---

### 5. Docker Build Cache Issues ✅ **FIXED**

**Symptom:**
- Code changes don't appear after deployment
- Old version keeps running despite rebuild

**Root Cause:**
- Docker caches build layers
- Production builds use cached code

**Fix:**
```bash
# Always use --no-cache flag
docker compose -f docker-compose.prod.yml build --no-cache quiz-web
docker compose -f docker-compose.prod.yml build --no-cache quiz-api

# Or remove old image first
docker rmi quizapp-quiz-web:latest
docker compose -f docker-compose.prod.yml build quiz-web
```

---

### 6. Environment Variables Not Updating ✅ **FIXED**

**Symptom:**
- Changes to `.env.web` don't take effect
- App still uses old URLs

**Root Cause:**
- Next.js bakes environment variables at build time
- Must rebuild after env changes

**Fix:**
```bash
# Always rebuild after env file changes
set -a && source .env.web && set +a
docker compose -f docker-compose.prod.yml build --no-cache quiz-web
docker compose -f docker-compose.prod.yml up -d
```

---

## Deployment Steps Summary

### Prerequisites
- GCP account with billing enabled
- Domain name (sethna.me)
- Cloudflare account (free tier)
- SSH access to VPS

### Step 1: GCP VM Setup
```bash
# Create VM instance
gcloud compute instances create quizapp-prod \
  --machine-type=e2-medium \
  --boot-disk-size=10GB \
  --tags=http-server,https-server \
  --static-ip=34.93.217.29

# Create firewall rules
gcloud compute firewall-rules create allow-http --allow tcp:80,tcp:3000,tcp:3002,tcp:1031
gcloud compute firewall-rules create allow-https --allow tcp:443
```

### Step 2: Install Dependencies on VPS
```bash
# SSH to VPS
ssh amanethmeis@34.93.217.29

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt update
sudo apt install -y docker-compose-plugin
```

### Step 3: Clone and Configure QuizApp
```bash
# Clone repository
git clone git@github.com:YOUR_USERNAME/QuizApp.git /opt/quizapp
cd /opt/quizapp

# Create environment files
cp .env.web.template .env.web
cp .env.api.template .env.api
cp .env.bcn.template .env.bcn

# Edit with correct values (see Environment Files section)
nano .env.web
nano .env.api
nano .env.bcn
```

### Step 4: Domain Setup (Cloudflare)
1. Add domain to Cloudflare
2. Change nameservers at registrar
3. Add DNS records:
   - `A` → `quizapp` → `34.93.217.29` (GREY cloud)
4. Wait for propagation (10-30 minutes)

### Step 5: SSL Certificates (Optional - Currently Disabled)
```bash
# Install certbot
sudo apt install -y certbot

# Create nginx directories
mkdir -p ./nginx/certs ./nginx/www

# Get certificate
docker compose -f docker-compose.prod.yml stop nginx
sudo certbot certonly --standalone -d quizapp.sethna.me --email your@email.com
docker compose -f docker-compose.prod.yml up -d nginx

# Copy certificates
sudo cp /etc/letsencrypt/archive/quizapp.sethna.me/*.pem ./nginx/certs/
```

### Step 6: Deploy with Docker Compose
```bash
# Load environment
set -a && source .env.web && set +a

# Build all containers
docker compose -f docker-compose.prod.yml build --no-cache

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Step 7: Verify Deployment
```bash
# Test web app
curl http://quizapp.sethna.me:3000

# Test API
curl http://quizapp.sethna.me:3002/api/health

# Test BCN node
curl http://quizapp.sethna.me:1031/

# Check all services healthy
docker compose -f docker-compose.prod.yml ps
```

---

## Environment Files

### `.env.web` (Current - HTTP)
```dotenv
# QuizApp Web Environment Variables

# ── Blockchain ──
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://quizapp.sethna.me:1031

# ── API ──
NEXT_PUBLIC_API_URL=http://quizapp.sethna.me:3002/api

# ── Module Specs ──
NEXT_PUBLIC_TEACHER_MOD_SPEC=f387e5beeca7dbe78c0976130f3497df1cf3ccd9586af41b142854f509611146:0
NEXT_PUBLIC_STUDENT_MOD_SPEC=2cd3c826daabaad1b27a37d8e238e41be4727078b14639c4c477cfb7c6885122:0
NEXT_PUBLIC_QUIZ_MOD_SPEC=a9f476885faf17d0d9bef31ad156034598d57056ed2880d49a1c397ea5fb2947:0
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=ac7ece7ef1d7a5f9679acd3b468b45d361b736e333f1f8e8a50f9c5657f1ee7e:0
NEXT_PUBLIC_PAYMENT_MOD_SPEC=713605a8cd672cb3b841cfe21e7287bb14f52d5375bfc365d2e274dc868a86cb:0
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=f8fb1e49e796ef694e1cd2938587dc12aeaac2d75827c5a2f522083391d40756:0
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=300be94615cfe67bf211624a82d0a9bf39b61c18436ca9fcb98fddaa1c428031:0
```

### `.env.api` (Current - HTTP)
```dotenv
# QuizApp API Environment Variables

# ── Database ──
DATABASE_URL="mongodb+srv://dulnasenethmi_db_user:NVs1234@cluster0.2lb5lmn.mongodb.net/quizapp?retryWrites=true&w=majority"

# ── JWT ──
JWT_SECRET=0c1f6aac8d2cd2a413e2457d92e2454f73a271ec791da0391199b1d70967a08ef16dbd65b5ba6727952a136f90ec2067018b3952f9d77d571c4aa662ae48d702
JWT_EXPIRY=7d

# ── Server ──
PORT=3002
NODE_ENV=production

# ── Blockchain ──
BLOCKCHAIN_CHAIN=LTC
BLOCKCHAIN_NETWORK=regtest
BLOCKCHAIN_URL=http://bcn:1031

# ── Module Specs ──
NEXT_PUBLIC_TEACHER_MOD_SPEC=f387e5beeca7dbe78c0976130f3497df1cf3ccd9586af41b142854f509611146:0
NEXT_PUBLIC_STUDENT_MOD_SPEC=2cd3c826daabaad1b27a37d8e238e41be4727078b14639c4c477cfb7c6885122:0
NEXT_PUBLIC_QUIZ_MOD_SPEC=a9f476885faf17d0d9bef31ad156034598d57056ed2880d49a1c397ea5fb2947:0
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=ac7ece7ef1d7a5f9679acd3b468b45d361b736e333f1f8e8a50f9c5657f1ee7e:0
NEXT_PUBLIC_PAYMENT_MOD_SPEC=713605a8cd672cb3b841cfe21e7287bb14f52d5375bfc365d2e274dc868a86cb:0
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=f8fb1e49e796ef694e1cd2938587dc12aeaac2d75827c5a2f522083391d40756:0
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=300be94615cfe67bf211624a82d0a9bf39b61c18436ca9fcb98fddaa1c428031:0

# ── CORS ──
CORS_ORIGIN=http://quizapp.sethna.me:3000

# ── Indexer ──
INDEXER_ENABLED=true
INDEXER_INTERVAL_MS=30000
```

### `.env.bcn`
```dotenv
BCN_CHAIN=LTC
BCN_NETWORK=regtest
BCN_PORT=1031
BCN_URL=http://bcn:1031
BCN_WALLET=defaultwallet
```

---

## Troubleshooting

### BCN Sync Crashes
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs bcn-sync | tail -50

# Restart service
docker compose -f docker-compose.prod.yml restart bcn-sync

# If still failing, reset BCN database
docker compose -f docker-compose.prod.yml down
docker volume rm quizapp_bcn-db-data
docker volume rm quizapp_bcn-blockchain-data
docker compose -f docker-compose.prod.yml up -d
```

### Services Not Starting
```bash
# Check all container status
docker compose -f docker-compose.prod.yml ps

# View logs for failing service
docker compose -f docker-compose.prod.yml logs <service-name>

# Rebuild specific service
docker compose -f docker-compose.prod.yml build --no-cache <service-name>
docker compose -f docker-compose.prod.yml up -d <service-name>
```

### Can't Access Web App
```bash
# Check if ports are exposed
docker compose -f docker-compose.prod.yml ps

# Should show:
# quiz-web   ...   0.0.0.0:3000->3000/tcp
# quiz-api   ...   0.0.0.0:3002->3002/tcp
# bcn        ...   0.0.0.0:1031->1031/tcp

# If ports missing, edit docker-compose.prod.yml and add ports back
```

### Environment Changes Not Applied
```bash
# Rebuild with fresh environment
set -a && source .env.web && set +a
docker compose -f docker-compose.prod.yml build --no-cache quiz-web
docker compose -f docker-compose.prod.yml up -d

# Hard refresh browser: Ctrl+Shift+R
```

### SSL Certificate Issues
```bash
# Check certificate exists
sudo ls -la /etc/letsencrypt/live/quizapp.sethna.me/

# Renew certificate
sudo certbot renew

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Future Improvements

### 1. Migrate to Production Blockchain ⭐ **HIGH PRIORITY**

**Current:** BCN (Bitcoin Computer Node) v0.26.0-beta.0  
**Recommended:** Polygon (Matic) mainnet

**Why:**
- BCN is beta software (unstable)
- BCN-sync crashes frequently
- No production support
- Security concerns for real money

**Migration Plan:**
1. Write Solidity smart contracts for quiz logic
2. Deploy to Polygon Mumbai testnet
3. Test thoroughly
4. Deploy to Polygon mainnet
5. Update frontend to use ethers.js/viem
6. Use USDC stablecoin for rewards

**Estimated Time:** 2-4 weeks

---

### 2. Enable HTTPS ⭐ **HIGH PRIORITY**

**Current:** HTTP only (insecure)  
**Target:** HTTPS with SSL certificates

**Steps:**
1. Fix BCN sync service
2. Update nginx.conf with correct `/bcn` proxy
3. Add nginx to `bcn-network` in docker-compose
4. Change env files to HTTPS URLs
5. Rebuild all containers
6. Test thoroughly

**Estimated Time:** 1-2 days (after BCN fixed)

---

### 3. GitHub Actions CI/CD ⭐ **MEDIUM PRIORITY**

**Current:** Manual deployment  
**Target:** Automatic deployment on push

**Setup:**
1. Generate SSH key for GitHub Actions
2. Add secrets to GitHub repository
3. Create `.github/workflows/ci.yml` (lint + typecheck)
4. Create `.github/workflows/cd.yml` (deploy to VPS)
5. Test with small commit

**Estimated Time:** 2-3 hours

---

### 4. Monitoring & Alerts ⭐ **MEDIUM PRIORITY**

**Current:** Manual log checking  
**Target:** Automated monitoring

**Tools:**
- Uptime monitoring (UptimeRobot - free)
- Log aggregation (Papertrail - free tier)
- Resource monitoring (GCP Monitoring - free tier)
- Alert notifications (email/SMS)

**Estimated Time:** 4-6 hours

---

### 5. Database Backups ⭐ **LOW PRIORITY**

**Current:** No automated backups  
**Target:** Daily automated backups

**Implementation:**
- MongoDB Atlas: Built-in backups (paid feature)
- BCN Database: Cron job with pg_dump
- Store backups in GCP Cloud Storage

**Estimated Time:** 3-4 hours

---

## Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| GCP VM (e2-medium) | ~$13/month | 2 vCPU, 3GB RAM |
| GCP Static IP | ~$3/month | Reserved IP |
| GCP Storage (10GB) | ~$2/month | SSD |
| MongoDB Atlas | Free tier | Up to 512MB |
| Cloudflare | Free | DNS + SSL |
| Domain (sethna.me) | ~$10/year | Namecheap |
| **Total** | **~$18/month** | Excluding domain |

---

## Security Checklist

- [ ] Enable HTTPS (SSL certificates installed but not used)
- [ ] Set up firewall rules (only required ports open)
- [ ] Use strong passwords (JWT_SECRET, database)
- [ ] Enable automatic security updates on VPS
- [ ] Set up monitoring and alerts
- [ ] Regular backups (database + blockchain data)
- [ ] Review BCN security (beta software risks)
- [ ] Consider migrating to production blockchain

---

## Contact & Support

**Developer:** [Your Name]  
**Email:** amanethmeis@gmail.com  
**Repository:** [Your GitHub Repo]  
**Documentation:** See `/DEPLOYMENT_TROUBLESHOOTING.md` for detailed troubleshooting

---

## Changelog

### March 6, 2026
- ✅ Initial GCP deployment
- ✅ Domain setup (quizapp.sethna.me)
- ✅ SSL certificates installed
- ✅ Fixed getOUTXOs → getUtxos typo (7 files)
- ✅ Fixed public key serialization bug
- ⚠️ BCN sync service unstable (known issue)
- ⚠️ HTTPS disabled (using HTTP temporarily)

---

**Last Updated:** March 6, 2026  
**Next Review:** After BCN migration or HTTPS enablement
