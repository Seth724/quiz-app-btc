# Quiz App Monorepo

A decentralized quiz application built on Bitcoin Computer with enterprise-level architecture.

## 🏗️ Architecture

This monorepo follows a clean, layered architecture pattern:

```
apps/
  web/                      # Next.js frontend (clean architecture)
packages/
  quiz-contracts/           # Smart contracts (blockchain logic)
  sdk/                      # Client wrapper for contracts
  shared/                   # Shared types and utilities
```

### What's Inside

- **`apps/web`** - Next.js App Router frontend with clean architecture
  - Features, services, stores, config cleanly separated
  - Uses SDK for all blockchain operations
  - Zustand for state management
  
- **`packages/quiz-contracts`** - Smart contracts and helpers (UNCHANGED)
  - Quiz, Payment, Access Token contracts
  - Comprehensive test suite
  
- **`packages/sdk`** - Clean client wrapper around contracts
  - TeacherClient, StudentClient, QuizClient, etc.
  - Hides blockchain complexity from UI
  
- **`packages/shared`** - Reusable types, constants, utilities
  - Shared across all packages
  - Single source of truth for types

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 10+

### Installation

```bash
npm install
```

### Environment Setup

1. Copy environment template:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Configure blockchain connection:
   ```env
   NEXT_PUBLIC_CHAIN=LTC
   NEXT_PUBLIC_NETWORK=regtest
   NEXT_PUBLIC_URL=http://localhost:1031
   ```

3. After deploying contracts, add module specs to `.env.local`

### Development

```bash
# Start web app (default)
npm run dev

# Or specifically
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000)

### Building

```bash
# Build shared types first
npm run build:shared

# Build SDK
npm run build:sdk

# Build web app
npm run build:web

# Or build everything
npm run build
```

### Deployment

Deploy smart contracts:
```bash
npm run deploy
```

This will output module specifications to add to your `.env.local`

### Testing

```bash
# Run all tests
npm test

# Run only contract tests
npm run test --workspace=@quiz-app/contracts
```

## ✨ Features

### For Teachers
- 📝 Create and manage quizzes
- 💰 Set rewards and entry fees
- 🔐 Control quiz access with tokens
- 📊 Monitor student progress
- 💸 Withdraw accumulated entry fees

### For Students
- 🔍 Browse available quizzes
- 🎟️ Purchase access tokens (atomic swap)
- ✍️ Take quizzes and earn rewards
- 🏆 Compete on leaderboard
- 💵 Withdraw earned rewards

## 📁 Folder Structure

```
QuizApp/
├── apps/
│   └── web/                           # Next.js frontend
│       ├── src/
│       │   ├── app/                   # App Router pages & layouts
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── providers.tsx      # Context providers
│       │   │   ├── teacher/           # Teacher pages
│       │   │   ├── student/           # Student pages
│       │   │   ├── wallet/            # Wallet page
│       │   │   └── leaderboard/       # Leaderboard page
│       │   ├── components/            # Reusable UI components
│       │   ├── features/              # Feature modules (vertical slices)
│       │   ├── services/              # Business logic & API clients
│       │   ├── stores/                # Zustand state stores
│       │   ├── config/                # Configuration & env
│       │   ├── lib/                   # Utilities & helpers
│       │   └── hooks/                 # Shared React hooks
│       ├── next.config.ts
│       ├── tailwind.config.js
│       └── package.json
│
├── packages/
│   ├── quiz-contracts/                # Smart contracts (UNCHANGED)
│   │   ├── src/
│   │   │   ├── quiz.ts
│   │   │   ├── teacher.ts
│   │   │   ├── student.ts
│   │   │   ├── payment.ts
│   │   │   ├── quiz-access.ts
│   │   │   ├── quiz-access-sale.ts
│   │   │   ├── attempt.ts
│   │   │   └── helpers/
│   │   └── test/
│   │
│   ├── sdk/                           # Contract client wrapper
│   │   ├── src/
│   │   │   ├── computer/
│   │   │   │   └── createComputer.ts
│   │   │   ├── clients/
│   │   │   │   ├── teacherClient.ts
│   │   │   │   ├── studentClient.ts
│   │   │   │   ├── quizClient.ts
│   │   │   │   ├── accessClient.ts
│   │   │   │   ├── paymentClient.ts
│   │   │   │   └── attemptClient.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared/                        # Shared types & utilities
│       ├── src/
│       │   ├── types/
│       │   │   ├── config.types.ts
│       │   │   ├── quiz.types.ts
│       │   │   ├── user.types.ts
│       │   │   └── payment.types.ts
│       │   ├── constants/
│       │   ├── utils/
│       │   └── index.ts
│       └── package.json
│
├── package.json                       # Root package.json
├── turbo.json                         # Turborepo config
└── README.md
```

## 🔧 Configuration

### Environment Variables (apps/web/.env.local)

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# Contract Module Specifications (after deployment)
NEXT_PUBLIC_TEACHER_MOD=
NEXT_PUBLIC_STUDENT_MOD=
NEXT_PUBLIC_QUIZ_MOD=
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=
NEXT_PUBLIC_PAYMENT_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=
```

### BASE_URL Pattern

The app uses a single `NEXT_PUBLIC_URL` as the base. All endpoints derive from it:
- If you change the URL, everything updates automatically
- No need to modify multiple places

## 🏛️ Architecture Principles

### 1. Clean Separation of Concerns
- **UI Layer** (`app/`, `components/`) - Only presentation
- **Feature Layer** (`features/`) - Feature-specific logic
- **Service Layer** (`services/`) - Business logic & API calls
- **State Layer** (`stores/`) - Application state
- **SDK Layer** (`packages/sdk/`) - Contract abstraction
- **Contract Layer** (`packages/contracts/`) - Blockchain logic

### 2. Dependency Flow
```
UI → Features → Services → SDK → Contracts
```
UI never touches contracts directly

### 3. State Management
- **Wallet state** - Connection, keys, config (persisted)
- **Session state** - Role, user info, navigation (persisted)
- **Component state** - Local UI state (not persisted)

## 📚 Usage Examples

### Using SDK in Frontend

```typescript
import { useTeacherClient, useQuizClient } from '@/hooks'

function CreateQuizForm() {
  const teacherClient = useTeacherClient()
  
  const handleSubmit = async (data) => {
    const quiz = await teacherClient.createQuiz(data)
    console.log('Quiz created:', quiz)
  }
}
```

### Using Shared Types

```typescript
import type { QuizData, QuizStatus } from '@quiz-app/shared'
import { formatSats, MIN_QUIZ_REWARD } from '@quiz-app/shared'

const quizData: QuizData = {
  title: 'My Quiz',
  questionText: 'What is 2+2?',
  options: ['3', '4', '5', '6'],
  correctAnswer: 1,
  rewardAmount: MIN_QUIZ_REWARD,
  entryFee: 1000n,
  paymentTxId: '...'
}
```

### Accessing Configuration

```typescript
import { BASE_URL, BLOCKCHAIN_CONFIG, getComputerConfig } from '@/config'

const computer = createComputer(getComputerConfig())
```

## 🔄 Migration from Old Structure

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed migration instructions.

## 📖 Additional Resources

- [Bitcoin Computer Documentation](https://docs.bitcoincomputer.io/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

## 📝 License

See LICENSE file for details.

│   │   ├── src/app/       # App router pages and components
│   │   ├── public/        # Static assets
│   │   └── ...
│   └── quiz-contracts/    # Smart contracts and tests
│       ├── src/           # Contract source code
│       ├── test/          # Test files
│       ├── scripts/       # Deployment scripts
│       └── ...
├── package.json           # Root package configuration
├── turbo.json            # Turborepo configuration
└── tsconfig.json         # TypeScript configuration
```

## Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build all packages
- `npm test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run deploy` - Deploy contracts
- `npm run clean` - Clean node_modules

## License

This project is licensed under the MIT License.