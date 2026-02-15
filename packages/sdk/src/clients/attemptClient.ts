import { Computer } from '@bitcoin-computer/lib'
import { AttemptHelper } from '@quiz-app/contracts'
import type { QuizAttemptData } from '@quiz-app/shared'

/**
 * AttemptClient - Clean interface for quiz attempt operations
 */
export class AttemptClient {
  private computer: Computer
  private attemptHelper: AttemptHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.attemptHelper = new AttemptHelper(computer)
  }

  /**
   * Create a quiz attempt
   */
  async createAttempt(quizId: string, studentPublicKey: string) {
    return await this.attemptHelper.createAttempt(quizId, studentPublicKey)
  }

  /**
   * Get attempt by ID
   */
  async getAttempt(attemptId: string) {
    return await this.attemptHelper.getAttempt(attemptId)
  }

  /**
   * Submit answer with access token
   */
  async submitAnswerWithAccess(
    attempt: any,
    access: any,
    selectedAnswer: number,
    quiz: any
  ) {
    return await this.attemptHelper.submitAnswerWithAccess(
      attempt,
      access,
      selectedAnswer,
      quiz
    )
  }
}
