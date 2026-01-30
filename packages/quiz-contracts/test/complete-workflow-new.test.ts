import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { TeacherHelper } from '../src/helpers/teacher-helper-new.js'
import { StudentHelper } from '../src/helpers/student-helper-new.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { Question } from '../src/quiz.js'
import { Payment } from '../src/payment.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

describe('Complete Quiz Workflow', () => {
  let teacherComputer: Computer
  let studentComputer1: Computer
  let studentComputer2: Computer
  let teacherHelper: TeacherHelper
  let studentHelper1: StudentHelper
  let studentHelper2: StudentHelper
  let paymentHelper: PaymentHelper

  before(async function() {
    this.timeout(60000) // 1 minute setup timeout
    
    const basePath = 'm/0/0'
    
    // Create separate computers for different users using different derivation paths
    teacherComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/0` // Teacher path
    })

    studentComputer1 = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/1` // Student 1 path  
    })

    studentComputer2 = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/2` // Student 2 path
    })
    
    teacherHelper = new TeacherHelper(teacherComputer)
    studentHelper1 = new StudentHelper(studentComputer1)
    studentHelper2 = new StudentHelper(studentComputer2)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallets for regtest
    if (network === 'regtest') {
      await teacherComputer.faucet(1e8)
      await studentComputer1.faucet(1e8)  
      await studentComputer2.faucet(1e8)
    }
  })

  it('Complete workflow: Teacher creates quiz → Students attempt → Rewards transferred', async function() {
    this.timeout(180000) // 3 minute timeout

    console.log('\n🚀 Starting Complete Quiz Workflow Test')

    // =====================================
    // 1. CREATE TEACHER
    // =====================================
    console.log('\n📋 Step 1: Creating Teacher')
    const teacher = await teacherHelper.createTeacher('Prof. Smith', teacherComputer.getPublicKey())
    expect(teacher._id).to.be.a('string')
    expect(teacher.name).to.equal('Prof. Smith')
    console.log(`✅ Teacher created: ${teacher._id}`)

    // =====================================
    // 2. CREATE QUIZ WITH PAYMENTS
    // =====================================
    console.log('\n🎯 Step 2: Creating Quiz with Payment Rewards')
    
    const questions: Question[] = [
      {
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1 // Index of '4'
      },
      {
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2 // Index of 'Paris'
      },
      {
        text: 'What is 10 * 5?',
        options: ['40', '50', '60', '70'],
        correctAnswer: 1 // Index of '50'
      }
    ]

    const rewardPerCorrect = BigInt(10000) // 10,000 satoshis per correct answer
    
    const quizResult = await teacherHelper.createQuiz({
      title: 'Math and Geography Quiz',
      description: 'Test your basic knowledge',
      questions,
      rewardPerCorrect,
      teacher
    })

    expect(quizResult.quiz._id).to.be.a('string')
    expect(quizResult.paymentTxIds).to.have.lengthOf(3)
    console.log(`✅ Quiz created: ${quizResult.quiz._id}`)
    console.log(`💰 Payment rewards created: ${quizResult.paymentTxIds.length}`)

    // =====================================
    // 3. CREATE STUDENTS
    // =====================================
    console.log('\n👨‍🎓 Step 3: Creating Students')
    
    const student1 = await studentHelper1.createStudent('Alice', studentComputer1.getPublicKey())
    const student2 = await studentHelper2.createStudent('Bob', studentComputer2.getPublicKey())

    expect(student1._id).to.be.a('string')
    expect(student2._id).to.be.a('string')
    console.log(`✅ Students created: Alice (${student1._id}), Bob (${student2._id})`)

    // =====================================
    // 4. STUDENT 1 ATTEMPTS QUIZ (ALL CORRECT)
    // =====================================
    console.log('\n📝 Step 4: Alice attempts quiz (all correct answers)')
    
    const aliceAnswers = [1, 2, 1] // All correct (indices)
    
    const aliceResult = await studentHelper1.attemptQuiz({
      quizId: quizResult.quiz._id,
      studentId: student1._id,
      answers: aliceAnswers
    })

    expect(aliceResult.correctCount).to.equal(3)
    expect(aliceResult.transferredPayments).to.have.lengthOf(3)
    console.log(`✅ Alice scored: ${aliceResult.correctCount}/3`)
    console.log(`💰 Alice claimed: ${aliceResult.transferredPayments.length} payments`)

    // =====================================
    // 5. STUDENT 2 ATTEMPTS QUIZ (SOME CORRECT, BUT TOO LATE)
    // =====================================
    console.log('\n📝 Step 5: Bob attempts quiz (correct answers but too late)')
    
    const bobAnswers = [1, 0, 1] // 2 correct (questions 1 & 3), but Alice already claimed them
    
    const bobResult = await studentHelper2.attemptQuiz({
      quizId: quizResult.quiz._id,
      studentId: student2._id,
      answers: bobAnswers
    })

    expect(bobResult.correctCount).to.equal(2)
    expect(bobResult.transferredPayments).to.have.lengthOf(0) // No payments transferred (Alice already claimed)
    console.log(`✅ Bob scored: ${bobResult.correctCount}/3`)
    console.log(`💰 Bob claimed: ${bobResult.transferredPayments.length} payments (already claimed by Alice)`)

    // =====================================
    // 6. VERIFY PAYMENT OWNERSHIP
    // =====================================
    console.log('\n💳 Step 6: Verifying payment ownership')
    
    // Check that Alice owns the payments
    for (const paymentTxId of quizResult.paymentTxIds) {
      const payment = await studentComputer1.sync(paymentTxId) as Payment
      expect(payment._owners).to.include(student1.publicKey) // Alice should own all payments
      console.log(`✅ Payment ${paymentTxId.slice(0, 8)}... owned by Alice`)
    }

    // =====================================
    // 7. PREVENT DUPLICATE ATTEMPTS
    // =====================================
    console.log('\n🚫 Step 7: Testing duplicate attempt prevention')
    
    try {
      await studentHelper1.attemptQuiz({
        quizId: quizResult.quiz._id,
        studentId: student1._id,
        answers: aliceAnswers
      })
      throw new Error('Should not allow duplicate attempts')
    } catch (error) {
      expect((error as Error).message).to.contain('already attempted')
      console.log('✅ Duplicate attempt properly blocked')
    }

    // =====================================
    // WORKFLOW SUMMARY
    // =====================================
    console.log('\n🎉 WORKFLOW COMPLETE - Summary:')
    console.log(`📋 Teacher created quiz with ${questions.length} questions`)
    console.log(`💰 Each question has ${rewardPerCorrect} satoshi reward`)
    console.log(`👨‍🎓 2 students attempted the quiz`)
    console.log(`🥇 Alice (first): ${aliceResult.correctCount}/3 correct → claimed ${aliceResult.transferredPayments.length} payments`)
    console.log(`🥈 Bob (second): ${bobResult.correctCount}/3 correct → claimed ${bobResult.transferredPayments.length} payments`)
    console.log('✅ First-come-first-served mechanism working correctly!')
    
  })

  it('Verify individual components still work', async function() {
    this.timeout(30000)
    
    // Quick verification that our changes didn't break existing functionality
    const teacher = await teacherHelper.createTeacher('Test Teacher', teacherComputer.getPublicKey())
    expect(teacher.name).to.equal('Test Teacher')
    
    const student = await studentHelper1.createStudent('Test Student', studentComputer1.getPublicKey())
    expect(student.name).to.equal('Test Student')

    const payment = await paymentHelper.createPayment(BigInt(5000))
    expect(payment._satoshis).to.equal(BigInt(5000))
    
    console.log('✅ Individual components verified')
  })
})