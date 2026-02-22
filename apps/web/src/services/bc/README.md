# Helper-Based Client Architecture

## Overview

This directory contains **helper-based client wrappers** that use the tested helper classes from `@quiz-app/contracts` package. This is the **RECOMMENDED** approach for building quiz functionality in the web app.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Web App (frontend)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Helper*Client (NEW - RECOMMENDED)                   │   │
│  │  - HelperQuizClient                                  │   │
│  │  - HelperTeacherClient                               │   │
│  │  - HelperAttemptClient                               │   │
│  │  - HelperAccessClient                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  @quiz-app/contracts (Single Source of Truth)        │   │
│  │  - QuizHelper, TeacherHelper, StudentHelper          │   │
│  │  - AttemptHelper, PaymentHelper                      │   │
│  │  - QuizAccessHelper, LeaderboardHelper               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Bitcoin Computer  │
                  │  Blockchain        │
                  └────────────────────┘
```

## Migration Guide

### Old Approach (DEPRECATED)
```typescript
import { BrowserQuizClient, BrowserTeacherClient } from '@/services/bc'

const quizClient = new BrowserQuizClient(computer)
const teacherClient = new BrowserTeacherClient(computer)
```

### New Approach (RECOMMENDED)
```typescript
import { HelperQuizClient, HelperTeacherClient } from '@/services/bc'
// Or use hooks:
import { useQuizClient, useTeacherClient } from '@/hooks/useClients'

const quizClient = new HelperQuizClient(computer)
// Or in React components:
const quizClient = useQuizClient()
```

## Available Helper Clients

### HelperQuizClient
Wraps `QuizHelper` from `@quiz-app/contracts`

```typescript
import { useQuizClient } from '@/hooks/useClients'

function MyComponent() {
  const quizClient = useQuizClient()
  
  // Create quiz
  const quiz = await quizClient.createQuiz(quizData)
  
  // Get quiz
  const quiz = await quizClient.getQuiz(quizId)
  
  // Get all quizzes
  const quizzes = await quizClient.getAllQuizzes()
  
  // Get teacher's quizzes
  const quizzes = await quizClient.getQuizzesByTeacher(teacherPublicKey)
  
  // Deactivate quiz
  await quizClient.deactivateQuiz(quizId)
  
  // Check if student can attempt
  const canAttempt = await quizClient.canStudentAttempt(quizId, studentPublicKey)
}
```

### HelperTeacherClient
Wraps `TeacherHelper` from `@quiz-app/contracts`

```typescript
import { useTeacherClient } from '@/hooks/useClients'

function MyComponent() {
  const teacherClient = useTeacherClient()
  
  // Create teacher
  const teacher = await teacherClient.createTeacher(name, publicKey)
  
  // Get or create teacher
  const teacher = await teacherClient.getOrCreateTeacher(name, publicKey)
  
  // Create quiz (handles payment + quiz creation)
  const quiz = await teacherClient.createQuiz(quizData)
  
  // Get teacher's quizzes
  const quizzes = await teacherClient.getTeacherQuizzes(teacherPublicKey)
}
```

### HelperAttemptClient
Wraps `AttemptHelper` and `StudentHelper` from `@quiz-app/contracts`

```typescript
import { useAttemptClient } from '@/hooks/useClients'

function MyComponent() {
  const attemptClient = useAttemptClient()
  
  // Submit attempt with access token
  const result = await attemptClient.submitAttempt(
    quizId,
    selectedAnswer,
    accessTokenId
  )
  
  // Get attempt
  const attempt = await attemptClient.getAttempt(attemptId)
  
  // Get student's attempts
  const attempts = await attemptClient.getStudentAttempts(studentPublicKey)
}
```

### HelperAccessClient
Wraps `QuizAccessHelper` from `@quiz-app/contracts`

```typescript
import { useAccessClient } from '@/hooks/useClients'

function MyComponent() {
  const accessClient = useAccessClient()
  
  // Purchase access (mint token)
  const access = await accessClient.purchase(quizId, price)
  
  // Check access
  const hasAccess = await accessClient.checkAccess(studentId, quizId)
  
  // List access tokens
  const accesses = await accessClient.listByStudent(studentId)
  
  // Mint access token
  const token = await accessClient.mintAccess(quizId, amount)
  
  // Get balance
  const balance = await accessClient.getBalance(quizId)
  
  // Transfer access
  await accessClient.transferAccess(to, amount, quizId)
}
```

## Benefits

1. **Single Source of Truth**: Business logic lives in `@quiz-app/contracts` helpers
2. **Tested Code**: Helpers are thoroughly tested in the quiz-contracts package
3. **Code Reuse**: Same helpers work in tests and frontend
4. **Cleaner Architecture**: No duplication of logic
5. **Easier Maintenance**: Changes to helpers automatically propagate to web app

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
├── index.ts                     # Exports both Helper* and Browser* clients
└── txUtils.ts                   # Utility functions
```

## Hooks

Updated hooks in `apps/web/src/hooks/useClients.ts`:

```typescript
// ✅ Recommended
useHelperSDK()
useQuizClient()      // Returns HelperQuizClient
useTeacherClient()   // Returns HelperTeacherClient
useAttemptClient()   // Returns HelperAttemptClient
useAccessClient()    // Returns HelperAccessClient

// ⚠️ Deprecated
useBrowserSDK()
```

## Testing

The helper-based clients use the same underlying helpers that are tested in the quiz-contracts package:

```bash
# Test helpers in quiz-contracts
cd packages/quiz-contracts
npm run test:teacher-helper
npm run test:student-helper
npm run test:quiz-helper
```

## Migration Checklist

- [ ] Update imports from `Browser*Client` to `Helper*Client`
- [ ] Replace `useBrowserSDK()` with `useHelperSDK()`
- [ ] Update service files to use helper-based clients
- [ ] Test all quiz operations (create, attempt, claim reward)
- [ ] Remove deprecated Browser*Client files (after full migration)

## Notes

- The deprecated `Browser*Client` files are kept for backward compatibility
- New features should only use helper-based clients
- Consider removing deprecated clients after full migration
