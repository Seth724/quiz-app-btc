import { Contract } from '@bitcoin-computer/lib'
import { QuizAttempt } from './attempt.js'
import type { Quiz } from './quiz.js'

export class Student extends Contract {
  name!: string
  publicKey!: string
  completedQuizzes!: string[]
  totalEarnings!: bigint
  registeredAt!: number
  
  constructor(name: string, publicKey: string) {
    super({
      name,
      publicKey,
      completedQuizzes: [],
      totalEarnings: 0n,
      registeredAt: Date.now()
    })
  }

  canAttemptQuiz(quiz: Quiz): boolean {
    // Check if quiz exists and is active
    if (!quiz.isActive) {
      return false
    }
    
    // Check if student has already attempted this quiz
    if (quiz.hasStudentAttempted(this.publicKey)) {
      return false
    }
    
    return true
  }

  completeQuiz(quizId: string, earnedReward: bigint) {
    this.completedQuizzes.push(quizId)
    this.totalEarnings += earnedReward
  }

  getCompletedQuizCount(): number {
    return this.completedQuizzes.length
  }

  hasCompletedQuiz(quizId: string): boolean {
    return this.completedQuizzes.includes(quizId)
  }
}