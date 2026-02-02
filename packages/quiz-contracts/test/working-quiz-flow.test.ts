import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { config } from 'dotenv'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0"

describe('Working Single Question Quiz Flow', function () {
  this.timeout(600000) // 10 minute timeout

  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer

  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: any
  let student1: any
  let student2: any
  let quiz: any
  let paymentTxId: string

  before(async function () {
    console.log('\n🚀 Setting up working test environment...')
    console.log(`Chain: ${chain}, Network: ${network}`)
    console.log(`Node URL: ${url}`)

    // Initialize computer instances
    teacherComputer = new Computer({
      chain: chain,
      network: network,
      url: url,
      path: `${basePath}/0`
    })

    student1Computer = new Computer({
      chain: chain,
      network: network,
      url: url,
      path: `${basePath}/1`
    })

    student2Computer = new Computer({
      chain: chain,
      network: network,
      url: url,
      path: `${basePath}/2`
    })

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallets on regtest
    if (network === 'regtest') {
      console.log('💰 Funding wallets on regtest...')
      try {
        await teacherComputer.faucet(1e8) // 1 LTC
        await student1Computer.faucet(1e8) // 1 LTC  
        await student2Computer.faucet(1e8) // 1 LTC
        console.log('✅ Wallets funded successfully')
        
        // Add delay after funding
        console.log('⏳ Waiting after funding...')
        await new Promise(resolve => setTimeout(resolve, 4000))
      } catch (error) {
        console.log(`⚠️ Warning: Faucet failed (${(error as any).message}), continuing with existing funds`)
      }
    }

    console.log('✅ Working test environment ready')
  })

  // Helper function for retry with mempool conflict detection
  async function retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 5
  ): Promise<T> {
    let retries = maxRetries
    let lastError: any
    
    while (retries > 0) {
      try {
        return await operation()
      } catch (error) {
        retries--
        lastError = error
        const errorMsg = (error as any).message
        console.error(`❌ ${operationName} failed: ${errorMsg}`)
        
        if (errorMsg.includes('txn-mempool-conflict')) {
          console.log(`⏳ Mempool conflict detected, waiting longer before retry... (${retries} retries left)`)
          await new Promise(resolve => setTimeout(resolve, 8000)) // 8 second wait for mempool conflicts
        } else {
          console.log(`⏳ Retrying ${operationName} in 3 seconds... (${retries} retries left)`)
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
        
        if (retries === 0) {
          throw lastError
        }
      }
    }
    
    throw lastError
  }

  it('should create teacher and students', async function () {
    console.log('👨‍🏫 Creating teacher...')
    
    teacher = await retryOperation(
      () => teacherHelper.createTeacher('Prof. Smith', teacherComputer.getPublicKey()),
      'Teacher creation'
    )
    
    console.log(`✅ Teacher created: ${teacher._id}`)
    expect(teacher).to.exist
    expect(teacher._id).to.be.a('string')
    
    // Wait between operations
    console.log('⏳ Waiting before student creation...')
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    console.log('👨‍🎓 Creating Student 1 (Alice)...')
    student1 = await retryOperation(
      () => student1Helper.createStudent('Alice', student1Computer.getPublicKey()),
      'Student 1 creation'
    )
    
    console.log(`✅ Student 1 (Alice) created: ${student1._id}`)
    expect(student1).to.exist
    expect(student1._id).to.be.a('string')
    
    // Wait between operations
    console.log('⏳ Waiting before second student creation...')
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    console.log('👨‍🎓 Creating Student 2 (Bob)...')
    student2 = await retryOperation(
      () => student2Helper.createStudent('Bob', student2Computer.getPublicKey()),
      'Student 2 creation'
    )
    
    console.log(`✅ Student 2 (Bob) created: ${student2._id}`)
    expect(student2).to.exist
    expect(student2._id).to.be.a('string')
  })

  it('should create single question quiz', async function () {
    console.log('\n📝 Creating single question quiz...')
    
    // Wait before quiz creation
    console.log('⏳ Waiting before quiz creation...')
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    const quizParams = {
      title: 'Math Quiz #1',
      questionText: 'What is 2 + 3?',
      options: ['4', '5', '6', '7'],
      correctAnswer: 1, // '5' is at index 1
      rewardAmount: 1000n,
      teacher
    }

    const result = await retryOperation(
      () => teacherHelper.createQuiz(quizParams),
      'Quiz creation'
    )
    
    quiz = result.quiz
    paymentTxId = result.paymentTxId

    console.log(`✅ Quiz created: ${quiz._id}`)
    console.log(`✅ Payment created: ${paymentTxId}`)

    // Verify quiz properties
    expect(quiz).to.exist
    expect(quiz._id).to.be.a('string')
    expect(quiz.title).to.equal('Math Quiz #1')
    expect(quiz.questionText).to.equal('What is 2 + 3?')
    expect(quiz.options).to.deep.equal(['4', '5', '6', '7'])
    expect(quiz.correctAnswer).to.equal(1)
    expect(quiz.rewardAmount).to.equal(1000n)
    expect(quiz.isActive).to.equal(true)
    expect(quiz.isClaimed).to.equal(false)
    expect(quiz.claimedBy).to.equal('')
    expect(quiz.attemptedStudents).to.deep.equal([])

    // Verify payment exists
    expect(paymentTxId).to.be.a('string')
  })

  it('should allow Alice to attempt quiz first and claim reward', async function () {
    console.log('\n🏃‍♀️ Alice attempts quiz first...')
    
    // Wait before quiz attempt
    console.log('⏳ Waiting before quiz attempt...')
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    const result = await retryOperation(
      () => student1Helper.attemptQuiz({
        quizId: quiz._id,
        studentId: student1._id,
        selectedAnswer: 1 // Correct answer
      }),
      'Alice quiz attempt'
    )

    console.log(`✅ Alice attempt result: ${JSON.stringify(result, null, 2)}`)

    expect(result.isCorrect).to.equal(true)
    expect(result.rewardClaimed).to.equal(1000n)
    expect(result.paymentTransferred).to.equal(true)

    // Verify quiz state is updated
    const updatedQuiz = await student1Helper.getQuiz(quiz._id)
    expect(updatedQuiz.isClaimed).to.equal(true)
    expect(updatedQuiz.claimedBy).to.equal(student1Computer.getPublicKey())
    expect(updatedQuiz.attemptedStudents).to.include(student1Computer.getPublicKey())

    // Verify payment ownership transferred to Alice
    const isAliceOwned = await paymentHelper.isPaymentOwnedBy(paymentTxId, student1Computer.getPublicKey())
    expect(isAliceOwned).to.equal(true)

    // Verify Alice's total rewards
    const aliceTotalRewards = await student1Helper.getStudentTotalRewards(student1._id)
    expect(aliceTotalRewards).to.equal(1000n)
  })

  it('should allow Bob to attempt quiz but receive no reward (too late)', async function () {
    console.log('\n🏃‍♂️ Bob attempts quiz second (too late)...')
    
    // Wait before Bob's attempt
    console.log('⏳ Waiting before Bob\'s attempt...')
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    const result = await retryOperation(
      () => student2Helper.attemptQuiz({
        quizId: quiz._id,
        studentId: student2._id,
        selectedAnswer: 1 // Also correct answer, but too late
      }),
      'Bob quiz attempt'
    )

    console.log(`✅ Bob attempt result: ${JSON.stringify(result, null, 2)}`)

    expect(result.isCorrect).to.equal(true)
    expect(result.rewardClaimed).to.equal(0n) // No reward because already claimed
    expect(result.paymentTransferred).to.equal(false)

    // Verify quiz state remains with Alice as claimer
    const updatedQuiz = await student2Helper.getQuiz(quiz._id)
    expect(updatedQuiz.isClaimed).to.equal(true)
    expect(updatedQuiz.claimedBy).to.equal(student1Computer.getPublicKey()) // Still Alice
    expect(updatedQuiz.attemptedStudents).to.include(student2Computer.getPublicKey())

    // Verify payment still belongs to Alice
    const isAliceOwned = await paymentHelper.isPaymentOwnedBy(paymentTxId, student1Computer.getPublicKey())
    const isBobOwned = await paymentHelper.isPaymentOwnedBy(paymentTxId, student2Computer.getPublicKey())
    expect(isAliceOwned).to.equal(true)
    expect(isBobOwned).to.equal(false)

    // Verify Bob's total rewards remain 0
    const bobTotalRewards = await student2Helper.getStudentTotalRewards(student2._id)
    expect(bobTotalRewards).to.equal(0n)
  })

  after(async function () {
    console.log('\n🏁 Working test completed successfully!')
    console.log('Summary:')
    console.log('✅ Single question quiz architecture working')
    console.log('✅ First-come-first-served payment transfer working')
    console.log('✅ Payment ownership validation working') 
    console.log('✅ Quiz attempt tracking working')
  })
})