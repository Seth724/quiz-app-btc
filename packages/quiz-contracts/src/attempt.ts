import { Contract } from '@bitcoin-computer/lib'

/**
 * Simplified QuizAttempt for single-question quiz architecture
 * Tracks a student's single attempt at a single-question quiz
 */
export class QuizAttempt extends Contract {
  quizId!: string
  studentPublicKey!: string
  selectedAnswer!: number // Single answer index (0-3)
  isCorrect!: boolean
  rewardEarned!: bigint
  attemptedAt!: number // Timestamp
  isCompleted!: boolean

  constructor(quizId: string, studentPublicKey: string) {
    super({
      quizId,
      studentPublicKey,
      selectedAnswer: -1, // Not answered yet
      isCorrect: false,
      rewardEarned: 0n,
      attemptedAt: Date.now(),
      isCompleted: false
    })
  }

  /**
   * Submit answer for the single question
   * @param selectedAnswer - Answer index (0-3)
   * @param correctAnswer - Correct answer index
   * @param rewardAmount - Reward amount for correct answer
   */
  submitAnswer(selectedAnswer: number, correctAnswer: number, rewardAmount: bigint) {
    if (this.isCompleted) {
      throw new Error('Quiz already completed')
    }

    // Validate answer index
    if (selectedAnswer < 0 || selectedAnswer > 3) {
      throw new Error('Selected answer must be between 0-3')
    }

    this.selectedAnswer = selectedAnswer
    this.isCorrect = selectedAnswer === correctAnswer
    this.rewardEarned = this.isCorrect ? rewardAmount : 0n
    this.isCompleted = true
  }

  /**
   * Get attempt result summary
   */
  getResult() {
    return {
      quizId: this.quizId,
      studentPublicKey: this.studentPublicKey,
      selectedAnswer: this.selectedAnswer,
      isCorrect: this.isCorrect,
      rewardEarned: this.rewardEarned,
      attemptedAt: this.attemptedAt
    }
  }
}