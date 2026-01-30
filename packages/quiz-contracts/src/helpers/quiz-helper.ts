// import { Computer } from '@bitcoin-computer/lib'
// import { Quiz, Question } from '../quiz.js'
// import { PaymentHelper } from './payment-helper.js'
// import { Payment } from '../payment.js'
// import { MineRPCBlocks } from '../utils/mineblock.js'

// export class QuizHelper {
//   computer: Computer
//   paymentHelper: PaymentHelper

//   constructor(computer: Computer) {
//     this.computer = computer
//     this.paymentHelper = new PaymentHelper(computer)
//   }

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
//   }): Promise<{ quiz: Quiz; paymentTxIds: string[] }> {
//     // Create individual payment for each question
//     const paymentTxIds: string[] = []

//     // Create all payments first, with proper delays to prevent mempool conflicts
//     for (let i = 0; i < params.questions.length; i++) {
//       // Create payment with the reward amount and initially owned by the teacher
//       const payment = await this.paymentHelper.createPayment(params.rewardPerCorrect, params.teacherPublicKey)
//       paymentTxIds.push(payment._id)

//       // Mine multiple blocks after each payment for proper confirmation
//       await MineRPCBlocks.mineBlocksWithConfirmations(this.computer, 2)
//     }

//     // Create quiz with payment references for each question
//     const quiz = await this.computer.new(Quiz, [{
//       title: params.title,
//       description: params.description,
//       questions: params.questions,
//       rewardPerCorrect: params.rewardPerCorrect,
//       teacherPublicKey: params.teacherPublicKey,
//       duration: params.duration,
//       paymentTxIds: paymentTxIds // Pass array of payment IDs
//     }])

//     // Mine multiple blocks after quiz creation for proper confirmation
//     await MineRPCBlocks.mineBlocksWithConfirmations(this.computer, 3)

//     return { quiz, paymentTxIds }
//   }

//   /**
//    * Process rewards for a student's quiz attempt
//    * Only the first student to answer each question correctly gets the reward
//    */
//   async processQuizRewards(params: {
//     quizId: string
//     studentPublicKey: string
//     answers: number[]
//     correctAnswers: number[]
//   }): Promise<{ rewardedQuestionIndices: number[]; totalReward: bigint }> {
//     const rewardedQuestionIndices: number[] = []
//     let totalReward = 0n

//     // Get the quiz to work with its state
//     const quiz = await this.computer.sync(params.quizId) as Quiz

//     // Process each question to see if the student answered correctly and can claim the reward
//     for (let i = 0; i < params.answers.length; i++) {
//       const isCorrect = params.answers[i] === params.correctAnswers[i]

//       if (isCorrect) {
//         // Try to claim the reward for this question
//         const wasClaimed = quiz.claimQuestionReward(i, params.studentPublicKey)

//         if (wasClaimed) {
//           // The student was the first to answer this question correctly, so they get the reward
//           const paymentTxId = quiz.getPaymentTxIdForQuestion(i)

//           if (paymentTxId) {
//             try {
//               // Load the original payment
//               const originalPayment = await this.computer.sync(paymentTxId) as Payment

//               // Transfer the payment to the student
//               //await this.paymentHelper.transferPayment(originalPayment, params.studentPublicKey)

//               rewardedQuestionIndices.push(i)
//               totalReward += originalPayment._satoshis

//               // Mine multiple blocks after each payment transfer for proper confirmation
//               await MineRPCBlocks.mineBlocksWithConfirmations(this.computer, 3)
//             } catch (error) {
//               console.error(`Failed to transfer payment for question ${i + 1}:`, error)
//             }
//           }
//         }
//       }
//     }

//     return { rewardedQuestionIndices, totalReward }
//   }

//   async getQuiz(quizId: string): Promise<Quiz> {
//     return await this.computer.sync(quizId) as Quiz
//   }

//   async addStudentToAttempted(quizId: string, studentPublicKey: string) {
//     const quiz = await this.computer.sync(quizId) as Quiz
//     await quiz.addAttemptedStudent(studentPublicKey)
//     // Mine multiple blocks after updating quiz state
//     await MineRPCBlocks.mineBlocksWithConfirmations(this.computer, 2)
//   }

//   async deactivateQuiz(quizId: string) {
//     const quiz = await this.computer.sync(quizId) as Quiz
//     await quiz.deactivate()
//     // Mine multiple blocks after updating quiz state
//     await MineRPCBlocks.mineBlocksWithConfirmations(this.computer, 2)
//   }

//   async mineBlock() {
//     await MineRPCBlocks.mineBlockFromComputer(this.computer)
//   }
// }