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
    const teacher = (await this.computer.new(Teacher, [name, publicKey])) as unknown as Teacher
    await new Promise((r) => setTimeout(r, 3000))
    return teacher
  }

  async getTeacher(teacherId: string): Promise<Teacher> {
    return (await this.computer.sync(teacherId)) as unknown as Teacher
  }

  // 1) create reward payment only
  async createRewardPayment(rewardAmount: bigint): Promise<Payment> {
    return await this.paymentHelper.createPayment(rewardAmount)
  }

  // 2) create quiz only (must pass paymentTxId you created above)
  async createQuizOnly(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
    paymentTxId: string
  }): Promise<Quiz> {
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
    ])) as unknown as Quiz

    await new Promise((r) => setTimeout(r, 3000))

    const updatedTeacher = await this.getTeacher(await params.teacher._id)
    await updatedTeacher.addQuiz(await quiz._id)

    await new Promise((r) => setTimeout(r, 3000))
    return quiz
  }

  // NEW: Combined method to create quiz with payment
  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<{ quiz: Quiz, paymentTxId: string }> {
    // First create the reward payment
    const payment = await this.createRewardPayment(params.rewardAmount)
    const paymentTxId = await payment._id

    // Then create the quiz with the payment ID
    const quiz = await this.createQuizOnly({
      title: params.title,
      questionText: params.questionText,
      options: params.options,
      correctAnswer: params.correctAnswer,
      rewardAmount: params.rewardAmount,
      entryFee: params.entryFee,
      teacher: params.teacher,
      paymentTxId
    })

    return { quiz, paymentTxId }
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return (await this.computer.sync(quizId)) as unknown as Quiz
  }
}