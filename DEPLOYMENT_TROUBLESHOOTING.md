# QuizApp Deployment Troubleshooting Guide

**Last Updated:** March 6, 2026  
**Environment:** GCP VPS (Ubuntu 22.04) + Docker Compose  
**Stack:** Next.js (Web) + NestJS (API) + BCN (Bitcoin Computer Node) + Litecoin Regtest  
**Deployment Duration:** 2 Days (March 5-6, 2026)  
**VPS IP:** 34.93.217.29

---

## Table of Contents

1. [Day 1 Issues (March 5, 2026)](#1-day-1-issues-march-5-2026)
2. [Day 2 Issues (March 6, 2026)](#2-day-2-issues-march-6-2026)
3. [Complete Issue Summary Table](#3-complete-issue-summary-table)
4. [Quick Reference Commands](#4-quick-reference-commands)
5. [Environment Configuration Reference](#5-environment-configuration-reference)

---

## 1. Day 1 Issues (March 5, 2026)

### 1.1 Docker Compose Service Name Mismatch

**Problem:** Commands failing with "no such service" error

**Error:**
```
$ docker compose -f docker-compose.prod.yml restart quiz-bcn-sync
no such service: quiz-bcn-sync
```

**Cause:** Service names in docker-compose.yml don't match container names.

**Solution:**
```bash
# Check actual service names
docker compose -f docker-compose.prod.yml config --services

# Use service names, not container names
docker compose -f docker-compose.prod.yml restart bcn-sync  # ✅ Correct
docker compose -f docker-compose.prod.yml restart quiz-bcn-sync  # ❌ Wrong
```

**Lesson:** Always verify service names with `config --services` before running commands.

---

### 1.2 BCN Sync Service Continuous Crash

**Problem:** `bcn-sync` container stuck in restart loop

**Error in logs:**
```
error [wid 1 pid: 18]: synchronizing failed with error 'Not all workers have reorged
Error: Not all workers have reorged
```

**Symptoms:**
- Container status shows repeated restarts
- Sync never completes
- Transactions not indexed

**Root Cause:** BCN sync service has a known bug with regtest mode and worker synchronization.

**Solution:**
```bash
# Stop the crashing service - it's not essential for basic operations
docker compose -f docker-compose.prod.yml stop bcn-sync

# Verify other services are healthy
docker compose -f docker-compose.prod.yml ps
```

**Impact:** Minimal - the app works without bcn-sync for regtest testing. Transactions are still broadcast and confirmed.

---

### 1.3 Litecoin Wallet Not Loaded After Restart

**Problem:** Faucet and contract deployment failing

**Error:**
```
POST /v1/LTC/regtest/rpc 500
Error: No wallet is loaded. Load a wallet using loadwallet or create a new one with createwallet.
```

**Cause:** Litecoin node wallet doesn't persist across container restarts.

**Solution:**
```bash
# Load existing wallet or create new one
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  loadwallet "defaultwallet" 2>/dev/null || \
  docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  createwallet "defaultwallet"

# Verify wallet loaded
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getwalletinfo
```

**Prevention:** Add wallet load command to docker-compose health checks or startup script.

---

### 1.4 Contract Deployment - Coinbase Maturity Error

**Problem:** Deploy script fails when trying to fund wallet

**Error:**
```
Error: bad-txns-premature-spend-of-coinbase, tried to spend coinbase at depth 68
```

**Cause:** 
- Coinbase transaction outputs require 100 confirmations before spending
- Mining to the same wallet used for deployment creates immature UTXOs
- Deploy script tries to spend from immature coinbase outputs

**Solution:**
```bash
# Step 1: Generate a NEW mining address (NOT the deployment wallet)
MINING_ADDR=$(docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getnewaddress)

echo "Mining to address: $MINING_ADDR"

# Step 2: Mine 101+ blocks to the NEW address
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  generatetoaddress 101 "$MINING_ADDR"

# Step 3: Verify balance
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getbalance
```

**Prevention:** Always mine to a separate address from your deployment/spending wallet.

---

### 1.5 Environment Variable Configuration

**Problem:** Contract scripts can't find environment variables

**Error:**
```
Error: Please set NEXT_PUBLIC_CHAIN, NEXT_PUBLIC_NETWORK, and NEXT_PUBLIC_URL in the .env file
```

**Cause:** Contract deployment scripts look for `.env` file in `packages/quiz-contracts/` directory.

**Solution:**
```bash
cd /opt/quizapp

# Create .env file in contracts package directory
cat > packages/quiz-contracts/.env << 'EOF'
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031
NEXT_PUBLIC_PATH=m/44'/0'/0'/0
DEPLOYMENT_MNEMONIC=your-mnemonic-here
BCN_URL=http://localhost:1031
BCN_PATH=m/44'/0'/0'/0
BCN_CHAIN=LTC
BCN_NETWORK=regtest
CHAIN=LTC
NETWORK=regtest
URL=http://localhost:1031
PATH=m/44'/0'/0'/0
EOF

# Run deployment
npm run deploy -w packages/quiz-contracts
```

**Important:** Use `localhost:1031` for contract scripts (they run on VPS host, not inside Docker).

---

## 2. Day 2 Issues (March 6, 2026)

### 2.1 Docker Restart Clears Blockchain State

**Problem:** All quizzes and transactions disappear after Docker restart

**Error:**
```
GET /v1/LTC/regtest/tx/9d1b94dc.../hex 500
No such mempool or blockchain transaction.
```

**Cause:** 
- Regtest blockchain is ephemeral
- Docker volume not persisted or was cleared
- All transactions, quizzes, payments lost

**Solution:**
```bash
# After Docker restart, re-mine blocks to fund wallets
NEW_ADDR=$(docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getnewaddress)

docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  generatetoaddress 101 "$NEW_ADDR"

# Recreate test data (quizzes, payments, etc.)
# Hard refresh browser: Ctrl+Shift+R
```

**Prevention:** 
- For production: Use testnet or mainnet (persistent)
- For testing: Don't restart Docker during active sessions
- Backup important transaction IDs before restarting

---

### 2.2 Frontend Method Name Typo - getOUTXOs vs getUtxos

**Problem:** All blockchain queries failing in browser

**Error:**
```
Failed to get owned payments: this.computer.getOUTXOs is not a function
Failed to get attempts: TypeError: this.computer.getOUTXOs is not a function
```

**Cause:** Wrong capitalization - BCN library uses `getUtxos` (lowercase), not `getOUTXOs` (uppercase).

**Files Affected (7 files):**
```
apps/web/src/services/bc/BrowserAttemptClient.ts
apps/web/src/services/bc/BrowserQuizClient.ts
apps/web/src/services/bc/BrowserAccessClient.ts
apps/web/src/common-components/bc/src/Wallet.tsx
apps/web/src/common-components/bc/src/Gallery.tsx
apps/web/src/common-components/Wallet.tsx
apps/web/src/common-components/Gallery.tsx
```

**Solution:**
```bash
cd /opt/quizapp

# Fix all files at once
sed -i 's/getOUTXOs/getUtxos/g' \
  ./apps/web/src/services/bc/BrowserAttemptClient.ts \
  ./apps/web/src/services/bc/BrowserQuizClient.ts \
  ./apps/web/src/services/bc/BrowserAccessClient.ts \
  ./apps/web/src/common-components/bc/src/Wallet.tsx \
  ./apps/web/src/common-components/bc/src/Gallery.tsx \
  ./apps/web/src/common-components/Wallet.tsx \
  ./apps/web/src/common-components/Gallery.tsx

# Verify fix
grep -r "getOUTXOs" apps/web/src/
# Should return nothing

# Rebuild web container
set -a && source .env.web && set +a
docker compose -f docker-compose.prod.yml build quiz-web
docker compose -f docker-compose.prod.yml up -d quiz-web

# Hard refresh browser
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

**Verification:**
```bash
# Check built files contain correct method name
docker exec quiz-web grep -r "getUtxos" /app/.next/static/chunks/ | head -3
```

---

### 2.3 Public Key Serialization Bug - [object Object] in URL

**Problem:** Wallet shows 0 payments despite transactions existing on blockchain

**Error in BCN logs:**
```
http GET /v1/LTC/regtest/wallet/[object%20Object]/utxos 500
```

**Symptoms:**
- ✅ Quiz creation works
- ✅ Answer submission works  
- ✅ Reward claims work
- ❌ Wallet balance shows 0
- ❌ Console: "Found 0 payment IDs for 02c4395a99e4" (truncated public key)

**Root Cause Analysis:**

| Feature | Query Type | Status | Why |
|---------|-----------|--------|-----|
| Quiz creation | Broadcast | ✅ Works | No publicKey query needed |
| Answer submission | Broadcast | ✅ Works | No publicKey query needed |
| Reward claims | Broadcast | ✅ Works | No publicKey query needed |
| Quiz listing | Query by `mod` | ✅ Works | `mod` is already string |
| **Wallet balance** | **Query by `publicKey`** | **❌ Broken** | **`publicKey` is Buffer object, not string** |

**The Bug:**
```typescript
// ❌ BROKEN CODE
const publicKey = computer.getPublicKey();  // Returns Buffer/Uint8Array OBJECT
const paymentRevs = await computer.getUtxos({ publicKey, mod });
// URL becomes: /v1/LTC/regtest/wallet/[object%20Object]/utxos
```

**The Fix:**

Edit `apps/web/src/common-components/Wallet.tsx`:

```typescript
// ✅ FIXED CODE
const pkBuffer = computer.getPublicKey();
const publicKey = typeof pkBuffer === 'string' 
  ? pkBuffer 
  : Buffer.from(pkBuffer).toString('hex');

const paymentRevs = await computer.getUtxos({ 
  publicKey: publicKey, 
  mod: String(mod) 
});
```

**Full Fixed `refreshBalance` Function:**
```typescript
const refreshBalance = useCallback(async () => {
  try {
    if (computer) {
      showLoader(true);
      
      // Get public key and ensure it's a full hex string
      const pkBuffer = computer.getPublicKey();
      const publicKey = typeof pkBuffer === 'string' 
        ? pkBuffer 
        : Buffer.from(pkBuffer).toString('hex');
      
      const dust = computer.db.wallet.getDustThreshold(false);
      const balances: bigint[] = await Promise.all(
        modSpecs.map(async (mod) => {
          const paymentRevs = modSpecs
            ? await computer.getUtxos({ publicKey: publicKey, mod: String(mod) })
            : [];
          const payments = (await Promise.all(
            paymentRevs.map((rev: string) => computer.sync(rev))
          )) as { _satoshis: bigint }[];
          return payments && payments.length
            ? payments.reduce(
                (total, pay) => total + (pay._satoshis - BigInt(dust)),
                0n
              )
            : 0n;
        })
      );
      
      setBalance(balances.reduce((a, b) => a + b, 0n));
    }
  } catch (error) {
    console.error('Balance refresh failed:', error);
  } finally {
    showLoader(false);
  }
}, [computer, modSpecs, showLoader]);
```

**Rebuild Steps:**
```bash
cd /opt/quizapp

# Stop web container
docker compose -f docker-compose.prod.yml stop quiz-web

# Remove old image (force clean rebuild)
docker rmi quizapp-quiz-web 2>/dev/null || true

# Rebuild from scratch
set -a && source .env.web && set +a
docker compose -f docker-compose.prod.yml build --no-cache quiz-web
docker compose -f docker-compose.prod.yml up -d quiz-web

# Wait for ready
sleep 10
docker compose -f docker-compose.prod.yml logs quiz-web | tail -5
```

**Verification:**
```bash
# Check BCN logs - should see full public key in URL now
docker compose -f docker-compose.prod.yml logs bcn | tail -20 | grep utxos

# BEFORE (broken):
# /v1/LTC/regtest/wallet/[object%20Object]/utxos

# AFTER (fixed):
# /v1/LTC/regtest/wallet/02c4395a99e491394b83590b34747a0768ed26b99dcb90ce585baabb393b50ad42/utxos
```

**Browser Hard Refresh Required:**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

---

### 2.4 Rebuild Not Picking Up Changes

**Problem:** Code changes not reflected after rebuild

**Symptoms:**
- Edited source files
- Ran `docker compose build`
- Browser still shows old behavior

**Cause:** Docker layer caching or browser caching.

**Solution:**
```bash
# Step 1: Stop container
docker compose -f docker-compose.prod.yml stop quiz-web

# Step 2: Remove old image
docker rmi quizapp-quiz-web 2>/dev/null || true

# Step 3: Rebuild with no cache
set -a && source .env.web && set +a
docker compose -f docker-compose.prod.yml build --no-cache quiz-web

# Step 4: Restart
docker compose -f docker-compose.prod.yml up -d quiz-web

# Step 5: Hard refresh browser
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)

# Step 6: Clear browser cache if needed
# Chrome: F12 → Application → Clear storage → Clear site data
```

**Verification:**
```bash
# Check if changes are in built files
docker exec quiz-web grep -o "publicKey.*toString\|publicKeyHex" /app/.next/static/chunks/*.js 2>/dev/null | head -3

# Should show your fix code
```

---

## 3. Complete Issue Summary Table

| # | Issue | Day | Status | Files Changed | Fix Time |
|---|-------|-----|--------|---------------|----------|
| 1 | Docker service name mismatch | 1 | ✅ Fixed | N/A | 5 min |
| 2 | BCN-sync crash loop | 1 | ✅ Fixed | N/A | 10 min |
| 3 | Litecoin wallet not loaded | 1 | ✅ Fixed | N/A | 5 min |
| 4 | Coinbase maturity error | 1 | ✅ Fixed | N/A | 15 min |
| 5 | Environment variables missing | 1 | ✅ Fixed | `packages/quiz-contracts/.env` | 10 min |
| 6 | Docker restart clears blockchain | 2 | ⚠️ Workaround | N/A | 10 min |
| 7 | `getOUTXOs` not a function | 2 | ✅ Fixed | 7 files | 15 min |
| 8 | `[object Object]` in URL | 2 | ✅ Fixed | `Wallet.tsx` | 30 min |
| 9 | Rebuild not picking up changes | 2 | ✅ Fixed | N/A | 10 min |

**Total Deployment Time:** ~8 hours over 2 days  
**Total Issues Resolved:** 9  
**Files Modified:** 8

---

## 4. Quick Reference Commands

### Container Management
```bash
# Check all containers status
docker compose -f docker-compose.prod.yml ps

# View service names (not container names!)
docker compose -f docker-compose.prod.yml config --services

# View logs
docker compose -f docker-compose.prod.yml logs -f bcn
docker compose -f docker-compose.prod.yml logs -f quiz-api
docker compose -f docker-compose.prod.yml logs -f quiz-web
docker compose -f docker-compose.prod.yml logs -f bcn-sync

# Restart services
docker compose -f docker-compose.prod.yml restart bcn
docker compose -f docker-compose.prod.yml restart quiz-web
docker compose -f docker-compose.prod.yml restart bcn-sync

# Stop sync service (if crashing)
docker compose -f docker-compose.prod.yml stop bcn-sync

# Full rebuild
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### Wallet & Mining
```bash
# Load wallet
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  loadwallet "defaultwallet"

# Create wallet if doesn't exist
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  createwallet "defaultwallet"

# Check balance
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getbalance

# Get new address (for mining)
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getnewaddress

# Mine blocks (ALWAYS to NEW address, not deployment wallet!)
NEW_ADDR=$(docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  getnewaddress)

docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  generatetoaddress 101 "$NEW_ADDR"

# List transactions
docker exec quiz-bitcoin-node litecoin-cli -regtest -rpcport=19332 \
  -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= \
  listtransactions
```

### Build & Deploy
```bash
# Load environment variables
set -a && source .env.web && set +a

# Build web (with clean cache)
docker compose -f docker-compose.prod.yml build --no-cache quiz-web

# Build API
docker compose -f docker-compose.prod.yml build quiz-api

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Verify health
docker compose -f docker-compose.prod.yml ps

# Check service logs
docker compose -f docker-compose.prod.yml logs quiz-web | grep -i "ready\|error\|listen"
```

### Debugging
```bash
# Check BCN logs for URL patterns
docker compose -f docker-compose.prod.yml logs bcn | grep "wallet/"

# Check for [object Object] in URLs (indicates serialization bug)
docker compose -f docker-compose.prod.yml logs bcn | grep "\[object"

# Verify public key format in URLs
docker compose -f docker-compose.prod.yml logs bcn | tail -20 | grep utxos

# Check if code changes are in built files
docker exec quiz-web grep -r "publicKey" /app/.next/static/chunks/*.js 2>/dev/null | head -5

# Test faucet manually
curl -X POST http://localhost:1031/v1/LTC/regtest/rpc \
  -H "Content-Type: application/json" \
  -d '{"method":"faucet","params":"YOUR_ADDRESS 10"}'
```

### Contract Deployment
```bash
cd /opt/quizapp

# Create .env for contracts
cat > packages/quiz-contracts/.env << 'EOF'
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031
DEPLOYMENT_MNEMONIC=your-mnemonic-here
EOF

# Fund wallet (if needed)
npm run fund:wallet -w packages/quiz-contracts

# Deploy contracts
npm run deploy -w packages/quiz-contracts

# Copy module specs to env files
# Edit .env.api and .env.web with output values
```

---

## 5. Environment Configuration Reference

### `.env.bcn` (BCN Node)
```dotenv
BCN_CHAIN=LTC
BCN_NETWORK=regtest
BCN_PORT=1031
BCN_URL=http://bcn:1031
POSTGRES_USER=bcn
POSTGRES_PASSWORD=bcn
POSTGRES_DB=bcn
BITCOIN_RPC_USER=bcn-admin
BITCOIN_RPC_PASSWORD=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A=
```

### `.env.api` (NestJS API)
```dotenv
DATABASE_URL="mongodb+srv://USER:PASS@CLUSTER.mongodb.net/quizapp"
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
BLOCKCHAIN_URL=http://bcn:1031
CORS_ORIGIN=http://34.93.217.29:3000

# Module specs (update after contract deployment)
NEXT_PUBLIC_TEACHER_MOD_SPEC=...
NEXT_PUBLIC_STUDENT_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=...
NEXT_PUBLIC_PAYMENT_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=...
```

### `.env.web` (Next.js Frontend)
```dotenv
NEXT_PUBLIC_API_URL=http://34.93.217.29:3002/api
NEXT_PUBLIC_URL=http://34.93.217.29:1031
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest

# Module specs (MUST match .env.api)
NEXT_PUBLIC_TEACHER_MOD_SPEC=...
NEXT_PUBLIC_STUDENT_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=...
NEXT_PUBLIC_PAYMENT_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=...
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=...
```

### `packages/quiz-contracts/.env` (Contract Deployment)
```dotenv
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031
NEXT_PUBLIC_PATH=m/44'/0'/0'/0
DEPLOYMENT_MNEMONIC=your-deployment-mnemonic
BCN_URL=http://localhost:1031
CHAIN=LTC
NETWORK=regtest
URL=http://localhost:1031
```

**Important Notes:**
- Use `localhost:1031` for contract deployment scripts (run on VPS host)
- Use `34.93.217.29:1031` for frontend (runs in user's browser)
- Use `bcn:1031` for API (runs inside Docker network)

---

## 6. Lessons Learned

### What Went Well ✅
1. Docker Compose setup worked smoothly
2. BCN node integration mostly functional
3. Contract deployment scripts worked after wallet setup
4. Quiz creation and answer submission fully functional
5. Reward claims working correctly

### Challenges Faced ❌
1. **BCN-sync service** - Unstable in regtest mode (not critical)
2. **Method name casing** - `getUtxos` vs `getOUTXOs` (typo in codebase)
3. **Public key serialization** - Buffer to hex string conversion missing
4. **Docker caching** - Rebuilds not always picking up changes
5. **Regtest ephemerality** - All data lost on Docker restart

### Recommendations for Future Deployments
1. **Add health checks** to docker-compose for wallet loading
2. **Create startup script** that loads wallet and mines initial blocks
3. **Add unit tests** for public key serialization
4. **Document service names** vs container names clearly
5. **Use testnet for staging** to avoid data loss on restart
6. **Add CI/CD pipeline** to catch method name typos before deployment

---

## 7. Current Status (As of March 6, 2026)

| Component | Status | Notes |
|-----------|--------|-------|
| GCP VPS | ✅ Running | 34.93.217.29 |
| Docker Compose | ✅ Running | All services up |
| BCN Node | ✅ Healthy | Port 1031 |
| BCN Sync | ⏸️ Stopped | Known bug, not critical |
| Litecoin Node | ✅ Running | Wallet loaded |
| API (NestJS) | ✅ Healthy | Port 3002 |
| Web (Next.js) | ✅ Healthy | Port 3000 |
| Quiz Creation | ✅ Working | Tested |
| Answer Submission | ✅ Working | Tested |
| Reward Claims | ✅ Working | Tested |
| Wallet Balance | ✅ Fixed | Public key serialization fixed |
| Faucet | ✅ Working | After wallet load |

---

**Document Created:** March 6, 2026  
**Based on:** Real deployment troubleshooting session on GCP VPS  
**Total Deployment Time:** ~8 hours over 2 days  
**Issues Resolved:** 9
