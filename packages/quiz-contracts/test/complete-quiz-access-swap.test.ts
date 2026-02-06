import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import {
  Teacher,
  Quiz,
  QuizAccess,
  QuizAccessSwapHelper,
  Payment,
  PaymentHelper,
  TeacherHelper,
  StudentHelper
} from '../src/index.js'

// Load environment variables
const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
  '.env' // current directory
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL || 'http://localhost:3000'
const chain = process.env.BCN_CHAIN || 'LTC'
const network = process.env.BCN_NETWORK || 'regtest'

describe('Complete Quiz Access Swap with Entry Fee Payment', () => {
  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer

  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let quizAccessSwapHelper: QuizAccessSwapHelper
  let paymentHelper: PaymentHelper

  let teacher: Teacher

  // Wallet balance tracking
  const walletBalances = {
    teacher: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterQuizAttempts: 0 },
    student1: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterQuizAttempts: 0 },
    student2: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterQuizAttempts: 0 }
  }

  // Helper function to get wallet balances
  async function updateWalletBalances(stage: keyof typeof walletBalances.teacher) {
    const teacherBal = await teacherComputer.getBalance()
    const student1Bal = await student1Computer.getBalance()
    const student2Bal = await student2Computer.getBalance()

    walletBalances.teacher[stage] = Number(teacherBal.confirmed || teacherBal.balance)
    walletBalances.student1[stage] = Number(student1Bal.confirmed || student1Bal.balance)
    walletBalances.student2[stage] = Number(student2Bal.confirmed || student2Bal.balance)
  }

  before(async () => {
    // Initialize computers
    teacherComputer = new Computer({ url, chain, network })
    student1Computer = new Computer({ url, chain, network })
    student2Computer = new Computer({ url, chain, network })

    // Show public keys
    console.log(`🎓 Teacher public key: ${teacherComputer.getPublicKey()}`)
    console.log(`👤 Student1 public key: ${student1Computer.getPublicKey()}`)
    console.log(`👤 Student2 public key: ${student2Computer.getPublicKey()}`)

    // Fund wallets
    await teacherComputer.faucet(1e8)
    await student1Computer.faucet(1e8)
    await student2Computer.faucet(1e8)

    // Record initial balances
    await updateWalletBalances('initial')

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    quizAccessSwapHelper = new QuizAccessSwapHelper(teacherComputer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Create teacher account first
    teacher = await teacherHelper.createTeacher('Teacher1', teacherComputer.getPublicKey())

    // Deploy necessary modules
    await paymentHelper.deploy()
    await quizAccessSwapHelper.deploy()

    await updateWalletBalances('afterSetup')
  })

  describe('Quiz Access Purchase Flow with Entry Fee', () => {
    let quiz: Quiz
    let entryFeePayment1: Payment
    let entryFeePayment2: Payment
    let quizAccess1: QuizAccess
    let quizAccess2: QuizAccess

    it('Teacher creates a quiz with reward and entry fee', async () => {
      // Create quiz with reward and entry fee
      const result = await teacherHelper.createQuiz({
        title: 'Math Quiz',
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1, // '4' is correct
        rewardAmount: 1000000n, // 1M sat reward
        entryFee: 50000n, // 50k sat entry fee
        teacher: teacher
      })

      quiz = result.quiz
      expect(await quiz.rewardAmount).to.equal(1000000n)
      expect(await quiz.entryFee).to.equal(50000n)
      
      console.log(`✅ Quiz created: Reward=${await quiz.rewardAmount} sats, Entry Fee=${await quiz.entryFee} sats`)
      
      await updateWalletBalances('afterQuizCreation')
    })

    it('Student1 creates payment for entry fee', async () => {
      // Student1 creates payment for the entry fee
      entryFeePayment1 = await student1Computer.new(Payment, [await quiz.entryFee])
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for creation
      
      console.log(`💰 Student1 created entry fee payment: ${await quiz.entryFee} sats`)
    })

    it('Teacher creates quiz access for Student1', async () => {
      // Teacher creates quiz access object for Student1
      quizAccess1 = await teacherComputer.new(QuizAccess, [await quiz._id, student1Computer.getPublicKey()])
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for creation
      
      console.log(`📋 Teacher created quiz access for Student1`)
    })

    it('Execute swap: Student1 pays entry fee, gets quiz access', async () => {
      // Sync objects to ensure they have blockchain properties
      const syncedPayment1 = await student1Computer.sync(await entryFeePayment1._id) as Payment
      const syncedQuizAccess1 = await teacherComputer.sync(await quizAccess1._id) as QuizAccess

      console.log(`🔄 Before swap:`)
      console.log(`   quizAccess1 owner: ${syncedQuizAccess1._owners[0]}`)
      console.log(`   payment1 owner: ${syncedPayment1._owners[0]}`)
      console.log(`   Expected after swap - quizAccess1 to: ${student1Computer.getPublicKey()}`)
      console.log(`   Expected after swap - payment1 to: ${teacherComputer.getPublicKey()}`)

      // Create swap transaction - Student1 pays entry fee, gets access to quiz
      const { tx } = await quizAccessSwapHelper.createSwapTx(
        syncedQuizAccess1,
        syncedPayment1
      )

      // Verify the transaction before signing
      await quizAccessSwapHelper.checkSwapTx(
        tx,
        student1Computer.getPublicKey(), // After swap, student1 should own quiz access
        teacherComputer.getPublicKey()  // After swap, teacher should own payment
      )

      // Both parties sign the transaction
      await teacherComputer.sign(tx)
      await student1Computer.sign(tx)

      // Student1 broadcasts the transaction
      const txId = await student1Computer.broadcast(tx)
      expect(txId).not.undefined

      // Wait for transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verify ownership after swap
      const updatedQuizAccess1 = await teacherComputer.sync(await quizAccess1._id) as QuizAccess
      const updatedPayment1 = await teacherComputer.sync(await entryFeePayment1._id) as Payment

      console.log(`🔄 After swap:`)
      console.log(`   quizAccess1 owner: ${updatedQuizAccess1._owners[0]}`)
      console.log(`   payment1 owner: ${updatedPayment1._owners[0]}`)
      console.log(`   Expected quizAccess1 owner: ${student1Computer.getPublicKey()}`)
      console.log(`   Expected payment1 owner: ${teacherComputer.getPublicKey()}`)

      expect(updatedQuizAccess1._owners[0]).to.equal(student1Computer.getPublicKey())
      expect(updatedPayment1._owners[0]).to.equal(teacherComputer.getPublicKey())
      
      console.log(`✅ Swap completed: Student1 now has quiz access, Teacher received entry fee`)
    })

    it('Student1 attempts quiz and claims reward', async () => {
      // Student1 attempts the quiz using the access they now own
      const result = await student1Helper.attemptQuizWithQuizAttempt(
        await quiz._id,
        1 // Correct answer is '4'
      )

      expect(result.isCorrect).to.equal(true)
      expect(result.rewardEarned).to.equal(await quiz.rewardAmount) // Should get full reward since first to answer correctly
      
      console.log(`✅ Student1 answered correctly and earned reward: ${result.rewardEarned} sats`)
    })

    it('Student2 creates payment for entry fee', async () => {
      // Student2 creates payment for the entry fee
      entryFeePayment2 = await student2Computer.new(Payment, [await quiz.entryFee])
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for creation
      
      console.log(`💰 Student2 created entry fee payment: ${await quiz.entryFee} sats`)
    })

    it('Teacher creates quiz access for Student2', async () => {
      // Teacher creates quiz access object for Student2
      quizAccess2 = await teacherComputer.new(QuizAccess, [await quiz._id, student2Computer.getPublicKey()])
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for creation
      
      console.log(`📋 Teacher created quiz access for Student2`)
    })

    it('Execute swap: Student2 pays entry fee, gets quiz access', async () => {
      // Sync objects to ensure they have blockchain properties
      const syncedPayment2 = await student2Computer.sync(await entryFeePayment2._id) as Payment
      const syncedQuizAccess2 = await teacherComputer.sync(await quizAccess2._id) as QuizAccess

      console.log(`🔄 Before swap:`)
      console.log(`   quizAccess2 owner: ${syncedQuizAccess2._owners[0]}`)
      console.log(`   payment2 owner: ${syncedPayment2._owners[0]}`)
      console.log(`   Expected after swap - quizAccess2 to: ${student2Computer.getPublicKey()}`)
      console.log(`   Expected after swap - payment2 to: ${teacherComputer.getPublicKey()}`)

      // Create swap transaction - Student2 pays entry fee, gets access to quiz
      const { tx } = await quizAccessSwapHelper.createSwapTx(
        syncedQuizAccess2,
        syncedPayment2
      )

      // Verify the transaction before signing
      await quizAccessSwapHelper.checkSwapTx(
        tx,
        student2Computer.getPublicKey(), // After swap, student2 should own quiz access
        teacherComputer.getPublicKey()  // After swap, teacher should own payment
      )

      // Both parties sign the transaction
      await teacherComputer.sign(tx)
      await student2Computer.sign(tx)

      // Student2 broadcasts the transaction
      const txId = await student2Computer.broadcast(tx)
      expect(txId).not.undefined

      // Wait for transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verify ownership after swap
      const updatedQuizAccess2 = await teacherComputer.sync(await quizAccess2._id) as QuizAccess
      const updatedPayment2 = await teacherComputer.sync(await entryFeePayment2._id) as Payment

      console.log(`🔄 After swap:`)
      console.log(`   quizAccess2 owner: ${updatedQuizAccess2._owners[0]}`)
      console.log(`   payment2 owner: ${updatedPayment2._owners[0]}`)
      console.log(`   Expected quizAccess2 owner: ${student2Computer.getPublicKey()}`)
      console.log(`   Expected payment2 owner: ${teacherComputer.getPublicKey()}`)

      expect(updatedQuizAccess2._owners[0]).to.equal(student2Computer.getPublicKey())
      expect(updatedPayment2._owners[0]).to.equal(teacherComputer.getPublicKey())
      
      console.log(`✅ Swap completed: Student2 now has quiz access, Teacher received entry fee`)
    })

    it('Student2 attempts quiz but gets 0 reward (already claimed)', async () => {
      // Student2 attempts the quiz after Student1 has already claimed the reward
      const result = await student2Helper.attemptQuizWithQuizAttempt(
        await quiz._id,
        1 // Correct answer is '4'
      )

      expect(result.isCorrect).to.equal(true)
      expect(result.rewardEarned).to.equal(0n) // Should be 0 since reward already claimed by Student1
      
      console.log(`✅ Student2 answered correctly but earned 0 sats (reward already claimed by Student1)`)
    })

    it('Verify final state and teacher revenue', async () => {
      // Wait for all transactions to settle
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check final quiz state
      const finalQuiz = await teacherComputer.sync(await quiz._id) as Quiz
      expect(finalQuiz.isClaimed).to.equal(true)
      expect(finalQuiz.claimedBy).to.equal(student1Computer.getPublicKey())
      
      // Check that teacher received both entry fees
      const payment1 = await teacherComputer.sync(await entryFeePayment1._id) as Payment
      const payment2 = await teacherComputer.sync(await entryFeePayment2._id) as Payment
      
      expect(payment1._owners[0]).to.equal(teacherComputer.getPublicKey())
      expect(payment2._owners[0]).to.equal(teacherComputer.getPublicKey())
      
      // Update final balances
      await updateWalletBalances('afterQuizAttempts')
      
      console.log(`\n🏆 FINAL RESULTS 🏆`)
      console.log(`========================`)
      console.log(`Quiz: ${await quiz.title}`)
      console.log(`Winner: Student1 (${finalQuiz.claimedBy})`)
      console.log(`Reward claimed: ${await quiz.rewardAmount} sats`)
      console.log(``)
      console.log(`Teacher received entry fees: ${await quiz.entryFee * 2n} sats (from 2 students)`)
      console.log(``)
      console.log(`Wallet Balances:`)
      console.log(`  Teacher: ${walletBalances.teacher.initial} → ${walletBalances.teacher.afterQuizAttempts} sats`)
      console.log(`  Student1: ${walletBalances.student1.initial} → ${walletBalances.student1.afterQuizAttempts} sats`)
      console.log(`  Student2: ${walletBalances.student2.initial} → ${walletBalances.student2.afterQuizAttempts} sats`)
      console.log(``)
      console.log(`Summary:`)
      console.log(`  - Student1: Got quiz access + answered correctly → earned reward`)
      console.log(`  - Student2: Got quiz access + answered correctly → no reward (already claimed)`)
      console.log(`  - Teacher: Received entry fees from both students`)
      console.log(`========================`)
    })
  })
})