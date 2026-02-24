/**
 * Browser-Safe Quiz Client - Uses quiz-contracts helpers with deployed mod specs
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@/types'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { PaymentHelper, QuizHelper } from '@quiz-app/contracts'
import { withComputerLock } from './txUtils'
import { MineBlocks } from '../utils/mineblock'
import { BrowserAttemptClient } from './BrowserAttemptClient'


const url = 'http://localhost:1031'
const chain = process.env.NEXT_PUBLIC_BCN_CHAIN || 'LTC'
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
  private paymentHelper: PaymentHelper
  private quizHelper: QuizHelper

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.paymentHelper = new PaymentHelper(computer, MODULE_SPECS.paymentMod)
    this.quizHelper = new QuizHelper(computer, MODULE_SPECS.quizMod)
  }

  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    return withComputerLock(this.computer, async () => {
      console.log('🎯 Creating quiz with data:', quizData)

      // STEP 1: Create reward Payment using PaymentHelper
      console.log('📤 Creating payment...')
      const payment = await this.paymentHelper.createPayment(quizData.rewardAmount)
      const paymentTxId = payment._id as string
      console.log('✅ Payment created:', paymentTxId)

      // Wait until BCN can sync the payment object reliably
      await this.computer.sync(paymentTxId)
      await new Promise((r) => setTimeout(r, 2500))

      const mine = async (blocks: number = 1) => {
        if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
      }

      await mine(2)
      console.log('⛏️ Mined 2 blocks to confirm payment transaction')

      // STEP 2: Create Quiz using QuizHelper
      console.log('📤 Creating quiz...')
      const quiz = await this.quizHelper.createQuiz({
        title: quizData.title,
        questionText: quizData.questionText,
        options: quizData.options,
        correctAnswer: quizData.correctAnswer,
        rewardAmount: quizData.rewardAmount,
        entryFee: quizData.entryFee,
        teacherPublicKey: this.computer.getPublicKey(),
        paymentTxId,
      })

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
        const latestRev = await this.computer.getLatestRev(quizId)
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
    if (quiz.isClaimed) return false

    const attemptClient = new BrowserAttemptClient(this.computer)
    const hasAttempted = await attemptClient.hasStudentAttemptedQuiz(quizId, studentPublicKey)
    return !hasAttempted
  }

  /**
   * TEACHER ONLY: Process rewards for a quiz.
   * Uses QuizHelper to add students and claim rewards.
   * Uses PaymentHelper to transfer payment to winner.
   */
  async processQuizRewards(quizId: string): Promise<string | null> {
    return withComputerLock(this.computer, async () => {
      console.log('🏆 [Teacher] Processing rewards for quiz:', quizId)

      const quiz = await this.getQuiz(quizId)
      if (!quiz) {
        console.warn('⚠️ [Teacher] Quiz not found:', quizId)
        return null
      }

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

      // Add all attempted students to the quiz using QuizHelper
      for (const attempt of attempts) {
        const studentPubKey = attempt.studentPublicKey
        if (quiz.attemptedStudents?.includes(studentPubKey)) continue
        try {
          await this.quizHelper.addAttemptedStudent(quizId, studentPubKey)
          console.log('✅ [Teacher] Added student to attempted list:', studentPubKey)
        } catch (err) {
          console.warn('⚠️ [Teacher] addAttemptedStudent failed (may be duplicate):', (err as any)?.message)
        }
      }

      if (!correctAttempt) {
        console.log('ℹ️ [Teacher] No correct attempt found yet for quiz:', quizId)
        return null
      }

      const winnerPubKey = correctAttempt.studentPublicKey
      console.log('🏆 [Teacher] Winner found:', winnerPubKey)

      // Claim reward using QuizHelper
      try {
        await this.quizHelper.claimReward(quizId, winnerPubKey)
        console.log('✅ [Teacher] Reward claimed for:', winnerPubKey)
      } catch (err) {
        console.error('❌ [Teacher] claimReward failed:', (err as any)?.message)
        return null
      }

      // Transfer payment to winner using PaymentHelper
      try {
        await this.paymentHelper.transferPaymentById(quiz.paymentTxId, winnerPubKey)
        console.log('✅ [Teacher] Payment transferred to:', winnerPubKey)
      } catch (err) {
        console.error('❌ [Teacher] payment.transfer failed:', (err as any)?.message)
      }

      return winnerPubKey
    })
  }

  /**
   * TEACHER ONLY: Process rewards for ALL teacher's quizzes.
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
      await this.quizHelper.deactivateQuiz(quizId)
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
        let revToSync = id
        try {
          const latestRev = await this.computer.getLatestRev(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const quiz = await this.computer.sync(revToSync)
        if (quiz && (quiz as any).isActive) {
          const attemptedStudents = (quiz as any).attemptedStudents || []
          quizzes.push({
            ...(quiz as any),
            _id: id,
            attemptedStudents,
            attemptCount: attemptedStudents.length,
          } as QuizDTO)
        }
      } catch (quizError) {
        console.warn(`Skipping quiz ${id}: cannot sync (may be pruned)`, (quizError as any)?.message)
      }
    }

    return quizzes
  }

  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        let revToSync = id
        try {
          const latestRev = await this.computer.getLatestRev(id)
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
            const latestRev = await this.computer.getLatestRev(id)
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
   * Withdraw all payment objects owned by the current user using PaymentHelper.
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

      for (const payment of payments) {
        try {
          const withdrawnAmount = await this.paymentHelper.withdrawPaymentById(payment._id)
          const withdrawn = Number(withdrawnAmount)
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
