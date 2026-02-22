import type { Computer } from '@bitcoin-computer/lib'
import { PaymentHelper } from './payment-helper.js'
import { loadExportedClass } from './contract-loader.js'

export class StudentHelper {
  computer: Computer
  paymentHelper: PaymentHelper
  funderComputer?: Computer
  studentMod: string
  quizAttemptMod: string

  constructor(
    computer: Computer,
    funderComputer?: Computer,
    studentMod?: string,
    quizAttemptMod?: string
  ) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer, '')
    this.funderComputer = funderComputer
    this.studentMod = studentMod || ''
    this.quizAttemptMod = quizAttemptMod || ''
  }

  async createStudent(name: string, publicKey: string): Promise<any> {
    const Student = await loadExportedClass<any>(this.computer, this.studentMod, 'Student')
    const student = await this.computer.new(Student, [name, publicKey])
    await new Promise((resolve) => setTimeout(resolve, 2500))
    return student
  }

  async getStudent(studentId: string): Promise<any> {
    return await this.computer.sync(studentId)
  }

  async attemptQuiz(params: {
    quizId: string
    studentId: string
    selectedAnswer: number
  }): Promise<{
    isCorrect: boolean
    rewardClaimed: bigint
    paymentTransferred: boolean
  }> {
    console.log(`📝 Student ${params.studentId} attempting quiz ${params.quizId}`)

    const student = await this.getStudent(params.studentId)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const quiz: any = await this.computer.sync(params.quizId)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!quiz.isActive) {
      throw new Error('Quiz is no longer active')
    }

    if (quiz.hasStudentAttempted(student.publicKey)) {
      throw new Error('Student has already attempted this quiz')
    }

    if (params.selectedAnswer < 0 || params.selectedAnswer > 3) {
      throw new Error('Selected answer must be between 0-3')
    }

    quiz.addAttemptedStudent(student.publicKey)
    student.addAttemptedQuiz(params.quizId)
    await new Promise((resolve) => setTimeout(resolve, 2500))

    const isCorrect = params.selectedAnswer === quiz.correctAnswer
    let rewardClaimed = 0n
    let paymentTransferred = false

    if (isCorrect) {
      console.log(`✅ Answer is correct! Attempting to claim reward...`)

      const canClaim = quiz.claimReward(student.publicKey)

      if (canClaim) {
        try {
          if (!this.funderComputer) {
            throw new Error('No funder computer set for reward withdrawal')
          }

          await this.paymentHelper.transferPaymentById(quiz.paymentTxId, student.publicKey)
          await this.paymentHelper.withdrawPaymentById(quiz.paymentTxId)

          student.addClaimedReward(quiz.rewardAmount)
          rewardClaimed = quiz.rewardAmount
          paymentTransferred = true

          console.log(`💰 Payment withdrawn to student wallet! Student earned ${quiz.rewardAmount} sats`)
        } catch (error) {
          console.log(`❌ Payment transfer failed: ${(error as any).message || error}`)
          quiz.isClaimed = false
          quiz.claimedBy = ''
        }
      } else {
        console.log(`⏰ Reward already claimed by another student`)
      }
    } else {
      console.log(`❌ Answer is incorrect`)
    }

    await new Promise((resolve) => setTimeout(resolve, 2500))

    console.log(`✅ Quiz attempt completed: ${isCorrect ? 'Correct' : 'Incorrect'}`)
    console.log(`💳 Reward claimed: ${rewardClaimed} sats`)

    return {
      isCorrect,
      rewardClaimed,
      paymentTransferred,
    }
  }

  async attemptQuizWithQuizAttempt(
    quizId: string,
    selectedAnswer: number,
    access: any
  ): Promise<{
    isCorrect: boolean
    rewardEarned: bigint
    selectedAnswer: number
  }> {
    console.log(`📝 Student attempting quiz ${quizId} with QuizAttempt contract`)

    const quiz: any = await this.computer.sync(quizId)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!quiz.isActive) throw new Error('Quiz is no longer active')

    if (await quiz.hasStudentAttempted(this.computer.getPublicKey())) {
      throw new Error('Student has already attempted this quiz')
    }

    const accessObj = typeof access === 'string' ? await this.computer.sync(access) : access

    if (accessObj.quizId !== quizId) throw new Error('Wrong access token for this quiz')
    if (accessObj._owners[0] !== this.computer.getPublicKey())
      throw new Error('Access token not owned by this student')
    if (accessObj.amount === 0n) throw new Error('Access token already used')

    const QuizAttempt = await loadExportedClass<any>(this.computer, this.quizAttemptMod, 'QuizAttempt')
    const attempt = await this.computer.new(QuizAttempt, [quizId, this.computer.getPublicKey()])
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await attempt.submitAnswer(accessObj, selectedAnswer, await quiz.correctAnswer, await quiz.rewardAmount)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const isCorrect = await attempt.isCorrect
    let rewardEarned = 0n

    if (isCorrect) {
      rewardEarned = await quiz.rewardAmount
    }

    await new Promise((resolve) => setTimeout(resolve, 2500))

    return { isCorrect, rewardEarned, selectedAnswer }
  }

  async getStudentTotalRewards(studentId: string): Promise<bigint> {
    const student = await this.getStudent(studentId)
    return student.getTotalRewards ? student.getTotalRewards() : 0n
  }
}
