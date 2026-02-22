import type { Computer } from '@bitcoin-computer/lib'
import { PaymentHelper } from './payment-helper.js'
import { loadExportedClass } from './contract-loader.js'

export class TeacherHelper {
  computer: Computer
  paymentHelper: PaymentHelper
  teacherMod: string
  quizMod: string
  paymentMod: string

  constructor(computer: Computer, teacherMod: string, quizMod: string, paymentMod: string) {
    this.computer = computer
    this.teacherMod = teacherMod
    this.quizMod = quizMod
    this.paymentMod = paymentMod
    this.paymentHelper = new PaymentHelper(computer, paymentMod)
  }

  /**
   * ✅ IMPORTANT: Get teacher by public key using query
   */
  async getTeacherByPublicKey(publicKey: string): Promise<any | null> {
    const ids = await this.computer.query({ mod: this.teacherMod, publicKey })
    if (!ids.length) return null
    return await this.computer.sync(ids[0])
  }

  async createTeacher(name: string, publicKey: string): Promise<any> {
    const Teacher = await loadExportedClass<any>(this.computer, this.teacherMod, 'Teacher')
    const teacher = await this.computer.new(Teacher, [name, publicKey])
    await new Promise((r) => setTimeout(r, 3000))
    return teacher
  }

  async getTeacher(teacherId: string): Promise<any> {
    return await this.computer.sync(teacherId)
  }

  async createRewardPayment(rewardAmount: bigint): Promise<any> {
    return await this.paymentHelper.createPayment(rewardAmount)
  }

  async createQuizOnly(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: any
    paymentTxId: string
  }): Promise<any> {
    const Teacher = await loadExportedClass<any>(this.computer, this.teacherMod, 'Teacher')
    const Quiz = await loadExportedClass<any>(this.computer, this.quizMod, 'Quiz')

    if (typeof Teacher?.validateQuizParams === 'function') {
      Teacher.validateQuizParams(params.questionText, params.options, params.correctAnswer, params.rewardAmount)
    }

    const teacherPubKey = await params.teacher.publicKey
    const quiz = await this.computer.new(Quiz, [
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
    ])

    await new Promise((r) => setTimeout(r, 3000))

    const updatedTeacher = await this.getTeacher(await params.teacher._id)
    if (typeof updatedTeacher.addQuiz === 'function') {
      await updatedTeacher.addQuiz(await quiz._id)
    }

    await new Promise((r) => setTimeout(r, 3000))
    return quiz
  }

  async createQuiz(params: {
    title: string
    questionText: string
    options: string[]
    correctAnswer: number
    rewardAmount: bigint
    entryFee: bigint
    teacher: any
  }): Promise<{ quiz: any; paymentTxId: string }> {
    const Quiz = await loadExportedClass<any>(this.computer, this.quizMod, 'Quiz')
    const payment = await this.createRewardPayment(params.rewardAmount)
    const paymentTxId = await payment._id

    const quiz = await this.computer.new(Quiz, [
      {
        title: params.title,
        questionText: params.questionText,
        options: params.options,
        correctAnswer: params.correctAnswer,
        rewardAmount: params.rewardAmount,
        entryFee: params.entryFee,
        teacherPublicKey: await params.teacher.publicKey,
        paymentTxId,
      },
    ])

    return { quiz, paymentTxId }
  }

  async getQuiz(quizId: string): Promise<any> {
    return await this.computer.sync(quizId)
  }

  /**
   * Get quizzes created by teacher public key
   */
  async getQuizzesByTeacherPublicKey(teacherPublicKey: string): Promise<any[]> {
    const revs = await this.computer.query({
      publicKey: teacherPublicKey,
      mod: this.quizMod,
    })

    const quizzes = await Promise.all(revs.map((rev) => this.computer.sync(rev)))
    return quizzes
  }

  async getQuizzesByTeacher(teacherId: string): Promise<any[]> {
    const teacher = await this.getTeacher(teacherId)
    const teacherPubKey = await teacher.publicKey
    return this.getQuizzesByTeacherPublicKey(teacherPubKey)
  }
}
