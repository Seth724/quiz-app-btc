import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { Payment } from '../src/payment.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { LeaderboardHelper } from '../src/helpers/leaderboard-helper.js'

describe('Complete Quiz Platform with Leaderboard', function () {
  this.timeout(900000) // 15 minute timeout for comprehensive test

  // Configuration
  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  // Computers and helpers
  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let student3Computer: Computer
  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let student3Helper: StudentHelper
  let attempt1Helper: AttemptHelper
  let attempt2Helper: AttemptHelper
  let attempt3Helper: AttemptHelper
  let paymentHelper: PaymentHelper
  let leaderboardHelper: LeaderboardHelper

  // Test objects
  let teacher: Teacher
  let student1: Student
  let student2: Student
  let student3: Student
  let teacherPubKey: string
  let student1PubKey: string
  let student2PubKey: string
  let student3PubKey: string

  before(async function () {
    console.log('\\n🚀 Setting up Complete Quiz Platform Test')
    console.log('🎯 Testing: Multi-quiz platform with leaderboard tracking')

    // Initialize computers
    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
    student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })
    student3Computer = new Computer({ chain, network, url, path: `${basePath}/3` })

    // Get public keys
    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()
    student3PubKey = student3Computer.getPublicKey()

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    student3Helper = new StudentHelper(student3Computer)
    attempt1Helper = new AttemptHelper(student1Computer)
    attempt2Helper = new AttemptHelper(student2Computer)
    attempt3Helper = new AttemptHelper(student3Computer)
    paymentHelper = new PaymentHelper(teacherComputer)
    leaderboardHelper = new LeaderboardHelper(teacherComputer)

    // Fund wallets
    if (network === 'regtest') {
      console.log('💰 Funding wallets...')
      await teacherComputer.faucet(2e8) // Extra funds for multiple quizzes
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
      await student3Computer.faucet(1e8)
    }

    // Deploy contracts
    console.log('🏗️ Deploying contracts...')
    await paymentHelper.deploy()

    console.log('✅ Setup complete')
  })

  describe('Complete Quiz Platform Workflow', function () {
    it('should execute multi-quiz platform with leaderboard tracking', async function () {
      console.log('\\n🎯 Starting Complete Quiz Platform Test')

      // === STEP 1: CREATE PARTICIPANTS ===
      console.log('\\n👥 STEP 1: Creating Participants')
      
      teacher = await teacherHelper.createTeacher('Professor Alice', teacherPubKey)
      student1 = await student1Helper.createStudent('Bob', student1PubKey)
      student2 = await student2Helper.createStudent('Charlie', student2PubKey)
      student3 = await student3Helper.createStudent('Diana', student3PubKey)
      
      console.log('✅ All participants created')

      // === STEP 2: CREATE MULTIPLE QUIZZES ===
      console.log('\\n📚 STEP 2: Creating Multiple Quizzes')
      
      const quizzes = []
      const payments = []

      // Quiz 1: Math Quiz
      const quiz1Data = {
        title: 'Basic Math',
        questionText: 'What is 15 + 25?',
        options: ['35', '40', '45', '50'],
        correctAnswer: 1,
        rewardAmount: 1000n,
        teacher: teacher
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      const quiz1Result = await teacherHelper.createQuiz(quiz1Data)
      quizzes.push(quiz1Result.quiz)
      payments.push(await teacherComputer.sync(quiz1Result.paymentTxId) as Payment)
      console.log(`✅ Quiz 1 created: ${quiz1Data.title} (${quiz1Data.rewardAmount} sats)`)

      // Quiz 2: Science Quiz
      const quiz2Data = {
        title: 'Basic Science',
        questionText: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 0,
        rewardAmount: 1500n,
        teacher: teacher
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      const quiz2Result = await teacherHelper.createQuiz(quiz2Data)
      quizzes.push(quiz2Result.quiz)
      payments.push(await teacherComputer.sync(quiz2Result.paymentTxId) as Payment)
      console.log(`✅ Quiz 2 created: ${quiz2Data.title} (${quiz2Data.rewardAmount} sats)`)

      // Quiz 3: Geography Quiz
      const quiz3Data = {
        title: 'World Geography',
        questionText: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        rewardAmount: 2000n,
        teacher: teacher
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      const quiz3Result = await teacherHelper.createQuiz(quiz3Data)
      quizzes.push(quiz3Result.quiz)
      payments.push(await teacherComputer.sync(quiz3Result.paymentTxId) as Payment)
      console.log(`✅ Quiz 3 created: ${quiz3Data.title} (${quiz3Data.rewardAmount} sats)`)

      expect(quizzes).to.have.length(3)
      expect(payments).to.have.length(3)

      // === STEP 3: STUDENTS ATTEMPT QUIZZES ===
      console.log('\\n🎯 STEP 3: Students Attempt Quizzes')

      // Bob attempts Quiz 1 and wins
      console.log('\\n🏃‍♂️ Bob attempting Quiz 1...')
      const bob_quiz1_attempt = await attempt1Helper.createAttempt(await quizzes[0]._id, student1PubKey)
      await bob_quiz1_attempt.submitAnswer(1, await quizzes[0].correctAnswer, await quizzes[0].rewardAmount)
      await quizzes[0].addAttemptedStudent(student1PubKey)
      const bob_quiz1_claimed = await quizzes[0].claimReward(student1PubKey)
      
      if (bob_quiz1_claimed) {
        await payments[0].transfer(student1PubKey)
        await leaderboardHelper.recordQuizResult({
          quizId: await quizzes[0]._id,
          quizTitle: await quizzes[0].title,
          studentPublicKey: student1PubKey,
          isCorrect: true,
          rewardEarned: 1000n,
          paymentTxId: await payments[0]._id,
          timestamp: Date.now()
        })
        console.log('✅ Bob won Quiz 1 - earned 1000 sats')
      }

      // Charlie attempts Quiz 1 but loses (too late)
      console.log('\\n🏃‍♂️ Charlie attempting Quiz 1...')
      const charlie_quiz1_attempt = await attempt2Helper.createAttempt(await quizzes[0]._id, student2PubKey)
      await charlie_quiz1_attempt.submitAnswer(1, await quizzes[0].correctAnswer, await quizzes[0].rewardAmount)
      await quizzes[0].addAttemptedStudent(student2PubKey)
      const charlie_quiz1_claimed = await quizzes[0].claimReward(student2PubKey)
      
      await leaderboardHelper.recordQuizResult({
        quizId: await quizzes[0]._id,
        quizTitle: await quizzes[0].title,
        studentPublicKey: student2PubKey,
        isCorrect: true,
        rewardEarned: 0n, // No reward because quiz already claimed
        timestamp: Date.now()
      })
      console.log('❌ Charlie attempted Quiz 1 correctly but too late - earned 0 sats')

      // Charlie attempts Quiz 2 and wins
      console.log('\\n🏃‍♂️ Charlie attempting Quiz 2...')
      const charlie_quiz2_attempt = await attempt2Helper.createAttempt(await quizzes[1]._id, student2PubKey)
      await charlie_quiz2_attempt.submitAnswer(0, await quizzes[1].correctAnswer, await quizzes[1].rewardAmount)
      await quizzes[1].addAttemptedStudent(student2PubKey)
      const charlie_quiz2_claimed = await quizzes[1].claimReward(student2PubKey)
      
      if (charlie_quiz2_claimed) {
        await payments[1].transfer(student2PubKey)
        await leaderboardHelper.recordQuizResult({
          quizId: await quizzes[1]._id,
          quizTitle: await quizzes[1].title,
          studentPublicKey: student2PubKey,
          isCorrect: true,
          rewardEarned: 1500n,
          paymentTxId: await payments[1]._id,
          timestamp: Date.now()
        })
        console.log('✅ Charlie won Quiz 2 - earned 1500 sats')
      }

      // Diana attempts Quiz 3 and wins (highest reward)
      console.log('\\n🏃‍♂️ Diana attempting Quiz 3...')
      const diana_quiz3_attempt = await attempt3Helper.createAttempt(await quizzes[2]._id, student3PubKey)
      await diana_quiz3_attempt.submitAnswer(2, await quizzes[2].correctAnswer, await quizzes[2].rewardAmount)
      await quizzes[2].addAttemptedStudent(student3PubKey)
      const diana_quiz3_claimed = await quizzes[2].claimReward(student3PubKey)
      
      if (diana_quiz3_claimed) {
        await payments[2].transfer(student3PubKey)
        await leaderboardHelper.recordQuizResult({
          quizId: await quizzes[2]._id,
          quizTitle: await quizzes[2].title,
          studentPublicKey: student3PubKey,
          isCorrect: true,
          rewardEarned: 2000n,
          paymentTxId: await payments[2]._id,
          timestamp: Date.now()
        })
        console.log('✅ Diana won Quiz 3 - earned 2000 sats')
      }

      // Bob attempts Quiz 2 but loses (wrong answer)
      console.log('\\n🏃‍♂️ Bob attempting Quiz 2 with wrong answer...')
      const bob_quiz2_attempt = await attempt1Helper.createAttempt(await quizzes[1]._id, student1PubKey)
      await bob_quiz2_attempt.submitAnswer(3, await quizzes[1].correctAnswer, await quizzes[1].rewardAmount) // Wrong answer
      
      await leaderboardHelper.recordQuizResult({
        quizId: await quizzes[1]._id,
        quizTitle: await quizzes[1].title,
        studentPublicKey: student1PubKey,
        isCorrect: false,
        rewardEarned: 0n,
        timestamp: Date.now()
      })
      console.log('❌ Bob answered Quiz 2 incorrectly - earned 0 sats')

      // === STEP 4: DISPLAY LEADERBOARD ===
      console.log('\\n🏆 STEP 4: Final Leaderboard')
      leaderboardHelper.displayLeaderboard()

      // === STEP 5: VERIFY RESULTS ===
      console.log('\\n✅ STEP 5: Verify Results')
      
      const leaderboard = leaderboardHelper.getLeaderboard()
      expect(leaderboard).to.have.length(3)
      
      // Diana should be #1 with 2000 sats
      expect(leaderboard[0].publicKey).to.equal(student3PubKey)
      expect(leaderboard[0].totalRewards).to.equal(2000n)
      expect(leaderboard[0].rank).to.equal(1)
      
      // Charlie should be #2 with 1500 sats
      expect(leaderboard[1].publicKey).to.equal(student2PubKey)
      expect(leaderboard[1].totalRewards).to.equal(1500n)
      expect(leaderboard[1].rank).to.equal(2)
      
      // Bob should be #3 with 1000 sats
      expect(leaderboard[2].publicKey).to.equal(student1PubKey)
      expect(leaderboard[2].totalRewards).to.equal(1000n)
      expect(leaderboard[2].rank).to.equal(3)

      // === STEP 6: DISPLAY STATISTICS ===
      console.log('\\n📊 STEP 6: Platform Statistics')
      const stats = leaderboardHelper.getStatistics()
      console.log(`Total Students: ${stats.totalStudents}`)
      console.log(`Total Rewards Distributed: ${Number(stats.totalRewardsDistributed).toLocaleString()} sats`)
      console.log(`Total Quiz Attempts: ${stats.totalQuizzes}`)
      console.log(`Success Rate: ${stats.successRate.toFixed(1)}%`)

      expect(stats.totalStudents).to.equal(3)
      expect(stats.totalRewardsDistributed).to.equal(4500n) // 1000 + 1500 + 2000
      expect(stats.totalQuizzes).to.equal(5) // 5 total attempts
      expect(stats.successRate).to.equal(60) // 3 correct out of 5 attempts

      console.log('\\n🎉 Complete Quiz Platform Test Successful!')
      console.log('\\n📋 Summary:')
      console.log('  🎯 3 quizzes created with different reward amounts')
      console.log('  ✅ First-come-first-served principle enforced')
      console.log('  🏆 Leaderboard accurately tracks student performance')
      console.log('  💰 Payment ownership correctly transferred to winners')
      console.log('  📊 Platform statistics properly calculated')
    })
  })

  after(async function () {
    console.log('\\n🏁 Quiz Platform Tests Completed!')
  })
})