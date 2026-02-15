# Quiz App Monorepo - New Structure

This document explains the migration to the new clean architecture.

## What Changed

### Old Structure
```
packages/
  quiz-app/          # Next.js frontend (everything mixed together)
  quiz-contracts/    # Smart contracts
```

### New Structure
```
apps/
  web/              # Next.js frontend (clean architecture)
packages/
  quiz-contracts/   # Smart contracts (UNCHANGED)
  sdk/             # NEW - Client wrapper around contracts
  shared/          # NEW - Shared types and utilities
```

## Key Improvements

### 1. **Separation of Concerns**

**Before:** Business logic mixed with UI components in `src/app/`

**After:** Clean layered architecture:
- `src/app/` - Only routes and layouts
- `src/features/` - Feature modules
- `src/services/` - Business logic
- `src/stores/` - State management
- `src/config/` - Configuration
- `src/lib/` - Utilities
- `src/hooks/` - Shared React hooks
- `src/components/` - Reusable UI components

### 2. **SDK Package**

**Before:** Frontend directly called helpers from `@quiz-app/contracts`

**After:** Clean SDK clients wrap contract complexity:
```typescript
import { TeacherClient, QuizClient } from '@quiz-app/sdk'

const teacherClient = new TeacherClient(computer)
const quiz = await teacherClient.createQuiz(quizData)
```

### 3. **Shared Package**

**Before:** Types and utilities duplicated across files

**After:** Centralized shared types, constants, and utilities:
```typescript
import { QuizData, formatSats, SATOSHIS_PER_BTC } from '@quiz-app/shared'
```

### 4. **Configuration System**

**Before:** Hardcoded URLs and config scattered everywhere

**After:** Centralized config with BASE_URL pattern:
```typescript
import { BASE_URL, BLOCKCHAIN_CONFIG, getComputerConfig } from '@/config'

// If BASE_URL changes, all derived endpoints update automatically
```

### 5. **State Management**

**Before:** Context + scattered state

**After:** Zustand stores with persistence:
```typescript
import { useWalletStore, useSessionStore } from '@/stores'

const { publicKey, isConnected, connect } = useWalletStore()
```

## Migration Guide

### For Developers

1. **Environment Variables**
   - Copy `apps/web/.env.example` to `apps/web/.env.local`
   - Set `NEXT_PUBLIC_URL` (all endpoints derive from this)
   - After deployment, add module specs

2. **Imports**
   - Use path aliases: `@/config`, `@/services`, `@/hooks`, etc.
   - Import from SDK: `import { TeacherClient } from '@quiz-app/sdk'`
   - Import shared types: `import { QuizData } from '@quiz-app/shared'`

3. **Working with Contracts**
   ```typescript
   // Old way (still works in contracts package)
   import { TeacherHelper } from '@quiz-app/contracts'
   
   // New way (frontend)
   import { useTeacherClient } from '@/hooks'
   const teacherClient = useTeacherClient()
   ```

4. **State Management**
   ```typescript
   // Wallet state
   import { useWallet } from '@/hooks'
   const { publicKey, connect, disconnect } = useWallet()
   
   // Session state
   import { useSessionStore } from '@/stores'
   const { role, setRole } = useSessionStore()
   ```

### Running the App

```bash
# Install dependencies
npm install

# Run web app (default)
npm run dev

# Or specifically
npm run dev:web

# Build packages
npm run build:shared    # Build shared types
npm run build:sdk       # Build SDK
npm run build:web       # Build web app

# Deploy contracts
npm run deploy

# Run tests
npm test
```

## File Migration Map

| Old Path | New Path |
|----------|----------|
| `packages/quiz-app/src/app/helpers/*.ts` | `packages/sdk/src/clients/*.ts` |
| `packages/quiz-app/src/app/types/*.ts` | `packages/shared/src/types/*.ts` |
| `packages/quiz-app/` | `apps/web/` |
| `packages/quiz-contracts/` | (UNCHANGED) |

## Benefits

1. ✅ **Clean separation** - UI never touches contract helpers directly
2. ✅ **Reusable SDK** - Can be used in backend/indexer later
3. ✅ **Type safety** - Shared types across packages
4. ✅ **Easy debugging** - Layered architecture with clear boundaries
5. ✅ **BASE_URL pattern** - Change one config, update everywhere
6. ✅ **State management** - Persistent wallet/session state
7. ✅ **Maintainable** - Enterprise-level structure

## Next Steps

1. Migrate existing features to feature modules
2. Add backend API (NestJS) to `apps/api/`
3. Add indexer to `apps/indexer/`
4. Extract UI components to `packages/ui/`
5. Add Prisma DB for fast queries
