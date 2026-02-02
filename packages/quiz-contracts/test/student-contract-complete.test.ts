import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Student } from '../src/student.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { Teacher } from '../src/teacher.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { Quiz } from '../src/quiz.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { config } from 'dotenv'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0"

describe('Student Contract and Helper', function () {
  this.timeout(120000) // 2 minute timeout for all tests

  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let student3Computer: Computer
  let student4Computer: Computer
  let teacherHelper: TeacherHelper
  let studentHelper1: StudentHelper
  let studentHelper2: StudentHelper
  let studentHelper3: StudentHelper
  let studentHelper4: StudentHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: Teacher
  let student1: Student
  let student2: Student

  before(async function () {
    console.log('\n🚀 Setting up Student Contract Test Environment')
    console.log(`Chain: ${chain}, Network: ${network}`)
    console.log(`Node URL: ${url}`)

    // Initialize computer for teacher
    teacherComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/0`
    })

    // Initialize computers for students
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

    student3Computer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/3`
    })

    student4Computer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/4`
    })

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    studentHelper1 = new StudentHelper(student1Computer)
    studentHelper2 = new StudentHelper(student2Computer)
    studentHelper3 = new StudentHelper(student3Computer)
    studentHelper4 = new StudentHelper(student4Computer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallets for regtest
    if (network === 'regtest') {
      console.log('💰 Funding wallets on regtest...')
      await teacherComputer.faucet(1e8) // 1 LTC
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
      await student3Computer.faucet(1e8)
      await student4Computer.faucet(1e8)
      console.log('✅ Wallets funded successfully')
    }

    // Deploy payment contract
    await paymentHelper.deploy()
    console.log('✅ Payment contract deployed')

    // Create the single teacher for the app
    teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
    console.log('✅ Teacher created')
  })

  describe('Student Contract - Basic Functionality', function () {
    it('should create a student with correct properties', async function () {
      console.log('\n👨‍🎓 Testing student creation...')

      student1 = await studentHelper1.createStudent('Alice Johnson', student1Computer.getPublicKey())

      const studentId = await student1._id
      const studentName = await student1.name
      const studentPubKey = await student1.publicKey
      const attemptedCount = await student1.getAttemptedQuizCount()
      const totalRewards = await student1.getTotalRewards()

      console.log('✓ Student created with ID:', studentId)
      console.log('✓ Student name:', studentName)
      console.log('✓ Student public key:', studentPubKey.substring(0, 10) + '...')
      console.log('✓ Attempted quizzes count:', attemptedCount)
      console.log('✓ Total rewards:', totalRewards.toString())

      expect(studentName).to.equal('Alice Johnson')
      expect(studentPubKey).to.be.a('string')
      expect(attemptedCount).to.equal(0)
      expect(totalRewards).to.equal(0n)

      console.log('✅ Student creation test passed')
    })

    it('should create multiple students', async function () {
      console.log('\n👥 Testing multiple student creation...')

      student2 = await studentHelper2.createStudent('Bob Smith', student2Computer.getPublicKey())

      const student1Id = await student1._id
      const student2Id = await student2._id
      const student1PubKey = await student1.publicKey
      const student2PubKey = await student2.publicKey

      expect(student1Id).to.not.equal(student2Id)
      expect(student1PubKey).to.not.equal(student2PubKey)

      console.log('✅ Multiple students created successfully')
    })

    it('should track attempted quizzes', async function () {
      console.log('\n📝 Testing quiz attempt tracking...')

      // Add mock quiz IDs to student's attempted list
      const mockQuizId1 = 'mock-quiz-id-001'
      const mockQuizId2 = 'mock-quiz-id-002'

      await student1.addAttemptedQuiz(mockQuizId1)
      
      const attemptedQuizzes1 = await student1.attemptedQuizzes
      const hasAttempted1 = await student1.hasAttemptedQuiz(mockQuizId1)
      const attemptedCount1 = await student1.getAttemptedQuizCount()

      expect(attemptedQuizzes1).to.include(mockQuizId1)
      expect(hasAttempted1).to.equal(true)
      expect(attemptedCount1).to.equal(1)

      // Add another quiz
      await student1.addAttemptedQuiz(mockQuizId2)

      const attemptedQuizzes2 = await student1.attemptedQuizzes
      const attemptedCount2 = await student1.getAttemptedQuizCount()

      expect(attemptedQuizzes2).to.include.members([mockQuizId1, mockQuizId2])
      expect(attemptedCount2).to.equal(2)

      console.log('✅ Quiz attempt tracking test passed')
    })

    it('should track claimed rewards', async function () {
      console.log('\n💰 Testing reward tracking...')

      const reward1 = 1000n
      const reward2 = 1500n

      await student1.addClaimedReward(reward1)
      
      const totalRewards1 = await student1.getTotalRewards()
      expect(totalRewards1).to.equal(reward1)

      await student1.addClaimedReward(reward2)

      const totalRewards2 = await student1.getTotalRewards()
      expect(totalRewards2).to.equal(reward1 + reward2)

      console.log('✅ Reward tracking test passed')
    })
  })

  describe('Student Helper - Quiz Interaction', function () {
    let testQuiz: Quiz

    before(async function () {
      // Create a test quiz for students to attempt
      console.log('\n🎯 Creating test quiz for student interactions...')
      
      const quizParams = {
        title: 'Student Test Quiz',
        questionText: 'What is 5 + 5?',
        options: ['8', '9', '10', '11'],
        correctAnswer: 2, // '10' is at index 2
        rewardAmount: 2000n,
        teacher
      }

      const result = await teacherHelper.createQuiz(quizParams)
      testQuiz = result.quiz

      const quizId = await testQuiz._id
      console.log('✓ Test quiz created:', quizId)
    })

    it('should allow student to attempt a quiz with correct answer', async function () {
      console.log('\n✅ Testing correct answer attempt...')

      const student3 = await studentHelper3.createStudent('Charlie Brown', student3Computer.getPublicKey())
      const student3Id = await student3._id
      const quizId = await testQuiz._id

      const result = await studentHelper3.attemptQuiz({
        quizId: quizId,
        studentId: student3Id,
        selectedAnswer: 2 // Correct answer
      })

      console.log('✓ Is correct:', result.isCorrect)
      console.log('✓ Reward claimed:', result.rewardClaimed.toString())
      console.log('✓ Payment transferred:', result.paymentTransferred)

      expect(result.isCorrect).to.equal(true)
      expect(result.rewardClaimed).to.equal(2000n)
      expect(result.paymentTransferred).to.equal(true)

      // Verify student's total rewards
      const totalRewards = await studentHelper3.getStudentTotalRewards(student3Id)
      expect(totalRewards).to.equal(2000n)

      console.log('✅ Correct answer test passed')
    })

    it('should handle incorrect answer attempt', async function () {
      console.log('\n❌ Testing incorrect answer attempt...')

      // Create another quiz for this test
      const quizParams = {
        title: 'Wrong Answer Test Quiz',
        questionText: 'What is 3 x 3?',
        options: ['6', '7', '8', '9'],
        correctAnswer: 3, // '9' is at index 3
        rewardAmount: 1500n,
        teacher
      }

      const quizResult = await teacherHelper.createQuiz(quizParams)
      const wrongAnswerQuiz = quizResult.quiz

      const student4 = await studentHelper4.createStudent('Diana Prince', student4Computer.getPublicKey())
      const student4Id = await student4._id
      const quizId = await wrongAnswerQuiz._id

      const result = await studentHelper4.attemptQuiz({
        quizId: quizId,
        studentId: student4Id,
        selectedAnswer: 0 // Incorrect answer
      })

      console.log('✓ Is correct:', result.isCorrect)
      console.log('✓ Reward claimed:', result.rewardClaimed.toString())

      expect(result.isCorrect).to.equal(false)
      expect(result.rewardClaimed).to.equal(0n)
      expect(result.paymentTransferred).to.equal(false)

      // Verify student's total rewards is still 0
      const totalRewards = await studentHelper4.getStudentTotalRewards(student4Id)
      expect(totalRewards).to.equal(0n)

      console.log('✅ Incorrect answer test passed')
    })

    it('should prevent duplicate quiz attempts', async function () {
      console.log('\n🚫 Testing duplicate attempt prevention...')

      // Create a new quiz
      const quizParams = {
        title: 'Duplicate Test Quiz',
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        rewardAmount: 1000n,
        teacher
      }

      const quizResult = await teacherHelper.createQuiz(quizParams)
      const duplicateQuiz = quizResult.quiz

      const student5 = await studentHelper1.createStudent('Eve Adams', student1Computer.getPublicKey())
      const student5Id = await student5._id
      const quizId = await duplicateQuiz._id

      // First attempt
      await studentHelper1.attemptQuiz({
        quizId: quizId,
        studentId: student5Id,
        selectedAnswer: 1
      })

      // Second attempt should fail
      try {
        await studentHelper1.attemptQuiz({
          quizId: quizId,
          studentId: student5Id,
          selectedAnswer: 1
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('already attempted')
      }

      console.log('✅ Duplicate attempt prevention test passed')
    })

    it('should handle first-come-first-served reward claiming', async function () {
      console.log('\n🏃 Testing first-come-first-served logic...')

      // Create a new quiz
      const quizParams = {
        title: 'Race Quiz',
        questionText: 'What is 10 - 3?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2, // '7' is at index 2
        rewardAmount: 3000n,
        teacher
      }

      const quizResult = await teacherHelper.createQuiz(quizParams)
      const raceQuiz = quizResult.quiz

      const student6 = await studentHelper1.createStudent('Frank Miller', student1Computer.getPublicKey())
      const student7 = await studentHelper2.createStudent('Grace Lee', student2Computer.getPublicKey())
      
      const student6Id = await student6._id
      const student7Id = await student7._id
      const quizId = await raceQuiz._id

      // First student attempts and gets the reward
      const result1 = await studentHelper1.attemptQuiz({
        quizId: quizId,
        studentId: student6Id,
        selectedAnswer: 2
      })

      expect(result1.isCorrect).to.equal(true)
      expect(result1.rewardClaimed).to.equal(3000n)

      // Second student attempts but reward is already claimed
      const result2 = await studentHelper2.attemptQuiz({
        quizId: quizId,
        studentId: student7Id,
        selectedAnswer: 2
      })

      expect(result2.isCorrect).to.equal(true)
      expect(result2.rewardClaimed).to.equal(0n) // No reward, already claimed

      console.log('✅ First-come-first-served test passed')
    })
  })

  describe('Student Contract - Edge Cases', function () {
    it('should handle student with empty name', async function () {
      console.log('\n📛 Testing empty name handling...')

      const emptyNameStudent = await studentHelper1.createStudent('', student1Computer.getPublicKey())

      expect(await emptyNameStudent.name).to.equal('')
      expect(await emptyNameStudent.publicKey).to.be.a('string')

      console.log('✅ Empty name test passed')
    })

    it('should validate answer range', async function () {
      console.log('\n🔢 Testing answer validation...')

      // Create a test quiz
      const quizParams = {
        title: 'Validation Quiz',
        questionText: 'What is 1 + 1?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        rewardAmount: 500n,
        teacher
      }

      const quizResult = await teacherHelper.createQuiz(quizParams)
      const validationQuiz = quizResult.quiz

      const student8 = await studentHelper1.createStudent('Henry Ford', student1Computer.getPublicKey())
      const student8Id = await student8._id
      const quizId = await validationQuiz._id

      // Try invalid answer (negative)
      try {
        await studentHelper1.attemptQuiz({
          quizId: quizId,
          studentId: student8Id,
          selectedAnswer: -1
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('must be between 0-3')
      }

      // Try invalid answer (too high)
      try {
        await studentHelper1.attemptQuiz({
          quizId: quizId,
          studentId: student8Id,
          selectedAnswer: 5
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect((error as Error).message).to.include('must be between 0-3')
      }

      console.log('✅ Answer validation test passed')
    })
  })

  after(async function () {
    console.log('\n🏁 Student Contract and Helper Tests Completed Successfully!')
    console.log('\n📋 Summary of Tests Performed:')
    console.log('  ✓ Student creation with correct properties')
    console.log('  ✓ Multiple student creation')
    console.log('  ✓ Quiz attempt tracking')
    console.log('  ✓ Reward tracking')
    console.log('  ✓ Correct answer attempts')
    console.log('  ✓ Incorrect answer handling')
    console.log('  ✓ Duplicate attempt prevention')
    console.log('  ✓ First-come-first-served rewards')
    console.log('  ✓ Edge cases (empty name, answer validation)')
  })
})
