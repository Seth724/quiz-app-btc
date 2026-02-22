/**
 * Helper-based Quiz Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { QuizHelper, TeacherHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import type { QuizData } from '@quiz-app/shared'

export interface QuizDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string
  isClaimed: boolean
  claimedBy: string
  attemptedStudents: string[]
  attemptCount: number
  createdAt: number
}

export class HelperQuizClient {
  private quizHelper: QuizHelper
  private teacherHelper: TeacherHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }

    // Initialize helpers with module specs
    this.quizHelper = new QuizHelper(computer, MODULE_SPECS.quizMod)
    this.teacherHelper = new TeacherHelper(
      computer,
      MODULE_SPECS.teacherMod,
      MODULE_SPECS.quizMod,
      MODULE_SPECS.paymentMod
    )
    this.utils = new BlockchainUtils(computer)
  }

  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    console.log('🎯 Creating quiz with data:', quizData)

    // ✅ FIX: look up teacher by publicKey
    const pk = this.computer.getPublicKey()
    let teacher = await this.teacherHelper.getTeacherByPublicKey(pk)

    if (!teacher) {
      console.log('📝 Creating new teacher...')
      teacher = await this.teacherHelper.createTeacher('Teacher', pk)
    }

    const { quiz, paymentTxId } = await this.teacherHelper.createQuiz({
      title: quizData.title,
      questionText: quizData.questionText,
      options: quizData.options,
      correctAnswer: quizData.correctAnswer,
      rewardAmount: quizData.rewardAmount,
      entryFee: quizData.entryFee,
      teacher,
    })

    const syncedQuiz = await this.utils.syncOrMine<any>(quiz._id)
    const attemptedStudents = syncedQuiz.attemptedStudents || []

    return {
      ...syncedQuiz,
      paymentTxId,
      attemptedStudents,
      attemptCount: attemptedStudents.length,
      createdAt: syncedQuiz.createdAt || Date.now(),
    } as QuizDTO
  }

  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.utils.syncOrMine<any>(quizId)
      const attemptedStudents = quiz.attemptedStudents || []
      return {
        ...quiz,
        attemptedStudents,
        attemptCount: attemptedStudents.length,
      } as QuizDTO
    } catch (error) {
      console.error('Failed to get quiz:', error)
      return null
    }
  }

  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    return await this.quizHelper.canStudentAttemptQuiz(quizId, studentPublicKey)
  }

  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      await this.quizHelper.deactivateQuiz(quizId)
      return await this.getQuiz(quizId)
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  async getAllQuizzes(): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })

    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.utils.syncOrMine<any>(id)
        if (quiz && quiz.isActive) {
          const attemptedStudents = quiz.attemptedStudents || []
          quizzes.push({
            ...quiz,
            attemptedStudents,
            attemptCount: attemptedStudents.length,
          } as QuizDTO)
        }
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }

    return quizzes
  }

  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    console.log(`🔍 Fetching quizzes for teacherPublicKey: ${teacherPublicKey}`)
    const quizzes = await this.quizHelper.getQuizzesByTeacher(teacherPublicKey)

    const quizDTOs: QuizDTO[] = quizzes.map((quiz) => ({
      ...quiz,
      attemptedStudents: quiz.attemptedStudents || [],
      attemptCount: (quiz.attemptedStudents || []).length,
      createdAt: quiz.createdAt || Date.now(),
    }))

    console.log('🙌🙌🙌Fetched quizzes for teacher:', quizDTOs)
    return quizDTOs
  }
}
