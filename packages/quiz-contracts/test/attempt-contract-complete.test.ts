import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { expect } from 'chai'
import { QuizAttempt } from '../src/attempt.js'
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

describe('QuizAttempt Contract and Helper', function () {
  this.timeout(180000) // 3 minute timeout

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
  let testQuiz: Quiz

  before(async function () {
    console.log('\n🚀 Setting up QuizAttempt Contract Test Environment')
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

    // Create a test quiz for attempts
    const { quiz } = await teacherHelper.createQuiz({
      title: 'Test Quiz for Attempts',
      questionText: 'What is 3 + 3?',
      options: ['4', '5', '6', '7'],
      correctAnswer: 2, // Index 2 = '6'
      rewardAmount: 1000n,
      teacher: teacher
    })
    testQuiz = quiz
    console.log('✅ Test quiz created')
  })

  describe('QuizAttempt Contract - Basic Functionality', function () {
    it('should create a quiz attempt with correct properties', async function () {
      console.log('\n📝 Testing attempt creation...')

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const attemptId = await attempt._id
      console.log(`✓ Attempt created with ID: ${attemptId}`)

      // Verify attempt properties
      expect(await attempt.quizId).to.equal(quizId)
      console.log('✓ Quiz ID matches')

      expect(await attempt.studentPublicKey).to.equal(studentPubKey)
      console.log('✓ Student public key matches')

      expect(await attempt.selectedAnswer).to.equal(-1)
      console.log('✓ Selected answer is -1 (not answered yet)')

      expect(await attempt.isCorrect).to.equal(false)
      console.log('✓ isCorrect is false initially')

      expect(await attempt.rewardEarned).to.equal(0n)
      console.log('✓ Reward earned is 0 initially')

      expect(await attempt.isCompleted).to.equal(false)
      console.log('✓ Attempt not completed initially')

      const attemptedAt = await attempt.attemptedAt
      expect(attemptedAt).to.be.a('number')
      expect(attemptedAt).to.be.greaterThan(0)
      console.log('✓ Timestamp recorded')

      console.log('✅ Attempt creation test passed')
    })

    it('should submit correct answer and earn reward', async function () {
      console.log('\n✅ Testing correct answer submission...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('✓ Attempt created')

      // Submit correct answer (index 2 = '6')
      const result = await attemptHelper1.submitAnswer(attempt, 2, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(result.isCorrect).to.equal(true)
      expect(result.selectedAnswer).to.equal(2)
      expect(result.rewardEarned).to.equal(1000n)
      console.log('✓ Correct answer submitted, reward earned: 1000 sats')

      // Verify attempt state
      expect(await attempt.isCompleted).to.equal(true)
      expect(await attempt.isCorrect).to.equal(true)
      expect(await attempt.rewardEarned).to.equal(1000n)
      console.log('✓ Attempt completed and marked correct')

      console.log('✅ Correct answer submission test passed')
    })

    it('should submit incorrect answer with no reward', async function () {
      console.log('\n❌ Testing incorrect answer submission...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student2.publicKey

      const attempt = await attemptHelper2.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('✓ Attempt created')

      // Submit incorrect answer (index 0 = '4', correct is 2)
      const result = await attemptHelper2.submitAnswer(attempt, 0, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(result.isCorrect).to.equal(false)
      expect(result.selectedAnswer).to.equal(0)
      expect(result.rewardEarned).to.equal(0n)
      console.log('✓ Incorrect answer submitted, no reward earned')

      // Verify attempt state
      expect(await attempt.isCompleted).to.equal(true)
      expect(await attempt.isCorrect).to.equal(false)
      expect(await attempt.rewardEarned).to.equal(0n)
      console.log('✓ Attempt completed but marked incorrect')

      console.log('✅ Incorrect answer submission test passed')
    })

    it('should validate answer index (0-3)', async function () {
      console.log('\n🔢 Testing answer index validation...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Test invalid answer index: -1
      try {
        await attempt.submitAnswer(-1, 2, 1000n)
        expect.fail('Should have thrown error for negative answer index')
      } catch (error: any) {
        expect(error.message).to.include('between 0-3')
        console.log('✓ Rejected negative answer index')
      }

      // Test invalid answer index: 4
      try {
        await attempt.submitAnswer(4, 2, 1000n)
        expect.fail('Should have thrown error for answer index > 3')
      } catch (error: any) {
        expect(error.message).to.include('between 0-3')
        console.log('✓ Rejected answer index > 3')
      }

      console.log('✅ Answer index validation test passed')
    })

    it('should prevent duplicate submissions', async function () {
      console.log('\n🚫 Testing duplicate submission prevention...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // First submission
      await attemptHelper1.submitAnswer(attempt, 2, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('✓ First submission successful')

      // Try to submit again
      try {
        await attempt.submitAnswer(1, 2, 1000n)
        expect.fail('Should have thrown error for duplicate submission')
      } catch (error: any) {
        expect(error.message).to.include('already completed')
        console.log('✓ Prevented duplicate submission')
      }

      console.log('✅ Duplicate submission prevention test passed')
    })
  })

  describe('AttemptHelper - Utility Functions', function () {
    it('should get attempt by ID', async function () {
      console.log('\n🔍 Testing get attempt...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const attemptId = await attempt._id

      // Get attempt by ID
      const fetchedAttempt = await attemptHelper1.getAttempt(attemptId)
      
      expect(await fetchedAttempt._id).to.equal(attemptId)
      expect(await fetchedAttempt.quizId).to.equal(quizId)
      expect(await fetchedAttempt.studentPublicKey).to.equal(studentPubKey)
      console.log('✓ Attempt fetched correctly by ID')

      console.log('✅ Get attempt test passed')
    })

    it('should get attempt result', async function () {
      console.log('\n📊 Testing get attempt result...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Submit answer
      await attemptHelper1.submitAnswer(attempt, 2, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get result
      const result = await attemptHelper1.getResult(attempt)

      expect(result.quizId).to.equal(quizId)
      expect(result.studentPublicKey).to.equal(studentPubKey)
      expect(result.selectedAnswer).to.equal(2)
      expect(result.isCorrect).to.equal(true)
      expect(result.rewardEarned).to.equal(1000n)
      expect(result.attemptedAt).to.be.a('number')
      console.log('✓ Result retrieved with all properties')

      console.log('✅ Get attempt result test passed')
    })

    it('should check attempt completion status', async function () {
      console.log('\n✔️ Testing completion status check...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check before submission
      const isCompletedBefore = await attemptHelper1.isCompleted(attempt)
      expect(isCompletedBefore).to.equal(false)
      console.log('✓ Not completed before submission')

      // Submit answer
      await attemptHelper1.submitAnswer(attempt, 1, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check after submission
      const isCompletedAfter = await attemptHelper1.isCompleted(attempt)
      expect(isCompletedAfter).to.equal(true)
      console.log('✓ Completed after submission')

      console.log('✅ Completion status check test passed')
    })

    it('should check if attempt was correct', async function () {
      console.log('\n🎯 Testing correctness check...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Submit correct answer
      await attemptHelper1.submitAnswer(attempt, 2, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const isCorrect = await attemptHelper1.isCorrect(attempt)
      expect(isCorrect).to.equal(true)
      console.log('✓ Correct answer detected')

      console.log('✅ Correctness check test passed')
    })

    it('should get reward earned from attempt', async function () {
      console.log('\n💰 Testing reward earned retrieval...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const quizId = await testQuiz._id
      const studentPubKey = await student1.publicKey

      const attempt = await attemptHelper1.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Submit correct answer
      await attemptHelper1.submitAnswer(attempt, 2, testQuiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const rewardEarned = await attemptHelper1.getRewardEarned(attempt)
      expect(rewardEarned).to.equal(1000n)
      console.log('✓ Reward amount retrieved: 1000 sats')

      console.log('✅ Reward earned retrieval test passed')
    })
  })

  describe('QuizAttempt - Complete Workflow', function () {
    it('should handle complete attempt workflow', async function () {
      console.log('\n🔄 Testing complete attempt workflow...')
      await new Promise(resolve => setTimeout(resolve, 4000))

      // Create a new quiz for this workflow test
      const { quiz } = await teacherHelper.createQuiz({
        title: 'Workflow Test Quiz',
        questionText: 'What is 7 + 8?',
        options: ['13', '14', '15', '16'],
        correctAnswer: 2, // Index 2 = '15'
        rewardAmount: 2500n,
        teacher: teacher
      })

      const quizId = await quiz._id
      console.log('✓ Quiz created for workflow test')

      // 1. Student 1 creates attempt
      const student1PubKey = await student1.publicKey
      const attempt1 = await attemptHelper1.createAttempt(quizId, student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('✓ Student 1 created attempt')

      // 2. Verify initial state
      expect(await attempt1.isCompleted).to.equal(false)
      expect(await attempt1.selectedAnswer).to.equal(-1)
      expect(await attempt1.rewardEarned).to.equal(0n)
      console.log('✓ Initial state verified')

      // 3. Student 1 submits correct answer
      const result1 = await attemptHelper1.submitAnswer(attempt1, 2, quiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(result1.isCorrect).to.equal(true)
      expect(result1.rewardEarned).to.equal(2500n)
      console.log('✓ Student 1 submitted correct answer, earned 2500 sats')

      // 4. Verify attempt completion
      expect(await attempt1.isCompleted).to.equal(true)
      expect(await attempt1.selectedAnswer).to.equal(2)
      expect(await attempt1.isCorrect).to.equal(true)
      console.log('✓ Attempt marked as completed')

      // 5. Get attempt result
      const finalResult = await attempt1.getResult()
      expect(finalResult.quizId).to.equal(quizId)
      expect(finalResult.studentPublicKey).to.equal(student1PubKey)
      expect(finalResult.isCorrect).to.equal(true)
      expect(finalResult.rewardEarned).to.equal(2500n)
      console.log('✓ Attempt result retrieved successfully')

      // 6. Try to submit again - should fail
      try {
        await attempt1.submitAnswer(1, 2, 2500n)
        expect.fail('Should not allow resubmission')
      } catch (error: any) {
        expect(error.message).to.include('already completed')
        console.log('✓ Prevented resubmission')
      }

      console.log('✅ Complete attempt workflow test passed')
    })

    it('should track multiple student attempts for same quiz', async function () {
      console.log('\n👥 Testing multiple attempts on same quiz...')
      await new Promise(resolve => setTimeout(resolve, 4000))

      // Create quiz
      const { quiz } = await teacherHelper.createQuiz({
        title: 'Multi-Attempt Quiz',
        questionText: 'What is 10 - 3?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2, // Index 2 = '7'
        rewardAmount: 1500n,
        teacher: teacher
      })

      const quizId = await quiz._id
      console.log('✓ Quiz created')

      // Student 1 attempts (correct)
      const student1PubKey = await student1.publicKey
      const attempt1 = await attemptHelper1.createAttempt(quizId, student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      await attemptHelper1.submitAnswer(attempt1, 2, quiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await attempt1.isCorrect).to.equal(true)
      expect(await attempt1.rewardEarned).to.equal(1500n)
      console.log('✓ Student 1 answered correctly')

      // Student 2 attempts (incorrect)
      const student2PubKey = await student2.publicKey
      const attempt2 = await attemptHelper2.createAttempt(quizId, student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      await attemptHelper2.submitAnswer(attempt2, 0, quiz)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await attempt2.isCorrect).to.equal(false)
      expect(await attempt2.rewardEarned).to.equal(0n)
      console.log('✓ Student 2 answered incorrectly')

      // Both attempts are independent
      expect(await attempt1._id).to.not.equal(await attempt2._id)
      console.log('✓ Both attempts are separate objects')

      console.log('✅ Multiple attempts test passed')
    })
  })

  after(async function () {
    console.log('\n🏁 QuizAttempt Contract and Helper Tests Completed!')
    console.log('\n📋 Summary of Tests Performed:')
    console.log('  ✓ Attempt creation with correct properties')
    console.log('  ✓ Correct answer submission with reward')
    console.log('  ✓ Incorrect answer submission without reward')
    console.log('  ✓ Answer index validation (0-3)')
    console.log('  ✓ Duplicate submission prevention')
    console.log('  ✓ Get attempt by ID')
    console.log('  ✓ Get attempt result')
    console.log('  ✓ Check completion status')
    console.log('  ✓ Check correctness')
    console.log('  ✓ Get reward earned')
    console.log('  ✓ Complete workflow')
    console.log('  ✓ Multiple student attempts')
    console.log('\n✨ All QuizAttempt functionality verified!')
  })
})
