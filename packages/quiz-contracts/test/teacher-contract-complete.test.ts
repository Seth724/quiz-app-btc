import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../src/teacher.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
//import { Quiz } from '../src/quiz.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { config } from 'dotenv'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0"

describe('Teacher Contract and Helper', function () {
  this.timeout(120000) // 2 minute timeout for all tests

  let teacherComputer: Computer
  let teacherHelper: TeacherHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: Teacher

  before(async function () {
    console.log('\n🚀 Setting up Teacher Contract Test Environment')
    console.log(`Chain: ${chain}, Network: ${network}`)
    console.log(`Node URL: ${url}`)

    // Initialize computer for teacher
    teacherComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/0`
    })

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallet for regtest
    if (network === 'regtest') {
      console.log('💰 Funding teacher wallet on regtest...')
      await teacherComputer.faucet(1e8) // 1 LTC
      console.log('✅ Teacher wallet funded successfully')
    }

    // Deploy payment contract
    await paymentHelper.deploy()
    console.log('✅ Payment contract deployed')
  })

  describe('Teacher Contract - Basic Functionality', function () {
    it('should create a teacher with correct properties', async function () {
      console.log('\n👨‍🏫 Testing teacher creation...')

      teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())

      const teacherId = await teacher._id
      const teacherName = await teacher.name
      const teacherPubKey = await teacher.publicKey
      const quizCount = await teacher.getQuizCount()

      console.log('✓ Teacher created with ID:', teacherId)
      console.log('✓ Teacher name:', teacherName)
      console.log('✓ Teacher public key:', teacherPubKey.substring(0, 10) + '...')
      console.log('✓ Created quizzes count:', quizCount)

      // Don't use instanceof with Bitcoin Computer proxies
      expect(teacherName).to.equal('Professor Smith')
      expect(teacherPubKey).to.be.a('string')
      expect(quizCount).to.equal(0)

      console.log('✅ Teacher creation test passed')
    })

    it('should allow teacher to add quizzes to their list', async function () {
      console.log('\n📝 Testing teacher quiz list management...')

      // Add mock quiz IDs to teacher's list
      const mockQuizId = 'mock-quiz-id-123'
      await teacher.addQuiz(mockQuizId)

      const createdQuizzes = await teacher.createdQuizzes
      const quizCount = await teacher.getQuizCount()

      expect(createdQuizzes).to.include(mockQuizId)
      expect(quizCount).to.equal(1)

      // Add another quiz
      const mockQuizId2 = 'mock-quiz-id-456'
      await teacher.addQuiz(mockQuizId2)

      const updatedQuizzes = await teacher.createdQuizzes
      const updatedQuizCount = await teacher.getQuizCount()

      expect(updatedQuizzes).to.include.members([mockQuizId, mockQuizId2])
      expect(updatedQuizCount).to.equal(2)

      console.log('✅ Teacher quiz list management test passed')
    })

    it('should validate quiz parameters correctly', function () {
      console.log('\n🔍 Testing quiz parameter validation...')

      // Valid parameters should not throw
      //expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 1, 1000n)).to.not.throw

      // Test empty question text
      expect(() => Teacher.validateQuizParams('', ['3', '4', '5', '6'], 1, 1000n))
        .to.throw('Question text cannot be empty')

      // Test question with only whitespace
      expect(() => Teacher.validateQuizParams('   ', ['3', '4', '5', '6'], 1, 1000n))
        .to.throw('Question text cannot be empty')

      // Test wrong number of options
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4'], 1, 1000n))
        .to.throw('Quiz must have exactly 4 options')

      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6', '7'], 1, 1000n))
        .to.throw('Quiz must have exactly 4 options')

      // Test invalid correct answer index
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], -1, 1000n))
        .to.throw('Correct answer must be between 0-3')

      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 4, 1000n))
        .to.throw('Correct answer must be between 0-3')

      // Test zero reward
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 1, 0n))
        .to.throw('Reward must be greater than 0')

      // Test negative reward
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 1, -100n))
        .to.throw('Reward must be greater than 0')

      console.log('✅ Quiz parameter validation test passed')
    })
  })

  describe('Teacher Helper - Quiz Creation', function () {
    it('should create a quiz with correct properties', async function () {
      console.log('\n🎯 Testing quiz creation via helper...')

      const quizParams = {
        title: 'Math Quiz #1',
        questionText: 'What is 2 + 3?',
        options: ['4', '5', '6', '7'],
        correctAnswer: 1, // '5' is at index 1
        rewardAmount: 1000n,
        teacher
      }

      const result = await teacherHelper.createQuiz(quizParams)
      const quiz = result.quiz
      const paymentTxId = result.paymentTxId

      const quizId = await quiz._id
      const quizTitle = await quiz.title
      const quizReward = await quiz.rewardAmount

      console.log('✓ Quiz created with ID:', quizId)
      console.log('✓ Payment created with ID:', paymentTxId)
      console.log('✓ Quiz title:', quizTitle)
      console.log('✓ Quiz reward amount:', quizReward.toString())

      // Verify quiz properties with await
      expect(quizTitle).to.equal('Math Quiz #1')
      expect(await quiz.questionText).to.equal('What is 2 + 3?')
      expect(await quiz.options).to.deep.equal(['4', '5', '6', '7'])
      expect(await quiz.correctAnswer).to.equal(1)
      expect(quizReward).to.equal(1000n)
      const teacherPubKey = await teacher.publicKey
      expect(await quiz.teacherPublicKey).to.equal(teacherPubKey)
      expect(await quiz.paymentTxId).to.be.a('string')
      expect(await quiz.isActive).to.equal(true)
      expect(await quiz.isClaimed).to.equal(false)
      expect(await quiz.claimedBy).to.equal('')
      expect(await quiz.attemptedStudents).to.deep.equal([])

      // Verify payment was created
      expect(paymentTxId).to.be.a('string')

      // Verify teacher's quiz count increased
      const teacherId = await teacher._id
      const updatedTeacher = await teacherHelper.getTeacher(teacherId)
      const finalQuizCount = await updatedTeacher.getQuizCount()
      expect(finalQuizCount).to.equal(3) // Including the 2 mock quizzes added earlier
      const createdQuizzes = await updatedTeacher.createdQuizzes
      expect(createdQuizzes).to.include(quizId)

      console.log('✅ Quiz creation test passed')
    })

    it('should reject quiz creation with invalid parameters', async function () {
      console.log('\n🚫 Testing quiz creation validation...')

      // Test invalid number of options
      try {
        await teacherHelper.createQuiz({
          title: 'Invalid Quiz',
          questionText: 'What is 1 + 1?',
          options: ['2', '3'], // Only 2 options, should be 4
          correctAnswer: 0,
          rewardAmount: 1000n,
          teacher
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('Quiz must have exactly 4 options')
      }

      // Test invalid correct answer index
      try {
        await teacherHelper.createQuiz({
          title: 'Invalid Quiz',
          questionText: 'What is 1 + 1?',
          options: ['2', '3', '4', '5'],
          correctAnswer: 5, // Invalid index
          rewardAmount: 1000n,
          teacher
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('Correct answer must be between 0-3')
      }

      // Test empty question text
      try {
        await teacherHelper.createQuiz({
          title: 'Invalid Quiz',
          questionText: '', // Empty question
          options: ['2', '3', '4', '5'],
          correctAnswer: 0,
          rewardAmount: 1000n,
          teacher
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('Question text cannot be empty')
      }

      // Test zero reward
      try {
        await teacherHelper.createQuiz({
          title: 'Invalid Quiz',
          questionText: 'What is 1 + 1?',
          options: ['2', '3', '4', '5'],
          correctAnswer: 0,
          rewardAmount: 0n, // Zero reward
          teacher
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('Reward must be greater than 0')
      }

      console.log('✅ Quiz creation validation test passed')
    })

    it('should create multiple quizzes for the same teacher', async function () {
      console.log('\n🔄 Testing multiple quiz creation...')

      // Create second quiz
      const quiz2Params = {
        title: 'Science Quiz #1',
        questionText: 'What is H2O?',
        options: ['Oxygen', 'Water', 'Hydrogen', 'Carbon'],
        correctAnswer: 1,
        rewardAmount: 2000n,
        teacher
      }

      const result2 = await teacherHelper.createQuiz(quiz2Params)
      const quiz2 = result2.quiz

      console.log('✓ Second quiz created with ID:', quiz2._id)

      // Create third quiz
      const quiz3Params = {
        title: 'History Quiz #1',
        questionText: 'Who was the first US President?',
        options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'James Madison'],
        correctAnswer: 1,
        rewardAmount: 1500n,
        teacher
      }

      const result3 = await teacherHelper.createQuiz(quiz3Params)
      const quiz3 = result3.quiz

      const quiz2Id = await quiz2._id
      const quiz3Id = await quiz3._id
      console.log('✓ Third quiz created with ID:', quiz3Id)

      // Verify teacher has all quizzes
      const teacherId = await teacher._id
      const updatedTeacher = await teacherHelper.getTeacher(teacherId)
      const finalQuizCount = await updatedTeacher.getQuizCount()
      expect(finalQuizCount).to.equal(5) // Including mock quiz and quizzes created in this test
      const createdQuizzes = await updatedTeacher.createdQuizzes
      expect(createdQuizzes).to.include.members([quiz2Id, quiz3Id])

      // Verify each quiz has correct properties
      expect(await quiz2.title).to.equal('Science Quiz #1')
      expect(await quiz2.rewardAmount).to.equal(2000n)
      expect(await quiz2.correctAnswer).to.equal(1)

      expect(await quiz3.title).to.equal('History Quiz #1')
      expect(await quiz3.rewardAmount).to.equal(1500n)
      expect(await quiz3.correctAnswer).to.equal(1)

      console.log('✅ Multiple quiz creation test passed')
    })
  })

  describe('Teacher Helper - Quiz Management', function () {
    it('should allow teacher to deactivate their own quiz', async function () {
      console.log('\n⏸️ Testing quiz deactivation...')

      // Create a quiz to deactivate
      const quizParams = {
        title: 'Deactivatable Quiz',
        questionText: 'Can this be deactivated?',
        options: ['Yes', 'No', 'Maybe', 'Later'],
        correctAnswer: 0,
        rewardAmount: 500n,
        teacher
      }

      const result = await teacherHelper.createQuiz(quizParams)
      const quizToDeactivate = result.quiz

      const quizId = await quizToDeactivate._id
      console.log('✓ Quiz created for deactivation test:', quizId)

      // Verify quiz is initially active
      expect(await quizToDeactivate.isActive).to.equal(true)

      // Deactivate the quiz
      await teacherHelper.deactivateQuiz(teacher, quizId)

      // Verify quiz is now inactive
      const deactivatedQuiz = await teacherHelper.getQuiz(quizId)
      expect(await deactivatedQuiz.isActive).to.equal(false)

      console.log('✅ Quiz deactivation test passed')
    })
  })

  describe('Teacher Contract - Edge Cases', function () {
    it('should handle teacher name properly', async function () {
      console.log('\n🎭 Testing teacher name handling...')

      // Verify the existing teacher has the correct name
      const teacherName = await teacher.name
      expect(teacherName).to.equal('Professor Smith')
      expect(await teacher.publicKey).to.be.a('string')

      console.log('✅ Teacher name test passed')
    })
  })

  describe('Integration - Complete Teacher Workflow', function () {
    it('should demonstrate complete teacher workflow', async function () {
      console.log('\n🏆 Testing complete teacher workflow...')

      // Use the existing teacher, not creating a new one
      // Verify teacher can manage multiple quizzes
      const teacherId = await teacher._id
      const currentTeacher = await teacherHelper.getTeacher(teacherId)
      const currentQuizCount = await currentTeacher.getQuizCount()

      console.log(`Current quiz count: ${currentQuizCount}`)

      // Create additional quizzes
      const quiz1Params = {
        title: 'Workflow Quiz 1',
        questionText: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        rewardAmount: 1200n,
        teacher
      }

      const quiz2Params = {
        title: 'Workflow Quiz 2',
        questionText: 'What is 15 divided by 3?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 2,
        rewardAmount: 800n,
        teacher
      }

      const result1 = await teacherHelper.createQuiz(quiz1Params)
      const result2 = await teacherHelper.createQuiz(quiz2Params)

      // Verify teacher has both new quizzes
      const updatedTeacher = await teacherHelper.getTeacher(teacherId)
      const finalQuizCount = await updatedTeacher.getQuizCount()
      expect(finalQuizCount).to.equal(currentQuizCount + 2)
      
      const createdQuizzes = await updatedTeacher.createdQuizzes
      const quiz1Id = await result1.quiz._id
      const quiz2Id = await result2.quiz._id
      expect(createdQuizzes).to.include.members([quiz1Id, quiz2Id])

      // Verify quiz properties
      expect(await result1.quiz.title).to.equal('Workflow Quiz 1')
      expect(await result1.quiz.questionText).to.equal('What is the capital of France?')
      expect(await result1.quiz.options).to.deep.equal(['London', 'Berlin', 'Paris', 'Madrid'])
      expect(await result1.quiz.correctAnswer).to.equal(2)
      expect(await result1.quiz.rewardAmount).to.equal(1200n)

      expect(await result2.quiz.title).to.equal('Workflow Quiz 2')
      expect(await result2.quiz.questionText).to.equal('What is 15 divided by 3?')
      expect(await result2.quiz.options).to.deep.equal(['3', '4', '5', '6'])
      expect(await result2.quiz.correctAnswer).to.equal(2)
      expect(await result2.quiz.rewardAmount).to.equal(800n)

      // Deactivate one quiz
      await teacherHelper.deactivateQuiz(updatedTeacher, quiz1Id)

      // Verify deactivation worked
      const deactivatedQuiz = await teacherHelper.getQuiz(quiz1Id)
      expect(await deactivatedQuiz.isActive).to.equal(false)

      // Verify other quiz is still active
      const activeQuiz = await teacherHelper.getQuiz(quiz2Id)
      expect(await activeQuiz.isActive).to.equal(true)

      console.log('✅ Complete teacher workflow test passed')
    })
  })

  after(async function () {
    console.log('\n🏁 Teacher Contract and Helper Tests Completed Successfully!')
    console.log('\n📋 Summary of Tests Performed:')
    console.log('  ✓ Teacher creation with correct properties')
    console.log('  ✓ Teacher quiz list management')
    console.log('  ✓ Quiz parameter validation')
    console.log('  ✓ Quiz creation via helper')
    console.log('  ✓ Quiz creation validation')
    console.log('  ✓ Multiple quiz creation')
    console.log('  ✓ Quiz deactivation')
    console.log('  ✓ Teacher name handling')
    console.log('  ✓ Complete workflow integration')
  })
})