import { Contract } from '@bitcoin-computer/lib'

export class Teacher extends Contract {
  name!: string
  publicKey!: string
  createdQuizzes!: string[]

  constructor(name: string, publicKey: string) {
    super({
      name,
      publicKey,
      createdQuizzes: []
    })
  }

  // Add a quiz to the teacher's list
  addQuiz(quizId: string) {
    this.createdQuizzes.push(quizId)
  }

  // Validate quiz creation parameters
  static validateQuizParams(questionText: string, options: string[], correctAnswer: number, rewardAmount: bigint): void {
    if (!questionText || questionText.trim().length === 0) {
      throw new Error('Question text cannot be empty')
    }

    if (options.length !== 4) {
      throw new Error('Quiz must have exactly 4 options')
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      throw new Error('Correct answer must be between 0-3')
    }

    if (rewardAmount <= 0) {
      throw new Error('Reward must be greater than 0')
    }
  }

  getQuizCount(): number {
    return this.createdQuizzes.length
  }
}