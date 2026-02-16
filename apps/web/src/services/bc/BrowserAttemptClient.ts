/**
 * Browser-Safe Attempt Client - Uses mod specs instead of contract imports
 */

import { Computer } from '@bitcoin-computer/lib'
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

/**
 * Browser-safe AttemptClient using mod specs
 */
export class BrowserAttemptClient {
  constructor(private computer: Computer) {}

  /**
   * Submit quiz attempt - browser safe implementation
   */
  async submitAttempt(
    quizId: string, 
    selectedAnswer: number, 
    accessTokenId: string
  ): Promise<AttemptDTO> {
    // Get the quiz to check correct answer and reward
    const quiz = await this.computer.sync(quizId)
    
    // Get the access token to burn
    const accessToken = await this.computer.sync(accessTokenId)
    
    // Create attempt with access token burn
    const attemptExp = `new QuizAttempt(
      "${quizId}",
      "${this.computer.getPublicKey()}",
      ${selectedAnswer},
      ${quiz.correctAnswer === selectedAnswer ? 'true' : 'false'},
      ${quiz.correctAnswer === selectedAnswer ? quiz.rewardAmount + 'n' : '0n'}
    )`
    
    const encoded = await this.computer.encode({
      exp: attemptExp,
      mod: MODULE_SPECS.attemptMod,
    })
    
    await this.computer.broadcast(encoded.tx)
    
    // If correct answer, transfer payment to student
    if (quiz.correctAnswer === selectedAnswer) {
      const payment = await this.computer.sync(quiz.paymentTxId)
      
      const transferExp = `payment.transfer("${this.computer.getPublicKey()}")`
      
      const transferEncoded = await this.computer.encode({
        exp: transferExp,
        env: { payment: payment._rev },
        mod: MODULE_SPECS.paymentMod,
      })
      
      await this.computer.broadcast(transferEncoded.tx)
      
      // Mark quiz as claimed
      const claimExp = `quiz.markAsClaimed("${this.computer.getPublicKey()}")`
      
      const claimEncoded = await this.computer.encode({
        exp: claimExp,
        env: { quiz: quiz._rev },
        mod: MODULE_SPECS.quizMod,
      })
      
      await this.computer.broadcast(claimEncoded.tx)
    }
    
    return {
      ...encoded.effect.res,
      submittedAt: Date.now()
    } as unknown as AttemptDTO
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
   * Get student's attempts for a quiz
   */
  async getStudentAttempts(
    studentPublicKey: string, 
    quizId?: string
  ): Promise<AttemptDTO[]> {
    try {
      // This would need proper indexing in production
      // For now return empty array
      return []
    } catch (error) {
      console.error('Failed to get attempts:', error)
      return []
    }
  }
}