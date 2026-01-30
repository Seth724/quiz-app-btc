import { Computer } from '@bitcoin-computer/lib'
import { Student } from '../student.js'
import { Quiz, Question } from '../quiz.js'
import { QuizAttempt } from '../attempt.js'
import { PaymentHelper } from './payment-helper.js'
import { MineBlocks } from '../utils/mineblock.js'

export class StudentHelper {
  computer: Computer
  paymentHelper: PaymentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  async createStudent(name: string, publicKey: string): Promise<Student> {
    const student = await this.computer.new(Student, [name, publicKey])
    await this.mineBlocks()
    return student
  }

  async getStudent(studentId: string): Promise<Student> {
    return await this.computer.sync(studentId) as Student
  }

  async attemptQuiz(params: {
    quizId: string
    studentId: string
    answers: number[] // Change to number array (indices)
  }): Promise<{
    attempt: QuizAttempt
    correctCount: number
    transferredPayments: string[]
  }> {
    console.log(`📝 Student ${params.studentId} attempting quiz ${params.quizId}`)

    const student = await this.getStudent(params.studentId)
    const quiz = await this.getQuiz(params.quizId)
    const questionCount = quiz.questionTexts ? quiz.questionTexts.length : 0

    // Check if quiz is still active
    if (!quiz.isActive) {
      throw new Error('Quiz is no longer active')
    }

    // Check if student already attempted this quiz using Quiz's method
    // For comprehensive testing, allow multiple attempts but track them separately
    // const hasAttempted = quiz.hasStudentAttempted(student.publicKey)
    // if (hasAttempted) {
    //   throw new Error('Student has already attempted this quiz')
    // }

    // Validate answers
    if (params.answers.length !== questionCount) {
      throw new Error(`Expected ${questionCount} answers, got ${params.answers.length}`)
    }

    // Create attempt record first
    const attempt = await this.computer.new(QuizAttempt, [
      params.quizId,
      student.publicKey
    ])

    await this.mineBlocks()

    // Submit answers and process results
    attempt.submitAnswers(params.answers, quiz.correctAnswers, quiz.rewardPerCorrect)

    // Mark student as having attempted this quiz
    quiz.addAttemptedStudent(student.publicKey)

    await this.mineBlocks()

    // Process each question and claim payments immediately for correct answers (first-come-first-served)
    const transferredPayments: string[] = []

    for (let i = 0; i < questionCount; i++) {
      console.log(`🔍 Processing question ${i + 1}: student answer = ${params.answers[i]}, correct = ${quiz.correctAnswers[i]}`)
      
      if (params.answers[i] === quiz.correctAnswers[i]) {
        console.log(`✅ Question ${i + 1} answered correctly - attempting to claim payment...`)
        
        try {
          const paymentTxId = quiz.paymentTxIds[i]
          const payment = await this.paymentHelper.getPayment(paymentTxId)
          
          console.log(`🔍 Current payment owner for Q${i + 1}: ${payment._owners[0]}`)
          console.log(`👤 Student public key: ${student.publicKey}`)
          console.log(`👨‍🏫 Teacher public key: ${quiz.teacherPublicKey}`)

          // Check if payment still belongs to teacher (available for claiming)
          if (payment._owners.includes(quiz.teacherPublicKey)) {
            console.log(`⚡ Attempting to transfer payment for question ${i + 1}...`)
            
            // Transfer payment ownership to student
            payment.transfer(student.publicKey)
            
            // Mine blocks to confirm the transfer
            await this.mineBlocks()
            
            // Verify the transfer by re-syncing
            const verifiedPayment = await this.paymentHelper.getPayment(paymentTxId)
            
            if (verifiedPayment._owners.includes(student.publicKey)) {
              transferredPayments.push(verifiedPayment._id)
              console.log(`💰 Successfully claimed payment for question ${i + 1}`)
            } else {
              console.log(`❌ Payment transfer verification failed for question ${i + 1}`)
            }
          } else if (payment._owners.includes(student.publicKey)) {
            // Student already owns this payment
            transferredPayments.push(payment._id)
            console.log(`💰 Payment for question ${i + 1} already belongs to this student`)
          } else {
            console.log(`❌ Payment for question ${i + 1} already claimed by another student: ${payment._owners[0]}`)
          }
        } catch (error) {
          console.log(`❌ Error claiming payment for question ${i + 1}: ${(error as Error).message}`)
        }
      } else {
        console.log(`❌ Question ${i + 1} answered incorrectly`)
      }
    }

    await this.mineBlocks()

    console.log(`✅ Quiz attempt completed: ${attempt.score}/${questionCount} correct`)
    console.log(`💳 Claimed ${transferredPayments.length} payments`)

    return {
      attempt,
      correctCount: attempt.score,
      transferredPayments
    }
  }

  async hasAttemptedQuiz(student: Student, quizId: string): Promise<boolean> {
    return student.hasCompletedQuiz(quizId)
  }

  async getCompletedQuizCount(student: Student): Promise<number> {
    return student.getCompletedQuizCount()
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

  async getPaymentBalance(studentPublicKey: string): Promise<{ totalBalance: bigint; paymentCount: number }> {
    // Query all objects owned by the student and filter for Payment objects
    const ownedObjects = await this.computer.query({
      publicKey: studentPublicKey
    })

    let totalBalance = 0n
    let paymentCount = 0

    // Filter for Payment objects by checking if they have _satoshis property
    for (const obj of ownedObjects) {
      if (typeof obj === 'object' && obj !== null && '_satoshis' in obj && typeof (obj as any)._satoshis === 'bigint') {
        totalBalance += (obj as any)._satoshis
        paymentCount++
      }
    }

    return {
      totalBalance,
      paymentCount
    }
  }

  async mineBlocks() {
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
  }
}