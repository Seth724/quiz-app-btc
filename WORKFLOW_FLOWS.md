# Quiz App — Full Workflow Document

> Every user flow traced end-to-end: **Frontend UI → Frontend Service → API Endpoint → Backend Service → Database / Blockchain**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Auth: Signup](#2-auth-signup)
3. [Auth: Login](#3-auth-login)
4. [Auth: Token Refresh](#4-auth-token-refresh)
5. [Auth: Logout](#5-auth-logout)
6. [Wallet Connect](#6-wallet-connect)
7. [Quiz Creation (Teacher)](#7-quiz-creation-teacher)
8. [Quiz Listing (Student / Public)](#8-quiz-listing)
9. [Access Request (Student)](#9-access-request-student)
10. [Access Auto-Approve (Backend)](#10-access-auto-approve-backend)
11. [Access Finalization (Student Pays)](#11-access-finalization-student-pays)
12. [Quiz Attempt / Answer Submission (Student)](#12-quiz-attempt--answer-submission)
13. [Auto-Reward Processing (Backend)](#13-auto-reward-processing-backend)
14. [Leaderboard](#14-leaderboard)
15. [Payment Withdrawal (Student)](#15-payment-withdrawal-student)
16. [API Endpoint Summary Table](#16-api-endpoint-summary-table)
17. [Database Models (Prisma)](#17-database-models)
18. [Blockchain Contracts & Helpers](#18-blockchain-contracts--helpers)
19. [State Stores (Zustand)](#19-state-stores)
20. [Cross-Cutting: API Client](#20-cross-cutting-api-client)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│                       localhost:3000                              │
│                                                                  │
│  ┌─────────┐   ┌──────────────┐   ┌───────────────────────────┐ │
│  │  Pages   │──▶│  Feature     │──▶│  Backend Services         │ │
│  │  (UI)    │   │  Services    │   │  (api.ts fetch wrapper)   │ │
│  └─────────┘   └──────┬───────┘   └───────────┬───────────────┘ │
│                        │                       │                 │
│                        ▼                       ▼                 │
│              ┌──────────────────┐    HTTP + JWT Bearer token     │
│              │  Blockchain      │              │                 │
│              │  Clients (bc/)   │              │                 │
│              └────────┬─────────┘              │                 │
│                       │                        │                 │
└───────────────────────┼────────────────────────┼─────────────────┘
                        │                        │
                        ▼                        ▼
              ┌──────────────────┐    ┌─────────────────────┐
              │  Bitcoin Computer │    │  NestJS API          │
              │  Node (LTC)      │    │  localhost:3002/api   │
              │  localhost:1031   │    │                      │
              │                  │    │  ┌────────────────┐  │
              │  Smart Contracts │    │  │  Controllers   │  │
              │  (on-chain)      │    │  │  Services      │  │
              └──────────────────┘    │  │  Prisma ORM    │  │
                                      │  └───────┬────────┘  │
                                      │          │           │
                                      │          ▼           │
                                      │  ┌──────────────┐   │
                                      │  │  MongoDB      │   │
                                      │  │  Atlas        │   │
                                      │  └──────────────┘   │
                                      └─────────────────────┘
```

### Key Directories

| Layer | Directory | Purpose |
|-------|-----------|---------|
| Frontend Pages | `apps/web/src/app/` | Next.js pages (teacher/, student/, etc.) |
| Frontend Components | `apps/web/src/common-components/` | LoginModal, SignupModal, Navigation |
| Feature Services | `apps/web/src/features/` | Business logic (quizzes, attempts) |
| Backend API Services | `apps/web/src/services/backend/` | HTTP wrappers for NestJS API |
| Blockchain Clients | `apps/web/src/services/bc/` | Browser-side blockchain interaction |
| React Hooks | `apps/web/src/hooks/` | useTeacherClient, useQuizClient, etc. |
| Zustand Stores | `apps/web/src/stores/` | session.store.ts, wallet.store.ts |
| API Controllers | `apps/api/src/modules/*/` | NestJS REST controllers |
| API Services | `apps/api/src/modules/*/` | NestJS business logic |
| Prisma Schema | `apps/api/prisma/schema.prisma` | MongoDB data models |
| Smart Contracts | `packages/quiz-contracts/src/` | On-chain contract classes |

---

## 2. Auth: Signup

**User registers with email + password. Gets JWT tokens immediately.**

```
SignupModal.tsx ──▶ authService.signup() ──▶ POST /api/auth/signup ──▶ AuthService.signup() ──▶ DB: User + RefreshToken
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/common-components/SignupModal.tsx` | `handleSubmit()` | Collects name, email, password, role. Calls `authService.signup()` |
| 2 | Frontend Service | `apps/web/src/services/backend/auth.service.ts` | `authService.signup()` | Sends `POST /auth/signup` via api.ts. Auto-stores JWT tokens in localStorage |
| 3 | API Client | `apps/web/src/services/backend/api.ts` | `api.post()` → `request()` | Prepends BASE_URL, sends JSON, attaches Bearer token if present |
| 4 | Controller | `apps/api/src/modules/auth/auth.controller.ts` | `@Post('signup')` | `@Public()` — no auth required. Passes body to service |
| 5 | Service | `apps/api/src/modules/auth/auth.service.ts` | `signup(dto)` | Checks email uniqueness → bcrypt hash → creates User → generates JWT + RefreshToken |
| 6 | DB | `apps/api/prisma/schema.prisma` | `User`, `RefreshToken` | Inserts user row + refresh token row |

### Data Shape

```
Request:  { name, email, password, role? }
Response: { accessToken, refreshToken, user: { id, email, name, role, publicKey } }
Stored:   localStorage['quiz_app_token'], localStorage['quiz_app_refresh_token']
```

### Post-Signup Side Effect

After signup succeeds, `SignupModal` also calls:
```
authService.connectWallet({ publicKey, mnemonic })  →  POST /api/auth/connect-wallet
```
This links the blockchain wallet to the newly created user (if wallet is already connected in the browser).

---

## 3. Auth: Login

**User logs in with email + password. Gets new JWT tokens.**

```
LoginModal.tsx ──▶ authService.login() ──▶ POST /api/auth/login ──▶ AuthService.login() ──▶ DB: User (verify) + RefreshToken (create)
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/common-components/LoginModal.tsx` | `handleSubmit()` | Collects email, password. Calls `authService.login()` |
| 2 | Frontend Service | `apps/web/src/services/backend/auth.service.ts` | `authService.login()` | Sends `POST /auth/login`. Auto-stores tokens |
| 3 | Controller | `apps/api/src/modules/auth/auth.controller.ts` | `@Post('login')` | `@Public()`. Passes to service |
| 4 | Service | `apps/api/src/modules/auth/auth.service.ts` | `login(dto)` | Find user by email → bcrypt.compare → generate JWT + new RefreshToken |
| 5 | DB | `apps/api/prisma/schema.prisma` | `User` (read), `RefreshToken` (create) | Validates credentials, creates new session |

### Post-Login Side Effect

If wallet is already connected (`walletPublicKey` exists in Zustand store) but user record has no publicKey:
```
LoginModal.tsx → authService.connectWallet({ publicKey, mnemonic })  →  POST /api/auth/connect-wallet
```

### Session Store Update

```
useSessionStore.setRole(res.user.role)
useSessionStore.setUser(res.user.id, res.user.name)
```

---

## 4. Auth: Token Refresh

**Automatic — happens transparently when a request gets 401.**

```
api.ts request() → 401 → tryRefreshToken() → POST /api/auth/refresh → new tokens → retry original request
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | API Client | `apps/web/src/services/backend/api.ts` | `request()` | Any API call returns 401 |
| 2 | API Client | `apps/web/src/services/backend/api.ts` | `tryRefreshToken()` | Sends `POST /auth/refresh` with stored refreshToken. Deduplicates concurrent refresh attempts |
| 3 | Controller | `apps/api/src/modules/auth/auth.controller.ts` | `@Post('refresh')` | `@Public()`. Passes to service |
| 4 | Service | `apps/api/src/modules/auth/auth.service.ts` | `refreshTokens(dto)` | Finds token in DB → deletes it (rotation!) → checks expiry → generates new pair |
| 5 | API Client | `apps/web/src/services/backend/api.ts` | `request()` | Stores new tokens → retries original request with new access token |

### Key Detail: Token Rotation

Each refresh token is **single-use**. When used, it's deleted and a new one is created. This prevents replay attacks.

---

## 5. Auth: Logout

**Revokes server-side refresh token + clears all frontend state.**

```
Navigation.tsx → authService.logout() → POST /api/auth/logout → Delete RefreshToken
                → sessionStore.reset()
                → walletStore.disconnect()
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/common-components/layout/Navigation.tsx` | `handleLogout()` | Triggered by logout button click |
| 2 | Frontend Service | `apps/web/src/services/backend/auth.service.ts` | `authService.logout()` | Sends `POST /auth/logout` with refreshToken. Then calls `clearTokens()` |
| 3 | Controller | `apps/api/src/modules/auth/auth.controller.ts` | `@Post('logout')` | Requires JWT. Extracts userId from `@CurrentUser()` |
| 4 | Service | `apps/api/src/modules/auth/auth.service.ts` | `logout(userId, refreshToken?)` | Deletes specific refresh token (or ALL tokens for user) from DB |
| 5 | Frontend | `Navigation.tsx` | after `authService.logout()` | `reset()` → clears Zustand session (role, userId, userName) |
| 6 | Frontend | `Navigation.tsx` | after `reset()` | `disconnectWallet()` → clears wallet store + mnemonic from localStorage |
| 7 | Frontend | `Navigation.tsx` | after `disconnectWallet()` | `router.push('/')` → redirects to home |

### What Gets Cleaned

| Store | Keys Cleared |
|-------|-------------|
| localStorage | `quiz_app_token`, `quiz_app_refresh_token`, `BIP_39_KEY`, `CHAIN`, `NETWORK`, `URL`, `PATH` |
| Zustand session | `role`, `userId`, `userName`, `lastVisitedPage` → all null |
| Zustand wallet | `publicKey`, `address`, `isConnected` → null/false |
| Server DB | `RefreshToken` row deleted |

### What Stays in DB

User account (email, name, role, publicKey), quizzes, attempts, leaderboard entries — all permanent.

---

## 6. Wallet Connect

**Links a Bitcoin Computer (LTC) wallet to the user's browser and API account.**

```
WalletConnect.tsx → wallet.service.ts → localStorage (BIP_39_KEY)
                  → walletStore.connect()
                  → authService.connectWallet() → POST /api/auth/connect-wallet → DB: User.publicKey
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/features/wallet/components/WalletConnect.tsx` | `handleConnect()` | User enters/generates mnemonic, selects chain/network |
| 2 | Wallet Service | `apps/web/src/features/wallet/wallet.service.ts` | `connectWallet()` | Stores `BIP_39_KEY`, `CHAIN`, `NETWORK`, `URL` in localStorage |
| 3 | Computer Factory | `apps/web/src/services/index.ts` | `createComputerFromStorage()` | Creates `new Computer({ mnemonic, chain, network, url })` from localStorage |
| 4 | Wallet Service | `apps/web/src/features/wallet/wallet.service.ts` | `getWalletInfo(computer)` | Gets publicKey + address from Computer instance |
| 5 | Zustand | `apps/web/src/stores/wallet.store.ts` | `connect({ publicKey, address })` | Sets wallet state, `isConnected = true` |
| 6 | Frontend Service | `apps/web/src/services/backend/auth.service.ts` | `authService.connectWallet()` | `POST /auth/connect-wallet` — links publicKey to user in DB |
| 7 | Controller | `apps/api/src/modules/auth/auth.controller.ts` | `@Post('connect-wallet')` | Requires JWT. Extracts userId from token |
| 8 | Service | `apps/api/src/modules/auth/auth.service.ts` | `connectWallet(userId, dto)` | Checks publicKey uniqueness → updates User.publicKey (+ stores mnemonic as base64 for teachers) |

### Data Shape

```
Request:  { publicKey: "02abc...", mnemonic?: "word1 word2 ..." }
Response: { publicKey: "02abc...", message: "Wallet connected successfully" }
DB:       User.publicKey = "02abc...", User.encryptedMnemonic = base64(mnemonic)
```

### Why Mnemonic Is Stored

For **teachers only**: the server uses the teacher's mnemonic to auto-approve access requests and auto-process rewards without the teacher being online. See flows #10 and #13.

---

## 7. Quiz Creation (Teacher)

**Teacher creates a quiz with 1 question + 4 options. Created on blockchain first, then synced to DB.**

```
teacher/page.tsx → createQuiz() → BrowserQuizClient.createQuiz() → Blockchain (Payment + Quiz)
                                → quizService.create() → POST /api/quizzes → DB: Quiz
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/teacher/page.tsx` | Create quiz form | Teacher fills title, question, 4 options, correct answer, reward, entry fee |
| 2 | Feature Service | `apps/web/src/features/quizzes/quizzes.service.ts` | `createQuiz(teacherClient, params)` | Pre-checks JWT token exists |
| 3 | Hook | `apps/web/src/hooks/useClients.ts` | `useTeacherClient()` | Creates `BrowserTeacherClient` from Computer instance |
| 4 | BC Client | `apps/web/src/services/bc/BrowserTeacherClient.ts` | `createQuiz(quizData)` | Delegates to `BrowserQuizClient.createQuiz()` |
| 5 | BC Client | `apps/web/src/services/bc/BrowserQuizClient.ts` | `createQuiz(quizData)` | **Blockchain Step 1**: `PaymentHelper.createPayment(rewardAmount)` — creates Payment smart object |
| 6 | BC Client | (same) | (same) | Mines 2 blocks (regtest) to confirm payment |
| 7 | BC Client | (same) | (same) | **Blockchain Step 2**: `QuizHelper.createQuiz({...})` — creates Quiz smart object on-chain |
| 8 | Feature Service | `apps/web/src/features/quizzes/quizzes.service.ts` | `createQuiz()` continued | `authService.connectWallet()` — ensures publicKey is linked to user before DB insert |
| 9 | Feature Service | (same) | (same) | `quizService.create({...})` — syncs quiz to database |
| 10 | Backend Service | `apps/web/src/services/backend/quiz.service.ts` | `quizService.create()` | `POST /api/quizzes` with quiz data |
| 11 | Controller | `apps/api/src/modules/quizzes/quizzes.controller.ts` | `@Post()` | `@Roles('TEACHER')` — only teachers can create. Passes to service |
| 12 | Service | `apps/api/src/modules/quizzes/quizzes.service.ts` | `create(dto, userId)` | Inserts Quiz row with blockchain txId as primary key |
| 13 | DB | `apps/api/prisma/schema.prisma` | `Quiz` | Quiz.id = blockchain txId, Quiz.teacherPubKey → User.publicKey FK |

### Blockchain Objects Created

```
1. Payment { amount: rewardAmount }          — holds the reward satoshis
2. Quiz    { title, questionText, options,   — the quiz smart object
             correctAnswer, rewardAmount,
             entryFee, paymentTxId,
             teacherPublicKey }
```

### Smart Contract Helpers Used

| Helper | Package | Method |
|--------|---------|--------|
| `PaymentHelper` | `@quiz-app/contracts` | `createPayment(amount)` |
| `QuizHelper` | `@quiz-app/contracts` | `createQuiz(data)` |

---

## 8. Quiz Listing

**Public — no auth required. DB-first, blockchain fallback.**

```
student/page.tsx → getAllQuizzes() → quizService.list() → GET /api/quizzes → DB: Quiz[]
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/student/page.tsx` | `useEffect → fetchQuizzes()` | On page load |
| 2 | Feature Service | `apps/web/src/features/quizzes/quizzes.service.ts` | `getAllQuizzes()` | Tries DB first, falls back to blockchain query |
| 3 | Backend Service | `apps/web/src/services/backend/quiz.service.ts` | `quizService.list()` | `GET /api/quizzes?isActive=true&...` |
| 4 | Controller | `apps/api/src/modules/quizzes/quizzes.controller.ts` | `@Get()` | `@Public()` — no auth. Passes filters to service |
| 5 | Service | `apps/api/src/modules/quizzes/quizzes.service.ts` | `findAll(query)` | Prisma query with filters, pagination, includes teacher info + attempt count |
| 6 | DB | `apps/api/prisma/schema.prisma` | `Quiz` | Returns paginated quiz list |

### Blockchain Fallback

If DB is unavailable, `getAllQuizzes()` falls back to:
```
computer.query({ mod: MODULE_SPECS.quizMod }) → sync each quiz ID
```

---

## 9. Access Request (Student)

**Student requests access to a quiz. Creates a DB record, then triggers auto-approve if teacher has stored mnemonic.**

```
student/quiz/[id]/page.tsx → accessRequestService.create() → POST /api/access-requests → DB: AccessRequest
                                                            → AutoAccessService.autoApprove() (if mnemonic stored)
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/student/quiz/[id]/page.tsx` | "Request Access" button | Student clicks to request access to a quiz |
| 2 | Backend Service | `apps/web/src/services/backend/access-request.service.ts` | `accessRequestService.create()` | `POST /api/access-requests` |
| 3 | Controller | `apps/api/src/modules/access-requests/access-requests.controller.ts` | `@Post()` | JWT required. Creates request, then checks auto-approve |
| 4 | Service | `apps/api/src/modules/access-requests/access-requests.service.ts` | `create(dto)` | Inserts AccessRequest with status `"pending"` |
| 5 | Controller | (same) | (same) | Checks if teacher has stored mnemonic → calls `autoAccessService.autoApprove()` |
| 6 | DB | `apps/api/prisma/schema.prisma` | `AccessRequest` | Created with status pending or approved (if auto-approved) |

### Data Shape

```
Request:  { quizId, quizTitle?, studentPublicKey, teacherPublicKey, entryFee? }
Response: { id, quizId, status: "pending"|"approved", offerTxHex?, accessTokenId?, ... }
```

---

## 10. Access Auto-Approve (Backend)

**Server-side — teacher doesn't need to be online. Uses stored mnemonic to mint access token + create offer.**

```
AccessRequestsController.create() → AutoAccessService.autoApprove()
    → Computer (teacher's mnemonic)
    → QuizAccessHelper.createQuizAccess()   ←── Blockchain: Mint access token
    → QuizAccessSaleHelper.createOfferTx()  ←── Blockchain: Create half-signed swap tx
    → DB: AccessRequest.status = "approved", .offerTxHex = "..."
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | Service | `apps/api/src/modules/access-requests/auto-access.service.ts` | `autoApprove(requestId)` | Loads request + teacher mnemonic from DB |
| 2 | Service | (same) | (same) | Creates `new Computer({ mnemonic })` with teacher's stored mnemonic |
| 3 | Blockchain | (same) | (same) | `QuizAccessHelper.createQuizAccess(quizId, 1)` — mints 1-unit access token on-chain |
| 4 | Blockchain | (same) | (same) | `QuizAccessSaleHelper.createOfferTx(accessToken, mockPayment)` — creates partially-signed atomic swap tx |
| 5 | DB | (same) | (same) | Updates AccessRequest: `status="approved"`, `offerTxHex=<hex>`, `accessTokenId=<id>` |

### Smart Contract Helpers Used

| Helper | Method | What It Does |
|--------|--------|--------------|
| `QuizAccessHelper` | `createQuizAccess(quizId, amount)` | Mints a QuizAccess token (NFT-like) |
| `QuizAccessSaleHelper` | `createOfferTx(accessToken, mockPayment)` | Creates a half-signed atomic swap transaction |
| `PaymentMock` | constructor(entryFee) | Placeholder payment for the teacher's side of the swap |

---

## 11. Access Finalization (Student Pays)

**Student completes the atomic swap: creates real payment + finalizes offer tx + broadcasts.**

```
student/quiz/[id]/page.tsx → BrowserAccessClient.finalizeAndBroadcastOffer()
    → PaymentHelper.createPayment(entryFee)              ←── Blockchain: Create payment
    → QuizAccessSaleHelper.finalizeOfferTx(offerTx, ...)  ←── Blockchain: Complete swap
    → computer.fund() + sign() + broadcast()              ←── Blockchain: Broadcast
    → accessRequestService.update() → PATCH /api/access-requests/:id → DB: status="completed"
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/student/quiz/[id]/page.tsx` | "Finalize Access" button | Student sees approved request with offerTxHex |
| 2 | Hook | `apps/web/src/hooks/useClients.ts` | `useAccessClient()` | Creates `BrowserAccessClient` from Computer |
| 3 | BC Client | `apps/web/src/services/bc/BrowserAccessClient.ts` | `finalizeAndBroadcastOffer(offerTxHex, entryFee)` | Full atomic swap flow |
| 4 | Blockchain | (same) | Step 1 | `PaymentHelper.createPayment(entryFee)` — student creates real payment |
| 5 | Blockchain | (same) | Step 2 | `Transaction.fromHex(offerTxHex)` — deserialize teacher's offer |
| 6 | Blockchain | (same) | Step 3 | `QuizAccessSaleHelper.finalizeOfferTx(offerTx, payment, scriptPubKey)` — complete the swap |
| 7 | Blockchain | (same) | Step 4 | `computer.fund()` + `computer.sign()` + `computer.broadcast()` |
| 8 | Blockchain | (same) | Step 5 | `computer.sync(txId)` — sync to get the QuizAccess token the student now owns |
| 9 | Backend Service | `apps/web/src/services/backend/access-request.service.ts` | `accessRequestService.update()` | `PATCH /api/access-requests/:id` with status="completed" |
| 10 | Controller | `apps/api/src/modules/access-requests/access-requests.controller.ts` | `@Patch(':id')` | Updates AccessRequest in DB |
| 11 | DB | `apps/api/prisma/schema.prisma` | `AccessRequest` | `status="completed"`, `accessTokenId`, `completedTxId` |

### What Happens in the Atomic Swap

```
BEFORE:  Teacher owns QuizAccess token,  Student owns Payment(entryFee)
AFTER:   Student owns QuizAccess token,  Teacher owns Payment(entryFee)
```

The swap is **atomic** — either both transfers happen or neither does.

---

## 12. Quiz Attempt / Answer Submission

**Student submits their answer. Created on blockchain first, then synced to DB.**

```
student/quiz/[id]/page.tsx → submitAttempt()
    → BrowserAttemptClient.submitAttempt()
        → AttemptHelper.createAttempt()          ←── Blockchain: Create attempt object
        → AttemptHelper.submitAnswerWithAccess()  ←── Blockchain: Submit answer + burn access token
    → attemptService.create() → POST /api/attempts → DB: Attempt + LeaderboardEntry
                                                   → AutoRewardService (if correct)
    → quizService.update() → PATCH /api/quizzes/:id → DB: Quiz.isClaimed = true
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/student/quiz/[id]/page.tsx` | Submit answer button | Student selects an option and submits |
| 2 | Feature Service | `apps/web/src/features/attempts/attempts.service.ts` | `submitAttempt(attemptClient, params)` | Orchestrates blockchain + DB sync |
| 3 | Hook | `apps/web/src/hooks/useClients.ts` | `useAttemptClient()` | Creates `BrowserAttemptClient` from Computer |
| 4 | BC Client | `apps/web/src/services/bc/BrowserAttemptClient.ts` | `submitAttempt(quizId, selectedAnswer, accessTokenId)` | Full blockchain attempt flow |
| 5 | Blockchain | (same) | Pre-check | `hasStudentAttemptedQuiz()` — prevents duplicate attempts |
| 6 | Blockchain | (same) | Step 0 | `computer.sync(quizId)` — get quiz, `computer.sync(accessTokenId)` — get access token |
| 7 | Blockchain | (same) | Step 1 | `AttemptHelper.createAttempt(quizId, studentPubKey)` — create QuizAttempt on-chain |
| 8 | Blockchain | (same) | Step 2 | `AttemptHelper.submitAnswerWithAccess(attempt, accessToken, selectedAnswer, quiz)` — submit answer, burns 1 unit of access token, checks correctness, calculates reward |
| 9 | Feature Service | `apps/web/src/features/attempts/attempts.service.ts` | DB sync | `attemptService.create({...})` → `POST /api/attempts` |
| 10 | Controller | `apps/api/src/modules/attempts/attempts.controller.ts` | `@Post()` | JWT required. Extracts `@CurrentUser()` userId |
| 11 | Service | `apps/api/src/modules/attempts/attempts.service.ts` | `create(dto, userId)` | Auto-links wallet if publicKey not in DB → creates Attempt → updates LeaderboardEntry |
| 12 | Service | (same) | (same) | If `isCorrect`: fires `AutoRewardService.processReward()` (fire-and-forget) |
| 13 | Feature Service | (back to frontend) | If correct | `quizService.update(quizId, { isClaimed: true, claimedBy })` → `PATCH /api/quizzes/:id` |

### Blockchain Objects Involved

| Object | Action |
|--------|--------|
| `Quiz` | Synced (read correctAnswer, rewardAmount) |
| `QuizAccess` | Synced then **burned** (amount decremented) |
| `QuizAttempt` | **Created** (records answer + result) |

### Auto-Link Wallet (Safety Net)

If the student's `publicKey` isn't in the `users` table, the service auto-links it:
```
Service: prisma.user.update({ where: { id: authenticatedUserId }, data: { publicKey } })
```

---

## 13. Auto-Reward Processing (Backend)

**Server-side — triggered automatically when a correct attempt is recorded. Teacher doesn't need to be online.**

```
AttemptsService.create() → AutoRewardService.processReward()
    → Computer (teacher's mnemonic)
    → QuizHelper.addAttemptedStudent()   ←── Blockchain
    → QuizHelper.claimReward()           ←── Blockchain
    → PaymentHelper.transferPayment()    ←── Blockchain: Transfer payment to winner
    → DB: Quiz.isClaimed = true
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | Trigger | `apps/api/src/modules/attempts/attempts.service.ts` | `create()` | After creating attempt, if `isCorrect`, fires `autoRewardService.processReward()` (fire-and-forget) |
| 2 | Service | `apps/api/src/modules/attempts/auto-reward.service.ts` | `processReward(quizId, winnerPubKey)` | Loads quiz + teacher mnemonic from DB |
| 3 | Service | (same) | (same) | Creates `new Computer({ mnemonic })` with teacher's stored mnemonic |
| 4 | Blockchain | (same) | Step 1 | `QuizHelper.addAttemptedStudent(quizId, winnerPubKey)` — adds student to quiz's attempted list |
| 5 | Blockchain | (same) | Step 2 | `QuizHelper.claimReward(quizId, winnerPubKey)` — marks quiz as claimed by winner |
| 6 | Blockchain | (same) | Step 3 | `PaymentHelper.transferPayment(payment, winnerPubKey)` — transfers Payment object ownership to student |
| 7 | DB | (same) | (same) | Updates Quiz.isClaimed = true, Quiz.claimedBy = winnerPubKey |

### Smart Contract Helpers Used

| Helper | Method | What It Does |
|--------|--------|--------------|
| `QuizHelper` | `addAttemptedStudent(quizId, pubKey)` | Records student as having attempted |
| `QuizHelper` | `claimReward(quizId, winnerPubKey)` | Sets quiz.isClaimed = true, quiz.claimedBy |
| `PaymentHelper` | `getPayment(paymentTxId)` | Syncs the Payment object |
| `PaymentHelper` | `transferPayment(payment, newOwnerPubKey)` | Transfers ownership of the Payment to student |

### Result

After auto-reward, the student **owns** the Payment smart object on-chain. They can withdraw it to their wallet (see flow #15).

---

## 14. Leaderboard

**Public — no auth required. Read from DB.**

```
leaderboard/page.tsx → leaderboardService.getLeaderboard() → GET /api/leaderboard → DB: LeaderboardEntry[]
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/leaderboard/page.tsx` | `useEffect → fetch` | On page load |
| 2 | Backend Service | `apps/web/src/services/backend/leaderboard.service.ts` | `leaderboardService.getLeaderboard(limit?)` | `GET /api/leaderboard?limit=100` |
| 3 | Controller | `apps/api/src/modules/leaderboard/leaderboard.controller.ts` | `@Get()` | `@Public()`. Passes limit |
| 4 | Service | `apps/api/src/modules/leaderboard/leaderboard.service.ts` | `getLeaderboard(limit)` | Queries LeaderboardEntry ordered by totalRewards desc |
| 5 | DB | `apps/api/prisma/schema.prisma` | `LeaderboardEntry` | Returns ranked entries |

### How Leaderboard Gets Updated

The leaderboard is **NOT** a separate flow. It's updated as a **side effect** of creating an attempt (flow #12):

```
AttemptsService.create() → updateLeaderboard(studentPubKey, isCorrect, rewardEarned)
    → Upsert LeaderboardEntry: totalAttempts++, correctCount++, totalRewards += reward
```

---

## 15. Payment Withdrawal (Student)

**Pure blockchain — no backend API involved. Student collects owned Payment objects.**

```
student/page.tsx → BrowserQuizClient.withdrawAllPayments()
    → computer.getOUTXOs() → get all Payment objects owned by student
    → For each: computer.sync() → extract satoshis → send to student's address
```

### Step-by-Step

| Step | Layer | File | Function | What Happens |
|------|-------|------|----------|--------------|
| 1 | UI | `apps/web/src/app/student/page.tsx` | "Withdraw" button | Student clicks to withdraw earned rewards |
| 2 | BC Client | `apps/web/src/services/bc/BrowserQuizClient.ts` | `getOwnedPayments(publicKey)` | Queries blockchain for Payment objects owned by student |
| 3 | BC Client | (same) | `withdrawAllPayments()` | For each Payment: transfers satoshis to student's wallet address |
| 4 | Blockchain | Bitcoin Computer node | UTXO transfers | Satoshis move from smart object to student's LTC address |

### No DB Involvement

Withdrawals are pure blockchain operations. The DB doesn't track payment withdrawals.

---

## 16. API Endpoint Summary Table

| Method | Endpoint | Auth | Guard | Controller | Service | DB Models |
|--------|----------|------|-------|------------|---------|-----------|
| `POST` | `/api/auth/signup` | Public | — | `auth.controller.ts` | `auth.service.ts` → `signup()` | User, RefreshToken |
| `POST` | `/api/auth/login` | Public | — | `auth.controller.ts` | `auth.service.ts` → `login()` | User, RefreshToken |
| `POST` | `/api/auth/refresh` | Public | — | `auth.controller.ts` | `auth.service.ts` → `refreshTokens()` | RefreshToken |
| `POST` | `/api/auth/logout` | JWT | JwtAuthGuard | `auth.controller.ts` | `auth.service.ts` → `logout()` | RefreshToken |
| `POST` | `/api/auth/connect-wallet` | JWT | JwtAuthGuard | `auth.controller.ts` | `auth.service.ts` → `connectWallet()` | User |
| `GET` | `/api/auth/me` | JWT | JwtAuthGuard | `auth.controller.ts` | `auth.service.ts` → `getMe()` | User |
| `GET` | `/api/quizzes` | Public | — | `quizzes.controller.ts` | `quizzes.service.ts` → `findAll()` | Quiz |
| `GET` | `/api/quizzes/:id` | Public | — | `quizzes.controller.ts` | `quizzes.service.ts` → `findOne()` | Quiz |
| `POST` | `/api/quizzes` | JWT | JwtAuthGuard + RolesGuard(TEACHER) | `quizzes.controller.ts` | `quizzes.service.ts` → `create()` | Quiz |
| `PATCH` | `/api/quizzes/:id` | JWT | JwtAuthGuard | `quizzes.controller.ts` | `quizzes.service.ts` → `update()` | Quiz |
| `GET` | `/api/quizzes/:id/attempts` | JWT | JwtAuthGuard | `quizzes.controller.ts` | `quizzes.service.ts` → `getQuizAttempts()` | Attempt |
| `GET` | `/api/attempts` | Public | — | `attempts.controller.ts` | `attempts.service.ts` → `findAll()` | Attempt |
| `GET` | `/api/attempts/:id` | Public | — | `attempts.controller.ts` | `attempts.service.ts` → `findOne()` | Attempt |
| `POST` | `/api/attempts` | JWT | JwtAuthGuard | `attempts.controller.ts` | `attempts.service.ts` → `create()` | Attempt, LeaderboardEntry, User |
| `GET` | `/api/access-requests` | Public | — | `access-requests.controller.ts` | `access-requests.service.ts` → `findAll()` | AccessRequest |
| `GET` | `/api/access-requests/:id` | Public | — | `access-requests.controller.ts` | `access-requests.service.ts` → `findOne()` | AccessRequest |
| `POST` | `/api/access-requests` | JWT | JwtAuthGuard | `access-requests.controller.ts` | `access-requests.service.ts` → `create()` | AccessRequest |
| `POST` | `/api/access-requests/:id/auto-approve` | JWT | JwtAuthGuard | `access-requests.controller.ts` | `auto-access.service.ts` → `autoApprove()` | AccessRequest, User |
| `PATCH` | `/api/access-requests/:id` | JWT | JwtAuthGuard | `access-requests.controller.ts` | `access-requests.service.ts` → `update()` | AccessRequest |
| `GET` | `/api/leaderboard` | Public | — | `leaderboard.controller.ts` | `leaderboard.service.ts` → `getLeaderboard()` | LeaderboardEntry |
| `GET` | `/api/leaderboard/:publicKey` | Public | — | `leaderboard.controller.ts` | `leaderboard.service.ts` → `getUserRank()` | LeaderboardEntry |
| `GET` | `/api/users/:publicKey` | Public | — | `users.controller.ts` | `users.service.ts` → `getProfile()` | User |
| `POST` | `/api/users` | JWT | JwtAuthGuard | `users.controller.ts` | `users.service.ts` → `create()` | User |
| `PATCH` | `/api/users/:publicKey` | JWT | JwtAuthGuard | `users.controller.ts` | `users.service.ts` → `update()` | User |
| `POST` | `/api/users/:publicKey/mnemonic` | JWT | JwtAuthGuard | `users.controller.ts` | — | User |
| `GET` | `/api/users/:publicKey/has-mnemonic` | Public | — | `users.controller.ts` | — | User |
| `GET` | `/api/users/:publicKey/stats` | Public | — | `users.controller.ts` | `users.service.ts` → `getStats()` | User, Attempt |

---

## 17. Database Models

### Prisma Schema (`apps/api/prisma/schema.prisma`)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    User       │     │      Quiz        │     │   Attempt    │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (ObjectId) │     │ id (bc txId)     │     │ id (ObjectId)│
│ name          │◄────│ teacherPubKey FK │     │ quizId FK ───┤──► Quiz
│ email @unique │     │ title            │     │ studentPubKey│──► User
│ password      │     │ questionText     │     │ selectedAnswer│
│ publicKey?    │     │ options[]        │     │ isCorrect    │
│   @unique     │     │ correctAnswer?   │     │ rewardEarned │
│ role          │     │ rewardAmount     │     │ blockchainTxId│
│ encryptedMnem │     │ entryFee         │     │ attemptedAt  │
│ createdAt     │     │ isActive         │     └──────────────┘
│ updatedAt     │     │ isClaimed        │
└──────┬───────┘     │ claimedBy?       │     ┌──────────────────┐
       │              │ paymentTxId      │     │ LeaderboardEntry │
       │              │ createdAt        │     ├──────────────────┤
       ▼              └──────────────────┘     │ id (ObjectId)    │
┌──────────────┐                               │ publicKey @unique│
│ RefreshToken  │     ┌──────────────────┐     │ name?            │
├──────────────┤     │  AccessRequest   │     │ totalRewards     │
│ id (ObjectId) │     ├──────────────────┤     │ correctCount     │
│ token @unique │     │ id (ObjectId)    │     │ totalAttempts    │
│ userId FK ────┤──►  │ quizId           │     │ rank?            │
│ expiryDate    │     │ quizTitle?       │     │ updatedAt        │
│ createdAt     │     │ studentPublicKey │     └──────────────────┘
└──────────────┘     │ teacherPublicKey │
                      │ entryFee         │
                      │ status           │
                      │ offerTxHex?      │
                      │ accessTokenId?   │
                      │ completedTxId?   │
                      └──────────────────┘
```

---

## 18. Blockchain Contracts & Helpers

### Smart Contract Classes (`packages/quiz-contracts/src/`)

| Contract Class | File | Purpose |
|---------------|------|---------|
| `Quiz` | `quiz.ts` | Quiz smart object (title, question, options, reward, etc.) |
| `QuizAttempt` | `attempt.ts` | Records a student's answer attempt |
| `QuizAccess` | `quiz-access.ts` | NFT-like access token (amount=1, burned on use) |
| `Payment` | `payment.ts` | Holds satoshis (reward amount or entry fee) |
| `PaymentMock` | `payment.ts` | Placeholder for teacher's side of atomic swap |
| `Teacher` | `teacher.ts` | Teacher profile object |
| `Student` | `student.ts` | Student profile object |

### Helper Classes (wrap contract interactions)

| Helper | File | Key Methods |
|--------|------|-------------|
| `QuizHelper` | `quiz.ts` | `createQuiz()`, `addAttemptedStudent()`, `claimReward()` |
| `AttemptHelper` | `attempt.ts` | `createAttempt()`, `submitAnswerWithAccess()` |
| `PaymentHelper` | `payment.ts` | `createPayment()`, `getPayment()`, `transferPayment()` |
| `QuizAccessHelper` | `quiz-access.ts` | `createQuizAccess()` |
| `QuizAccessSaleHelper` | `quiz-access-sale.ts` | `createOfferTx()`, `finalizeOfferTx()` |
| `TeacherHelper` | `teacher.ts` | `createTeacher()` |

### Browser Clients (`apps/web/src/services/bc/`)

| Client | File | Wraps |
|--------|------|-------|
| `BrowserTeacherClient` | `BrowserTeacherClient.ts` | TeacherHelper + QuizHelper |
| `BrowserQuizClient` | `BrowserQuizClient.ts` | QuizHelper + PaymentHelper |
| `BrowserAttemptClient` | `BrowserAttemptClient.ts` | AttemptHelper |
| `BrowserAccessClient` | `BrowserAccessClient.ts` | QuizAccessHelper + QuizAccessSaleHelper + PaymentHelper |

---

## 19. State Stores

### Session Store (`apps/web/src/stores/session.store.ts`)

```typescript
{
  role: 'teacher' | 'student' | null,
  userId: string | null,
  userName: string | null,
  lastVisitedPage: string | null,
  // Actions: setRole(), setUser(), clearUser(), reset()
}
// Persisted to localStorage via Zustand persist middleware
```

### Wallet Store (`apps/web/src/stores/wallet.store.ts`)

```typescript
{
  publicKey: string | null,
  address: string | null,
  chain: 'LTC',
  network: 'regtest',
  url: 'http://localhost:1031',
  isConnected: boolean,
  moduleSpecs: { quizMod?, attemptMod?, paymentMod?, ... },
  // Actions: connect(), disconnect(), updateConfig(), setModuleSpecs()
}
// Persisted to localStorage via Zustand persist middleware
```

---

## 20. Cross-Cutting: API Client

### `apps/web/src/services/backend/api.ts`

All backend HTTP calls go through this single client:

```
request(endpoint, options)
  ├── Prepends BASE_URL (http://localhost:3002/api)
  ├── Sets Content-Type: application/json
  ├── Attaches Authorization: Bearer <token> (if token in localStorage)
  ├── On 401 → tryRefreshToken() → retry once
  │            └── POST /auth/refresh with stored refresh token
  │            └── On success: stores new tokens, retries original request
  │            └── On failure: clearTokens(), throw error
  └── Returns parsed JSON
```

### localStorage Keys

| Key | Purpose | Set By | Cleared By |
|-----|---------|--------|------------|
| `quiz_app_token` | JWT access token (1h expiry) | `setTokens()` on login/signup/refresh | `clearTokens()` on logout |
| `quiz_app_refresh_token` | UUID refresh token (7 day, single-use) | `setTokens()` on login/signup/refresh | `clearTokens()` on logout |
| `BIP_39_KEY` | Wallet mnemonic | `connectWallet()` in wallet.service.ts | `disconnect()` in wallet.store.ts |
| `CHAIN` | Blockchain chain (LTC) | wallet.store.ts `connect()` | `disconnect()` |
| `NETWORK` | Blockchain network (regtest) | wallet.store.ts `connect()` | `disconnect()` |
| `URL` | Blockchain node URL | wallet.store.ts `connect()` | `disconnect()` |

---

## Full Happy-Path Sequence

```
1. SIGNUP    → User registers with email/password → gets JWT tokens
2. WALLET    → User connects wallet (enters mnemonic) → publicKey linked to user in DB
3. TEACHER CREATES QUIZ
   a. Payment created on blockchain (holds reward satoshis)
   b. Quiz created on blockchain (references payment)
   c. Quiz synced to MongoDB
4. STUDENT REQUESTS ACCESS
   a. AccessRequest created in DB (status: pending)
   b. Auto-approve: server mints QuizAccess token + creates offer tx
   c. AccessRequest updated (status: approved, offerTxHex stored)
5. STUDENT FINALIZES ACCESS
   a. Student creates Payment(entryFee) on blockchain
   b. Atomic swap: student gets QuizAccess, teacher gets Payment
   c. AccessRequest updated (status: completed)
6. STUDENT SUBMITS ANSWER
   a. QuizAttempt created on blockchain
   b. Answer submitted with access token (token burned)
   c. Attempt synced to MongoDB + leaderboard updated
   d. If correct: auto-reward fires server-side
7. AUTO-REWARD (if correct)
   a. Server uses teacher mnemonic to sign blockchain txs
   b. Student added to quiz's attempted list
   c. Quiz marked as claimed by winner
   d. Payment object transferred to student
8. STUDENT WITHDRAWS
   a. Student collects owned Payment objects from blockchain
   b. Satoshis sent to student's LTC wallet address
```
