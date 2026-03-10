# Quiz App Monorepo

A decentralized quiz application built on **Bitcoin Computer** with enterprise-level architecture. This full-stack application enables teachers to create quizzes with crypto rewards and students to earn cryptocurrency by completing quizzes — all powered by blockchain smart contracts and atomic swaps.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible. The VPS uses **Nginx reverse proxy** with **HTTPS/SSL** for secure connections.

---

## 🏗️ Architecture

This monorepo follows a clean, layered architecture pattern:

```
apps/
  web/                      # Next.js frontend (clean architecture)
  api/                      # NestJS backend API
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
  - TailwindCSS for styling

- **`apps/api`** - NestJS backend API server
  - RESTful API endpoints for quiz management
  - JWT authentication & authorization
  - Prisma ORM for database operations
  - Global exception filters & custom logging

- **`packages/quiz-contracts`** - Smart contracts and helpers
  - Quiz, Payment, Access Token, Attempt contracts
  - Comprehensive test suite (Mocha + Chai)

- **`packages/sdk`** - Clean client wrapper around contracts
  - TeacherClient, StudentClient, QuizClient, etc.
  - Hides blockchain complexity from UI

- **`packages/shared`** - Reusable types, constants, utilities
  - Shared across all packages
  - Single source of truth for types

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 + App Router | React framework with SSR & file-based routing |
| **Styling** | TailwindCSS | Utility-first CSS framework |
| **State** | Zustand | Lightweight state management |
| **Backend** | NestJS | Node.js framework with dependency injection & modular architecture |
| **Database** | MongoDB | NoSQL database for user data & quiz metadata |
| **ORM** | Prisma | Type-safe database queries & migrations |
| **Auth** | JWT Tokens | Secure session management & role-based access control |
| **Blockchain** | Bitcoin Computer | Abstraction layer for LTC/BTC smart contracts |
| **Smart Contracts** | TypeScript | On-chain logic for quizzes, payments & access control |
| **Testing** | Mocha + Chai | Smart contract & integration testing |
| **Monorepo** | Turborepo | Fast, efficient multi-package builds |
| **Deployment** | GCP VPS + Docker + Nginx | Containerized deployment with HTTPS/SSL |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 10+
- Docker & Docker Compose (for local blockchain)
- MongoDB (local or cloud instance)

### Installation

```bash
npm install
```

### Environment Setup

1. Copy environment templates:
   ```bash
   cp .env.web.template apps/web/.env.local
   cp .env.api.template apps/api/.env.local
   cp .env.bcn.template bcn-setup/.env
   ```

2. Configure blockchain connection:
   ```env
   NEXT_PUBLIC_CHAIN=LTC
   NEXT_PUBLIC_NETWORK=regtest
   NEXT_PUBLIC_URL=http://localhost:1031
   ```

3. Configure database & JWT:
   ```env
   DATABASE_URL="mongodb://localhost:27017/quiz-app"
   JWT_SECRET="your-secret-key"
   JWT_EXPIRY="24h"
   ```

4. After deploying contracts, add module specs to `.env.local`

### Development

```bash
# Start all apps (web + api + blockchain)
npm run dev

# Or individually
npm run dev:web
npm run dev:api
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

# Build API
npm run build:api

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

---

## ✨ Features

### For Teachers
- 📝 Create and manage quizzes
- 💰 Set rewards and entry fees in satoshis
- 🔐 Control quiz access with NFT-like tokens
- 📊 Monitor student progress & analytics
- 💸 Withdraw accumulated entry fees

### For Students
- 🔍 Browse available quizzes
- 🎟️ Purchase access tokens via atomic swaps
- ✍️ Take quizzes and earn crypto rewards
- 🏆 Compete on global leaderboard
- 💵 Withdraw earned rewards to wallet

---

## 📁 Folder Structure

```
QuizApp/
├── apps/
│   ├── web/                           # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages & layouts
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── providers.tsx      # Context providers
│   │   │   │   ├── teacher/           # Teacher dashboard
│   │   │   │   ├── student/           # Student dashboard
│   │   │   │   ├── wallet/            # Wallet management
│   │   │   │   └── leaderboard/       # Global rankings
│   │   │   ├── components/            # Reusable UI components
│   │   │   ├── features/              # Feature modules (vertical slices)
│   │   │   ├── services/              # Business logic & API clients
│   │   │   ├── stores/                # Zustand state stores
│   │   │   ├── config/                # Configuration & env
│   │   │   ├── lib/                   # Utilities & helpers
│   │   │   └── hooks/                 # Shared React hooks
│   │   ├── next.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── api/                           # NestJS backend
│       ├── src/
│       │   ├── modules/               # Feature modules
│       │   │   ├── auth/              # JWT authentication
│       │   │   ├── quiz/              # Quiz CRUD operations
│       │   │   ├── user/              # User management
│       │   │   └── wallet/            # Wallet operations
│       │   ├── common/                # Shared utilities
│       │   │   ├── filters/           # Exception filters
│       │   │   ├── guards/            # Auth guards
│       │   │   └── decorators/        # Custom decorators
│       │   ├── prisma/                # Database schema & migrations
│       │   └── main.ts                # Application entry point
│       └── package.json
│
├── packages/
│   ├── quiz-contracts/                # Smart contracts
│   │   ├── src/
│   │   │   ├── quiz.ts                # Quiz contract logic
│   │   │   ├── teacher.ts             # Teacher contract
│   │   │   ├── student.ts             # Student contract
│   │   │   ├── payment.ts             # Payment handling
│   │   │   ├── quiz-access.ts         # Access token contract
│   │   │   ├── quiz-access-sale.ts    # Token sale logic
│   │   │   ├── attempt.ts             # Quiz attempt tracking
│   │   │   └── helpers/               # Contract utilities
│   │   ├── test/                      # Contract tests
│   │   └── package.json
│   │
│   ├── sdk/                           # Contract client wrapper
│   │   ├── src/
│   │   │   ├── computer/
│   │   │   │   └── createComputer.ts  # Bitcoin Computer instance
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
├── bcn-setup/                         # Bitcoin Computer setup
│   ├── docker-compose.yml
│   └── .env
│
├── deploy/                            # Deployment scripts
│   ├── setup-vps.sh
│   └── deploy.sh
│
├── .github/workflows/                 # CI/CD pipelines
├── docker-compose.prod.yml            # Production Docker config
├── package.json                       # Root package.json
├── turbo.json                         # Turborepo config
├── tsconfig.json                      # TypeScript config
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (apps/web/.env.local)
```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Contract Module Specifications (after deployment)
NEXT_PUBLIC_TEACHER_MOD=
NEXT_PUBLIC_STUDENT_MOD=
NEXT_PUBLIC_QUIZ_MOD=
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=
NEXT_PUBLIC_PAYMENT_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=
```

#### Backend (apps/api/.env.local)
```env
# Database
DATABASE_URL="mongodb://localhost:27017/quiz-app"

# JWT Configuration
JWT_SECRET="your-secret-key"
JWT_EXPIRY="24h"

# Blockchain Configuration
CHAIN=LTC
NETWORK=regtest
BCN_URL=http://localhost:1031
```

---

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
- **Wallet state** - Connection, keys, config (persisted in localStorage)
- **Session state** - Role, user info, navigation (persisted via JWT)
- **Component state** - Local UI state (not persisted)

---

## ⛓️ Blockchain Concepts

| Term | Description |
|------|-------------|
| **Module Specs** | Deployed smart contract identifiers on-chain (unique addresses for each contract) |
| **Atomic Swaps** | Trustless peer-to-peer crypto exchanges without intermediaries |
| **Regtest Network** | Local Bitcoin/Litecoin testnet for safe development & testing |
| **UTXO Model** | Unspent Transaction Output - Bitcoin's native transaction structure |
| **On-chain Rewards** | Crypto rewards stored & distributed via smart contracts |
| **Access Tokens** | NFT-like tokens granting quiz access after purchase |
| **Block Mining** | Manual block generation on regtest to confirm transactions |

---

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

### Backend API Example (NestJS)

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { QuizService } from './quiz.service'

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('create')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto)
  }
}
```

---

## 🔄 Migration from Old Structure

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed migration instructions.

---

## 📖 Additional Resources

- [Bitcoin Computer Documentation](https://docs.bitcoincomputer.io/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all development servers |
| `npm run dev:web` | Start frontend development server |
| `npm run dev:api` | Start backend API server |
| `npm run build` | Build all packages |
| `npm run build:web` | Build frontend only |
| `npm run build:api` | Build backend only |
| `npm run build:shared` | Build shared types |
| `npm run build:sdk` | Build SDK package |
| `npm test` | Run all tests |
| `npm run deploy` | Deploy smart contracts |
| `npm run lint` | Lint all packages |
| `npm run clean` | Clean node_modules |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you encounter any issues or have questions, feel free to:
- Open an issue on GitHub
- Reach out via the contact information in the repository

Happy building! 🚀
