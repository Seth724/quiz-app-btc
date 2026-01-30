// import * as chai from 'chai'
// import chaiMatchPattern from 'chai-match-pattern'
// import { Computer } from '@bitcoin-computer/lib'
// import { config } from 'dotenv'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz, Question } from '../src/quiz.js'
// import { QuizAttempt } from '../src/attempt.js'
// import { ContractUtils } from '../src/utils/mineblock.js'
// import { Payment } from '../src/payment.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
// const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

// const { expect } = chai
// chai.use(chaiMatchPattern)

// // Sample questions for testing
// const sampleQuestions: Question[] = [
//   {
//     text: 'What is 2+2?',
//     options: ['3', '4', '5', '6'],
//     correctAnswer: 1
//   },
//   {
//     text: 'What is the capital of France?',
//     options: ['London', 'Berlin', 'Paris', 'Madrid'],
//     correctAnswer: 2
//   }
// ]

// describe('Comprehensive Quiz Flow Tests', function () {
//   let teacherComputer: Computer
//   let student1Computer: Computer
//   let student2Computer: Computer
//   let teacher: Teacher
//   let student1: Student
//   let student2: Student
//   let paymentMod: string

//   // Set up 3 computers once before all tests
//   before(async function () {
//     this.timeout(180000) // Increased timeout for regtest operations
//     console.log('\\n🚀 Starting comprehensive quiz flow test suite setup...')
//     console.log('Creating 3 computers: 1 teacher, 2 students\\n')

//     // Create 3 separate computers with unique paths
//     teacherComputer = new Computer({
//       chain,
//       network,
//       url,
//       path: `${basePath}/100` // Unique path for teacher
//     })

//     student1Computer = new Computer({
//       chain,
//       network,
//       url,
//       path: `${basePath}/101` // Unique path for student 1
//     })

//     student2Computer = new Computer({
//       chain,
//       network,
//       url,
//       path: `${basePath}/102` // Unique path for student 2
//     })

//     console.log(`Teacher Public Key: ${teacherComputer.getPublicKey().slice(0, 10)}...`)
//     console.log(`Student 1 Public Key: ${student1Computer.getPublicKey().slice(0, 10)}...`)
//     console.log(`Student 2 Public Key: ${student2Computer.getPublicKey().slice(0, 10)}...\\n`)

//     // Fund wallets for regtest
//     if (network === 'regtest') {
//       console.log('💰 Funding wallets for regtest...')
//       await Promise.all([
//         teacherComputer.faucet(2e8),
//         student1Computer.faucet(1e8),
//         student2Computer.faucet(1e8)
//       ])
//       console.log('✅ Wallets funded successfully\\n')

//       // Mine a block to confirm funding
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 2000)) // Increased delay
//     }

//     // Create teacher
//     console.log('👥 Creating teacher and students...')
//     teacher = await teacherComputer.new(Teacher, ['Professor Smith', teacherComputer.getPublicKey()]) as Teacher
//     console.log(`✅ Teacher created: ${teacher.name} (${teacher.publicKey.slice(0, 10)}...)`)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 2000)) // Increased delay
//     }

//     // Create student 1
//     student1 = await student1Computer.new(Student, ['Alice Student', student1Computer.getPublicKey()]) as Student
//     console.log(`✅ Student 1 created: ${student1.name} (${student1.publicKey.slice(0, 10)}...)`)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 2000)) // Increased delay
//     }

//     // Create student 2
//     student2 = await student2Computer.new(Student, ['Bob Student', student2Computer.getPublicKey()]) as Student
//     console.log(`✅ Student 2 created: ${student2.name} (${student2.publicKey.slice(0, 10)}...)\\n`)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student2Computer)
//       await new Promise(resolve => setTimeout(resolve, 2000)) // Increased delay
//     }

//     // Deploy payment module
//     console.log('🛠️ Deploying payment module...')
//     paymentMod = await teacherComputer.deploy(`
// import { Contract } from '@bitcoin-computer/lib'

// export class Payment extends Contract {
//   _id!: string
//   _rev!: string
//   _root!: string
//   _satoshis!: bigint
//   _owners!: string[]

//   constructor(_satoshis: bigint) {
//     super({ _satoshis })
//   }

//   transfer(to: string) {
//     this._owners = [to]
//   }

//   setSatoshis(a: bigint) {
//     this._satoshis = a
//   }
// }`)
//     console.log('✅ Payment module deployed\\n')

//     console.log('🎯 Comprehensive quiz flow test suite setup complete!\\n')
//   })

//   it('should complete full quiz workflow: create quiz with payments, students compete for rewards', async function () {
//     this.timeout(120000)
//     console.log('\\n🧪 MAIN TEST: Complete quiz workflow with payment competition\\n')

//     // STEP 1: Teacher creates individual payments for each question
//     console.log('📚 STEP 1: Teacher creates individual payments per question')
//     const paymentTxIds: string[] = []

//     for (let i = 0; i < sampleQuestions.length; i++) {
//       // Create payment with the deployed module
//       const payment = await teacherComputer.new(Payment, [1000n])
//       paymentTxIds.push(payment._id)
//       console.log(`💰 Created payment for question ${i + 1}: ${payment._id} with 1000 satoshis`)

//       // Mine block after each payment to prevent accumulation of UTXOs
//       if (network === 'regtest') {
//         await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//         await new Promise(resolve => setTimeout(resolve, 500))
//       }
//     }

//     // Create quiz with payment references for each question
//     const quiz = await teacherComputer.new(Quiz, [{
//       title: 'Mathematics Competition',
//       description: 'First correct answer wins!',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacherPublicKey: teacher.publicKey,
//       duration: 30,
//       paymentTxIds: paymentTxIds
//     }]) as Quiz

//     console.log(`✅ Quiz created: ${quiz._id}`)
//     console.log(`✅ Payment IDs: ${paymentTxIds.join(', ')}`)
//     console.log(`✅ Questions: ${quiz.questionTexts.length}`)
//     console.log(`✅ Reward per question: ${quiz.rewardPerCorrect} satoshis\\n`)

//     // Verify quiz setup
//     expect(quiz.questionTexts.length).to.equal(2)
//     expect(quiz.rewardPerCorrect).to.equal(1000n)
//     expect(quiz.paymentTxIds.length).to.equal(2)
//     expect(paymentTxIds.length).to.equal(2)

//     // Verify payments exist and have correct amounts
//     for (let i = 0; i < paymentTxIds.length; i++) {
//       const payment = await teacherComputer.sync(paymentTxIds[i]) as Payment
//       expect(payment._satoshis).to.equal(1000n)
//       expect(payment._owners).to.include(teacher.publicKey)
//       console.log(`✅ Payment ${i + 1} verified: ${payment._satoshis} sats, owner: ${payment._owners[0].slice(0, 10)}...`)
//     }
//     console.log()

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Link quiz to teacher
//     await teacher.addQuiz(quiz._id)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // STEP 2: Student 1 attempts quiz and answers first question correctly
//     console.log('📝 STEP 2: Student 1 (Alice) attempts quiz')

//     // Create quiz attempt
//     const attempt1 = await student1Computer.new(QuizAttempt, [quiz._id, student1.publicKey]) as QuizAttempt
//     console.log(`📝 Student ${student1.name} created attempt`)

//     // Submit answers and get score
//     await attempt1.submitAnswers([1, 0], quiz.correctAnswers, quiz.rewardPerCorrect)
//     console.log(`✅ Answers submitted, score: ${attempt1.score}, reward: ${attempt1.rewardEarned}`)

//     // Add student to attempted list
//     await quiz.addAttemptedStudent(student1.publicKey)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Process rewards for correctly answered questions
//     const rewardPaymentTxIds1: string[] = []
//     for (let i = 0; i < [1, 0].length; i++) {
//       const isCorrect = [1, 0][i] === quiz.correctAnswers[i]
//       if (isCorrect) {
//         const wasClaimed = await quiz.claimQuestionReward(i, student1.publicKey)
//         if (wasClaimed) {
//           const paymentTxId = quiz.getPaymentTxIdForQuestion(i)
//           if (paymentTxId) {
//             // Create new payment for student with same amount
//             const originalPayment = await teacherComputer.sync(paymentTxId) as Payment
//             const studentPayment = await student1Computer.new(Payment, [originalPayment._satoshis])
//             studentPayment.transfer(student1.publicKey)

//             rewardPaymentTxIds1.push(studentPayment._id)
//             console.log(`✅ Payment for question ${i + 1} transferred to student ${student1.publicKey.slice(0, 10)}...`)

//             if (network === 'regtest') {
//               await ContractUtils.mineBlockFromRPCClient(student1Computer)
//               await new Promise(resolve => setTimeout(resolve, 500))
//             }
//           }
//         } else {
//           console.log(`ℹ️ Question ${i + 1} reward already claimed by another student`)
//         }
//       }
//     }

//     console.log(`✅ Student 1 completed quiz`)
//     console.log(`   Score: ${attempt1.score}/2`)
//     console.log(`   Reward earned: ${attempt1.rewardEarned} satoshis`)
//     console.log(`   Payments received: ${rewardPaymentTxIds1.length}\\n`)

//     // Verify student 1 results
//     expect(attempt1.score).to.equal(1)
//     expect(attempt1.rewardEarned).to.equal(1000n)
//     expect(rewardPaymentTxIds1.length).to.equal(1)

//     // Verify student 1 got payment for Q1
//     if (rewardPaymentTxIds1.length > 0) {
//       // Add delay before syncing payment
//       if (network === 'regtest') {
//         await new Promise(resolve => setTimeout(resolve, 1000))
//       }

//       const payment = await student1Computer.sync(rewardPaymentTxIds1[0]) as Payment
//       expect(payment._owners).to.include(student1.publicKey)
//       console.log(`✅ Student 1 now owns payment for Q1: ${payment._id}`)
//       console.log(`   Payment owner: ${payment._owners[0].slice(0, 10)}...\\n`)
//     }

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 2000))
//     }

//     // Update student's completed quizzes
//     await student1.completeQuiz(quiz._id, attempt1.rewardEarned)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // STEP 3: Student 2 attempts quiz and answers both correctly
//     console.log('📝 STEP 3: Student 2 (Bob) attempts quiz')

//     // Create quiz attempt
//     const attempt2 = await student2Computer.new(QuizAttempt, [quiz._id, student2.publicKey]) as QuizAttempt
//     console.log(`📝 Student ${student2.name} created attempt`)

//     // Submit answers and get score
//     await attempt2.submitAnswers([1, 2], quiz.correctAnswers, quiz.rewardPerCorrect)
//     console.log(`✅ Answers submitted, score: ${attempt2.score}, reward: ${attempt2.rewardEarned}`)

//     // Add student to attempted list
//     await quiz.addAttemptedStudent(student2.publicKey)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student2Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Process rewards for correctly answered questions
//     const rewardPaymentTxIds2: string[] = []
//     for (let i = 0; i < [1, 2].length; i++) {
//       const isCorrect = [1, 2][i] === quiz.correctAnswers[i]
//       if (isCorrect) {
//         const wasClaimed = await quiz.claimQuestionReward(i, student2.publicKey)
//         if (wasClaimed) {
//           const paymentTxId = quiz.getPaymentTxIdForQuestion(i)
//           if (paymentTxId) {
//             // Create new payment for student with same amount
//             const originalPayment = await teacherComputer.sync(paymentTxId) as Payment
//             const studentPayment = await student2Computer.new(Payment, [originalPayment._satoshis])
//             studentPayment.transfer(student2.publicKey)

//             rewardPaymentTxIds2.push(studentPayment._id)
//             console.log(`✅ Payment for question ${i + 1} transferred to student ${student2.publicKey.slice(0, 10)}...`)

//             if (network === 'regtest') {
//               await ContractUtils.mineBlockFromRPCClient(student2Computer)
//               await new Promise(resolve => setTimeout(resolve, 500))
//             }
//           }
//         } else {
//           console.log(`ℹ️ Question ${i + 1} reward already claimed by another student`)
//         }
//       }
//     }

//     console.log(`✅ Student 2 completed quiz`)
//     console.log(`   Score: ${attempt2.score}/2`)
//     console.log(`   Reward earned: ${attempt2.rewardEarned} satoshis`)
//     console.log(`   Payments received: ${rewardPaymentTxIds2.length}\\n`)

//     // Verify student 2 results
//     expect(attempt2.score).to.equal(2) // Answered both correctly
//     expect(attempt2.rewardEarned).to.equal(1000n) // Only gets Q2 payment (Q1 already taken by student 1)
//     expect(rewardPaymentTxIds2.length).to.equal(1) // Only Q2 payment (Q1 already claimed)

//     // Verify student 2 got payment for Q2 only
//     if (rewardPaymentTxIds2.length > 0) {
//       // Add delay before syncing payment
//       if (network === 'regtest') {
//         await new Promise(resolve => setTimeout(resolve, 1000))
//       }

//       const payment = await student2Computer.sync(rewardPaymentTxIds2[0]) as Payment
//       expect(payment._owners).to.include(student2.publicKey)
//       console.log(`✅ Student 2 now owns payment for Q2: ${payment._id}`)
//       console.log(`   Payment owner: ${payment._owners[0].slice(0, 10)}...\\n`)
//     }

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student2Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Update student's completed quizzes
//     await student2.completeQuiz(quiz._id, attempt2.rewardEarned)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student2Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // STEP 4: Verify quiz state and restrictions
//     console.log('🔍 STEP 4: Verify quiz state and restrictions\\n')

//     const finalQuiz = await teacherComputer.sync(quiz._rev) as Quiz

//     // Check both students attempted
//     expect(finalQuiz.attemptedStudents).to.include(student1.publicKey)
//     expect(finalQuiz.attemptedStudents).to.include(student2.publicKey)
//     console.log(`✅ Quiz tracked both student attempts`)

//     // Check question rewards claimed status
//     /* eslint-disable @typescript-eslint/no-unused-expressions */
//     expect(finalQuiz.questionRewardsClaimed[0]).to.be.true; // Q1 claimed by student 1
//     expect(finalQuiz.questionRewardsClaimed[1]).to.be.true; // Q2 claimed by student 2
//     /* eslint-enable @typescript-eslint/no-unused-expressions */
//     console.log(`✅ Question rewards properly marked as claimed`)

//     // Verify student 1 cannot attempt again
//     console.log(`\\nVerifying one-attempt-per-student restriction...`)
//     try {
//       const anotherAttempt = await student1Computer.new(QuizAttempt, [quiz._id, student1.publicKey]) as QuizAttempt
//       await anotherAttempt.submitAnswers([1, 2], quiz.correctAnswers, quiz.rewardPerCorrect)
//       await quiz.addAttemptedStudent(student1.publicKey)
//       expect.fail('Student 1 should not be able to attempt quiz twice');
//     } catch (error: any) {
//       console.log(`✅ Student 1 correctly blocked from second attempt`)
//     }

//     console.log(`\\n🎉 COMPLETE WORKFLOW TEST PASSED!`)
//     console.log(`\\nFinal Results:`)
//     console.log(`   - Teacher created quiz with 2 questions, 1000 sats each`)
//     console.log(`   - Student 1 answered Q1 correctly → received Q1 payment`)
//     console.log(`   - Student 2 answered Q1+Q2 correctly → received Q2 payment only`)
//     console.log(`   - Payment distribution: First correct answer wins`)
//     console.log(`   - Each student can only attempt once`)
//   })

//   it('should verify payment ownership transfers correctly', async function () {
//     this.timeout(60000)
//     console.log('\\n🧪 TEST: Verify payment ownership transfers\\n')

//     // Create a fresh payment
//     const payment = await teacherComputer.new(Payment, [500n])
//     console.log(`Created payment: ${payment._id}\\n`)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Create a quiz with single payment
//     const quiz = await teacherComputer.new(Quiz, [{
//       title: 'Ownership Test Quiz',
//       description: 'Testing payment ownership transfers',
//       questions: [sampleQuestions[0]], // Just one question
//       rewardPerCorrect: 500n,
//       teacherPublicKey: teacher.publicKey,
//       paymentTxIds: [payment._id]
//     }]) as Quiz

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Verify initial ownership (teacher owns payment)
//     const initialPayment = await teacherComputer.sync(payment._id) as Payment
//     expect(initialPayment._owners).to.include(teacher.publicKey)
//     console.log(`✅ Initial: Payment owned by teacher`)
//     console.log(`   Owner: ${initialPayment._owners[0].slice(0, 10)}...\\n`)

//     // Student 1 attempts and gets correct answer
//     const attempt = await student1Computer.new(QuizAttempt, [quiz._id, student1.publicKey]) as QuizAttempt
//     console.log(`Student 1 attempted quiz`)

//     await attempt.submitAnswers([1], quiz.correctAnswers, quiz.rewardPerCorrect)
//     console.log(`Score: ${attempt.score}`)

//     // Add student to attempted list
//     await quiz.addAttemptedStudent(student1.publicKey)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Process reward
//     const rewardPaymentTxIds: string[] = []
//     for (let i = 0; i < [1].length; i++) {
//       const isCorrect = [1][i] === quiz.correctAnswers[i]
//       if (isCorrect) {
//         const wasClaimed = await quiz.claimQuestionReward(i, student1.publicKey)
//         if (wasClaimed) {
//           const paymentTxId = quiz.getPaymentTxIdForQuestion(i)
//           if (paymentTxId) {
//             // Create new payment for student with same amount
//             const originalPayment = await teacherComputer.sync(paymentTxId) as Payment
//             const studentPayment = await student1Computer.new(Payment, [originalPayment._satoshis])
//             studentPayment.transfer(student1.publicKey)

//             rewardPaymentTxIds.push(studentPayment._id)
//             console.log(`✅ Payment transferred to student`)

//             if (network === 'regtest') {
//               await ContractUtils.mineBlockFromRPCClient(student1Computer)
//               await new Promise(resolve => setTimeout(resolve, 500))
//             }
//           }
//         }
//       }
//     }

//     console.log(`Payments received: ${rewardPaymentTxIds.length}\\n`)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Verify ownership transferred to student
//     expect(rewardPaymentTxIds.length).to.equal(1)
//     if (rewardPaymentTxIds.length > 0) {
//       const transferredPayment = await student1Computer.sync(rewardPaymentTxIds[0]) as Payment
//       expect(transferredPayment._owners).to.include(student1.publicKey)
//       expect(transferredPayment._owners).to.not.include(teacher.publicKey)
//       console.log(`✅ After attempt: Payment owned by student 1`)
//       console.log(`   Owner: ${transferredPayment._owners[0].slice(0, 10)}...`)
//       console.log(`\\n🎉 Payment ownership transfer verified!`)
//     }
//   })

//   it('should handle scenario where student answers all wrong', async function () {
//     this.timeout(120000) // Increased timeout
//     console.log('\\n🧪 TEST: Student answers all questions incorrectly\\n')

//     // Create a single payment
//     const payment = await teacherComputer.new(Payment, [300n])

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Create a quiz with single payment
//     const quiz = await teacherComputer.new(Quiz, [{
//       title: 'All Wrong Test',
//       description: 'Testing zero reward scenario',
//       questions: [sampleQuestions[0]],
//       rewardPerCorrect: 300n,
//       teacherPublicKey: teacher.publicKey,
//       paymentTxIds: [payment._id]
//     }]) as Quiz

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(teacherComputer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Student 1 attempts with wrong answer
//     const attempt = await student1Computer.new(QuizAttempt, [quiz._id, student1.publicKey]) as QuizAttempt
//     console.log(`Student 1 attempted with wrong answers`)

//     await attempt.submitAnswers([0], quiz.correctAnswers, quiz.rewardPerCorrect) // Wrong answer
//     console.log(`Score: ${attempt.score}`)
//     console.log(`Reward earned: ${attempt.rewardEarned}`)

//     // Add student to attempted list
//     await quiz.addAttemptedStudent(student1.publicKey)

//     if (network === 'regtest') {
//       await ContractUtils.mineBlockFromRPCClient(student1Computer)
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }

//     // Process rewards (should be none)
//     const rewardPaymentTxIds: string[] = []
//     for (let i = 0; i < [0].length; i++) {
//       const isCorrect = [0][i] === quiz.correctAnswers[i]
//       if (isCorrect) {
//         const wasClaimed = await quiz.claimQuestionReward(i, student1.publicKey)
//         if (wasClaimed) {
//           const paymentTxId = quiz.getPaymentTxIdForQuestion(i)
//           if (paymentTxId) {
//             // Create new payment for student with same amount
//             const originalPayment = await teacherComputer.sync(paymentTxId) as Payment
//             const studentPayment = await student1Computer.new(Payment, [originalPayment._satoshis])
//             studentPayment.transfer(student1.publicKey)

//             rewardPaymentTxIds.push(studentPayment._id)

//             if (network === 'regtest') {
//               await ContractUtils.mineBlockFromRPCClient(student1Computer)
//               await new Promise(resolve => setTimeout(resolve, 500))
//             }
//           }
//         }
//       }
//     }

//     console.log(`Payments received: ${rewardPaymentTxIds.length}`)

//     // Verify zero rewards
//     expect(attempt.score).to.equal(0)
//     expect(attempt.rewardEarned).to.equal(0n)
//     expect(rewardPaymentTxIds.length).to.equal(0)

//     console.log(`\\n✅ Correctly handled zero reward scenario`)
//   })
// })
