/**
 * Base type for all contract metadata fields
 */
export interface ContractMetadata {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis?: bigint
}

/**
 * QuizAccess contract type
 * Fungible access token for quiz participation
 */
export interface QuizAccessType extends ContractMetadata {
  quizId: string
  amount: bigint
  symbol: string
}

/**
 * Payment contract type
 * Holds reward funds for quiz winners
 */
export interface PaymentType extends ContractMetadata {
  _satoshis: bigint
}

/**
 * Quiz contract type
 * Single-question quiz with reward
 */
export interface QuizType extends ContractMetadata {
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string
  isClaimed: boolean
  claimedBy: string
  attemptedStudents: string[]
}

/**
 * QuizAttempt contract type
 * Tracks a student's attempt at a quiz
 */
export interface QuizAttemptType extends ContractMetadata {
  quizId: string
  studentPublicKey: string
  selectedAnswer: number
  isCorrect: boolean
  rewardEarned: bigint
  attemptedAt: number
  isCompleted: boolean
}

/**
 * Teacher contract type
 */
export interface TeacherType extends ContractMetadata {
  name: string
  publicKey: string
  createdQuizzes: string[]
}

/**
 * Student contract type
 */
export interface StudentType extends ContractMetadata {
  name: string
  publicKey: string
  attemptedQuizzes: string[]
  claimedRewards: bigint
}

/**
 * QuizAccessSale contract type
 * Atomic exchange contract for selling quiz access
 */
export interface QuizAccessSaleType {
  exec(o: QuizAccessType, p: PaymentType): [PaymentType, QuizAccessType]
}

/**
 * Withdraw contract type
 * Reduces payment to dust and releases funds
 */
export interface WithdrawType {
  exec(payments: PaymentType[]): void
}

/**
 * PaymentMock type (for testing)
 */
export interface PaymentMockType {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]
  transfer(to: string): void
  setSatoshis(a: bigint): void
}
