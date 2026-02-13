import { Contract } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'

/**
 * Simplified QuizAttempt for single-question quiz architecture
 * Tracks a student's single attempt at a single-question quiz
 *
 * Access enforcement:
 * - requires a QuizAccess token owned by the student
 * - requires token.quizId === this.quizId
 * - requires token.amount > 0n
 * - burns 1 unit on submit (so it cannot be reused)
 */
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

  submitAnswer(access: QuizAccess, selectedAnswer: number, correctAnswer: number, rewardAmount: bigint) {
    if (this.isCompleted) throw new Error('Quiz already completed')

    // --- Access token checks ---
    if (access.quizId !== this.quizId) throw new Error('Invalid access token for this quiz')
    if (!access._owners || access._owners[0] !== this.studentPublicKey)
      throw new Error('Access token is not owned by this student')
    if (access.amount <= 0n) throw new Error('Access token already used')

    // Validate answer index
    if (selectedAnswer < 0 || selectedAnswer > 3) throw new Error('Selected answer must be between 0-3')

    // Consume exactly ONE access unit
    access.burn(1n)

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