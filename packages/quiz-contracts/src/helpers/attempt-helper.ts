import { Computer } from '@bitcoin-computer/lib'
import { QuizAttempt } from '../attempt.js'
import { Quiz } from '../quiz.js'
import { QuizAccess } from '../quiz-access.js'

export class AttemptHelper {
  computer: Computer
  constructor(computer: Computer) {
    this.computer = computer
  }

  async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
    return await this.computer.new(QuizAttempt, [quizId, studentPublicKey])
  }

  async getAttempt(attemptId: string): Promise<QuizAttempt> {
    return (await this.computer.sync(attemptId)) as QuizAttempt
  }

  /**
   * New: Submit answer with access token enforcement.
   */
  async submitAnswerWithAccess(
    attempt: QuizAttempt,
    access: QuizAccess,
    selectedAnswer: number,
    quiz: Quiz,
  ): Promise<{ isCorrect: boolean; rewardEarned: bigint; selectedAnswer: number }> {
    await attempt.submitAnswer(access, selectedAnswer, await quiz.correctAnswer, await quiz.rewardAmount)

    return {
      isCorrect: await attempt.isCorrect,
      rewardEarned: await attempt.rewardEarned,
      selectedAnswer: await attempt.selectedAnswer,
    }
  }
}