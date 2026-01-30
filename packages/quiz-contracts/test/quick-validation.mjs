#!/usr/bin/env node
/**
 * Quick validation script to test the main functionality
 */

import { Computer } from '@bitcoin-computer/lib'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { QuizHelper } from '../src/helpers/quiz-helper.js'
import { MineRPCBlocks } from '../src/utils/mineblock.js'
import { config } from 'dotenv'

// Load environment
config()

const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'

async function quickTest() {
  console.log('🚀 Quick Quiz Workflow Test\n')

  // Setup computers
  const teacherComputer = new Computer({ chain, network, url, path: "m/44'/0'/0'/0/0" })
  const studentComputer = new Computer({ chain, network, url, path: "m/44'/0'/0'/0/1" })

  // Fund if regtest
  if (network === 'regtest') {
    console.log('💰 Funding wallets...')
    await teacherComputer.faucet(1e8)
    await MineRPCBlocks.mineBlocksWithConfirmations(teacherComputer, 2)
    
    await studentComputer.faucet(1e8)
    await MineRPCBlocks.mineBlocksWithConfirmations(studentComputer, 2)
  }

  // Create helpers
  const teacherHelper = new TeacherHelper(teacherComputer)
  const studentHelper = new StudentHelper(studentComputer)
  const quizHelper = new QuizHelper(teacherComputer)

  try {
    // 1. Create teacher
    console.log('👨‍🏫 Creating teacher...')
    const teacher = await teacherHelper.createTeacher('Test Teacher', teacherComputer.getPublicKey())
    await MineRPCBlocks.mineBlocksWithConfirmations(teacherComputer, 2)
    console.log('✓ Teacher created:', teacher._id)

    // 2. Create student
    console.log('👨‍🎓 Creating student...')
    const student = await studentHelper.createStudent('Test Student', studentComputer.getPublicKey())
    await MineRPCBlocks.mineBlocksWithConfirmations(studentComputer, 2)
    console.log('✓ Student created:', student._id)

    // 3. Create quiz with payments
    console.log('📝 Creating quiz...')
    const questions = [
      {
        text: 'What is 1+1?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]

    const { quiz, paymentTxIds } = await teacherHelper.createQuiz({
      title: 'Quick Test Quiz',
      description: 'Testing the workflow',
      questions: questions,
      rewardPerCorrect: 1000n,
      teacher: teacher
    })
    console.log('✓ Quiz created:', quiz._id)
    console.log('✓ Payment created:', paymentTxIds[0])

    // 4. Check initial balance
    const initialBalance = await studentComputer.getBalance()
    console.log('💰 Student initial balance:', initialBalance.balance)

    // 5. Student attempts quiz
    console.log('🎯 Student attempting quiz...')
    const result = await studentHelper.attemptQuiz({
      quizId: quiz._id,
      studentId: student._id,
      answers: [1] // Correct answer
    })
    console.log('✓ Quiz completed - Score:', result.attempt.score)
    console.log('✓ Reward earned:', result.reward)

    // 6. Check final balance
    const finalBalance = await studentComputer.getBalance()
    console.log('💰 Student final balance:', finalBalance.balance)

    // 7. Verify payment ownership changed
    const payment = await quizHelper.paymentHelper.getPayment(paymentTxIds[0])
    console.log('🔐 Payment now owned by:', payment._owners[0])
    console.log('🔐 Student public key:', student.publicKey)
    
    const ownershipMatches = payment._owners[0] === student.publicKey
    console.log('✅ Payment ownership transfer:', ownershipMatches ? 'SUCCESS' : 'FAILED')

    console.log('\n🎉 Quick test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
quickTest().catch(console.error)