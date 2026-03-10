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
| **Bitcoin Computer** | Blockchain abstraction layer for LTC/BTC |
| **TypeScript** | Type-safe contract development |
| **Mocha + Chai** | Testing framework |
| **Node.js** | Runtime environment |

---

## Contracts

### Teacher Contract

Manages teacher accounts, permissions, and quiz creation.

**Methods:**
- `createQuiz(quizData)` - Create a new quiz
- `updateQuiz(quizId, updates)` - Update existing quiz
- `deleteQuiz(quizId)` - Delete a quiz
- `withdrawFees(quizId)` - Withdraw accumulated entry fees
- `getTeacherQuizzes(teacherId)` - Get all quizzes by teacher

```typescript
import { Teacher } from './src/teacher'

const teacher = new Teacher(moduleSpec)

// Create a new quiz
const quiz = await teacher.createQuiz({
  title: 'Bitcoin Basics',
  questionText: 'What does BTC stand for?',
  options: ['Bitcoin', 'Block Token', 'Binary Coin', 'Digital Cash'],
  correctAnswer: 0,
  rewardAmount: 10000n, // 10,000 satoshis
  entryFee: 1000n,     // 1,000 satoshis
  teacher: teacherPublicKey,
})
```

---

### Student Contract

Manages student accounts, enrollment, and quiz interactions.

**Methods:**
- `registerStudent(studentData)` - Register new student
- `purchaseAccess(quizId, price)` - Purchase quiz access token
- `submitAttempt(quizId, answers)` - Submit quiz attempt
- `getStudentAttempts(studentId)` - Get all attempts by student
- `getStudentStats(studentId)` - Get student statistics

```typescript
import { Student } from './src/student'

const student = new Student(moduleSpec)

// Purchase access token via atomic swap
const access = await student.purchaseAccess({
  quizId: quizModuleId,
  buyer: studentPublicKey,
  price: 1000n,
})

// Submit quiz attempt
const attempt = await student.submitAttempt({
  quizId: quizModuleId,
  answers: [0, 1, 2, 1, 0],
  student: studentPublicKey,
})
```

---

### Quiz Contract

Defines quiz structure, questions, and state management.

**Methods:**
- `create(quizData)` - Create quiz
- `update(updates)` - Update quiz details
- `setStatus(status)` - Set quiz status (DRAFT, ACTIVE, CLOSED)
- `getDetails()` - Get quiz details
- `getQuestions()` - Get quiz questions
- `getCorrectAnswers()` - Get correct answers (teacher only)

```typescript
import { Quiz } from './src/quiz'

const quiz = new Quiz(moduleSpec)

// Get quiz details
const details = await quiz.getDetails()
console.log('Quiz:', details.title)
console.log('Reward:', details.rewardAmount, 'satoshis')
console.log('Entry Fee:', details.entryFee, 'satoshis')

// Update quiz status
await quiz.setStatus('ACTIVE')
```

---

### Quiz Attempt Contract

Handles quiz attempt tracking and validation.

**Methods:**
- `create(attemptData)` - Create new attempt
- `validate(answers)` - Validate answers
- `getScore()` - Calculate score
- `isCorrect()` - Check if passed
- `distributeReward()` - Distribute reward if correct

```typescript
import { Attempt } from './src/attempt'

const attempt = new Attempt(moduleSpec)

// Create and validate attempt
const result = await attempt.create({
  quizId: quizModuleId,
  student: studentPublicKey,
  answers: [0, 1, 2, 1, 0],
})

// Get score
const score = await attempt.getScore()
console.log('Score:', score, '%')

// Check if passed
const passed = await attempt.isCorrect()
if (passed) {
  await attempt.distributeReward()
}
```

---

### Payment Contract

Manages payment processing, withdrawals, and fee distribution.

**Methods:**
- `processPayment(paymentData)` - Process payment
- `withdraw(amount, recipient)` - Withdraw funds
- `getBalance(address)` - Get balance
- `getTransactionHistory(address)` - Get transaction history
- `distributeFees(recipients)` - Distribute fees

```typescript
import { Payment } from './src/payment'

const payment = new Payment(moduleSpec)

// Process payment for quiz access
const tx = await payment.processPayment({
  from: studentPublicKey,
  to: teacherPublicKey,
  amount: 1000n,
  quizId: quizModuleId,
})

// Withdraw accumulated fees
const withdrawal = await payment.withdraw({
  amount: 50000n,
  recipient: teacherPublicKey,
  quizId: quizModuleId,
})
```

---

### Quiz Access Token Contract

NFT-like tokens that grant quiz access.

**Methods:**
- `mint(quizId, owner)` - Mint access token
- `transfer(tokenId, to)` - Transfer token
- `burn(tokenId)` - Burn token
- `getTokenOwner(tokenId)` - Get token owner
- `getTokensByOwner(owner)` - Get all tokens by owner

```typescript
import { QuizAccess } from './src/quiz-access'

const access = new QuizAccess(moduleSpec)

// Mint access token after payment
const token = await access.mint({
  quizId: quizModuleId,
  owner: studentPublicKey,
})

// Check ownership
const owner = await access.getTokenOwner(token.moduleId)
console.log('Token owner:', owner)
```

---

### Quiz Access Sale Contract

Handles atomic swap sales of access tokens.

**Methods:**
- `createSale(tokenId, price)` - Create sale listing
- `cancelSale(saleId)` - Cancel sale
- `purchase(saleId)` - Purchase token
- `getSale(saleId)` - Get sale details
- `getSalesByQuiz(quizId)` - Get all sales for quiz

```typescript
import { QuizAccessSale } from './src/quiz-access-sale'

const sale = new QuizAccessSale(moduleSpec)

// Create sale listing
const saleListing = await sale.createSale({
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

### QuizHelper

Utility functions for quiz management.

```typescript
import { QuizHelper } from './src/helpers/quiz-helper'

// Validate quiz data
const isValid = QuizHelper.validateQuizData(quizData)

// Calculate reward distribution
const distribution = QuizHelper.calculateRewardDistribution(
  totalFees,
  rewardAmount,
  teacherShare
)

// Generate quiz module spec
const spec = QuizHelper.generateModuleSpec(quizData)
```

### PaymentHelper

Payment processing utilities.

```typescript
import { PaymentHelper } from './src/helpers/payment-helper'

// Format satoshis to readable format
const formatted = PaymentHelper.formatSats(10000n) // "10,000 sats"

// Calculate entry fee with platform cut
const fees = PaymentHelper.calculateFees(entryFee, platformPercentage)

// Validate payment transaction
const isValid = PaymentHelper.validatePayment(tx, expectedAmount)
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
# Copy environment template
cp ../../.env.bcn.template .env

# Edit with your configuration
# - Blockchain connection details
# - Wallet keys for deployment
```

### 3. Compile Contracts

```bash
npm run build
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/teacher.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### 5. Deploy Contracts

```bash
# Deploy all contracts
npm run deploy

# Deploy specific contract
npm run deploy:teacher
npm run deploy:student
npm run deploy:quiz

# Deploy to regtest (local)
npm run deploy:regtest

# Deploy to testnet
npm run deploy:testnet
```

---

## Testing

### Test Structure

```
test/
├── teacher.test.ts       # Teacher contract tests
├── student.test.ts       # Student contract tests
├── quiz.test.ts          # Quiz contract tests
├── attempt.test.ts       # Attempt contract tests
├── payment.test.ts       # Payment contract tests
├── access.test.ts        # Access token tests
├── access-sale.test.ts   # Access sale tests
└── integration.test.ts   # Integration tests
```

### Example Test

```typescript
import { expect } from 'chai'
import { Teacher } from '../src/teacher'

describe('Teacher Contract', () => {
  let teacher: Teacher

  beforeEach(async () => {
    teacher = new Teacher(teacherModuleSpec)
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

    const quiz = await teacher.createQuiz(quizData)
    expect(quiz).to.exist
    expect(quiz.title).to.equal('Test Quiz')
  })

  it('should withdraw accumulated fees', async () => {
    const withdrawal = await teacher.withdrawFees(quizId)
    expect(withdrawal.txId).to.exist
    expect(withdrawal.amount).to.be.greaterThan(0n)
  })
})
```

---

## Deployment

### Module Specifications

After deployment, you'll receive module specifications to add to your environment:

```env
NEXT_PUBLIC_TEACHER_MOD=<deployed-module-id>
NEXT_PUBLIC_STUDENT_MOD=<deployed-module-id>
NEXT_PUBLIC_QUIZ_MOD=<deployed-module-id>
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=<deployed-module-id>
NEXT_PUBLIC_PAYMENT_MOD=<deployed-module-id>
NEXT_PUBLIC_QUIZ_ACCESS_MOD=<deployed-module-id>
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=<deployed-module-id>
```

### Deployment Script

```bash
# Full deployment with funding
npm run deploy:full

# This will:
# 1. Deploy all contracts
# 2. Fund wallets with test coins
# 3. Output module specifications
# 4. Update environment file (optional)
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript contracts |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run deploy` | Deploy all contracts |
| `npm run deploy:teacher` | Deploy teacher contract |
| `npm run deploy:student` | Deploy student contract |
| `npm run deploy:quiz` | Deploy quiz contract |
| `npm run deploy:attempt` | Deploy attempt contract |
| `npm run deploy:payment` | Deploy payment contract |
| `npm run deploy:access` | Deploy access token contract |
| `npm run deploy:access-sale` | Deploy access sale contract |
| `npm run fund:wallet` | Fund wallet for testing |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

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
│   └── helpers/
│       ├── quiz-helper.ts      # Quiz utilities
│       ├── payment-helper.ts   # Payment utilities
│       └── index.ts            # Helper exports
│
├── test/
│   ├── teacher.test.ts
│   ├── student.test.ts
│   ├── quiz.test.ts
│   ├── attempt.test.ts
│   ├── payment.test.ts
│   ├── access.test.ts
│   ├── access-sale.test.ts
│   └── integration.test.ts
│
├── scripts/
│   ├── deploy.ts               # Deployment script
│   ├── fund-wallets.ts         # Wallet funding script
│   └── utils.ts                # Deployment utilities
│
├── dist/                       # Compiled output (generated)
├── package.json
└── README.md
```

---

## Blockchain Concepts

### Module Specifications

A module spec is the deployed contract identifier on-chain. It contains:
- Module ID (unique address)
- Chain (LTC/BTC)
- Network (regtest/testnet/mainnet)
- Contract code hash

### Atomic Swaps

Trustless peer-to-peer exchanges without intermediaries. Used for:
- Purchasing quiz access tokens
- Trading access tokens between students
- Withdrawing rewards

### UTXO Model

Bitcoin's Unspent Transaction Output model:
- Each transaction consumes previous outputs
- Creates new outputs for recipients
- Enables parallel transaction processing

### Regtest Network

Local regression testing network:
- Instant block generation
- No real cryptocurrency required
- Safe for development & testing

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

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
