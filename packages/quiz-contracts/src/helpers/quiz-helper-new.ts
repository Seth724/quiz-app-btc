import { Computer } from '@bitcoin-computer/lib'
import { Quiz, Question } from '../quiz.js'
import { PaymentHelper } from './payment-helper.js'
import { MineBlocks } from '../utils/mineblock.js'

export class QuizHelper {
  computer: Computer
  paymentHelper: PaymentHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  /**
   * Teacher creates a quiz with individual payments for each question
   */
  async createQuizWithPayments(params: {
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    teacherPublicKey: string
    duration?: number
  }): Promise<{ quiz: Quiz; paymentTxIds: string[] }> {
    // Create individual payment for each question
    const paymentTxIds: string[] = []

    console.log(`Creating ${params.questions.length} payments for quiz questions...`)

    // Create all payments first, with proper delays to prevent mempool conflicts
    for (let i = 0; i < params.questions.length; i++) {
      console.log(`Creating payment ${i + 1}/${params.questions.length}...`)
      // Create payment with the reward amount and initially owned by the teacher
      const payment = await this.paymentHelper.createPayment(params.rewardPerCorrect)
      paymentTxIds.push(payment._id)
      
      console.log(`✓ Payment ${i + 1} created: ${payment._id}`)
    }

    console.log('Creating quiz with payment references...')
    
    // Create quiz with payment references for each question
    const quiz = await this.computer.new(Quiz, [{
      title: params.title,
      description: params.description,
      questions: params.questions,
      rewardPerCorrect: params.rewardPerCorrect,
      teacherPublicKey: params.teacherPublicKey,
      duration: params.duration,
      paymentTxIds: paymentTxIds // Pass array of payment IDs
    }])

    // Mine blocks after quiz creation
    await this.mineBlocks()
    
    console.log(`✓ Quiz created: ${quiz._id}`)

    return { quiz, paymentTxIds }
  }

  /**
   * Process rewards for a student's quiz attempt
   * Only the first student to answer each question correctly gets the reward
   */
  async processQuizRewards(params: {
    quiz: Quiz
    studentPublicKey: string
    answers: number[]
  }): Promise<{ rewardedQuestionIndices: number[]; totalReward: bigint }> {
    const rewardedQuestionIndices: number[] = []
    let totalReward = 0n

    console.log('Processing quiz rewards...')

    // Process each question to see if the student answered correctly and can claim the reward
    for (let i = 0; i < params.answers.length; i++) {
      const isCorrect = params.answers[i] === params.quiz.correctAnswers[i]

      if (isCorrect) {
        console.log(`Question ${i + 1}: Correct answer!`)
        
        // Try to claim the reward for this question
        const wasClaimed = params.quiz.claimQuestionReward(i, params.studentPublicKey)

        if (wasClaimed) {
          console.log(`Question ${i + 1}: Reward claimed by student!`)
          // The student was the first to answer this question correctly, so they get the reward
          const paymentTxId = params.quiz.getPaymentTxIdForQuestion(i)

          if (paymentTxId) {
            try {
              // Load the original payment
              const originalPayment = await this.paymentHelper.getPayment(paymentTxId)

              // Transfer the payment to the student
              // Transfer payment to student
              originalPayment.transfer(params.studentPublicKey)
              await this.mineBlocks()

              rewardedQuestionIndices.push(i)
              totalReward += originalPayment._satoshis

              console.log(`✓ Payment ${i + 1} transferred to student: ${originalPayment._satoshis} satoshis`)
            } catch (error) {
              console.error(`Failed to transfer payment for question ${i + 1}:`, error)
            }
          }
        } else {
          console.log(`Question ${i + 1}: Already claimed by another student`)
        }
      } else {
        console.log(`Question ${i + 1}: Incorrect answer`)
      }
    }

    console.log(`Total reward: ${totalReward} satoshis`)
    return { rewardedQuestionIndices, totalReward }
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

  async addStudentToAttempted(quiz: Quiz, studentPublicKey: string) {
    await quiz.addAttemptedStudent(studentPublicKey)
    await this.mineBlocks()
  }

  async deactivateQuiz(quiz: Quiz) {
    await quiz.deactivate()
    await this.mineBlocks()
  }

  async mineBlocks() {
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
  }
}