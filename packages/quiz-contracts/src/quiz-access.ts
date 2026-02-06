import { Contract } from '@bitcoin-computer/lib'

/**
 * QuizAccess contract represents the right to attempt a quiz
 * This contract is swapped between student and teacher during the access purchase process
 */
export class QuizAccess extends Contract {
  quizId!: string
  studentPublicKey!: string
  createdAt!: number
  
  constructor(quizId: string, studentPublicKey: string) {
    super({
      quizId,
      studentPublicKey,
      createdAt: Date.now()
    })
  }

  /**
   * Transfer ownership of this quiz access to another public key
   * @param to - Public key of the new owner
   */
  transfer(to: string) {
    this._owners = [to]
  }
}