import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { expect } from 'chai'
//import { QuizAttempt } from '../src/attempt.js'
import { Quiz } from '../src/quiz.js'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0"

describe('QuizAttempt - Essential Workflow Tests', function () {
  this.timeout(300000) // 5 minute timeout for long delays

  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let teacherHelper: TeacherHelper
  let studentHelper1: StudentHelper
  let studentHelper2: StudentHelper
  let attemptHelper1: AttemptHelper
  let attemptHelper2: AttemptHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: Teacher
  let student1: Student
  let student2: Student
  let sharedQuiz: Quiz // Reuse this quiz for most tests

  before(async function () {
    console.log('\n🚀 Setting up QuizAttempt Essential Tests')
    console.log(`Chain: ${chain}, Network: ${network}`)
    console.log(`Node URL: ${url}`)

    // Initialize computers
    teacherComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/0`
    })

    student1Computer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/1`
    })

    student2Computer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/2`
    })

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    studentHelper1 = new StudentHelper(student1Computer)
    studentHelper2 = new StudentHelper(student2Computer)
    attemptHelper1 = new AttemptHelper(student1Computer)
    attemptHelper2 = new AttemptHelper(student2Computer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallets for regtest
    if (network === 'regtest') {
      console.log('💰 Funding wallets on regtest...')
      await teacherComputer.faucet(1e8)
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
      console.log('✅ Wallets funded successfully')
    }

    // Deploy payment contract
    await paymentHelper.deploy()
    console.log('✅ Payment contract deployed')

    // Create teacher and students
    teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
    console.log('✅ Teacher created')
    
    student1 = await studentHelper1.createStudent('Alice', student1Computer.getPublicKey())
    student2 = await studentHelper2.createStudent('Bob', student2Computer.getPublicKey())
    console.log('✅ Students created')

    // Create shared quiz for most tests
    await new Promise(resolve => setTimeout(resolve, 5000))
    const { quiz } = await teacherHelper.createQuiz({
      title: 'Shared Test Quiz',
      questionText: 'What is 4 + 4?',
      options: ['6', '7', '8', '9'],
      correctAnswer: 2, // Index 2 = '8'
      rewardAmount: 1000n,
      teacher: teacher
    })
    sharedQuiz = quiz
    console.log('✅ Shared quiz created for reuse')
  })

  describe('QuizAttempt Basic Validation', function () {
    it('should create attempt and validate answer range', async function () {
      console.log('\n📝 Testing attempt creation and validation...')

      const quizId = await sharedQuiz._id
      const studentPubKey = await student1.publicKey

      // Create attempt
      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))

      console.log(`✓ Attempt created: ${await attempt._id}`)

      // Verify initial state
      expect(await attempt.quizId).to.equal(quizId)
      expect(await attempt.studentPublicKey).to.equal(studentPubKey)
      expect(await attempt.selectedAnswer).to.equal(-1)
      expect(await attempt.isCompleted).to.equal(false)
      expect(await attempt.rewardEarned).to.equal(0n)
      console.log('✓ Initial state correct')

      // Test answer validation - negative index
      try {
        await attempt.submitAnswer(-1, 2, 1000n)
        expect.fail('Should reject negative index')
      } catch (error: any) {
        expect(error.message).to.include('between 0-3')
        console.log('✓ Rejected negative answer index')
      }

      // Test answer validation - index > 3
      try {
        await attempt.submitAnswer(4, 2, 1000n)
        expect.fail('Should reject index > 3')
      } catch (error: any) {
        expect(error.message).to.include('between 0-3')
        console.log('✓ Rejected answer index > 3')
      }

      console.log('✅ Basic validation test passed')
    })

    it('should handle correct and incorrect answers', async function () {
      console.log('\n🎯 Testing answer submission...')
      await new Promise(resolve => setTimeout(resolve, 8000)) // Long delay

      const quizId = await sharedQuiz._id

      // Test correct answer
      const student1PubKey = await student1.publicKey
      const attempt1 = await attemptHelper1.createAttempt(quizId, student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))

      await attempt1.submitAnswer(2, 2, 1000n) // Correct answer (index 2)
      await new Promise(resolve => setTimeout(resolve, 3000))

      expect(await attempt1.isCorrect).to.equal(true)
      expect(await attempt1.rewardEarned).to.equal(1000n)
      expect(await attempt1.isCompleted).to.equal(true)
      expect(await attempt1.selectedAnswer).to.equal(2)
      console.log('✓ Correct answer: earned 1000 sats')

      // Test incorrect answer
      const student2PubKey = await student2.publicKey
      const attempt2 = await attemptHelper2.createAttempt(quizId, student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))

      await attempt2.submitAnswer(0, 2, 1000n) // Wrong answer
      await new Promise(resolve => setTimeout(resolve, 3000))

      expect(await attempt2.isCorrect).to.equal(false)
      expect(await attempt2.rewardEarned).to.equal(0n)
      expect(await attempt2.isCompleted).to.equal(true)
      expect(await attempt2.selectedAnswer).to.equal(0)
      console.log('✓ Incorrect answer: earned 0 sats')

      console.log('✅ Answer submission test passed')
    })

    it('should prevent duplicate submissions', async function () {
      console.log('\n🚫 Testing duplicate prevention...')
      await new Promise(resolve => setTimeout(resolve, 8000)) // Long delay

      const quizId = await sharedQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))

      // First submission
      await attempt.submitAnswer(2, 2, 1000n)
      await new Promise(resolve => setTimeout(resolve, 3000))

      expect(await attempt.isCompleted).to.equal(true)
      console.log('✓ First submission successful')

      // Try to submit again
      try {
        await attempt.submitAnswer(1, 2, 1000n)
        expect.fail('Should prevent duplicate submission')
      } catch (error: any) {
        expect(error.message).to.include('already completed')
        console.log('✓ Prevented duplicate submission')
      }

      console.log('✅ Duplicate prevention test passed')
    })
  })

  describe('QuizAttempt Helper Functions', function () {
    it('should provide helper utilities', async function () {
      console.log('\n🛠️ Testing helper functions...')
      await new Promise(resolve => setTimeout(resolve, 8000)) // Long delay

      const quizId = await sharedQuiz._id
      const studentPubKey = await student1.publicKey

      // Create and submit attempt
      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))

      const attemptId = await attempt._id
      console.log(`✓ Attempt created: ${attemptId}`)

      // Test getAttempt
      const fetchedAttempt = await attemptHelper1.getAttempt(attemptId)
      expect(await fetchedAttempt._id).to.equal(attemptId)
      console.log('✓ getAttempt() works')

      // Submit answer
      await attemptHelper1.submitAnswer(attempt, 2, sharedQuiz) // Correct answer for shared quiz
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Test helper methods
      const isCompleted = await attemptHelper1.isCompleted(attempt)
      const isCorrect = await attemptHelper1.isCorrect(attempt)
      const rewardEarned = await attemptHelper1.getRewardEarned(attempt)

      expect(isCompleted).to.equal(true)
      expect(isCorrect).to.equal(true)
      expect(rewardEarned).to.equal(1000n)
      console.log('✓ Helper methods work: completed, correct, 1000 sats')

      // Test getResult by checking properties directly
      expect(await attempt.quizId).to.equal(quizId)
      expect(await attempt.studentPublicKey).to.equal(studentPubKey)
      expect(await attempt.isCorrect).to.equal(true)
      expect(await attempt.rewardEarned).to.equal(1000n)
      expect(await attempt.selectedAnswer).to.equal(2)
      console.log('✓ Attempt properties provide complete summary')

      console.log('✅ Helper functions test passed')

      console.log('\\n🏁 Testing first-come-first-served workflow with shared quiz...')
      
      // Test first-come-first-served workflow using the same quiz
      // Student1 claims quiz reward
      await sharedQuiz.addAttemptedStudent(studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      const claimed1 = await sharedQuiz.claimReward(studentPubKey)
      expect(claimed1).to.equal(true)
      console.log('✓ Student 1 claimed quiz reward (first-come-first-served)')

      // Student2 creates attempt and answers correctly (but too late)
      const student2PubKey = await student2.publicKey
      const attempt2 = await attemptHelper2.createAttempt(quizId, student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))

      await attemptHelper2.submitAnswer(attempt2, 2, sharedQuiz) // Also correct
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Try to claim (should fail - already claimed)
      await sharedQuiz.addAttemptedStudent(student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      const claimed2 = await sharedQuiz.claimReward(student2PubKey)
      expect(claimed2).to.equal(false)
      console.log('✓ Student 2 answered correctly but got no reward (already claimed)')

      // Verify workflow
      const isRewardClaimed = await sharedQuiz.isClaimed
      expect(isRewardClaimed).to.equal(true)
      console.log('✓ Quiz reward successfully claimed by first student')

      console.log('✅ First-come-first-served workflow confirmed with shared quiz')
    })
  })

  after(async function () {
    console.log('\\n🏁 QuizAttempt Essential Tests Completed!')
    console.log('\\n📋 Summary:')
    console.log('  ✓ Attempt creation and validation')
    console.log('  ✓ Correct/incorrect answer handling')
    console.log('  ✓ Duplicate submission prevention')
    console.log('  ✓ Helper function utilities')
    console.log('  ✓ First-come-first-served workflow')
    console.log('\\n🎯 Workflow Confirmed:')
    console.log('  • Teacher creates quiz with payment')
    console.log('  • Students create attempts and submit answers')
    console.log('  • QuizAttempt tracks individual attempt results')
    console.log('  • Quiz contract manages reward claiming (first-come-first-served)')
    console.log('  • Student contracts track actual rewards earned')
  })
})