import { Computer } from '@bitcoin-computer/lib'
import { Quiz, Question } from './quiz'
import { QuizAttempt } from './attempt'
import { Teacher } from './teacher'
import { Student } from './student'
import { Payment } from './payment'
import { ContractUtils } from './utils/mineblock'

export class QuizHelper {
  computer: Computer
  paymentHelper: any // Payment helper for deployment
  
  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = { mod: null } // Initialize payment helper
  }

  /**
   * Deploy payment module (for testing)
   */
  async deployPaymentModule(): Promise<string> {
    const paymentModSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
    if (paymentModSpec) {
      this.paymentHelper.mod = paymentModSpec
      return paymentModSpec
    }
    
    // If no deployed module, deploy a new one
    const deployedMod = await this.computer.deploy(`
import { Contract } from '@bitcoin-computer/lib'

export class Payment extends Contract {
  constructor(amount) {
    super({}, amount)
  }
}`)
    
    this.paymentHelper.mod = deployedMod
    return deployedMod
  }

  /**
   * Teacher creates a quiz with locked payment for total rewards
   */
  async createQuizWithPayment(params: {
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    teacherPublicKey: string
    duration?: number
    teacher: Teacher
  }): Promise<{ quiz: Quiz; paymentId: string; paymentTxId: string }> {
    // Get module specs
    const quizModSpec = process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC
    const paymentModSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
    
    if (!quizModSpec || !paymentModSpec) {
      throw new Error('Module specs not found. Please deploy contracts first.')
    }
    
    // Load deployed modules
    const [quizModuleExports, paymentModuleExports] = await Promise.all([
      this.computer.load(quizModSpec),
      this.computer.load(paymentModSpec)
    ])
    
    const QuizClass = (quizModuleExports as any).Quiz || (quizModuleExports as any).default
    const PaymentClass = (paymentModuleExports as any).Payment || (paymentModuleExports as any).default
    
    if (!QuizClass || !PaymentClass) {
      throw new Error('Quiz or Payment class not found in deployed modules')
    }
    
    // Calculate total reward needed
    const totalReward = BigInt(params.questions.length) * params.rewardPerCorrect
    
    // Create payment with total reward amount (teacher locks the funds)
    const payment = await this.computer.new(PaymentClass, [totalReward])
    
    console.log(`💰 Teacher locked payment: ${payment._id} with ${totalReward} satoshis`)
    
    // Wait for transaction confirmation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create quiz with payment reference
    const quiz = await this.computer.new(QuizClass, [{
      title: params.title,
      description: params.description,
      questions: params.questions,
      rewardPerCorrect: params.rewardPerCorrect,
      teacherPublicKey: params.teacherPublicKey,
      duration: params.duration,
      paymentTxId: payment._id
    }])
    
    // Link quiz to teacher
    await params.teacher.addQuiz(quiz._id)
    
    // Wait for quiz creation confirmation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { quiz, paymentId: payment._id, paymentTxId: payment._id }
  }

  /**
   * Student completes quiz and receives payment based on performance
   */
  async completeQuizWithPayment(params: {
    quiz: Quiz
    student: Student
    answers: number[]
  }): Promise<{ attempt: QuizAttempt; rewardPaymentId?: string; rewardPaymentTxId?: string }> {
    // Get module specs
    const attemptModSpec = process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC
    const paymentModSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
    
    if (!attemptModSpec || !paymentModSpec) {
      throw new Error('Module specs not found. Please deploy contracts first.')
    }
    
    // Load deployed modules
    const [attemptModuleExports, paymentModuleExports] = await Promise.all([
      this.computer.load(attemptModSpec),
      this.computer.load(paymentModSpec)
    ])
    
    const QuizAttemptClass = (attemptModuleExports as any).QuizAttempt || (attemptModuleExports as any).default
    const PaymentClass = (paymentModuleExports as any).Payment || (paymentModuleExports as any).default
    
    if (!QuizAttemptClass || !PaymentClass) {
      throw new Error('QuizAttempt or Payment class not found in deployed modules')
    }
    
    // Create quiz attempt
    const attempt = await this.computer.new(QuizAttemptClass, [
      params.quiz._id,
      params.student.publicKey
    ])
    
    console.log(`📝 Student ${params.student.name} created attempt`)
    
    // Wait for attempt creation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Submit answers and get score
    await attempt.submitAnswers(
      params.answers, 
      params.quiz.correctAnswers, 
      params.quiz.rewardPerCorrect
    )
    
    console.log(`✅ Answers submitted, score: ${attempt.score}, reward: ${attempt.rewardEarned}`)
    
    // Add student to attempted list
    await params.quiz.addAttemptedStudent(params.student.publicKey)
    
    // Wait for answer submission confirmation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // If student earned reward, create payment for the earned amount and transfer to student
    let rewardPaymentId: string | undefined
    if (attempt.rewardEarned > 0) {
      console.log(`💰 Creating payment for ${attempt.rewardEarned} satoshis reward...`)
      
      // Create a payment with the earned reward amount
      const rewardPayment = await this.computer.new(PaymentClass, [attempt.rewardEarned])
      rewardPaymentId = rewardPayment._id
      
      console.log(`💸 Payment created: ${rewardPaymentId}`)
      
      // Wait for payment creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Transfer payment ownership to student
      await rewardPayment.transfer(params.student.publicKey)
      console.log(`✅ Payment transferred to student ${params.student.publicKey.slice(0, 10)}...`)
      
      // Wait for payment transfer
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Update student's completed quizzes
    await params.student.completeQuiz(params.quiz._id, attempt.rewardEarned)
    
    // Wait for student update
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { attempt, rewardPaymentId, rewardPaymentTxId: rewardPaymentId }
  }

  /**
   * Get payment details for a payment ID
   */
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    return await this.computer.sync(paymentId) as Payment
  }
}