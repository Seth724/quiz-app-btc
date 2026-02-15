import { Computer } from '@bitcoin-computer/lib'
import { Quiz } from '../quiz.js'

/**
 * QuizHelper - Utility class for Quiz contract operations
 * 
 * Current Architecture:
 * - 1 Quiz = 1 Question with exactly 4 options
 * - 1 Quiz = 1 Payment object (created by TeacherHelper)
 * - First correct answer claims the reward
 * - Only ONE teacher in the app creates quizzes
 * - MANY students can attempt quizzes
 */
export class QuizHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  /**
   * Get a quiz by ID
   */
  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

  /**
   * Check if a quiz is currently active
   */
  async isQuizActive(quizId: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.isActive
  }

  /**
   * Check if the reward for a quiz has been claimed
   */
  async isRewardClaimed(quizId: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.isClaimed
  }

  /**
   * Get the public key of the student who claimed the reward
   */
  async getRewardClaimedBy(quizId: string): Promise<string> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.claimedBy
  }

  /**
   * Check if a student has already attempted a quiz
   */
  async hasStudentAttempted(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.hasStudentAttempted(studentPublicKey)
  }

  /**
   * Check if a student can attempt a quiz
   * Returns true if:
   * - Quiz is active
   * - Student has not already attempted
   */
  async canStudentAttemptQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    return await quiz.canStudentAttempt(studentPublicKey)
  }

  /**
   * Get the number of students who have attempted a quiz
   */
  async getAttemptCount(quizId: string): Promise<number> {
    const quiz = await this.getQuiz(quizId)
    const attemptedStudents = await quiz.attemptedStudents
    return attemptedStudents.length
  }

  /**
   * Get quiz details in a formatted way
   */
  async getQuizDetails(quizId: string): Promise<{
    title: string
    questionText: string
    options: string[]
    rewardAmount: bigint
    entryFee: bigint
    isActive: boolean
    isClaimed: boolean
    claimedBy: string
    attemptCount: number
    attemptedStudents: string[]
    paymentTxId: string
  }> {
    const quiz = await this.getQuiz(quizId)

    return {
      title: await quiz.title,
      questionText: await quiz.questionText,
      options: await quiz.options,
      rewardAmount: await quiz.rewardAmount,
      entryFee: await quiz.entryFee,
      isActive: await quiz.isActive,
      isClaimed: await quiz.isClaimed,
      claimedBy: await quiz.claimedBy,
      attemptCount: (await quiz.attemptedStudents).length,
      attemptedStudents: await quiz.attemptedStudents,
      paymentTxId: await quiz.paymentTxId
    }
  }

  /**
   * Deactivate a quiz (typically called by teacher)
   */
  async deactivateQuiz(quizId: string): Promise<void> {
    const quiz = await this.getQuiz(quizId)
    await quiz.deactivate()
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  /**
   * Validate if an answer index is valid (0-3)
   */
  isValidAnswerIndex(answerIndex: number): boolean {
    return answerIndex >= 0 && answerIndex <= 3
  }
}