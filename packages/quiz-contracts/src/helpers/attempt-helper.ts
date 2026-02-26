import { Computer } from '@bitcoin-computer/lib'
import { QuizAttempt } from '../attempt.js'
import { Quiz } from '../quiz.js'
import { QuizAccess } from '../quiz-access.js'

export class AttemptHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }
  async deploy(): Promise<string> {
    // export the class so SES can resolve "QuizAttempt" inside expressions
    this.mod = await this.computer.deploy(`export ${QuizAttempt}`)
    return this.mod
  }

  // async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
  //   return await this.computer.new(QuizAttempt, [quizId, studentPublicKey], this.mod) as QuizAttempt
  // }
  async createAttempt(quizId: string, studentPublicKey: string): Promise<QuizAttempt> {
  if (!this.mod) throw new Error('QuizAttemptHelper not deployed')

  // Use expression string to avoid bundler/class interop issues
  const exp = `new QuizAttempt("${quizId}", "${studentPublicKey}")`

  const encoded = await this.computer.encode({ exp, mod: this.mod })
  await this.computer.broadcast(encoded.tx)

  const res = encoded?.effect?.res as { _id?: string } | string | undefined
  const resId: string | undefined =
    (typeof res === 'object' && res !== null ? res._id : undefined) ??
    (typeof res === 'string' ? res : undefined)

  if (!resId) throw new Error('Failed to create attempt: could not extract result ID')

  return (await this.computer.sync(resId)) as unknown as QuizAttempt
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