/**
 * Quiz-related types
 */
export interface QuizData {
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  paymentTxId: string
}

export interface QuizDetails {
  id: string
  title: string
  questionText: string
  options: string[]
  rewardAmount: bigint
  entryFee: bigint
  isActive: boolean
  isClaimed: boolean
  claimedBy: string
  attemptedStudents: string[]
  paymentTxId: string
}

export enum QuizStatus {
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  INACTIVE = 'inactive'
}

/**
 * Quiz attempt types
 */
export interface AttemptResult {
  isCorrect: boolean
  rewardEarned: bigint
  selectedAnswer: number
}

export interface QuizAttemptData {
  quizId: string
  studentPublicKey: string
  selectedAnswer: number
  isCorrect: boolean
  rewardEarned: bigint
  attemptedAt: number
  isCompleted: boolean
}
