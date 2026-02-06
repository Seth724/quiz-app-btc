import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Teacher } from '../src/teacher.js'
//import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { Payment } from '../src/payment.js'
import {  QuizAccessHelper, QuizAccessSwapHelper } from '../src/index.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
//import { StudentHelper } from '../src/helpers/student-helper.js'
//import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

describe('Entry Fee Withdrawal Tests', function () {
  this.timeout(300000)

  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  let teacherComputer: Computer
  let studentComputer: Computer
  let teacherHelper: TeacherHelper, paymentHelper: PaymentHelper
  let teacher: Teacher | null = null
  let quiz: Quiz | null = null
  let quizId: string | null = null;
  let teacherPubKey: string | null = null
  let quizAccessHelper: QuizAccessHelper | null = null
  let quizAccessSwapHelper: QuizAccessSwapHelper | null = null
  let payment: Payment | null = null

  before(async function () {
    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    studentComputer = new Computer({ chain, network, url, path: `${basePath}/1` })

    teacherPubKey = teacherComputer.getPublicKey()

    // Fund wallets first before creating helpers to ensure sufficient balance for deployments
    if (network === 'regtest') {
      await teacherComputer.faucet(2e8) // Double the amount to cover deployment costs
      await studentComputer.faucet(2e8)
      
      // Add delay to ensure faucet transactions are confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    teacherHelper = new TeacherHelper(teacherComputer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Deploy helper contracts with delays to avoid conflicts
    quizAccessHelper = new QuizAccessHelper(teacherComputer)
    await quizAccessHelper.deploy()
    
    // Add delay between deployments
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    quizAccessSwapHelper = new QuizAccessSwapHelper(teacherComputer)
    await quizAccessSwapHelper.deploy()
    
    // Add delay before next deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await paymentHelper.deploy()
    
    // Initialize teacher
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey!)
  })

  it('should test multiple entry fee withdrawals', async function () {
    // Create a quiz with entry fee
    const quizData = {
      title: 'Test Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      entryFee: 50000n, // Add entry fee
      teacher: teacher!
    }
    const quizResult = await teacherHelper.createQuiz(quizData)
    quiz = quizResult.quiz
    quizId = await quiz._id
    const paymentTxId = quizResult.paymentTxId
    payment = await teacherComputer.sync(paymentTxId) as Payment

    expect(await quiz.title).to.equal('Test Quiz')
    expect(await quiz.entryFee).to.equal(50000n) // Verify entry fee

    // Array to store entry fee payment objects
    const entryFeePayments: Payment[] = []

    // Create multiple students and have them purchase access to test multiple withdrawals
    const numStudents = 5
    const studentComputers: Computer[] = []
    const studentPubKeys: string[] = []

    // Create multiple student computers
    for (let i = 0; i < numStudents; i++) {
      const studentComp = new Computer({ chain, network, url, path: `${basePath}/${i + 2}` })
      await studentComp.faucet(2e8)
      studentComputers.push(studentComp)
      studentPubKeys.push(studentComp.getPublicKey())
    }

    // Have each student purchase access to the quiz
    for (let i = 0; i < numStudents; i++) {
      console.log(`\n<Student ${i + 1} (${studentPubKeys[i].substring(0, 10)}...) initiating swap>`);

      // Teacher creates quiz access object
      const quizAccess = await quizAccessHelper!.createQuizAccess(quizId!, studentPubKeys[i])
      console.log(`📋 Quiz access token created for Student ${i + 1}: ${await quizAccess._id}`);

      // Student creates payment for the entry fee
      const entryFeePayment = await studentComputers[i].new(Payment, [await quiz!.entryFee])
      console.log(`💰 Entry fee payment created: ${await entryFeePayment._satoshis} sats`);

      // Student creates helper objects from the module specifiers
      const studentQuizAccessSwapHelper = new QuizAccessSwapHelper(studentComputers[i], quizAccessSwapHelper!.mod)

      // Student creates swap transaction - pays entry fee, gets access to quiz
      const { tx } = await studentQuizAccessSwapHelper.createSwapTx(quizAccess, entryFeePayment)

      // Teacher checks the swap transaction
      await quizAccessSwapHelper!.checkSwapTx(tx, studentPubKeys[i], teacherComputer.getPublicKey())

      // Teacher signs and broadcasts the transaction to execute the swap
      await teacherComputer.sign(tx)
      await teacherComputer.broadcast(tx)

      // Student reads the updated state from the blockchain
      const {
        env: { quizAccess: quizAccessS, payment: entryFeePaymentS },
      } = (await studentComputers[i].sync(tx.getId())) as { env: { quizAccess: any; payment: any } }

      expect(quizAccessS._owners).deep.eq([studentPubKeys[i]])
      expect(entryFeePaymentS._owners).deep.eq([teacherComputer.getPublicKey()])

      console.log(`🎉 STUDENT ${i + 1} SWAP SUCCESSFUL:`);
      console.log(`   - Quiz access now owned by Student ${i + 1}: ✅`);
      console.log(`   - Entry fee now owned by Teacher: ✅`);

      // Store the entry fee payment for later withdrawal
      entryFeePayments.push(entryFeePaymentS)

      // Add delay between swaps to avoid mempool chain issues
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Created ${numStudents} entry fee payments for teacher to withdraw`);

    // Now test withdrawing all the entry fee payments one by one
    console.log(await teacherComputer.getBalance());
    const teacherPaymentHelper = new PaymentHelper(teacherComputer);
    const withdrawalAmounts: number[] = []

    for (let i = 0; i < entryFeePayments.length; i++) {
      console.log(`\n💰 WITHDRAWING ENTRY FEE PAYMENT ${i + 1}: ${await entryFeePayments[i]._satoshis} sats`);

      try {
        const withdrawalAmount = await teacherPaymentHelper.withdrawPayment(entryFeePayments[i]);
        withdrawalAmounts.push(Number(withdrawalAmount));
        console.log(`   - Successfully withdrew: ${withdrawalAmount} sats`);
        
        // Add delay between withdrawals to avoid mempool chain issues
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`   - Failed to withdraw payment ${i + 1}:`, error);
        throw error;
      }
    }

    console.log(`\n📊 WITHDRAWAL SUMMARY:`);
    console.log(`   - Total payments withdrawn: ${withdrawalAmounts.length}`);
    console.log(`   - Individual withdrawal amounts: [${withdrawalAmounts.join(', ')}] sats`);
    console.log(`   - Total amount withdrawn: ${withdrawalAmounts.reduce((sum, val) => sum + val, 0)} sats`);

    // Verify that all withdrawals were successful
    expect(withdrawalAmounts.length).to.equal(numStudents);
    
    // Each withdrawal should be close to the original amount (minus dust fees)
    for (const amount of withdrawalAmounts) {
      expect(amount).to.be.closeTo(49454, 100); // Close to 50000 - 546 dust
    }

    console.log(await teacherComputer.getBalance());
    console.log(`\n✅ ALL ${numStudents} ENTRY FEE PAYMENTS WERE SUCCESSFULLY WITHDRAWN`);
  })
})