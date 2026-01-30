// import * as chai from 'chai'
// import chaiMatchPattern from 'chai-match-pattern'
// import { config } from 'dotenv'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import { QuizAttempt } from '../src/attempt.js'
// import { QuizHelper } from '../src/quizHelper.js'
// import { ContractUtils } from '../src/utils/mineblock.js'
// import type { Question } from '../src/quiz.js'
// import {
//   setupSharedComputers,
//   createSharedEntities,
//   teardownSharedComputers,
//   sharedTeacher1Computer,
//   sharedTeacher2Computer,
//   sharedStudent1Computer,
//   sharedStudent2Computer,
//   sharedTeacher1,
//   sharedTeacher2,
//   sharedStudent1,
//   sharedStudent2,
//   sampleQuestions
// } from './shared-test-setup.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'

// const { expect } = chai
// chai.use(chaiMatchPattern)

// describe('Comprehensive Quiz Flow Tests', function () {
//   let quizHelper: QuizHelper

//   // Set up shared computers once before all tests
//   before(async function () {
//     this.timeout(60000) // Increase timeout for setup
//     console.log('\ud83d\ude80 Starting comprehensive quiz flow test suite setup...')
//     await setupSharedComputers()
//     await createSharedEntities()

//     // Initialize QuizHelper with teacher computer and deploy payment module
//     quizHelper = new QuizHelper(sharedTeacher1Computer)
//     console.log('\ud83d\udee0\ufe0f Deploying payment module...')
//     await quizHelper.deployPaymentModule()
//     console.log('\u2705 Payment module deployed')

//     console.log('🎯 Comprehensive quiz flow test suite setup complete!')
//   })

//   after(async function () {
//     await teardownSharedComputers()
//   })

//   it('should allow teacher to create quiz with individual payments per question', async function () {
//     this.timeout(60000)
//     console.log('\n🧪 TEST: Teacher creates quiz with individual payments per question')

//     // Teacher creates a quiz with individual payments for each question
//     const { quiz, paymentTxIds } = await quizHelper.createQuizWithPayments({
//       title: 'Mathematics Quiz',
//       description: 'Test your math skills',
//       questions: sampleQuestions,
//       rewardPerCorrect: 500n, // 500 satoshis per correct answer
//       teacherPublicKey: sharedTeacher1.publicKey,
//       duration: 30,
//       teacher: sharedTeacher1
//     })

//     console.log('✅ Quiz created with ID:', quiz._id)
//     console.log('✅ Payment IDs created:', paymentTxIds)
//     console.log('✅ Number of payments:', paymentTxIds.length)
//     console.log('✅ Total reward:', quiz.totalReward.toString(), 'satoshis')

//     // Verify quiz properties
//     expect(quiz.title).to.equal('Mathematics Quiz')
//     expect(quiz.questionTexts.length).to.equal(sampleQuestions.length)
//     expect(quiz.rewardPerCorrect).to.equal(500n)
//     expect(quiz.totalReward).to.equal(1000n) // 2 questions * 500n each
//     expect(paymentTxIds.length).to.equal(sampleQuestions.length)
//     expect(quiz.paymentTxIds.length).to.equal(sampleQuestions.length)

//     // Verify each payment was created with correct amount
//     for (let i = 0; i < paymentTxIds.length; i++) {
//       const payment = await quizHelper.getPaymentDetails(paymentTxIds[i])
//       expect(payment._satoshis).to.equal(500n)
//       console.log(`✅ Payment ${i + 1} verified:`, payment._satoshis.toString(), 'satoshis')
//     }

//     console.log('🎉 Quiz with individual payments test completed successfully!\n')
//   })

//   it('should allow student to attempt quiz only once', async function () {
//     this.timeout(60000)
//     console.log('\n🧪 TEST: Student can only attempt quiz once')

//     // Teacher creates a quiz
//     const { quiz } = await quizHelper.createQuizWithPayments({
//       title: 'Science Quiz',
//       description: 'Test your science knowledge',
//       questions: sampleQuestions,
//       rewardPerCorrect: 300n,
//       teacherPublicKey: sharedTeacher1.publicKey,
//       duration: 30,
//       teacher: sharedTeacher1
//     })

//     console.log('✅ Quiz created with ID:', quiz._id)

//     // First attempt by student
//     const studentHelper = new QuizHelper(sharedStudent1Computer)
//     studentHelper.paymentHelper.mod = quizHelper.paymentHelper.mod // Use same deployed module

//     const firstAttemptResult = await studentHelper.completeQuizWithPayment({
//       quiz: await sharedStudent1Computer.sync(quiz._id) as Quiz,
//       student: sharedStudent1,
//       answers: [1, 2] // Both correct
//     })

//     console.log('✅ First attempt completed successfully')

//     // Verify first attempt worked
//     expect(firstAttemptResult.attempt.isCompleted).to.be.true
//     expect(firstAttemptResult.attempt.score).to.equal(2)

//     // Try second attempt - should fail
//     try {
//       const secondAttemptResult = await studentHelper.completeQuizWithPayment({
//         quiz: await sharedStudent1Computer.sync(quiz._id) as Quiz,
//         student: sharedStudent1,
//         answers: [0, 1] // Different answers
//       })

//       // If we reach here, the test failed
//       expect.fail('Second attempt should have failed')
//     } catch (error: any) {
//       console.log('✅ Second attempt correctly prevented:', error.message)
//       expect(error.message).to.contain('already attempted')
//     }

//     console.log('🎉 Single attempt restriction test completed successfully!\n')
//   })

//   it('should award payment to first student who answers question correctly', async function () {
//     this.timeout(60000)
//     console.log('\n🧪 TEST: First correct answer gets the payment')

//     // Teacher creates a quiz with individual payments
//     const { quiz, paymentTxIds } = await quizHelper.createQuizWithPayments({
//       title: 'Trivia Quiz',
//       description: 'Who gets the rewards?',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacherPublicKey: sharedTeacher1.publicKey,
//       duration: 30,
//       teacher: sharedTeacher1
//     })

//     console.log('✅ Quiz created with ID:', quiz._id)
//     console.log('✅ Payment IDs:', paymentTxIds)

//     // Student 1 attempts first and answers first question correctly
//     const student1Helper = new QuizHelper(sharedStudent1Computer)
//     student1Helper.paymentHelper.mod = quizHelper.paymentHelper.mod

//     const student1Result = await student1Helper.completeQuizWithPayment({
//       quiz: await sharedStudent1Computer.sync(quiz._id) as Quiz,
//       student: sharedStudent1,
//       answers: [1, 0] // First correct, second incorrect
//     })

//     console.log('✅ Student 1 completed quiz')
//     console.log('✅ Student 1 score:', student1Result.attempt.score)
//     console.log('✅ Student 1 reward payments:', student1Result.rewardPaymentTxIds?.length)

//     // Verify student 1 got payment for first question only
//     expect(student1Result.attempt.score).to.equal(1)
//     expect(student1Result.attempt.rewardEarned).to.equal(1000n)
//     expect(student1Result.rewardPaymentTxIds?.length).to.equal(1)

//     // Student 2 attempts later and answers both questions correctly
//     const student2Helper = new QuizHelper(sharedStudent2Computer)
//     student2Helper.paymentHelper.mod = quizHelper.paymentHelper.mod

//     const student2Result = await student2Helper.completeQuizWithPayment({
//       quiz: await sharedStudent2Computer.sync(quiz._id) as Quiz,
//       student: sharedStudent2,
//       answers: [1, 2] // Both correct
//     })

//     console.log('✅ Student 2 completed quiz')
//     console.log('✅ Student 2 score:', student2Result.attempt.score)
//     console.log('✅ Student 2 reward payments:', student2Result.rewardPaymentTxIds?.length)

//     // Verify student 2 got payment for second question only (first was already claimed)
//     expect(student2Result.attempt.score).to.equal(2)
//     expect(student2Result.rewardPaymentTxIds?.length).to.equal(1) // Only 1 payment because question 1 was already claimed

//     // Verify that the payments went to the correct students
//     if (student1Result.rewardPaymentTxIds && student1Result.rewardPaymentTxIds[0]) {
//       const payment1 = await student1Helper.getPaymentDetails(student1Result.rewardPaymentTxIds[0])
//       expect(payment1._owners).to.include(sharedStudent1.publicKey)
//       console.log('✅ Student 1 received payment for question 1')
//     }

//     if (student2Result.rewardPaymentTxIds && student2Result.rewardPaymentTxIds[0]) {
//       const payment2 = await student2Helper.getPaymentDetails(student2Result.rewardPaymentTxIds[0])
//       expect(payment2._owners).to.include(sharedStudent2.publicKey)
//       console.log('✅ Student 2 received payment for question 2')
//     }

//     console.log('🎉 First-correct-answer payment test completed successfully!\n')
//   })

//   it('should handle multiple students competing for same quiz rewards', async function () {
//     this.timeout(120000) // Longer timeout for multiple concurrent operations
//     console.log('\n🧪 TEST: Multiple students competing for rewards')

//     // Teacher creates a quiz with individual payments
//     const { quiz, paymentTxIds } = await quizHelper.createQuizWithPayments({
//       title: 'Competitive Quiz',
//       description: 'Race to answer correctly',
//       questions: [
//         {
//           text: 'What is 5 + 7?',
//           options: ['10', '11', '12', '13'],
//           correctAnswer: 2 // 12
//         },
//         {
//           text: 'What is the capital of Japan?',
//           options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'],
//           correctAnswer: 2 // Tokyo
//         },
//         {
//           text: 'What is 8 * 9?',
//           options: ['64', '72', '81', '90'],
//           correctAnswer: 1 // 72
//         }
//       ],
//       rewardPerCorrect: 800n,
//       teacherPublicKey: sharedTeacher1.publicKey,
//       duration: 30,
//       teacher: sharedTeacher1
//     })

//     console.log('✅ Competitive quiz created with 3 questions')
//     console.log('✅ Payment IDs:', paymentTxIds)

//     // Simulate multiple students attempting the quiz concurrently
//     const [student1Result, student2Result] = await Promise.all([
//       // Student 1 attempts with answers [2, 2, 1] - all correct
//       (async () => {
//         const result = await new QuizHelper(sharedStudent1Computer).completeQuizWithPayment({
//           quiz: await sharedStudent1Computer.sync(quiz._id) as Quiz,
//           student: sharedStudent1,
//           answers: [2, 2, 1]
//         })
//         return { ...result, studentName: 'Student 1' }
//       })(),

//       // Student 2 attempts with answers [2, 0, 1] - first and third correct
//       (async () => {
//         const result = await new QuizHelper(sharedStudent2Computer).completeQuizWithPayment({
//           quiz: await sharedStudent2Computer.sync(quiz._id) as Quiz,
//           student: sharedStudent2,
//           answers: [2, 0, 1]
//         })
//         return { ...result, studentName: 'Student 2' }
//       })()
//     ])

//     console.log('✅ Both students completed the quiz')

//     console.log(`✅ ${student1Result.studentName} score: ${student1Result.attempt.score}, payments: ${student1Result.rewardPaymentTxIds?.length}`)
//     console.log(`✅ ${student2Result.studentName} score: ${student2Result.attempt.score}, payments: ${student2Result.rewardPaymentTxIds?.length}`)

//     // Both students should have completed the quiz
//     expect(student1Result.attempt.isCompleted).to.be.true
//     expect(student2Result.attempt.isCompleted).to.be.true

//     // Total number of payments claimed should not exceed total questions
//     const totalPaymentsClaimed = (student1Result.rewardPaymentTxIds?.length || 0) +
//                                 (student2Result.rewardPaymentTxIds?.length || 0)
//     expect(totalPaymentsClaimed).to.be.lte(3) // At most 3 payments for 3 questions

//     console.log('🎉 Competition handling test completed successfully!\n')
//   })

//   it('should maintain quiz integrity with proper state management', async function () {
//     this.timeout(60000)
//     console.log('\n🧪 TEST: Quiz state integrity')

//     // Teacher creates a quiz
//     const { quiz } = await quizHelper.createQuizWithPayments({
//       title: 'State Integrity Quiz',
//       description: 'Testing state management',
//       questions: [
//         {
//           text: 'What is 2^3?',
//           options: ['4', '6', '8', '10'],
//           correctAnswer: 2 // 8
//         }
//       ],
//       rewardPerCorrect: 600n,
//       teacherPublicKey: sharedTeacher1.publicKey,
//       duration: 30,
//       teacher: sharedTeacher1
//     })

//     console.log('✅ Quiz created with ID:', quiz._id)

//     // Verify initial state
//     expect(quiz.questionRewardsClaimed).to.deep.equal([false]) // Initially unclaimed
//     expect(quiz.attemptedStudents).to.have.length(0) // No students attempted yet
//     expect(quiz.isActive).to.be.true // Quiz is active

//     // Student attempts the quiz
//     const studentHelper = new QuizHelper(sharedStudent1Computer)
//     studentHelper.paymentHelper.mod = quizHelper.paymentHelper.mod

//     const result = await studentHelper.completeQuizWithPayment({
//       quiz,
//       student: sharedStudent1,
//       answers: [2] // Correct answer
//     })

//     console.log('✅ Student completed quiz')

//     // Verify quiz state after attempt
//     const updatedQuiz = await sharedTeacher1Computer.sync(quiz._id) as Quiz
//     expect(updatedQuiz.hasStudentAttempted(sharedStudent1.publicKey)).to.be.true
//     expect(updatedQuiz.attemptedStudents).to.include(sharedStudent1.publicKey)
//     expect(updatedQuiz.isActive).to.be.true // Quiz remains active after attempt

//     // Verify the question reward was claimed
//     expect(updatedQuiz.questionRewardsClaimed[0]).to.be.true // Question 0 is now claimed

//     console.log('✅ Quiz state verified after student attempt')

//     // Another student tries to answer the same question
//     const student2Result = await new QuizHelper(sharedStudent2Computer).completeQuizWithPayment({
//       quiz: await sharedStudent2Computer.sync(quiz._id) as Quiz,
//       student: sharedStudent2,
//       answers: [2] // Correct answer
//     })

//     // Second student should get 0 payments for the first question since it's already claimed
//     const claimedPayments = student2Result.rewardPaymentTxIds?.length || 0
//     console.log(`✅ Second student received ${claimedPayments} payments`)

//     console.log('🎉 Quiz state integrity test completed successfully!\n')
//   })

//   it('should complete full teacher-student workflow with payment distribution', async function () {
//     this.timeout(120000) // Longer timeout for full workflow
//     console.log('\n🧪 TEST: Complete teacher-student workflow')

//     // Get balances before
//     const teacherBalanceBefore = await sharedTeacher1Computer.getBalance()
//     const student1BalanceBefore = await sharedStudent1Computer.getBalance()
//     const student2BalanceBefore = await sharedStudent2Computer.getBalance()

//     console.log('💰 Balances before:')
//     console.log(`  Teacher: ${teacherBalanceBefore.balance} satoshis`)
//     console.log(`  Student 1: ${student1BalanceBefore.balance} satoshis`)
//     console.log(`  Student 2: ${student2BalanceBefore.balance} satoshis`)

//     // Teacher creates quiz with payments
//     console.log('\n📚 Teacher creating quiz with payments...')
//     const { quiz, paymentTxIds } = await quizHelper.createQuizWithPayments({
//       title: 'Final Comprehensive Quiz',
//       description: 'Complete workflow test',
//       questions: [
//         {
//           text: 'What is the derivative of x^2?',
//           options: ['x', '2x', 'x^2', '2'],
//           correctAnswer: 1 // 2x
//         },
//         {
//           text: 'What is the chemical symbol for gold?',
//           options: ['Go', 'Gd', 'Au', 'Ag'],
//           correctAnswer: 2 // Au
//         }
//       ],
//       rewardPerCorrect: 1500n, // Higher reward for comprehensive test
//       teacherPublicKey: sharedTeacher1.publicKey,
//       duration: 60,
//       teacher: sharedTeacher1
//     })

//     console.log('✅ Quiz created with 2 questions and individual payments')
//     console.log('✅ Payment IDs:', paymentTxIds)

//     // Student 1 attempts first
//     console.log('\n🎓 Student 1 attempting quiz...')
//     const student1Helper = new QuizHelper(sharedStudent1Computer)
//     student1Helper.paymentHelper.mod = quizHelper.paymentHelper.mod

//     const student1Result = await student1Helper.completeQuizWithPayment({
//       quiz: await sharedStudent1Computer.sync(quiz._id) as Quiz,
//       student: sharedStudent1,
//       answers: [1, 2] // Both correct
//     })

//     console.log('✅ Student 1 completed quiz')
//     console.log(`✅ Student 1 score: ${student1Result.attempt.score}/2`)
//     console.log(`✅ Student 1 payments received: ${student1Result.rewardPaymentTxIds?.length || 0}`)

//     // Student 2 attempts after (will only get payment for unclaimed questions)
//     console.log('\n🎓 Student 2 attempting quiz...')
//     const student2Helper = new QuizHelper(sharedStudent2Computer)
//     student2Helper.paymentHelper.mod = quizHelper.paymentHelper.mod

//     const student2Result = await student2Helper.completeQuizWithPayment({
//       quiz: await sharedStudent2Computer.sync(quiz._id) as Quiz,
//       student: sharedStudent2,
//       answers: [1, 2] // Both correct but questions already claimed
//     })

//     console.log('✅ Student 2 completed quiz')
//     console.log(`✅ Student 2 score: ${student2Result.attempt.score}/2`)
//     console.log(`✅ Student 2 payments received: ${student2Result.rewardPaymentTxIds?.length || 0}`)

//     // Verify results
//     expect(student1Result.attempt.score).to.equal(2) // Got both questions right
//     expect(student1Result.attempt.rewardEarned).to.equal(3000n) // 2 * 1500n
//     expect(student1Result.rewardPaymentTxIds?.length).to.equal(2) // Got both payments

//     expect(student2Result.attempt.score).to.equal(2) // Also got both questions right
//     expect(student2Result.attempt.rewardEarned).to.equal(0n) // But no payments since already claimed
//     expect(student2Result.rewardPaymentTxIds?.length).to.equal(0) // No payments received

//     // Verify payments went to correct students
//     if (student1Result.rewardPaymentTxIds) {
//       for (const paymentId of student1Result.rewardPaymentTxIds) {
//         const payment = await student1Helper.getPaymentDetails(paymentId)
//         expect(payment._owners).to.include(sharedStudent1.publicKey)
//         console.log('✅ Payment correctly transferred to Student 1')
//       }
//     }

//     // Get balances after
//     const teacherBalanceAfter = await sharedTeacher1Computer.getBalance()
//     const student1BalanceAfter = await sharedStudent1Computer.getBalance()
//     const student2BalanceAfter = await sharedStudent2Computer.getBalance()

//     console.log('\n💰 Balances after:')
//     console.log(`  Teacher: ${teacherBalanceAfter.balance} satoshis`)
//     console.log(`  Student 1: ${student1BalanceAfter.balance} satoshis`)
//     console.log(`  Student 2: ${student2BalanceAfter.balance} satoshis`)

//     console.log('\n✅ All workflow steps completed successfully')
//     console.log('🎉 Complete teacher-student workflow test completed successfully!\n')
//   })
// })