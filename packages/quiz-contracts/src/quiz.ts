import { Contract } from '@bitcoin-computer/lib'

export interface Question {
  text: string
  options: string[]
  correctAnswer: number // Index of correct option
}

export class Quiz extends Contract {
  title!: string
  description!: string
  questionTexts!: string[]
  questionOptions!: string[][] // Array of option arrays
  correctAnswers!: number[]
  rewardPerCorrect!: bigint
  totalReward!: bigint
  teacherPublicKey!: string
  isActive!: boolean
  createdAt!: number
  duration?: number
  attemptedStudents!: string[]
  attempts!: string[]
  paymentTxIds!: string[] // Array of payment transaction IDs for each question
  questionRewardsClaimed!: boolean[] // Track which questions have been claimed

  constructor({
    title,
    description,
    questions,
    rewardPerCorrect,
    teacherPublicKey,
    duration,
    paymentTxIds
  }: {
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    teacherPublicKey: string
    duration?: number
    paymentTxIds?: string[]
  }) {
    super({
      _owners: [teacherPublicKey],
      title,
      description,
      questionTexts: questions.map(q => q.text),
      questionOptions: questions.map(q => q.options),
      correctAnswers: questions.map(q => q.correctAnswer),
      rewardPerCorrect,
      totalReward: BigInt(questions.length) * rewardPerCorrect,
      teacherPublicKey,
      isActive: true,
      createdAt: Date.now(),
      duration,
      attemptedStudents: [],
      attempts: [],
      paymentTxIds: paymentTxIds || [], // Initialize with empty array if not provided
      questionRewardsClaimed: Array(questions.length).fill(false) // Initialize all questions as unclaimed
    })
  }

  deactivate() {
    this.isActive = false
  }

  getQuestionCount(): number {
    return this.questionTexts.length
  }

  hasStudentAttempted(studentPublicKey: string): boolean {
    return this.attemptedStudents.includes(studentPublicKey)
  }

  addAttemptedStudent(studentPublicKey: string) {
    if (this.hasStudentAttempted(studentPublicKey)) {
      throw new Error('Student has already attempted this quiz')
    }

    this.attemptedStudents.push(studentPublicKey)
  }

  // Return questions without correct answers for students
  getStudentQuestions() {
    if (!this.isActive) {
      throw new Error('Quiz is not active')
    }

    return this.questionTexts.map((text, index) => ({
      text,
      options: this.questionOptions[index]
    }))
  }

  getTotalAttempts(): number {
    return this.attempts.length
  }

  // Get full questions (including correct answers) for internal use
  get questions(): Question[] {
    return this.questionTexts.map((text, index) => ({
      text,
      options: this.questionOptions[index],
      correctAnswer: this.correctAnswers[index]
    }))
  }

  // Check if a specific question reward has been claimed
  isQuestionRewardClaimed(questionIndex: number): boolean {
    if (questionIndex < 0 || questionIndex >= this.questionRewardsClaimed.length) {
      throw new Error('Invalid question index')
    }
    return this.questionRewardsClaimed[questionIndex]
  }

  // Claim a reward for a specific question if not already claimed
  claimQuestionReward(questionIndex: number, _studentPublicKey: string): boolean {
    if (questionIndex < 0 || questionIndex >= this.questionRewardsClaimed.length) {
      throw new Error('Invalid question index')
    }

    if (this.questionRewardsClaimed[questionIndex]) {
      return false // Already claimed by someone else
    }

    // Mark the question as claimed
    this.questionRewardsClaimed[questionIndex] = true
    return true
  }

  // Get the payment transaction ID for a specific question
  getPaymentTxIdForQuestion(questionIndex: number): string | undefined {
    if (questionIndex < 0 || questionIndex >= this.paymentTxIds.length) {
      return undefined
    }
    return this.paymentTxIds[questionIndex]
  }

  // Simple method to check if a student can attempt the quiz
  canStudentAttempt(studentPublicKey: string): boolean {
    return !this.hasStudentAttempted(studentPublicKey) && this.isActive
  }
}