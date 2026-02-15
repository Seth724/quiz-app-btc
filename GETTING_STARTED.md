# Getting Started Guide

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Bitcoin Computer node running (for regtest)

## Initial Setup

### 1. Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

This will install dependencies for all packages and apps.

### 2. Environment Configuration

Create `.env.local` in `apps/web/`:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Module Specs (update after deploying contracts)
NEXT_PUBLIC_TEACHER_MOD=<teacher-module-spec>
NEXT_PUBLIC_STUDENT_MOD=<student-module-spec>
NEXT_PUBLIC_QUIZ_MOD=<quiz-module-spec>
NEXT_PUBLIC_ATTEMPT_MOD=<attempt-module-spec>
NEXT_PUBLIC_PAYMENT_MOD=<payment-module-spec>
NEXT_PUBLIC_QUIZ_ACCESS_MOD=<quiz-access-module-spec>
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=<quiz-access-sale-module-spec>
```

Create `.env` in `apps/api/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quizapp"

# Server Configuration
PORT=3001

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup (Optional)

If using the NestJS backend:

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 4. Deploy Smart Contracts

```bash
cd packages/quiz-contracts
pnpm run deploy
```

This will output module specs. Copy them to your `.env.local` file.

### 5. Update Config Files

Update `apps/web/src/config/constants.ts` with your module specs:

```typescript
export const MODULE_SPECS = {
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  // ... etc
}
```

## Running the Application

### Development Mode

From the root:

```bash
# Run everything (web + api)
pnpm dev

# Or run individually:
pnpm --filter web dev          # Frontend only
pnpm --filter api dev          # Backend only
```

Frontend: http://localhost:3000  
Backend API: http://localhost:3001

### Build for Production

```bash
pnpm build
```

## Using the Application

### 1. Connect Wallet

1. Navigate to http://localhost:3000
2. Click "Connect Wallet" or go to `/wallet`
3. Generate or enter a mnemonic
4. Select chain, network, and URL
5. Click "Connect Wallet"

### 2. As a Teacher

1. Go to `/teacher` (or click "Teacher" in nav)
2. Click "Create Quiz"
3. Fill in quiz details:
   - Title and description
   - Add questions with 4 options each
   - Select correct answer
   - Set reward per question
   - Set access price
4. Click "Create Quiz"
5. Quiz is saved on-chain and synced to backend

### 3. As a Student

1. Go to `/student` (or click "Student" in nav)
2. Browse available quizzes
3. Click on a quiz to view details
4. Click "Purchase Access & Start Quiz"
5. Confirm purchase in modal
6. Take the quiz:
   - Answer each question
   - Navigate with Previous/Next
   - Submit when done
7. View results and earned rewards

### 4. View Leaderboard

1. Click "Leaderboard" in navigation
2. See global rankings
3. Your position is highlighted if logged in

## Architecture Overview

### Frontend Structure

```
apps/web/src/
├── app/                    # Next.js pages (routes only)
├── features/               # Vertical slices
│   ├── wallet/
│   ├── quizzes/
│   ├── access/
│   ├── attempts/
│   ├── payments/
│   └── leaderboard/
├── components/             # Shared UI
│   ├── layout/
│   └── bc/                # Bitcoin Computer components
├── services/              # Cross-cutting services
│   ├── sdk.factory.ts
│   ├── api.client.ts
│   └── tx/
├── stores/                # Zustand state
│   ├── wallet.store.ts
│   └── session.store.ts
├── hooks/                 # App-wide hooks
├── lib/                   # Utilities
└── config/                # Configuration
```

### Key Concepts

#### Features (Vertical Slices)

Each feature contains:
- **Service**: Business logic
- **Components**: UI components
- **Hooks**: Data fetching hooks

Example:
```typescript
features/quizzes/
├── quizzes.service.ts      # Logic
├── components/             # UI
└── hooks/                  # Data
```

#### Service Layer

Services orchestrate between features:
- `sdk.factory.ts` - Create SDK clients
- `api.client.ts` - Backend API calls
- `tx/txParser.ts` - Parse blockchain transactions

#### State Management

Zustand stores for:
- **Wallet**: Connection, balance, config
- **Session**: User role, data

#### Data Flow

```
Component → Hook → Service → SDK/API → Blockchain/Backend
    ↓
  Store ← Response
    ↓
Re-render
```

## Common Tasks

### Add a New Feature

1. Create feature folder:
```bash
mkdir -p apps/web/src/features/my-feature
```

2. Create structure:
```
my-feature/
├── my-feature.service.ts
├── components/
│   └── MyFeatureComponent.tsx
├── hooks/
│   └── useMyFeature.ts
└── index.ts
```

3. Export from index:
```typescript
export * from './my-feature.service'
export * from './components'
export * from './hooks'
```

4. Add to features index:
```typescript
// features/index.ts
export * from './my-feature'
```

5. Use in pages:
```typescript
import { MyFeatureComponent } from '@/features/my-feature'
```

### Add a New Page

1. Create page file in `app/`:
```typescript
// app/my-page/page.tsx
'use client'

import { MyFeature } from '@/features/my-feature'

export default function MyPage() {
  return <MyFeature />
}
```

2. Add navigation link (optional):
```typescript
// components/layout/Navigation.tsx
{ href: '/my-page', label: 'My Page', show: true }
```

### Call a Smart Contract

```typescript
import { useQuizClient } from '@/hooks'

const quizClient = useQuizClient()
const quiz = await quizClient.create(title, description, questions, reward, price)
```

### Call the Backend API

```typescript
import { apiClient } from '@/services'

const quizzes = await apiClient.getQuizzes({ limit: 10 })
```

## Bitcoin Computer Components

The app includes pre-built components from `@bitcoin-computer/components`:

Available in `/components/bc/`:
- `Auth` - Authentication
- `Wallet` - Wallet management
- `SmartObject` - Display smart objects
- `Transaction` - Transaction display
- `Modal` - Modal dialogs
- `Card` - Card component
- etc.

## Troubleshooting

### Wallet Connection Issues

- Ensure Bitcoin Computer node is running
- Check URL in environment variables
- Verify network (regtest/testnet/mainnet)

### Module Spec Errors

- Deploy contracts first
- Copy module specs to `.env.local`
- Update `config/constants.ts`

### API Connection Issues

- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings

### Type Errors

Most type errors are from missing package installations:
- Run `pnpm install` from root
- Build packages: `pnpm --filter @quiz-app/sdk build`

## Testing

### Manual Testing Flow

1. Connect wallet
2. Create teacher account
3. Create a quiz
4. Switch to student account
5. Purchase quiz access
6. Take quiz
7. View results
8. Check leaderboard

### Unit Tests (To be added)

```bash
pnpm test
```

## Deployment

### Frontend (Vercel)

```bash
vercel --prod
```

### Backend (Railway)

```bash
railway up
```

### Environment Variables

Set all production environment variables in your deployment platform.

## Resources

- [Architecture Documentation](./ARCHITECTURE_DETAILED.md)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)
- [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/)
- [Next.js Docs](https://nextjs.org/docs)

## Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Verify environment setup
4. Check blockchain node status

## Next Steps

1. ✅ Architecture implemented
2. ⏳ Deploy contracts
3. ⏳ Configure environment
4. ⏳ Test end-to-end
5. ⏳ Deploy to production
