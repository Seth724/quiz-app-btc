/**
 * Browser-Safe Quiz Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

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

/**
 * Browser-safe QuizClient using deployed module specs
 * Follows the exact test flow: create payment first, then quiz
 */
export class BrowserQuizClient {
  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  /**
   * Create a new quiz following the test flow:
   * 1. Create Payment object with reward amount
   * 2. Create Quiz referencing the paymentTxId
   */
  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    console.log('🎯 Creating quiz with data:', quizData)

    try {
      // STEP 1: Create the payment object with reward amount
      console.log('📤 Creating payment...')
      const paymentEncoded = await this.computer.encode({
        exp: `new Payment(${quizData.rewardAmount}n)`,
        mod: MODULE_SPECS.paymentMod,
      })

      await this.computer.broadcast(paymentEncoded.tx)
      const payment = paymentEncoded.effect.res
      const paymentTxId = payment._id
      console.log('✅ Payment created:', paymentTxId)

      // STEP 2: Create the quiz referencing the payment
      // Using the exact syntax from the test file
      console.log('📤 Creating quiz...')
      const quizEncoded = await this.computer.encode({
        exp: `new Quiz({
          title: "${quizData.title}",
          questionText: "${quizData.questionText}",
          options: ${JSON.stringify(quizData.options)},
          correctAnswer: ${quizData.correctAnswer},
          rewardAmount: ${quizData.rewardAmount}n,
          entryFee: ${quizData.entryFee}n,
          teacherPublicKey: "${this.computer.getPublicKey()}",
          paymentTxId: "${paymentTxId}"
        })`,
        mod: MODULE_SPECS.quizMod,
      })

      await this.computer.broadcast(quizEncoded.tx)
      const quiz = quizEncoded.effect.res
      const quizId = quiz._id
      console.log('✅ Quiz created:', quizId)

      // Sync to get latest state
      const syncedQuiz = await this.computer.sync(quizId)

      return {
        ...syncedQuiz,
        paymentTxId,
        attemptedStudents: syncedQuiz.attemptedStudents || [],
        attemptCount: 0,
        createdAt: Date.now()
      } as QuizDTO
    } catch (error: any) {
      console.error('❌ Quiz creation error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      throw new Error(`Failed to create quiz: ${error.message}`)
    }
  }

  /**
   * Get quiz by ID - sync from blockchain
   */
  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.computer.sync(quizId)
      return {
        ...quiz,
        attemptedStudents: quiz.attemptedStudents || [],
        attemptCount: (quiz.attemptedStudents || []).length,
      } as QuizDTO
    } catch (error) {
      console.error('Failed to get quiz:', error)
      return null
    }
  }

  /**
   * Check if student can attempt quiz
   */
  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    if (!quiz) return false
    
    // Quiz must be active and not claimed
    if (!quiz.isActive || quiz.isClaimed) return false
    
    // Student must not have attempted already
    if (quiz.attemptedStudents?.includes(studentPublicKey)) return false
    
    return true
  }

  /**
   * Deactivate quiz
   */
  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.getQuiz(quizId)
      if (!quiz) return null

      const encoded = await this.computer.encode({
        exp: `quiz.deactivate()`,
        env: { quiz: quiz._rev },
        mod: MODULE_SPECS.quizMod,
      })

      await this.computer.broadcast(encoded.tx)
      return await this.getQuiz(quizId)
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  /**
   * Get all active quizzes from blockchain
   */
  async getAllQuizzes(): Promise<QuizDTO[]> {
    console.log('🔍 Getting all quizzes from blockchain')

    // Query all Quiz objects from blockchain
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })
    
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.computer.sync(id)
        if (quiz && quiz.isActive) {
          quizzes.push({
            ...quiz,
            attemptedStudents: quiz.attemptedStudents || [],
            attemptCount: (quiz.attemptedStudents || []).length,
          } as QuizDTO)
        }
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }
    
    console.log(`✅ Found ${quizzes.length} active quizzes`)
    return quizzes
  }

  /**
   * Get quizzes by teacher public key
   */
  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizMod,
      publicKey: teacherPublicKey 
    })
    
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.computer.sync(id)
        quizzes.push({
          ...quiz,
          attemptedStudents: quiz.attemptedStudents || [],
          attemptCount: (quiz.attemptedStudents || []).length,
        } as QuizDTO)
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }
    
    return quizzes
  }
}
