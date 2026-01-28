import { Computer } from '@bitcoin-computer/lib'
import { QuizAttempt } from '@quiz-app/contracts'

export class QuizAttemptHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  /**
   * Create a new quiz attempt
   */
  async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
    const attemptModSpec = process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC
    if (!attemptModSpec) {
      throw new Error('QuizAttempt module spec not found. Please deploy contracts first.')
    }
    
    // Load the deployed module and extract the QuizAttempt class
    const moduleExports = await this.computer.load(attemptModSpec)
    const QuizAttemptClass = (moduleExports as any).QuizAttempt || (moduleExports as any).default
    if (!QuizAttemptClass) {
      throw new Error('QuizAttempt class not found in deployed module')
    }
    
    const attempt = await this.computer.new(QuizAttemptClass, [quizId, studentPublicKey])
    return attempt
  }

  /**
   * Get attempt by ID
   */
  async getAttempt(attemptId: string): Promise<QuizAttempt | null> {
    try {
      const attempt = await this.computer.sync(attemptId) as QuizAttempt
      return attempt
    } catch (error) {
      console.error('Error getting attempt:', error)
      return null
    }
  }

  /**
   * Get latest attempt state
   */
  async getLatestAttempt(attemptId: string): Promise<QuizAttempt | null> {
    try {
      const [latestRev] = await this.computer.query({ ids: [attemptId] })
      if (latestRev) {
        const attempt = await this.computer.sync(latestRev) as QuizAttempt
        return attempt
      }
      return null
    } catch (error) {
      console.error('Error getting latest attempt:', error)
      return null
    }
  }

  /**
   * Check if student has attempted a quiz
   */
  async hasStudentAttemptedQuiz(quizId: string, studentPublicKey: string): Promise<boolean> {
    try {
      const revs = await this.computer.query({ publicKey: studentPublicKey })
      
      for (const rev of revs) {
        try {
          const obj = await this.computer.sync(rev)
          // Check if this is a QuizAttempt object for the specific quiz
          if (obj && typeof obj === 'object' && 'quizId' in obj && 'studentPublicKey' in obj) {
            const attempt = obj as QuizAttempt
            if (attempt.quizId === quizId && attempt.studentPublicKey === studentPublicKey) {
              return true
            }
          }
        } catch (error) {
          // Skip objects that can't be synced
          continue
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking student attempt:', error)
      return false
    }
  }

  /**
   * Get all attempts for a quiz
   */
  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    try {
      const revs = await this.computer.query({ limit: 100 })
      const attempts: QuizAttempt[] = []
      
      for (const rev of revs) {
        try {
          const obj = await this.computer.sync(rev)
          // Check if this is a QuizAttempt object for the specific quiz
          if (obj && typeof obj === 'object' && 'quizId' in obj && 'studentPublicKey' in obj) {
            const attempt = obj as QuizAttempt
            if (attempt.quizId === quizId) {
              attempts.push(attempt)
            }
          }
        } catch (error) {
          // Skip objects that can't be synced
          continue
        }
      }
      
      return attempts
    } catch (error) {
      console.error('Error getting quiz attempts:', error)
      return []
    }
  }

  /**
   * Get all attempts for a student
   */
  async getStudentAttempts(studentPublicKey: string): Promise<QuizAttempt[]> {
    try {
      const revs = await this.computer.query({ publicKey: studentPublicKey })
      const attempts: QuizAttempt[] = []
      
      for (const rev of revs) {
        try {
          const obj = await this.computer.sync(rev)
          // Check if this is a QuizAttempt object
          if (obj && typeof obj === 'object' && 'quizId' in obj && 'studentPublicKey' in obj && 'answers' in obj) {
            attempts.push(obj as QuizAttempt)
          }
        } catch (error) {
          // Skip objects that can't be synced
          continue
        }
      }
      
      return attempts
    } catch (error) {
      console.error('Error getting student attempts:', error)
      return []
    }
  }
}