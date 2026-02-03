import { Computer } from '@bitcoin-computer/lib'
import { QuizAttempt } from '../attempt.js'
import { Quiz } from '../quiz.js'

/**
 * Helper class for managing quiz attempts in single-question architecture
 */
export class AttemptHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  /**
   * Create a new quiz attempt for a student
   * @param quizId - The quiz object ID
   * @param studentPublicKey - Student's public key
   * @returns QuizAttempt instance
   */
  async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
    return await this.computer.new(QuizAttempt, [quizId, studentPublicKey])
  }

  /**
   * Get an existing attempt by ID
   * @param attemptId - The attempt object ID
   * @returns QuizAttempt instance
   */
  async getAttempt(attemptId: string): Promise<QuizAttempt> {
    return await this.computer.sync(attemptId) as QuizAttempt
  }

  /**
   * Submit answer for a single-question quiz
   * @param attempt - QuizAttempt instance
   * @param selectedAnswer - Answer index (0-3)
   * @param quiz - Quiz instance to check correct answer and reward
   * @returns Attempt result
   */
  async submitAnswer(
    attempt: QuizAttempt,
    selectedAnswer: number,
    quiz: Quiz
  ): Promise<{
    isCorrect: boolean
    rewardEarned: bigint
    selectedAnswer: number
  }> {
    // Submit the answer
    await attempt.submitAnswer(selectedAnswer, await quiz.correctAnswer, await quiz.rewardAmount)

    return {
      isCorrect: await attempt.isCorrect,
      rewardEarned: await attempt.rewardEarned,
      selectedAnswer: await attempt.selectedAnswer
    }
  }

  /**
   * Get attempt results
   * @param attempt - QuizAttempt instance
   * @returns Attempt results
   */
  async getResult(attempt: QuizAttempt) {
    return await attempt.getResult()
  }

  /**
   * Check if an attempt is completed
   * @param attempt - QuizAttempt instance
   * @returns Boolean indicating completion
   */
  async isCompleted(attempt: QuizAttempt): Promise<boolean> {
    return await attempt.isCompleted
  }

  /**
   * Check if an attempt was correct
   * @param attempt - QuizAttempt instance
   * @returns Boolean indicating if answer was correct
   */
  async isCorrect(attempt: QuizAttempt): Promise<boolean> {
    return await attempt.isCorrect
  }

  /**
   * Get reward earned from attempt
   * @param attempt - QuizAttempt instance
   * @returns Reward amount in satoshis
   */
  async getRewardEarned(attempt: QuizAttempt): Promise<bigint> {
    return await attempt.rewardEarned
  }
}