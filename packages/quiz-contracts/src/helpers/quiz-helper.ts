import { Computer } from '@bitcoin-computer/lib'

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
  async getQuiz(quizId: string): Promise<any> {
    return await this.computer.sync(quizId)
  }

  /**
   * Check if a quiz is currently active
   */
  async isQuizActive(quizId: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.isActive
  }

  /**
   * Check if the reward for a quiz has been claimed
   */
  async isRewardClaimed(quizId: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.isClaimed
  }

  /**
   * Get the public key of the student who claimed the reward
   */
  async getRewardClaimedBy(quizId: string): Promise<string> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.claimedBy
  }

  /**
   * Check if a student has already attempted a quiz
   */
  async hasStudentAttempted(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.hasStudentAttempted ? quiz.hasStudentAttempted(studentPublicKey) : false
  }

  /**
   * Check if a student can attempt a quiz
   * Returns true if:
   * - Quiz is active
   * - Student has not already attempted
   */
  async canStudentAttemptQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz: any = await this.getQuiz(quizId)
    return quiz.canStudentAttempt ? quiz.canStudentAttempt(studentPublicKey) : false
  }

  /**
   * Get the number of students who have attempted a quiz
   */
  async getAttemptCount(quizId: string): Promise<number> {
    const quiz: any = await this.getQuiz(quizId)
    const attemptedStudents = quiz.attemptedStudents || []
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
    const quiz: any = await this.getQuiz(quizId)

    return {
      title: quiz.title,
      questionText: quiz.questionText,
      options: quiz.options,
      rewardAmount: quiz.rewardAmount,
      entryFee: quiz.entryFee,
      isActive: quiz.isActive,
      isClaimed: quiz.isClaimed,
      claimedBy: quiz.claimedBy,
      attemptCount: (quiz.attemptedStudents || []).length,
      attemptedStudents: quiz.attemptedStudents || [],
      paymentTxId: quiz.paymentTxId
    }
  }

  /**
   * Deactivate a quiz (typically called by teacher)
   */
  async deactivateQuiz(quizId: string): Promise<void> {
    const quiz: any = await this.getQuiz(quizId)
    if (quiz.deactivate) {
      await quiz.deactivate()
    }
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  /**
   * Validate if an answer index is valid (0-3)
   */
  isValidAnswerIndex(answerIndex: number): boolean {
    return answerIndex >= 0 && answerIndex <= 3
  }

  /**
   * Get quizzes by teacher public key
   */
  async getQuizzesByTeacher(teacherPublicKey: string): Promise<any[]> {
    // Query for Quiz objects owned by the teacher using the deployed module spec
    const revs = await this.computer.query({
      publicKey: teacherPublicKey,
      mod: process.env.NEXT_PUBLIC_QUIZ_MOD
    })
    
    const quizzes = await Promise.all(
      revs.map(async (rev: string) => {
        const quiz = await this.computer.sync(rev)
        return quiz
      })
    )
    
    return quizzes
  }
}