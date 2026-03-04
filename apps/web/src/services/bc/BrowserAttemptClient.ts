/**
 * Browser-Safe Attempt Client - Uses quiz-contracts AttemptHelper
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { AttemptHelper, QuizAccess, Quiz } from '@quiz-app/contracts'

/** Safely extract an error message from an unknown catch value */
function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export interface AttemptDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentPublicKey: string
  selectedAnswer: number
  isCorrect: boolean
  isCompleted: boolean
  rewardEarned: bigint
  submittedAt: number
}

// Safe timestamp function that works in SES secure mode
const nowMs = () => {
  if (typeof performance !== 'undefined' && performance.timeOrigin !== undefined) {
    return Math.floor(performance.timeOrigin + performance.now())
  }
  return Date.now()
}

/**
 * Browser-safe AttemptClient using quiz-contracts AttemptHelper
 */
export class BrowserAttemptClient {
  private attemptHelper: AttemptHelper

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.attemptHelper = new AttemptHelper(computer, MODULE_SPECS.attemptMod)
  }

  /**
   * Submit quiz attempt following the flow:
   * 1. Create QuizAttempt using AttemptHelper
   * 2. Submit answer with access token (burns 1 unit)
   *
   * Steps 3-5 (addAttemptedStudent, claimReward, payment.transfer) are
   * processed client-side via BrowserQuizClient.autoProcessReward() when the
   * attempt is recorded via POST /attempts with isCorrect=true.
   */
  async submitAttempt(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptDTO> {
    const studentPubKey = this.computer.getPublicKey()

    // Pre-check: Prevent duplicate attempts
    const alreadyAttempted = await this.hasStudentAttemptedQuiz(quizId, studentPubKey)
    if (alreadyAttempted) {
      throw new Error('You have already attempted this quiz. Each quiz can only be attempted once.')
    }

    // Step 0: Sync quiz and access token
    console.log('🎯 [Attempt] Starting submitAttempt for quiz:', quizId)
    const quiz = await this.computer.sync(quizId) as unknown as Quiz
    console.log('🎯 [Attempt] Quiz synced, correctAnswer:', quiz.correctAnswer, 'rewardAmount:', String(quiz.rewardAmount))

    // Get access token at latest revision
    let accessTokenRev = accessTokenId
    try {
      const latestRev = await this.computer.latest(accessTokenId)
      if (latestRev) accessTokenRev = latestRev
      console.log('🔍 [Attempt] Resolved accessTokenId:', accessTokenId, '→ latestRev:', accessTokenRev)
    } catch {
      console.log('🔍 [Attempt] latest() failed, using as-is:', accessTokenId)
    }
    const accessToken = await this.computer.sync(accessTokenRev) as unknown as QuizAccess
    console.log('🔍 [Attempt] Access token _owners:', accessToken?._owners, 'student:', studentPubKey)

    // Step 1: Create QuizAttempt using AttemptHelper
    console.log('📝 [Attempt] Step 1: Creating QuizAttempt...')
    const attempt = await this.attemptHelper.createAttempt(quizId, studentPubKey)
    console.log('✅ [Attempt] QuizAttempt created:', attempt._id)

    // Step 2: Submit answer with access token using AttemptHelper
    console.log('📝 [Attempt] Step 2: Submitting answer...')
    const result = await this.attemptHelper.submitAnswerWithAccess(
      attempt,
      accessToken,
      selectedAnswer,
      quiz
    )
    console.log('✅ [Attempt] isCorrect:', result.isCorrect, 'rewardEarned:', String(result.rewardEarned))

    // NOTE: Steps 3-5 (addAttemptedStudent, claimReward, payment.transfer) are
    // processed client-side via BrowserQuizClient.autoProcessReward() when this
    // attempt is synced to the DB via POST /attempts.
    console.log('ℹ️ [Attempt] Steps 3-5 handled client-side (auto-reward on correct answer)')

    console.log('✅ [Attempt] submitAttempt complete!')

    // Get updated attempt state
    const updatedAttempt = attempt as unknown as AttemptDTO

    return {
      _id: updatedAttempt._id || '',
      _rev: updatedAttempt._rev || '',
      _root: updatedAttempt._root || '',
      _owners: updatedAttempt._owners || [],
      _satoshis: updatedAttempt._satoshis || BigInt(0),
      quizId: updatedAttempt.quizId || quizId,
      studentPublicKey: updatedAttempt.studentPublicKey || studentPubKey,
      selectedAnswer: result.selectedAnswer ?? selectedAnswer,
      isCorrect: result.isCorrect ?? false,
      isCompleted: true,
      rewardEarned: result.rewardEarned ?? BigInt(0),
      submittedAt: nowMs(),
    }
  }

  /**
   * Get attempt by ID - resolves to latest revision
   */
  async getAttempt(attemptId: string): Promise<AttemptDTO | null> {
    try {
      let revToSync = attemptId
      try {
        const latestRev = await this.computer.latest(attemptId)
        if (latestRev) revToSync = latestRev
      } catch { /* use original */ }
      const attempt = await this.computer.sync(revToSync)
      return attempt as unknown as AttemptDTO
    } catch (error) {
      console.error('Failed to get attempt:', error)
      return null
    }
  }

  /**
   * Get student's attempts from blockchain
   */
  async getStudentAttempts(
    studentPublicKey: string,
    quizId?: string
  ): Promise<AttemptDTO[]> {
    const attemptIds = await this.computer.getOUTXOs({
      mod: MODULE_SPECS.attemptMod,
      publicKey: studentPublicKey,
    }) as string[]

    const attempts: AttemptDTO[] = []
    for (const id of attemptIds) {
      try {
        let revToSync = id
        try {
          const latestRev = await this.computer.latest(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const attempt = await this.computer.sync(revToSync) as AttemptDTO
        if (!quizId || attempt.quizId === quizId) {
          attempts.push({
            ...attempt,
            submittedAt: attempt.submittedAt || nowMs(),
          })
        }
      } catch (attemptError: unknown) {
        console.error(`Failed to sync attempt ${id}:`, attemptError)
      }
    }

    return attempts
  }

  /**
   * Check if a student has already attempted a specific quiz.
   */
  async hasStudentAttemptedQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    try {
      const attempts = await this.getStudentAttempts(studentPublicKey, quizId)
      return attempts.some(a => a.selectedAnswer >= 0 && a.isCompleted !== false)
    } catch {
      return false
    }
  }

  /**
   * Get ALL attempts for a specific quiz (any student).
   * Used by teacher-side reward processing.
   */
  async getQuizAttempts(quizId: string): Promise<AttemptDTO[]> {
    try {
      console.log('🔍 [Attempt] getQuizAttempts for quiz:', quizId.substring(0, 12))
      const attemptIds: string[] = await this.computer.getOUTXOs({
        mod: MODULE_SPECS.attemptMod,
      }) as string[]
      console.log('🔍 [Attempt] Found', attemptIds.length, 'total attempt IDs')

      const attempts: AttemptDTO[] = []
      for (const id of attemptIds) {
        try {
          let revToSync = id
          try {
            const latestRev = await this.computer.latest(id)
            if (latestRev) revToSync = latestRev
          } catch (e: unknown) {
            console.warn('⚠️ [Attempt] latest() failed for', id.substring(0, 12), ':', errMsg(e))
          }
          const attempt = await this.computer.sync(revToSync) as AttemptDTO
          if (attempt?.quizId === quizId && attempt.selectedAnswer >= 0) {
            attempts.push({
              ...attempt,
              submittedAt: attempt.submittedAt || nowMs(),
            })
          }
        } catch (e: unknown) {
          console.warn('⚠️ [Attempt] Skipping attempt', id.substring(0, 12), ':', errMsg(e))
        }
      }
      console.log('🔍 [Attempt] Returning', attempts.length, 'attempts for quiz', quizId.substring(0, 12))
      return attempts
    } catch (err) {
      console.error('Failed to get quiz attempts:', err)
      return []
    }
  }
}
