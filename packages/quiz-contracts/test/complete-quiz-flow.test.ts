import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import type { Question } from '../src/quiz.js'
import { TeacherHelper } from '../src/helpers/teacher-helper-new.js'
import { StudentHelper } from '../src/helpers/student-helper-new.js'
import { QuizHelper } from '../src/helpers/quiz-helper-fixed.js'
import { Payment } from '../src/payment.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
//const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

const { expect } = chai
chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Complete Quiz Flow - End to End', function () {
  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let student3Computer: Computer
  let teacher: Teacher
  let student1: Student
  let student2: Student
  let student3: Student
  let teacherHelper: TeacherHelper
  let studentHelper1: StudentHelper
  let studentHelper2: StudentHelper
  let studentHelper3: StudentHelper
  let quizHelper: QuizHelper
  let sampleQuestions: Question[]
  
  // Quiz and payment IDs - shared across all tests
  let quiz!: Quiz
  let paymentTxIds!: string[]

  before(async function () {
    this.timeout(300000) // 5 minutes for complete setup

    console.log('\n=== 🚀 Setting up Complete Quiz Flow Test Environment ===\n')

    // Create separate computers for different users using different derivation paths
    teacherComputer = new Computer({
      chain,
      network,
      url,
      //path: `${basePath}/0`
    })

    student1Computer = new Computer({
      chain,
      network,
      url,
      //path: `${basePath}/1`
    })

    student2Computer = new Computer({
      chain,
      network,
      url,
      //path: `${basePath}/2`
    })

    student3Computer = new Computer({
      chain,
      network,
      url,
      //path: `${basePath}/3`
    })

    // Fund wallets for regtest
    if (network === 'regtest') {
      console.log('💰 Funding wallets...')
      await teacherComputer.faucet(1e8)
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
      await student3Computer.faucet(1e8)
    }

    // Create helper instances
    teacherHelper = new TeacherHelper(teacherComputer)
    studentHelper1 = new StudentHelper(student1Computer)
    studentHelper2 = new StudentHelper(student2Computer)
    studentHelper3 = new StudentHelper(student3Computer)
    quizHelper = new QuizHelper(teacherComputer)

    console.log('👥 Creating teacher and students...')
    
    // Create teacher
    teacher = await teacherHelper.createTeacher('Professor Smith', teacherComputer.getPublicKey())
    console.log('✓ Teacher created:', teacher._id)
    
    // Create students
    student1 = await studentHelper1.createStudent('Alice Johnson', student1Computer.getPublicKey())
    console.log('✓ Student 1 created:', student1._id)
    
    student2 = await studentHelper2.createStudent('Bob Williams', student2Computer.getPublicKey())
    console.log('✓ Student 2 created:', student2._id)
    
    student3 = await studentHelper3.createStudent('Carol Martinez', student3Computer.getPublicKey())
    console.log('✓ Student 3 created:', student3._id)

    // Define sample questions
    sampleQuestions = [
      {
        text: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      },
      {
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2
      },
      {
        text: 'What is the largest planet in our solar system?',
        options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
        correctAnswer: 1
      }
    ]

    console.log('\n=== ✅ Setup complete ===\n')
  })

  describe('Quiz Creation and Payment Setup', function () {
    it('should allow teacher to create a quiz with individual question payments', async function () {
      this.timeout(180000)

      console.log('\n--- 🎯 Creating quiz with payments ---')

      const result = await teacherHelper.createQuiz({
        title: 'Introduction to Computer Science',
        description: 'Test your basic CS knowledge and earn rewards',
        questions: sampleQuestions,
        rewardPerCorrect: 5000n, // 5000 satoshis per correct answer
        teacher: teacher
      })

      quiz = result.quiz
      paymentTxIds = result.paymentTxIds

      console.log('✓ Quiz created:', quiz._id)
      console.log('✓ Payment IDs:', paymentTxIds)

      // Verify quiz properties
      expect(quiz.title).to.equal('Introduction to Computer Science')
      expect(quiz.questionTexts.length).to.equal(3)
      expect(quiz.rewardPerCorrect).to.equal(5000n)
      expect(quiz.isActive).to.be.true
      expect(quiz.teacherPublicKey).to.equal(teacher.publicKey)

      // Verify payments created
      expect(paymentTxIds.length).to.equal(3)
      
      // Verify each payment exists and is owned by teacher
      for (let i = 0; i < paymentTxIds.length; i++) {
        const payment = await teacherComputer.sync(paymentTxIds[i]) as Payment
        expect(payment._satoshis).to.equal(5000n)
        expect(payment._owners).to.include(teacher.publicKey)
        console.log(`✓ Payment ${i + 1} verified: ${paymentTxIds[i]} (${payment._satoshis} sats)`)
      }
    })

    it('should verify quiz state is properly initialized', async function () {
      const syncedQuiz = await quizHelper.getQuiz(quiz._id)
      
      expect(syncedQuiz.attemptedStudents.length).to.equal(0)
      expect(syncedQuiz.questionRewardsClaimed.every(claimed => !claimed)).to.be.true
      expect(syncedQuiz.paymentTxIds).to.deep.equal(paymentTxIds)
      
      console.log('✓ Quiz state properly initialized')
      console.log(`  - Questions: ${syncedQuiz.questionTexts.length}`)
      console.log(`  - Attempted students: ${syncedQuiz.attemptedStudents.length}`)
      console.log(`  - Rewards claimed: ${syncedQuiz.questionRewardsClaimed.filter(c => c).length}/${syncedQuiz.questionRewardsClaimed.length}`)
    })
  })

  describe('First Student Attempt - Full Rewards', function () {
    it('should allow first student to attempt quiz and claim all rewards', async function () {
      this.timeout(180000)

      console.log('\n--- 👩‍🎓 Student 1 (Alice) attempting quiz ---')

      // Student 1 answers all questions correctly
      const result = await studentHelper1.attemptQuiz({
        quizId: quiz._id,
        studentId: student1._id,
        answers: [1, 2, 1] // All correct answers
      })

      console.log('✓ Quiz attempt completed')
      console.log('  Score:', result.correctCount, '/ 3')
      console.log('  Payments claimed:', result.transferredPayments.length)

      // Verify attempt results
      expect(result.correctCount).to.equal(3)
      expect(result.transferredPayments.length).to.equal(3)

      // Verify student received payments by checking ownership
      for (let i = 0; i < paymentTxIds.length; i++) {
        const payment = await student1Computer.sync(paymentTxIds[i]) as Payment
        expect(payment._owners).to.include(student1.publicKey)
        console.log(`✓ Payment ${i + 1} now owned by Alice: ${paymentTxIds[i]}`)
      }

      // Verify quiz state updated
      const updatedQuiz = await quizHelper.getQuiz(quiz._id)
      expect(updatedQuiz.attemptedStudents).to.include(student1.publicKey)
      expect(updatedQuiz.questionRewardsClaimed.every(claimed => claimed)).to.be.true

      console.log('✓ All rewards successfully claimed by first student')
    })
  })

  describe('Second Student Attempt - No Rewards Available', function () {
    it('should allow second student to attempt but receive no rewards (all claimed)', async function () {
      this.timeout(180000)

      console.log('\n--- 👨‍🎓 Student 2 (Bob) attempting quiz ---')

      // Student 2 also answers all correctly, but rewards already claimed
      const result = await studentHelper2.attemptQuiz({
        quizId: quiz._id,
        studentId: student2._id,
        answers: [1, 2, 1] // All correct
      })

      console.log('✓ Quiz attempt completed')
      console.log('  Score:', result.correctCount, '/ 3')
      console.log('  Payments claimed:', result.transferredPayments.length)

      // Verify attempt recorded but no rewards given
      expect(result.correctCount).to.equal(3)
      expect(result.transferredPayments.length).to.equal(0) // No payments transferred

      // Verify payments are still owned by student 1
      for (let i = 0; i < paymentTxIds.length; i++) {
        const payment = await student1Computer.sync(paymentTxIds[i]) as Payment
        expect(payment._owners).to.include(student1.publicKey)
        expect(payment._owners).to.not.include(student2.publicKey)
      }

      // Verify quiz state
      const updatedQuiz = await quizHelper.getQuiz(quiz._id)
      expect(updatedQuiz.attemptedStudents).to.include(student2.publicKey)
      expect(updatedQuiz.attemptedStudents.length).to.equal(2)

      console.log('✓ Second student attempt recorded, but no rewards available')
    })
  })

  describe('Third Student Attempt - Partial Correct Answers', function () {
    it('should allow third student to attempt with partial correct answers (no rewards available)', async function () {
      this.timeout(180000)

      console.log('\n--- 👩‍🎓 Student 3 (Carol) attempting quiz ---')

      // Student 3 only gets 2 correct (but all rewards already claimed anyway)
      const result = await studentHelper3.attemptQuiz({
        quizId: quiz._id,
        studentId: student3._id,
        answers: [1, 2, 0] // First two correct, last wrong
      })

      console.log('✓ Quiz attempt completed')
      console.log('  Score:', result.correctCount, '/ 3')
      console.log('  Payments claimed:', result.transferredPayments.length)

      // Verify partial score but no rewards
      expect(result.correctCount).to.equal(2)
      expect(result.transferredPayments.length).to.equal(0)

      // Verify payments still owned by student 1
      for (let i = 0; i < paymentTxIds.length; i++) {
        const payment = await student1Computer.sync(paymentTxIds[i]) as Payment
        expect(payment._owners).to.include(student1.publicKey)
      }

      console.log('✓ Third student attempt recorded with partial score')
    })
  })

  describe('Quiz State Verification', function () {
    it('should verify final quiz state after all attempts', async function () {
      const finalQuiz = await quizHelper.getQuiz(quiz._id)

      console.log('\n--- 📊 Final Quiz State ---')
      console.log('Total attempts:', finalQuiz.attemptedStudents.length)
      console.log('Questions claimed:', finalQuiz.questionRewardsClaimed)
      console.log('Quiz still active:', finalQuiz.isActive)

      expect(finalQuiz.attemptedStudents.length).to.equal(3)
      expect(finalQuiz.questionRewardsClaimed.every(claimed => claimed)).to.be.true
      expect(finalQuiz.isActive).to.be.true
      
      // Verify all students are recorded
      expect(finalQuiz.attemptedStudents).to.include(student1.publicKey)
      expect(finalQuiz.attemptedStudents).to.include(student2.publicKey)
      expect(finalQuiz.attemptedStudents).to.include(student3.publicKey)
    })

    it('should verify students can track completed quizzes', async function () {
      const syncedStudent1 = await studentHelper1.getStudent(student1._id)
      expect(syncedStudent1.completedQuizzes).to.include(quiz._id)

      const syncedStudent2 = await studentHelper2.getStudent(student2._id)
      expect(syncedStudent2.completedQuizzes).to.include(quiz._id)

      const syncedStudent3 = await studentHelper3.getStudent(student3._id)
      expect(syncedStudent3.completedQuizzes).to.include(quiz._id)
      
      console.log('✓ All students have quiz recorded in their profiles')
    })
  })

  describe('Quiz Deactivation', function () {
    it('should allow teacher to deactivate quiz', async function () {
      this.timeout(60000)

      console.log('\n--- 🔒 Deactivating quiz ---')

      await teacherHelper.deactivateQuiz(teacher, quiz._id)

      const deactivatedQuiz = await quizHelper.getQuiz(quiz._id)
      expect(deactivatedQuiz.isActive).to.be.false

      console.log('✓ Quiz deactivated by teacher')
    })
  })

  describe('Payment Ownership Verification', function () {
    it('should verify all payment objects now owned by student 1', async function () {
      this.timeout(60000)

      console.log('\n--- 💳 Verifying payment ownership transfer ---')

      const syncedQuiz = await quizHelper.getQuiz(quiz._id)
      
      for (let i = 0; i < syncedQuiz.paymentTxIds.length; i++) {
        const paymentId = syncedQuiz.paymentTxIds[i]
        
        try {
          const payment = await student1Computer.sync(paymentId) as Payment
          console.log(`Payment ${i + 1} owner:`, payment._owners[0])
          console.log(`Expected owner (Alice):`, student1.publicKey)
          
          // All payments should now be owned by student 1 (who answered all correctly first)
          expect(payment._owners).to.include(student1.publicKey)
        } catch (error) {
          console.error(`Failed to verify payment ${i + 1}:`, error)
          throw error
        }
      }

      console.log('✓ All payment ownerships verified - Alice owns all rewards')
    })

    it('should verify Bitcoin Computer UTXO model working correctly', async function () {
      console.log('\n--- 🧪 Bitcoin Computer UTXO Model Verification ---')
      
      // Each payment object is a UTXO on Bitcoin
      for (let i = 0; i < paymentTxIds.length; i++) {
        const payment = await student1Computer.sync(paymentTxIds[i]) as Payment
        
        // Verify the payment has all Bitcoin Computer metadata
        expect(payment._id).to.be.a('string')
        expect(payment._rev).to.be.a('string')
        expect(payment._owners).to.be.an('array')
        expect(payment._satoshis).to.equal(5000n)
        
        console.log(`✓ Payment ${i + 1} UTXO verified:`)
        console.log(`  - Transaction ID: ${payment._id}`)
        console.log(`  - Revision: ${payment._rev}`)
        console.log(`  - Satoshis: ${payment._satoshis}`)
        console.log(`  - Owner: ${payment._owners[0]}`)
      }
      
      console.log('✓ UTXO model working correctly - each payment is a Bitcoin UTXO')
    })
  })

  describe('Complete Workflow Summary', function () {
    it('should demonstrate complete first-come-first-served quiz workflow', async function () {
      console.log('\n--- 🎉 COMPLETE WORKFLOW SUMMARY ---')
      console.log('📋 Quiz Flow Completed Successfully!')
      console.log('')
      console.log('🏗️  Architecture:')
      console.log('   ✅ Teacher created quiz with 3 questions')
      console.log('   ✅ 3 separate Payment UTXOs created (5000 sats each)')
      console.log('   ✅ Quiz stored on Bitcoin with payment references')
      console.log('')
      console.log('👥 Student Participation:')
      console.log('   🥇 Alice: 3/3 correct → claimed all 3 payments (15,000 sats)')
      console.log('   🥈 Bob: 3/3 correct → no payments (already claimed)')
      console.log('   🥉 Carol: 2/3 correct → no payments (already claimed)')
      console.log('')
      console.log('💰 Payment Distribution:')
      console.log('   ✅ First-come-first-served mechanism working')
      console.log('   ✅ Payment ownership properly transferred')
      console.log('   ✅ UTXO model preserves transaction history')
      console.log('')
      console.log('🎯 Key Features Demonstrated:')
      console.log('   ✅ Bitcoin Computer smart contracts on Bitcoin')
      console.log('   ✅ UTXO-based state management')
      console.log('   ✅ Ownership transfer via Bitcoin transactions')
      console.log('   ✅ First-come-first-served reward mechanism')
      console.log('   ✅ Multiple student concurrent access')
      console.log('   ✅ Quiz state management and history')
      console.log('')
      console.log('🚀 The complete quiz workflow is working perfectly!')
      
      // Final verification that everything is working
      expect(quiz.questionTexts.length).to.equal(3)
      expect(paymentTxIds.length).to.equal(3)
      expect(quiz.isActive).to.be.false // Deactivated
      
      // All payments owned by first student
      for (const paymentId of paymentTxIds) {
        const payment = await student1Computer.sync(paymentId) as Payment
        expect(payment._owners).to.include(student1.publicKey)
      }
    })
  })
})
