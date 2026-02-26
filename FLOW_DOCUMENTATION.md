# QuizApp — Architecture & Flow Documentation

## Project Structure

```
QuizApp/
├── apps/
│   ├── api/                          # NestJS Backend (port 3002)
│   │   ├── prisma/
│   │   │   └── schema.prisma         # MongoDB schema (User, Quiz, Attempt, LeaderboardEntry, AccessRequest)
│   │   └── src/
│   │       ├── app.module.ts          # Root module — imports all feature modules
│   │       ├── app.controller.ts      # Root controller — /health endpoint
│   │       ├── app.service.ts         # Root service — health/diagnostics
│   │       ├── main.ts               # Bootstrap — CORS, Swagger, BigInt serialization
│   │       ├── config/               # App configuration (appConfig, env vars)
│   │       │   ├── app.config.ts     # Centralized env-based configuration
│   │       │   └── index.ts          # Barrel export
│   │       ├── types/                # Shared API types (PaginatedResponse, UserRole, etc.)
│   │       │   └── index.ts
│   │       ├── prisma/               # PrismaService (global DB access)
│   │       └── modules/
│   │           ├── auth/             # JWT login/register
│   │           ├── users/            # User CRUD, mnemonic storage, stats
│   │           ├── quizzes/          # Quiz CRUD, sync from blockchain
│   │           ├── attempts/         # Attempt records, leaderboard updates
│   │           ├── leaderboard/      # Global rankings
│   │           └── access-requests/  # Access request CRUD + AutoAccessService
│   │
│   └── web/                          # Next.js Frontend (port 3000)
│       └── src/
│           ├── app/                   # Next.js App Router pages
│           │   ├── page.tsx           # Home — role selection
│           │   ├── teacher/           # Teacher dashboard, create quiz, quiz details
│           │   ├── student/           # Student dashboard, quiz list, attempt, result
│           │   ├── profile/           # Profile editing page
│           │   ├── leaderboard/       # Global leaderboard
│           │   ├── wallet/            # Wallet management
│           │   ├── gallery/           # Smart contract objects browser
│           │   ├── objects/[rev]/     # Object detail view
│           │   └── transactions/[txn]/ # Transaction detail view
│           │
│           ├── common-components/     # All UI components (BC library + app-specific)
│           │   ├── Auth.tsx, Wallet.tsx, Gallery.tsx, etc.  # BC library wrappers
│           │   ├── Button.tsx, AppCard.tsx, AppLoader.tsx   # App UI components
│           │   ├── LoginModal.tsx     # Login/name modal
│           │   ├── layout/Navigation.tsx  # Top navigation bar
│           │   └── bc/               # Vendored @bitcoin-computer/components package
│           │
│           ├── features/              # Feature modules (vertical slices)
│           │   ├── quizzes/           # Quiz service, QuizCard, QuizGrid, QuizForm, hooks
│           │   ├── access/            # Access request service, BuyAccessModal, RequestAccessModal
│           │   ├── attempts/          # Attempt service, AttemptForm, ResultPanel
│           │   ├── payments/          # Payment service, WithdrawButton, PaymentRow
│           │   ├── leaderboard/       # Leaderboard service, LeaderboardTable
│           │   └── wallet/            # Wallet service, WalletConnect, WalletDisplay, hooks
│           │
│           ├── services/
│           │   ├── backend/           # NestJS API HTTP clients (api.ts, auth, quiz, attempt, etc.)
│           │   ├── bc/                # Blockchain SDK clients (BrowserQuizClient, etc.)
│           │   ├── contracts/         # quiz-contracts helper factories
│           │   ├── tx/                # Transaction parser
│           │   ├── utils/             # Mining utility (regtest)
│           │   ├── service-clients/   # High-level orchestration clients (future)
│           │   └── sdk.factory.ts     # Computer instance factory
│           │
│           ├── stores/                # Zustand state (wallet.store, session.store)
│           ├── hooks/                 # React hooks (useClients, useWallet)
│           ├── config/                # Environment config, constants
│           ├── contexts/              # React contexts (provider-pattern state)
│           ├── server/                # Server-side utilities (Next.js)
│           ├── health/                # Health check utilities
│           ├── utils/                 # General utility functions
│           ├── lib/                   # Utilities, custom errors
│           └── types/                 # TypeScript type definitions
│
└── packages/
    ├── quiz-contracts/                # Smart contract helpers (DO NOT MODIFY)
    │   └── src/
    │       ├── quiz.ts                # QuizHelper — create, claim, deactivate
    │       ├── attempt.ts             # AttemptHelper — create, submit answer
    │       ├── payment.ts             # PaymentHelper — create, transfer, withdraw
    │       ├── quiz-access.ts         # QuizAccessHelper — mint access tokens
    │       ├── quiz-access-sale.ts    # QuizAccessSaleHelper — atomic swap offer/finalize
    │       ├── teacher.ts             # TeacherHelper — orchestrated quiz creation
    │       └── student.ts             # StudentHelper — orchestrated quiz attempt
    │
    ├── sdk/                           # SDK client wrapper
    └── shared/                        # Shared types, constants, utilities
```

---

## Data Architecture

### Dual Data Layer (Blockchain + MongoDB)

The app uses a **blockchain-first write, DB-first read** pattern:

- **Writes** always go to the blockchain first (source of truth), then sync to MongoDB
- **Reads** try MongoDB first (fast), fall back to blockchain if not found

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Blockchain | Bitcoin Computer (LTC regtest) | Smart contract state (Quiz, Attempt, Payment, QuizAccess objects) |
| Database | MongoDB Atlas via Prisma | Fast queries, aggregations, leaderboard, access request coordination |

### MongoDB Models (Prisma)

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **User** | publicKey, name, role, encryptedMnemonic | User profiles + stored teacher mnemonics |
| **Quiz** | id (blockchain txId), title, questionText, options, correctAnswer, rewardAmount, entryFee, teacherPubKey | Quiz metadata synced from blockchain |
| **Attempt** | quizId, studentPubKey, selectedAnswer, isCorrect, rewardEarned, blockchainTxId | Attempt records synced from blockchain |
| **LeaderboardEntry** | publicKey, name, totalRewards, correctCount, rank | Aggregated student scores |
| **AccessRequest** | quizId, studentPublicKey, teacherPublicKey, entryFee, status, offerTxHex | Access purchase coordination |

---

## Complete Application Flows

### Flow 1: Teacher Creates a Quiz

```
[Teacher Dashboard]
    │
    ▼
QuizForm (features/quizzes/components/QuizForm.tsx)
    │
    ▼
createQuiz() (features/quizzes/quizzes.service.ts)
    │
    ├── 1. BrowserTeacherClient.createQuiz()  ──→  BLOCKCHAIN
    │       └── PaymentHelper.createPayment(rewardAmount)  → mint Payment UTXO
    │       └── QuizHelper.createQuiz(data)                → mint Quiz object
    │
    ├── 2. quizService.create()  ──→  POST /api/quizzes  ──→  DB SYNC
    │
    └── 3. Navigate to /teacher/quizzes/{id}
```

**Files involved:**
| Layer | File | Function |
|-------|------|----------|
| Page | `app/teacher/create/page.tsx` | Renders QuizForm |
| Component | `features/quizzes/components/QuizForm.tsx` | Form UI, calls createQuiz() |
| Feature Service | `features/quizzes/quizzes.service.ts` | `createQuiz()` orchestrator |
| BC Client | `services/bc/BrowserQuizClient.ts` | `createQuiz()` blockchain tx |
| API Client | `services/backend/quiz.service.ts` | `create()` → POST /api/quizzes |
| API Controller | `api/modules/quizzes/quizzes.controller.ts` | POST handler |
| API Service | `api/modules/quizzes/quizzes.service.ts` | Prisma upsert |

---

### Flow 2: Student Purchases Quiz Access (Atomic Swap)

```
[Student Quiz Detail Page]
    │
    ▼
1. requestAccess()  ──→  POST /api/access-requests  ──→  DB
    │
    ▼
2. Server Auto-Approve (if teacher mnemonic stored)
    │   AutoAccessService.autoApprove():
    │   ├── Load teacher mnemonic from DB
    │   ├── Create Computer instance with teacher's key
    │   ├── QuizAccessHelper.createQuizAccess(quizId, 1)  ──→  BLOCKCHAIN (mint token)
    │   ├── QuizAccessSaleHelper.createOfferTx(token, mock) ──→  Partially-signed TX
    │   └── Update access_request → status: 'approved', offerTxHex  ──→  DB
    │
    ▼
3. Student polls GET /api/access-requests (every 5s) → sees 'approved'
    │
    ▼
4. finalizeAndBroadcastOffer()
    │   BrowserAccessClient.finalizeAndBroadcastOffer():
    │   ├── PaymentHelper.createPayment(entryFee)        ──→  BLOCKCHAIN (mint payment)
    │   ├── QuizAccessSaleHelper.finalizeOfferTx(...)     ──→  Complete atomic swap TX
    │   ├── computer.fund() + sign() + broadcast()        ──→  BLOCKCHAIN (broadcast)
    │   └── Returns { txId, accessTokenId }
    │
    ▼
5. completeAccessRequest()  ──→  PATCH /api/access-requests/:id  ──→  DB
    │   status: 'completed', completedTxId
    │
    ▼
6. Navigate to /student/quizzes/{id}/attempt?accessTokenId=...
```

**Files involved:**
| Layer | File | Function |
|-------|------|----------|
| Page | `app/student/quizzes/[id]/page.tsx` | State machine UI |
| Feature Service | `features/access/access.service.ts` | `requestAccess()`, `completeAccessRequest()` |
| BC Client | `services/bc/BrowserAccessClient.ts` | `finalizeAndBroadcastOffer()` |
| API Client | `services/backend/access-request.service.ts` | HTTP calls |
| API Controller | `api/modules/access-requests/access-requests.controller.ts` | REST endpoints |
| API Service | `api/modules/access-requests/auto-access.service.ts` | `autoApprove()` |
| Contract | `packages/quiz-contracts/src/quiz-access-sale.ts` | `createOfferTx()`, `finalizeOfferTx()` |

---

### Flow 3: Student Attempts a Quiz

```
[Attempt Page]  /student/quizzes/{id}/attempt?accessTokenId=...
    │
    ▼
AttemptForm (features/attempts/components/AttemptForm.tsx)
    │  Student selects answer → Submit
    │
    ▼
submitAttempt() (features/attempts/attempts.service.ts)
    │
    ├── 1. BrowserAttemptClient.submitAttempt(quizId, answer, accessTokenId)
    │       ├── computer.sync(quizId)                         → load quiz
    │       ├── computer.latest(accessTokenId)                → resolve token
    │       ├── AttemptHelper.createAttempt(quizId, pubKey)   ──→  BLOCKCHAIN
    │       └── AttemptHelper.submitAnswerWithAccess(...)      ──→  BLOCKCHAIN
    │           (burns 1 access token unit, records answer)
    │
    ├── 2. attemptService.create()  ──→  POST /api/attempts  ──→  DB SYNC
    │       └── Server also updates LeaderboardEntry
    │
    ├── 3. If correct: quizService.update()  ──→  PATCH /api/quizzes/:id  ──→  DB
    │       (marks quiz as claimed)
    │
    └── 4. Navigate to /student/quizzes/{id}/result?attemptId=...
```

**Files involved:**
| Layer | File | Function |
|-------|------|----------|
| Page | `app/student/quizzes/[id]/attempt/page.tsx` | Renders AttemptForm |
| Component | `features/attempts/components/AttemptForm.tsx` | Answer selection UI |
| Feature Service | `features/attempts/attempts.service.ts` | `submitAttempt()` orchestrator |
| BC Client | `services/bc/BrowserAttemptClient.ts` | `submitAttempt()` blockchain txs |
| API Client | `services/backend/attempt.service.ts` | `create()` → POST /api/attempts |
| API Controller | `api/modules/attempts/attempts.controller.ts` | POST handler |
| API Service | `api/modules/attempts/attempts.service.ts` | Prisma create + leaderboard update |
| Contract | `packages/quiz-contracts/src/attempt.ts` | `createAttempt()`, `submitAnswerWithAccess()` |

---

### Flow 4: Teacher Processes Rewards (Auto on Dashboard Load)

```
[Teacher Dashboard]  — runs on page mount for each unclaimed quiz
    │
    ▼
BrowserQuizClient.processQuizRewards(quizId)
    │
    ├── 1. getQuiz(quizId)  ──→  BLOCKCHAIN (sync latest revision)
    │
    ├── 2. BrowserAttemptClient.getQuizAttempts(quizId)  ──→  BLOCKCHAIN
    │       (finds all attempt objects for this quiz)
    │
    ├── 3. For each student: QuizHelper.addAttemptedStudent(quizId, pubKey)  ──→  BLOCKCHAIN
    │
    ├── 4. Find first correct attempt → winner
    │
    ├── 5. QuizHelper.claimReward(quizId, winnerPubKey)  ──→  BLOCKCHAIN
    │
    └── 6. PaymentHelper.transferPaymentById(paymentTxId, winnerPubKey)  ──→  BLOCKCHAIN
            (transfers reward Payment UTXO to winner)
```

---

### Flow 5: Withdraw Payments (Teacher or Student)

```
[Dashboard — Teacher or Student]
    │
    ▼
1. BrowserQuizClient.getOwnedPayments(publicKey)
    │   computer.getOUTXOs({ mod: paymentMod, publicKey })  ──→  BLOCKCHAIN
    │   → filters to sats > 546
    │
    ▼
2. UI shows "Withdraw N payments (X sats)"
    │
    ▼
3. BrowserQuizClient.withdrawAllPayments()
    │   For each payment:
    │   └── PaymentHelper.withdrawPaymentById(paymentId)  ──→  BLOCKCHAIN
    │       (sweeps UTXO balance to wallet)
```

---

### Flow 6: Teacher Mnemonic Auto-Storage

```
[Teacher Dashboard — on mount]
    │
    ▼
1. Read BIP_39_KEY from localStorage
    │
    ▼
2. userService.hasMnemonic(publicKey)  ──→  GET /api/users/:pk/has-mnemonic
    │
    ▼
3. If not stored:
    userService.storeMnemonic(publicKey, mnemonic)
    ──→  POST /api/users/:pk/mnemonic
    ──→  Server base64-encodes and saves to User.encryptedMnemonic
```

This enables **Flow 2** to auto-approve without the teacher being online.

---

## Service Layer Map

### Frontend Services (`apps/web/src/services/`)

```
services/
├── backend/             ← HTTP clients for NestJS API
│   ├── api.ts           ← Base fetch wrapper (JWT management)
│   ├── auth.service.ts  ← Login/register
│   ├── quiz.service.ts  ← Quiz CRUD
│   ├── attempt.service.ts ← Attempt records
│   ├── user.service.ts  ← User profile, mnemonic
│   ├── leaderboard.service.ts ← Rankings
│   └── access-request.service.ts ← Access request CRUD
│
├── bc/                  ← Blockchain SDK clients
│   ├── BrowserQuizClient.ts    ← Quiz read/write, payments, rewards
│   ├── BrowserAttemptClient.ts ← Attempt submission, queries
│   ├── BrowserAccessClient.ts  ← Access token swap (mint offer / finalize)
│   ├── BrowserTeacherClient.ts ← Teacher-specific orchestration
│   └── txUtils.ts              ← Transaction sequencing lock
│
├── contracts/           ← quiz-contracts helper factory
│   └── contractsService.ts
│
├── tx/                  ← Transaction parsing
│   └── txParser.ts
│
├── utils/               ← Mining utility
│   └── mineblock.ts
│
└── sdk.factory.ts       ← Computer instance creation
```

### Backend Modules (`apps/api/src/modules/`)

```
modules/
├── auth/                ← JWT authentication
│   ├── auth.controller.ts     POST /auth/login, GET /auth/me
│   ├── auth.service.ts        Login, register, JWT signing
│   └── strategies/jwt.strategy.ts
│
├── users/               ← User management
│   ├── users.controller.ts    GET/PATCH /users/:pk, mnemonic endpoints, stats
│   └── users.service.ts       Upsert, mnemonic storage, stats aggregation
│
├── quizzes/             ← Quiz management
│   ├── quizzes.controller.ts  GET/POST/PATCH /quizzes
│   └── quizzes.service.ts     CRUD with teacher auto-upsert
│
├── attempts/            ← Attempt records
│   ├── attempts.controller.ts GET/POST /attempts
│   └── attempts.service.ts    Create with leaderboard auto-update
│
├── leaderboard/         ← Rankings
│   ├── leaderboard.controller.ts  GET /leaderboard
│   └── leaderboard.service.ts     Rank calculation
│
└── access-requests/     ← Access purchase coordination
    ├── access-requests.controller.ts  CRUD + auto-approve trigger
    ├── access-requests.service.ts     Prisma CRUD
    └── auto-access.service.ts         Server-side mnemonic-based auto-approve
```

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Next.js (App Router, --webpack) | 16.1.4 |
| Backend | NestJS | 10.3 |
| Database | MongoDB Atlas | via Prisma 6.19 |
| Blockchain | Bitcoin Computer | LTC regtest |
| State | Zustand (persisted) | — |
| Auth | JWT (7-day expiry) | @nestjs/jwt |
| Monorepo | TurboRepo | — |
| Smart Contracts | @quiz-app/contracts | Custom package |

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login/register, returns JWT |
| GET | `/api/auth/me` | Current user from JWT |
| GET | `/api/users/:pk` | User profile |
| PATCH | `/api/users/:pk` | Update user (upsert) |
| POST | `/api/users/:pk/mnemonic` | Store teacher mnemonic |
| GET | `/api/users/:pk/has-mnemonic` | Check mnemonic exists |
| GET | `/api/users/:pk/stats` | User statistics |
| GET | `/api/quizzes` | List quizzes (with filters) |
| GET | `/api/quizzes/:id` | Get quiz by ID |
| POST | `/api/quizzes` | Create/sync quiz |
| PATCH | `/api/quizzes/:id` | Update quiz status |
| GET | `/api/quizzes/:id/attempts` | Quiz's attempts |
| GET | `/api/attempts` | List attempts |
| POST | `/api/attempts` | Record attempt |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/access-requests` | List access requests |
| POST | `/api/access-requests` | Create (+ auto-approve) |
| PATCH | `/api/access-requests/:id` | Update status |
| POST | `/api/access-requests/:id/auto-approve` | Manual auto-approve trigger |
