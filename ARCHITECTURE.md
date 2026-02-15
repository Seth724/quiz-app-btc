# Quiz App Architecture

Detailed architecture documentation for the Quiz App monorepo.

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   UI     │  │ Features │  │ Services │  │  Stores  │   │
│  │ (React)  │→ │ (Logic)  │→ │   (SDK)  │  │ (State)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │    @quiz-app/sdk      │
              │  (Client Wrappers)    │
              └───────────┬───────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │ @quiz-app/contracts   │
              │  (Smart Contracts)    │
              └───────────┬───────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │   Bitcoin Blockchain  │
              └───────────────────────┘
```

## 🏗️ Layered Architecture

### Layer 1: UI Layer (apps/web/src/app/)

**Purpose:** Presentation and routing only

**Contains:**
- Page components (route handlers)
- Layouts
- Providers wrapper

**Rules:**
- ❌ No business logic
- ❌ No direct contract calls
- ✅ Only React components
- ✅ Calls features/hooks

**Example:**
```typescript
// apps/web/src/app/teacher/page.tsx
'use client'

import { useTeacherQuizzes } from '@/features/quiz/hooks'

export default function TeacherPage() {
  const { quizzes, loading } = useTeacherQuizzes()
  return <QuizList quizzes={quizzes} loading={loading} />
}
```

### Layer 2: Feature Layer (apps/web/src/features/)

**Purpose:** Feature-specific logic and components

**Structure:**
```
features/
  quiz/
    components/
      QuizCard.tsx
      QuizForm.tsx
    hooks/
      useQuizzes.ts
      useCreateQuiz.ts
    services/
      quizService.ts
    types.ts
  access/
  payments/
  leaderboard/
  auth/
```

**Rules:**
- ✅ Feature encapsulation
- ✅ Can use services layer
- ✅ Can use hooks layer
- ❌ Features don't import from each other (only through /services or /hooks)

**Example:**
```typescript
// features/quiz/hooks/useCreateQuiz.ts
import { useTeacherClient } from '@/hooks'

export function useCreateQuiz() {
  const teacherClient = useTeacherClient()
  
  return async (data: QuizData) => {
    return await teacherClient.createQuiz(data)
  }
}
```

### Layer 3: Service Layer (apps/web/src/services/)

**Purpose:** Business logic and SDK orchestration

**Contains:**
- Contract service (manages Computer instance + SDK clients)
- API service (future: calls to NestJS backend)

**Rules:**
- ✅ SDK client management
- ✅ Complex business logic
- ❌ No React dependencies
- ❌ No UI logic

**Example:**
```typescript
// services/contracts/contractsService.ts
import { createComputer, TeacherClient } from '@quiz-app/sdk'

export function getTeacherClient(computer?: Computer): TeacherClient {
  return new TeacherClient(computer || getComputer())
}
```

### Layer 4: State Layer (apps/web/src/stores/)

**Purpose:** Application state management

**Contains:**
- Wallet store (connection, keys, config)
- Session store (role, user data)

**Rules:**
- ✅ Zustand stores
- ✅ Persist to localStorage
- ✅ No business logic
- ❌ No side effects (use services in effects outside store)

**Example:**
```typescript
// stores/wallet.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWalletStore = create(
  persist(
    (set) => ({
      publicKey: null,
      connect: (data) => set({ publicKey: data.publicKey })
    }),
    { name: 'quiz-app-wallet' }
  )
)
```

### Layer 5: SDK Layer (packages/sdk/)

**Purpose:** Clean API for contract operations

**Contains:**
- Computer factory
- Client wrappers (TeacherClient, StudentClient, etc.)

**Rules:**
- ✅ Wraps contract helpers
- ✅ Provides clean async API
- ❌ No React
- ❌ No UI logic
- ✅ Can be used in backend/indexer

**Example:**
```typescript
// packages/sdk/src/clients/teacherClient.ts
import { TeacherHelper } from '@quiz-app/contracts'

export class TeacherClient {
  async createQuiz(data: QuizData) {
    return await this.teacherHelper.createQuiz(data)
  }
}
```

### Layer 6: Contract Layer (packages/quiz-contracts/)

**Purpose:** Blockchain smart contracts

**Contains:**
- Contract classes
- Helper classes
- Tests

**Rules:**
- ✅ Pure TypeScript contracts
- ✅ Bitcoin Computer Contract class
- ❌ No UI dependencies
- ❌ No frontend-specific logic

## 🔄 Data Flow

### Creating a Quiz (Teacher Flow)

```
1. UI Component (page.tsx)
   ↓ User clicks "Create Quiz"
   
2. Feature Hook (useCreateQuiz)
   ↓ Validates input, shows loading
   
3. Service (getTeacherClient)
   ↓ Gets SDK client instance
   
4. SDK Client (TeacherClient.createQuiz)
   ↓ Calls helper, manages Computer
   
5. Contract Helper (TeacherHelper.createQuiz)
   ↓ Creates Payment + Quiz contracts
   
6. Bitcoin Computer (computer.new)
   ↓ Broadcasts transactions
   
7. Blockchain
   ✓ Quiz created on-chain
```

### Attempting a Quiz (Student Flow)

```
1. UI Component (AttemptForm)
   ↓ User selects answer
   
2. Feature Service (attemptService.attemptQuiz)
   ↓ Validates, gets access token
   
3. SDK Client (StudentClient.attemptQuizWithAccess)
   ↓ Creates attempt, submits answer
   
4. Contract (QuizAttempt.submitAnswer)
   ↓ Burns access token
   ↓ Checks correctness
   ↓ Transfers payment if correct
   
5. Blockchain
   ✓ Attempt recorded
   ✓ Access token burned
   ✓ Reward transferred (if correct)
```

## 🎯 Design Patterns

### 1. Repository Pattern (SDK)
SDK clients act as repositories, abstracting data access from business logic.

### 2. Provider Pattern (React Context)
Minimal use - only for Computer/wallet context if needed.

### 3. Service Layer Pattern
Business logic lives in services, separate from UI.

### 4. Feature Slice Pattern
Features are self-contained vertical slices.

### 5. Dependency Injection
Clients/services accept Computer instance via constructor/parameters.

## 🔐 Security Principles

### 1. Never Store Mnemonics in Plaintext
- If using mnemonics, encrypt before storing
- Prefer wallet path + public key only

### 2. Client-Side Validation
- Validate all inputs before blockchain calls
- Check balances before transactions

### 3. Access Control
- Quiz access tokens enforce purchase
- Payments transferred atomically

### 4. Error Handling
- Catch all blockchain errors
- Show user-friendly messages
- Log errors for debugging

## 📊 Performance Optimization

### 1. Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy features

### 2. State Management
- Zustand lightweight store
- Persist only necessary data

### 3. SDK Singleton
- Single Computer instance
- Reuse SDK clients

### 4. Blockchain Sync
- Batch sync operations when possible
- Use polling intervals wisely

## 🧪 Testing Strategy

### Unit Tests
- SDK clients (mock Computer)
- Utilities and formatters
- State stores

### Integration Tests
- Contract helpers (real blockchain/regtest)
- Feature services

### E2E Tests
- User flows (Playwright/Cypress)
- Teacher creates quiz → Student attempts

## 🚀 Future Enhancements

### 1. Backend API (apps/api/)
- NestJS REST API
- Prisma + PostgreSQL
- Fast queries/filters
- Caching layer

### 2. Indexer (apps/indexer/)
- Background worker
- Syncs blockchain → DB
- Webhook notifications

### 3. UI Library (packages/ui/)
- Extract reusable components
- Storybook documentation
- Design system

### 4. GraphQL API
- Replace REST with GraphQL
- Better data fetching
- Real-time subscriptions

## 📚 References

- [Clean Architecture (Robert Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/)
