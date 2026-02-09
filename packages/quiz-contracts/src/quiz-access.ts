import { Contract } from '@bitcoin-computer/lib'

/**
 * QuizAccess = right to attempt a quiz.
 * Ownership (_owners) is what matters on-chain.
 */
export class QuizAccess extends Contract {
  quizId!: string
  createdAt!: number
  used!: boolean

  constructor(quizId: string) {
    super({
      quizId,
      createdAt: Date.now(),
      used: false,
    })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  markUsed() {
    if (this.used) throw new Error('QuizAccess already used')
    this.used = true
  }
}