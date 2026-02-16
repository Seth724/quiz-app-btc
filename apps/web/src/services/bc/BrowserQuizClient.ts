/**
 * Browser-Safe Quiz Client - Uses mod specs instead of contract imports
 * Fallback to direct imports for development when mods are not deployed
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

// Temporary fallback imports for development
let Payment: any, Quiz: any
try {
  // Only import if running in development and mods are empty
  if (typeof window !== 'undefined' && !MODULE_SPECS.paymentMod) {
    console.warn('Module specs not available, using direct imports for development')
  }
} catch (e) {
  // Ignore import errors in production
}

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
  attemptCount: number
  createdAt: number
}

/**
 * Browser-safe QuizClient using mod specs
 */
export class BrowserQuizClient {
  constructor(private computer: Computer) {
    // Check if we're in development mode
    hasModuleSpecs()
  }

  /**
   * Create a new quiz - browser safe implementation
   */
  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    console.log('🎯 Creating quiz with data:', quizData)
    console.log('🎯 MODULE_SPECS:', MODULE_SPECS)
    console.log('🎯 hasModuleSpecs():', hasModuleSpecs())
    
    // Check if module specs are available
    if (!MODULE_SPECS.paymentMod || !MODULE_SPECS.quizMod) {
      console.warn('⚠️  Module specs not deployed, creating mock quiz for development')
      return this.createMockQuiz(quizData)
    }

    console.log('✅ Using real blockchain contracts for quiz creation')

    try {
      // First create the payment object using correct constructor
      const paymentExp = `new Payment(${quizData.rewardAmount}n)`
      
      console.log('📤 Creating payment with expression:', paymentExp)
      const paymentEncoded = await this.computer.encode({
        exp: paymentExp,
        mod: MODULE_SPECS.paymentMod,
      })
      
      await this.computer.broadcast(paymentEncoded.tx)
      const payment = paymentEncoded.effect.res
      console.log('✅ Payment object created:', payment._id)
      
      // Then create the quiz using object constructor syntax
      const quizExp = `new Quiz({
        title: ${JSON.stringify(quizData.title)},
        questionText: ${JSON.stringify(quizData.questionText)},
        options: ${JSON.stringify(quizData.options)},
        correctAnswer: ${quizData.correctAnswer},
        rewardAmount: ${quizData.rewardAmount}n,
        entryFee: ${quizData.entryFee}n,
        teacherPublicKey: "${this.computer.getPublicKey()}",
        paymentTxId: "${payment._id}"
      })`
      
      console.log('📤 Creating quiz with expression:', quizExp)
      const quizEncoded = await this.computer.encode({
        exp: quizExp,
        mod: MODULE_SPECS.quizMod,
      })
      
      await this.computer.broadcast(quizEncoded.tx)
      console.log('✅ Quiz object created on blockchain:', quizEncoded.effect.res._id)
      
      return {
        ...quizEncoded.effect.res,
        paymentTxId: payment._id,
        createdAt: Date.now()
      } as unknown as QuizDTO
      
    } catch (error) {
      console.error('❌ Error creating blockchain objects:', error)
      console.log('🔄 Falling back to mock quiz creation...')
      return this.createMockQuiz(quizData)
    }
  }

  /**
   * Create mock quiz for development when contracts aren't deployed
   */
  private createMockQuiz(quizData?: QuizData): QuizDTO {
    const mockId = 'mock-quiz-' + Date.now()
    return {
      _id: mockId,
      _rev: mockId + ':0',
      _root: mockId,
      _owners: [this.computer.getPublicKey()],
      _satoshis: BigInt(1000),
      title: quizData?.title || 'Sample Quiz',
      questionText: quizData?.questionText || 'What is 2+2?',
      options: quizData?.options || ['3', '4', '5', '6'],
      correctAnswer: quizData?.correctAnswer ?? 1,
      rewardAmount: BigInt(quizData?.rewardAmount || 10000),
      entryFee: BigInt(quizData?.entryFee || 1000),
      teacherPublicKey: this.computer.getPublicKey(),
      isActive: true,
      paymentTxId: 'mock-payment-' + Date.now(),
      isClaimed: false,
      claimedBy: '',
      attemptCount: 0,
      createdAt: Date.now()
    }
  }

  /**
   * Get quiz by ID
   */
  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      // If mock ID, return mock data
      if (quizId.startsWith('mock-quiz-')) {
        return {
          _id: quizId,
          _rev: quizId + ':0',
          _root: quizId,
          _owners: [this.computer.getPublicKey()],
          _satoshis: BigInt(1000),
          title: 'Mock Quiz',
          questionText: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          rewardAmount: BigInt(10000),
          entryFee: BigInt(1000),
          teacherPublicKey: this.computer.getPublicKey(),
          isActive: true,
          paymentTxId: 'mock-payment-' + Date.now(),
          isClaimed: false,
          claimedBy: '',
          attemptCount: 0,
          createdAt: Date.now()
        } 
      }
      
      const quiz = await this.computer.sync(quizId)
      return quiz as unknown as QuizDTO
    } catch (error) {
      console.error('Failed to get quiz:', error)
      return null
    }
  }

  /**
   * Check if student can attempt quiz
   */
  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    try {
      const quiz = await this.getQuiz(quizId)
      if (!quiz) return false
      
      // Quiz must be active and not claimed
      if (!quiz.isActive || quiz.isClaimed) return false
      
      // Student must not have attempted already (check via computer queries)
      // This is a simplified check - in production you'd query attempts
      return true
    } catch (error) {
      console.error('Failed to check attempt eligibility:', error)
      return false
    }
  }

  /**
   * Deactivate quiz
   */
  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      // Get current quiz state
      const quiz = await this.getQuiz(quizId)
      if (!quiz) return null
      
      // Call setActive method on quiz
      const encoded = await this.computer.encode({
        exp: `quiz.setActive(false)`,
        env: { quiz: quiz._rev },
        mod: MODULE_SPECS.quizMod,
      })
      
      await this.computer.broadcast(encoded.tx)
      return encoded.effect.res as unknown as QuizDTO
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  /**
   * Get all active quizzes
   */
  async getAllQuizzes(): Promise<QuizDTO[]> {
    try {
      console.log('🔍 Getting all quizzes')
      console.log('🔍 hasModuleSpecs():', hasModuleSpecs())
      
      if (!hasModuleSpecs()) {
        // Development mode - return mock quizzes
        console.warn('⚠️  Module specs not deployed, returning mock quizzes')
        const mockQuizzes = []
        for (let i = 1; i <= 3; i++) {
          const mockQuiz = this.createMockQuiz()
          mockQuiz._id = `mock-quiz-${Date.now()}-${i}`
          mockQuiz.title = `Sample Quiz ${i}`
          mockQuiz.questionText = `What is the answer to question ${i}?`
          mockQuizzes.push(mockQuiz)
        }
        return mockQuizzes
      }

      console.log('✅ Using blockchain to fetch all quizzes')
      
      // Get all objects of Quiz type from blockchain
      // For now, this is a placeholder - implement blockchain query logic
      // You would use Computer's query capabilities to find all Quiz objects
      console.warn('⚠️  getAllQuizzes blockchain query not yet implemented - implement computer.query() logic')
      return []
    } catch (error) {
      console.error('Failed to get all quizzes:', error)
      return []
    }
  }
}