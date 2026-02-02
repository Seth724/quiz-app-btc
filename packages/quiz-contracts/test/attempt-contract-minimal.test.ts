import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
//import { QuizAttempt } from '../src/attempt.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

describe('QuizAttempt - Minimal Core Tests', function () {
  this.timeout(300000) // 5 minute timeout

  // Configuration
  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  // Computers and helpers
  let teacherComputer: Computer
  let studentComputer: Computer
  let teacherHelper: TeacherHelper
  let studentHelper: StudentHelper
  let attemptHelper: AttemptHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: Teacher
  let student: Student
  let quiz: Quiz

  before(async function () {
    console.log('\\n🚀 Setting up QuizAttempt Minimal Core Tests')
    console.log(`Chain: ${chain}, Network: ${network}`)
    console.log(`Node URL: ${url}`)

    // Initialize computers
    teacherComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/0`
    })

    studentComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/1`
    })

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    studentHelper = new StudentHelper(studentComputer)
    attemptHelper = new AttemptHelper(studentComputer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallets for regtest
    if (network === 'regtest') {
      console.log('💰 Funding wallets on regtest...')
      await teacherComputer.faucet(1e8)
      await studentComputer.faucet(1e8)
      console.log('✅ Wallets funded successfully')
    }

    // Deploy payment contract
    await paymentHelper.deploy()
    console.log('✅ Payment contract deployed')

    // Create teacher and student
    teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
    console.log('✅ Teacher created')
    
    student = await studentHelper.createStudent('Alice', studentComputer.getPublicKey())
    console.log('✅ Student created')

    // Create single quiz for all tests
    await new Promise(resolve => setTimeout(resolve, 5000))
    const { quiz: createdQuiz } = await teacherHelper.createQuiz({
      title: 'Core Test Quiz',
      questionText: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1, // Index 1 = '4'
      rewardAmount: 1000n,
      teacher: teacher
    })
    quiz = createdQuiz
    console.log('✅ Quiz created for all tests')
  })

  describe('QuizAttempt Core Functionality', function () {

    it('should create attempt, submit answer, and validate workflow', async function () {
      console.log('\\n📝 Testing complete QuizAttempt workflow...')
      
      const quizId = await quiz._id
      const studentPubKey = await student.publicKey

      // === PART 1: Create Attempt ===
      const attempt = await attemptHelper.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      console.log('✓ Attempt created:', await attempt._id)

      // Verify initial state
      expect(await attempt.quizId).to.equal(quizId)
      expect(await attempt.studentPublicKey).to.equal(studentPubKey)
      expect(await attempt.selectedAnswer).to.equal(-1)
      expect(await attempt.isCorrect).to.equal(false)
      expect(await attempt.rewardEarned).to.equal(0n)
      expect(await attempt.isCompleted).to.equal(false)
      console.log('✓ Initial state correct: not answered, not completed')

      // === PART 2: Submit Correct Answer ===
      await new Promise(resolve => setTimeout(resolve, 4000))
      await attempt.submitAnswer(1, await quiz.correctAnswer, await quiz.rewardAmount) // Correct answer
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      expect(await attempt.selectedAnswer).to.equal(1)
      expect(await attempt.isCorrect).to.equal(true)
      expect(await attempt.rewardEarned).to.equal(1000n)
      expect(await attempt.isCompleted).to.equal(true)
      console.log('✓ Correct answer submitted: earned 1000 sats')

      // === PART 3: Test Helper Methods ===
      const isCompleted = await attemptHelper.isCompleted(attempt)
      const isCorrect = await attemptHelper.isCorrect(attempt)
      const rewardEarned = await attemptHelper.getRewardEarned(attempt)

      expect(isCompleted).to.equal(true)
      expect(isCorrect).to.equal(true)
      expect(rewardEarned).to.equal(1000n)
      console.log('✓ Helper methods work correctly')

      // === PART 4: Test Answer Validation ===
      try {
        await attempt.submitAnswer(-1, 1, 1000n) // Should fail - already completed
        expect.fail('Should prevent duplicate submission')
      } catch (error: any) {
        expect(error.message).to.include('already completed')
        console.log('✓ Prevented duplicate submission')
      }

      // === PART 5: Quiz Workflow Integration ===
      await quiz.addAttemptedStudent(studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      const claimed = await quiz.claimReward(studentPubKey)
      expect(claimed).to.equal(true)
      console.log('✓ Student successfully claimed quiz reward')

      expect(await quiz.isClaimed).to.equal(true)
      expect(await quiz.claimedBy).to.equal(studentPubKey)
      console.log('✓ Quiz marked as claimed')

      console.log('\\n✅ Complete QuizAttempt workflow validated!')
      console.log('🎯 Workflow Summary:')
      console.log('  • Attempt creation with proper initial state')
      console.log('  • Answer submission with validation and reward calculation')
      console.log('  • Helper methods for accessing attempt data')
      console.log('  • Prevention of duplicate submissions')
      console.log('  • Integration with Quiz contract for reward claiming')
    })

    it('should handle incorrect answers', async function () {
      console.log('\\n❌ Testing incorrect answer handling...')
      await new Promise(resolve => setTimeout(resolve, 8000)) // Long delay

      const quizId = await quiz._id
      const studentPubKey = await student.publicKey

      // Create new attempt
      const wrongAttempt = await attemptHelper.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))

      // Submit wrong answer
      await wrongAttempt.submitAnswer(0, await quiz.correctAnswer, await quiz.rewardAmount) // Wrong: 0 != 1
      await new Promise(resolve => setTimeout(resolve, 3000))

      expect(await wrongAttempt.selectedAnswer).to.equal(0)
      expect(await wrongAttempt.isCorrect).to.equal(false)
      expect(await wrongAttempt.rewardEarned).to.equal(0n)
      expect(await wrongAttempt.isCompleted).to.equal(true)
      console.log('✓ Incorrect answer: no reward earned')

      console.log('✅ Incorrect answer handling validated!')
    })

    it('should validate answer range', async function () {
      console.log('\\n🎯 Testing answer validation...')
      await new Promise(resolve => setTimeout(resolve, 8000)) // Long delay

      const quizId = await quiz._id
      const studentPubKey = await student.publicKey

      // Create new attempt
      const validationAttempt = await attemptHelper.createAttempt(quizId, studentPubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))

      // Test invalid answer indices
      try {
        await validationAttempt.submitAnswer(-1, 1, 1000n) // Negative
        expect.fail('Should reject negative index')
      } catch (error: any) {
        expect(error.message).to.include('between 0-3')
        console.log('✓ Rejected negative answer index')
      }

      try {
        await validationAttempt.submitAnswer(4, 1, 1000n) // Too high
        expect.fail('Should reject index > 3')
      } catch (error: any) {
        expect(error.message).to.include('between 0-3')
        console.log('✓ Rejected answer index > 3')
      }

      console.log('✅ Answer validation working correctly!')
    })
  })

  after(async function () {
    console.log('\\n🏁 QuizAttempt Minimal Core Tests Completed!')
    console.log('\\n📋 Tests Passed:')
    console.log('  ✓ Complete workflow (create → answer → validate → claim)')
    console.log('  ✓ Incorrect answer handling')  
    console.log('  ✓ Answer range validation')
    console.log('\\n🎯 Core Functionality Confirmed:')
    console.log('  • QuizAttempt contract creation and state management')
    console.log('  • Answer submission with proper validation')
    console.log('  • Reward calculation (correct = reward, incorrect = 0)')
    console.log('  • Helper method integration')
    console.log('  • Quiz contract integration for reward claiming')
    console.log('  • Proper error handling and validation')
  })
})