import { Computer } from '@bitcoin-computer/lib'
import { QuizHelper } from '@quiz-app/contracts'
import type { QuizDetails } from '@quiz-app/shared'

/**
 * QuizClient - Clean interface for quiz operations
 */
export class QuizClient {
  private computer: Computer
  private quizHelper: QuizHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.quizHelper = new QuizHelper(computer)
  }

  /**
   * Get quiz by ID
   */
  async getQuiz(quizId: string) {
    return await this.quizHelper.getQuiz(quizId)
  }

  /**
   * Check if quiz is active
   */
  async isQuizActive(quizId: string): Promise<boolean> {
    return await this.quizHelper.isQuizActive(quizId)
  }

  /**
   * Check if reward is claimed
   */
  async isRewardClaimed(quizId: string): Promise<boolean> {
    return await this.quizHelper.isRewardClaimed(quizId)
  }

  /**
   * Get who claimed the reward
   */
  async getRewardClaimedBy(quizId: string): Promise<string> {
    return await this.quizHelper.getRewardClaimedBy(quizId)
  }

  /**
   * Check if student has attempted quiz
   */
  async hasStudentAttempted(quizId: string, studentPublicKey: string): Promise<boolean> {
    return await this.quizHelper.hasStudentAttempted(quizId, studentPublicKey)
  }

  /**
   * Check if student can attempt quiz
   */
  async canStudentAttemptQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    return await this.quizHelper.canStudentAttemptQuiz(quizId, studentPublicKey)
  }

  /**
   * Get attempt count for quiz
   */
  async getAttemptCount(quizId: string): Promise<number> {
    return await this.quizHelper.getAttemptCount(quizId)
  }

  /**
   * Get quiz details
   */
  async getQuizDetails(quizId: string): Promise<QuizDetails> {
    const details = await this.quizHelper.getQuizDetails(quizId)
    return {
      id: quizId,
      ...details
    }
  }

  /**
   * Deactivate quiz
   */
  async deactivateQuiz(quizId: string): Promise<void> {
    await this.quizHelper.deactivateQuiz(quizId)
  }

  /**
   * Validate answer index
   */
  isValidAnswerIndex(answerIndex: number): boolean {
    return this.quizHelper.isValidAnswerIndex(answerIndex)
  }
}
