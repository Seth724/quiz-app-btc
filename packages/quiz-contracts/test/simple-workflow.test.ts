// import * as chai from 'chai'
// import chaiMatchPattern from 'chai-match-pattern'
// import { Computer } from '@bitcoin-computer/lib'
// import { config } from 'dotenv'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import type { Question } from '../src/quiz.js'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { QuizHelper } from '../src/helpers/quiz-helper.js'
// import { MineRPCBlocks } from '../src/utils/mineblock.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
// const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

// const { expect } = chai
// chai.use(chaiMatchPattern)

// describe('Simple Quiz Workflow with Helpers', function () {
//   let teacherComputer: Computer
//   let student1Computer: Computer
//   let student2Computer: Computer
//   let teacher: Teacher
//   let student1: Student
//   let student2: Student
//   let teacherHelper: TeacherHelper
//   let studentHelper1: StudentHelper
//   let studentHelper2: StudentHelper
//   let quizHelper: QuizHelper
//   let sampleQuestions: Question[]

//   beforeEach(async function () {
//     this.timeout(60000) // Increase timeout for blockchain operations

//     // Create separate computers for different users
//     teacherComputer = new Computer({
//       chain,
//       network,
//       url,
//       path: `${basePath}/0` // Teacher path
//     })

//     student1Computer = new Computer({
//       chain,
//       network,
//       url,
//       path: `${basePath}/1` // Student 1 path
//     })

//     student2Computer = new Computer({
//       chain,
//       network,
//       url,
//       path: `${basePath}/2` // Student 2 path
//     })

//     // Fund wallets for regtest
//     if (network === 'regtest') {
//       await teacherComputer.faucet(1e8)
//       await student1Computer.faucet(1e8)
//       await student2Computer.faucet(1e8)
//       // Mine a block to confirm the faucet transactions
//       await MineRPCBlocks.mineBlockFromComputer(teacherComputer)
//       await MineRPCBlocks.mineBlockFromComputer(student1Computer)
//       await MineRPCBlocks.mineBlockFromComputer(student2Computer)
//     }

//     // Create helper instances
//     teacherHelper = new TeacherHelper(teacherComputer)
//     studentHelper1 = new StudentHelper(student1Computer)
//     studentHelper2 = new StudentHelper(student2Computer)
//     quizHelper = new QuizHelper(teacherComputer)

//     // Create teacher and students
//     teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
//     await MineRPCBlocks.mineBlocksWithConfirmations(teacherComputer, 2)

//     student1 = await studentHelper1.createStudent('John Doe', student1Computer.getPublicKey())
//     await MineRPCBlocks.mineBlocksWithConfirmations(student1Computer, 2)

//     student2 = await studentHelper2.createStudent('Jane Smith', student2Computer.getPublicKey())
//     await MineRPCBlocks.mineBlocksWithConfirmations(student2Computer, 2)

//     sampleQuestions = [
//       {
//         text: 'What is 2+2?',
//         options: ['3', '4', '5', '6'],
//         correctAnswer: 1
//       },
//       {
//         text: 'What is the capital of France?',
//         options: ['London', 'Berlin', 'Paris', 'Madrid'],
//         correctAnswer: 2
//       }
//     ]
//   })

//   it('should complete basic quiz workflow with payment transfers', async function () {
//     // 1. Teacher creates quiz with payments using helper
//     const { quiz, paymentTxIds } = await teacherHelper.createQuiz({
//       title: 'Basic Workflow Test Quiz',
//       description: 'Testing basic workflow with payments',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacher: teacher
//     })

//     expect(quiz.title).to.equal('Basic Workflow Test Quiz')
//     expect(quiz.rewardPerCorrect).to.equal(1000n)
//     expect(paymentTxIds.length).to.equal(2) // Two questions = two payments

//     // Check initial balances
//     const initialStudent1Balance = await student1Computer.getBalance()
//     const initialStudent2Balance = await student2Computer.getBalance()

//     // 2. Student 1 attempts quiz and answers both correctly
//     const result1 = await studentHelper1.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 2] // Both correct
//     })

//     expect(result1.attempt.score).to.equal(2)
//     expect(result1.attempt.rewardEarned).to.equal(2000n) // 2 correct * 1000n
//     expect(result1.reward).to.equal(2000n)

//     // 3. Check that student 1 received the payments by checking their balance increased
//     const finalStudent1Balance = await student1Computer.getBalance()
//     expect(finalStudent1Balance.balance > initialStudent1Balance.balance).to.be.true

//     // 4. Student 2 attempts same quiz but answers both correctly (but questions already claimed)
//     const result2 = await studentHelper2.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student2._id,
//       answers: [1, 2] // Both correct, but questions already claimed
//     })

//     expect(result2.attempt.score).to.equal(2) // Score is 2 (both correct)
//     expect(result2.attempt.rewardEarned).to.equal(2000n) // Internal calculation still works
//     expect(result2.reward).to.equal(0n) // But no new rewards since questions already claimed

//     // 5. Check that student 2's balance didn't increase significantly (no new payments)
//     const finalStudent2Balance = await student2Computer.getBalance()
//     expect(finalStudent2Balance.balance).to.equal(initialStudent2Balance.balance) // Should be same since no new payments

//     // 6. Verify quiz state - both questions should be marked as claimed
//     const updatedQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(updatedQuiz.questionRewardsClaimed[0]).to.be.true // First question claimed
//     expect(updatedQuiz.questionRewardsClaimed[1]).to.be.true // Second question claimed
//     expect(updatedQuiz.attemptedStudents.length).to.equal(2) // Both students attempted
//   })

//   it('should handle first-come-first-served payment mechanism correctly', async function () {
//     // Teacher creates quiz with payments
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'First Come First Serve Test',
//       description: 'Testing first-come-first-serve mechanism',
//       questions: sampleQuestions,
//       rewardPerCorrect: 500n,
//       teacher: teacher
//     })

//     // Check initial balances
//     const initialStudent1Balance = await student1Computer.getBalance()
//     const initialStudent2Balance = await student2Computer.getBalance()

//     // Student 1 attempts and answers first question correctly, second incorrectly
//     const result1 = await studentHelper1.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 0] // First correct, second wrong
//     })

//     expect(result1.reward).to.equal(500n) // Got reward for first question only

//     // Check student 1's balance increased
//     const midStudent1Balance = await student1Computer.getBalance()
//     expect(midStudent1Balance.balance > initialStudent1Balance.balance).to.be.true

//     // Student 2 attempts and answers both questions correctly
//     // Should only get reward for second question (first already claimed)
//     const result2 = await studentHelper2.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student2._id,
//       answers: [1, 2] // Both correct, but first already claimed
//     })

//     expect(result2.reward).to.equal(500n) // Only got reward for second question (first already claimed by student 1)

//     // Check student 2's balance increased appropriately
//     const finalStudent2Balance = await student2Computer.getBalance()
//     expect(finalStudent2Balance.balance > initialStudent2Balance.balance).to.be.true

//     // Verify final state
//     const finalQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(finalQuiz.questionRewardsClaimed[0]).to.be.true // First question claimed by student 1
//     expect(finalQuiz.questionRewardsClaimed[1]).to.be.true // Second question claimed by student 2
//   })

//   it('should prevent duplicate quiz attempts by same student', async function () {
//     // Teacher creates quiz
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'Duplicate Attempt Test',
//       description: 'Testing duplicate attempt prevention',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacher: teacher
//     })

//     // Student 1 attempts quiz successfully
//     const result1 = await studentHelper1.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 2] // Both correct
//     })

//     expect(result1.attempt.score).to.equal(2)

//     // Try to attempt the same quiz again - should fail at the quiz level
//     try {
//       await studentHelper1.attemptQuiz({
//         quizId: quiz._id,
//         studentId: student1._id,
//         answers: [1, 2] // Both correct
//       })
//       expect.fail('Should have thrown an error for duplicate attempt')
//     } catch (error: any) {
//       // This should happen because the quiz tracks attempted students
//       expect(error.message).to.include('Student has already attempted this quiz')
//     }
//   })

//   it('should handle quiz deactivation properly', async function () {
//     // Teacher creates quiz
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'Deactivation Test',
//       description: 'Testing quiz deactivation',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacher: teacher
//     })

//     // Verify quiz is active
//     const initialQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(initialQuiz.isActive).to.be.true

//     // Teacher deactivates quiz
//     await teacherHelper.deactivateQuiz(teacher, quiz._id)

//     // Verify quiz is deactivated
//     const updatedQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(updatedQuiz.isActive).to.be.false
//   })
// })