/**
 * Browser-Safe Attempt Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

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
   * 2. Call submitAnswer with access token
   * 3. Add student to attempted list
   * 4. Try to claim reward
   * 5. Transfer payment if claimed
   */
  async submitAttempt(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptDTO> {
    // Get the quiz and access token
    const quiz = await this.computer.sync(quizId)
    const accessToken = await this.computer.sync(accessTokenId)

    // Create attempt
    const attemptExp = `new QuizAttempt("${quizId}", "${this.computer.getPublicKey()}")`
    const encoded = await this.computer.encode({
      exp: attemptExp,
      mod: MODULE_SPECS.quizAttemptMod,
    })
    await this.computer.broadcast(encoded.tx)

    // Get the newly created attempt
    const attempt = await this.computer.sync(encoded.effect.res._id)

    // Submit the answer (this burns the access token internally)
    const submitExp = `attempt.submitAnswer(accessToken, ${selectedAnswer}, ${quiz.correctAnswer}, ${quiz.rewardAmount}n)`
    const submitEncoded = await this.computer.encode({
      exp: submitExp,
      env: { 
        attempt: attempt._rev,
        accessToken: accessToken._rev
      },
      mod: MODULE_SPECS.quizAttemptMod,
    })
    await this.computer.broadcast(submitEncoded.tx)

    // Get updated attempt
    const updatedAttempt = await this.computer.sync(submitEncoded.effect.res._id)

    // Add student to attempted list
    const addAttemptExp = `quiz.addAttemptedStudent("${this.computer.getPublicKey()}")`
    const addAttemptEncoded = await this.computer.encode({
      exp: addAttemptExp,
      env: { quiz: quiz._rev },
      mod: MODULE_SPECS.quizMod,
    })
    await this.computer.broadcast(addAttemptEncoded.tx)

    // Try to claim reward (first-come-first-served)
    const claimExp = `quiz.claimReward("${this.computer.getPublicKey()}")`
    const claimEncoded = await this.computer.encode({
      exp: claimExp,
      env: { quiz: quiz._rev },
      mod: MODULE_SPECS.quizMod,
    })
    await this.computer.broadcast(claimEncoded.tx)

    // Check if claim was successful and transfer payment
    const updatedQuiz = await this.computer.sync(quiz._id)
    if (updatedQuiz.isClaimed && updatedQuiz.claimedBy === this.computer.getPublicKey()) {
      const payment = await this.computer.sync(quiz.paymentTxId)
      const transferExp = `payment.transfer("${this.computer.getPublicKey()}")`
      const transferEncoded = await this.computer.encode({
        exp: transferExp,
        env: { payment: payment._rev },
        mod: MODULE_SPECS.paymentMod,
      })
      await this.computer.broadcast(transferEncoded.tx)
    }

    return {
      ...updatedAttempt,
      submittedAt: Date.now()
    } as AttemptDTO
  }

  /**
   * Get attempt by ID
   */
  async getAttempt(attemptId: string): Promise<AttemptDTO | null> {
    try {
      const attempt = await this.computer.sync(attemptId)
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
      mod: MODULE_SPECS.quizAttemptMod,
      publicKey: studentPublicKey 
    })
    
    const attempts: AttemptDTO[] = []
    for (const id of attemptIds) {
      try {
        const attempt = await this.computer.sync(id)
        if (!quizId || attempt.quizId === quizId) {
          attempts.push({
            ...attempt,
            submittedAt: attempt.attemptedAt || Date.now()
          } as AttemptDTO)
        }
      } catch (attemptError) {
        console.error(`Failed to sync attempt ${id}:`, attemptError)
      }
    }
    
    return attempts
  }
}
