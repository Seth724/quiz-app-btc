/**
 * Helper-based Attempt Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { AttemptHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS } from '@/config/env'

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
  rewardEarned: bigint
  submittedAt: number
}

export class HelperAttemptClient {
  private attemptHelper: AttemptHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module spec
    this.attemptHelper = new AttemptHelper(computer, MODULE_SPECS.attemptMod)
    this.utils = new BlockchainUtils(computer)
  }

  /**
   * Submit quiz attempt using the helper
   */
  async submitAttempt(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptDTO> {
    console.log('📝 Student attempting quiz:', quizId)

    const quiz = await this.utils.syncOrMine<any>(quizId)
    const accessToken = await this.utils.syncOrMine<any>(accessTokenId)

    const attempt = await this.attemptHelper.createAttempt(quizId, this.computer.getPublicKey())

    const result = await this.attemptHelper.submitAnswerWithAccess(
      attempt,
      accessToken,
      selectedAnswer,
      quiz
    )

    const updatedAttempt = await this.utils.syncOrMine<any>(attempt._id)

    return {
      ...updatedAttempt,
      submittedAt: Date.now(),
    } as AttemptDTO
  }

  /**
   * Get attempt by ID
   */
  async getAttempt(attemptId: string): Promise<AttemptDTO | null> {
    try {
      const attempt = await this.utils.syncOrMine<any>(attemptId)
      return {
        ...attempt,
        submittedAt: attempt.submittedAt || Date.now(),
      } as AttemptDTO
    } catch (error) {
      console.error('Failed to get attempt:', error)
      return null
    }
  }

  /**
   * Get student's attempts from blockchain
   */
  async getStudentAttempts(studentPublicKey: string, quizId?: string): Promise<AttemptDTO[]> {
    const attemptIds = await this.computer.query({
      mod: MODULE_SPECS.attemptMod,
      publicKey: studentPublicKey,
    })

    const attempts: AttemptDTO[] = []
    for (const id of attemptIds) {
      try {
        const attempt = await this.utils.syncOrMine<any>(id)
        if (!quizId || attempt.quizId === quizId) {
          attempts.push({
            ...attempt,
            submittedAt: attempt.attemptedAt || Date.now(),
          } as AttemptDTO)
        }
      } catch (attemptError) {
        console.error(`Failed to sync attempt ${id}:`, attemptError)
      }
    }

    return attempts
  }
}
