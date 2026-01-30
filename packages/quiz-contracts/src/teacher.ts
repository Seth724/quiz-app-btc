import { Contract } from '@bitcoin-computer/lib'
import { Question } from './quiz.js'

export class Teacher extends Contract {
  name!: string
  publicKey!: string
  createdQuizzes!: string[]
  registeredAt!: number

  constructor(name: string, publicKey: string) {
    super({
      name,
      publicKey,
      createdQuizzes: [],
      registeredAt: Date.now()
    })
  }

  // Add a quiz to the teacher's list (called externally after quiz creation)
  addQuiz(quizId: string) {
    this.createdQuizzes.push(quizId)
  }

  // Validate quiz creation parameters (called before external creation)
  static validateQuizParams(questions: Question[], rewardPerCorrect: bigint): void {
    if (questions.length === 0) {
      throw new Error('Quiz must have at least one question')
    }

    if (rewardPerCorrect <= 0) {
      throw new Error('Reward must be greater than 0')
    }
  }

  getQuizCount(): number {
    return this.createdQuizzes.length
  }
}