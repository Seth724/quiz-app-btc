# Quiz App Monorepo

A decentralized quiz application built on **Bitcoin Computer** with enterprise-level architecture. This full-stack application enables teachers to create quizzes with crypto rewards and students to earn cryptocurrency by completing quizzes — all powered by blockchain smart contracts and atomic swaps.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible. The VPS uses **Docker Compose** with **Nginx reverse proxy** and **HTTPS/SSL** for secure connections.

---

## 🏗️ Architecture

This monorepo follows a clean, layered architecture pattern:

```
apps/
  web/                      # Next.js frontend (App Router)
  api/                      # NestJS backend API
packages/
  quiz-contracts/           # Smart contracts (blockchain logic)
```

### What's Inside

- **`apps/web`** - Next.js App Router frontend
  - Feature-based architecture (quizzes, attempts, payments, leaderboard, wallet, access)
  - Uses Bitcoin Computer SDK for blockchain operations
  - Zustand for state management
  - TailwindCSS for styling
  - Flowbite UI components

- **`apps/api`** - NestJS backend API server
  - RESTful API endpoints for quiz management
  - JWT authentication & authorization (global guards)
  - Prisma ORM for MongoDB operations
  - Global exception filters & custom logging
  - Modules: auth, quizzes, attempts, leaderboard, users, access-requests

- **`packages/quiz-contracts`** - Smart contracts and helpers
  - Teacher, Student, Quiz, QuizAttempt contracts
  - Payment, QuizAccess, QuizAccessSale contracts
  - Helper utilities (TeacherHelper, StudentHelper, QuizHelper, etc.)
  - Comprehensive test suite (Mocha + Chai)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 + App Router | React framework with SSR & file-based routing |
| **Styling** | TailwindCSS v4 + Flowbite | Utility-first CSS framework + UI components |
| **State** | Zustand | Lightweight state management |
| **Backend** | NestJS 10 | Node.js framework with dependency injection & modular architecture |
| **Database** | MongoDB | NoSQL database for user data, quizzes & attempts |
| **ORM** | Prisma 6 | Type-safe database queries & schema management |
| **Auth** | JWT + Passport.js | Secure session management & role-based access control |
| **Blockchain** | Bitcoin Computer 0.26 | Abstraction layer for LTC/BTC smart contracts |
| **Smart Contracts** | TypeScript | On-chain logic for quizzes, payments & access control |
| **Testing** | Mocha 11 + Chai 5 | Smart contract & integration testing |
| **Monorepo** | Turborepo | Fast, efficient multi-package builds |
| **Deployment** | GCP VPS + Docker Compose | Containerized deployment with Nginx/HTTPS |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
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
   cp .env.web.template .env.web
   cp .env.api.template .env.api
   cp .env.bcn.template .env.bcn
   ```

2. Configure blockchain connection:
   ```env
   # .env.bcn
   BCN_PORT=1031
   LITECOIN_RPC_PORT=1032
   LITECOIN_ZMQ_RAWTX_PORT=1033
   LITECOIN_ZMQ_RAWBLOCK_PORT=1034
   ```

3. Configure database & JWT:
   ```env
   # .env.api
   DATABASE_URL="mongodb://localhost:27017/quiz-app"
   JWT_SECRET="your-secret-key"
   NODE_ENV=development
   BLOCKCHAIN_URL=http://localhost:1031
   CORS_ORIGIN=http://localhost:3000
   ```

4. Configure frontend:
   ```env
   # .env.web
   NEXT_PUBLIC_API_URL=http://localhost:3002/api
   NEXT_PUBLIC_URL=http://localhost:1031
   ```

5. After deploying contracts, add module specs to `.env.api` and `.env.web`

### Development

```bash
# Start web app (default)
npm run dev

# Or individually
npm run dev:web
npm run dev:api
```

Open [http://localhost:3000](http://localhost:3000)

### Building

```bash
# Build all packages
npm run build

# Or individually
npm run build:web
npm run build:api
```

### Deployment

Deploy smart contracts:
```bash
npm run deploy
```

This will output module specifications to add to your `.env.api` and `.env.web`

### Testing

```bash
# Run all tests
npm test

# Run only contract tests
npm run test:unit -w @quiz-app/contracts
```

---

## ✨ Features

### For Teachers
- 📝 Create and manage quizzes
- 💰 Set rewards and entry fees in satoshis
- 🔐 Control quiz access with NFT-like tokens
- 📊 Monitor student progress & analytics
- 💸 Withdraw accumulated entry fees
- 🔔 Receive access request notifications

### For Students
- 🔍 Browse available quizzes
- 🎟️ Request access via atomic swaps
- ✍️ Take quizzes and earn crypto rewards
- 🏆 Compete on global leaderboard
- 💵 Withdraw earned rewards to wallet
- 📊 View attempt history

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
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/        # Create quiz
│   │   │   │   │   ├── quizzes/       # Teacher's quizzes
│   │   │   │   │   └── notifications/ # Access requests
│   │   │   │   ├── student/           # Student dashboard
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── quizzes/       # Browse quizzes
│   │   │   │   ├── wallet/            # Wallet management
│   │   │   │   ├── leaderboard/       # Global rankings
│   │   │   │   ├── gallery/           # Quiz gallery
│   │   │   │   ├── objects/           # Smart object viewer
│   │   │   │   ├── transactions/      # Transaction history
│   │   │   │   └── profile/           # User profile
│   │   │   ├── common-components/     # Reusable UI components
│   │   │   │   ├── bc/                # Bitcoin Computer components
│   │   │   │   ├── common/            # Common utilities
│   │   │   │   ├── layout/            # Layout components
│   │   │   │   ├── Auth.tsx
│   │   │   │   ├── Wallet.tsx
│   │   │   │   ├── Gallery.tsx
│   │   │   │   ├── SmartObject.tsx
│   │   │   │   ├── Transaction.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── ...
│   │   │   ├── features/              # Feature modules
│   │   │   │   ├── quizzes/           # Quiz components
│   │   │   │   ├── attempts/          # Attempt components
│   │   │   │   ├── payments/          # Payment components
│   │   │   │   ├── leaderboard/       # Leaderboard components
│   │   │   │   ├── wallet/            # Wallet components
│   │   │   │   └── access/            # Access request components
│   │   │   ├── services/              # API clients
│   │   │   ├── stores/                # Zustand stores
│   │   │   │   ├── wallet.store.ts
│   │   │   │   └── session.store.ts
│   │   │   ├── config/                # Configuration
│   │   │   ├── hooks/                 # React hooks
│   │   │   ├── lib/                   # Utilities
│   │   │   └── types/                 # TypeScript types
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api/                           # NestJS backend
│       ├── src/
│       │   ├── modules/               # Feature modules
│       │   │   ├── auth/              # JWT authentication
│       │   │   ├── quizzes/           # Quiz CRUD
│       │   │   ├── attempts/          # Attempt tracking
│       │   │   ├── leaderboard/       # Leaderboard calculations
│       │   │   ├── users/             # User management
│       │   │   └── access-requests/   # Access request handling
│       │   ├── common/                # Shared utilities
│       │   │   ├── decorators/        # Custom decorators
│       │   │   ├── guards/            # JWT & Roles guards
│       │   │   ├── filters/           # Exception filters
│       │   │   └── logger/            # Custom logging
│       │   ├── prisma/                # Database layer
│       │   ├── config/                # Configuration
│       │   └── types/                 # TypeScript types
│       ├── prisma/
│       │   └── schema.prisma          # Database schema
│       ├── generated/                 # Generated Prisma client
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── quiz-contracts/                # Smart contracts
│       ├── src/
│       │   ├── teacher.ts             # Teacher contract
│       │   ├── student.ts             # Student contract
│       │   ├── quiz.ts                # Quiz contract
│       │   ├── attempt.ts             # Attempt contract
│       │   ├── payment.ts             # Payment contract
│       │   ├── quiz-access.ts         # Access token contract
│       │   ├── quiz-access-sale.ts    # Access sale contract
│       │   ├── helpers/               # Helper utilities
│       │   │   ├── teacher-helper.ts
│       │   │   ├── student-helper.ts
│       │   │   ├── quiz-helper.ts
│       │   │   ├── attempt-helper.ts
│       │   │   ├── payment-helper.ts
│       │   │   ├── quiz-access-helper.ts
│       │   │   ├── quiz-access-sale-helper.ts
│       │   │   └── leaderboard-helper.ts
│       │   ├── types/                 # Contract types
│       │   └── utils/                 # Utilities
│       ├── test/                      # Contract tests
│       ├── scripts/                   # Deployment scripts
│       └── package.json
│
├── bcn-setup/                         # Bitcoin Computer setup
│   └── litecoin.conf
│
├── deploy/                            # Deployment scripts
│   ├── setup-vps.sh                   # VPS setup (Docker, firewall)
│   └── deploy.sh                      # Build & start services
│
├── .github/workflows/                 # CI/CD pipelines
│   ├── ci.yml                         # Lint + type check
│   └── cd.yml                         # Deploy to VPS
│
├── docker-compose.prod.yml            # Production Docker config
├── package.json                       # Root package.json
├── turbo.json                         # Turborepo config
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.web`)
```env
# Blockchain Configuration
NEXT_PUBLIC_URL=http://localhost:1031

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002/api

# Contract Module Specifications (after deployment)
NEXT_PUBLIC_TEACHER_MOD_SPEC=<module-spec>
NEXT_PUBLIC_STUDENT_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=<module-spec>
NEXT_PUBLIC_PAYMENT_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=<module-spec>
```

#### Backend (`.env.api`)
```env
# Database
DATABASE_URL="mongodb://localhost:27017/quiz-app"

# JWT Configuration
JWT_SECRET="your-secret-key"
NODE_ENV=development

# Blockchain Configuration
BLOCKCHAIN_URL=http://localhost:1031

# CORS
CORS_ORIGIN=http://localhost:3000

# Contract Module Specifications (after deployment)
NEXT_PUBLIC_TEACHER_MOD_SPEC=
NEXT_PUBLIC_STUDENT_MOD_SPEC=
NEXT_PUBLIC_QUIZ_MOD_SPEC=
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=
NEXT_PUBLIC_PAYMENT_MOD_SPEC=
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=
```

#### Blockchain (`.env.bcn`)
```env
BCN_PORT=1031
LITECOIN_RPC_PORT=1032
LITECOIN_ZMQ_RAWTX_PORT=1033
LITECOIN_ZMQ_RAWBLOCK_PORT=1034
```

---

## 🏛️ Architecture Principles

### 1. Clean Separation of Concerns
- **UI Layer** (`app/`, `common-components/`) - Only presentation
- **Feature Layer** (`features/`) - Feature-specific components
- **Service Layer** (`services/`) - API clients
- **State Layer** (`stores/`) - Zustand state management
- **Contract Layer** (`packages/quiz-contracts/`) - Blockchain logic

### 2. Dependency Flow
```
UI → Features → Services → Contracts
```
UI never touches contracts directly

### 3. State Management
- **Wallet state** - Connection, keys, balance (persisted in Zustand store)
- **Session state** - User info, role (persisted via JWT)
- **Component state** - Local UI state

---

## ⛓️ Blockchain Concepts

| Term | Description |
|------|-------------|
| **Module Spec** | Deployed smart contract identifier on-chain (unique address + code hash) |
| **Atomic Swap** | Trustless peer-to-peer crypto exchange without intermediaries |
| **Regtest Network** | Local Bitcoin/Litecoin testnet for safe development & testing |
| **UTXO Model** | Unspent Transaction Output - Bitcoin's native transaction structure |
| **On-chain Rewards** | Crypto rewards stored & distributed via smart contracts |
| **Access Token** | NFT-like token granting quiz access after purchase |
| **Access Request** | Student request to teacher for quiz access (off-chain + on-chain completion) |

---

## 📚 Usage Examples

### Frontend - Creating a Quiz

```typescript
// apps/web/src/app/teacher/create/page.tsx
import { useComputer } from '@/common-components/bc'
import { Teacher } from '@quiz-app/contracts'

async function createQuiz(quizData: QuizData) {
  const computer = useComputer()
  const teacher = new Teacher(computer, teacherModSpec)

  const quiz = await teacher.create({
    title: quizData.title,
    questionText: quizData.questionText,
    options: quizData.options,
    correctAnswer: quizData.correctAnswer,
    rewardAmount: BigInt(quizData.rewardAmount),
    entryFee: BigInt(quizData.entryFee),
  })

  return quiz
}
```

### Backend - Quiz API Endpoint

```typescript
// apps/api/src/modules/quizzes/quizzes.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/modules/auth/auth.guard'
import { QuizzesService } from './quizzes.service'

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Get()
  async findAll() {
    return this.quizzesService.findAll()
  }

  @Post()
  async create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto)
  }
}
```

### Smart Contract - Teacher Helper

```typescript
// packages/quiz-contracts/src/helpers/teacher-helper.ts
export class TeacherHelper {
  static async createQuiz(computer, modSpec, quizData) {
    const teacher = new Teacher(computer, modSpec)
    return await teacher.create(quizData)
  }

  static async withdrawFees(computer, modSpec, quizId) {
    const teacher = new Teacher(computer, modSpec)
    return await teacher.withdraw(quizId)
  }
}
```

---

## 🔄 Deployment Flow

### Local Development
1. Start BCN node: `docker compose -f docker-compose.prod.yml up -d bcn`
2. Fund wallet: `npm run fund:wallet -w @quiz-app/contracts`
3. Deploy contracts: `npm run deploy -w @quiz-app/contracts`
4. Update `.env.api` and `.env.web` with module specs
5. Start API: `npm run dev:api`
6. Start Web: `npm run dev:web`

### Production (GCP VPS)
1. Clone repo on VPS
2. Copy env templates: `cp .env.*.template .env.*`
3. Configure environment variables
4. Build & start: `bash deploy/deploy.sh`
5. Deploy contracts: `npm run deploy -w @quiz-app/contracts`
6. Update module specs in env files
7. Rebuild web: `docker compose build quiz-web && docker compose up -d quiz-web`

See [deployment.md](deployment.md) for complete instructions.

---

## 📖 Additional Resources

- [Deployment Guide](deployment.md)
- [Bitcoin Computer Documentation](https://docs.bitcoincomputer.io/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web development server |
| `npm run dev:web` | Start web development server |
| `npm run dev:api` | Start API development server |
| `npm run build` | Build all packages |
| `npm run build:web` | Build web frontend |
| `npm run build:api` | Build API backend |
| `npm test` | Run all tests |
| `npm run deploy` | Deploy smart contracts |
| `npm run fund:wallet` | Fund wallet for testing |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push Prisma schema to database |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Fix lint errors |

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

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [deployment.md](deployment.md) for deployment troubleshooting

Happy building! 🚀
