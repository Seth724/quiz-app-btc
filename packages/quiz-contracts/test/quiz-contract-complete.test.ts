import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { expect } from 'chai'
import { Quiz } from '../src/quiz.js'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { QuizHelper } from '../src/helpers/quiz-helper.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0"

describe('Quiz Contract and Helper', function () {
  this.timeout(120000) // 2 minute timeout for all tests

  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let teacherHelper: TeacherHelper
  let studentHelper1: StudentHelper
  let studentHelper2: StudentHelper
  let quizHelper: QuizHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: Teacher
  let student1: Student
  let student2: Student

  before(async function () {
    console.log('\n🚀 Setting up Quiz Contract Test Environment')
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
    quizHelper = new QuizHelper(teacherComputer)
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
  })

  describe('Quiz Contract - Basic Functionality', function () {
    it('should create a quiz with correct properties', async function () {
      console.log('\n📝 Testing quiz creation...')
      
      const { quiz, paymentTxId } = await teacherHelper.createQuiz({
        title: 'Basic Math Quiz',
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        rewardAmount: 1000n,
        teacher: teacher
      })

      const quizId = await quiz._id
      console.log(`✓ Quiz created with ID: ${quizId}`)

      // Verify quiz properties
      expect(await quiz.title).to.equal('Basic Math Quiz')
      console.log('✓ Quiz title correct')

      expect(await quiz.questionText).to.equal('What is 2 + 2?')
      console.log('✓ Question text correct')

      const options = await quiz.options
      expect(options).to.have.lengthOf(4)
      expect(options[1]).to.equal('4')
      console.log('✓ Options correct (4 options)')

      expect(await quiz.correctAnswer).to.equal(1)
      console.log('✓ Correct answer index is 1')

      expect(await quiz.rewardAmount).to.equal(1000n)
      console.log('✓ Reward amount is 1000 sats')

      expect(await quiz.isActive).to.equal(true)
      console.log('✓ Quiz is active')

      expect(await quiz.isClaimed).to.equal(false)
      console.log('✓ Reward not yet claimed')

      expect(await quiz.paymentTxId).to.equal(paymentTxId)
      console.log('✓ Payment transaction ID matches')

      const attemptedStudents = await quiz.attemptedStudents
      expect(attemptedStudents).to.have.lengthOf(0)
      console.log('✓ No students have attempted yet')

      console.log('✅ Quiz creation test passed')
    })

    it('should enforce exactly 4 options', async function () {
      console.log('\n🔢 Testing 4 options validation...')

      try {
        await teacherComputer.new(Quiz, [{
          title: 'Invalid Quiz',
          questionText: 'Test?',
          options: ['A', 'B', 'C'], // Only 3 options
          correctAnswer: 0,
          rewardAmount: 100n,
          teacherPublicKey: teacherComputer.getPublicKey(),
          paymentTxId: 'dummy'
        }])
        expect.fail('Should have thrown error for less than 4 options')
      } catch (error: any) {
        expect(error.message).to.include('exactly 4 options')
        console.log('✓ Rejected quiz with 3 options')
      }

      try {
        await teacherComputer.new(Quiz, [{
          title: 'Invalid Quiz',
          questionText: 'Test?',
          options: ['A', 'B', 'C', 'D', 'E'], // 5 options
          correctAnswer: 0,
          rewardAmount: 100n,
          teacherPublicKey: teacherComputer.getPublicKey(),
          paymentTxId: 'dummy'
        }])
        expect.fail('Should have thrown error for more than 4 options')
      } catch (error: any) {
        expect(error.message).to.include('exactly 4 options')
        console.log('✓ Rejected quiz with 5 options')
      }

      console.log('✅ 4 options validation test passed')
    })

    it('should validate correct answer index (0-3)', async function () {
      console.log('\n✅ Testing correct answer validation...')

      try {
        await teacherComputer.new(Quiz, [{
          title: 'Invalid Quiz',
          questionText: 'Test?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: -1, // Invalid
          rewardAmount: 100n,
          teacherPublicKey: teacherComputer.getPublicKey(),
          paymentTxId: 'dummy'
        }])
        expect.fail('Should have thrown error for negative answer index')
      } catch (error: any) {
        expect(error.message).to.include('between 0 and 3')
        console.log('✓ Rejected negative answer index')
      }

      try {
        await teacherComputer.new(Quiz, [{
          title: 'Invalid Quiz',
          questionText: 'Test?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 4, // Out of range
          rewardAmount: 100n,
          teacherPublicKey: teacherComputer.getPublicKey(),
          paymentTxId: 'dummy'
        }])
        expect.fail('Should have thrown error for answer index > 3')
      } catch (error: any) {
        expect(error.message).to.include('between 0 and 3')
        console.log('✓ Rejected answer index > 3')
      }

      console.log('✅ Correct answer validation test passed')
    })

    it('should track attempted students', async function () {
      console.log('\n👥 Testing student attempt tracking...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      const { quiz } = await teacherHelper.createQuiz({
        title: 'Tracking Test Quiz',
        questionText: 'Test question?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        rewardAmount: 500n,
        teacher: teacher
      })

      const student1PubKey = await student1.publicKey
      const student2PubKey = await student2.publicKey

      // Initially no students
      expect(await quiz.hasStudentAttempted(student1PubKey)).to.equal(false)
      console.log('✓ Student 1 has not attempted initially')

      // Add student 1
      await quiz.addAttemptedStudent(student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await quiz.hasStudentAttempted(student1PubKey)).to.equal(true)
      console.log('✓ Student 1 marked as attempted')

      // Try to add student 1 again - should throw
      try {
        await quiz.addAttemptedStudent(student1PubKey)
        expect.fail('Should not allow duplicate attempt')
      } catch (error: any) {
        expect(error.message).to.include('already attempted')
        console.log('✓ Prevented duplicate attempt')
      }

      // Add student 2
      await quiz.addAttemptedStudent(student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await quiz.hasStudentAttempted(student2PubKey)).to.equal(true)
      console.log('✓ Student 2 marked as attempted')

      const attemptedStudents = await quiz.attemptedStudents
      expect(attemptedStudents).to.have.lengthOf(2)
      console.log('✓ Two students tracked')

      console.log('✅ Student attempt tracking test passed')
    })
  })

  describe('Quiz Contract - Reward Claiming', function () {
    it('should allow first correct student to claim reward', async function () {
      console.log('\n🏆 Testing first-come reward claiming...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      const { quiz } = await teacherHelper.createQuiz({
        title: 'Reward Test Quiz',
        questionText: 'First correct wins?',
        options: ['Yes', 'No', 'Maybe', 'Perhaps'],
        correctAnswer: 0,
        rewardAmount: 2000n,
        teacher: teacher
      })

      const student1PubKey = await student1.publicKey
      const student2PubKey = await student2.publicKey

      // Initially not claimed
      expect(await quiz.isClaimed).to.equal(false)
      expect(await quiz.claimedBy).to.equal('')
      console.log('✓ Reward initially unclaimed')

      // Student 1 claims
      const claimed1 = await quiz.claimReward(student1PubKey)
      expect(claimed1).to.equal(true)
      console.log('✓ Student 1 claimed reward')

      expect(await quiz.isClaimed).to.equal(true)
      expect(await quiz.claimedBy).to.equal(student1PubKey)
      console.log('✓ Reward marked as claimed by student 1')

      // Student 2 tries to claim
      const claimed2 = await quiz.claimReward(student2PubKey)
      expect(claimed2).to.equal(false)
      console.log('✓ Student 2 cannot claim (already claimed)')

      // Claimed by should still be student 1
      expect(await quiz.claimedBy).to.equal(student1PubKey)
      console.log('✓ Reward still belongs to student 1')

      console.log('✅ First-come reward claiming test passed')
    })

    it('should check if student can attempt quiz', async function () {
      console.log('\n🎯 Testing canStudentAttempt logic...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      const { quiz } = await teacherHelper.createQuiz({
        title: 'Can Attempt Quiz',
        questionText: 'Can you attempt?',
        options: ['Yes', 'No', 'Maybe', 'Perhaps'],
        correctAnswer: 0,
        rewardAmount: 1000n,
        teacher: teacher
      })

      const student1PubKey = await student1.publicKey
      const student2PubKey = await student2.publicKey

      // Initially both can attempt
      expect(await quiz.canStudentAttempt(student1PubKey)).to.equal(true)
      expect(await quiz.canStudentAttempt(student2PubKey)).to.equal(true)
      console.log('✓ Both students can attempt initially')

      // Student 1 attempts
      await quiz.addAttemptedStudent(student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await quiz.canStudentAttempt(student1PubKey)).to.equal(false)
      expect(await quiz.canStudentAttempt(student2PubKey)).to.equal(true)
      console.log('✓ Student 1 cannot attempt again, student 2 still can')

      // Deactivate quiz
      await quiz.deactivate()
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await quiz.canStudentAttempt(student2PubKey)).to.equal(false)
      console.log('✓ Student 2 cannot attempt inactive quiz')

      console.log('✅ canStudentAttempt logic test passed')
    })
  })

  describe('Quiz Helper - Utility Functions', function () {
    it('should get quiz details', async function () {
      console.log('\n📋 Testing quiz helper get functionality...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      const { quiz } = await teacherHelper.createQuiz({
        title: 'Helper Test Quiz',
        questionText: 'Test?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 2,
        rewardAmount: 1500n,
        teacher: teacher
      })

      const quizId = await quiz._id

      // Get quiz via helper
      const fetchedQuiz = await quizHelper.getQuiz(quizId)
      
      expect(await fetchedQuiz.title).to.equal('Helper Test Quiz')
      expect(await fetchedQuiz.rewardAmount).to.equal(1500n)
      console.log('✓ Quiz fetched correctly via helper')

      console.log('✅ Quiz helper get test passed')
    })

    it('should check quiz state via helper', async function () {
      console.log('\n🔍 Testing quiz state check...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      const { quiz } = await teacherHelper.createQuiz({
        title: 'State Test Quiz',
        questionText: 'Is this active?',
        options: ['Yes', 'No', 'Maybe', 'Perhaps'],
        correctAnswer: 0,
        rewardAmount: 800n,
        teacher: teacher
      })

      const quizId = await quiz._id

      // Check if active via helper
      const isActive = await quizHelper.isQuizActive(quizId)
      expect(isActive).to.equal(true)
      console.log('✓ Quiz is active')

      // Check if claimed
      const isClaimed = await quizHelper.isRewardClaimed(quizId)
      expect(isClaimed).to.equal(false)
      console.log('✓ Reward not yet claimed')

      console.log('✅ Quiz state check test passed')
    })

    it('should validate quiz attempt eligibility', async function () {
      console.log('\n✔️ Testing attempt eligibility validation...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      const { quiz } = await teacherHelper.createQuiz({
        title: 'Eligibility Quiz',
        questionText: 'Can I attempt?',
        options: ['Yes', 'No', 'Maybe', 'Perhaps'],
        correctAnswer: 0,
        rewardAmount: 1000n,
        teacher: teacher
      })

      const quizId = await quiz._id
      const student1PubKey = student1Computer.getPublicKey()

      // Initially eligible
      const canAttempt1 = await quizHelper.canStudentAttemptQuiz(quizId, student1PubKey)
      expect(canAttempt1).to.equal(true)
      console.log('✓ Student eligible initially')

      // Mark as attempted
      await quiz.addAttemptedStudent(student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // No longer eligible
      const canAttempt2 = await quizHelper.canStudentAttemptQuiz(quizId, student1PubKey)
      expect(canAttempt2).to.equal(false)
      console.log('✓ Student not eligible after attempting')

      console.log('✅ Attempt eligibility validation test passed')
    })
  })

  describe('Quiz Contract - Complete Workflow', function () {
    it('should handle complete quiz lifecycle', async function () {
      console.log('\n🔄 Testing complete quiz lifecycle...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // Delay before quiz creation

      // 1. Teacher creates quiz
      const { quiz } = await teacherHelper.createQuiz({
        title: 'Lifecycle Quiz',
        questionText: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 1,
        rewardAmount: 3000n,
        teacher: teacher
      })

      console.log(`✓ Quiz created: ${await quiz._id}`)

      // 2. Verify quiz is active and unclaimed
      expect(await quiz.isActive).to.equal(true)
      expect(await quiz.isClaimed).to.equal(false)
      console.log('✓ Quiz is active and unclaimed')

      // 3. Student 1 attempts and answers correctly
      const student1PubKey = await student1.publicKey
      await quiz.addAttemptedStudent(student1PubKey)
      const claimed = await quiz.claimReward(student1PubKey)
      expect(claimed).to.equal(true)
      console.log('✓ Student 1 attempted and claimed reward')

      // 4. Student 2 tries to attempt - should fail (already claimed)
      const student2PubKey = await student2.publicKey
      await quiz.addAttemptedStudent(student2PubKey)
      const claimed2 = await quiz.claimReward(student2PubKey)
      expect(claimed2).to.equal(false)
      console.log('✓ Student 2 cannot claim (reward already taken)')

      // 5. Teacher deactivates quiz
      await quiz.deactivate()
      await new Promise(resolve => setTimeout(resolve, 2000))
      expect(await quiz.isActive).to.equal(false)
      console.log('✓ Quiz deactivated by teacher')

      // 6. Verify final state
      const attemptedStudents = await quiz.attemptedStudents
      expect(attemptedStudents).to.have.lengthOf(2)
      expect(await quiz.isClaimed).to.equal(true)
      expect(await quiz.claimedBy).to.equal(student1PubKey)
      console.log('✓ Final state correct: 2 attempts, claimed by student 1')

      console.log('✅ Complete quiz lifecycle test passed')
    })
  })

  after(async function () {
    console.log('\n🏁 Quiz Contract and Helper Tests Completed Successfully!')
    console.log('\n📋 Summary of Tests Performed:')
    console.log('  ✓ Quiz creation with correct properties')
    console.log('  ✓ 4 options enforcement')
    console.log('  ✓ Correct answer validation (0-3)')
    console.log('  ✓ Student attempt tracking')
    console.log('  ✓ First-come reward claiming')
    console.log('  ✓ Student attempt eligibility')
    console.log('  ✓ Quiz helper utilities')
    console.log('  ✓ Quiz state checking')
    console.log('  ✓ Complete quiz lifecycle')
  })
})
