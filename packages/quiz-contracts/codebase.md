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

# scripts\deploy.ts

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

const { teacherMod, studentMod, quizMod, attemptMod, paymentMod, quizAccessMod, quizAccessSaleMod } = await deployQuizContracts(computer)
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
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC\x1b[2m=${quizAccessMod}\x1b[0m
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC\x1b[2m=${quizAccessSaleMod}\x1b[0m
`)

console.log("\nRun 'npm run dev' to start the application.\n")
rl.close()
```

# scripts\fund-wallet.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'

config()

const {
  NEXT_PUBLIC_CHAIN: chain,
  NEXT_PUBLIC_NETWORK: network,
  NEXT_PUBLIC_URL: url,
  NEXT_PUBLIC_PATH: path,
  DEPLOYMENT_MNEMONIC: mnemonic
} = process.env

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

async function fundWallet() {
  console.log('Funding wallet...')
  console.log(`Chain: ${chain}`)
  console.log(`Network: ${network}`)
  console.log(`URL: ${url}`)
  console.log(`Address: ${computer.getAddress()}`)

  try {
    // Fund the wallet with 1,000,000 satoshis (10,000,000 might be needed for deployment)
    const amount = 10000000 // 100,000,000 would be 1 LTC
    console.log(`Funding with ${amount} satoshis...`)
    
    // Faucet only works on regtest/testnet
    if (network === 'regtest' || network === 'testnet') {
      const receipt = await computer.faucet(amount)
      console.log('Funding successful!')
      console.log('Transaction ID:', receipt)
    } else {
      console.log('Faucet only available on regtest/testnet networks.')
      console.log('For mainnet, please send funds to:', computer.getAddress())
    }

    const { balance } = await computer.getBalance()
    console.log(`New balance: ${balance} satoshis`)
  } catch (error) {
    console.error('Error funding wallet:', error)
    throw error
  }
}

fundWallet().catch(console.error)
```

# scripts\lib.ts

```ts
import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { QuizAttempt } from '../src/attempt.js'
import { Payment, Withdraw } from '../src/payment.js'
import { QuizAccess } from '../src/quiz-access.js'
import { QuizAccessSale } from '../src/quiz-access-sale.js'

export async function deployQuizContracts(computer: Computer): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
  quizAccessMod: string
  quizAccessSaleMod: string
}> {
  // Deploy all contracts at once
  const teacherMod = await computer.deploy(`export ${Teacher}`)
  const studentMod = await computer.deploy(`export ${Student}`)
  const quizMod = await computer.deploy(`export ${Quiz}`)
  const attemptMod = await computer.deploy(`export ${QuizAttempt}`)
  const paymentMod = await computer.deploy(`export ${Payment}; export ${Withdraw}`)
  const quizAccessMod = await computer.deploy(`export ${QuizAccess}`)
  const quizAccessSaleMod = await computer.deploy(`export ${QuizAccessSale}`)

  return {
    teacherMod,
    studentMod,
    quizMod,
    attemptMod,
    paymentMod,
    quizAccessMod,
    quizAccessSaleMod
  }
}
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

export interface IQuizAccess {
  deploy(): Promise<string>
  mint(publicKey: string, quizId: string, amount: bigint, symbol: string): Promise<QuizAccess>
  balanceOf(publicKey: string, quizId: string): Promise<bigint>
  transfer(to: string, amount: bigint, quizId: string): Promise<void>
}

type MaybeQuizAccess = {
  quizId?: unknown
  amount?: unknown
  _owners?: unknown
}

export class QuizAccessHelper implements IQuizAccess {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${QuizAccess}`)
    return this.mod
  }

  async mint(publicKey: string, quizId: string, amount: bigint = 1n, symbol: string = 'QACC'): Promise<QuizAccess> {
    if (!this.mod) throw new Error('QuizAccessHelper not deployed')
    const token = await this.computer.new(QuizAccess, [publicKey, quizId, amount, symbol], this.mod)
    return token as unknown as QuizAccess
  }

  async createQuizAccess(quizId: string, amount: bigint = 1n): Promise<QuizAccess> {
    return this.mint(this.computer.getPublicKey(), quizId, amount, 'QACC')
  }

  private isQuizAccess(x: unknown): x is QuizAccess {
    if (!x || typeof x !== 'object') return false
    const o = x as MaybeQuizAccess
    return typeof o.quizId === 'string' && typeof o.amount === 'bigint' && Array.isArray(o._owners)
  }

  private async getBags(publicKey: string, quizId: string): Promise<QuizAccess[]> {
    // With getUtxos() we can only see this Computer's wallet UTXOs.
    // So enforce that caller matches this wallet.
    if (publicKey !== this.computer.getPublicKey()) {
      throw new Error('balanceOf/transfer require a QuizAccessHelper created with the same wallet as publicKey')
    }

    const revs: string[] = await this.computer.getUtxos()
    const objs: unknown[] = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))

    const bags = objs.filter((obj: unknown) => this.isQuizAccess(obj) && obj.quizId === quizId) as QuizAccess[]
    return bags
  }

  async balanceOf(publicKey: string, quizId: string): Promise<bigint> {
    const bags = await this.getBags(publicKey, quizId)
    return bags.reduce((sum: bigint, bag: QuizAccess) => sum + bag.amount, 0n)
  }

  async transfer(to: string, amount: bigint, quizId: string): Promise<void> {
    const owner = this.computer.getPublicKey()
    const bags = await this.getBags(owner, quizId)

    let remaining = amount
    while (remaining > 0n && bags.length > 0) {
      const bag = bags.shift()
      if (!bag) break
      const available = remaining < bag.amount ? remaining : bag.amount
      bag.transfer(to, available)
      remaining -= available
    }

    if (remaining > 0n) throw new Error('Could not send entire amount')
  }
}
```

# src\helpers\quiz-access-sale-helper.ts

```ts
import { Buffer } from 'buffer'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { QuizAccessSale } from '../quiz-access-sale.js'
import { Payment, PaymentMock } from '../payment.js'
import { QuizAccess } from '../quiz-access.js'

const sighashType = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

type DecodeResult = {
  exp: string
  env: Record<string, string>
  mod: string
}

type EncodeResult = {
  tx: TransactionType
  effect: {
    res?: unknown
    env: Record<string, unknown>
  }
}

export class QuizAccessSaleHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${QuizAccessSale}`)
    return this.mod
  }

  createOfferTx(access: QuizAccess, payment: PaymentMock): Promise<EncodeResult> {
    if (!this.mod) throw new Error('QuizAccessSaleHelper not deployed')
    return this.computer.encode({
      exp: `QuizAccessSale.exec(o, p)`,
      env: { o: access._rev, p: payment._rev },
      mocks: { p: payment },
      sighashType,
      inputIndex: 0,
      fund: false,
      mod: this.mod,
    }) as unknown as Promise<EncodeResult>
  }

  async checkOfferTx(tx: TransactionType): Promise<bigint> {
    const decoded = (await this.computer.decode(tx)) as unknown as DecodeResult
    const { exp, env, mod } = decoded

    if (exp !== 'QuizAccessSale.exec(o, p)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    const price = BigInt(tx.outs[0].value)
    const pMock = new PaymentMock(price)
    env.p = pMock._rev

    const reencoded = (await this.computer.encode({
      exp,
      env, // ✅ now Record<string,string>
      mod,
      mocks: { p: pMock },
      fund: false,
      sign: false,
      sighashType,
    })) as unknown as EncodeResult

    if (reencoded.effect.res === undefined) throw new Error('Unexpected result')
    return price
  }

  static finalizeOfferTx(tx: TransactionType, payment: Payment, scriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)
    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey })
    return tx
  }
}
```

# src\helpers\quiz-helper.ts

```ts
import { Computer } from '@bitcoin-computer/lib'

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
  async getQuiz(quizId: string): Promise<any> {
    return await this.computer.sync(quizId)
  }

  /**
   * Check if a quiz is currently active
   */
  async isQuizActive(quizId: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.isActive
  }

  /**
   * Check if the reward for a quiz has been claimed
   */
  async isRewardClaimed(quizId: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.isClaimed
  }

  /**
   * Get the public key of the student who claimed the reward
   */
  async getRewardClaimedBy(quizId: string): Promise<string> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.claimedBy
  }

  /**
   * Check if a student has already attempted a quiz
   */
  async hasStudentAttempted(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.hasStudentAttempted ? quiz.hasStudentAttempted(studentPublicKey) : false
  }

  /**
   * Check if a student can attempt a quiz
   * Returns true if:
   * - Quiz is active
   * - Student has not already attempted
   */
  async canStudentAttemptQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.canStudentAttempt ? quiz.canStudentAttempt(studentPublicKey) : false
  }

  /**
   * Get the number of students who have attempted a quiz
   */
  async getAttemptCount(quizId: string): Promise<number> {
    const quiz: any = await this.getQuiz(quizId)
    const attemptedStudents = quiz.attemptedStudents || []
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
    entryFee: bigint
    isActive: boolean
    isClaimed: boolean
    claimedBy: string
    attemptCount: number
    attemptedStudents: string[]
    paymentTxId: string
  }> {
    const quiz: any = await this.getQuiz(quizId)

    return {
      title: quiz.title,
      questionText: quiz.questionText,
      options: quiz.options,
      rewardAmount: quiz.rewardAmount,
      entryFee: quiz.entryFee,
      isActive: quiz.isActive,
      isClaimed: quiz.isClaimed,
      claimedBy: quiz.claimedBy,
      attemptCount: (quiz.attemptedStudents || []).length,
      attemptedStudents: quiz.attemptedStudents || [],
      paymentTxId: quiz.paymentTxId
    }
  }

  /**
   * Deactivate a quiz (typically called by teacher)
   */
  async deactivateQuiz(quizId: string): Promise<void> {
    const quiz: any = await this.getQuiz(quizId)
    if (quiz.deactivate) {
      await quiz.deactivate()
    }
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  /**
   * Validate if an answer index is valid (0-3)
   */
  isValidAnswerIndex(answerIndex: number): boolean {
    return answerIndex >= 0 && answerIndex <= 3
  }

  /**
   * Get quizzes by teacher public key
   */
  async getQuizzesByTeacher(teacherPublicKey: string): Promise<any[]> {
    // Query for Quiz objects owned by the teacher using the deployed module spec
    const revs = await this.computer.query({
      publicKey: teacherPublicKey,
      mod: process.env.NEXT_PUBLIC_QUIZ_MOD
    })
    
    const quizzes = await Promise.all(
      revs.map(async (rev: string) => {
        const quiz = await this.computer.sync(rev)
        return quiz
      })
    )
    
    return quizzes
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
  selectedAnswer: number
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

  return { isCorrect, rewardEarned, selectedAnswer }
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
    const teacher = (await this.computer.new(Teacher, [name, publicKey])) as unknown as Teacher
    await new Promise((r) => setTimeout(r, 3000))
    return teacher
  }

  async getTeacher(teacherId: string): Promise<Teacher> {
    return (await this.computer.sync(teacherId)) as unknown as Teacher
  }

  // 1) create reward payment only
  async createRewardPayment(rewardAmount: bigint): Promise<Payment> {
    return await this.paymentHelper.createPayment(rewardAmount)
  }

  // 2) create quiz only (must pass paymentTxId you created above)
  async createQuizOnly(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
    paymentTxId: string
  }): Promise<any> {
    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    const teacherPubKey = await params.teacher.publicKey
    const quiz = await this.computer.new(Quiz, [
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
    ], process.env.NEXT_PUBLIC_QUIZ_MOD)

    await new Promise((r) => setTimeout(r, 3000))

    const updatedTeacher = await this.getTeacher(await params.teacher._id)
    await updatedTeacher.addQuiz(await quiz._id)

    await new Promise((r) => setTimeout(r, 3000))
    return quiz
  }

  // NEW: Combined method to create quiz with payment
  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<{ quiz: Quiz, paymentTxId: string }> {
    // First create the reward payment
    const payment = await this.createRewardPayment(params.rewardAmount)
    const paymentTxId = await payment._id

    // Then create the quiz with the payment ID using the deployed module spec
    const quiz = await this.computer.new(Quiz, [{
      title: params.title,
      questionText: params.questionText,
      options: params.options,
      correctAnswer: params.correctAnswer,
      rewardAmount: params.rewardAmount,
      entryFee: params.entryFee,
      teacherPublicKey: await params.teacher.publicKey,
      paymentTxId
    }], process.env.NEXT_PUBLIC_QUIZ_MOD)

    return { quiz, paymentTxId }
  }

  async getQuiz(quizId: string): Promise<any> {
    return await this.computer.sync(quizId)
  }

  /**
   * Get quizzes created by this teacher
   */
  async getQuizzesByTeacher(teacherId: string): Promise<any[]> {
    const teacher = await this.getTeacher(teacherId)
    const teacherPubKey = await teacher.publicKey
    
    // Get all Quiz objects owned by this teacher using the deployed module spec
    const revs = await this.computer.query({
      publicKey: teacherPubKey,
      mod: process.env.NEXT_PUBLIC_QUIZ_MOD
    })
    
    const quizzes = await Promise.all(
      revs.map(async (rev: string) => {
        const quiz = await this.computer.sync(rev)
        return quiz
      })
    )
    
    return quizzes
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
export { QuizHelper } from './helpers/quiz-helper.js'
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

type Constructor<T> = new (...args: unknown[]) => T

/**
 * Fungible Quiz Access Token (UTXO bag model)
 *
 * - quizId: which quiz this access is for
 * - amount: number of attempts allowed (usually 1n)
 * - burn(1n): consumes one attempt
 */
export class QuizAccess extends Contract {
  quizId!: string
  amount!: bigint
  symbol!: string
  _owners!: string[]

  constructor(to: string, quizId: string, amount: bigint = 1n, symbol: string = 'QACC') {
    super({ _owners: [to], quizId, amount, symbol })
  }

  /**
   * Transfer ownership:
   * - transfer(to): sends whole bag
   * - transfer(to, amount): splits `amount` into a NEW bag owned by `to`
   */
  transfer(to: string, amount?: bigint): QuizAccess | undefined {
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return undefined
    }

    if (amount <= 0n) throw new Error('Amount must be positive')
    if (amount > this.amount) throw new Error('Insufficient access balance')

    this.amount -= amount
    const ctor = this.constructor as unknown as Constructor<this>
    return new ctor(to, this.quizId, amount, this.symbol) as unknown as QuizAccess
  }

  /**
   * Burn access units from this bag.
   * Default: burn all remaining units.
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

const { teacherMod, studentMod, quizMod, attemptMod, paymentMod, quizAccessMod, quizAccessSaleMod } = await deployQuizContracts(computer)
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
NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC\x1b[2m=${quizAccessMod}\x1b[0m
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC\x1b[2m=${quizAccessSaleMod}\x1b[0m
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
import { QuizAccess } from '../quiz-access.js'
import { QuizAccessSale } from '../quiz-access-sale.js'

export async function deployQuizContracts(computer: Computer): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
  quizAccessMod: string
  quizAccessSaleMod: string
}> {
  // Deploy all contracts at once
  const teacherMod = await computer.deploy(`export ${Teacher}`)
  const studentMod = await computer.deploy(`export ${Student}`)
  const quizMod = await computer.deploy(`export ${Quiz}`)
  const attemptMod = await computer.deploy(`export ${QuizAttempt}`)
  const paymentMod = await computer.deploy(`export ${Payment}; export ${Withdraw}`)
  const quizAccessMod = await computer.deploy(`export ${QuizAccess}`)
  const quizAccessSaleMod = await computer.deploy(`export ${QuizAccessSale}`)

  return {
    teacherMod,
    studentMod,
    quizMod,
    attemptMod,
    paymentMod,
    quizAccessMod,
    quizAccessSaleMod
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
  result: {
    result: unknown
    error: unknown
    id: number
  }
}

async function bcnRpc(url: string, chain: string, network: string, method: string, params: string = '') {
  const endpoint = `${url}/v1/${chain}/${network}/rpc`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  })

  const json = (await res.json()) as BcnRpcEnvelope
  if (!res.ok || json.result.error) {
    throw new Error(`RPC ${method} failed: ${JSON.stringify(json.result.error ?? json)}`)
  }
  return json.result.result
}

export class MineBlocks {
  /**
   * Mines blocks to a node-wallet address (NOT your Computer wallet),
   * so it confirms txs without creating immature coinbase UTXOs in your test wallet.
   */
  static async mine(url: string, chain: string, network: string, blocks: number = 1) {
    const addr = (await bcnRpc(url, chain, network, 'getnewaddress', 'mining legacy')) as string
    await bcnRpc(url, chain, network, 'generatetoaddress', `${blocks} ${addr}`)
    await new Promise((r) => setTimeout(r, 300))
  }
}
```

# test\complete-quiz-access-sale.test.ts

```ts
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
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

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'),
  '../node/.env',
]
for (const envPath of envPaths) dotenv.config({ path: envPath })

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

if (!url || !chain || !network) {
  throw new Error('Missing BCN_URL / BCN_CHAIN / BCN_NETWORK in env')
}

const basePath = process.env.BCN_BASE_PATH || `m/44'/2'/0'/0`

type SaleSync = { env: { o: QuizAccess; p: Payment } }

describe('Comprehensive Quiz with Leaderboard (Sale offers for access, Fungible tokens)', function () {
  this.timeout(300000)

  let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let attempt1Helper: AttemptHelper
  let attempt2Helper: AttemptHelper
  let paymentHelper: PaymentHelper
  let leaderboardHelper: LeaderboardHelper

  let teacher: Teacher, student1: Student, student2: Student
  let quiz: Quiz
  let rewardPayment: Payment
  let quizId: string

  let teacherPubKey: string, student1PubKey: string, student2PubKey: string

  let quizAccessHelper: QuizAccessHelper
  let quizAccessSaleHelper: QuizAccessSaleHelper

  let entryFeePaymentS1: Payment
  let entryFeePaymentS2: Payment

  let quizAccessTokenS1: QuizAccess
  let quizAccessTokenS2: QuizAccess

  const mine = async (blocks: number = 1) => {
    if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
  }

  const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

  const syncOrMine = async <T>(computer: Computer, id: string): Promise<T> => {
    try {
      return (await computer.sync(id)) as unknown as T
    } catch {
      await mine(1)
      return (await computer.sync(id)) as unknown as T
    }
  }

  before(async function () {
    teacherComputer = new Computer({ url, chain, network, path: `${basePath}/0` })
    student1Computer = new Computer({ url, chain, network, path: `${basePath}/1` })
    student2Computer = new Computer({ url, chain, network, path: `${basePath}/2` })

    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    if (network === 'regtest') {
      await teacherComputer.faucet(2e8)
      await student1Computer.faucet(2e8)
      await student2Computer.faucet(2e8)
      await sleep(500)
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

    quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
    await quizAccessSaleHelper.deploy()

    await paymentHelper.deploy()
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')
  })

  it('should create reward payment then quiz (separate steps)', async function () {
    const quizData = {
      title: 'Math Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      entryFee: 100000000n,
      teacher,
    }

    // STEP A: reward payment
    rewardPayment = await teacherHelper.createRewardPayment(quizData.rewardAmount)
    const paymentTxId = await rewardPayment._id

    expect(await rewardPayment._satoshis).to.equal(1000000n)
    expect(await rewardPayment._owners).deep.eq([teacherPubKey])

    // STEP B: quiz creation referencing paymentTxId
    quiz = await teacherHelper.createQuizOnly({
      ...quizData,
      paymentTxId,
    })

    quizId = await quiz._id

    expect(await quiz.title).to.equal('Math Quiz')
    expect(await quiz.entryFee).to.equal(100000000n)
    expect(await quiz.paymentTxId).to.equal(paymentTxId)
  })

  it('should allow students to purchase access (SALE OFFERS) using fungible access token', async function () {
    console.log('\n🧾 SALE OFFER MECHANISM (FUNGIBLE ACCESS TOKENS)')
    console.log('===============================================')

    // ---------- Student 1 ----------
    console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

    // Teacher mints a 1-unit access token to themselves
    const access1 = await quizAccessHelper.createQuizAccess(quizId, 1n)
    const teacherBalanceBefore = await teacherComputer.db.wallet.getBalance() // sync before broadcast to avoid mempool conflict
    
    console.log('😊Teacher balance before offer broadcast:', teacherBalanceBefore)
    expect(access1._owners).deep.eq([teacherPubKey])
    expect(access1.quizId).to.equal(quizId)
    expect(access1.amount).to.equal(1n)

    console.log('Teacher minted access token:', {
      id: access1._id,
      rev: access1._rev,
      quizId: access1.quizId,
      amount: access1.amount.toString(),
      owner: access1._owners[0].slice(0, 10) + '...',
    })

    // Teacher builds offer using PaymentMock(entryFee)
    const mock1 = new PaymentMock(await quiz.entryFee)
    const offer1 = await quizAccessSaleHelper.createOfferTx(access1, mock1)
    const offerTx1 = offer1.tx

    // Offer tx shape checks (partial signature)
    expect(offerTx1.ins).to.have.lengthOf(2)
    expect(offerTx1.ins[0].script.length).to.be.greaterThan(0)
    expect(offerTx1.ins[1].script.length).to.equal(0)
    expect(BigInt(offerTx1.outs[0].value)).to.equal(await quiz.entryFee)
    expect(BigInt(offerTx1.outs[1].value)).to.be.greaterThan(0)

    console.log('Offer tx (teacher created, before student finalizes):', {
      id: offerTx1.getId(),
      out0Value: offerTx1.outs[0].value,
      out1Value: offerTx1.outs[1].value,
    })

    // Student checks offer
    const sHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
    expect(await sHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

    // Student creates real payment + finalizes + signs + broadcasts
    const pay1 = await student1Computer.new(Payment, [await quiz.entryFee])
    const s1Script = student1Computer.toScriptPubKey()
    if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')
    QuizAccessSaleHelper.finalizeOfferTx(offerTx1, pay1, s1Script)

    await student1Computer.fund(offerTx1)
    await student1Computer.sign(offerTx1)
    await sleep(1000) // avoid mempool conflicts
    
    const txId1 = await student1Computer.broadcast(offerTx1)
    await sleep(5000)
    

    const synced1 = await syncOrMine<SaleSync>(student1Computer, txId1)
    quizAccessTokenS1 = synced1.env.o
    entryFeePaymentS1 = synced1.env.p
    const teacherBalanceAfter = await teacherComputer.db.wallet.getBalance() // sync before balance check to avoid mempool conflict
    console.log("❤️balance after broadcast:", teacherBalanceAfter)

    expect(quizAccessTokenS1._owners).deep.eq([student1PubKey])
    expect(entryFeePaymentS1._owners).deep.eq([teacherPubKey])
    expect(quizAccessTokenS1.amount).to.equal(1n)

    console.log('After broadcast (Student 1):', {
      accessOwner: quizAccessTokenS1._owners[0].slice(0, 10) + '...',
      accessAmount: quizAccessTokenS1.amount.toString(),
      paymentOwner: entryFeePaymentS1._owners[0].slice(0, 10) + '...',
      paymentSats: entryFeePaymentS1._satoshis.toString(),
    })

    // ---------- Student 2 ----------
    console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

    const access2 = await quizAccessHelper.createQuizAccess(quizId, 1n)
    expect(access2._owners).deep.eq([teacherPubKey])
    expect(access2.quizId).to.equal(quizId)
    expect(access2.amount).to.equal(1n)

    const mock2 = new PaymentMock(await quiz.entryFee)
    const offer2 = await quizAccessSaleHelper.createOfferTx(access2, mock2)
    const offerTx2 = offer2.tx

    const sHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
    expect(await sHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

    const pay2 = await student2Computer.new(Payment, [await quiz.entryFee])
    const s2Script = student2Computer.toScriptPubKey()
    if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')
    QuizAccessSaleHelper.finalizeOfferTx(offerTx2, pay2, s2Script)

    await student2Computer.fund(offerTx2)
    await student2Computer.sign(offerTx2)
    const txId2 = await student2Computer.broadcast(offerTx2)

    const synced2 = await syncOrMine<SaleSync>(student2Computer, txId2)
    quizAccessTokenS2 = synced2.env.o
    entryFeePaymentS2 = synced2.env.p

    expect(quizAccessTokenS2._owners).deep.eq([student2PubKey])
    expect(entryFeePaymentS2._owners).deep.eq([teacherPubKey])
    expect(quizAccessTokenS2.amount).to.equal(1n)

    console.log('After broadcast (Student 2):', {
      accessOwner: quizAccessTokenS2._owners[0].slice(0, 10) + '...',
      accessAmount: quizAccessTokenS2.amount.toString(),
      paymentOwner: entryFeePaymentS2._owners[0].slice(0, 10) + '...',
      paymentSats: entryFeePaymentS2._satoshis.toString(),
    })
  })

  it('should allow students with access to attempt the quiz (burn access unit)', async function () {
    console.log('\n🎯 QUIZ ATTEMPT PHASE (burn 1 access unit)')
    console.log('=========================================')

    // keep revs so we can prove they changed after burn
    const s1AccessRevBefore = quizAccessTokenS1._rev
    const s2AccessRevBefore = quizAccessTokenS2._rev

    await mine(1) 
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

    // re-sync latest access token revisions and assert amount burned to 0
    const s1LatestRev = await student1Computer.getLatestRev(quizAccessTokenS1._id)
    const s2LatestRev = await student2Computer.getLatestRev(quizAccessTokenS2._id)

    expect(s1LatestRev).to.not.equal(s1AccessRevBefore)
    expect(s2LatestRev).to.not.equal(s2AccessRevBefore)

    quizAccessTokenS1 = (await student1Computer.sync(s1LatestRev)) as unknown as QuizAccess
    quizAccessTokenS2 = (await student2Computer.sync(s2LatestRev)) as unknown as QuizAccess

    expect(quizAccessTokenS1.amount).to.equal(0n)
    expect(quizAccessTokenS2.amount).to.equal(0n)

    console.log('Access burned:', {
      s1Amount: quizAccessTokenS1.amount.toString(),
      s2Amount: quizAccessTokenS2.amount.toString(),
    })

    const quizResult1: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student1PubKey,
      isCorrect: await attempt1.isCorrect,
      rewardEarned: await attempt1.rewardEarned,
      paymentTxId: await rewardPayment._id,
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

  it('should transfer reward payment to winner', async function () {
    await rewardPayment.transfer(student1PubKey)
    expect(await rewardPayment._owners).deep.eq([student1PubKey])
  })

  it('should allow winner to withdraw reward payment (mine only here)', async function () {
    await mine(1) // confirm previous chain to avoid too-long-mempool-chain

    const student1PaymentHelper = new PaymentHelper(student1Computer)
    const withdrawnAmount = await student1PaymentHelper.withdrawPayment(rewardPayment)
    expect(withdrawnAmount).to.equal(999454n)
  })

  
  it('should allow teacher to withdraw entry fees (real withdrawal)', async function () {
    await mine(1) // confirm chain before teacher withdrawals
    console.log('Before w1:', await teacherComputer.getBalance())
const w1 = await paymentHelper.withdrawPayment(entryFeePaymentS1)
console.log('After w1:', await teacherComputer.getBalance())

await mine(1)
console.log('After mine:', await teacherComputer.getBalance())

const w2 = await paymentHelper.withdrawPayment(entryFeePaymentS2)
console.log('After w2:', await teacherComputer.getBalance())

await mine(1)
console.log('After mine 2:', await teacherComputer.getBalance())

    // entryFee 50000n => 50000 - 546 = 49454
    //expect(w1).to.equal(49454n)
    //expect(w2).to.equal(49454n)
    console.log('Teacher withdrew entry fees:', { w1, w2 })
    console.log('Teacher balance:',await teacherComputer.getBalance())
  })

  it('should verify leaderboard and ownerships', async function () {
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    const leaderboard = leaderboardHelper.getLeaderboard()
    expect(leaderboard.length).to.be.greaterThan(0)

    console.log('\n📈 LEADERBOARD:')
    leaderboard.forEach((s, i) => {
      console.log(`${i + 1}. ${s.publicKey.substring(0, 10)}... - ${s.totalRewards} sats`)
    })
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

