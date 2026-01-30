// import * as chai from 'chai'
// import chaiMatchPattern from 'chai-match-pattern'
// import { Computer } from '@bitcoin-computer/lib'
// import { config } from 'dotenv'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import type { Question } from '../src/quiz.js'
// import { QuizAttempt } from '../src/attempt.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
// const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"


// const { expect } = chai
// chai.use(chaiMatchPattern)

// describe('Integration Tests', function () {
//   let teacherComputer: Computer
//   let student1Computer: Computer
//   let student2Computer: Computer
//   let teacher: Teacher
//   let student1: Student
//   let student2: Student
//   let sampleQuestions: Question[]

//   beforeEach(async function () {
//     this.timeout(30000) // Increase timeout for blockchain operations

//     // Create separate computers for different users (like counter.test.ts)
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
    
//     // Create teacher and students with their respective computers
//     teacher = await teacherComputer.new(Teacher, ['Professor Smith', teacherComputer.getPublicKey()])
    
//     student1 = await student1Computer.new(Student, ['John Doe', student1Computer.getPublicKey()])
    
//     student2 = await student2Computer.new(Student, ['Jane Smith', student2Computer.getPublicKey()])
    
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

//   it('should complete full teacher-student workflow with separate wallets', async function () {
//     // 1. Teacher creates quiz externally
//     const quiz = await teacherComputer.new(Quiz, [{
//       title: 'Integration Test Quiz',
//       description: 'Full workflow test',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacherPublicKey: teacher.publicKey,
//       duration: 30
//     }])
    
//     await teacher.addQuiz(quiz._id)
//     const quizId = quiz._id
    
//     // 2. Student discovers and attempts quiz (using their own wallet)
//     const quizForAttempt = await teacherComputer.sync(quizId) as Quiz
//     const attempt = await student1Computer.new(QuizAttempt, [quizId, student1Computer.getPublicKey()])
    
//     // 3. Student answers questions
//     await attempt.submitAnswers([1, 2], quizForAttempt.correctAnswers, quizForAttempt.rewardPerCorrect) // Both correct
    
//     // 4. Verify results
//     expect(attempt.isCompleted).to.be.true
//     expect(attempt.score).to.equal(2)
//     expect(attempt.rewardEarned).to.equal(2000n)
    
//     // 5. Verify different public keys (separate wallets)
//     expect(teacher.publicKey).not.to.equal(student1.publicKey)
//     expect(attempt.studentPublicKey).to.equal(student1.publicKey)
    
//     // 6. Verify quiz tracking
//     const syncedQuiz = await teacherComputer.sync(quizId) as Quiz
//     await syncedQuiz.addAttemptedStudent(student1.publicKey)
//     await teacherComputer.sync(syncedQuiz._id)
//     expect(await syncedQuiz.hasStudentAttempted(student1.publicKey)).to.be.true
//   })

//   it('should handle multiple students attempting different quizzes', async function () {
//     // Add delay to prevent mempool conflicts
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     // Teacher creates two quizzes externally
//     const quiz1 = await teacherComputer.new(Quiz, [{
//       title: 'Quiz 1',
//       description: 'First quiz',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacherPublicKey: teacher.publicKey
//     }])
    
//     const quiz2 = await teacherComputer.new(Quiz, [{
//       title: 'Quiz 2',
//       description: 'Second quiz',
//       questions: sampleQuestions,
//       rewardPerCorrect: 500n,
//       teacherPublicKey: teacher.publicKey
//     }])
    
//     await teacher.addQuiz(quiz1._id)
//     await teacher.addQuiz(quiz2._id)
    
//     const quiz1Id = quiz1._id
//     const quiz2Id = quiz2._id
    
//     // Student 1 attempts Quiz 1
//     const attempt1 = await student1Computer.new(QuizAttempt, [quiz1Id, student1Computer.getPublicKey()])
//     await attempt1.submitAnswers([1, 2], quiz1.correctAnswers, quiz1.rewardPerCorrect)
    
//     // Student 2 attempts Quiz 2
//     const attempt2 = await student2Computer.new(QuizAttempt, [quiz2Id, student2Computer.getPublicKey()])
//     await attempt2.submitAnswers([1, 0], quiz2.correctAnswers, quiz2.rewardPerCorrect)
    
//     // Verify results
//     expect(attempt1.rewardEarned).to.equal(2000n) // 2 correct * 1000n
//     expect(attempt2.rewardEarned).to.equal(500n)  // 1 correct * 500n
    
//     await teacherComputer.sync(teacher._id)
//     expect(await teacher.getQuizCount()).to.equal(2)
//   })

//   it('should handle concurrent quiz attempts by different students', async function () {
//     this.timeout(60000)
    
//     const quiz = await teacherComputer.new(Quiz, [{
//       title: 'Concurrent Test Quiz',
//       description: 'Testing concurrent access',
//       questions: sampleQuestions,
//       rewardPerCorrect: 750n,
//       teacherPublicKey: teacher.publicKey
//     }])

//     await teacher.addQuiz(quiz._id)

//     // Both students attempt the same quiz simultaneously
//     const [attempt1, attempt2] = await Promise.all([
//       student1Computer.new(QuizAttempt, [quiz._id, student1Computer.getPublicKey()]),
//       student2Computer.new(QuizAttempt, [quiz._id, student2Computer.getPublicKey()])
//     ])

//     // Submit different answers
//     await Promise.all([
//       attempt1.submitAnswers([1, 2], quiz.correctAnswers, quiz.rewardPerCorrect), // Both correct
//       attempt2.submitAnswers([1, 0], quiz.correctAnswers, quiz.rewardPerCorrect)  // One correct
//     ])

//     expect(attempt1.score).to.equal(2)
//     expect(attempt1.rewardEarned).to.equal(1500n)
//     expect(attempt2.score).to.equal(1)
//     expect(attempt2.rewardEarned).to.equal(750n)
//   })

//   it('should handle complete teacher-student lifecycle', async function () {
//     this.timeout(60000)
    
//     // 1. Teacher creates comprehensive quiz
//     const comprehensiveQuestions = Array.from({ length: 5 }, (_, i) => ({
//       text: `Comprehensive Question ${i + 1}?`,
//       options: [`Option A${i}`, `Option B${i}`, `Option C${i}`, `Option D${i}`],
//       correctAnswer: i % 4
//     }))

//     const comprehensiveQuiz = await teacherComputer.new(Quiz, [{
//       title: 'Comprehensive Lifecycle Test',
//       description: 'Full lifecycle test quiz',
//       questions: comprehensiveQuestions,
//       rewardPerCorrect: 200n,
//       teacherPublicKey: teacher.publicKey,
//       duration: 60
//     }])

//     await teacher.addQuiz(comprehensiveQuiz._id)
//     await teacherComputer.sync(teacher._id)

//     // 2. Multiple students attempt quiz
//     const students = [student1, student2]
//     const attempts = []

//     for (const [index, student] of students.entries()) {
//       const studentComputer = index === 0 ? student1Computer : student2Computer
//       const attempt = await studentComputer.new(QuizAttempt, [comprehensiveQuiz._id, student.publicKey])
      
//       // Different answer patterns - need to match the correctAnswers which are i % 4: [0, 1, 2, 3, 0]
//       const answers = index === 0 
//         ? [0, 1, 2, 3, 0] // All 5 correct to match i % 4 pattern
//         : [0, 1, 2, 3, 1] // 4 correct (wrong on last one)
      
//       await attempt.submitAnswers(answers, comprehensiveQuiz.correctAnswers, comprehensiveQuiz.rewardPerCorrect)
//       attempts.push(attempt)
      
//       // Update student record
//       await student.completeQuiz(comprehensiveQuiz._id, attempt.rewardEarned)
//     }

//     // 3. Verify all results
//     expect(attempts[0].score).to.equal(5) // All 5 correct
//     expect(attempts[0].rewardEarned).to.equal(1000n) // 5 * 200n
//     expect(attempts[1].score).to.equal(4) // 4 correct  
//     expect(attempts[1].rewardEarned).to.equal(800n)  // 4 * 200n

//     // Sync and verify student records
//     await student1Computer.sync(student1._id)
//     await student2Computer.sync(student2._id)
    
//     expect(await student1.getCompletedQuizCount()).to.equal(1)
//     expect(await student1.totalEarnings).to.equal(1000n) // Updated to match 5 correct
//     expect(await student2.getCompletedQuizCount()).to.equal(1)
//     expect(await student2.totalEarnings).to.equal(800n)  // Updated to match 4 correct

//     // Verify teacher tracking
//     expect(await teacher.getQuizCount()).to.equal(1)
//     expect(await comprehensiveQuiz.getQuestionCount()).to.equal(5)
//   })

//   it('should handle edge case: quiz with maximum question count', async function () {
//     this.timeout(60000)
    
//     // Create quiz with many questions (testing limits)
//     const maxQuestions = Array.from({ length: 15 }, (_, i) => ({
//       text: `Question ${i + 1} with longer text?`,
//       options: [
//         `Option A for question ${i + 1}`,
//         `Option B for question ${i + 1}`,
//         `Option C for question ${i + 1}`,
//         `Option D for question ${i + 1}`
//       ],
//       correctAnswer: i % 4
//     }))

//     const maxQuiz = await teacherComputer.new(Quiz, [{
//       title: 'Maximum Questions Quiz Test',
//       description: 'Testing with many questions',
//       questions: maxQuestions,
//       rewardPerCorrect: 50n,
//       teacherPublicKey: teacher.publicKey
//     }])

//     expect(await maxQuiz.getQuestionCount()).to.equal(15)
//     expect(maxQuiz.totalReward).to.equal(750n) // 15 * 50n

//     const attempt = await student1Computer.new(QuizAttempt, [maxQuiz._id, student1Computer.getPublicKey()])
    
//     // Answer all correctly
//     const perfectAnswers = Array.from({ length: 15 }, (_, i) => i % 4)
//     await attempt.submitAnswers(perfectAnswers, maxQuiz.correctAnswers, maxQuiz.rewardPerCorrect)
    
//     expect(attempt.score).to.equal(15)
//     expect(attempt.rewardEarned).to.equal(750n)
//   })

//   it('should handle quiz deactivation workflow', async function () {
//     const quiz = await teacherComputer.new(Quiz, [{
//       title: 'Deactivation Test Quiz',
//       description: 'Testing activation states',
//       questions: sampleQuestions,
//       rewardPerCorrect: 1000n,
//       teacherPublicKey: teacher.publicKey
//     }])

//     // Initially active
//     expect(quiz.isActive).to.be.true

//     // Student can attempt when active
//     const attempt1 = await student1Computer.new(QuizAttempt, [quiz._id, student1Computer.getPublicKey()])
//     await attempt1.submitAnswers([1, 2], quiz.correctAnswers, quiz.rewardPerCorrect)
//     expect(attempt1.isCompleted).to.be.true

//     // Deactivate quiz
//     await quiz.deactivate()
    
//     // Check quiz is deactivated
//     expect(quiz.isActive).to.be.false

//     // Verify getStudentQuestions throws error when deactivated
//     try {
//       await quiz.getStudentQuestions()
//       expect.fail('Should have thrown an error')
//     } catch (error: unknown) {
//       expect((error as Error).message).to.include('Quiz is not active')
//     }
//   })
// })