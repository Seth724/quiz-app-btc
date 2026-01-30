import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { TeacherHelper } from '../src/helpers/teacher-helper-new.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { Question } from '../src/quiz.js'
import { Payment } from '../src/payment.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'

describe('Simple Helper Demo', function () {
  let computer: Computer
  let teacherHelper: TeacherHelper
  let paymentHelper: PaymentHelper

  before(async function() {
    this.timeout(60000) // 1 minute timeout
    
    // Create single computer instance
    computer = new Computer({ chain, network, url })
    
    teacherHelper = new TeacherHelper(computer)
    paymentHelper = new PaymentHelper(computer)

    // Fund wallet for regtest
    if (network === 'regtest') {
      await computer.faucet(1e8)
    }
  })

  it('should create teacher and quiz with payments', async function() {
    this.timeout(120000) // 2 minute timeout

    console.log('\n🧪 Demo: Creating teacher and quiz with payment rewards')

    // Create teacher
    const teacher = await teacherHelper.createTeacher('Prof. Demo', computer.getPublicKey())
    expect(teacher._id).to.be.a('string')
    expect(teacher.name).to.equal('Prof. Demo')
    console.log(`✅ Teacher created: ${teacher.name} (${teacher._id})`)

    // Create quiz with payments  
    const questions: Question[] = [
      {
        text: 'What is 1 + 1?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1 // Index of '2'
      },
      {
        text: 'What color is the sky?',
        options: ['Red', 'Blue', 'Green', 'Yellow'],
        correctAnswer: 1 // Index of 'Blue'
      }
    ]

    const rewardPerCorrect = BigInt(5000) // 5,000 satoshis per correct answer
    
    const quizResult = await teacherHelper.createQuiz({
      title: 'Simple Demo Quiz',
      description: 'A basic quiz for testing',
      questions,
      rewardPerCorrect,
      teacher
    })

    expect(quizResult.quiz._id).to.be.a('string')
    expect(quizResult.paymentTxIds).to.have.lengthOf(2)
    console.log(`✅ Quiz created: ${quizResult.quiz.title}`)
    console.log(`💰 Payments created: ${quizResult.paymentTxIds.length}`)

    // Verify payments exist and have correct amount
    for (let i = 0; i < quizResult.paymentTxIds.length; i++) {
      const payment = await computer.sync(quizResult.paymentTxIds[i]) as Payment
      expect(payment._satoshis).to.equal(rewardPerCorrect)
      console.log(`✅ Payment ${i + 1}: ${payment._satoshis} satoshis`)
    }

    console.log('\n🎉 Demo completed successfully!')
    console.log('📋 Summary:')
    console.log(`   - Teacher: ${teacher.name}`)
    console.log(`   - Quiz: ${quizResult.quiz.title} with ${questions.length} questions`)
    console.log(`   - Total reward pool: ${BigInt(questions.length) * rewardPerCorrect} satoshis`)
    console.log('   - Quiz workflow helpers are working correctly!')
  })

  it('should verify payment helper works independently', async function() {
    this.timeout(30000)
    
    // Test basic payment functionality
    const payment = await paymentHelper.createPayment(BigInt(1000))
    expect(payment._satoshis).to.equal(BigInt(1000))
    
    console.log('✅ Payment helper verified')
  })
})