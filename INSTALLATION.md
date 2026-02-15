# Complete Installation Guide - Quiz App

This guide covers the complete setup of the Quiz App monorepo including frontend, backend API, and blockchain contracts.

## 📋 Prerequisites

### Required Software

1. **Node.js & npm**
   - Node.js 18+ 
   - npm 10+
   - Check: `node --version` and `npm --version`

2. **PostgreSQL** (for API database)
   - PostgreSQL 14+
   - Installation:
     - Windows: https://www.postgresql.org/download/windows/
     - Mac: `brew install postgresql`
     - Linux: `sudo apt install postgresql`

3. **Git**
   - For version control
   - Check: `git --version`

### Optional (Development)
- **Docker** - For containerized PostgreSQL
- **Prisma Studio** - Visual database browser (included with Prisma)

## 🚀 Step-by-Step Installation

### Step 1: Clone & Navigate

```bash
# If not already cloned
git clone https://github.com/your-username/quiz-app-monorepo
cd quiz-app-monorepo

# Or just navigate if already cloned
cd QuizApp
```

### Step 2: Install All Dependencies

```bash
# Install root and all workspace dependencies
npm install
```

This will install dependencies for:
- Root workspace
- `apps/web` (Next.js frontend)
- `apps/api` (NestJS backend)
- `packages/sdk`
- `packages/shared`
- `packages/quiz-contracts`

**Expected time:** 2-5 minutes depending on connection

### Step 3: Setup PostgreSQL Database

#### Option A: Local PostgreSQL

1. **Create Database:**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE quizapp;
   
   # Exit
   \q
   ```

2. **Note your connection string:**
   ```
   postgresql://postgres:your_password@localhost:5432/quizapp
   ```

#### Option B: Docker PostgreSQL

```bash
# Pull and run PostgreSQL
docker run --name quizapp-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=quizapp \
  -p 5432:5432 \
  -d postgres:14

# Connection string:
# postgresql://postgres:password@localhost:5432/quizapp
```

### Step 4: Configure Environment Variables

#### 4a. Frontend Environment (apps/web/.env.local)

```bash
# Copy template
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# Module specs (add after deployment - Step 7)
NEXT_PUBLIC_TEACHER_MOD=
NEXT_PUBLIC_STUDENT_MOD=
NEXT_PUBLIC_QUIZ_MOD=
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=
NEXT_PUBLIC_PAYMENT_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=
```

#### 4b. Backend API Environment (apps/api/.env)

```bash
# Copy template
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/quizapp?schema=public"

# API Server
PORT=3001
NODE_ENV=development

# Blockchain Configuration
BLOCKCHAIN_CHAIN=LTC
BLOCKCHAIN_NETWORK=regtest
BLOCKCHAIN_URL=http://localhost:1031

# CORS (allow frontend)
CORS_ORIGIN=http://localhost:3000

# Module specs (add after deployment)
TEACHER_MOD=
STUDENT_MOD=
QUIZ_MOD=
QUIZ_ATTEMPT_MOD=
PAYMENT_MOD=
QUIZ_ACCESS_MOD=
QUIZ_ACCESS_SALE_MOD=
```

### Step 5: Build Packages in Order

```bash
# Build shared types first
npm run build:shared

# Build SDK
npm run build:sdk

# Build web
npm run build:web

# Build API
npm run build:api
```

**Note:** Order matters due to dependencies!

### Step 6: Setup Database (Prisma)

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# When prompted for migration name, enter:
# "initial_schema"
```

**Verify:** Check that tables were created:
```bash
npm run prisma:studio
# Opens UI at http://localhost:5555
```

### Step 7: Deploy Smart Contracts

**Important:** Make sure you have a Bitcoin Computer node running or access to testnet/mainnet.

For local development (regtest):
```bash
# Fund deployment wallet (regtest only)
npm run fund:wallet

# Deploy contracts
npm run deploy
```

**Output will look like:**
```
NEXT_PUBLIC_TEACHER_MOD=<contract-mod-spec>
NEXT_PUBLIC_STUDENT_MOD=<contract-mod-spec>
...
```

**Copy these values to:**
1. `apps/web/.env.local` (with NEXT_PUBLIC_ prefix)
2. `apps/api/.env` (without prefix)

### Step 8: Start Development Servers

Open **3 terminals**:

#### Terminal 1: Frontend (Next.js)
```bash
npm run dev:web
# Opens at http://localhost:3000
```

#### Terminal 2: Backend API (NestJS)
```bash
npm run dev:api
# Opens at http://localhost:3001
# Swagger docs at http://localhost:3001/api
```

#### Terminal 3: Blockchain Node (if using regtest)
```bash
# Start your Bitcoin Computer node
# (specific command depends on your setup)
```

### Step 9: Verify Installation

Open your browser and check:

1. **Frontend:** http://localhost:3000
   - Should see Quiz App homepage
   - No console errors

2. **API Swagger:** http://localhost:3001/api
   - Should see Swagger UI
   - Test endpoints

3. **Prisma Studio (optional):** 
   ```bash
   npm run prisma:studio
   ```
   - Opens at http://localhost:5555
   - View database tables

## ✅ Installation Complete!

Your Quiz App is now fully set up with:
- ✅ Frontend (Next.js) running on port 3000
- ✅ Backend API (NestJS) running on port 3001
- ✅ PostgreSQL database configured
- ✅ Smart contracts deployed
- ✅ All packages built

## 🎯 Quick Test

1. Go to http://localhost:3000
2. Click "Teacher" or "Student"
3. Explore the dashboards

## 📦 What Was Installed

```
Total Packages:
- Root: ~15 packages
- apps/web: ~25 packages (Next.js, React, Tailwind, etc.)
- apps/api: ~35 packages (NestJS, Prisma, etc.)
- packages/sdk: ~5 packages
- packages/shared: ~3 packages
- packages/quiz-contracts: ~20 packages

Total: ~100 packages
Disk Space: ~500-800 MB
```

## 🔧 Development Workflow

### Daily Development

```bash
# Start everything
npm run dev:web     # Terminal 1
npm run dev:api     # Terminal 2

# Make changes, hot reload works!
```

### After Contract Changes

```bash
# Redeploy contracts
npm run deploy

# Update module specs in .env files
# Restart servers
```

### After SDK/Shared Changes

```bash
npm run build:sdk      # or build:shared
# Frontend/API will pick up changes
```

### Database Changes

```bash
# Edit prisma/schema.prisma
npm run prisma:migrate
npm run prisma:generate
# Restart API
```

## 🐛 Troubleshooting

### Issue: "Module not found @quiz-app/sdk"
```bash
# Rebuild SDK
npm run build:sdk
```

### Issue: "Prisma Client not generated"
```bash
npm run prisma:generate
```

### Issue: "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL in apps/api/.env
- Test connection: `psql -U postgres -d quizapp`

### Issue: "Port 3000/3001 already in use"
```bash
# Kill process on port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: "Contract deployment failed"
- Check blockchain node is running
- Verify you have funds: `npm run fund:wallet`
- Check BLOCKCHAIN_URL in .env

## 📚 Additional Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [apps/web/README.md](apps/web/README.md) - Frontend docs
- [apps/api/README.md](apps/api/README.md) - API docs
- [QUICK_START.md](QUICK_START.md) - Quick start guide

## 🆘 Getting Help

1. Check [TODO.md](TODO.md) for known issues
2. Review error logs in terminal
3. Check Prisma Studio for database issues
4. Verify environment variables are set correctly

## 🎉 Next Steps

1. **Create your first quiz** as Teacher
2. **Take a quiz** as Student
3. **Check the leaderboard**
4. **Explore the API** at http://localhost:3001/api
5. **View database** with Prisma Studio

Happy coding! 🚀
