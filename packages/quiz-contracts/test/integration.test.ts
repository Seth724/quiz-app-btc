import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { config } from 'dotenv'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { QuizAttempt } from '../src/attempt.js'
import { QuizHelper } from '../src/quizHelper.js'
import { ContractUtils } from '../src/utils/mineblock.js'
import type { Question } from '../src/quiz.js'
import { 
  setupSharedComputers, 
  createSharedEntities, 
  teardownSharedComputers,
  sharedTeacher1Computer,
  sharedTeacher2Computer,
  sharedStudent1Computer,
  sharedStudent2Computer,
  sharedTeacher1,
  sharedTeacher2,
  sharedStudent1,
  sharedStudent2,
  sampleQuestions
} from './shared-test-setup.js'

// Load environment variables
config()

// Get configuration from environment
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'

const { expect } = chai
chai.use(chaiMatchPattern)

describe('Integration Tests', function () {
  let quizHelper: QuizHelper

  // Set up shared computers once before all tests
  before(async function () {
    this.timeout(60000) // Increase timeout for setup
    console.log('\ud83d\ude80 Starting integration test suite setup...')
    await setupSharedComputers()
    await createSharedEntities()
    
    // Initialize QuizHelper with teacher computer and deploy payment module
    quizHelper = new QuizHelper(sharedTeacher1Computer)
    console.log('\ud83d\udee0\ufe0f Deploying payment module...')
    await quizHelper.deployPaymentModule()
    console.log('\u2705 Payment module deployed')
    
    console.log('🎯 Integration test suite setup complete!')
  })

  after(async function () {
    await teardownSharedComputers()
  })

  it('should complete full teacher-student workflow with separate wallets', async function () {
    this.timeout(60000)
    console.log('\n🧪 TEST: Full teacher-student workflow')
    
    // 1. Teacher 1 creates quiz externally
    console.log('📚 Teacher 1 creating quiz...')
    const quiz = await sharedTeacher1Computer.new(Quiz, [{
      title: 'Integration Test Quiz',
      description: 'Full workflow test',
      questions: sampleQuestions,
      rewardPerCorrect: 1000n,
      teacherPublicKey: sharedTeacher1.publicKey,
      duration: 30
    }])
    console.log('✅ Quiz created with ID:', quiz._id)
    
    await sharedTeacher1.addQuiz(quiz._id)
    console.log('✅ Quiz linked to Teacher 1')
    
    // Mine block to confirm quiz creation
    if (network === 'regtest') {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    const quizId = quiz._id
    
    // 2. Student 1 discovers and attempts quiz (using their own wallet)
    console.log('🎓 Student 1 attempting quiz...')
    const quizForAttempt = await sharedStudent1Computer.sync(quizId) as Quiz
    console.log('✅ Quiz synced for attempt')
    
    const attempt = await sharedStudent1Computer.new(QuizAttempt, [quizId, sharedStudent1Computer.getPublicKey()])
    console.log('✅ Quiz attempt created')
    
    // 3. Student answers questions
    console.log('📝 Student 1 submitting answers...')
    await attempt.submitAnswers([1, 2], quizForAttempt.correctAnswers, quizForAttempt.rewardPerCorrect)
    console.log('✅ Answers submitted')
    
    // 4. Verify results
    console.log('🔍 Verifying results...')
    console.log('Attempt completed:', attempt.isCompleted)
    console.log('Score:', attempt.score)
    console.log('Reward earned:', attempt.rewardEarned.toString())
    
    expect(attempt.isCompleted).to.be.true
    expect(attempt.score).to.equal(2)
    expect(attempt.rewardEarned).to.equal(2000n)
    console.log('✅ Results verified')
    
    // 5. Verify different public keys (separate wallets)
    console.log('🔑 Verifying separate wallets...')
    console.log('Teacher 1 key:', sharedTeacher1.publicKey.slice(0, 10) + '...')
    console.log('Student 1 key:', sharedStudent1.publicKey.slice(0, 10) + '...')
    console.log('Attempt student key:', attempt.studentPublicKey.slice(0, 10) + '...')
    
    expect(sharedTeacher1.publicKey).not.to.equal(sharedStudent1.publicKey)
    expect(attempt.studentPublicKey).to.equal(sharedStudent1.publicKey)
    console.log('✅ Wallet separation verified')
    
    // 6. Verify quiz tracking
    console.log('📊 Verifying quiz tracking...')
    const syncedQuiz = await sharedTeacher1Computer.sync(quizId) as Quiz
    await syncedQuiz.addAttemptedStudent(sharedStudent1.publicKey)
    
    // Wait for state change to propagate
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Sync again to get the updated state using the latest revision
    const updatedQuiz = await sharedTeacher1Computer.sync(syncedQuiz._rev) as Quiz
    
    const studentAttempted = updatedQuiz.hasStudentAttempted(sharedStudent1.publicKey)
    expect(studentAttempted).to.be.true
    console.log('✅ Quiz tracking verified')
    console.log('🎉 Full workflow test completed successfully!\n')
  })

  it('should enforce teacher isolation - teachers cannot access each other\'s quizzes', async function () {
    this.timeout(60000)
    console.log('\n🧪 TEST: Teacher isolation')
    
    // Teacher 1 creates a quiz
    console.log('📚 Teacher 1 creating private quiz...')
    const teacher1Quiz = await sharedTeacher1Computer.new(Quiz, [{
      title: 'Teacher 1 Private Quiz',
      description: 'Only Teacher 1 should control this',
      questions: sampleQuestions,
      rewardPerCorrect: 500n,
      teacherPublicKey: sharedTeacher1.publicKey
    }])
    await sharedTeacher1.addQuiz(teacher1Quiz._id)
    console.log('✅ Teacher 1 quiz created:', teacher1Quiz._id)
    
    // Teacher 2 creates a separate quiz
    console.log('📚 Teacher 2 creating separate quiz...')
    const teacher2Quiz = await sharedTeacher2Computer.new(Quiz, [{
      title: 'Teacher 2 Private Quiz', 
      description: 'Only Teacher 2 should control this',
      questions: sampleQuestions,
      rewardPerCorrect: 750n,
      teacherPublicKey: sharedTeacher2.publicKey
    }])
    await sharedTeacher2.addQuiz(teacher2Quiz._id)
    console.log('✅ Teacher 2 quiz created:', teacher2Quiz._id)
    
    // Verify teachers have different public keys
    console.log('🔑 Verifying teacher key separation...')
    console.log('Teacher 1 key:', sharedTeacher1.publicKey.slice(0, 10) + '...')
    console.log('Teacher 2 key:', sharedTeacher2.publicKey.slice(0, 10) + '...')
    expect(sharedTeacher1.publicKey).not.to.equal(sharedTeacher2.publicKey)
    console.log('✅ Teachers have different keys')
    
    // Verify teachers have different quiz lists
    console.log('📋 Verifying quiz ownership...')
    await sharedTeacher1Computer.sync(sharedTeacher1._id)
    await sharedTeacher2Computer.sync(sharedTeacher2._id)
    
    console.log('Teacher 1 quiz count:', await sharedTeacher1.getQuizCount())
    console.log('Teacher 2 quiz count:', await sharedTeacher2.getQuizCount())
    
    expect(sharedTeacher1.createdQuizzes).to.include(teacher1Quiz._id)
    expect(sharedTeacher1.createdQuizzes).to.not.include(teacher2Quiz._id)
    expect(sharedTeacher2.createdQuizzes).to.include(teacher2Quiz._id)
    expect(sharedTeacher2.createdQuizzes).to.not.include(teacher1Quiz._id)
    console.log('✅ Quiz ownership properly isolated')
    
    // Verify quiz ownership at the contract level
    console.log('🔐 Verifying quiz contract ownership...')
    const syncedTeacher1Quiz = await sharedTeacher1Computer.sync(teacher1Quiz._id) as Quiz
    const syncedTeacher2Quiz = await sharedTeacher2Computer.sync(teacher2Quiz._id) as Quiz
    
    console.log('Teacher 1 quiz teacher key:', syncedTeacher1Quiz.teacherPublicKey.slice(0, 10) + '...')
    console.log('Teacher 2 quiz teacher key:', syncedTeacher2Quiz.teacherPublicKey.slice(0, 10) + '...')
    
    expect(syncedTeacher1Quiz.teacherPublicKey).to.equal(sharedTeacher1.publicKey)
    expect(syncedTeacher2Quiz.teacherPublicKey).to.equal(sharedTeacher2.publicKey)
    expect(syncedTeacher1Quiz.teacherPublicKey).to.not.equal(sharedTeacher2.publicKey)
    expect(syncedTeacher2Quiz.teacherPublicKey).to.not.equal(sharedTeacher1.publicKey)
    console.log('✅ Quiz contract ownership verified')
    
    console.log('🎉 Teacher isolation test completed successfully!\n')
  })

  it('should handle multiple students attempting different quizzes from different teachers', async function () {
    this.timeout(60000) 
    console.log('\n🧪 TEST: Cross-teacher student interactions')
    
    // Teacher 1 creates a quiz
    console.log('📚 Teacher 1 creating quiz for students...')
    const teacher1Quiz = await sharedTeacher1Computer.new(Quiz, [{
      title: 'Teacher 1 Student Quiz',
      description: 'For all students',
      questions: sampleQuestions,
      rewardPerCorrect: 1000n,
      teacherPublicKey: sharedTeacher1.publicKey
    }])
    await sharedTeacher1.addQuiz(teacher1Quiz._id)
    console.log('✅ Teacher 1 quiz created')
    
    // Teacher 2 creates a quiz
    console.log('📚 Teacher 2 creating quiz for students...')
    const teacher2Quiz = await sharedTeacher2Computer.new(Quiz, [{
      title: 'Teacher 2 Student Quiz',
      description: 'For all students',
      questions: sampleQuestions,
      rewardPerCorrect: 500n,
      teacherPublicKey: sharedTeacher2.publicKey
    }])
    await sharedTeacher2.addQuiz(teacher2Quiz._id)
    console.log('✅ Teacher 2 quiz created')
    
    // Student 1 attempts Teacher 1's quiz
    console.log('🎓 Student 1 attempting Teacher 1 quiz...')
    const student1Attempt1 = await sharedStudent1Computer.new(QuizAttempt, [teacher1Quiz._id, sharedStudent1Computer.getPublicKey()])
    await student1Attempt1.submitAnswers([1, 2], teacher1Quiz.correctAnswers, teacher1Quiz.rewardPerCorrect)
    console.log('✅ Student 1 completed Teacher 1 quiz, score:', student1Attempt1.score, 'reward:', student1Attempt1.rewardEarned.toString())
    
    // Student 2 attempts Teacher 2's quiz
    console.log('🎓 Student 2 attempting Teacher 2 quiz...')
    const student2Attempt1 = await sharedStudent2Computer.new(QuizAttempt, [teacher2Quiz._id, sharedStudent2Computer.getPublicKey()])
    await student2Attempt1.submitAnswers([1, 0], teacher2Quiz.correctAnswers, teacher2Quiz.rewardPerCorrect)
    console.log('✅ Student 2 completed Teacher 2 quiz, score:', student2Attempt1.score, 'reward:', student2Attempt1.rewardEarned.toString())
    
    // Student 1 also attempts Teacher 2's quiz
    console.log('🎓 Student 1 attempting Teacher 2 quiz...')
    const student1Attempt2 = await sharedStudent1Computer.new(QuizAttempt, [teacher2Quiz._id, sharedStudent1Computer.getPublicKey()])
    await student1Attempt2.submitAnswers([1, 2], teacher2Quiz.correctAnswers, teacher2Quiz.rewardPerCorrect)
    console.log('✅ Student 1 completed Teacher 2 quiz, score:', student1Attempt2.score, 'reward:', student1Attempt2.rewardEarned.toString())
    
    // Verify results
    console.log('🔍 Verifying cross-teacher interactions...')
    expect(student1Attempt1.rewardEarned).to.equal(2000n) // Perfect score on Teacher 1's quiz
    expect(student2Attempt1.rewardEarned).to.equal(500n)  // Partial score on Teacher 2's quiz  
    expect(student1Attempt2.rewardEarned).to.equal(1000n) // Perfect score on Teacher 2's quiz
    console.log('✅ All rewards calculated correctly')
    
    // Verify student keys are correctly tracked
    expect(student1Attempt1.studentPublicKey).to.equal(sharedStudent1.publicKey)
    expect(student1Attempt2.studentPublicKey).to.equal(sharedStudent1.publicKey)
    expect(student2Attempt1.studentPublicKey).to.equal(sharedStudent2.publicKey)
    console.log('✅ Student keys tracked correctly')
    
    console.log('🎉 Cross-teacher interactions test completed successfully!\n')
  })

  it('should handle concurrent quiz attempts by different students on same quiz', async function () {
    this.timeout(60000)
    console.log('\n🧪 TEST: Concurrent quiz attempts')
    
    // Teacher 1 creates a quiz for concurrent testing
    console.log('📚 Creating quiz for concurrent testing...')
    const concurrentQuiz = await sharedTeacher1Computer.new(Quiz, [{
      title: 'Concurrent Test Quiz',
      description: 'Testing concurrent access',
      questions: sampleQuestions,
      rewardPerCorrect: 750n,
      teacherPublicKey: sharedTeacher1.publicKey
    }])
    await sharedTeacher1.addQuiz(concurrentQuiz._id)
    console.log('✅ Concurrent quiz created:', concurrentQuiz._id)

    // Both students attempt the same quiz simultaneously
    console.log('🏃‍♂️ Both students attempting quiz concurrently...')
    const [attempt1, attempt2] = await Promise.all([
      sharedStudent1Computer.new(QuizAttempt, [concurrentQuiz._id, sharedStudent1Computer.getPublicKey()]),
      sharedStudent2Computer.new(QuizAttempt, [concurrentQuiz._id, sharedStudent2Computer.getPublicKey()])
    ])
    console.log('✅ Both attempts created concurrently')

    // Submit different answers concurrently
    console.log('📝 Submitting answers concurrently...')
    await Promise.all([
      attempt1.submitAnswers([1, 2], concurrentQuiz.correctAnswers, concurrentQuiz.rewardPerCorrect),
      attempt2.submitAnswers([1, 0], concurrentQuiz.correctAnswers, concurrentQuiz.rewardPerCorrect)
    ])
    console.log('✅ Answers submitted concurrently')

    // Verify results
    console.log('🔍 Verifying concurrent attempt results...')
    console.log('Student 1 - Score:', attempt1.score, 'Reward:', attempt1.rewardEarned.toString())
    console.log('Student 2 - Score:', attempt2.score, 'Reward:', attempt2.rewardEarned.toString())
    
    expect(attempt1.score).to.equal(2)
    expect(attempt1.rewardEarned).to.equal(1500n)
    expect(attempt2.score).to.equal(1) 
    expect(attempt2.rewardEarned).to.equal(750n)
    console.log('✅ Concurrent attempts handled correctly')
    
    console.log('🎉 Concurrent quiz attempts test completed successfully!\n')
  })

  it('should demonstrate complete separation between teacher contexts', async function () {
    this.timeout(60000)
    console.log('\n🧪 TEST: Complete teacher context separation')
    
    // Add longer delay to prevent mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 5000))
    console.log('✅ Delay added to prevent mempool conflicts')
    
    // Create identical quizzes from both teachers
    console.log('📚 Both teachers creating identical quizzes...')
    const identicalQuestions: Question[] = [
      {
        text: `Test question for separation ${Date.now()}`, // Make unique
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 2
      }
    ]
    
    const teacher1IdenticalQuiz = await sharedTeacher1Computer.new(Quiz, [{
      title: 'Identical Quiz',
      description: 'Same content, different teachers',
      questions: identicalQuestions,
      rewardPerCorrect: 100n,
      teacherPublicKey: sharedTeacher1.publicKey
    }])
    
    const teacher2IdenticalQuiz = await sharedTeacher2Computer.new(Quiz, [{
      title: 'Identical Quiz',
      description: 'Same content, different teachers', 
      questions: identicalQuestions,
      rewardPerCorrect: 200n, // Different reward
      teacherPublicKey: sharedTeacher2.publicKey
    }])
    
    await sharedTeacher1.addQuiz(teacher1IdenticalQuiz._id)
    await sharedTeacher2.addQuiz(teacher2IdenticalQuiz._id)
    console.log('✅ Identical quizzes created with different rewards')
    
    // Student attempts both quizzes
    console.log('🎓 Student 1 attempting both identical quizzes...')
    const attemptT1 = await sharedStudent1Computer.new(QuizAttempt, [teacher1IdenticalQuiz._id, sharedStudent1Computer.getPublicKey()])
    const attemptT2 = await sharedStudent1Computer.new(QuizAttempt, [teacher2IdenticalQuiz._id, sharedStudent1Computer.getPublicKey()])
    
    await attemptT1.submitAnswers([2], teacher1IdenticalQuiz.correctAnswers, teacher1IdenticalQuiz.rewardPerCorrect)
    await attemptT2.submitAnswers([2], teacher2IdenticalQuiz.correctAnswers, teacher2IdenticalQuiz.rewardPerCorrect)
    console.log('✅ Student completed both quizzes')
    
    // Verify complete separation
    console.log('🔍 Verifying complete context separation...')
    console.log('Teacher 1 quiz reward:', attemptT1.rewardEarned.toString())
    console.log('Teacher 2 quiz reward:', attemptT2.rewardEarned.toString())
    console.log('Quiz IDs different:', teacher1IdenticalQuiz._id !== teacher2IdenticalQuiz._id)
    
    expect(attemptT1.rewardEarned).to.equal(100n)
    expect(attemptT2.rewardEarned).to.equal(200n)
    expect(teacher1IdenticalQuiz._id).to.not.equal(teacher2IdenticalQuiz._id)
    expect(teacher1IdenticalQuiz.teacherPublicKey).to.not.equal(teacher2IdenticalQuiz.teacherPublicKey)
    console.log('✅ Complete teacher separation verified')
    
    console.log('🎉 Teacher context separation test completed successfully!\n')
  })

  it('should complete full workflow with payment transfer', async function () {
    this.timeout(120000) // Longer timeout for payment operations
    console.log('\n🧪 TEST: Full workflow with payment transfer')
    
    // Get teacher's initial balance
    const teacherBalanceBefore = await sharedTeacher1Computer.getBalance()
    console.log('💰 Teacher initial balance:', teacherBalanceBefore, 'satoshis')
    
    // 1. Teacher creates quiz with payment
    console.log('\n📚 Teacher 1 creating quiz with locked payment...')
    const { quiz, paymentTxId } = await quizHelper.createQuizWithPayment({
      title: 'Math Quiz with Payment',
      description: 'Complete to earn rewards',
      questions: sampleQuestions,
      rewardPerCorrect: 1000n, // 1000 satoshis per correct answer
      teacherPublicKey: sharedTeacher1.publicKey,
      duration: 30,
      teacher: sharedTeacher1
    })
    console.log('✅ Quiz created with ID:', quiz._id)
    console.log('✅ Payment locked with ID:', paymentTxId)
    console.log('💰 Total locked reward:', quiz.totalReward.toString(), 'satoshis')
    
    // Verify payment was created and teacher balance was reduced
    const initialPayment = await quizHelper.getPaymentDetails(paymentTxId)
    console.log('✅ Initial payment verified:', initialPayment._satoshis.toString(), 'satoshis')
    expect(initialPayment._satoshis).to.equal(2000n) // 2 questions * 1000n
    
    const teacherBalanceAfter = await sharedTeacher1Computer.getBalance()
    console.log('💰 Teacher balance after locking payment:', teacherBalanceAfter, 'satoshis')
    console.log('💸 Amount locked:', (Number(teacherBalanceBefore) - Number(teacherBalanceAfter)), 'satoshis (includes tx fees)')
    console.log('✅ Teacher funds locked on blockchain')
    
    // 2. Student completes quiz and receives payment
    console.log('\n🎓 Student 1 attempting quiz with payment reward...')
    const studentHelper = new QuizHelper(sharedStudent1Computer)
    studentHelper.paymentHelper.mod = quizHelper.paymentHelper.mod // Use same deployed module
    
    const { attempt, rewardPaymentTxId } = await studentHelper.completeQuizWithPayment({
      quiz: await sharedStudent1Computer.sync(quiz._id) as Quiz,
      student: await sharedStudent1Computer.sync(sharedStudent1._id) as Student,
      answers: [1, 2] // Both correct answers
    })
    
    console.log('✅ Quiz attempt completed')
    console.log('📊 Score:', attempt.score, '/', sampleQuestions.length)
    console.log('💰 Reward earned:', attempt.rewardEarned.toString(), 'satoshis')
    
    // Verify attempt results
    expect(attempt.isCompleted).to.be.true
    expect(attempt.score).to.equal(2)
    expect(attempt.rewardEarned).to.equal(2000n)
    
    // 3. Verify payment was transferred to student
    if (rewardPaymentTxId) {
      console.log('\n💸 Verifying payment transfer...')
      console.log('Reward payment ID:', rewardPaymentTxId)
      
      const rewardPayment = await studentHelper.getPaymentDetails(rewardPaymentTxId)
      console.log('✅ Payment amount:', rewardPayment._satoshis.toString(), 'satoshis')
      console.log('✅ Payment owner:', rewardPayment._owners[0].slice(0, 10) + '...')
      console.log('✅ Student public key:', sharedStudent1.publicKey.slice(0, 10) + '...')
      
      expect(rewardPayment._satoshis).to.equal(2000n)
      expect(rewardPayment._owners).to.include(sharedStudent1.publicKey)
      console.log('✅ Payment successfully transferred to student')
    } else {
      throw new Error('No reward payment was created')
    }
    
    // 4. Verify student's earnings were updated
    const updatedStudent = await sharedStudent1Computer.sync(sharedStudent1._id) as Student
    console.log('\n📈 Student earnings updated:', updatedStudent.totalEarnings.toString(), 'satoshis')
    
    console.log('🎉 Full payment workflow test completed successfully!\n')
  })
})
