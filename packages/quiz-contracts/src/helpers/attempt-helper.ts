import type { Computer } from '@bitcoin-computer/lib'
import { loadExportedClass } from './contract-loader.js'

export class AttemptHelper {
  computer: Computer
  quizAttemptMod: string

  constructor(computer: Computer, quizAttemptMod: string) {
    this.computer = computer
    this.quizAttemptMod = quizAttemptMod
  }

  async createAttempt(quizId: string, studentPublicKey: string): Promise<any> {
    const QuizAttempt = await loadExportedClass<any>(this.computer, this.quizAttemptMod, 'QuizAttempt')
    return await this.computer.new(QuizAttempt, [quizId, studentPublicKey])
  }

  async getAttempt(attemptId: string): Promise<any> {
    return await this.computer.sync(attemptId)
  }

  /**
   * New: Submit answer with access token enforcement.
   */
  async submitAnswerWithAccess(
    attempt: any,
    access: any,
    selectedAnswer: number,
    quiz: any
  ): Promise<{ isCorrect: boolean; rewardEarned: bigint; selectedAnswer: number }> {
    await attempt.submitAnswer(access, selectedAnswer, await quiz.correctAnswer, await quiz.rewardAmount)

    return {
      isCorrect: await attempt.isCorrect,
      rewardEarned: await attempt.rewardEarned,
      selectedAnswer: await attempt.selectedAnswer,
    }
  }
}
