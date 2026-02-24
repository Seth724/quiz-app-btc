import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher.js'
import { Quiz } from '../quiz.js'
import { Payment } from '../payment.js'
import { PaymentHelper } from './payment-helper.js'

export class TeacherHelper {
  computer: Computer
  paymentHelper: PaymentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  async createTeacher(name: string, publicKey: string): Promise<Teacher> {
    const teacher = (await this.computer.new(Teacher, [name, publicKey])) as Teacher
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return teacher
  }

  async getTeacher(teacherId: string): Promise<Teacher> {
    return (await this.computer.sync(teacherId)) as Teacher
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return (await this.computer.sync(quizId)) as Quiz
  }

  /**
   * Step 1: Create reward Payment only.
   * Returns both the Payment object and its id (paymentTxId).
   */
  async createQuizRewardPayment(rewardAmount: bigint): Promise<{ payment: Payment; paymentTxId: string }> {
    console.log(`💰 Creating reward payment: ${rewardAmount} sats`)
    const payment = await this.paymentHelper.createPayment(rewardAmount)
    const paymentTxId = await payment._id
    console.log(`✅ Reward payment created: ${paymentTxId}`)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { payment, paymentTxId }
  }

  /**
   * Step 2: Create Quiz only, but requires a paymentTxId already created.
   * Also adds quizId to teacher object.
   */
  async createQuizWithPayment(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
    paymentTxId: string
  }): Promise<Quiz> {
    console.log(`🎯 Creating quiz: ${params.title}`)

    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    const teacherPubKey = await params.teacher.publicKey

    const quiz = (await this.computer.new(Quiz, [
      {
        title: params.title,
        questionText: params.questionText,
        options: params.options,
        correctAnswer: params.correctAnswer,
        rewardAmount: params.rewardAmount,
        entryFee: params.entryFee,
        teacherPublicKey: teacherPubKey,
        paymentTxId: params.paymentTxId,
      },
    ])) as Quiz

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Add quiz to teacher list
    const teacherId = await params.teacher._id
    const updatedTeacher = await this.getTeacher(teacherId)
    const quizId = await quiz._id
    await updatedTeacher.addQuiz(quizId)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log(`✅ Quiz created successfully: ${quizId}`)
    return quiz
  }

  /**
   * Convenience wrapper (optional):
   * Does both steps: create payment + create quiz.
   * Keeps your old API working if other tests use it.
   */
  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<{ quiz: Quiz; paymentTxId: string }> {
    const { paymentTxId } = await this.createQuizRewardPayment(params.rewardAmount)
    const quiz = await this.createQuizWithPayment({ ...params, paymentTxId })
    return { quiz, paymentTxId }
  }

  /**
   * If you still want a quiz without payment object.
   */
  async createQuizOnly(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<Quiz> {
    console.log(`🎯 Teacher creating quiz (no payment object): ${params.title}`)

    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    const teacherPubKey = await params.teacher.publicKey
    const quiz = (await this.computer.new(Quiz, [
      {
        title: params.title,
        questionText: params.questionText,
        options: params.options,
        correctAnswer: params.correctAnswer,
        rewardAmount: params.rewardAmount,
        entryFee: params.entryFee,
        teacherPublicKey: teacherPubKey,
        paymentTxId: '',
      },
    ])) as Quiz

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const teacherId = await params.teacher._id
    const updatedTeacher = await this.getTeacher(teacherId)
    const quizId = await quiz._id
    await updatedTeacher.addQuiz(quizId)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log(`✅ Quiz-only created successfully: ${quizId}`)
    return quiz
  }

  async deactivateQuiz(teacher: Teacher, quizId: string) {
    const quiz = await this.getQuiz(quizId)

    const quizTeacherPubKey = await quiz.teacherPublicKey
    const teacherPubKey = await teacher.publicKey
    if (quizTeacherPubKey !== teacherPubKey) {
      throw new Error('Only the quiz creator can deactivate this quiz')
    }

    await quiz.deactivate()
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}