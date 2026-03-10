# Quiz App Smart Contracts

Smart contracts and business logic for the Decentralized Quiz App built on Bitcoin Computer.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible.

---

## Overview

This package contains the core smart contracts that power the Quiz App decentralized platform. All contracts are written in TypeScript and deployed using the Bitcoin Computer SDK.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Bitcoin Computer 0.26** | Blockchain abstraction layer for LTC/BTC |
| **TypeScript** | Type-safe contract development |
| **Mocha 11 + Chai 5** | Testing framework |
| **Node.js** | Runtime environment |

---

## Contracts

### Teacher Contract

Manages teacher accounts, permissions, and quiz creation.

**File:** `src/teacher.ts`

**Key Methods:**
- `create(quizData)` - Create a new quiz
- `update(quizId, updates)` - Update existing quiz
- `withdraw(quizId)` - Withdraw accumulated entry fees
- `getQuizzes(teacherId)` - Get all quizzes by teacher

```typescript
import { Teacher } from './teacher'

const teacher = new Teacher(computer, teacherModSpec)

// Create a new quiz
const quiz = await teacher.create({
  title: 'Bitcoin Basics',
  questionText: 'What does BTC stand for?',
  options: ['Bitcoin', 'Block Token', 'Binary Coin', 'Digital Cash'],
  correctAnswer: 0,
  rewardAmount: 10000n, // 10,000 satoshis
  entryFee: 1000n,     // 1,000 satoshis
})
```

---

### Student Contract

Manages student accounts and quiz interactions.

**File:** `src/student.ts`

**Key Methods:**
- `register(studentData)` - Register new student
- `attempt(quizId, answers)` - Submit quiz attempt
- `getAttempts(studentId)` - Get all attempts by student
- `getStats(studentId)` - Get student statistics

```typescript
import { Student } from './student'

const student = new Student(computer, studentModSpec)

// Submit quiz attempt
const attempt = await student.attempt({
  quizId: quiz.moduleId,
  answers: [0, 1, 2, 1, 0],
  student: studentPublicKey,
})
```

---

### Quiz Contract

Defines quiz structure, questions, and state management.

**File:** `src/quiz.ts`

**Key Methods:**
- `create(quizData)` - Create quiz
- `update(updates)` - Update quiz details
- `getDetails()` - Get quiz details
- `getQuestions()` - Get quiz questions

```typescript
import { Quiz } from './quiz'

const quiz = new Quiz(computer, quizModSpec)

// Get quiz details
const details = await quiz.getDetails()
console.log('Quiz:', details.title)
console.log('Reward:', details.rewardAmount, 'satoshis')
```

---

### QuizAttempt Contract

Handles quiz attempt tracking and validation.

**File:** `src/attempt.ts`

**Key Methods:**
- `create(attemptData)` - Create new attempt
- `validate(answers)` - Validate answers
- `getScore()` - Calculate score
- `isCorrect()` - Check if passed

```typescript
import { QuizAttempt } from './attempt'

const attempt = new QuizAttempt(computer, attemptModSpec)

// Create attempt
const result = await attempt.create({
  quizId: quiz.moduleId,
  student: studentPublicKey,
  answers: [0, 1, 2, 1, 0],
})
```

---

### Payment Contract

Manages payment processing, transfers, and withdrawals.

**File:** `src/payment.ts`

**Key Methods:**
- `transfer(from, to, amount)` - Transfer funds
- `withdraw(amount, recipient)` - Withdraw funds
- `getBalance(address)` - Get balance
- `getTransactions(address)` - Get transaction history

```typescript
import { Payment } from './payment'

const payment = new Payment(computer, paymentModSpec)

// Transfer entry fee from student to teacher
const tx = await payment.transfer({
  from: studentPublicKey,
  to: teacherPublicKey,
  amount: 1000n,
})
```

---

### QuizAccess Contract

NFT-like tokens that grant quiz access.

**File:** `src/quiz-access.ts`

**Key Methods:**
- `mint(quizId, owner)` - Mint access token
- `transfer(tokenId, to)` - Transfer token
- `getTokenOwner(tokenId)` - Get token owner
- `getTokensByOwner(owner)` - Get all tokens by owner

```typescript
import { QuizAccess } from './quiz-access'

const access = new QuizAccess(computer, accessModSpec)

// Mint access token after payment
const token = await access.mint({
  quizId: quiz.moduleId,
  owner: studentPublicKey,
})
```

---

### QuizAccessSale Contract

Handles atomic swap sales of access tokens.

**File:** `src/quiz-access-sale.ts`

**Key Methods:**
- `create(tokenId, price)` - Create sale listing
- `cancel(saleId)` - Cancel sale
- `purchase(saleId)` - Purchase via atomic swap
- `getSale(saleId)` - Get sale details

```typescript
import { QuizAccessSale } from './quiz-access-sale'

const sale = new QuizAccessSale(computer, saleModSpec)

// Create sale listing
const saleListing = await sale.create({
  tokenId: accessTokenId,
  price: 1000n,
  seller: sellerPublicKey,
})

// Purchase via atomic swap
const result = await sale.purchase({
  saleId: saleListing.moduleId,
  buyer: buyerPublicKey,
})
```

---

## Helpers

Utility classes for common operations:

| Helper | File | Purpose |
|--------|------|---------|
| **TeacherHelper** | `helpers/teacher-helper.ts` | Teacher quiz operations |
| **StudentHelper** | `helpers/student-helper.ts` | Student operations |
| **QuizHelper** | `helpers/quiz-helper.ts` | Quiz utilities |
| **AttemptHelper** | `helpers/attempt-helper.ts` | Attempt validation |
| **PaymentHelper** | `helpers/payment-helper.ts` | Payment utilities |
| **QuizAccessHelper** | `helpers/quiz-access-helper.ts` | Access token utilities |
| **QuizAccessSaleHelper** | `helpers/quiz-access-sale-helper.ts` | Sale operations |
| **LeaderboardHelper** | `helpers/leaderboard-helper.ts` | Leaderboard calculations |

### Example: TeacherHelper

```typescript
import { TeacherHelper } from './helpers/teacher-helper'

// Create quiz using helper
const quiz = await TeacherHelper.createQuiz(
  computer,
  teacherModSpec,
  quizData
)

// Withdraw fees
const withdrawal = await TeacherHelper.withdrawFees(
  computer,
  teacherModSpec,
  quizId
)
```

### Example: LeaderboardHelper

```typescript
import { LeaderboardHelper } from './helpers/leaderboard-helper'

// Calculate rewards for quiz
const rewards = await LeaderboardHelper.calculateRewards(
  computer,
  quizId
)

// Get quiz results
const results: QuizResult[] = await LeaderboardHelper.getQuizResults(
  computer,
  quizId
)
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
# Copy environment template from root
cp ../../.env.bcn.template .env
```

### 3. Build Contracts

```bash
npm run build
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test
npm run test:teacher
npm run test:student
npm run test:quiz
npm run test:attempt
npm run test:payment

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:cov
```

### 5. Deploy Contracts

```bash
# Deploy all contracts
npm run deploy

# Fund wallet first (if needed)
npm run fund:wallet
```

---

## Testing

### Test Structure

```
test/
├── teacher.test.ts           # Teacher contract tests
├── student.test.ts           # Student contract tests
├── quiz.test.ts              # Quiz contract tests
├── quiz-attempt.test.ts      # Attempt contract tests
├── payment.test.ts           # Payment contract tests
├── payment-transfer.test.ts  # Transfer tests
├── payment-withdrawal.test.ts# Withdrawal tests
├── quiz-access.test.ts       # Access token tests
├── quiz-access-sale.test.ts  # Access sale tests
├── quiz-attempt-swap.test.ts # Swap mechanism tests
├── integration.test.ts       # Integration tests
├── comprehensive-flow.test.ts # End-to-end flow tests
└── leaderboard-system.test.ts # Leaderboard tests
```

### Example Test

```typescript
import { expect } from 'chai'
import { Teacher } from '../src/teacher'

describe('Teacher Contract', () => {
  let teacher: Teacher

  beforeEach(async () => {
    teacher = new Teacher(computer, teacherModSpec)
  })

  it('should create a quiz', async () => {
    const quizData = {
      title: 'Test Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 10000n,
      entryFee: 1000n,
    }

    const quiz = await teacher.create(quizData)
    expect(quiz).to.exist
    expect(quiz.title).to.equal('Test Quiz')
  })

  it('should withdraw accumulated fees', async () => {
    const withdrawal = await teacher.withdraw(quizId)
    expect(withdrawal.txId).to.exist
    expect(withdrawal.amount).to.be.greaterThan(0n)
  })
})
```

---

## Deployment

### Module Specifications

After deployment, you'll receive module specs to add to your environment:

```env
# .env.api and .env.web
NEXT_PUBLIC_TEACHER_MOD_SPEC=<module-spec>
NEXT_PUBLIC_STUDENT_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=<module-spec>
NEXT_PUBLIC_PAYMENT_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=<module-spec>
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=<module-spec>
```

### Deploy Script

```bash
# Full deployment
npm run deploy

# This will:
# 1. Build contracts
# 2. Deploy all contracts to blockchain
# 3. Output module specifications
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript contracts |
| `npm test` | Run all tests |
| `npm run test:teacher` | Run teacher contract tests |
| `npm run test:student` | Run student contract tests |
| `npm run test:quiz` | Run quiz contract tests |
| `npm run test:attempt` | Run attempt contract tests |
| `npm run test:payment` | Run payment contract tests |
| `npm run test:integration` | Run integration tests |
| `npm run deploy` | Deploy all contracts |
| `npm run fund:wallet` | Fund wallet for testing |
| `npm run lint` | Run ESLint |

---

## Directory Structure

```
packages/quiz-contracts/
├── src/
│   ├── teacher.ts              # Teacher contract
│   ├── student.ts              # Student contract
│   ├── quiz.ts                 # Quiz contract
│   ├── attempt.ts              # Attempt contract
│   ├── payment.ts              # Payment contract
│   ├── quiz-access.ts          # Access token contract
│   ├── quiz-access-sale.ts     # Access sale contract
│   ├── helpers/                # Helper utilities
│   │   ├── teacher-helper.ts
│   │   ├── student-helper.ts
│   │   ├── quiz-helper.ts
│   │   ├── attempt-helper.ts
│   │   ├── payment-helper.ts
│   │   ├── quiz-access-helper.ts
│   │   ├── quiz-access-sale-helper.ts
│   │   └── leaderboard-helper.ts
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utilities
│
├── test/                       # Test files
├── scripts/                    # Deployment scripts
│   └── deploy.mjs
│
├── dist/                       # Compiled output
├── package.json
└── README.md
```

---

## Blockchain Concepts

### Module Specifications

A module spec is the deployed contract identifier on-chain:
- Contains module ID, chain, network, and code hash
- Used to instantiate contract instances

### Atomic Swaps

Trustless peer-to-peer exchanges:
- Used for purchasing quiz access tokens
- No intermediary required
- Both parties must sign

### UTXO Model

Bitcoin's Unspent Transaction Output:
- Each transaction consumes previous outputs
- Creates new outputs for recipients
- Enables parallel transaction processing

### Regtest Network

Local regression testing:
- Instant block generation
- No real cryptocurrency required
- Safe for development

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Write tests for new functionality
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the root README.md for more information

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
