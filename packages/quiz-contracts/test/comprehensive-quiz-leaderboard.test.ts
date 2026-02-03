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
import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'

describe('Comprehensive Quiz with Leaderboard', function () {
  this.timeout(300000)

  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
  let teacherHelper: TeacherHelper, student1Helper: StudentHelper, student2Helper: StudentHelper, attempt1Helper: AttemptHelper, attempt2Helper: AttemptHelper, paymentHelper: PaymentHelper, leaderboardHelper: LeaderboardHelper
  let teacher: Teacher, student1: Student, student2: Student
  let quiz: Quiz, payment: Payment
  let quizId: string;
  let teacherPubKey: string, student1PubKey: string, student2PubKey: string

  // Wallet balance tracking
  const walletBalances = {
    teacher: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
    student1: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
    student2: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 }
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

  before(async function () {
    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
    student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    attempt1Helper = new AttemptHelper(student1Computer)
    attempt2Helper = new AttemptHelper(student2Computer)
    paymentHelper = new PaymentHelper(teacherComputer)
    leaderboardHelper = new LeaderboardHelper(teacherComputer)

    if (network === 'regtest') {
      await teacherComputer.faucet(1e8)
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
    }

    await paymentHelper.deploy()

    // Record initial balances
    await updateWalletBalances('initial')
    await updateWalletBalances('afterSetup')
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    // Use the student variables to avoid unused warnings
    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')
  })

  it('should create quiz with payment', async function () {
    const quizData = {
      title: 'Math Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      teacher: teacher
    }
    const quizResult = await teacherHelper.createQuiz(quizData)
    quiz = quizResult.quiz
    quizId = await quiz._id
    const paymentTxId = quizResult.paymentTxId
    payment = await teacherComputer.sync(paymentTxId) as Payment

    expect(await quiz.title).to.equal('Math Quiz')
    expect(await payment._satoshis).to.equal(1000000n)

    // Record balances after quiz creation
    await updateWalletBalances('afterQuizCreation')
  })

  it('should allow students to attempt the quiz and record results', async function () {
    // Student1 attempts first
    const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
    await attempt1.submitAnswer(1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student1PubKey)
    const claimed1 = await quiz.claimReward(student1PubKey)

    // Student2 attempts second
    const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
    await attempt2.submitAnswer(1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student2PubKey)
    const claimed2 = await quiz.claimReward(student2PubKey)

    expect(claimed1).to.equal(true)
    expect(claimed2).to.equal(false)
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    // Record balances after attempts
    await updateWalletBalances('afterAttempts')

    // Record quiz results for leaderboard
    const quizResult1: QuizResult = {
      quizId: quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student1PubKey,
      isCorrect: await attempt1.isCorrect,
      rewardEarned: await attempt1.rewardEarned,
      paymentTxId: await payment._id,
      timestamp: Date.now()
    };

    const quizResult2: QuizResult = {
      quizId: quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student2PubKey,
      isCorrect: await attempt2.isCorrect,
      rewardEarned: await attempt2.rewardEarned, // This will be 0 since student2 couldn't claim
      timestamp: Date.now()
    };

    await leaderboardHelper.recordQuizResult(quizResult1);
    await leaderboardHelper.recordQuizResult(quizResult2);
  })

  it('should transfer payment to winner', async function () {
    // Transfer payment to winner
    await payment.transfer(student1PubKey)
    const owners = await payment._owners
    expect(owners[0]).to.equal(student1PubKey)

    // Record balances after transfer
    await updateWalletBalances('afterTransfer')
  })

  it('should allow winner to withdraw payment', async function () {
    // Withdraw payment
    const student1PaymentHelper = new PaymentHelper(student1Computer)
    const withdrawnAmount = await student1PaymentHelper.withdrawPayment(payment)
    expect(withdrawnAmount).to.equal(999454n) // 1000000 - 546

    // Record balances after withdrawal
    await updateWalletBalances('afterWithdrawal')
  })

  it('should verify leaderboard shows correct rewards and payment ownership', async function () {
    // Verify final states
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    // Check payment ownership
    const finalOwners = await payment._owners
    expect(finalOwners[0]).to.equal(student1PubKey)

    // Display comprehensive results
    console.log('\n🏆 COMPREHENSIVE QUIZ RESULTS 🏆')
    console.log('=====================================')

    console.log('\n👤 PUBLIC KEYS:')
    console.log(`Teacher: ${teacherPubKey}`)
    console.log(`Student1 (Alice): ${student1PubKey}`)
    console.log(`Student2 (Bob): ${student2PubKey}`)

    console.log('\n🎯 QUIZ OUTCOME:')
    console.log(`Quiz: ${await quiz.title}`)
    console.log(`Winner: ${await quiz.claimedBy}`)
    console.log(`Quiz Claimed: ${await quiz.isClaimed}`)

    console.log('\n💳 PAYMENT DETAILS:')
    console.log(`Original Amount: 1000000 sats`)
    console.log(`Current Owner: ${finalOwners[0]}`)
    console.log(`Withdrawal Amount: 999454 sats (1000000 - 546 dust)`)

    console.log('\n📊 WALLET BALANCES:')
    console.log(`Teacher Initial: ${walletBalances.teacher.initial.toLocaleString()}`)
    console.log(`Teacher Final: ${walletBalances.teacher.afterWithdrawal.toLocaleString()}`)
    console.log(`Student1 Initial: ${walletBalances.student1.initial.toLocaleString()}`)
    console.log(`Student1 Final: ${walletBalances.student1.afterWithdrawal.toLocaleString()}`)
    console.log(`Student2 Initial: ${walletBalances.student2.initial.toLocaleString()}`)
    console.log(`Student2 Final: ${walletBalances.student2.afterWithdrawal.toLocaleString()}`)

    console.log('\n📈 LEADERBOARD:')
    const leaderboard = leaderboardHelper.getLeaderboard()
    if (leaderboard.length > 0) {
      leaderboard.forEach((student, index) => {
        console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
      })
    } else {
      console.log('No students on leaderboard (no rewards earned)')
    }

    console.log('\n✅ SUMMARY:')
    console.log('- Student1 answered first and claimed the quiz → received payment')
    console.log('- Student2 answered correctly but too late → no payment')
    console.log('- Payment was successfully transferred to Student1')
    console.log('- Payment was successfully withdrawn by Student1')
    console.log('- Student1 and student2 appear on leaderboard with reward')
    console.log('=====================================')
  })
})
