import { Contract } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'

export class QuizAttempt extends Contract {
  quizId!: string
  studentPublicKey!: string
  selectedAnswer!: number
  isCorrect!: boolean
  rewardEarned!: bigint
  attemptedAt!: number
  isCompleted!: boolean

  constructor(quizId: string, studentPublicKey: string) {
    super({
      quizId,
      studentPublicKey,
      selectedAnswer: -1,
      isCorrect: false,
      rewardEarned: 0n,
      attemptedAt: Date.now(),
      isCompleted: false,
    })
  }

  /**
   * Now requires the student's QuizAccess token.
   */
  submitAnswer(
    access: QuizAccess,
    selectedAnswer: number,
    correctAnswer: number,
    rewardAmount: bigint,
  ) {
    if (this.isCompleted) throw new Error('Quiz already completed')

    // Access checks
    if (access.quizId !== this.quizId) throw new Error('Wrong access token for this quiz')
    if (access._owners[0] !== this.studentPublicKey) throw new Error('Access token not owned by this student')
    if (access.used) throw new Error('Access token already used')

    // Validate answer index
    if (selectedAnswer < 0 || selectedAnswer > 3) {
      throw new Error('Selected answer must be between 0-3')
    }

    // Consume token (single-use)
    access.markUsed()

    // Normal attempt logic (unchanged)
    this.selectedAnswer = selectedAnswer
    this.isCorrect = selectedAnswer === correctAnswer
    this.rewardEarned = this.isCorrect ? rewardAmount : 0n
    this.isCompleted = true
  }

  getResult() {
    return {
      quizId: this.quizId,
      studentPublicKey: this.studentPublicKey,
      selectedAnswer: this.selectedAnswer,
      isCorrect: this.isCorrect,
      rewardEarned: this.rewardEarned,
      attemptedAt: this.attemptedAt,
    }
  }
}