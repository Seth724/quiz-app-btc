// import { Computer } from '@bitcoin-computer/lib'
// import { Quiz, Question } from './quiz.js'
// import { QuizAttempt } from './attempt.js'
// import { Teacher } from './teacher.js'
// import { Student } from './student.js'
// import { Payment, PaymentHelper } from './payment.js'
// import { ContractUtils } from './utils/mineblock.js'

// export class QuizHelper {
//   computer: Computer
//   paymentHelper: PaymentHelper

//   constructor(computer: Computer) {
//     this.computer = computer
//     this.paymentHelper = new PaymentHelper(computer)
//   }

//   /**
//    * Deploy payment module (for testing)
//    */
//   async deployPaymentModule(): Promise<string> {
//     const paymentModSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
//     if (paymentModSpec) {
//       this.paymentHelper.mod = paymentModSpec
//       return paymentModSpec
//     }

//     // Deploy the payment module using the PaymentHelper
//     await this.paymentHelper.deploy()
//     return this.paymentHelper.mod || ''
//   }

//   /**
//    * Teacher creates a quiz with individual payments for each question
//    */
//   async createQuizWithPayments(params: {
//     title: string
//     description: string
//     questions: Question[]
//     rewardPerCorrect: bigint
//     teacherPublicKey: string
//     duration?: number
//     teacher: Teacher
//   }): Promise<{ quiz: Quiz; paymentIds: string[]; paymentTxIds: string[] }> {
//     // Always use local classes for tests to avoid stale module issues
//     console.log('📦 Using local classes for quiz creation')
//     const QuizClass = Quiz
//     const PaymentClass = Payment

//     // Create individual payment for each question - one at a time to avoid complexity
//     const paymentIds: string[] = []
//     const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'

//     // Create all payments first, with proper delays to prevent mempool conflicts
//     for (let i = 0; i < params.questions.length; i++) {
//       // Create payment with the reward amount and set the owner to the teacher in the constructor
//       const payment = await this.computer.new(PaymentClass, [params.rewardPerCorrect, params.teacherPublicKey])
//       paymentIds.push(payment._id)
//       console.log(`💰 Created payment for question ${i + 1}: ${payment._id} with ${params.rewardPerCorrect} satoshis`)

//       // Mine block after each payment to prevent accumulation of UTXOs
//       if (network === 'regtest') {
//         await ContractUtils.mineBlockFromComputer(this.computer)
//         await new Promise(resolve => setTimeout(resolve, 500))
//       }
//     }

//     // Create quiz with payment references for each question - separate from linking
//     const quiz = await this.computer.new(QuizClass, [{
//       title: params.title,
//       description: params.description,
//       questions: params.questions,
//       rewardPerCorrect: params.rewardPerCorrect,
//       teacherPublicKey: params.teacherPublicKey,
//       duration: params.duration,
//       paymentTxIds: paymentIds // Pass array of payment IDs instead of single ID
//     }])

//     // Mine block after quiz creation to clear the mempool
//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromComputer(this.computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Link quiz to teacher separately to avoid transaction chaining
//     await params.teacher.addQuiz(quiz._id)

//     // Mine block after linking to clear the mempool
//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromComputer(this.computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     return { quiz, paymentIds, paymentTxIds: paymentIds }
//   }

//   /**
//    * Student completes quiz and receives payment for correctly answered questions
//    * Only the first student to answer each question correctly gets the reward
//    */
//   async completeQuizWithPayment(params: {
//     quiz: Quiz
//     student: Student
//     answers: number[]
//   }): Promise<{ attempt: QuizAttempt; rewardPaymentIds?: string[]; rewardPaymentTxIds?: string[] }> {
//     // Always use local classes for tests to avoid stale module issues
//     console.log('📦 Using local classes for quiz attempt')
//     const QuizAttemptClass = QuizAttempt
//     const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'

//     // Create quiz attempt - do this in a separate transaction to avoid complexity
//     const attempt = await this.computer.new(QuizAttemptClass, [
//       params.quiz._id,
//       params.student.publicKey
//     ])

//     console.log(`📝 Student ${params.student.name} created attempt`)

//     // Submit answers and get score
//     await attempt.submitAnswers(
//       params.answers,
//       params.quiz.correctAnswers,
//       params.quiz.rewardPerCorrect
//     )

//     console.log(`✅ Answers submitted, score: ${attempt.score}, reward: ${attempt.rewardEarned}`)

//     // Add student to attempted list
//     await params.quiz.addAttemptedStudent(params.student.publicKey)

//     // Mine block after attempt creation to clear the mempool
//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(this.computer)
//       await new Promise(resolve => setTimeout(resolve, 500))
//     }

//     // Process rewards for correctly answered questions one by one to avoid stack issues
//     const rewardPaymentIds: string[] = []

//     for (let i = 0; i < params.answers.length; i++) {
//       const isCorrect = params.answers[i] === params.quiz.correctAnswers[i]

//       if (isCorrect) {
//         // Try to claim the reward for this question
//         const wasClaimed = await params.quiz.claimQuestionReward(i, params.student.publicKey)

//         if (wasClaimed) {
//           // The student was the first to answer this question correctly, so they get the reward
//           const paymentTxId = params.quiz.getPaymentTxIdForQuestion(i)

//           if (paymentTxId) {
//             try {
//               // Load the original payment
//               const originalPayment = await this.computer.sync(paymentTxId) as Payment

//               // Create a new payment for the student with the same amount
//               const studentPayment = await this.computer.new(Payment, [originalPayment._satoshis])

//               // Transfer ownership to the student
//               studentPayment.transfer(params.student.publicKey)

//               console.log(`✅ Payment for question ${i + 1} transferred to student ${params.student.publicKey.slice(0, 10)}...`)

//               rewardPaymentIds.push(studentPayment._id)

//               // Mine block after each payment transfer to prevent chaining
//               if (network === 'regtest') {
//                 await ContractUtils.mineBlockFromRPCClient(this.computer)
//                 await new Promise(resolve => setTimeout(resolve, 500))
//               }
//             } catch (error) {
//               console.error(`Failed to transfer payment for question ${i + 1}:`, error)
//             }
//           }
//         } else {
//           console.log(`ℹ️ Question ${i + 1} reward already claimed by another student`)
//         }
//       }
//     }

//     // Update student's completed quizzes
//     await params.student.completeQuiz(params.quiz._id, attempt.rewardEarned)

//     // Mine block after student completion update
//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(this.computer)
//       await new Promise(resolve => setTimeout(resolve, 500))
//     }

//     return {
//       attempt,
//       rewardPaymentIds,
//       rewardPaymentTxIds: rewardPaymentIds
//     }
//   }

//   /**
//    * Get payment details for a payment ID
//    */
//   async getPaymentDetails(paymentId: string): Promise<Payment> {
//     return await this.computer.sync(paymentId) as Payment
//   }
// }