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
  paymentTxId?: string // Optional payment transaction ID for rewards
  
  constructor({
    title,
    description,
    questions,
    rewardPerCorrect,
    teacherPublicKey,
    duration,
    paymentTxId
  }: {
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    teacherPublicKey: string
    duration?: number
    paymentTxId?: string
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
      paymentTxId
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
}