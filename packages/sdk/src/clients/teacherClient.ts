import { Computer } from '@bitcoin-computer/lib'
import { TeacherHelper, PaymentHelper } from '@quiz-app/contracts'
import type { QuizData, QuizDetails } from '@quiz-app/shared'

/**
 * TeacherClient - Clean interface for teacher operations
 */
export class TeacherClient {
  private computer: Computer
  private teacherHelper: TeacherHelper
  private paymentHelper: PaymentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.teacherHelper = new TeacherHelper(computer)
    this.paymentHelper = new PaymentHelper(computer)
  }

  /**
   * Create a new teacher account
   */
  async createTeacher(name: string, publicKey: string) {
    return await this.teacherHelper.createTeacher(name, publicKey)
  }

  /**
   * Get teacher by ID
   */
  async getTeacher(teacherId: string) {
    return await this.teacherHelper.getTeacher(teacherId)
  }

  /**
   * Create a quiz with reward payment
   */
  async createQuiz(quizData: QuizData) {
    // Get the teacher account first
    const teacher = await this.getOrCreateTeacher(quizData.title, this.computer.getPublicKey())
    const { quiz, paymentTxId } = await this.teacherHelper.createQuiz({
      ...quizData,
      teacher
    })
    
    // Return the quiz object with paymentTxId
    return { ...quiz, paymentTxId }
  }

  /**
   * Helper to get or create teacher account
   */
  private async getOrCreateTeacher(name: string, publicKey: string) {
    // For simplicity, we'll create a new teacher each time
    // In a real app, you'd want to store and retrieve the teacher ID
    return await this.teacherHelper.createTeacher(name, publicKey)
  }

  /**
   * Get quiz details
   */
  async getQuizDetails(quizId: string): Promise<QuizDetails> {
    const quiz = await this.computer.sync(quizId)
    return {
      id: quizId,
      title: (quiz as any).title,
      questionText: (quiz as any).questionText,
      options: (quiz as any).options,
      rewardAmount: (quiz as any).rewardAmount,
      entryFee: (quiz as any).entryFee,
      isActive: (quiz as any).isActive,
      isClaimed: (quiz as any).isClaimed,
      claimedBy: (quiz as any).claimedBy,
      attemptedStudents: (quiz as any).attemptedStudents,
      paymentTxId: (quiz as any).paymentTxId
    }
  }

  /**
   * Deactivate a quiz
   */
  async deactivateQuiz(quizId: string) {
    const quiz = await this.computer.sync(quizId)
    await (quiz as any).deactivate()
    await this.computer.sync(quizId)
  }

  /**
   * Withdraw payment
   */
  async withdrawPayment(paymentTxId: string) {
    return await this.paymentHelper.withdrawPaymentById(paymentTxId)
  }

  /**
   * Get quizzes by teacher
   */
  async getQuizzesByTeacher(teacherId: string) {
    return await this.teacherHelper.getQuizzesByTeacher(teacherId)
  }
}
