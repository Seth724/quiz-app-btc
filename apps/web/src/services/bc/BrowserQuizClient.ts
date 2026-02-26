/**
 * Browser-Safe Quiz Client - Uses quiz-contracts helpers with deployed mod specs
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@/types'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { PaymentHelper, QuizHelper, TeacherHelper } from '@quiz-app/contracts'
import { withComputerLock } from './txUtils'
import { MineBlocks } from '../utils/mineblock'
import { BrowserAttemptClient } from './BrowserAttemptClient'

const url = 'http://localhost:1031'
const chain = process.env.NEXT_PUBLIC_BCN_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_BCN_NETWORK || 'regtest'

/** Safely extract an error message from an unknown catch value */
function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/** Shape returned by computer.sync() for a Payment object */
interface SyncedPayment {
  _id: string
  _rev: string
  _satoshis: bigint
}

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
  if (typeof performance !== 'undefined' && performance.timeOrigin !== undefined) {
    return Math.floor(performance.timeOrigin + performance.now())
  }
  return Date.now()
}

export class BrowserQuizClient {
  private paymentHelper: PaymentHelper
  private quizHelper: QuizHelper
  private teacherHelper: TeacherHelper
  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.paymentHelper = new PaymentHelper(computer, MODULE_SPECS.paymentMod)
    this.quizHelper = new QuizHelper(computer, MODULE_SPECS.quizMod)
    this.teacherHelper = new TeacherHelper(computer, MODULE_SPECS.teacherMod, MODULE_SPECS.paymentMod)
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

      const syncedQuiz = await this.computer.sync(quizId) as QuizDTO

      return {
        ...syncedQuiz,
        paymentTxId,
        attemptedStudents: syncedQuiz.attemptedStudents || [],
        attemptCount: (syncedQuiz.attemptedStudents || []).length,
        createdAt: syncedQuiz.createdAt || nowMs(),
      }
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
      const quiz = await this.computer.sync(revToSync) as QuizDTO
      return {
        ...quiz,
        _id: quizId, // preserve the root _id for routing
        attemptedStudents: quiz.attemptedStudents || [],
        attemptCount: (quiz.attemptedStudents || []).length,
      }
    } catch (error: unknown) {
      console.error('❌ BrowserQuizClient.getQuiz - FAILED:', errMsg(error))
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
   * LEGACY/FALLBACK: Process rewards for a quiz (teacher-side).
   * Normally rewards are auto-processed server-side by AutoRewardService.
   * This method is kept as a manual fallback if auto-reward fails.
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
        } catch (err: unknown) {
          console.warn('⚠️ [Teacher] addAttemptedStudent failed (may be duplicate):', errMsg(err))
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
      } catch (err: unknown) {
        console.error('❌ [Teacher] claimReward failed:', errMsg(err))
        return null
      }

      // Transfer payment to winner using PaymentHelper
      try {
        const ownerPayment = await this.paymentHelper.getPayment(quiz.paymentTxId)
        await this.paymentHelper.transferPayment(ownerPayment, winnerPubKey)
        console.log('✅ [Teacher] Payment transferred to:', winnerPubKey)
      } catch (err: unknown) {
        console.error('❌ [Teacher] payment.transfer failed:', errMsg(err))
      }

      return winnerPubKey
    })
  }

  /**
   * LEGACY/FALLBACK: Process rewards for ALL teacher's quizzes.
   * Normally rewards are auto-processed server-side by AutoRewardService.
   */
  async processAllQuizRewards(teacherPublicKey: string): Promise<void> {
    try {
      const quizzes = await this.getQuizzesByTeacher(teacherPublicKey)
      for (const quiz of quizzes) {
        if (!quiz.isClaimed && quiz.isActive) {
          try {
            await this.processQuizRewards(quiz._id)
          } catch (err: unknown) {
            console.warn(`⚠️ [Teacher] Failed to process rewards for quiz ${quiz._id}:`, errMsg(err))
          }
        }
      }
    } catch (err: unknown) {
      console.error('❌ [Teacher] processAllQuizRewards failed:', errMsg(err))
    }
  }

  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    return withComputerLock(this.computer, async () => {
      const maxRetries = 3
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            // Wait longer between retries to let mempool clear
            await new Promise(resolve => setTimeout(resolve, 3000 * attempt))
            if (network === 'regtest') {
              await MineBlocks.mine(url, chain, network, 1)
            }
          }
          // Always resolve to latest revision before deactivating
          let latestQuizId = quizId
          try {
            const latestRev = await this.computer.latest(quizId)
            if (latestRev) latestQuizId = latestRev
          } catch { /* use original quizId */ }
          await this.quizHelper.deactivateQuiz(latestQuizId)
          return await this.getQuiz(quizId)
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error)
          if ((msg.includes('mempool-conflict') || msg.includes('missingorspent')) && attempt < maxRetries - 1) {
            console.warn(`⚠️ [Deactivate] Mempool/UTXO conflict, retrying (${attempt + 1}/${maxRetries})...`)
            continue
          }
          console.error('Failed to deactivate quiz:', error)
          throw error
        }
      }
      return null
    })
  }

  async getAllQuizzes(): Promise<QuizDTO[]> {
    const quizIds = await this.computer.getOUTXOs({ mod: MODULE_SPECS.quizMod }) as string[]

    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        let revToSync = id
        try {
          const latestRev = await this.computer.latest(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const quiz = await this.computer.sync(revToSync) as QuizDTO
        if (quiz && quiz.isActive) {
          quizzes.push({
            ...quiz,
            _id: id,
            attemptedStudents: quiz.attemptedStudents || [],
            attemptCount: (quiz.attemptedStudents || []).length,
          })
        }
      } catch (quizError: unknown) {
        console.warn(`Skipping quiz ${id}: cannot sync (may be pruned)`, errMsg(quizError))
      }
    }

    return quizzes
  }

  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    const quizIds = await this.computer.getOUTXOs({ mod: MODULE_SPECS.quizMod }) as string[]
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        let revToSync = id
        try {
          const latestRev = await this.computer.latest(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const quiz = await this.computer.sync(revToSync) as QuizDTO
        if (quiz.teacherPublicKey === teacherPublicKey) {
          quizzes.push({
            ...quiz,
            _id: id,
            attemptedStudents: quiz.attemptedStudents || [],
            attemptCount: (quiz.attemptedStudents || []).length,
          })
        }
      } catch (e: unknown) {
        console.warn(`Skipping quiz ${id} for teacher:`, errMsg(e))
      }
    }
    return quizzes
  }

  /**
   * Get all Payment objects owned by a public key.
   * Optionally excludes reward payments (those tied to quizzes via paymentTxId)
   * so only genuine entry-fee or reward-transfer payments are returned.
   */
  async getOwnedPayments(
    ownerPublicKey: string,
    options?: { excludeRewardPayments?: boolean }
  ): Promise<{ _id: string; _rev: string; _satoshis: number }[]> {
    try {
      const paymentIds = await this.computer.getOUTXOs({
        mod: MODULE_SPECS.paymentMod,
        publicKey: ownerPublicKey,
      }) as string[]
      console.log('💰 [Payments] Found', paymentIds.length, 'payment IDs for', ownerPublicKey.substring(0, 12))

      // If we need to exclude reward payments, get all quiz paymentTxIds first
      let rewardPaymentIds: Set<string> | null = null
      if (options?.excludeRewardPayments) {
        try {
          const quizIds = await this.computer.getOUTXOs({ mod: MODULE_SPECS.quizMod }) as string[]
          rewardPaymentIds = new Set<string>()
          for (const qid of quizIds) {
            try {
              let revToSync = qid
              try {
                const latestRev = await this.computer.latest(qid)
                if (latestRev) revToSync = latestRev
              } catch { /* use original */ }
              const quiz = await this.computer.sync(revToSync) as QuizDTO
              if (quiz.paymentTxId) {
                // Store the root _id of the payment (without :index suffix)
                const rootId = quiz.paymentTxId.includes(':')
                  ? quiz.paymentTxId
                  : `${quiz.paymentTxId}:0`
                rewardPaymentIds.add(rootId)
                // Also add without suffix in case of format mismatch
                rewardPaymentIds.add(quiz.paymentTxId.split(':')[0])
              }
            } catch { /* skip quiz */ }
          }
          console.log('💰 [Payments] Excluding', rewardPaymentIds.size, 'reward payment IDs')
        } catch {
          // If we can't load quizzes, don't filter
          rewardPaymentIds = null
        }
      }

      const payments: { _id: string; _rev: string; _satoshis: number }[] = []
      for (const id of paymentIds) {
        try {
          // Skip reward payments if filtering is enabled
          if (rewardPaymentIds) {
            const rootId = id.split(':')[0]
            if (rewardPaymentIds.has(id) || rewardPaymentIds.has(rootId)) {
              continue
            }
          }

          let revToSync = id
          try {
            const latestRev = await this.computer.latest(id)
            if (latestRev) revToSync = latestRev
          } catch { /* use original */ }
          const payment = await this.computer.sync(revToSync) as SyncedPayment
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
    } catch (err: unknown) {
      console.error('Failed to get owned payments:', errMsg(err))
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
          const ownerPayment = await this.paymentHelper.getPayment(payment._id)
          const withdrawnAmount = await this.paymentHelper.withdrawPayment(ownerPayment)
          const withdrawn = Number(withdrawnAmount)
          totalWithdrawn += withdrawn
          count += 1
          console.log(`✅ [Withdraw] Withdrawn ${withdrawn} sats from payment ${payment._id.substring(0, 12)}`)
        } catch (err: unknown) {
          console.warn(`⚠️ [Withdraw] Failed to withdraw payment ${payment._id.substring(0, 12)}:`, errMsg(err))
        }
      }

      console.log(`💰 [Withdraw] Total withdrawn: ${totalWithdrawn} sats from ${count} payments`)
      return { totalWithdrawn, count }
    })
  }
}
