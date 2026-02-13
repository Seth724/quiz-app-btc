import { Computer } from '@bitcoin-computer/lib'
import { QuizAccess } from '../quiz-access.js'

export class QuizAccessHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${QuizAccess}`)
    return this.mod
  }

  /**
   * Teacher mints an access bag (usually 1n) that the teacher owns initially.
   * Then teacher uses SALE offer to sell it to a student for the entry fee.
   */
  async createQuizAccess(quizId: string, amount: bigint = 1n): Promise<QuizAccess> {
    if (!this.mod) throw new Error('QuizAccess module not deployed')
    const to = this.computer.getPublicKey()
    return (await this.computer.new(QuizAccess, [to, quizId, amount, 'QACC'], this.mod)) as QuizAccess
  }
}