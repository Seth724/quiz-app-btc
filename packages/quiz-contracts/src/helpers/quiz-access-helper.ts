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

  async createQuizAccess(quizId: string, studentPublicKey: string): Promise<QuizAccess> {
    if (!this.mod) {
      throw new Error('Module not deployed. Call deploy() first.')
    }
    
    const { tx, effect } = await this.computer.encode({
      exp: `new QuizAccess("${quizId}", "${studentPublicKey}")`,
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    return effect.res as unknown as QuizAccess
  }

  async getQuizAccess(accessId: string): Promise<QuizAccess> {
    return await this.computer.sync(accessId) as QuizAccess
  }
}