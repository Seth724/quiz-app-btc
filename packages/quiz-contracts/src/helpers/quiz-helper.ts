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
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
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
    isActive: boolean
    isClaimed: boolean
    claimedBy: string
    attemptCount: number
    paymentTxId: string
  }> {
    const quiz = await this.getQuiz(quizId)
    
    return {
      title: await quiz.title,
      questionText: await quiz.questionText,
      options: await quiz.options,
      rewardAmount: await quiz.rewardAmount,
      isActive: await quiz.isActive,
      isClaimed: await quiz.isClaimed,
      claimedBy: await quiz.claimedBy,
      attemptCount: (await quiz.attemptedStudents).length,
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

  
  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacherPublicKey: string
    paymentTxId: string
  }): Promise<Quiz> {
    if (this.mod) {
      // Build a JS expression string so we never pass the bundled class reference
      const exp = `new Quiz({
  title: ${JSON.stringify(params.title)},
  questionText: ${JSON.stringify(params.questionText)},
  options: ${JSON.stringify(params.options)},
  correctAnswer: ${params.correctAnswer},
  rewardAmount: ${params.rewardAmount}n,
  entryFee: ${params.entryFee}n,
  teacherPublicKey: ${JSON.stringify(params.teacherPublicKey)},
  paymentTxId: ${JSON.stringify(params.paymentTxId)}
})`
      const encoded = await this.computer.encode({ exp, mod: this.mod })
      await this.computer.broadcast(encoded.tx)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Extract the created object ID from the transaction effect
      const res = encoded?.effect?.res as any
      const resId: string | undefined =
        res?._id ?? (typeof res === 'string' ? res : undefined)
      if (typeof resId === 'string') {
        return await this.computer.sync(resId) as Quiz
      }
      throw new Error('Failed to create quiz – could not extract result ID from transaction effect')
    }

    // Fallback: no mod spec (local testing) – deploy class inline
    const quiz = await this.computer.new(Quiz, [params]) as Quiz
    await new Promise(resolve => setTimeout(resolve, 2000))
    return quiz
  }

  /**
   * Add a student to a quiz's attempted list (teacher-only)
   */
  async addAttemptedStudent(quizId: string, studentPublicKey: string): Promise<void> {
    const quiz = await this.getQuiz(quizId)
    await quiz.addAttemptedStudent(studentPublicKey)
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  /**
   * Claim reward for a student (teacher-only, first correct answer wins)
   */
  async claimReward(quizId: string, studentPublicKey: string): Promise<void> {
    const quiz = await this.getQuiz(quizId)
    await quiz.claimReward(studentPublicKey)
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  /**
   * Get latest revision of a quiz (follows chain)
   */
  async getLatestQuiz(quizId: string): Promise<Quiz> {
    const latestRev = await this.computer.getLatestRev(quizId)
    return await this.computer.sync(latestRev) as Quiz
  }
}