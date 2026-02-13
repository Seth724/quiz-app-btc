# .gitignore

```
# Dependencies
node_modules/

# Environment files
.env
.env.local

# Compiled output
dist/
build/

# TypeScript
*.tsbuildinfo

# Test results
test-results.json

# Logs
*.log

# Cache
.turbo/
```

# .mocharc.all.json

```json
{
  "node-option": ["experimental-specifier-resolution=node"],
  "require": ["dotenv/config"],
  "spec": "dist/test/*.test.js",
  "timeout": 30000000,
  "reporter": "spec"
}
```

# .mocharc.single.json

```json
{
  "node-option": ["experimental-specifier-resolution=node"],
  "require": ["dotenv/config"],
  "timeout": 30000000,
  "reporter": "spec"
}

```

# eslint.config.js

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    },
  },
)
```

# FIXES_DOCUMENTATION.md

```md
# Quiz Contracts - Fixed Implementation

## Summary of Fixes

This document outlines the fixes applied to resolve conflicts and improve the quiz application workflow.

## Issues Fixed

### 1. **Duplicate PaymentHelper Class**
- **Problem**: `payment.ts` and `payment-helper.ts` both defined a `PaymentHelper` class, causing import conflicts
- **Solution**: Removed the duplicate from `payment.ts`, keeping only the dedicated helper in `payment-helper.ts`
- **Files Modified**: `src/payment.ts`

### 2. **Mining Block Method Signature**
- **Problem**: `MineRPCBlocks.mineBlockFromRPCClient()` was called without the required `computer` parameter
- **Solution**: 
  - Updated method to properly accept `computer` parameter
  - Added `mineBlocksWithConfirmations()` method for mining multiple blocks in succession
  - All calls now properly pass the computer instance
- **Files Modified**: 
  - `src/utils/mineblock.ts`
  - All helper files (`payment-helper.ts`, `quiz-helper.ts`, `student-helper.ts`, `teacher-helper.ts`)
  - Test files

### 3. **Mining Strategy for Confirmations**
- **Problem**: Single block mining wasn't providing enough confirmations for complex transactions
- **Solution**: 
  - Implemented `mineBlocksWithConfirmations()` to mine 2-3 blocks in succession
  - Used after critical operations:
    - Payment creation (2 blocks)
    - Payment transfer (3 blocks)
    - Quiz creation (3 blocks)
    - Student/teacher entity creation (2 blocks)
- **Benefit**: Proper confirmation ensures UTXOs are available for subsequent transactions

### 4. **Helper Method Consistency**
- **Problem**: Inconsistent mining calls across helper files
- **Solution**: Standardized all helper methods to:
  - Always await mining operations
  - Mine after state-changing operations
  - Use appropriate confirmation counts based on operation criticality

## Architecture Overview

### Payment Flow
\`\`\`
Teacher Creates Quiz
    ↓
For Each Question:
    1. Create Payment (5000 sats)
    2. Payment owned by Teacher
    3. Mine 2 blocks
    ↓
Quiz Created with Payment IDs
    ↓
Mine 3 blocks
\`\`\`

### Student Attempt Flow
\`\`\`
Student Attempts Quiz
    ↓
For Each Correct Answer:
    1. Check if reward claimed
    2. If not claimed:
        a. Claim reward in quiz state
        b. Transfer payment to student
        c. Mine 3 blocks
    3. If already claimed:
        - Skip transfer (student gets nothing)
    ↓
Update student's completed quizzes
    ↓
Mine 2 blocks
\`\`\`

## Key Concepts

### First-Come-First-Served Rewards
- Each question has ONE payment object
- First student to answer correctly gets the payment
- Subsequent students who answer correctly get:
  - ✓ Credit for correct answer (score)
  - ✗ No payment (already claimed)

### Payment Ownership Transfer
\`\`\`typescript
// Initial state (after quiz creation)
Payment {
  _id: "abc123:0",
  _satoshis: 5000n,
  _owners: [teacherPublicKey]
}

// After student answers correctly
Payment {
  _id: "abc123:0",
  _satoshis: 5000n,
  _owners: [studentPublicKey]  // Ownership transferred!
}
\`\`\`

### Quiz State Tracking
\`\`\`typescript
Quiz {
  questionRewardsClaimed: [false, false, false]  // Initially unclaimed
  attemptedStudents: []                          // No attempts yet
  paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]     // Payment references
}

// After student 1 answers all correctly
Quiz {
  questionRewardsClaimed: [true, true, true]     // All claimed
  attemptedStudents: [student1PubKey]
  paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]
}

// After student 2 attempts
Quiz {
  questionRewardsClaimed: [true, true, true]     // Still all claimed
  attemptedStudents: [student1PubKey, student2PubKey]
  paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]
}
\`\`\`

## Test Files

### `simple-workflow.test.ts`
- Basic workflow tests
- 2 students, 2 questions
- Tests first-come-first-served mechanism

### `complete-quiz-flow.test.ts` (NEW)
- Comprehensive end-to-end test
- 3 students, 3 questions
- Tests:
  - Quiz creation with payments
  - First student gets all rewards
  - Second student gets no rewards (all claimed)
  - Third student gets no rewards (partial correct + all claimed)
  - Payment ownership verification
  - Quiz deactivation

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "complete quiz workflow"

# Run with verbose output
npm test -- --reporter spec
\`\`\`

## Helper Classes

### PaymentHelper
- `createPayment()` - Create and mine
- `transferPayment()` - Transfer and mine
- `getPayment()` - Retrieve payment object
- `mineBlock()` - Mine single block
- `mineBlocksMultiple()` - Mine multiple blocks

### QuizHelper
- `createQuizWithPayments()` - Create quiz with individual payments
- `processQuizRewards()` - Handle reward claiming and transfers
- `getQuiz()` - Retrieve quiz object
- `addStudentToAttempted()` - Mark student as attempted
- `deactivateQuiz()` - Deactivate quiz

### StudentHelper
- `createStudent()` - Create student entity
- `attemptQuiz()` - Complete quiz attempt flow
- `canAttemptQuiz()` - Check eligibility

### TeacherHelper
- `createTeacher()` - Create teacher entity
- `createQuiz()` - Create quiz with payments
- `deactivateQuiz()` - Deactivate quiz

## Important Notes

### Mining Best Practices
1. **Always await**: `await MineRPCBlocks.mineBlocksWithConfirmations(computer, 2)`
2. **Use multiple blocks**: For critical operations (payments, transfers)
3. **Order matters**: Mine after each state change, not at the end

### UTXO Management
- Each state change creates a new UTXO
- Old UTXO is spent
- Mining confirms the transaction
- Without mining, subsequent operations may fail

### Error Handling
- All helper methods throw on failure
- Test timeouts set to 180000ms (3 minutes) for complex operations
- Network issues handled with retries in mining

## Debugging Tips

### If payments aren't transferring:
1. Check mining is called after transfer
2. Verify payment ownership before transfer
3. Ensure quiz state shows reward not claimed

### If tests timeout:
1. Increase timeout in test
2. Check network connectivity
3. Verify regtest node is running

### If balance doesn't update:
1. Mine more blocks for confirmation
2. Wait for block propagation (2000ms delay)
3. Check transaction was broadcast

## Next Steps

1. Run the complete test suite
2. Monitor payment ownership changes
3. Verify balance changes match expected rewards
4. Test edge cases (concurrent attempts, network failures)

```

# package.json

```json
{
  "name": "@quiz-app/contracts",
  "version": "0.26.0-beta.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "compile:test": "npm run build && tsc -p tsconfig.test.json",
    "deploy": "tsx ./scripts/deploy.ts",
    "lint": "npx eslint .",
    "setup": "npm install && npm run compile:test",
    "test": "npm run compile:test && npm run test:run",
    "test:unit": "npm run compile:test && npm run test:run",
    "test:compile": "npm run compile:test",
    "test:run": "mocha --config .mocharc.all.json",
    "test:watch": "npm run compile:test && mocha --config .mocharc.all.json --watch",
    "test:teacher": "npm run compile:test && mocha --config .mocharc.single.json dist/test/teacher.test.js",
    "test:student": "npm run compile:test && mocha --config .mocharc.single.json dist/test/student.test.js",
    "test:quiz": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz.test.js",
    "test:quiz-attempt": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-attempt.test.js",
    "test:integration": "npm run compile:test && mocha --config .mocharc.single.json dist/test/integration.test.js",
    "test:payment": "npm run compile:test && mocha --config .mocharc.single.json dist/test/payment.test.js",
    "test:payment-withdrawal": "npm run compile:test && mocha --config .mocharc.single.json dist/test/payment-withdrawal.test.js",
    "fund:wallet": "tsx ./scripts/fund-wallet.ts",
    "test:comprehensive-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/comprehensive-flow.test.js",
    "test:comprehensive-flow-new": "npm run compile:test && mocha --config .mocharc.single.json dist/test/comprehensive-flow-new.test.js",
    "test:main-flow-direct": "npm run compile:test && mocha --config .mocharc.single.json dist/test/main-flow-direct.test.js",
    "test:complete-workflow-new": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-workflow-new.test.js",
    "test:complete-workflow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-workflow.test.js",
    "test:teacher-helper-new": "npm run compile:test && mocha --config .mocharc.single.json dist/test/teacher-helper-new.test.js",
    "test:teacher-helper": "npm run compile:test && mocha --config .mocharc.single.json dist/test/teacher-helper.test.js",
    "test:simple-helper-demo": "npm run compile:test && mocha --config .mocharc.single.json dist/test/simple-helper-demo.test.js",
    "test:payment-transfer": "npm run compile:test && mocha --config .mocharc.single.json dist/test/payment-transfer.test.js",
    "test:single-question-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/single-question-flow.test.js",
    "test:complete-quiz-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-quiz-flow.test.js",
    "test:comprehensive-single-quiz": "npm run compile:test && mocha --config .mocharc.single.json dist/test/comprehensive-single-quiz.test.js",
    "test:working-quiz-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/working-quiz-flow.test.js",
    "test:simple-teacher-test": "npm run compile:test && mocha --config .mocharc.single.json dist/test/simple-teacher-test.test.js",
    "test:teacher-single-contract": "npm run compile:test && mocha --config .mocharc.single.json dist/test/teacher-single-contract.test.js",
    "test:teacher-contract-complete": "npm run compile:test && mocha --config .mocharc.single.json dist/test/teacher-contract-complete.test.js",
    "test:student-contract-complete": "npm run compile:test && mocha --config .mocharc.single.json dist/test/student-contract-complete.test.js",
    "test:quiz-contract-complete": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-contract-complete.test.js",
    "test:quiz-contract-essential": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-contract-essential.test.js",
    "test:attempt-contract-complete": "npm run compile:test && mocha --config .mocharc.single.json dist/test/attempt-contract-complete.test.js",
    "test:attempt-contract-essential": "npm run compile:test && mocha --config .mocharc.single.json dist/test/attempt-contract-essential.test.js",
    "test:attempt-contract-minimal": "npm run compile:test && mocha --config .mocharc.single.json dist/test/attempt-contract-minimal.test.js",
    "test:payment-contract": "npm run compile:test && mocha --config .mocharc.single.json dist/test/payment-contract-test.js",
    "test:complete-quiz-workflow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-quiz-workflow.test.js",
    "test:direct-transfer-quiz": "npm run compile:test && mocha --config .mocharc.single.json dist/test/direct-transfer-quiz.test.js",
    "test:quiz-platform-leaderboard": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-platform-leaderboard.test.js",
    "test:leaderboard-system": "npm run compile:test && mocha --config .mocharc.single.json dist/test/leaderboard-system.test.js",
    "test:leaderboard-essential": "npm run compile:test && mocha --config .mocharc.single.json dist/test/leaderboard-essential.test.js",
    "test:payment-transfer-withdraw": "npm run compile:test && mocha --config .mocharc.single.json dist/test/payment-transfer-withdraw.test.js",
    "test:simple-quiz-leaderboard": "npm run compile:test && mocha --config .mocharc.single.json dist/test/simple-quiz-leaderboard.test.js",
    "test:simple-multi-quiz": "npm run compile:test && mocha --config .mocharc.single.json dist/test/simple-multi-quiz.test.js",
    "test:comprehensive-quiz-leaderboard": "npm run compile:test && mocha --config .mocharc.single.json dist/test/comprehensive-quiz-leaderboard.test.js",
    "test:quiz-access": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-access.test.js",
    "test:quiz-attempt-swap": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-attempt-swap.test.js",
    "test:enhanced-quiz-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/enhanced-quiz-flow.test.js",
    "test:simple-swap-mechanism": "npm run compile:test && mocha --config .mocharc.single.json dist/test/simple-swap-mechanism.test.js",
    "test:quiz-access-swap-working": "npm run compile:test && mocha --config .mocharc.single.json dist/test/quiz-access-swap-working.test.js",
    "test:complete-quiz-workflow-working": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-quiz-workflow-working.test.js",
    "test:complete-quiz-enhanced-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-quiz-enhanced-flow.test.js",
    "test:comprehensive-enhanced-quiz-flow": "npm run compile:test && mocha --config .mocharc.single.json dist/test/comprehensive-enhanced-quiz-flow.test.js",
    "test:complete-quiz-access-swap": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-quiz-access-swap.test.js",
    "test:entry-fee-withdrawal": "npm run compile:test && mocha --config .mocharc.single.json dist/test/entry-fee-withdrawal.test.js",
    "test:complete-quiz-access-sale": "npm run compile:test && mocha --config .mocharc.single.json dist/test/complete-quiz-access-sale.test.js"
  },
  "dependencies": {
    "@bitcoin-computer/lib": "^0.26.0-beta.0",
    "dotenv": "^16.6.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "2.1.4",
    "@types/chai": "^5.2.3",
    "@types/chai-match-pattern": "^1.3.5",
    "@types/mocha": "^10.0.10",
    "@types/node": "^20",
    "@typescript-eslint/eslint-plugin": "^8.46.2",
    "@typescript-eslint/parser": "^8.46.2",
    "chai": "^5.1.2",
    "chai-match-pattern": "^1.3.0",
    "eslint": "9.29.0",
    "eslint-plugin-import": "^2.32.0",
    "mocha": "^11.7.5",
    "source-map-support": "^0.5.21",
    "ts-node": "^10.9.2",
    "tsx": "^4.20.3",
    "typescript": "^5.8.3"
  }
}

```

# README.md

```md
# Quiz App Contracts

This package contains the smart contracts and business logic for the Quiz App built on Bitcoin Computer.

## Contracts

- `Teacher` - Manages teacher accounts and permissions
- `Student` - Manages student accounts and enrollment
- `Quiz` - Defines quiz structure and questions
- `QuizAttempt` - Handles quiz attempts and submissions
- `Payment` - Manages payment processing for quizzes

## Helpers

- `QuizHelper` - Utility functions for quiz management
- `PaymentHelper` - Payment processing utilities

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Compile contracts:
   \`\`\`bash
   npm run build
   \`\`\`

4. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

## Scripts

- `npm run build` - Compile TypeScript contracts
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run deploy` - Deploy contracts
- `npm run fund:wallet` - Fund wallet for testing
- `npm run lint` - Run ESLint

## Testing

The package includes comprehensive tests for all contracts:
- Unit tests for individual contracts
- Integration tests for contract interactions
- Payment workflow tests

## Directory Structure

- `src/` - Contract source files
- `test/` - Test files
- `scripts/` - Deployment and utility scripts
- `dist/` - Compiled output (generated)
```

# src\attempt.ts

```ts
import { Contract } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'

/**
 * Simplified QuizAttempt for single-question quiz architecture
 * Tracks a student's single attempt at a single-question quiz
 *
 * Access enforcement:
 * - requires a QuizAccess token owned by the student
 * - requires token.quizId === this.quizId
 * - requires token.amount > 0n
 * - burns 1 unit on submit (so it cannot be reused)
 */
export class QuizAttempt extends Contract {
  quizId!: string
  studentPublicKey!: string
  selectedAnswer!: number
  isCorrect!: boolean
  rewardEarned!: bigint
  attemptedAt!: number
  isCompleted!: boolean

  constructor(quizId: string, studentPublicKey: string) {
    super({
      quizId,
      studentPublicKey,
      selectedAnswer: -1,
      isCorrect: false,
      rewardEarned: 0n,
      attemptedAt: Date.now(),
      isCompleted: false,
    })
  }

  submitAnswer(access: QuizAccess, selectedAnswer: number, correctAnswer: number, rewardAmount: bigint) {
    if (this.isCompleted) throw new Error('Quiz already completed')

    // --- Access token checks ---
    if (access.quizId !== this.quizId) throw new Error('Invalid access token for this quiz')
    if (!access._owners || access._owners[0] !== this.studentPublicKey)
      throw new Error('Access token is not owned by this student')
    if (access.amount <= 0n) throw new Error('Access token already used')

    // Validate answer index
    if (selectedAnswer < 0 || selectedAnswer > 3) throw new Error('Selected answer must be between 0-3')

    // Consume exactly ONE access unit
    access.burn(1n)

    this.selectedAnswer = selectedAnswer
    this.isCorrect = selectedAnswer === correctAnswer
    this.rewardEarned = this.isCorrect ? rewardAmount : 0n
    this.isCompleted = true
  }

  getResult() {
    return {
      quizId: this.quizId,
      studentPublicKey: this.studentPublicKey,
      selectedAnswer: this.selectedAnswer,
      isCorrect: this.isCorrect,
      rewardEarned: this.rewardEarned,
      attemptedAt: this.attemptedAt,
    }
  }
}
```

# src\helpers\attempt-helper.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { QuizAttempt } from '../attempt.js'
import { Quiz } from '../quiz.js'
import { QuizAccess } from '../quiz-access.js'

export class AttemptHelper {
  computer: Computer
  constructor(computer: Computer) {
    this.computer = computer
  }

  async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
    return await this.computer.new(QuizAttempt, [quizId, studentPublicKey]) as QuizAttempt
  }

  async getAttempt(attemptId: string): Promise<QuizAttempt> {
    return (await this.computer.sync(attemptId)) as QuizAttempt
  }

  /**
   * New: Submit answer with access token enforcement.
   */
  async submitAnswerWithAccess(
    attempt: QuizAttempt,
    access: QuizAccess,
    selectedAnswer: number,
    quiz: Quiz,
  ): Promise<{ isCorrect: boolean; rewardEarned: bigint; selectedAnswer: number }> {
    await attempt.submitAnswer(access, selectedAnswer, await quiz.correctAnswer, await quiz.rewardAmount)

    return {
      isCorrect: await attempt.isCorrect,
      rewardEarned: await attempt.rewardEarned,
      selectedAnswer: await attempt.selectedAnswer,
    }
  }
}
```

# src\helpers\leaderboard-helper.ts

```ts
//import { Payment } from '../payment.js'
import { PaymentHelper } from './payment-helper.js'

export interface StudentReward {
  publicKey: string
  name?: string
  totalRewards: bigint
  claimedPayments: string[] // Payment transaction IDs
  rank: number
}

export interface QuizResult {
  quizId: string
  quizTitle: string
  studentPublicKey: string
  isCorrect: boolean
  rewardEarned: bigint
  paymentTxId?: string
  timestamp: number
}

export class LeaderboardHelper {
  computer: any
  paymentHelper: PaymentHelper

  // In-memory storage for tracking student rewards
  // In production, this would be stored in a database
  private studentRewards: Map<string, StudentReward> = new Map()
  private quizResults: QuizResult[] = []

  constructor(computer: any) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  // Record a quiz result for leaderboard tracking
  async recordQuizResult(result: QuizResult): Promise<void> {
    this.quizResults.push(result)

    // Update student reward if they earned something
    if (result.isCorrect && result.rewardEarned > 0n && result.paymentTxId) {
      await this.addStudentReward(result.studentPublicKey, result.rewardEarned, result.paymentTxId)
    } else if (result.isCorrect && result.rewardEarned > 0n) {
      // Even if no paymentTxId (meaning they couldn't claim), still track the potential reward
      await this.addStudentReward(result.studentPublicKey, result.rewardEarned, "")
    } else if (result.isCorrect) {
      // Track students who answered correctly but earned 0 (maybe they were too slow to claim)
      // Initialize them with 0 reward but still track their participation
      await this.ensureStudentExists(result.studentPublicKey)
    }
  }

  // Ensure a student exists in the rewards map (for tracking participants)
  async ensureStudentExists(studentPublicKey: string): Promise<void> {
    if (!this.studentRewards.has(studentPublicKey)) {
      const studentReward = {
        publicKey: studentPublicKey,
        totalRewards: 0n,
        claimedPayments: [],
        rank: 0
      }
      this.studentRewards.set(studentPublicKey, studentReward)
    }
  }

  // Add a reward to a student's total
  async addStudentReward(studentPublicKey: string, rewardAmount: bigint, paymentTxId: string): Promise<void> {
    let studentReward = this.studentRewards.get(studentPublicKey)

    if (!studentReward) {
      studentReward = {
        publicKey: studentPublicKey,
        totalRewards: 0n,
        claimedPayments: [],
        rank: 0
      }
    }

    studentReward.totalRewards += rewardAmount
    if (paymentTxId) {  // Only add to claimedPayments if paymentTxId is not empty
      studentReward.claimedPayments.push(paymentTxId)
    }

    this.studentRewards.set(studentPublicKey, studentReward)
  }

  // Get a student's current reward total
  getStudentRewards(studentPublicKey: string): StudentReward | null {
    return this.studentRewards.get(studentPublicKey) || null
  }

  // Get all quiz results for a student
  getStudentQuizHistory(studentPublicKey: string): QuizResult[] {
    return this.quizResults.filter(result => result.studentPublicKey === studentPublicKey)
  }

  // Calculate and return the current leaderboard
  getLeaderboard(): StudentReward[] {
    const leaderboard = Array.from(this.studentRewards.values())

    // Sort by total rewards (descending)
    leaderboard.sort((a, b) => Number(b.totalRewards - a.totalRewards))

    // Assign ranks
    leaderboard.forEach((student, index) => {
      student.rank = index + 1
    })

    return leaderboard
  }

  // Get top N students
  getTopStudents(n: number): StudentReward[] {
    const leaderboard = this.getLeaderboard()
    return leaderboard.slice(0, n)
  }

  // Verify payment ownership (checks if student actually owns the payment)
  async verifyPaymentOwnership(studentPublicKey: string, paymentTxId: string): Promise<boolean> {
    try {
      return await this.paymentHelper.isPaymentOwnedBy(paymentTxId, studentPublicKey)
    } catch (error) {
      console.error(`Error verifying payment ownership:`, error)
      return false
    }
  }

  // Audit all recorded payments to ensure they're still valid
  async auditStudentRewards(studentPublicKey: string): Promise<{ verified: bigint, invalid: bigint }> {
    const studentReward = this.getStudentRewards(studentPublicKey)
    if (!studentReward) {
      return { verified: 0n, invalid: 0n }
    }

    let verifiedAmount = 0n
    let invalidAmount = 0n

    for (const paymentTxId of studentReward.claimedPayments) {
      try {
        const isOwned = await this.verifyPaymentOwnership(studentPublicKey, paymentTxId)
        const paymentAmount = await this.paymentHelper.getPaymentAmount(paymentTxId)

        if (isOwned) {
          verifiedAmount += paymentAmount
        } else {
          invalidAmount += paymentAmount
        }
      } catch (error) {
        // Payment might not exist anymore
        console.warn(`Could not verify payment ${paymentTxId}:`, error)
      }
    }

    return { verified: verifiedAmount, invalid: invalidAmount }
  }

  // Display formatted leaderboard
  displayLeaderboard(limit: number = 10): void {
    const leaderboard = this.getTopStudents(limit)

    console.log('\n🏆 QUIZ LEADERBOARD 🏆')
    console.log('=' .repeat(50))

    if (leaderboard.length === 0) {
      console.log('No students have earned rewards yet.')
      return
    }

    leaderboard.forEach((student, index) => {
      const rank = index + 1
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  '
      const publicKeyShort = `${student.publicKey.substring(0, 8)}...${student.publicKey.substring(-8)}`
      const rewardsFormatted = Number(student.totalRewards).toLocaleString()

      console.log(`${medal} ${rank}. ${publicKeyShort} - ${rewardsFormatted} sats`)
      console.log(`     Claimed Payments: ${student.claimedPayments.length}`)

      if (rank <= 3) {
        console.log(`     Payment IDs: ${student.claimedPayments.map(id => id.substring(0, 8)).join(', ')}`)
      }
      console.log()
    })
  }

  // Get statistics
  getStatistics(): {
    totalStudents: number,
    totalRewardsDistributed: bigint,
    totalQuizzes: number,
    successRate: number
  } {
    const totalStudents = this.studentRewards.size
    let totalRewardsDistributed = 0n

    for (const student of this.studentRewards.values()) {
      totalRewardsDistributed += student.totalRewards
    }

    const totalQuizzes = this.quizResults.length
    const successfulQuizzes = this.quizResults.filter(result => result.isCorrect).length
    const successRate = totalQuizzes > 0 ? (successfulQuizzes / totalQuizzes) * 100 : 0

    return {
      totalStudents,
      totalRewardsDistributed,
      totalQuizzes,
      successRate
    }
  }

  // Clear all data (for testing)
  reset(): void {
    this.studentRewards.clear()
    this.quizResults = []
  }
}
```

# src\helpers\payment-helper.ts

```ts
import { Payment,Withdraw  } from '../payment.js'

export class PaymentHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Payment}; export ${Withdraw}`)
    return this.mod
  }

  async createPaymentTx(satoshis: bigint) {
    const exp = `new Payment(${satoshis}n)`
    return this.computer.encode({
      exp,
      mod: this.mod,
    })
  }

  async createPayment(satoshis: bigint): Promise<Payment> {
    const payment = await this.computer.new(Payment, [satoshis])
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 1500))
    return payment
  }

  async getPayment(paymentTxId: string): Promise<Payment> {

    const id = paymentTxId.includes(':') ? paymentTxId :`${paymentTxId}:0`
    const rev = await this.computer.getLatestRev(id)

    const syncedPayment: Payment = await this.computer.sync(rev)
    return syncedPayment
  }

  // Transfer payment ownership to another public key
  async transferPayment(payment: Payment, toPublicKey: string): Promise<void> {
    await payment.transfer(toPublicKey)
    // Add delay to ensure blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Transfer payment by payment ID
  async transferPaymentById(paymentTxId: string, toPublicKey: string): Promise<void> {
    const payment = await this.getPayment(paymentTxId)
    await this.transferPayment(payment, toPublicKey)
  }

  // Verify if payment is owned by a specific public key
  async isPaymentOwnedBy(paymentTxId: string, publicKey: string): Promise<boolean> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners.includes(publicKey)
  }

  // Get current owners of a payment
  async getPaymentOwners(paymentTxId: string): Promise<string[]> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners
  }

  // Get the satoshi amount of a payment
  async getPaymentAmount(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return payment._satoshis
  }

  // Withdraw/claim the satoshis from a payment object to the owner's wallet using Withdraw contract
  async withdrawPayment(payment: Payment): Promise<bigint> {

    // Get payment ID and original amount
    const paymentId = await payment._id
    const originalAmount = await payment._satoshis

    // Check if payment has sufficient funds for withdrawal
    if (originalAmount <= 546n) {
      throw new Error(`Payment ${paymentId} has insufficient funds for withdrawal. Current: ${originalAmount} sats`);
    }

    // Sync the latest payment state
    const ownerPayment = await this.getPayment(paymentId)
    console.log('Payment object:', ownerPayment)

    console.log(`💰 Withdrawing payment of ${ originalAmount} sats to owner's wallet...`)
    await ownerPayment.withdraw()

    console.log("successfully withdrawn")

    const withdrawnAmount = originalAmount - 546n // Calculate the actual withdrawn amount
    await new Promise(resolve => setTimeout(resolve, 1500)) // wait for blockchain confirmation

    return withdrawnAmount
  }

  // Withdraw payment by payment ID
  async withdrawPaymentById(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return this.withdrawPayment(payment)
  }

  // Send reward directly from teacher's wallet to student's wallet
  async sendRewardToStudent(amount: bigint, studentAddress: string): Promise<string> {
    try {
      console.log(`💰 Sending reward of ${amount} sats to ${studentAddress}`)

      // Use Bitcoin Computer's send method to transfer satoshis directly
      const txId = await this.computer.send(amount, studentAddress)

      // Add delay to avoid mempool conflicts
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log(`✅ Reward sent successfully: ${txId}`)
      return txId
    } catch (error) {
      console.error(`❌ Reward transfer failed:`, error)
      throw error
    }
  }

  // Direct transfer of satoshis to winner's wallet (bypassing Payment objects) - for compatibility
  async transferRewardDirectly(amount: bigint, recipientAddress: string): Promise<string> {
    return await this.sendRewardToStudent(amount, recipientAddress);
  }
}
```

# src\helpers\quiz-access-helper.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { QuizAccess } from '../quiz-access.js'

export class QuizAccessHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${QuizAccess}`)
    return this.mod
  }

  /**
   * Teacher mints an access bag (usually 1n) that the teacher owns initially.
   * Then teacher uses SALE offer to sell it to a student for the entry fee.
   */
  async createQuizAccess(quizId: string, amount: bigint = 1n): Promise<QuizAccess> {
    if (!this.mod) throw new Error('QuizAccess module not deployed')
    const to = this.computer.getPublicKey()
    return (await this.computer.new(QuizAccess, [to, quizId, amount, 'QACC'], this.mod)) as QuizAccess
  }
}
```

# src\helpers\quiz-access-sale-helper.ts

```ts
import { Buffer } from 'buffer'
import { Transaction } from '@bitcoin-computer/lib'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { QuizAccessSale } from '../quiz-access-sale.js'
import { Payment, PaymentMock } from '../payment.js'


const sighashType = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

export class QuizAccessSaleHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${QuizAccessSale}`)
    return this.mod
  }

  /**
   * Teacher builds a partially signed offer:
   * input0 = access (signed by teacher)
   * input1 = mock payment (placeholder)
   */
  createOfferTx(access: any, paymentMock: PaymentMock) {
    return this.computer.encode({
      exp: `QuizAccessSale.exec(o, p)`,
      env: { o: access._rev, p: paymentMock._rev },
      mocks: { p: paymentMock },

      sighashType,
      inputIndex: 0,
      fund: false,
      sign: true,
      mod: this.mod,
    })
  }

  async isOfferTx(tx: TransactionType): Promise<boolean> {
    try {
      const { exp, mod } = await this.computer.decode(tx)
      return exp === 'QuizAccessSale.exec(o, p)' && mod === this.mod
    } catch {
      return false
    }
  }

  /**
   * Checks:
   * - correct exp + module
   * - effect env keys are exactly o,p
   * Returns the asking price (tx.outs[0].value).
   */
  async checkOfferTx(tx: TransactionType): Promise<bigint> {
    const { exp, env, mod } = await this.computer.decode(tx)
    if (exp !== 'QuizAccessSale.exec(o, p)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    // Re-simulate with a fresh mock payment of the advertised price
    const price = tx.outs[0].value as bigint
    const p = new PaymentMock(price)
    env.p = p._rev

    const mocks = { p }
    const fund = false
    const sign = false

    const { effect } = await this.computer.encode({
      exp,
      env,
      mod,
      mocks,
      fund,
      sign,
      sighashType,
    })

    // RIGHT
    if (effect.res === undefined) throw new Error('Unexpected result')

// also make env key check order-safe
    const keys = Object.keys(effect.env).sort().join(',')
    if (keys !== 'o,p') throw new Error('Unexpected environment')
    if (Object.keys(effect.env).toString() !== 'o,p') throw new Error('Unexpected environment keys')

    return price
  }

  /**
   * Student completion step:
   * - replace input[1] with real payment outpoint
   * - set output[1] scriptPubKey so student receives the access object
   */
  static finalizeOfferTx(tx: TransactionType, payment: Payment, buyerScriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)

    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey: buyerScriptPubKey })

    return tx
  }
}
```

# src\helpers\quiz-helper.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { Quiz } from '../quiz.js'

/**
 * QuizHelper - Utility class for Quiz contract operations
 * 
 * Current Architecture:
 * - 1 Quiz = 1 Question with exactly 4 options
 * - 1 Quiz = 1 Payment object (created by TeacherHelper)
 * - First correct answer claims the reward
 * - Only ONE teacher in the app creates quizzes
 * - MANY students can attempt quizzes
 */
export class QuizHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  /**
   * Get a quiz by ID
   */
  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

  /**
   * Check if a quiz is currently active
   */
  async isQuizActive(quizId: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.isActive
  }

  /**
   * Check if the reward for a quiz has been claimed
   */
  async isRewardClaimed(quizId: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.isClaimed
  }

  /**
   * Get the public key of the student who claimed the reward
   */
  async getRewardClaimedBy(quizId: string): Promise<string> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.claimedBy
  }

  /**
   * Check if a student has already attempted a quiz
   */
  async hasStudentAttempted(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.hasStudentAttempted(studentPublicKey)
  }

  /**
   * Check if a student can attempt a quiz
   * Returns true if:
   * - Quiz is active
   * - Student has not already attempted
   */
  async canStudentAttemptQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.canStudentAttempt(studentPublicKey)
  }

  /**
   * Get the number of students who have attempted a quiz
   */
  async getAttemptCount(quizId: string): Promise<number> {
    const quiz = await this.getQuiz(quizId)
    const attemptedStudents = await quiz.attemptedStudents
    return attemptedStudents.length
  }

  /**
   * Get quiz details in a formatted way
   */
  async getQuizDetails(quizId: string): Promise<{
    title: string
    questionText: string
    options: string[]
    rewardAmount: bigint
    isActive: boolean
    isClaimed: boolean
    claimedBy: string
    attemptCount: number
    paymentTxId: string
  }> {
    const quiz = await this.getQuiz(quizId)
    
    return {
      title: await quiz.title,
      questionText: await quiz.questionText,
      options: await quiz.options,
      rewardAmount: await quiz.rewardAmount,
      isActive: await quiz.isActive,
      isClaimed: await quiz.isClaimed,
      claimedBy: await quiz.claimedBy,
      attemptCount: (await quiz.attemptedStudents).length,
      paymentTxId: await quiz.paymentTxId
    }
  }

  /**
   * Deactivate a quiz (typically called by teacher)
   */
  async deactivateQuiz(quizId: string): Promise<void> {
    const quiz = await this.getQuiz(quizId)
    await quiz.deactivate()
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  /**
   * Validate if an answer index is valid (0-3)
   */
  isValidAnswerIndex(answerIndex: number): boolean {
    return answerIndex >= 0 && answerIndex <= 3
  }
}
```

# src\helpers\student-helper.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { Student } from '../student.js'
import { Quiz } from '../quiz.js'
import { QuizAttempt } from '../attempt.js'
import { PaymentHelper } from './payment-helper.js'
import { QuizAccess } from '../quiz-access.js'
export class StudentHelper {
  computer: Computer
  paymentHelper: PaymentHelper
  funderComputer?: Computer // Optional reward pool funder

  constructor(computer: Computer, funderComputer?: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
    this.funderComputer = funderComputer
  }

  async createStudent(name: string, publicKey: string): Promise<Student> {
    const student = await this.computer.new(Student, [name, publicKey])
    // Add longer delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2500))
    return student
  }

  async getStudent(studentId: string): Promise<Student> {
    return await this.computer.sync(studentId) as Student
  }

  async attemptQuiz(params: {
    quizId: string
    studentId: string
    selectedAnswer: number
  }): Promise<{
    isCorrect: boolean
    rewardClaimed: bigint
    paymentTransferred: boolean
  }> {
    console.log(`📝 Student ${params.studentId} attempting quiz ${params.quizId}`)

    const student = await this.getStudent(params.studentId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const quiz = await this.getQuiz(params.quizId)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if quiz is active
    if (!quiz.isActive) {
      throw new Error('Quiz is no longer active')
    }

    // Check if student has already attempted this quiz
    if (quiz.hasStudentAttempted(student.publicKey)) {
      throw new Error('Student has already attempted this quiz')
    }

    // Validate answer (must be 0-3)
    if (params.selectedAnswer < 0 || params.selectedAnswer > 3) {
      throw new Error('Selected answer must be between 0-3')
    }

    // Mark student as having attempted this quiz
    quiz.addAttemptedStudent(student.publicKey)
    student.addAttemptedQuiz(params.quizId)
    // Add longer delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Check if answer is correct
    const isCorrect = params.selectedAnswer === quiz.correctAnswer
    let rewardClaimed = 0n
    let paymentTransferred = false

    if (isCorrect) {
      console.log(`✅ Answer is correct! Attempting to claim reward...`)

      // Try to claim the reward (first-come-first-served)
      const canClaim = quiz.claimReward(student.publicKey)

      if (canClaim) {
        try {
          // Ensure we have a funder for reward withdrawal
          if (!this.funderComputer) {
            throw new Error('No funder computer set for reward withdrawal')
          }

          // Transfer payment ownership to student
          await this.paymentHelper.transferPaymentById(quiz.paymentTxId, student.publicKey)

          // Withdraw the payment to the student's wallet
          await this.paymentHelper.withdrawPaymentById(quiz.paymentTxId)

          // Update student's claimed rewards
          student.addClaimedReward(quiz.rewardAmount)
          rewardClaimed = quiz.rewardAmount
          paymentTransferred = true

          console.log(`💰 Payment withdrawn to student wallet! Student earned ${quiz.rewardAmount} sats`)
        } catch (error) {
          console.log(`❌ Payment transfer failed: ${(error as any).message || error}`)
          // Revert the claim if payment transfer failed
          quiz.isClaimed = false
          quiz.claimedBy = ''
        }
      } else {
        console.log(`⏰ Reward already claimed by another student`)
      }
    } else {
      console.log(`❌ Answer is incorrect`)
    }

    // Add longer delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2500))

    console.log(`✅ Quiz attempt completed: ${isCorrect ? 'Correct' : 'Incorrect'}`)
    console.log(`💳 Reward claimed: ${rewardClaimed} sats`)

    return {
      isCorrect,
      rewardClaimed,
      paymentTransferred
    }
  }

  /**
   * Attempt quiz using QuizAttempt contract (for the new enhanced flow)
   */
  async attemptQuizWithQuizAttempt(
  quizId: string,
  selectedAnswer: number,
  access: QuizAccess | string, // ✅ pass token (or its id)
): Promise<{
  isCorrect: boolean
  rewardEarned: bigint
}> {
  console.log(`📝 Student attempting quiz ${quizId} with QuizAttempt contract`)

  const quiz = await this.getQuiz(quizId)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!quiz.isActive) throw new Error('Quiz is no longer active')

  if (await quiz.hasStudentAttempted(this.computer.getPublicKey())) {
    throw new Error('Student has already attempted this quiz')
  }

  // Load access token if caller passed an id
  const accessObj =
    typeof access === 'string' ? ((await this.computer.sync(access)) as QuizAccess) : access

  // Optional pre-check (contract also checks)
  if (accessObj.quizId !== quizId) throw new Error('Wrong access token for this quiz')
  if (accessObj._owners[0] !== this.computer.getPublicKey()) throw new Error('Access token not owned by this student')
  if (accessObj.amount === 0n) throw new Error('Access token already used')

  // Create attempt
  const attempt = await this.computer.new(QuizAttempt, [quizId, this.computer.getPublicKey()])
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // ✅ NEW CALL (pass access first)
  await attempt.submitAnswer(accessObj, selectedAnswer, await quiz.correctAnswer, await quiz.rewardAmount)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const isCorrect = await attempt.isCorrect
  let rewardEarned = 0n

  if (isCorrect) {
    // (keep your existing logic exactly the same)
    rewardEarned = await quiz.rewardAmount
  }

  await new Promise((resolve) => setTimeout(resolve, 2500))

  return { isCorrect, rewardEarned }
}

  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

  async getStudentTotalRewards(studentId: string): Promise<bigint> {
    const student = await this.getStudent(studentId)
    return student.getTotalRewards()
  }

}
```

# src\helpers\teacher-helper.ts

```ts
// import { Computer } from '@bitcoin-computer/lib'
// import { Teacher } from '../teacher.js'
// import { Quiz } from '../quiz.js'
// import { PaymentHelper } from './payment-helper.js'

// export class TeacherHelper {
//   computer: Computer
//   paymentHelper: PaymentHelper

//   constructor(computer: Computer) {
//     this.computer = computer
//     this.paymentHelper = new PaymentHelper(computer)
//   }

//   async createTeacher(name: string, publicKey: string): Promise<Teacher> {
//     const teacher = await this.computer.new(Teacher, [name, publicKey]) as Teacher
//     // Add delay to avoid mempool conflicts
//     await new Promise(resolve => setTimeout(resolve, 3000))
//     return teacher
//   }

//   async getTeacher(teacherId: string): Promise<Teacher> {
//     return await this.computer.sync(teacherId) as Teacher
//   }

//   async createQuiz(params: {
//     title: string
//     questionText: string
//     options: string[]
//     correctAnswer: number
//     rewardAmount: bigint
//     entryFee: bigint
//     teacher: Teacher
//   }): Promise<{ quiz: Quiz; paymentTxId: string }> {
//     console.log(`🎯 Teacher creating quiz: ${params.title}`)

//     // Validate quiz parameters
//     Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

//     // Create payment object for this quiz
//     console.log(`💰 Creating payment for quiz: ${params.rewardAmount} sats`)
//     const payment = await this.paymentHelper.createPayment(params.rewardAmount)
//     const paymentId = await payment._id
//     console.log(`✅ Payment created: ${paymentId}`)

//     // Delay after payment creation
//     await new Promise(resolve => setTimeout(resolve, 3000))

//     // Create quiz with payment reference
//     const teacherPubKey = await params.teacher.publicKey
//     const quiz = await this.computer.new(Quiz, [{
//       title: params.title,
//       questionText: params.questionText,
//       options: params.options,
//       correctAnswer: params.correctAnswer,
//       rewardAmount: params.rewardAmount,
//       entryFee: params.entryFee,
//       teacherPublicKey: teacherPubKey,
//       paymentTxId: paymentId
//     }]) as Quiz

//     // Delay after quiz creation
//     await new Promise(resolve => setTimeout(resolve, 3000))

//     // Add quiz to teacher's list
//     const teacherId = await params.teacher._id
//     const updatedTeacher = await this.getTeacher(teacherId)
//     const quizId = await quiz._id
//     await updatedTeacher.addQuiz(quizId)

//     // Delay after updating teacher
//     await new Promise(resolve => setTimeout(resolve, 3000))

//     console.log(`✅ Quiz created successfully: ${quizId}`)
//     return { quiz, paymentTxId: paymentId }
//   }

//   async createQuizOnly(params: {
//     title: string
//     questionText: string
//     options: string[]
//     correctAnswer: number
//     rewardAmount: bigint
//     entryFee: bigint
//     teacher: Teacher
//   }): Promise<Quiz> {
//     console.log(`🎯 Teacher creating quiz (no payment object): ${params.title}`)

//     // Validate quiz parameters
//     Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

//     // Create quiz without payment object (manual reward handling)
//     const teacherPubKey = await params.teacher.publicKey
//     const quiz = await this.computer.new(Quiz, [{
//       title: params.title,
//       questionText: params.questionText,
//       options: params.options,
//       correctAnswer: params.correctAnswer,
//       rewardAmount: params.rewardAmount,
//       entryFee: params.entryFee,
//       teacherPublicKey: teacherPubKey,
//       paymentTxId: "" // No payment object - manual rewards
//     }]) as Quiz

//     // Delay after quiz creation
//     await new Promise(resolve => setTimeout(resolve, 3000))

//     // Add quiz to teacher's list
//     const teacherId = await params.teacher._id
//     const updatedTeacher = await this.getTeacher(teacherId)
//     const quizId = await quiz._id
//     await updatedTeacher.addQuiz(quizId)

//     // Delay after updating teacher
//     await new Promise(resolve => setTimeout(resolve, 3000))

//     console.log(`✅ Quiz-only created successfully: ${quizId}`)
//     return quiz
//   }

//   async deactivateQuiz(teacher: Teacher, quizId: string) {
//     const quiz = await this.getQuiz(quizId)

//     // Only allow the teacher to deactivate their own quiz
//     const quizTeacherPubKey = await quiz.teacherPublicKey
//     const teacherPubKey = await teacher.publicKey
//     if (quizTeacherPubKey !== teacherPubKey) {
//       throw new Error('Only the quiz creator can deactivate this quiz')
//     }

//     await quiz.deactivate()

//     // Delay after deactivation
//     await new Promise(resolve => setTimeout(resolve, 3000))
//   }

//   async getQuiz(quizId: string): Promise<Quiz> {
//     return await this.computer.sync(quizId) as Quiz
//   }

// }

import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher.js'
import { Quiz } from '../quiz.js'
import { Payment } from '../payment.js'
import { PaymentHelper } from './payment-helper.js'

export class TeacherHelper {
  computer: Computer
  paymentHelper: PaymentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  async createTeacher(name: string, publicKey: string): Promise<Teacher> {
    const teacher = (await this.computer.new(Teacher, [name, publicKey])) as Teacher
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return teacher
  }

  async getTeacher(teacherId: string): Promise<Teacher> {
    return (await this.computer.sync(teacherId)) as Teacher
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return (await this.computer.sync(quizId)) as Quiz
  }

  /**
   * Step 1: Create reward Payment only.
   * Returns both the Payment object and its id (paymentTxId).
   */
  async createQuizRewardPayment(rewardAmount: bigint): Promise<{ payment: Payment; paymentTxId: string }> {
    console.log(`💰 Creating reward payment: ${rewardAmount} sats`)
    const payment = await this.paymentHelper.createPayment(rewardAmount)
    const paymentTxId = await payment._id
    console.log(`✅ Reward payment created: ${paymentTxId}`)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { payment, paymentTxId }
  }

  /**
   * Step 2: Create Quiz only, but requires a paymentTxId already created.
   * Also adds quizId to teacher object.
   */
  async createQuizWithPayment(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
    paymentTxId: string
  }): Promise<Quiz> {
    console.log(`🎯 Creating quiz: ${params.title}`)

    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    const teacherPubKey = await params.teacher.publicKey

    const quiz = (await this.computer.new(Quiz, [
      {
        title: params.title,
        questionText: params.questionText,
        options: params.options,
        correctAnswer: params.correctAnswer,
        rewardAmount: params.rewardAmount,
        entryFee: params.entryFee,
        teacherPublicKey: teacherPubKey,
        paymentTxId: params.paymentTxId,
      },
    ])) as Quiz

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Add quiz to teacher list
    const teacherId = await params.teacher._id
    const updatedTeacher = await this.getTeacher(teacherId)
    const quizId = await quiz._id
    await updatedTeacher.addQuiz(quizId)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log(`✅ Quiz created successfully: ${quizId}`)
    return quiz
  }

  /**
   * Convenience wrapper (optional):
   * Does both steps: create payment + create quiz.
   * Keeps your old API working if other tests use it.
   */
  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<{ quiz: Quiz; paymentTxId: string }> {
    const { paymentTxId } = await this.createQuizRewardPayment(params.rewardAmount)
    const quiz = await this.createQuizWithPayment({ ...params, paymentTxId })
    return { quiz, paymentTxId }
  }

  /**
   * If you still want a quiz without payment object.
   */
  async createQuizOnly(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<Quiz> {
    console.log(`🎯 Teacher creating quiz (no payment object): ${params.title}`)

    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    const teacherPubKey = await params.teacher.publicKey
    const quiz = (await this.computer.new(Quiz, [
      {
        title: params.title,
        questionText: params.questionText,
        options: params.options,
        correctAnswer: params.correctAnswer,
        rewardAmount: params.rewardAmount,
        entryFee: params.entryFee,
        teacherPublicKey: teacherPubKey,
        paymentTxId: '',
      },
    ])) as Quiz

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const teacherId = await params.teacher._id
    const updatedTeacher = await this.getTeacher(teacherId)
    const quizId = await quiz._id
    await updatedTeacher.addQuiz(quizId)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log(`✅ Quiz-only created successfully: ${quizId}`)
    return quiz
  }

  async deactivateQuiz(teacher: Teacher, quizId: string) {
    const quiz = await this.getQuiz(quizId)

    const quizTeacherPubKey = await quiz.teacherPublicKey
    const teacherPubKey = await teacher.publicKey
    if (quizTeacherPubKey !== teacherPubKey) {
      throw new Error('Only the quiz creator can deactivate this quiz')
    }

    await quiz.deactivate()
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}
```

# src\index.ts

```ts
export { Teacher } from './teacher.js'
export { Student } from './student.js'
export { Quiz } from './quiz.js'
export { QuizAttempt } from './attempt.js'

export { QuizAccess } from './quiz-access.js'

// NEW: sale exports
export { QuizAccessSale } from './quiz-access-sale.js'
export { QuizAccessSaleHelper } from './helpers/quiz-access-sale-helper.js'

export { Payment } from './payment.js'
export * from './payment.js'

// helpers
export { PaymentHelper } from './helpers/payment-helper.js'
export { StudentHelper } from './helpers/student-helper.js'
export { TeacherHelper } from './helpers/teacher-helper.js'
export { AttemptHelper } from './helpers/attempt-helper.js'
export { QuizAccessHelper } from './helpers/quiz-access-helper.js'
export { LeaderboardHelper } from './helpers/leaderboard-helper.js'
```

# src\modSpecs.ts

```ts
// Module specifications for deployed contracts
// These will be populated after running 'npm run deploy'

export const NEXT_PUBLIC_TEACHER_MOD_SPEC = process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC || ''
export const NEXT_PUBLIC_STUDENT_MOD_SPEC = process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC || ''
export const NEXT_PUBLIC_QUIZ_MOD_SPEC = process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC || ''
export const NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC = process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || ''
export const NEXT_PUBLIC_PAYMENT_MOD_SPEC = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || ''

// Validate that all module specifications are set
export function validateModSpecs(): boolean {
  return !!(
    NEXT_PUBLIC_TEACHER_MOD_SPEC &&
    NEXT_PUBLIC_STUDENT_MOD_SPEC &&
    NEXT_PUBLIC_QUIZ_MOD_SPEC &&
    NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC &&
    NEXT_PUBLIC_PAYMENT_MOD_SPEC
  )
}

// Get all module specifications as an object
export function getModSpecs() {
  return {
    teacher: NEXT_PUBLIC_TEACHER_MOD_SPEC,
    student: NEXT_PUBLIC_STUDENT_MOD_SPEC,
    quiz: NEXT_PUBLIC_QUIZ_MOD_SPEC,
    attempt: NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC,
    payment: NEXT_PUBLIC_PAYMENT_MOD_SPEC
  }
}
```

# src\payment.ts

```ts
import { getMockedRev } from './utils/index.js'
import { Contract } from '@bitcoin-computer/lib'

const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c'

/**
 * Payment contract that holds reward funds for quiz winners
 * Gas fees: Creator pays initial deployment fee, transfer/withdraw operations require fees from respective actors
 */
export class Payment extends Contract {
  _id!: string
  _rev!: string
  _root!: string
  _satoshis!: bigint
  _owners!: string[]


  /**
   * Creates a new payment contract with specified satoshis
   * @param _satoshis - Amount of satoshis to lock in this payment contract
   * Gas fee: Paid by the creator of this contract
   */
  constructor(_satoshis: bigint) {
    super({ _satoshis })
  }

  /**
   * Transfers ownership of this payment contract to a new public key
   * @param to - Public key of the new owner
   * Gas fee: Paid by the caller of this method
   */
  transfer(to: string) {
    this._owners = [to]


  }

  /**
   * Sets the satoshi amount of this payment contract
   * @param a - New satoshi amount
   * Gas fee: Paid by the caller of this method
   */
  setSatoshis(a: bigint) {
    this._satoshis = a
  }

  /**
   * Withdraws funds from the payment contract by reducing it to minimum dust
   * The excess satoshis are automatically transferred to the owner's wallet via UTXO mechanics
   * Gas fee: Paid by the caller of this method
   * @throws Error if the payment amount is below the minimum required for withdrawal
   */
  withdraw() {
    // Ensure there are sufficient funds for withdrawal (more than dust amount)
    if (this._satoshis <= 546n) {
      throw new Error(`Insufficient funds for withdrawal. Minimum required: 547 sats, current: ${this._satoshis} sats`);
    }

    this._satoshis = 546n // minimum non-dust amount after withdrawal
  }


}

export class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(satoshis: bigint) {
    this._id = getMockedRev()
    this._rev = getMockedRev()
    this._root = getMockedRev()
    this._satoshis = satoshis
    this._owners = [randomPublicKey]
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }


}

/**
 * The Withdraw contract that reduces payment satoshis to minimum dust amount
 * This releases the excess satoshis to the owner's wallet through the Bitcoin Computer's UTXO model
 * Gas fee: Paid by the caller of this static method
 */
export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.withdraw())
  }
}
```

# src\quiz-access-sale.ts

```ts
import { Contract } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'
import { Payment } from './payment.js'

/**
 * Sale-style atomic exchange:
 * - access (o) goes to buyer (owner of payment)
 * - payment (p) goes to seller (current owner of access)
 *
 * Return order matters: [p, o] => output0 is payment, output1 is access.
 */
export class QuizAccessSale extends Contract {
  static exec(o: QuizAccess, p: Payment) {
    const [seller] = o._owners
    const [buyer] = p._owners

    o.transfer(buyer)
    p.transfer(seller)

    return [p, o]
  }
}
```

# src\quiz-access.ts

```ts
import { Contract } from '@bitcoin-computer/lib'

type Constructor<T> = new (...args: any[]) => T

/**
 * Fungible Quiz Access Token (UTXO bag model)
 *
 * - quizId: which quiz this access is for
 * - amount: how many "access units" this bag holds (usually 1n)
 * - burn(1n): consume one access unit (used when attempting the quiz)
 *
 * This replaces the old "NFT-like" access token + used flag.
 */
export class QuizAccess extends Contract {
  quizId!: string
  amount!: bigint
  symbol!: string
  _owners!: string[]

  constructor(to: string, quizId: string, amount: bigint = 1n, symbol = 'QACC') {
    super({ _owners: [to], quizId, amount, symbol })
  }

  /**
   * Transfer ownership.
   * - If amount is undefined: transfer the whole bag to `to`.
   * - If amount is provided: split `amount` into a NEW bag owned by `to`.
   */
  transfer(to: string, amount?: bigint): QuizAccess | undefined {
    if (typeof amount === 'undefined') {
      // Send entire bag
      this._owners = [to]
      return undefined
    }

    if (amount <= 0n) throw new Error('Amount must be positive')

    if (this.amount >= amount) {
      // Split into a new bag
      this.amount -= amount
      const ctor = this.constructor as Constructor<this>
      return new ctor(to, this.quizId, amount, this.symbol) as unknown as QuizAccess
    }

    throw new Error('Insufficient access balance')
  }

  /**
   * Burn access units in this bag.
   * Default: burn everything (amount -> 0).
   */
  burn(amount: bigint = this.amount) {
    if (amount < 0n) throw new Error('Amount must be non-negative')
    if (amount > this.amount) throw new Error('Insufficient access balance')
    this.amount -= amount
  }

  /**
   * Merge other bags of the SAME quiz into this bag.
   */
  merge(tokens: QuizAccess[]) {
    let total = 0n
    tokens.forEach((t) => {
      if (t.quizId !== this.quizId) throw new Error('Cannot merge different quizzes')
      total += t.amount
      t.burn()
    })
    this.amount += total
  }
}
```

# src\quiz.ts

```ts
import { Contract } from '@bitcoin-computer/lib'

/**
 * Quiz contract that manages a single-question quiz with reward
 * Gas fees: Teacher pays for quiz creation, students pay for attempts and claiming rewards
 */
export class Quiz extends Contract {
  title!: string
  questionText!: string
  options!: string[] // Exactly 4 options
  correctAnswer!: number // Index of correct option (0-3)
  rewardAmount!: bigint
  entryFee!: bigint  // Fee required to access/attempt the quiz
  teacherPublicKey!: string
  isActive!: boolean
  paymentTxId!: string // Single payment object for this quiz
  isClaimed!: boolean // Track if reward has been claimed
  claimedBy!: string // Public key of student who claimed the reward
  attemptedStudents!: string[] // Students who attempted this quiz

  /**
   * Creates a new quiz with specified parameters
   * @param title - Title of the quiz
   * @param questionText - The question text
   * @param options - Array of 4 options
   * @param correctAnswer - Index of the correct answer (0-3)
   * @param rewardAmount - Amount of reward in satoshis
   * @param entryFee - Amount of entry fee in satoshis
   * @param teacherPublicKey - Public key of the teacher creating the quiz
   * @param paymentTxId - Transaction ID of the associated payment contract
   * Gas fee: Paid by the teacher (constructor caller)
   */
  constructor({
    title,
    questionText,
    options,
    correctAnswer,
    rewardAmount,
    entryFee,
    teacherPublicKey,
    paymentTxId
  }: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacherPublicKey: string
    paymentTxId: string
  }) {
    // Validate 4 options
    if (options.length !== 4) {
      throw new Error('Quiz must have exactly 4 options')
    }

    // Validate correct answer index
    if (correctAnswer < 0 || correctAnswer > 3) {
      throw new Error('Correct answer must be between 0 and 3')
    }

    super({
      _owners: [teacherPublicKey],
      title,
      questionText,
      options,
      correctAnswer,
      rewardAmount,
      entryFee,
      teacherPublicKey,
      isActive: true,
      paymentTxId,
      isClaimed: false,
      claimedBy: '',
      attemptedStudents: []
    })
  }

  /**
   * Deactivates the quiz, preventing further attempts
   * Gas fee: Paid by the caller of this method (typically the teacher)
   */
  deactivate() {
    this.isActive = false
  }

  /**
   * Checks if a student has already attempted this quiz
   * @param studentPublicKey - Public key of the student
   * @returns Boolean indicating if student has attempted
   */
  hasStudentAttempted(studentPublicKey: string): boolean {
    return this.attemptedStudents.includes(studentPublicKey)
  }

  /**
   * Adds a student to the list of attempted students
   * @param studentPublicKey - Public key of the student
   * Gas fee: Paid by the caller of this method
   */
  addAttemptedStudent(studentPublicKey: string) {
    if (this.hasStudentAttempted(studentPublicKey)) {
      throw new Error('Student has already attempted this quiz')
    }
    this.attemptedStudents.push(studentPublicKey)
  }

  /**
   * Claims the reward for this quiz (first-come-first-served)
   * @param studentPublicKey - Public key of the student claiming the reward
   * @returns Boolean indicating success of the claim
   * Gas fee: Paid by the student attempting to claim the reward
   */
  claimReward(studentPublicKey: string): boolean {
    if (this.isClaimed) {
      return false // Already claimed by someone else
    }

    this.isClaimed = true
    this.claimedBy = studentPublicKey
    return true
  }

  /**
   * Checks if a student can attempt this quiz
   * @param studentPublicKey - Public key of the student
   * @returns Boolean indicating if student can attempt
   */
  canStudentAttempt(studentPublicKey: string): boolean {
    return !this.hasStudentAttempted(studentPublicKey) && this.isActive
  }
}
```

# src\scripts\deploy.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { deployQuizContracts } from './lib.js'


config()

const {
  NEXT_PUBLIC_CHAIN: chain,
  NEXT_PUBLIC_NETWORK: network,
  NEXT_PUBLIC_URL: url,
  NEXT_PUBLIC_PATH: path,
  DEPLOYMENT_MNEMONIC: mnemonic
} = process.env

const rl = createInterface({ input, output })

if (!network || !chain || !url) {
  throw new Error('Please set NEXT_PUBLIC_CHAIN, NEXT_PUBLIC_NETWORK, and NEXT_PUBLIC_URL in the .env file')
}

const computer = new Computer({
  chain,
  network,
  url,
  path,
  mnemonic // Use fixed mnemonic for consistent deployment wallet
})

if (network === 'regtest') {
  console.log(' - Using regtest environment...')
  const address = computer.getAddress()
  console.log(` - Using address: ${address}`)
  console.log(' - Please ensure your regtest wallet is funded')
  console.log(' - You can fund it manually using: npm run fund')
}

const { balance } = await computer.getBalance()

console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Balance \x1b[2m${balance} satoshis\x1b[0m`)

// Check if we have sufficient balance for deployment
if (balance < 50000n) { // Need at least 50k satoshis for deployment

  console.error(`\n❌ Insufficient balance: ${balance} satoshis`)
  console.error(' - Need at least 50,000 satoshis for contract deployment')

  if (network === 'regtest') {
    console.log(' - Try funding the wallet again or check if the Bitcoin Computer node is running')
    console.log(' - Command: npm run node:up (to start the node)')
  } else {
    console.log(' - Please fund your wallet with sufficient Bitcoin/Litecoin')
    console.log(' - Address:', computer.getAddress())
  }

  rl.close()
  process.exit(1)
}

const answer = await rl.question('\nDo you want to deploy the quiz contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log(' - Aborting...')
  rl.close()
  process.exit(0)
}

const { teacherMod, studentMod, quizMod, attemptMod, paymentMod } = await deployQuizContracts(computer)
console.log(' \x1b[2m- Successfully deployed all quiz contracts\x1b[0m')

console.log(`
-----------------
ACTION REQUIRED
-----------------

Update the following rows in your .env file.

NEXT_PUBLIC_TEACHER_MOD_SPEC\x1b[2m=${teacherMod}\x1b[0m
NEXT_PUBLIC_STUDENT_MOD_SPEC\x1b[2m=${studentMod}\x1b[0m
NEXT_PUBLIC_QUIZ_MOD_SPEC\x1b[2m=${quizMod}\x1b[0m
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC\x1b[2m=${attemptMod}\x1b[0m
NEXT_PUBLIC_PAYMENT_MOD_SPEC\x1b[2m=${paymentMod}\x1b[0m
`)

console.log("\nRun 'npm run dev' to start the application.\n")
rl.close()
```

# src\scripts\lib.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher.js'
import { Student } from '../student.js'
import { Quiz } from '../quiz.js'
import { QuizAttempt } from '../attempt.js'
import { Payment, Withdraw } from '../payment.js'

export async function deployQuizContracts(computer: Computer): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
}> {
  // Deploy all contracts at once
  const teacherMod = await computer.deploy(`export ${Teacher}`)
  const studentMod = await computer.deploy(`export ${Student}`)
  const quizMod = await computer.deploy(`export ${Quiz}`)
  const attemptMod = await computer.deploy(`export ${QuizAttempt}`)
  const paymentMod = await computer.deploy(`export ${Payment}; export ${Withdraw}`)

  return {
    teacherMod,
    studentMod,
    quizMod,
    attemptMod,
    paymentMod
  }
}
```

# src\student.ts

```ts
import { Contract } from '@bitcoin-computer/lib'

export class Student extends Contract {
  name!: string
  publicKey!: string
  attemptedQuizzes!: string[]
  claimedRewards!: bigint // Total amount of rewards claimed

  constructor(name: string, publicKey: string) {
    super({
      name,
      publicKey,
      attemptedQuizzes: [],
      claimedRewards: 0n
    })
  }

  // Add a quiz to attempted list
  addAttemptedQuiz(quizId: string) {
    if (!this.attemptedQuizzes.includes(quizId)) {
      this.attemptedQuizzes.push(quizId)
    }
  }

  // Add claimed reward amount
  addClaimedReward(amount: bigint) {
    this.claimedRewards += amount
  }

  // Check if student has attempted a specific quiz
  hasAttemptedQuiz(quizId: string): boolean {
    return this.attemptedQuizzes.includes(quizId)
  }

  getAttemptedQuizCount(): number {
    return this.attemptedQuizzes.length
  }

  getTotalRewards(): bigint {
    return this.claimedRewards
  }
}
```

# src\teacher.ts

```ts
import { Contract } from '@bitcoin-computer/lib'

export class Teacher extends Contract {
  name!: string
  publicKey!: string
  createdQuizzes!: string[]

  constructor(name: string, publicKey: string) {
    super({
      name,
      publicKey,
      createdQuizzes: []
    })
  }

  // Add a quiz to the teacher's list
  addQuiz(quizId: string) {
    this.createdQuizzes.push(quizId)
  }

  // Validate quiz creation parameters
  static validateQuizParams(questionText: string, options: string[], correctAnswer: number, rewardAmount: bigint): void {
    if (!questionText || questionText.trim().length === 0) {
      throw new Error('Question text cannot be empty')
    }

    if (options.length !== 4) {
      throw new Error('Quiz must have exactly 4 options')
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      throw new Error('Correct answer must be between 0-3')
    }

    if (rewardAmount <= 0) {
      throw new Error('Reward must be greater than 0')
    }
  }

  getQuizCount(): number {
    return this.createdQuizzes.length
  }
}
```

# src\utils\index.ts

```ts
export const getMockedRev = () => `mock-${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`

export const RLTC: {
  network: 'regtest'
  chain: 'LTC'
  url: string
} = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

export const meta = {
  _id: (x: any) => typeof x === 'string',
  _rev: (x: any) => typeof x === 'string',
  _root: (x: any) => typeof x === 'string',
  _owners: (x: any) => Array.isArray(x),
  _satoshis: (x: any) => typeof x === 'bigint',
}

```

# src\utils\mineblock.ts

```ts
// import { Computer } from '@bitcoin-computer/lib'


// export class MineBlocks{
//   static async mineBlockFromRPCClient(computer: Computer) {
//     try {
//       const newAddress = await computer.rpcCall('getnewaddress', 'mywallet legacy')
//       console.log(`Mining block to address ${newAddress.result}`)
//       await computer.rpcCall('generatetoaddress', `1 ${newAddress.result}`)
//       console.log(`Block mined to address ${newAddress.result}`)
//       await new Promise((resolve) => setTimeout(resolve, 2000))
//     } catch (error) {
//       console.log('Error generating block', error)
//     }
//   }


// }



type BcnRpcEnvelope = {
  result: { result: any; error: any; id: number }
}

async function bcnRpc(url: string, chain: string, network: string, method: string, params = '') {
  const endpoint = `${url}/v1/${chain}/${network}/rpc`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  })
  const json = (await res.json()) as BcnRpcEnvelope
  if (!res.ok || json.result?.error) {
    throw new Error(`RPC ${method} failed: ${JSON.stringify(json.result?.error ?? json)}`)
  }
  return json.result.result
}

export class MineBlocks {
  /**
   * Mines blocks to a node-wallet address (NOT your Computer wallet),
   * so it confirms txs without creating immature coinbase UTXOs in your test wallet.
   */
  static async mine(url: string, chain: string, network: string, blocks = 1) {
    // get a fresh node-wallet address (label + type)
    const addr = await bcnRpc(url, chain, network, 'getnewaddress', 'mining legacy')
    await bcnRpc(url, chain, network, 'generatetoaddress', `${blocks} ${addr}`)
    await new Promise((r) => setTimeout(r, 300))
  }
}
```

# test\complete-quiz-access-sale.test.ts

```ts
// import { Computer } from '@bitcoin-computer/lib'
// import { expect } from 'chai'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import { Payment, PaymentMock } from '../src/payment.js'
// import { QuizAccessHelper, QuizAccessSaleHelper } from '../src/index.js'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { AttemptHelper } from '../src/helpers/attempt-helper.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'
// import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'
// import { MineBlocks } from '../src/utils/mineblock.js'
// import dotenv from 'dotenv'
// dotenv.config()

// describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
//   this.timeout(300000)

//   const chain = process.env.CHAIN || 'LTC'
//   const network = process.env.NETWORK || 'regtest'
//   const url = process.env.URL || 'http://localhost:3000'
//   const basePath = process.env.PATH || `m/44'/1'/0'/0`

//   let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
//   let teacherHelper: TeacherHelper,
//     student1Helper: StudentHelper,
//     student2Helper: StudentHelper,
//     attempt1Helper: AttemptHelper,
//     attempt2Helper: AttemptHelper,
//     paymentHelper: PaymentHelper,
//     leaderboardHelper: LeaderboardHelper

//   let teacher: Teacher, student1: Student, student2: Student
//   let quiz: Quiz, payment: Payment
//   let quizId: string
//   let teacherPubKey: string, student1PubKey: string, student2PubKey: string

//   let quizAccessHelper: QuizAccessHelper
//   let quizAccessSaleHelper: QuizAccessSaleHelper

//   let entryFeePaymentS1: Payment
//   let entryFeePaymentS2: Payment

//   // store access tokens for attempt enforcement
//   let quizAccessTokenS1: any
//   let quizAccessTokenS2: any

//   const walletBalances = {
//     teacher: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
//     student1: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
//     student2: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
//   }

//   async function updateWalletBalances(stage: keyof typeof walletBalances.teacher) {
//     const teacherBal = await teacherComputer.getBalance()
//     const student1Bal = await student1Computer.getBalance()
//     const student2Bal = await student2Computer.getBalance()

//     walletBalances.teacher[stage] = Number(teacherBal.confirmed || teacherBal.balance)
//     walletBalances.student1[stage] = Number(student1Bal.confirmed || student1Bal.balance)
//     walletBalances.student2[stage] = Number(student2Bal.confirmed || student2Bal.balance)
//   }

//   const mine = async (blocks = 1) => {
//     if (network === 'regtest') {
//       await MineBlocks.mine(url, chain, network, blocks)
//       //console.log(`⛏️  Mining..`)
//     }
//   }

//   before(async function () {
//     teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
//     student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
//     student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

//     teacherPubKey = teacherComputer.getPublicKey()
//     student1PubKey = student1Computer.getPublicKey()
//     student2PubKey = student2Computer.getPublicKey()

//     if (network === 'regtest') {
//       await teacherComputer.faucet(2e8)
//       await student1Computer.faucet(2e8)
//       await student2Computer.faucet(2e8)

//       await updateWalletBalances('initial')
      
//     }

//     teacherHelper = new TeacherHelper(teacherComputer)
//     student1Helper = new StudentHelper(student1Computer)
//     student2Helper = new StudentHelper(student2Computer)
//     attempt1Helper = new AttemptHelper(student1Computer)
//     attempt2Helper = new AttemptHelper(student2Computer)
//     paymentHelper = new PaymentHelper(teacherComputer)
//     leaderboardHelper = new LeaderboardHelper(teacherComputer)

//     quizAccessHelper = new QuizAccessHelper(teacherComputer)
//     await quizAccessHelper.deploy()
//     await mine(1)

//     quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
//     await quizAccessSaleHelper.deploy()
//     await mine(1)

//     await paymentHelper.deploy()
//     await mine(1)

//     await updateWalletBalances('afterSetup')
//   })

//   it('should create teacher and students', async function () {
//     teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
//     student1 = await student1Helper.createStudent('Alice', student1PubKey)
//     student2 = await student2Helper.createStudent('Bob', student2PubKey)

//     expect(await student1.name).to.equal('Alice')
//     expect(await student2.name).to.equal('Bob')

//     await mine(1)
//   })

//   it('should create quiz with payment', async function () {
//     const quizData = {
//       title: 'Math Quiz',
//       questionText: 'What is 2+2?',
//       options: ['3', '4', '5', '6'],
//       correctAnswer: 1,
//       rewardAmount: 1000000n,
//       entryFee: 50000n,
//       teacher: teacher,
//     }

//     const quizResult = await teacherHelper.createQuiz(quizData)
//     quiz = quizResult.quiz
//     quizId = await quiz._id
//     const paymentTxId = quizResult.paymentTxId
//     payment = (await teacherComputer.sync(paymentTxId)) as Payment

//     expect(await quiz.title).to.equal('Math Quiz')
//     expect(await payment._satoshis).to.equal(1000000n)
//     expect(await quiz.entryFee).to.equal(50000n)

//     await mine(1)
//     await updateWalletBalances('afterQuizCreation')
//   })

//   it('should allow students to purchase access to the quiz (SALE OFFERS)', async function () {
//     console.log('\n🧾 SALE OFFER MECHANISM INITIATED')
//     console.log('==================================')

//     // Student 1
//     console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

//     const quizAccess1 = await quizAccessHelper.createQuizAccess(quizId) // amount=1n
//     console.log(`📋 Access token minted: ${await quizAccess1._id}`)

//     const mock1 = new PaymentMock(await quiz.entryFee)
//     const { tx: offerTx1 } = await quizAccessSaleHelper.createOfferTx(quizAccess1, mock1)
//     console.log("swap objects in offerTx1.env:", offerTx1.env)
//     console.log(`📝 Offer tx created (partially signed): ${offerTx1}`)

//     console.log(offerTx1)

//     const studentSaleHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
//     expect(await studentSaleHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

//     const entryFeePayment1 = await student1Computer.new(Payment, [await quiz.entryFee])

//     const s1Script = student1Computer.toScriptPubKey()
//     if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')

//     QuizAccessSaleHelper.finalizeOfferTx(offerTx1, entryFeePayment1, s1Script)

//     console.log("swap objects in offerTx1.env:", offerTx1.env)

//     console.log(offerTx1)

//     await student1Computer.fund(offerTx1)
//     await student1Computer.sign(offerTx1)
//     console.log(offerTx1)
//     const txId1 = await student1Computer.broadcast(offerTx1)
//     console.log(offerTx1)
//     console.log("swap objects in offerTx1.env:", offerTx1.env)
//     await mine(1)

//     const {
//       env: { o: quizAccessS1, p: entryFeePaymentS1_temp },
//     } = (await student1Computer.sync(txId1)) as { env: { o: any; p: any } }

//     expect(quizAccessS1._owners).deep.eq([student1PubKey])
//     expect(entryFeePaymentS1_temp._owners).deep.eq([teacherPubKey])

//     // NEW: access token is fungible-bag style
//     expect(quizAccessS1.quizId).to.equal(quizId)
//     expect(quizAccessS1.amount).to.equal(1n)

//     quizAccessTokenS1 = quizAccessS1
//     entryFeePaymentS1 = entryFeePaymentS1_temp

//     console.log(`✅ Student 1 purchase complete: access->student, payment->teacher`)

//     // Student 2
//     console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

//     const quizAccess2 = await quizAccessHelper.createQuizAccess(quizId)
//     console.log(`📋 Access token minted: ${await quizAccess2._id}`)

//     const mock2 = new PaymentMock(await quiz.entryFee)
//     const { tx: offerTx2 } = await quizAccessSaleHelper.createOfferTx(quizAccess2, mock2)
//     console.log(`📝 Offer tx created (partially signed): ${offerTx2.getId()}`)

//     const studentSaleHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
//     expect(await studentSaleHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

//     const entryFeePayment2 = await student2Computer.new(Payment, [await quiz.entryFee])

//     const s2Script = student2Computer.toScriptPubKey()
//     if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')

//     QuizAccessSaleHelper.finalizeOfferTx(offerTx2, entryFeePayment2, s2Script)

//     await student2Computer.fund(offerTx2)
//     await student2Computer.sign(offerTx2)
//     const txId2 = await student2Computer.broadcast(offerTx2)
//     await mine(1)

//     const {
//       env: { o: quizAccessS2, p: entryFeePaymentS2_temp },
//     } = (await student2Computer.sync(txId2)) as { env: { o: any; p: any } }

//     expect(quizAccessS2._owners).deep.eq([student2PubKey])
//     expect(entryFeePaymentS2_temp._owners).deep.eq([teacherPubKey])

//     expect(quizAccessS2.quizId).to.equal(quizId)
//     expect(quizAccessS2.amount).to.equal(1n)

//     quizAccessTokenS2 = quizAccessS2
//     entryFeePaymentS2 = entryFeePaymentS2_temp

//     console.log(`✅ Student 2 purchase complete: access->student, payment->teacher`)

//     await updateWalletBalances('afterEntryFees')

//     console.log(`\n✅ SALE OFFER MECHANISM COMPLETED SUCCESSFULLY`)
//     console.log('==============================================')
//   })

//   it('should allow students with access to attempt the quiz', async function () {
//     console.log('\n🎯 QUIZ ATTEMPT PHASE')
//     console.log('====================')

//     console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) attempting quiz first>`)
//     const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)

//     // IMPORTANT: submitAnswer now takes (accessToken, selectedAnswer, correctAnswer, rewardAmount)
//     await attempt1.submitAnswer(quizAccessTokenS1, 1, await quiz.correctAnswer, await quiz.rewardAmount)

//     await quiz.addAttemptedStudent(student1PubKey)
//     const claimed1 = await quiz.claimReward(student1PubKey)

//     console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) attempting quiz second>`)
//     const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
//     await attempt2.submitAnswer(quizAccessTokenS2, 1, await quiz.correctAnswer, await quiz.rewardAmount)

//     await quiz.addAttemptedStudent(student2PubKey)
//     const claimed2 = await quiz.claimReward(student2PubKey)

//     expect(claimed1).to.equal(true)
//     expect(claimed2).to.equal(false)
//     expect(await quiz.isClaimed).to.equal(true)
//     expect(await quiz.claimedBy).to.equal(student1PubKey)

//     // NEW: tokens are "burned" (amount goes to 0n)
//     // Safer to re-sync latest state
//     const s1Latest = await student1Computer.getLatestRev(quizAccessTokenS1._id)
//     const s2Latest = await student2Computer.getLatestRev(quizAccessTokenS2._id)
//     quizAccessTokenS1 = await student1Computer.sync(s1Latest)
//     quizAccessTokenS2 = await student2Computer.sync(s2Latest)

//     expect(await quizAccessTokenS1.amount).to.equal(0n)
//     expect(await quizAccessTokenS2.amount).to.equal(0n)

//     await mine(1)
//     await updateWalletBalances('afterAttempts')

//     const quizResult1: QuizResult = {
//       quizId: quizId,
//       quizTitle: await quiz.title,
//       studentPublicKey: student1PubKey,
//       isCorrect: await attempt1.isCorrect,
//       rewardEarned: await attempt1.rewardEarned,
//       paymentTxId: await payment._id,
//       timestamp: Date.now(),
//     }

//     const quizResult2: QuizResult = {
//       quizId: quizId,
//       quizTitle: await quiz.title,
//       studentPublicKey: student2PubKey,
//       isCorrect: await attempt2.isCorrect,
//       rewardEarned: await attempt2.rewardEarned,
//       timestamp: Date.now(),
//     }

//     await leaderboardHelper.recordQuizResult(quizResult1)
//     await leaderboardHelper.recordQuizResult(quizResult2)
//   })

//   it('should transfer payment to winner', async function () {
//     await payment.transfer(student1PubKey)
//     const owners = await payment._owners
//     expect(owners[0]).to.equal(student1PubKey)

//     await mine(1)
//     await updateWalletBalances('afterTransfer')
//   })

//   it('should allow winner to withdraw payment', async function () {
//     await mine(1)

//     const student1PaymentHelper = new PaymentHelper(student1Computer)
//     const withdrawnAmount = await student1PaymentHelper.withdrawPayment(payment)
//     expect(withdrawnAmount).to.equal(999454n)

//     await mine(1)
//     await updateWalletBalances('afterWithdrawal')
//   })

//   it('should verify teacher received entry fees', async function () {
//     const owners1 = await entryFeePaymentS1._owners
//     const owners2 = await entryFeePaymentS2._owners

//     expect(owners1).deep.eq([teacherPubKey])
//     expect(owners2).deep.eq([teacherPubKey])

//     const totalEntryFees = (await entryFeePaymentS1._satoshis) + (await entryFeePaymentS2._satoshis)
//     console.log(`\n💰 Total entry fees collected: ${totalEntryFees} sats`)

//     const teacherBalance = await teacherComputer.getBalance()
//     const teacherBalanceNum = Number(teacherBalance.confirmed || teacherBalance.balance)
//     expect(teacherBalanceNum).to.be.greaterThan(100000000)
//   })

//   it('should verify leaderboard shows correct rewards and payment ownership', async function () {
//     expect(await quiz.isClaimed).to.equal(true)
//     expect(await quiz.claimedBy).to.equal(student1PubKey)

//     const finalOwners = await payment._owners
//     expect(finalOwners[0]).to.equal(student1PubKey)

//     console.log('\n📈 LEADERBOARD:')
//     const leaderboard = leaderboardHelper.getLeaderboard()
//     if (leaderboard.length > 0) {
//       leaderboard.forEach((student, index) => {
//         console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
//       })
//     }
//   })
// })



import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import dotenv from 'dotenv'
import path from 'path'

import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { Payment, PaymentMock } from '../src/payment.js'
import { QuizAccess } from '../src/quiz-access.js'
import { QuizAccessHelper, QuizAccessSaleHelper } from '../src/index.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'
import { MineBlocks } from '../src/utils/mineblock.js'

// Load env like other monorepo tests
const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  path.resolve(process.cwd(), './.env'),
  '../node/.env',
]
for (const envPath of envPaths) dotenv.config({ path: envPath })

describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
  this.timeout(300000)

  // Use BCN_* (same convention as the standard tests)
  const chain = process.env.BCN_CHAIN || 'LTC'
  const network = process.env.BCN_NETWORK || 'regtest'
  const url = process.env.BCN_URL || 'http://localhost:1031'
  const basePath = process.env.BCN_BASE_PATH || `m/44'/2'/0'/0`

  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer

  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let attempt1Helper: AttemptHelper
  let attempt2Helper: AttemptHelper
  let paymentHelper: PaymentHelper
  let leaderboardHelper: LeaderboardHelper

  let teacher!: Teacher
  let student1!: Student
  let student2!: Student

  let quiz!: Quiz
  let payment!: Payment
  let quizId!: string

  let teacherPubKey!: string
  let student1PubKey!: string
  let student2PubKey!: string

  let quizAccessHelper!: QuizAccessHelper
  let quizAccessSaleHelper!: QuizAccessSaleHelper

  let entryFeePaymentS1!: Payment
  let entryFeePaymentS2!: Payment

  // typed (no any)
  let quizAccessTokenS1!: QuizAccess
  let quizAccessTokenS2!: QuizAccess

  const walletBalances = {
    teacher: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
    student1: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
    student2: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
  }

  async function updateWalletBalances(stage: keyof typeof walletBalances.teacher) {
    const teacherBal = await teacherComputer.getBalance()
    const student1Bal = await student1Computer.getBalance()
    const student2Bal = await student2Computer.getBalance()

    walletBalances.teacher[stage] = Number(teacherBal.confirmed || teacherBal.balance)
    walletBalances.student1[stage] = Number(student1Bal.confirmed || student1Bal.balance)
    walletBalances.student2[stage] = Number(student2Bal.confirmed || student2Bal.balance)
  }

  const mine = async (blocks = 1) => {
    if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
  }

  before(async function () {
    // quick sanity log (helps confirm env is actually loaded)
    console.log('ENV:', { url, chain, network, basePath })

    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
    student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    if (network === 'regtest') {
      await teacherComputer.faucet(2e8)
      await student1Computer.faucet(2e8)
      await student2Computer.faucet(2e8)
      await updateWalletBalances('initial')
      await mine(1)
    }

    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    attempt1Helper = new AttemptHelper(student1Computer)
    attempt2Helper = new AttemptHelper(student2Computer)
    paymentHelper = new PaymentHelper(teacherComputer)
    leaderboardHelper = new LeaderboardHelper(teacherComputer)

    quizAccessHelper = new QuizAccessHelper(teacherComputer)
    await quizAccessHelper.deploy()
    await mine(1)

    quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
    await quizAccessSaleHelper.deploy()
    await mine(1)

    await paymentHelper.deploy()
    await mine(1)

    await updateWalletBalances('afterSetup')
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')

    await mine(1)
  })

  it('should create quiz with payment', async function () {
    const quizData = {
      title: 'Math Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      entryFee: 50000n,
      teacher: teacher,
    }

    const quizResult = await teacherHelper.createQuiz(quizData)
    quiz = quizResult.quiz
    quizId = await quiz._id

    const paymentTxId = quizResult.paymentTxId
    payment = (await teacherComputer.sync(paymentTxId)) as Payment

    expect(await quiz.title).to.equal('Math Quiz')
    expect(await payment._satoshis).to.equal(1000000n)
    expect(await quiz.entryFee).to.equal(50000n)

    await mine(1)
    await updateWalletBalances('afterQuizCreation')
  })

  it('should allow students to purchase access to the quiz (SALE OFFERS)', async function () {
    console.log('\n🧾 SALE OFFER MECHANISM INITIATED')
    console.log('==================================')

    // ---------- Student 1 ----------
    console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

    // teacher mints access token bag (teacher owns it initially)
    const access1 = await quizAccessHelper.createQuizAccess(quizId, 1n)

    // metadata asserts (like fungible token test)
    expect(access1._id).to.be.a('string')
    expect(access1._rev).to.be.a('string')
    expect(access1._root).to.be.a('string')
    expect(access1._owners).deep.equal([teacherPubKey])
    expect(access1.quizId).to.equal(quizId)
    expect(access1.amount).to.equal(1n)

    const access1RevBefore = access1._rev

    const mock1 = new PaymentMock(await quiz.entryFee)
    const { tx: offerTx1 } = await quizAccessSaleHelper.createOfferTx(access1, mock1)

    console.log("swap objects in offerTx1.env:", offerTx1.env)
    console.log('\n--- OFFER TX (teacher created, before finalize) ---')
    console.log('txid:', offerTx1.getId())
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)
    console.log('out0 value (price):', offerTx1.outs[0].value)
    console.log('out1 value (min dust):', offerTx1.outs[1].value)

    // Offer tx shape asserts (like sale.test.ts)
    expect(offerTx1.ins).to.have.lengthOf(2)
    expect(offerTx1.ins[0].script.length).to.be.greaterThan(0) // signed by teacher
    expect(offerTx1.ins[1].script.length).to.equal(0) // unsigned (student will provide)
    expect(BigInt(offerTx1.outs[0].value)).to.equal(await quiz.entryFee)
    expect(offerTx1.outs[1].value).to.be.greaterThan(0)

    // student validates teacher offer
    const studentSaleHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
    expect(await studentSaleHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

    // student creates real payment
    const entryPay1 = await student1Computer.new(Payment, [await quiz.entryFee])
    expect(entryPay1._owners).deep.equal([student1PubKey])
    expect(entryPay1._satoshis).to.equal(await quiz.entryFee)

    const s1Script = student1Computer.toScriptPubKey()
    if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')

    QuizAccessSaleHelper.finalizeOfferTx(offerTx1, entryPay1, s1Script)

    console.log('\n--- OFFER TX (after finalize, before fund/sign/broadcast) ---')
    console.log('txid:', offerTx1.getId())
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)

    await student1Computer.fund(offerTx1)

    console.log('\n--- OFFER TX (after FUND, before SIGN) ---')
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)

    await student1Computer.sign(offerTx1)

    console.log('\n--- OFFER TX (after SIGN, before BROADCAST) ---')
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)

    const txId1 = await student1Computer.broadcast(offerTx1)
    await mine(1)

    console.log('\n--- BROADCASTED TX ---')
    console.log('txId:', txId1)

    // sync result
    const synced1 = (await student1Computer.sync(txId1)) as unknown as { env: { o: QuizAccess; p: Payment } }
    console.log('\n--- SYNCED TX ENV ---')
    console.log(synced1.env)
    const quizAccessS1 = synced1.env.o
    const entryFeePaymentS1Temp = synced1.env.p

    // ownership swaps
    expect(quizAccessS1._owners).deep.eq([student1PubKey])
    expect(entryFeePaymentS1Temp._owners).deep.eq([teacherPubKey])

    // access token still amount 1 (not used yet)
    expect(quizAccessS1.quizId).to.equal(quizId)
    expect(quizAccessS1.amount).to.equal(1n)

    // rev changed because state changed (owner changed)
    expect(quizAccessS1._rev).to.be.a('string')
    expect(quizAccessS1._rev).to.not.equal(access1RevBefore)

    quizAccessTokenS1 = quizAccessS1
    entryFeePaymentS1 = entryFeePaymentS1Temp

    console.log(`✅ Student 1 purchase complete: access->student, payment->teacher`)

    // ---------- Student 2 ----------
    console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

    const access2 = await quizAccessHelper.createQuizAccess(quizId, 1n)
    expect(access2._owners).deep.equal([teacherPubKey])
    expect(access2.amount).to.equal(1n)

    const mock2 = new PaymentMock(await quiz.entryFee)
    const { tx: offerTx2 } = await quizAccessSaleHelper.createOfferTx(access2, mock2)

    // offer shape asserts
    expect(offerTx2.ins).to.have.lengthOf(2)
    expect(offerTx2.ins[0].script.length).to.be.greaterThan(0)
    expect(offerTx2.ins[1].script.length).to.equal(0)

    const studentSaleHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
    expect(await studentSaleHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

    const entryPay2 = await student2Computer.new(Payment, [await quiz.entryFee])
    expect(entryPay2._owners).deep.equal([student2PubKey])
    expect(entryPay2._satoshis).to.equal(await quiz.entryFee)

    const s2Script = student2Computer.toScriptPubKey()
    if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')

    QuizAccessSaleHelper.finalizeOfferTx(offerTx2, entryPay2, s2Script)

    await student2Computer.fund(offerTx2)
    await student2Computer.sign(offerTx2)
    const txId2 = await student2Computer.broadcast(offerTx2)
    await mine(1)

    const synced2 = (await student2Computer.sync(txId2)) as unknown as { env: { o: QuizAccess; p: Payment } }
    const quizAccessS2 = synced2.env.o
    const entryFeePaymentS2Temp = synced2.env.p

    expect(quizAccessS2._owners).deep.eq([student2PubKey])
    expect(entryFeePaymentS2Temp._owners).deep.eq([teacherPubKey])
    expect(quizAccessS2.quizId).to.equal(quizId)
    expect(quizAccessS2.amount).to.equal(1n)

    quizAccessTokenS2 = quizAccessS2
    entryFeePaymentS2 = entryFeePaymentS2Temp

    await updateWalletBalances('afterEntryFees')

    console.log(`\n✅ SALE OFFER MECHANISM COMPLETED SUCCESSFULLY`)
    console.log('==============================================')
  })

  it('should allow students with access to attempt the quiz', async function () {
    console.log('\n🎯 QUIZ ATTEMPT PHASE')
    console.log('====================')

    const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
    await attempt1.submitAnswer(quizAccessTokenS1, 1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student1PubKey)
    const claimed1 = await quiz.claimReward(student1PubKey)

    const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
    await attempt2.submitAnswer(quizAccessTokenS2, 1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student2PubKey)
    const claimed2 = await quiz.claimReward(student2PubKey)

    expect(claimed1).to.equal(true)
    expect(claimed2).to.equal(false)
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    // Re-sync latest tokens to verify burn (amount -> 0n)
    const s1Latest = await student1Computer.getLatestRev(quizAccessTokenS1._id)
    const s2Latest = await student2Computer.getLatestRev(quizAccessTokenS2._id)

    quizAccessTokenS1 = (await student1Computer.sync(s1Latest)) as QuizAccess
    quizAccessTokenS2 = (await student2Computer.sync(s2Latest)) as QuizAccess

    expect(quizAccessTokenS1.amount).to.equal(0n)
    expect(quizAccessTokenS2.amount).to.equal(0n)

    await mine(1)
    await updateWalletBalances('afterAttempts')

    const quizResult1: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student1PubKey,
      isCorrect: await attempt1.isCorrect,
      rewardEarned: await attempt1.rewardEarned,
      paymentTxId: await payment._id,
      timestamp: Date.now(),
    }

    const quizResult2: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student2PubKey,
      isCorrect: await attempt2.isCorrect,
      rewardEarned: await attempt2.rewardEarned,
      timestamp: Date.now(),
    }

    await leaderboardHelper.recordQuizResult(quizResult1)
    await leaderboardHelper.recordQuizResult(quizResult2)
  })

  it('should transfer payment to winner', async function () {
    await payment.transfer(student1PubKey)
    const owners = await payment._owners
    expect(owners[0]).to.equal(student1PubKey)

    await mine(1)
    await updateWalletBalances('afterTransfer')
  })

  it('should allow winner to withdraw payment', async function () {
    await mine(1)

    const student1PaymentHelper = new PaymentHelper(student1Computer)
    const withdrawnAmount = await student1PaymentHelper.withdrawPayment(payment)
    expect(withdrawnAmount).to.equal(999454n)

    await mine(1)
    await updateWalletBalances('afterWithdrawal')
  })

  it('should verify teacher received entry fees', async function () {
    const owners1 = await entryFeePaymentS1._owners
    const owners2 = await entryFeePaymentS2._owners

    expect(owners1).deep.eq([teacherPubKey])
    expect(owners2).deep.eq([teacherPubKey])

    const totalEntryFees = (await entryFeePaymentS1._satoshis) + (await entryFeePaymentS2._satoshis)
    console.log(`\n💰 Total entry fees collected: ${totalEntryFees} sats`)

    const teacherBalance = await teacherComputer.getBalance()
    const teacherBalanceNum = Number(teacherBalance.confirmed || teacherBalance.balance)
    expect(teacherBalanceNum).to.be.greaterThan(100000000)
  })

  it('should verify leaderboard shows correct rewards and payment ownership', async function () {
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    const finalOwners = await payment._owners
    expect(finalOwners[0]).to.equal(student1PubKey)

    console.log('\n📈 LEADERBOARD:')
    const leaderboard = leaderboardHelper.getLeaderboard()
    if (leaderboard.length > 0) {
      leaderboard.forEach((student, index) => {
        console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
      })
    }
  })
})
```

# test\payment.test.ts

```ts
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Payment } from '../src/index.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

describe('Payment', () => {
  const alice = new Computer({ url, chain, network })

  before('Before', async () => {
    await alice.faucet(4e8)
  })

  describe('Alice creates payment', () => {
    let paymentTxId: string
    let paymentHelper: PaymentHelper

    before('Before creating a payment', async () => {
      paymentHelper = new PaymentHelper(alice)
    })

    it('Alice deploys the payment contract', async () => {
      await paymentHelper.deploy()
    })

    it('Alice creates an payment transaction and broadcast it', async () => {
      const paymentTx = await paymentHelper.createPaymentTx(BigInt(2e8)) as any

      paymentTxId = await alice.broadcast(paymentTx)

      const payment: Payment = await paymentHelper.getPayment(paymentTxId)
      expect(payment._satoshis).eq(BigInt(2e8))
    })
  })
})

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "moduleDetection": "force"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test/**/*.test.ts", "src/scripts/deploy.ts", "src/helpers/old/**/*"]
}
```

# tsconfig.test.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false,
    "skipLibCheck": true,
    "target": "ES2020",
    "module": "esnext",
    "moduleResolution": "node"
  },
  "include": ["src/**/*", "test/**/*"],
  "exclude": ["node_modules", "dist", "src/scripts/**/*"]
}
```

