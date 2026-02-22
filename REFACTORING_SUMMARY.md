# Refactoring Summary: Helper-Based Client Architecture

## Overview

Successfully refactored the web app to use **helper classes from `@quiz-app/contracts`** instead of duplicating logic in browser-specific clients. This creates a **single source of truth** for all business logic.

## Changes Made

### 1. Created Helper-Based Clients in Web App

**New Files:**
- `apps/web/src/services/bc/HelperQuizClient.ts`
- `apps/web/src/services/bc/HelperTeacherClient.ts`
- `apps/web/src/services/bc/HelperAttemptClient.ts`
- `apps/web/src/services/bc/HelperAccessClient.ts`

These clients **wrap the tested helpers** from `@quiz-app/contracts`:
- `HelperQuizClient` → wraps `QuizHelper`, `TeacherHelper`
- `HelperTeacherClient` → wraps `TeacherHelper`
- `HelperAttemptClient` → wraps `AttemptHelper`, `StudentHelper`
- `HelperAccessClient` → wraps `QuizAccessHelper`

### 2. Updated SDK Factory

**File:** `apps/web/src/services/bc/index.ts`

Added new factory classes:
```typescript
// ✅ NEW - Recommended
export class HelperSDKFactory {
  createQuizClient(): HelperQuizClient
  createTeacherClient(): HelperTeacherClient
  createAttemptClient(): HelperAttemptClient
  createAccessClient(): HelperAccessClient
}

// ⚠️ DEPRECATED - Legacy
export class BrowserSDKFactory {
  createQuizClient(): BrowserQuizClient
  createTeacherClient(): BrowserTeacherClient
  createAttemptClient(): BrowserAttemptClient
  createAccessClient(): BrowserAccessClient
}
```

### 3. Updated React Hooks

**File:** `apps/web/src/hooks/useClients.ts`

Added new hooks:
```typescript
// ✅ NEW - Recommended
export function useHelperSDK()
export function useQuizClient(): HelperQuizClient
export function useTeacherClient(): HelperTeacherClient
export function useAttemptClient(): HelperAttemptClient
export function useAccessClient(): HelperAccessClient

// ⚠️ DEPRECATED
export function useBrowserSDK()
```

### 4. Updated Services

**File:** `apps/web/src/features/quizzes/quizzes.service.ts`

Updated type signatures to use helper-based clients:
```typescript
// Before
export async function createQuiz(
  teacherClient: BrowserTeacherClient,
  params: CreateQuizParams
): Promise<Quiz>

// After
export async function createQuiz(
  teacherClient: HelperTeacherClient,
  params: CreateQuizParams
): Promise<Quiz>
```

### 5. Deprecated Old Browser* Clients

Added deprecation headers to:
- `BrowserQuizClient.ts`
- `BrowserTeacherClient.ts`
- `BrowserAttemptClient.ts`
- `BrowserAccessClient.ts`

These files are kept for **backward compatibility** but should not be used in new code.

### 6. Fixed Build Issues

**File:** `apps/web/src/app/student/page.tsx`
- Fixed `getAllQuizzes()` call (removed invalid argument)

**File:** `apps/web/next.config.ts`
- Added `turbopack: {}` config to silence build warning

### 7. Documentation

**New Files:**
- `apps/web/src/services/bc/README.md` - Comprehensive guide for helper-based clients
- `REFACTORING_SUMMARY.md` - This file

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Web Frontend                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Helper*Client (NEW - RECOMMENDED)             │     │
│  │  - Uses @quiz-app/contracts helpers            │     │
│  │  - Single source of truth                      │     │
│  └────────────────────────────────────────────────┘     │
│                      │                                   │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │  @quiz-app/contracts (packages/quiz-contracts) │     │
│  │  - QuizHelper, TeacherHelper, StudentHelper    │     │
│  │  - AttemptHelper, PaymentHelper                │     │
│  │  - QuizAccessHelper, LeaderboardHelper         │     │
│  │  - ALL TESTED ✅                                │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │ Bitcoin Computer │
            │ Blockchain       │
            └──────────────────┘
```

## Benefits

### 1. **Single Source of Truth**
All business logic lives in `@quiz-app/contracts/helpers`. No more duplication.

### 2. **Tested Code**
Helpers are thoroughly tested in the quiz-contracts package:
```bash
cd packages/quiz-contracts
npm run test:teacher-helper
npm run test:student-helper
npm run test:quiz-helper
npm run test:payment
```

### 3. **Code Reuse**
Same helpers work in:
- Backend tests
- Frontend web app
- Future mobile apps

### 4. **Easier Maintenance**
Changes to helpers automatically propagate to all consumers.

### 5. **Type Safety**
Full TypeScript support with proper types exported from `@quiz-app/contracts`.

## Migration Guide

### For Developers

**Old Code (DEPRECATED):**
```typescript
import { BrowserQuizClient } from '@/services/bc'
import { useBrowserSDK } from '@/hooks/useClients'

const quizClient = new BrowserQuizClient(computer)
// or
const quizClient = useBrowserSDK().createQuizClient()
```

**New Code (RECOMMENDED):**
```typescript
import { HelperQuizClient } from '@/services/bc'
import { useQuizClient } from '@/hooks/useClients'

const quizClient = new HelperQuizClient(computer)
// or (in React components)
const quizClient = useQuizClient()
```

### Example Usage

#### Creating a Quiz
```typescript
import { useTeacherClient } from '@/hooks/useClients'

function CreateQuizForm() {
  const teacherClient = useTeacherClient()
  
  const handleCreate = async (data) => {
    const quiz = await teacherClient.createQuiz({
      title: data.title,
      questionText: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      rewardAmount: BigInt(data.reward),
      entryFee: BigInt(data.entryFee),
    })
    console.log('Quiz created:', quiz._id)
  }
}
```

#### Attempting a Quiz
```typescript
import { useAttemptClient, useAccessClient } from '@/hooks/useClients'

function AttemptQuiz({ quizId }) {
  const attemptClient = useAttemptClient()
  const accessClient = useAccessClient()
  
  const handleSubmit = async (answer) => {
    // Purchase access token first
    const access = await accessClient.purchase(quizId, price)
    
    // Submit attempt
    const result = await attemptClient.submitAttempt(
      quizId,
      answer,
      access._id
    )
    
    if (result.isCorrect) {
      console.log('Won!', result.rewardEarned)
    }
  }
}
```

## File Structure

```
apps/web/src/services/bc/
├── HelperQuizClient.ts          # ✅ NEW - Recommended
├── HelperTeacherClient.ts       # ✅ NEW - Recommended
├── HelperAttemptClient.ts       # ✅ NEW - Recommended
├── HelperAccessClient.ts        # ✅ NEW - Recommended
├── BrowserQuizClient.ts         # ⚠️ DEPRECATED
├── BrowserTeacherClient.ts      # ⚠️ DEPRECATED
├── BrowserAttemptClient.ts      # ⚠️ DEPRECATED
├── BrowserAccessClient.ts       # ⚠️ DEPRECATED
├── index.ts                     # Exports both
├── txUtils.ts                   # Utilities
└── README.md                    # Documentation
```

## Testing

### Build Verification
```bash
# Build quiz-contracts (source of truth)
cd packages/quiz-contracts
npm run build  # ✅ Success

# Build web app
cd apps/web
npm run build  # ✅ Success (with minor existing issues)
```

### Helper Tests
All helpers are tested in the quiz-contracts package:
```bash
cd packages/quiz-contracts

# Run all tests
npm test

# Run specific helper tests
npm run test:teacher-helper
npm run test:student-helper
npm run test:quiz-helper
npm run test:payment
npm run test:quiz-access
```

## Known Issues

1. **AttemptForm Component**: The attempt page needs to handle access token purchase before attempting. This is an **existing issue** not related to this refactoring.

2. **Browser*Client Deprecation**: Old clients are kept for backward compatibility. They should be removed after full migration.

## Next Steps

### Immediate
1. ✅ Use helper-based clients in all new code
2. ✅ Update existing components gradually
3. ✅ Test all quiz operations

### Future
1. Remove deprecated `Browser*Client` files
2. Migrate all components to use `useQuizClient()`, `useTeacherClient()`, etc.
3. Add more comprehensive E2E tests

## Conclusion

This refactoring establishes a **clean, maintainable architecture** where:
- Business logic lives in `@quiz-app/contracts` (tested, reusable)
- Web app uses thin wrappers (Helper*Client) around helpers
- No code duplication
- Single source of truth

The migration is **backward compatible** - old code continues to work while new code uses the improved architecture.
