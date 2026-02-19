# attempt-helper.ts

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

# leaderboard-helper.ts

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

# payment-helper.ts

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

# quiz-access-helper.ts

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

# quiz-access-sale-helper.ts

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

# quiz-helper.ts

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

# student-helper.ts

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

# teacher-helper.ts

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

