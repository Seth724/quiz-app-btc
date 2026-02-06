import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher.js'
import { Quiz } from '../quiz.js'
import { PaymentHelper } from './payment-helper.js'

export class TeacherHelper {
  computer: Computer
  paymentHelper: PaymentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  async createTeacher(name: string, publicKey: string): Promise<Teacher> {
    const teacher = await this.computer.new(Teacher, [name, publicKey]) as Teacher
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 3000))
    return teacher
  }

  async getTeacher(teacherId: string): Promise<Teacher> {
    return await this.computer.sync(teacherId) as Teacher
  }

  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: Teacher
  }): Promise<{ quiz: Quiz; paymentTxId: string }> {
    console.log(`🎯 Teacher creating quiz: ${params.title}`)

    // Validate quiz parameters
    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    // Create payment object for this quiz
    console.log(`💰 Creating payment for quiz: ${params.rewardAmount} sats`)
    const payment = await this.paymentHelper.createPayment(params.rewardAmount)
    const paymentId = await payment._id
    console.log(`✅ Payment created: ${paymentId}`)

    // Delay after payment creation
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Create quiz with payment reference
    const teacherPubKey = await params.teacher.publicKey
    const quiz = await this.computer.new(Quiz, [{
      title: params.title,
      questionText: params.questionText,
      options: params.options,
      correctAnswer: params.correctAnswer,
      rewardAmount: params.rewardAmount,
      entryFee: params.entryFee,
      teacherPublicKey: teacherPubKey,
      paymentTxId: paymentId
    }]) as Quiz

    // Delay after quiz creation
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Add quiz to teacher's list
    const teacherId = await params.teacher._id
    const updatedTeacher = await this.getTeacher(teacherId)
    const quizId = await quiz._id
    await updatedTeacher.addQuiz(quizId)

    // Delay after updating teacher
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log(`✅ Quiz created successfully: ${quizId}`)
    return { quiz, paymentTxId: paymentId }
  }

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

    // Validate quiz parameters
    Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)

    // Create quiz without payment object (manual reward handling)
    const teacherPubKey = await params.teacher.publicKey
    const quiz = await this.computer.new(Quiz, [{
      title: params.title,
      questionText: params.questionText,
      options: params.options,
      correctAnswer: params.correctAnswer,
      rewardAmount: params.rewardAmount,
      entryFee: params.entryFee,
      teacherPublicKey: teacherPubKey,
      paymentTxId: "" // No payment object - manual rewards
    }]) as Quiz

    // Delay after quiz creation
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Add quiz to teacher's list
    const teacherId = await params.teacher._id
    const updatedTeacher = await this.getTeacher(teacherId)
    const quizId = await quiz._id
    await updatedTeacher.addQuiz(quizId)

    // Delay after updating teacher
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log(`✅ Quiz-only created successfully: ${quizId}`)
    return quiz
  }

  async deactivateQuiz(teacher: Teacher, quizId: string) {
    const quiz = await this.getQuiz(quizId)

    // Only allow the teacher to deactivate their own quiz
    const quizTeacherPubKey = await quiz.teacherPublicKey
    const teacherPubKey = await teacher.publicKey
    if (quizTeacherPubKey !== teacherPubKey) {
      throw new Error('Only the quiz creator can deactivate this quiz')
    }

    await quiz.deactivate()

    // Delay after deactivation
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

}