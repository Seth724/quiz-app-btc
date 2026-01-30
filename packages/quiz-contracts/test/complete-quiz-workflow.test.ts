// import * as chai from 'chai'
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

// describe('Complete Quiz Workflow - Bitcoin Computer Patterns', function () {
//   let teacherComputer: Computer
//   let student1Computer: Computer
//   let student2Computer: Computer
//   let teacher: Teacher
//   let student1: Student
//   let student2: Student
//   let teacherHelper: TeacherHelper
//   let studentHelper1: StudentHelper
//   let studentHelper2: StudentHelper
//   let paymentHelper: PaymentHelper
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
//     }

//     // Create helper instances
//     teacherHelper = new TeacherHelper(teacherComputer)
//     studentHelper1 = new StudentHelper(student1Computer)
//     studentHelper2 = new StudentHelper(student2Computer)
//     paymentHelper = new PaymentHelper(teacherComputer) // Using teacher's computer for payment operations
//     quizHelper = new QuizHelper(teacherComputer)

//     // Create teacher and students
//     teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
//     student1 = await studentHelper1.createStudent('John Doe', student1Computer.getPublicKey())
//     student2 = await studentHelper2.createStudent('Jane Smith', student2Computer.getPublicKey())

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

//   it('should follow the complete quiz workflow: teacher creates quiz with payments, students attempt and earn rewards', async function () {
//     // STEP 1: Teacher creates quiz with individual payments for each question
//     console.log('📝 Teacher creating quiz with payments...')
//     const { quiz, paymentTxIds } = await teacherHelper.createQuiz({
//       title: 'Mathematics Quiz',
//       description: 'Test your math skills',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n, // 1000 satoshis per correct answer
//       teacher: teacher
//     })

//     console.log(`✅ Quiz created with ID: ${quiz._id}`)
//     console.log(`✅ ${paymentTxIds.length} payment objects created for questions`)
//     console.log(`✅ Teacher initially owns all payment objects`)

//     // Verify quiz was created correctly
//     expect(quiz.title).to.equal('Mathematics Quiz')
//     expect(quiz.rewardPerCorrect).to.equal(1000n)
//     expect(quiz.questionTexts.length).to.equal(2)
//     expect(paymentTxIds.length).to.equal(2) // Two questions = two payments

//     // STEP 2: Student 1 attempts the quiz and answers both questions correctly
//     console.log('\n👤 Student 1 attempting quiz...')
//     const initialStudent1Balance = await student1Computer.getBalance()
//     console.log(`💰 Student 1 initial balance: ${initialStudent1Balance.balance} satoshis`)

//     const result1 = await studentHelper1.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 2] // Both correct: 2+2=4, capital of France=Paris
//     })

//     console.log(`✅ Student 1 scored: ${result1.attempt.score}/2`)
//     console.log(`✅ Student 1 earned: ${result1.reward} satoshis`)
    
//     // Verify student 1 got both rewards (first to answer each question)
//     expect(result1.attempt.score).to.equal(2)
//     expect(result1.reward).to.equal(2000n) // 2 questions × 1000 satoshis each

//     // Check that student 1's balance increased
//     const finalStudent1Balance = await student1Computer.getBalance()
//     console.log(`💰 Student 1 final balance: ${finalStudent1Balance.balance} satoshis`)
//     console.log(`📈 Student 1 balance increase: ${finalStudent1Balance.balance - initialStudent1Balance.balance} satoshis`)

//     // STEP 3: Student 2 attempts the same quiz but answers both correctly (questions already claimed)
//     console.log('\n👤 Student 2 attempting same quiz...')
//     const initialStudent2Balance = await student2Computer.getBalance()
//     console.log(`💰 Student 2 initial balance: ${initialStudent2Balance.balance} satoshis`)

//     const result2 = await studentHelper2.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student2._id,
//       answers: [1, 2] // Both correct, but questions already claimed by student 1
//     })

//     console.log(`✅ Student 2 scored: ${result2.attempt.score}/2`)
//     console.log(`✅ Student 2 earned: ${result2.reward} satoshis (questions already claimed)`)
    
//     // Verify student 2 got no rewards (questions already claimed by student 1)
//     expect(result2.attempt.score).to.equal(2) // Score is still 2 (answered correctly)
//     expect(result2.reward).to.equal(0n) // But no rewards since questions already claimed

//     // Check that student 2's balance didn't increase from quiz rewards
//     const finalStudent2Balance = await student2Computer.getBalance()
//     console.log(`💰 Student 2 final balance: ${finalStudent2Balance.balance} satoshis`)
//     console.log(`📈 Student 2 balance increase: ${finalStudent2Balance.balance - initialStudent2Balance.balance} satoshis`)

//     // STEP 4: Verify quiz state - questions should be marked as claimed
//     const updatedQuiz = await quizHelper.getQuiz(quiz._id)
//     console.log('\n📋 Quiz state verification:')
//     console.log(`   Question 0 claimed: ${updatedQuiz.questionRewardsClaimed[0]}`)
//     console.log(`   Question 1 claimed: ${updatedQuiz.questionRewardsClaimed[1]}`)
//     console.log(`   Attempted students: ${updatedQuiz.attemptedStudents.length}`)

//     expect(updatedQuiz.questionRewardsClaimed[0]).to.be.true // First question claimed
//     expect(updatedQuiz.questionRewardsClaimed[1]).to.be.true // Second question claimed
//     expect(updatedQuiz.attemptedStudents.length).to.equal(2) // Both students attempted

//     // STEP 5: Verify students cannot attempt the same quiz again
//     console.log('\n🔒 Testing duplicate attempt prevention...')
//     try {
//       await studentHelper1.attemptQuiz({
//         quizId: quiz._id,
//         studentId: student1._id,
//         answers: [1, 2] // Same answers
//       })
//       expect.fail('Should have thrown an error for duplicate attempt')
//     } catch (error: any) {
//       expect(error.message).to.include('Student has already attempted this quiz')
//       console.log('✅ Duplicate attempt correctly prevented')
//     }

//     console.log('\n🎉 Complete workflow test passed!')
//     console.log('   • Teacher created quiz with payment objects')
//     console.log('   • Student 1 answered correctly and received rewards')
//     console.log('   • Student 2 answered correctly but got no rewards (first-come-first-served)')
//     console.log('   • Quiz correctly prevented duplicate attempts')
//     console.log('   • Payment objects transferred ownership as expected')
//   })

//   it('should handle partial correct answers correctly', async function () {
//     // Create a new quiz for this test
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'Partial Answers Quiz',
//       description: 'Test partial correct answers',
//       questions: sampleQuestions,
//       rewardPerCorrect: 500n, // 500 satoshis per correct answer
//       teacher: teacher
//     })

//     // Student answers only the first question correctly
//     const initialBalance = await student1Computer.getBalance()
//     const result = await studentHelper1.attemptQuiz({
//       quizId: quiz._id,
//       studentId: student1._id,
//       answers: [1, 0] // First correct (2+2=4), second wrong (capital is not London)
//     })

//     // Should earn reward for only the first question
//     expect(result.attempt.score).to.equal(1) // Only 1 correct
//     expect(result.reward).to.equal(500n) // Only 1 question × 500 satoshis

//     // Check balance increased by correct amount
//     const finalBalance = await student1Computer.getBalance()
//     expect(finalBalance.balance - initialBalance.balance).to.equal(500n)
//   })

//   it('should handle quiz deactivation', async function () {
//     // Create a new quiz
//     const { quiz } = await teacherHelper.createQuiz({
//       title: 'Deactivatable Quiz',
//       description: 'Test quiz deactivation',
//       questions: sampleQuestions,
//       rewardPerCorrect: 100n,
//       teacher: teacher
//     })

//     // Verify quiz is active
//     const activeQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(activeQuiz.isActive).to.be.true

//     // Teacher deactivates quiz
//     await teacherHelper.deactivateQuiz(teacher, quiz._id)

//     // Verify quiz is deactivated
//     const inactiveQuiz = await quizHelper.getQuiz(quiz._id)
//     expect(inactiveQuiz.isActive).to.be.false
//   })
// })