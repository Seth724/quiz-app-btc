/**
 * Browser-Safe Attempt Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { encodeBroadcastWithRetry } from './txUtils'

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
 * Browser-safe AttemptClient using deployed module specs
 * Follows the exact test flow from the test file
 */
export class BrowserAttemptClient {
  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  /**
   * Submit quiz attempt following the test flow:
   * 1. Create QuizAttempt
   * 2. Call submitAnswer with access token (burns 1 unit)
   * 3. Add student to attempted list
   * 4. Try to claim reward
   * 5. Transfer payment if claimed
   */
  async submitAttempt(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptDTO> {
    const studentPubKey = this.computer.getPublicKey()

    // ── Pre-check: Prevent duplicate attempts ──
    const alreadyAttempted = await this.hasStudentAttemptedQuiz(quizId, studentPubKey)
    if (alreadyAttempted) {
      throw new Error('You have already attempted this quiz. Each quiz can only be attempted once.')
    }

    // ── Step 0: Sync quiz and access token ──
    console.log('🎯 [Attempt] Starting submitAttempt for quiz:', quizId)
    const quiz = await this.computer.sync(quizId) as any
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
    const accessToken = await this.computer.sync(accessTokenRev) as any
    console.log('🔍 [Attempt] Access token _owners:', accessToken?._owners, 'student:', studentPubKey)
    console.log('🔍 [Attempt] Access token _rev:', accessToken?._rev, 'amount:', String(accessToken?.amount))

    // ── Step 1: Create QuizAttempt ──
    console.log('📝 [Attempt] Step 1: Creating QuizAttempt...')
    const attemptExp = `new QuizAttempt("${quizId}", "${studentPubKey}")`
    const attemptEncoded = await encodeBroadcastWithRetry(
      this.computer,
      { exp: attemptExp, mod: MODULE_SPECS.attemptMod },
      { label: 'createQuizAttempt' }
    )
    const attemptRes = attemptEncoded?.effect?.res as any
    if (!attemptRes?._id) {
      throw new Error('Failed to create QuizAttempt: encode result has no _id')
    }
    console.log('✅ [Attempt] QuizAttempt created:', attemptRes._id, '_rev:', attemptRes._rev)

    // Re-sync to get the full object
    const attempt = await this.computer.sync(attemptRes._id) as any

    // ── Step 2: Submit answer (burns access token) ──
    console.log('📝 [Attempt] Step 2: Submitting answer...')
    const rewardAmountStr = String(quiz.rewardAmount).replace(/n$/, '')
    const correctAnswerStr = String(quiz.correctAnswer).replace(/n$/, '')
    const submitExp = `attempt.submitAnswer(accessToken, ${selectedAnswer}, ${correctAnswerStr}, ${rewardAmountStr}n)`
    console.log('📝 [Attempt] Expression:', submitExp)
    console.log('📝 [Attempt] env: attempt=', attempt._rev, 'accessToken=', accessToken._rev)

    const submitEncoded = await encodeBroadcastWithRetry(
      this.computer,
      {
        exp: submitExp,
        env: {
          attempt: attempt._rev,
          accessToken: accessToken._rev,
        },
        mod: MODULE_SPECS.attemptMod,
      },
      { label: 'submitAnswer' }
    )
    console.log('✅ [Attempt] Answer submitted, syncing result...')

    // Get updated attempt — the _id is the same, but _rev changed
    const submitRes = submitEncoded?.effect?.res as any
    const updatedAttemptRev = submitRes?._rev || submitRes?._id || attemptRes._id
    const updatedAttempt = await this.computer.sync(updatedAttemptRev) as any
    console.log('✅ [Attempt] isCorrect:', updatedAttempt?.isCorrect, 'rewardEarned:', String(updatedAttempt?.rewardEarned))

    // NOTE: Steps 3-5 (addAttemptedStudent, claimReward, payment.transfer) are
    // SKIPPED here because the Quiz and Payment objects are owned by the TEACHER.
    // Only the teacher's private key can sign transactions that modify those objects.
    // The teacher's browser auto-processes rewards when loading the dashboard.
    // See BrowserQuizClient.processQuizRewards() for the teacher-side flow.
    console.log('ℹ️ [Attempt] Steps 3-5 skipped (quiz owned by teacher — reward processing happens on teacher side)')

    console.log('✅ [Attempt] submitAttempt complete!')

    return {
      _id: updatedAttempt._id || attemptRes._id,
      _rev: updatedAttempt._rev || attemptRes._rev,
      _root: updatedAttempt._root || attemptRes._root,
      _owners: updatedAttempt._owners || [],
      _satoshis: updatedAttempt._satoshis || BigInt(0),
      quizId: updatedAttempt.quizId || quizId,
      studentPublicKey: updatedAttempt.studentPublicKey || studentPubKey,
      selectedAnswer: updatedAttempt.selectedAnswer ?? selectedAnswer,
      isCorrect: updatedAttempt.isCorrect ?? false,
      isCompleted: updatedAttempt.isCompleted ?? true,
      rewardEarned: updatedAttempt.rewardEarned ?? BigInt(0),
      submittedAt: nowMs(),
    }
  }

  /**
   * Get attempt by ID — resolves to latest revision so we get post-submitAnswer state
   */
  async getAttempt(attemptId: string): Promise<AttemptDTO | null> {
    try {
      // Resolve to latest revision: the _id points to creation state (selectedAnswer=-1),
      // but we need the post-submitAnswer revision with the actual answer data.
      let revToSync = attemptId
      try {
        const latestRev = await this.computer.latest(attemptId)
        if (latestRev) revToSync = latestRev
        console.log('🔍 [Attempt] getAttempt resolved', attemptId, '→', revToSync)
      } catch {
        console.log('🔍 [Attempt] latest() failed for', attemptId, ', using as-is')
      }
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
    const attemptIds = await this.computer.query({ 
      mod: MODULE_SPECS.attemptMod,
      publicKey: studentPublicKey 
    })
    
    const attempts: AttemptDTO[] = []
    for (const id of attemptIds) {
      try {
        // Resolve to latest revision to get post-submitAnswer state
        let revToSync = id
        try {
          const latestRev = await this.computer.latest(id)
          if (latestRev) revToSync = latestRev
        } catch { /* use original id */ }
        const attempt = await this.computer.sync(revToSync) as any
        if (!quizId || attempt.quizId === quizId) {
          attempts.push({
            ...attempt,
            submittedAt: attempt.attemptedAt || nowMs()
          } as AttemptDTO)
        }
      } catch (attemptError) {
        console.error(`Failed to sync attempt ${id}:`, attemptError)
      }
    }
    
    return attempts
  }

  /**
   * Check if a student has already attempted a specific quiz.
   * Scans QuizAttempt objects on-chain for this student+quiz combination.
   */
  async hasStudentAttemptedQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    try {
      const attempts = await this.getStudentAttempts(studentPublicKey, quizId)
      // Only count completed attempts (selectedAnswer >= 0)
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
      console.log('🔍 [Attempt] getQuizAttempts for quiz:', quizId.substring(0, 12), 'using attemptMod:', MODULE_SPECS.attemptMod.substring(0, 12))
      const attemptIds: string[] = await this.computer.query({
        mod: MODULE_SPECS.attemptMod,
      })
      console.log('🔍 [Attempt] Found', attemptIds.length, 'total attempt IDs')

      const attempts: AttemptDTO[] = []
      for (const id of attemptIds) {
        try {
          let revToSync = id
          try {
            const latestRev = await this.computer.latest(id)
            if (latestRev) revToSync = latestRev
          } catch (e) {
            console.warn('⚠️ [Attempt] latest() failed for', id.substring(0, 12), ':', (e as any)?.message)
          }
          const attempt = await this.computer.sync(revToSync) as any
          if (attempt?.quizId === quizId && attempt.selectedAnswer >= 0) {
            attempts.push({
              ...attempt,
              submittedAt: attempt.attemptedAt || nowMs(),
            } as AttemptDTO)
          }
        } catch (e) {
          // Skip unresolvable - could be 500 error from regtest reset
          console.warn('⚠️ [Attempt] Skipping attempt', id.substring(0, 12), ':', (e as any)?.message)
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
