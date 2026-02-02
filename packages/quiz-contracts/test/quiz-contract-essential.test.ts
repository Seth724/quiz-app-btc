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

describe('Quiz Contract - Essential Tests', function () {
  this.timeout(180000) // 3 minute timeout

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
    console.log('\n🚀 Setting up Quiz Contract Essential Tests')
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

  describe('Quiz Validation Tests', function () {
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
  })

  describe('Quiz Complete Workflow', function () {
    it('should handle complete quiz creation and claiming lifecycle', async function () {
      console.log('\n🔄 Testing complete quiz lifecycle...')

      // 1. Teacher creates quiz
      const { quiz } = await teacherHelper.createQuiz({
        title: 'Complete Workflow Quiz',
        questionText: 'What is 5 + 5?',
        options: ['8', '9', '10', '11'],
        correctAnswer: 2,
        rewardAmount: 2000n,
        teacher: teacher
      })

      console.log(`✓ Quiz created: ${await quiz._id}`)

      // 2. Verify quiz properties
      expect(await quiz.title).to.equal('Complete Workflow Quiz')
      expect(await quiz.questionText).to.equal('What is 5 + 5?')
      const options = await quiz.options
      expect(options).to.have.lengthOf(4)
      expect(await quiz.correctAnswer).to.equal(2)
      expect(await quiz.rewardAmount).to.equal(2000n)
      expect(await quiz.isActive).to.equal(true)
      expect(await quiz.isClaimed).to.equal(false)
      console.log('✓ Quiz properties verified')

      // 3. Check initial state
      const attemptedStudents1 = await quiz.attemptedStudents
      expect(attemptedStudents1).to.have.lengthOf(0)
      console.log('✓ No students have attempted initially')

      // 4. Student 1 attempts and claims reward
      const student1PubKey = await student1.publicKey
      await quiz.addAttemptedStudent(student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      expect(await quiz.hasStudentAttempted(student1PubKey)).to.equal(true)
      console.log('✓ Student 1 marked as attempted')

      const claimed1 = await quiz.claimReward(student1PubKey)
      expect(claimed1).to.equal(true)
      expect(await quiz.isClaimed).to.equal(true)
      expect(await quiz.claimedBy).to.equal(student1PubKey)
      console.log('✓ Student 1 claimed reward successfully')

      // 5. Student 2 tries to attempt - reward already claimed
      const student2PubKey = await student2.publicKey
      await quiz.addAttemptedStudent(student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const claimed2 = await quiz.claimReward(student2PubKey)
      expect(claimed2).to.equal(false)
      console.log('✓ Student 2 cannot claim (already claimed by student 1)')

      // 6. Verify duplicate attempt prevention
      try {
        await quiz.addAttemptedStudent(student1PubKey)
        expect.fail('Should not allow duplicate attempt')
      } catch (error: any) {
        expect(error.message).to.include('already attempted')
        console.log('✓ Prevented duplicate attempt by student 1')
      }

      // 7. Verify final state
      const attemptedStudents2 = await quiz.attemptedStudents
      expect(attemptedStudents2).to.have.lengthOf(2)
      expect(await quiz.claimedBy).to.equal(student1PubKey)
      console.log('✓ Final state: 2 attempts, reward claimed by student 1')

      // 8. Verify canStudentAttempt logic
      expect(await quiz.canStudentAttempt(student1PubKey)).to.equal(false)
      expect(await quiz.canStudentAttempt(student2PubKey)).to.equal(false)
      console.log('✓ Both students cannot attempt again')

      // 9. Deactivate quiz
      await quiz.deactivate()
      await new Promise(resolve => setTimeout(resolve, 2000))
      expect(await quiz.isActive).to.equal(false)
      console.log('✓ Quiz deactivated by teacher')

      console.log('✅ Complete quiz lifecycle test passed')
    })
  })

  describe('Quiz Helper Functions', function () {
    it('should provide quiz helper utilities', async function () {
      console.log('\n🛠️ Testing quiz helper utilities...')
      await new Promise(resolve => setTimeout(resolve, 4000)) // Extra delay

      // Create a quiz for testing
      const { quiz } = await teacherHelper.createQuiz({
        title: 'Helper Test Quiz',
        questionText: 'Test question?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 1,
        rewardAmount: 1500n,
        teacher: teacher
      })

      const quizId = await quiz._id
      console.log(`✓ Test quiz created: ${quizId}`)

      // Test getQuiz
      const fetchedQuiz = await quizHelper.getQuiz(quizId)
      expect(await fetchedQuiz.title).to.equal('Helper Test Quiz')
      console.log('✓ getQuiz() works')

      // Test isQuizActive
      const isActive = await quizHelper.isQuizActive(quizId)
      expect(isActive).to.equal(true)
      console.log('✓ isQuizActive() works')

      // Test isRewardClaimed
      const isClaimed = await quizHelper.isRewardClaimed(quizId)
      expect(isClaimed).to.equal(false)
      console.log('✓ isRewardClaimed() works')

      // Test canStudentAttemptQuiz
      const studentPubKey = student1Computer.getPublicKey()
      const canAttempt = await quizHelper.canStudentAttemptQuiz(quizId, studentPubKey)
      expect(canAttempt).to.equal(true)
      console.log('✓ canStudentAttemptQuiz() works')

      // Test getAttemptCount
      const attemptCount = await quizHelper.getAttemptCount(quizId)
      expect(attemptCount).to.equal(0)
      console.log('✓ getAttemptCount() works')

      // Test getQuizDetails
      const details = await quizHelper.getQuizDetails(quizId)
      expect(details.title).to.equal('Helper Test Quiz')
      expect(details.rewardAmount).to.equal(1500n)
      expect(details.isActive).to.equal(true)
      expect(details.isClaimed).to.equal(false)
      expect(details.attemptCount).to.equal(0)
      console.log('✓ getQuizDetails() works')

      // Test isValidAnswerIndex
      expect(quizHelper.isValidAnswerIndex(0)).to.equal(true)
      expect(quizHelper.isValidAnswerIndex(3)).to.equal(true)
      expect(quizHelper.isValidAnswerIndex(-1)).to.equal(false)
      expect(quizHelper.isValidAnswerIndex(4)).to.equal(false)
      console.log('✓ isValidAnswerIndex() works')

      console.log('✅ Quiz helper utilities test passed')
    })
  })

  after(async function () {
    console.log('\n🏁 Quiz Contract Essential Tests Completed!')
    console.log('\n📋 Tests Performed:')
    console.log('  ✓ 4 options enforcement validation')
    console.log('  ✓ Correct answer index validation (0-3)')
    console.log('  ✓ Complete quiz workflow (creation → attempts → claiming → deactivation)')
    console.log('  ✓ Quiz helper utilities (all methods)')
    console.log('\n✨ All essential quiz contract functionality verified!')
  })
})
