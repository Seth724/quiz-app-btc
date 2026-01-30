import { Computer } from '@bitcoin-computer/lib'
import { QuizAttempt } from '../attempt.js'

export class AttemptHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
    return await this.computer.new(QuizAttempt, [quizId, studentPublicKey])
  }

  async getAttempt(attemptId: string): Promise<QuizAttempt> {
    return await this.computer.sync(attemptId) as QuizAttempt
  }

  async submitAnswers(attempt: QuizAttempt, answers: number[], correctAnswers: number[], rewardPerCorrect: bigint) {
    await attempt.submitAnswers(answers, correctAnswers, rewardPerCorrect)
  }

  async getScore(attempt: QuizAttempt): Promise<number> {
    return attempt.score
  }

  async getRewardEarned(attempt: QuizAttempt): Promise<bigint> {
    return attempt.rewardEarned
  }

  async isCompleted(attempt: QuizAttempt): Promise<boolean> {
    return attempt.isCompleted
  }
}