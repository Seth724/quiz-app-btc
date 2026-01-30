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

  async createQuizWithPayments(params: {
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    teacherPublicKey: string
    duration?: number
  }): Promise<{ quiz: Quiz; paymentTxIds: string[] }> {
    console.log(`🎯 Creating quiz: ${params.title} with ${params.questions.length} questions`)

    // Create payment for each question
    const paymentTxIds: string[] = []
    
    for (let i = 0; i < params.questions.length; i++) {
      console.log(`💰 Creating payment for question ${i + 1}`)
      const payment = await this.paymentHelper.createPayment(params.rewardPerCorrect)
      paymentTxIds.push(payment._id)
      console.log(`✅ Payment created: ${payment._id}`)
    }

    // Create quiz with payment transaction IDs
    const quiz = await this.computer.new(Quiz, [{
      title: params.title,
      description: params.description,
      questions: params.questions,
      rewardPerCorrect: params.rewardPerCorrect,
      teacherPublicKey: params.teacherPublicKey,
      duration: params.duration,
      paymentTxIds
    }])

    await this.mineBlocks()

    console.log(`✅ Quiz created: ${quiz._id} with ${paymentTxIds.length} reward payments`)

    return { quiz, paymentTxIds }
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    return await this.computer.sync(quizId) as Quiz
  }

  async deactivateQuiz(quiz: Quiz) {
    quiz.deactivate()
    await this.mineBlocks()
  }

  async processQuizRewards(quiz: Quiz, studentAnswers: number[], studentPublicKey: string): Promise<{
    correctAnswers: number[]
    rewardsClaimed: string[]
    totalReward: bigint
  }> {
    const correctAnswers: number[] = []
    const rewardsClaimed: string[] = []
    let totalReward = 0n

    // Check each answer and claim rewards for correct ones (first-come-first-served)
    for (let i = 0; i < quiz.correctAnswers.length; i++) {
      if (studentAnswers[i] === quiz.correctAnswers[i]) {
        correctAnswers.push(i)
        
        // Try to claim the payment if not already claimed
        if (!quiz.questionRewardsClaimed[i]) {
          try {
            const paymentTxId = quiz.paymentTxIds[i]
            const payment = await this.paymentHelper.getPayment(paymentTxId)
            // Transfer payment to student  
            payment.transfer(studentPublicKey)
            await this.mineBlocks()
            
            // Mark as claimed in the quiz
            quiz.questionRewardsClaimed[i] = true
            
            rewardsClaimed.push(paymentTxId)
            totalReward += quiz.rewardPerCorrect
            console.log(`💰 Reward claimed for question ${i + 1}`)
          } catch (error) {
            console.log(`❌ Failed to claim reward for question ${i + 1}:`, (error as Error).message)
          }
        } else {
          console.log(`⏰ Reward for question ${i + 1} already claimed by another student`)
        }
      }
    }

    await this.mineBlocks()

    return {
      correctAnswers,
      rewardsClaimed,
      totalReward
    }
  }

  async getQuizProgress(quizId: string): Promise<{
    totalQuestions: number
    rewardsClaimed: number
    remainingRewards: number
    isActive: boolean
  }> {
    const quiz = await this.getQuiz(quizId)
    
    const rewardsClaimed = quiz.questionRewardsClaimed.filter(claimed => claimed).length
    
    return {
      totalQuestions: quiz.getQuestionCount(),
      rewardsClaimed,
      remainingRewards: quiz.getQuestionCount() - rewardsClaimed,
      isActive: quiz.isActive
    }
  }

  async mineBlocks() {
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
  }
}