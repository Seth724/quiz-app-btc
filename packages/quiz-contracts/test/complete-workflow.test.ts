// import * as chai from 'chai'
// import chaiMatchPattern from 'chai-match-pattern'
// import { Computer } from '@bitcoin-computer/lib'
// import { config } from 'dotenv'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import type { Question } from '../src/quiz.js'
// import { QuizAttempt } from '../src/attempt.js'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'
// import { QuizHelper } from '../src/helpers/quiz-helper.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
// const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

// const { expect } = chai
// chai.use(chaiMatchPattern)
// const _ = chaiMatchPattern.getLodashModule()

// describe('Complete Quiz Workflow with Helpers', function () {
//   let teacherComputer: Computer
//   let student1Computer: Computer
//   let student2Computer: Computer
//   let teacher: Teacher
//   let student1: Student
//   let student2: Student
//   let teacherHelper: TeacherHelper
//   let studentHelper: StudentHelper
//   let paymentHelper: PaymentHelper
//   let quizHelper: QuizHelper
//   let sampleQuestions: Question[]

//   beforeEach(async function () {
//     this.timeout(30000) // Increase timeout for blockchain operations

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
//     }

//     // Create helper instances
//     teacherHelper = new TeacherHelper(teacherComputer)
//     studentHelper = new StudentHelper(student1Computer) // Using student1Computer as default, will switch as needed
//     paymentHelper = new PaymentHelper(teacherComputer)
//     quizHelper = new QuizHelper(teacherComputer)

//     // Create teacher and students
//     teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
//     student1 = await studentHelper.createStudent('John Doe', student1Computer.getPublicKey())
//     student2 = await studentHelper.createStudent('Jane Smith', student2Computer.getPublicKey())

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

//   it('should complete full quiz workflow with payment transfers', async function () {
//     // 1. Teacher creates quiz with payments using helper
//     const { quiz, paymentTxIds } = await teacherHelper.createQuiz({
//       title: 'Complete Workflow Test Quiz',
//       description: 'Testing complete workflow with payments',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacher: teacher
//     })

//     expect(quiz.title).to.equal('Complete Workflow Test Quiz')
//     expect(quiz.rewardPerCorrect).to.equal(1000n)
//     expect(paymentTxIds.length).to.equal(2) // Two questions = two payments

//     // 2. Student 1 attempts quiz and answers both correctly
//     studentHelper = new StudentHelper(student1Computer) // Switch to student1's computer
//     const result1 = await studentHelper.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 2] // Both correct
//     })

//     expect(result1.attempt.score).to.equal(2)
//     expect(result1.attempt.rewardEarned).to.equal(2000n) // 2 correct * 1000n
//     expect(result1.reward).to.equal(2000n)

//     // 3. Verify student 1 received the payments
//     const updatedStudent1 = await studentHelper.getStudent(student1._id)
//     expect(updatedStudent1.totalEarnings).to.equal(2000n)

//     // 4. Student 2 attempts same quiz but answers second question incorrectly
//     studentHelper = new StudentHelper(student2Computer) // Switch to student2's computer
//     const result2 = await studentHelper.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student2._id,
//       answers: [1, 0] // First correct, second wrong
//     })

//     expect(result2.attempt.score).to.equal(1) // Only first question attempted
//     expect(result2.attempt.rewardEarned).to.equal(1000n) // Only 1 correct answer
//     expect(result2.reward).to.equal(0n) // Should be 0 because first question already claimed by student1

//     // 5. Verify student 2's earnings (should only get reward for unclaimed questions)
//     const updatedStudent2 = await studentHelper.getStudent(student2._id)
//     expect(updatedStudent2.totalEarnings).to.equal(0n) // No new earnings since questions already claimed

//     // 6. Verify quiz state
//     const updatedQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(updatedQuiz.questionRewardsClaimed[0]).to.be.true // First question claimed
//     expect(updatedQuiz.questionRewardsClaimed[1]).to.be.true // Second question claimed
//     expect(updatedQuiz.attemptedStudents.length).to.equal(2) // Both students attempted
//   })

//   it('should handle first-come-first-served payment mechanism', async function () {
//     // Teacher creates quiz with payments
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'First Come First Serve Test',
//       description: 'Testing first-come-first-serve mechanism',
//       questions: sampleQuestions,
//       rewardPerCorrect: 500n,
//       teacher: teacher
//     })

//     // Student 1 attempts and answers first question correctly
//     studentHelper = new StudentHelper(student1Computer)
//     const result1 = await studentHelper.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 0] // First correct, second wrong
//     })

//     expect(result1.reward).to.equal(500n) // Got reward for first question

//     // Student 2 attempts and answers both questions correctly
//     studentHelper = new StudentHelper(student2Computer)
//     const result2 = await studentHelper.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student2._id,
//       answers: [1, 2] // Both correct, but first already claimed
//     })

//     expect(result2.reward).to.equal(500n) // Only got reward for second question (first already claimed)

//     // Verify final earnings
//     const finalStudent1 = await studentHelper.getStudent(student1._id)
//     const finalStudent2 = await studentHelper.getStudent(student2._id)
    
//     // Student 1 should have 500n (from first question)
//     // Student 2 should have 500n (from second question, first was already claimed)
//     // Note: These values reflect the total earnings, not just from this quiz
//   })

//   it('should prevent duplicate quiz attempts', async function () {
//     // Teacher creates quiz
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'Duplicate Attempt Test',
//       description: 'Testing duplicate attempt prevention',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacher: teacher
//     })

//     // Student 1 attempts quiz successfully
//     studentHelper = new StudentHelper(student1Computer)
//     const result1 = await studentHelper.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 2] // Both correct
//     })

//     expect(result1.attempt.score).to.equal(2)

//     // Try to attempt the same quiz again - should fail at the quiz level
//     try {
//       await studentHelper.attemptQuiz({
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

//   it('should handle quiz deactivation', async function () {
//     // Teacher creates quiz
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'Deactivation Test',
//       description: 'Testing quiz deactivation',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacher: teacher
//     })

//     // Verify quiz is active
//     expect(quiz.isActive).to.be.true

//     // Teacher deactivates quiz
//     await teacherHelper.deactivateQuiz(teacher, quiz._id)

//     // Verify quiz is deactivated
//     const updatedQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(updatedQuiz.isActive).to.be.false
//   })

//   it('should handle multiple teachers and quizzes', async function () {
//     // Create second teacher
//     const teacher2 = await teacherHelper.createTeacher('Professor Jones', student2Computer.getPublicKey())

//     // Both teachers create quizzes
//     const quiz1 = await teacherHelper.createQuiz({
//       title: 'Teacher 1 Quiz',
//       description: 'Quiz by teacher 1',
//       questions: sampleQuestions,
//       rewardPerCorrect: 200n,
//       teacher: teacher
//     })

//     const quiz2 = await teacherHelper.createQuiz({
//       title: 'Teacher 2 Quiz',
//       description: 'Quiz by teacher 2',
//       questions: sampleQuestions,
//       rewardPerCorrect: 300n,
//       teacher: teacher2
//     })

//     // Verify both teachers have their quizzes
//     expect(await teacherHelper.getQuizCount(teacher)).to.equal(1)
//     expect(await teacherHelper.getQuizCount(teacher2)).to.equal(1)

//     // Student attempts both quizzes
//     studentHelper = new StudentHelper(student1Computer)
//     const result1 = await studentHelper.attemptQuiz({
//       quizId: quiz1.quiz._id,
//       studentId: student1._id,
//       answers: [1, 2] // Both correct
//     })

//     const result2 = await studentHelper.attemptQuiz({
//       quizId: quiz2.quiz._id,
//       studentId: student1._id,
//       answers: [0, 2] // First wrong, second correct
//     })

//     // Should have earned rewards from both quizzes (where eligible)
//     expect(result1.attempt.score).to.equal(2)
//     expect(result2.attempt.score).to.equal(1)
//   })
// })