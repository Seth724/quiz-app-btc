import { Computer } from '@bitcoin-computer/lib'
import { StudentHelper } from '@quiz-app/contracts'
import type { AttemptResult } from '@quiz-app/shared'

/**
 * StudentClient - Clean interface for student operations
 */
export class StudentClient {
  private computer: Computer
  private studentHelper: StudentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.studentHelper = new StudentHelper(computer)
  }

  /**
   * Create a new student account
   */
  async createStudent(name: string, publicKey: string) {
    return await this.studentHelper.createStudent(name, publicKey)
  }

  /**
   * Get student by ID
   */
  async getStudent(studentId: string) {
    return await this.studentHelper.getStudent(studentId)
  }

  /**
   * Attempt a quiz using QuizAttempt contract with access token
   */
  async attemptQuizWithAccess(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptResult> {
    return await this.studentHelper.attemptQuizWithQuizAttempt(
      quizId,
      selectedAnswer,
      accessTokenId
    )
  }

  /**
   * Get quiz by ID
   */
  async getQuiz(quizId: string) {
    return await this.studentHelper.getQuiz(quizId)
  }
}
