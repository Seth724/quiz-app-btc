/**
 * Browser-Safe Quiz Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { encodeBroadcastWithRetry, withComputerLock } from './txUtils'
import { MineBlocks } from '../utils/mineblock'
import { BrowserAttemptClient } from './BrowserAttemptClient'


const url='http://localhost:9112'
const chain = process.env.NEXT_PUBLIC_BCN_CHAIN || 'regtest'
const network = process.env.NEXT_PUBLIC_BCN_NETWORK || 'regtest'
export interface QuizDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string
  isClaimed: boolean
  claimedBy: string
  attemptedStudents: string[]
  attemptCount: number
  createdAt: number
}

const nowMs = () => {
  if (typeof performance !== 'undefined' && (performance as any).timeOrigin !== undefined) {
    return Math.floor((performance as any).timeOrigin + performance.now())
  }
  return Date.now()
}

export class BrowserQuizClient {
  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    return withComputerLock(this.computer, async () => {
      console.log('🎯 Creating quiz with data:', quizData)

      // STEP 1: Payment
      console.log('📤 Creating payment...')
      const paymentEncoded = await encodeBroadcastWithRetry(
        this.computer,
        {
          exp: `new Payment(${quizData.rewardAmount}n)`,
          mod: MODULE_SPECS.paymentMod,
        },
        { label: 'createPayment', postBroadcastDelayMs: 2500 }
      )

      const payment = paymentEncoded.effect.res
      const paymentTxId = payment._id as string
      console.log('✅ Payment created:', paymentTxId)

      // NEW: wait until BCN can sync the payment object reliably
      await this.computer.sync(paymentTxId)

      // NEW: add extra settle time (regtest indexers often lag)
      await new Promise((r) => setTimeout(r, 2500))

      const mine = async (blocks: number = 1) => {
        if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
      }

      //await mine(2) // ensure payment is well-confirmed in regtest before creating quiz

      // STEP 2: Quiz (after payment is visible to BCN’s UTXO view)
      console.log('📤 Creating quiz...')
      const quizExp = `new Quiz({
        title: ${JSON.stringify(quizData.title)},
        questionText: ${JSON.stringify(quizData.questionText)},
        options: ${JSON.stringify(quizData.options)},
        correctAnswer: ${quizData.correctAnswer},
        rewardAmount: ${quizData.rewardAmount}n,
        entryFee: ${quizData.entryFee}n,
        teacherPublicKey: ${JSON.stringify(this.computer.getPublicKey())},
        paymentTxId: ${JSON.stringify(paymentTxId)}
      })`

      const quizEncoded = await encodeBroadcastWithRetry(
        this.computer,
        { exp: quizExp, mod: MODULE_SPECS.quizMod },
        { label: 'createQuiz', postBroadcastDelayMs: 2500 }
      )

      const quiz = quizEncoded.effect.res
      const quizId = quiz._id as string
      console.log('✅ Quiz created:', quizId)

      const syncedQuiz = await this.computer.sync(quizId)

      const attemptedStudents = (syncedQuiz as any).attemptedStudents || []
      return {
        ...(syncedQuiz as any),
        paymentTxId,
        attemptedStudents,
        attemptCount: attemptedStudents.length,
        createdAt: (syncedQuiz as any).createdAt || nowMs(),
      } as QuizDTO
    })
  }

  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      // Resolve to latest revision so we see updated isClaimed/claimedBy/attemptedStudents
      let revToSync = quizId
      try {
        const latestRev = await this.computer.latest(quizId)
        if (latestRev) revToSync = latestRev
      } catch { /* use original quizId */ }
      const quiz = await this.computer.sync(revToSync)
      const attemptedStudents = (quiz as any).attemptedStudents || []
      const result = {
        ...(quiz as any),
        _id: quizId, // preserve the root _id for routing
        attemptedStudents,
        attemptCount: attemptedStudents.length,
      } as QuizDTO
      return result
    } catch (error) {
      console.error('❌ BrowserQuizClient.getQuiz - FAILED:', (error as any)?.message)
      return null
    }
  }

  /**
   * Check if a student can attempt a quiz.
   * Checks QuizAttempt objects on blockchain (not quiz.attemptedStudents, since
   * only the teacher can update the quiz object).
   */
  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    if (!quiz) return false
    if (!quiz.isActive) return false

    // Check if reward has been claimed (derived from quiz OR from attempts)
    if (quiz.isClaimed) return false

    // Check QuizAttempt objects on-chain for this student+quiz
    const attemptClient = new BrowserAttemptClient(this.computer)
    const hasAttempted = await attemptClient.hasStudentAttemptedQuiz(quizId, studentPublicKey)
    return !hasAttempted
  }

  /**
   * TEACHER ONLY: Process rewards for a quiz.
   * Scans QuizAttempt objects to find correct answers, then:
   * 1. Adds attempted students to the quiz
   * 2. Claims reward for the first correct student
   * 3. Transfers payment to that student
   *
   * Returns the publicKey of the student who received the reward, or null.
   */
  async processQuizRewards(quizId: string): Promise<string | null> {
    return withComputerLock(this.computer, async () => {
      console.log('🏆 [Teacher] Processing rewards for quiz:', quizId)

      // Get latest quiz state
      const quiz = await this.getQuiz(quizId)
      if (!quiz) {
        console.warn('⚠️ [Teacher] Quiz not found:', quizId)
        return null
      }

      // Skip if already claimed
      if (quiz.isClaimed) {
        console.log('ℹ️ [Teacher] Quiz already claimed by:', quiz.claimedBy)
        return quiz.claimedBy
      }

      // Get all attempts for this quiz
      const attemptClient = new BrowserAttemptClient(this.computer)
      const attempts = await attemptClient.getQuizAttempts(quizId)
      console.log(`📊 [Teacher] Found ${attempts.length} attempts for quiz ${quizId}`)

      if (attempts.length === 0) return null

      // Find first correct attempt (chronologically)
      const correctAttempt = attempts
        .filter(a => a.isCorrect === true)
        .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0))[0]

      // Add all attempted students to the quiz
      for (const attempt of attempts) {
        const studentPubKey = attempt.studentPublicKey
        // Check if already in the list
        if (quiz.attemptedStudents?.includes(studentPubKey)) continue
        try {
          const quizLatestRev = await this.computer.latest(quizId).catch(() => quiz._rev)
          const addExp = `quiz.addAttemptedStudent("${studentPubKey}")`
          await encodeBroadcastWithRetry(
            this.computer,
            {
              exp: addExp,
              env: { quiz: quizLatestRev || quiz._rev },
              mod: MODULE_SPECS.quizMod,
            },
            { label: 'addAttemptedStudent' }
          )
          console.log('✅ [Teacher] Added student to attempted list:', studentPubKey)
        } catch (err) {
          // May fail if already added (idempotent)
          console.warn('⚠️ [Teacher] addAttemptedStudent failed (may be duplicate):', (err as any)?.message)
        }
      }

      if (!correctAttempt) {
        console.log('ℹ️ [Teacher] No correct attempt found yet for quiz:', quizId)
        return null
      }

      const winnerPubKey = correctAttempt.studentPublicKey
      console.log('🏆 [Teacher] Winner found:', winnerPubKey)

      // Claim reward
      try {
        const quizLatestRev = await this.computer.latest(quizId).catch(() => quiz._rev)
        const claimExp = `quiz.claimReward("${winnerPubKey}")`
        await encodeBroadcastWithRetry(
          this.computer,
          {
            exp: claimExp,
            env: { quiz: quizLatestRev || quiz._rev },
            mod: MODULE_SPECS.quizMod,
          },
          { label: 'claimReward' }
        )
        console.log('✅ [Teacher] Reward claimed for:', winnerPubKey)
      } catch (err) {
        console.error('❌ [Teacher] claimReward failed:', (err as any)?.message)
        return null
      }

      // Transfer payment to winner
      try {
        // Resolve payment to latest revision
        let paymentRev = quiz.paymentTxId
        try {
          const paymentLatest = await this.computer.latest(quiz.paymentTxId)
          if (paymentLatest) paymentRev = paymentLatest
        } catch { /* use original */ }

        const transferExp = `payment.transfer("${winnerPubKey}")`
        await encodeBroadcastWithRetry(
          this.computer,
          {
            exp: transferExp,
            env: { payment: paymentRev },
            mod: MODULE_SPECS.paymentMod,
          },
          { label: 'transferRewardPayment' }
        )
        console.log('✅ [Teacher] Payment transferred to:', winnerPubKey)
      } catch (err) {
        console.error('❌ [Teacher] payment.transfer failed:', (err as any)?.message)
      }

      return winnerPubKey
    })
  }

  /**
   * TEACHER ONLY: Process rewards for ALL teacher's quizzes.
   * Runs in background — non-blocking.
   */
  async processAllQuizRewards(teacherPublicKey: string): Promise<void> {
    try {
      const quizzes = await this.getQuizzesByTeacher(teacherPublicKey)
      for (const quiz of quizzes) {
        if (!quiz.isClaimed && quiz.isActive) {
          try {
            await this.processQuizRewards(quiz._id)
          } catch (err) {
            console.warn(`⚠️ [Teacher] Failed to process rewards for quiz ${quiz._id}:`, (err as any)?.message)
          }
        }
      }
    } catch (err) {
      console.error('❌ [Teacher] processAllQuizRewards failed:', err)
    }
  }

  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.getQuiz(quizId)
      if (!quiz) return null

      await encodeBroadcastWithRetry(
        this.computer,
        { exp: `quiz.deactivate()`, env: { quiz: quiz._rev }, mod: MODULE_SPECS.quizMod },
        { label: 'deactivateQuiz' }
      )

      return await this.getQuiz(quizId)
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  async getAllQuizzes(): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })

    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        // Resolve to latest revision — query() can return stale/spent UTXOs
        let revToSync = id
        try {
          const latestRev = await this.computer.latest(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const quiz = await this.computer.sync(revToSync)
        if (quiz && (quiz as any).isActive) {
          const attemptedStudents = (quiz as any).attemptedStudents || []
          quizzes.push({
            ...(quiz as any),
            _id: id, // preserve the root _id for routing
            attemptedStudents,
            attemptCount: attemptedStudents.length,
          } as QuizDTO)
        }
      } catch (quizError) {
        // Skip quizzes whose transactions no longer exist (pruned regtest, etc.)
        console.warn(`Skipping quiz ${id}: cannot sync (may be pruned)`, (quizError as any)?.message)
      }
    }

    return quizzes
  }

  // async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
  //   const quizIds = await this.computer.query({
  //     mod: MODULE_SPECS.quizMod,
  //     publicKey: teacherPublicKey,
  //   })

  //   const quizzes: QuizDTO[] = []
  //   for (const id of quizIds) {
  //     try {
  //       const quiz = await this.computer.sync(id)
  //       const attemptedStudents = (quiz as any).attemptedStudents || []
  //       quizzes.push({
  //         ...(quiz as any),
  //         attemptedStudents,
  //         attemptCount: attemptedStudents.length,
  //       } as QuizDTO)
  //     } catch (quizError) {
  //       console.error(`Failed to sync quiz ${id}:`, quizError)
  //     }
  //   }

  //   return quizzes
  // }
  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        // Resolve to latest revision
        let revToSync = id
        try {
          const latestRev = await this.computer.latest(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const quiz = await this.computer.sync(revToSync)
        if ((quiz as any).teacherPublicKey === teacherPublicKey) {
          const attemptedStudents = (quiz as any).attemptedStudents || []
          quizzes.push({
            ...(quiz as any),
            _id: id,
            attemptedStudents,
            attemptCount: attemptedStudents.length,
          } as QuizDTO)
        }
      } catch (e) {
        console.warn(`Skipping quiz ${id} for teacher:`, (e as any)?.message)
      }
    }
    return quizzes
  }

  /**
   * Get all Payment objects owned by a public key.
   * Returns payment IDs and their satoshi amounts.
   */
  async getOwnedPayments(ownerPublicKey: string): Promise<{ _id: string; _rev: string; _satoshis: number }[]> {
    try {
      const paymentIds: string[] = await this.computer.query({
        mod: MODULE_SPECS.paymentMod,
        publicKey: ownerPublicKey,
      })
      console.log('💰 [Payments] Found', paymentIds.length, 'payment IDs for', ownerPublicKey.substring(0, 12))

      const payments: { _id: string; _rev: string; _satoshis: number }[] = []
      for (const id of paymentIds) {
        try {
          let revToSync = id
          try {
            const latestRev = await this.computer.latest(id)
            if (latestRev) revToSync = latestRev
          } catch { /* use original */ }
          const payment = await this.computer.sync(revToSync) as any
          const sats = Number(String(payment._satoshis ?? 0).replace(/n$/, ''))
          if (sats > 546) {
            payments.push({
              _id: id,
              _rev: payment._rev || revToSync,
              _satoshis: sats,
            })
          }
        } catch {
          // skip unresolvable
        }
      }
      console.log('💰 [Payments] Withdrawable payments:', payments.length, 'total sats:', payments.reduce((s, p) => s + p._satoshis, 0))
      return payments
    } catch (err) {
      console.error('Failed to get owned payments:', err)
      return []
    }
  }

  /**
   * Withdraw all payment objects owned by the current user.
   * Uses Withdraw.exec() to batch-withdraw all at once.
   * Returns the total satoshis withdrawn.
   */
  async withdrawAllPayments(): Promise<{ totalWithdrawn: number; count: number }> {
    return withComputerLock(this.computer, async () => {
      const myPubKey = this.computer.getPublicKey()
      const payments = await this.getOwnedPayments(myPubKey)

      if (payments.length === 0) {
        console.log('💰 [Withdraw] No withdrawable payments found')
        return { totalWithdrawn: 0, count: 0 }
      }

      let totalWithdrawn = 0
      let count = 0

      // Withdraw each payment individually (safer than batch for regtest)
      for (const payment of payments) {
        try {
          // Re-resolve to latest rev before withdraw
          let currentRev = payment._rev
          try {
            const latestRev = await this.computer.latest(payment._id)
            if (latestRev) currentRev = latestRev
          } catch { /* use stored rev */ }

          const withdrawExp = `payment.withdraw()`
          await encodeBroadcastWithRetry(
            this.computer,
            {
              exp: withdrawExp,
              env: { payment: currentRev },
              mod: MODULE_SPECS.paymentMod,
            },
            { label: 'withdrawPayment' }
          )
          const withdrawn = payment._satoshis - 546
          totalWithdrawn += withdrawn
          count += 1
          console.log(`✅ [Withdraw] Withdrawn ${withdrawn} sats from payment ${payment._id.substring(0, 12)}`)
        } catch (err) {
          console.warn(`⚠️ [Withdraw] Failed to withdraw payment ${payment._id.substring(0, 12)}:`, (err as any)?.message)
        }
      }

      console.log(`💰 [Withdraw] Total withdrawn: ${totalWithdrawn} sats from ${count} payments`)
      return { totalWithdrawn, count }
    })
  }
}