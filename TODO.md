# Next Steps - Quiz App Migration

## ✅ What's Done

The monorepo has been restructured with a clean, enterprise-level architecture:

1. **New Folder Structure Created**
   - `apps/web/` - Clean Next.js frontend
   - `packages/sdk/` - SDK client wrappers
   - `packages/shared/` - Shared types and utilities
   - `packages/quiz-contracts/` - UNCHANGED (perfect as-is)

2. **Configuration System**
   - BASE_URL pattern implemented
   - Centralized config in `apps/web/src/config/`
   - Environment template created

3. **State Management**
   - Zustand stores for wallet and session
   - Persistent storage

4. **SDK Layer**
   - Clean client wrappers for all contract types
   - TeacherClient, StudentClient, QuizClient, etc.

5. **Shared Package**
   - Common types, constants, utilities
   - Reusable across all packages

6. **Basic App Structure**
   - Root layout and providers
   - Stub pages for teacher, student, wallet, leaderboard
   - Basic UI components

7. **Documentation**
   - ARCHITECTURE.md - Detailed architecture docs
   - MIGRATION_GUIDE.md - Migration instructions
   - Updated README.md

## 🔄 Migration Tasks

### 1. Old Quiz App Content (Priority: HIGH)

The old `packages/quiz-app/` content needs to be migrated to `apps/web/`:

**Components to Migrate:**
```bash
FROM: packages/quiz-app/src/app/common-components/
  ├── Auth.tsx
  ├── Card.tsx
  ├── ComputerContext.tsx
  ├── Drawer.tsx
  ├── Err.tsx
  ├── Gallery.tsx
  ├── Loader.tsx
  ├── Modal.tsx
  ├── Navbar.tsx
  ├── SmartObject.tsx
  ├── SnackBar.tsx
  ├── Transaction.tsx
  ├── UtilsContext.tsx
  └── Wallet.tsx

TO: apps/web/src/components/
  OR apps/web/src/features/[feature]/components/
```

**Pages to Migrate:**
```bash
FROM: packages/quiz-app/src/app/
  ├── teacher/page.tsx
  ├── student/page.tsx
  ├── quizzes/page.tsx
  ├── deploy/page.tsx
  ├── mint/page.tsx
  └── wallet/page.tsx

TO: apps/web/src/app/
  (Refactor to use SDK + hooks instead of direct contract calls)
```

**Helpers Need SDK Integration:**
The old helpers in `packages/quiz-app/src/app/helpers/` are now replaced by:
- SDK clients in `packages/sdk/`
- Feature services in `apps/web/src/features/*/services/`

### 2. Update Imports (Priority: HIGH)

Search and replace in migrated files:

```typescript
// OLD
import { TeacherHelper } from '@quiz-app/contracts'
import { Computer } from '@bitcoin-computer/lib'
const helper = new TeacherHelper(computer)

// NEW
import { useTeacherClient } from '@/hooks'
const teacherClient = useTeacherClient()
```

### 3. Environment Setup (Priority: HIGH)

```bash
# 1. Copy env template
cp apps/web/.env.example apps/web/.env.local

# 2. Configure blockchain
# Edit apps/web/.env.local:
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# 3. Deploy contracts
npm run deploy

# 4. Copy module specs from deploy output to .env.local
```

### 4. Install Dependencies (Priority: HIGH)

```bash
# Root level
npm install

# Workspace install
npm install --workspaces

# Build packages in order
npm run build:shared
npm run build:sdk
npm run build:web
```

### 5. Remove Old Package (Priority: MEDIUM)

After migration is complete:

```bash
# Verify apps/web works
npm run dev

# Test thoroughly
npm test

# Then remove old package
rm -rf packages/quiz-app/
```

### 6. Create Feature Modules (Priority: MEDIUM)

Organize migrated components into features:

```
apps/web/src/features/
  quiz/
    components/
      QuizCard.tsx
      QuizForm.tsx
      QuizList.tsx
    hooks/
      useQuizzes.ts
      useCreateQuiz.ts
    services/
      quizService.ts
    types.ts

  access/
    components/
      BuyAccessModal.tsx
      AccessStatusBadge.tsx
    hooks/
      useBuyAccess.ts
    services/
      accessService.ts

  payments/
    components/
      WithdrawPaymentDialog.tsx
      PaymentHistory.tsx
    hooks/
      useWithdrawPayment.ts
    services/
      paymentService.ts

  leaderboard/
    components/
      LeaderboardTable.tsx
    hooks/
      useLeaderboard.ts
    services/
      leaderboardService.ts
```

### 7. Update Imports to Use Path Aliases (Priority: LOW)

```typescript
// Use path aliases defined in tsconfig.json
import { Button } from '@/components'
import { useQuizzes } from '@/features/quiz/hooks'
import { getComputer } from '@/services'
import { useWalletStore } from '@/stores'
import { BASE_URL } from '@/config'
import { formatSats } from '@/lib'
```

## 🎯 Testing Checklist

After migration:

- [ ] App runs: `npm run dev`
- [ ] Can build: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Wallet connects
- [ ] Teacher can create quiz
- [ ] Student can buy access
- [ ] Student can attempt quiz
- [ ] Payments work
- [ ] Withdrawals work

## 📝 Optional Enhancements (Future)

### Short Term
- [ ] Add better error boundaries
- [ ] Add loading states
- [ ] Add toast notifications
- [ ] Add form validation
- [ ] Improve mobile responsiveness

### Medium Term
- [ ] Add NestJS backend (`apps/api/`)
- [ ] Add Prisma DB for fast queries
- [ ] Add indexer (`apps/indexer/`)
- [ ] Extract UI library (`packages/ui/`)

### Long Term
- [ ] Add GraphQL API
- [ ] Add real-time subscriptions
- [ ] Add analytics dashboard
- [ ] Add multi-language support

## 🆘 Help & References

- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Migration:** See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **README:** See [README.md](README.md)
- **Bitcoin Computer:** https://docs.bitcoincomputer.io/

## 📞 Common Issues

### Issue: Module not found '@quiz-app/sdk'
**Solution:** Build SDK first
```bash
npm run build:sdk
```

### Issue: TypeScript errors in imports
**Solution:** Check path aliases in tsconfig.json and ensure packages are built

### Issue: Zustand store not persisting
**Solution:** Check STORAGE_KEYS in config and browser localStorage

### Issue: Computer instance errors
**Solution:** Verify .env.local has correct BASE_URL and all required env vars
