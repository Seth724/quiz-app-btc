



import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
// import dotenv from 'dotenv'

//import path from 'path'

import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { Payment, PaymentMock } from '../src/payment.js'
import { QuizAccess } from '../src/quiz-access.js'
import { QuizAccessHelper, QuizAccessSaleHelper } from '../src/index.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'
import { MineBlocks } from '../src/utils/mineblock.js'

// Type for sale transaction sync result
type SaleSyncResult = { env: { o: QuizAccess; p: Payment } }

// Load env like other monorepo tests
// const envPaths = [
//   path.resolve(process.cwd(), './packages/node/.env'), // workspace root
//   path.resolve(process.cwd(), './.env'),
//   '../node/.env',
// ]
//for (const envPath of envPaths) dotenv.config({ path: envPath })

describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
  this.timeout(300000)

  // Use BCN_* (same convention as the standard tests)
  const chain = process.env.BCN_CHAIN || ''
  const network = process.env.BCN_NETWORK || ''
  const url = process.env.BCN_URL || ''
  //const basePath = process.env.BCN_BASE_PATH || `m/44'/2'/0'/0`

  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer

  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let attempt1Helper: AttemptHelper
  let attempt2Helper: AttemptHelper
  let paymentHelper: PaymentHelper
  let leaderboardHelper: LeaderboardHelper

  let teacher!: Teacher
  let student1!: Student
  let student2!: Student

  let quiz!: Quiz
  let payment!: Payment
  let quizId!: string

  let teacherPubKey!: string
  let student1PubKey!: string
  let student2PubKey!: string

  let quizAccessHelper!: QuizAccessHelper
  let quizAccessSaleHelper!: QuizAccessSaleHelper

  let entryFeePaymentS1!: Payment
  let entryFeePaymentS2!: Payment

  // typed (no any)
  let quizAccessTokenS1!: QuizAccess
  let quizAccessTokenS2!: QuizAccess

  const walletBalances = {
    teacher: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
    student1: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
    student2: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
  }

  async function updateWalletBalances(stage: keyof typeof walletBalances.teacher) {
    const teacherBal = await teacherComputer.getBalance()
    const student1Bal = await student1Computer.getBalance()
    const student2Bal = await student2Computer.getBalance()

    walletBalances.teacher[stage] = Number(teacherBal.confirmed || teacherBal.balance)
    walletBalances.student1[stage] = Number(student1Bal.confirmed || student1Bal.balance)
    walletBalances.student2[stage] = Number(student2Bal.confirmed || student2Bal.balance)
  }

  const mine = async (blocks = 1) => {
    if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
  }

  before(async function () {
    // quick sanity log (helps confirm env is actually loaded)
    console.log('ENV:', { url, chain, network})

    teacherComputer = new Computer({ chain, network, url })
    student1Computer = new Computer({ chain, network, url})
    student2Computer = new Computer({ chain, network, url})

    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    if (network === 'regtest') {
      await teacherComputer.faucet(2e8)
      await student1Computer.faucet(2e8)
      await student2Computer.faucet(2e8)
      await updateWalletBalances('initial')
      //await mine(1)
    }

    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    attempt1Helper = new AttemptHelper(student1Computer)
    attempt2Helper = new AttemptHelper(student2Computer)
    paymentHelper = new PaymentHelper(teacherComputer)
    leaderboardHelper = new LeaderboardHelper(teacherComputer)

    quizAccessHelper = new QuizAccessHelper(teacherComputer)
    await quizAccessHelper.deploy()
    //await mine(1)

    quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
    await quizAccessSaleHelper.deploy()
    //await mine(1)

    await paymentHelper.deploy()
    //await mine(1)

    await updateWalletBalances('afterSetup')
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')

    //await mine(1)
  })

  it('should create quiz with payment', async function () {
    const quizData = {
      title: 'Math Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      entryFee: 50000n,
      teacher: teacher,
    }

    const quizResult = await teacherHelper.createQuiz(quizData)
    quiz = quizResult.quiz
    quizId = await quiz._id

    const paymentTxId = quizResult.paymentTxId
    payment = (await teacherComputer.sync(paymentTxId)) as Payment

    expect(await quiz.title).to.equal('Math Quiz')
    expect(await payment._satoshis).to.equal(1000000n)
    expect(await quiz.entryFee).to.equal(50000n)

    //await mine(1)
    await updateWalletBalances('afterQuizCreation')
  })

  it('should allow students to purchase access to the quiz (SALE OFFERS)', async function () {
    console.log('\n🧾 SALE OFFER MECHANISM INITIATED')
    console.log('==================================')

    // ---------- Student 1 ----------
    console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

    // teacher mints access token bag (teacher owns it initially)
    const access1 = await quizAccessHelper.createQuizAccess(quizId, 1n)

    // metadata asserts (like fungible token test)
    expect(access1._id).to.be.a('string')
    expect(access1._rev).to.be.a('string')
    expect(access1._root).to.be.a('string')
    expect(access1._owners).deep.equal([teacherPubKey])
    expect(access1.quizId).to.equal(quizId)
    expect(access1.amount).to.equal(1n)

    const access1RevBefore = access1._rev

    const mock1 = new PaymentMock(await quiz.entryFee)
    const { tx: offerTx1 } = await quizAccessSaleHelper.createOfferTx(access1, mock1)

    console.log("swap objects in offerTx1.env:", offerTx1)
    console.log('\n--- OFFER TX (teacher created, before finalize) ---')
    console.log('txid:', offerTx1.getId())
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)
    console.log('out0 value (price):', offerTx1.outs[0].value)
    console.log('out1 value (min dust):', offerTx1.outs[1].value)

    // Offer tx shape asserts (like sale.test.ts)
    expect(offerTx1.ins).to.have.lengthOf(2)
    expect(offerTx1.ins[0].script.length).to.be.greaterThan(0) // signed by teacher
    expect(offerTx1.ins[1].script.length).to.equal(0) // unsigned (student will provide)
    expect(BigInt(offerTx1.outs[0].value)).to.equal(await quiz.entryFee)
    expect(offerTx1.outs[1].value).to.be.greaterThan(0)

    // student validates teacher offer
    const studentSaleHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
    expect(await studentSaleHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

    // student creates real payment
    const entryPay1 = await student1Computer.new(Payment, [await quiz.entryFee])
    expect(entryPay1._owners).deep.equal([student1PubKey])
    expect(entryPay1._satoshis).to.equal(await quiz.entryFee)

    const s1Script = student1Computer.toScriptPubKey()
    if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')

    QuizAccessSaleHelper.finalizeOfferTx(offerTx1, entryPay1, s1Script)

    console.log('\n--- OFFER TX (after finalize, before fund/sign/broadcast) ---')
    console.log('txid:', offerTx1.getId())
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)

    await student1Computer.fund(offerTx1)

    console.log('\n--- OFFER TX (after FUND, before SIGN) ---')
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)

    await student1Computer.sign(offerTx1)

    console.log('\n--- OFFER TX (after SIGN, before BROADCAST) ---')
    console.log('ins:', offerTx1.ins.length, 'outs:', offerTx1.outs.length)

    const txId1 = await student1Computer.broadcast(offerTx1)
    //await mine(1)

    console.log('\n--- BROADCASTED TX ---')
    console.log('txId:', txId1)

    // sync result
    const synced1 = (await student1Computer.sync(txId1)) as SaleSyncResult
    console.log('\n--- SYNCED TX ENV ---')
    console.log(synced1.env)
    const quizAccessS1 = synced1.env.o
    const entryFeePaymentS1Temp = synced1.env.p

    // ownership swaps
    expect(quizAccessS1._owners).deep.eq([student1PubKey])
    expect(entryFeePaymentS1Temp._owners).deep.eq([teacherPubKey])

    // access token still amount 1 (not used yet)
    expect(quizAccessS1.quizId).to.equal(quizId)
    expect(quizAccessS1.amount).to.equal(1n)

    // rev changed because state changed (owner changed)
    expect(quizAccessS1._rev).to.be.a('string')
    expect(quizAccessS1._rev).to.not.equal(access1RevBefore)

    quizAccessTokenS1 = quizAccessS1
    entryFeePaymentS1 = entryFeePaymentS1Temp

    console.log(`✅ Student 1 purchase complete: access->student, payment->teacher`)

    // ---------- Student 2 ----------
    console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

    const access2 = await quizAccessHelper.createQuizAccess(quizId, 1n)
    expect(access2._owners).deep.equal([teacherPubKey])
    expect(access2.amount).to.equal(1n)

    const mock2 = new PaymentMock(await quiz.entryFee)
    const { tx: offerTx2 } = await quizAccessSaleHelper.createOfferTx(access2, mock2)

    // offer shape asserts
    expect(offerTx2.ins).to.have.lengthOf(2)
    expect(offerTx2.ins[0].script.length).to.be.greaterThan(0)
    expect(offerTx2.ins[1].script.length).to.equal(0)

    const studentSaleHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
    expect(await studentSaleHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

    const entryPay2 = await student2Computer.new(Payment, [await quiz.entryFee])
    expect(entryPay2._owners).deep.equal([student2PubKey])
    expect(entryPay2._satoshis).to.equal(await quiz.entryFee)

    const s2Script = student2Computer.toScriptPubKey()
    if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')

    QuizAccessSaleHelper.finalizeOfferTx(offerTx2, entryPay2, s2Script)

    await student2Computer.fund(offerTx2)
    await student2Computer.sign(offerTx2)
    const txId2 = await student2Computer.broadcast(offerTx2)
    await mine(1)

    const synced2 = (await student2Computer.sync(txId2)) as SaleSyncResult
    const quizAccessS2 = synced2.env.o
    const entryFeePaymentS2Temp = synced2.env.p

    expect(quizAccessS2._owners).deep.eq([student2PubKey])
    expect(entryFeePaymentS2Temp._owners).deep.eq([teacherPubKey])
    expect(quizAccessS2.quizId).to.equal(quizId)
    expect(quizAccessS2.amount).to.equal(1n)

    quizAccessTokenS2 = quizAccessS2
    entryFeePaymentS2 = entryFeePaymentS2Temp

    await updateWalletBalances('afterEntryFees')

    console.log(`\n✅ SALE OFFER MECHANISM COMPLETED SUCCESSFULLY`)
    console.log('==============================================')
  })

  it('should allow students with access to attempt the quiz', async function () {
    console.log('\n🎯 QUIZ ATTEMPT PHASE')
    console.log('====================')
    
    await attempt1Helper.deploy()
    await attempt2Helper.deploy() // if your helper has deploy()

    const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
    await attempt1.submitAnswer(quizAccessTokenS1, 1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student1PubKey)
    const claimed1 = await quiz.claimReward(student1PubKey)

    const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
    await attempt2.submitAnswer(quizAccessTokenS2, 1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student2PubKey)
    const claimed2 = await quiz.claimReward(student2PubKey)

    expect(claimed1).to.equal(true)
    expect(claimed2).to.equal(false)
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    // Re-sync latest tokens to verify burn (amount -> 0n)
    const s1Latest = await student1Computer.getLatestRev(quizAccessTokenS1._id)
    const s2Latest = await student2Computer.getLatestRev(quizAccessTokenS2._id)

    quizAccessTokenS1 = (await student1Computer.sync(s1Latest)) as QuizAccess
    quizAccessTokenS2 = (await student2Computer.sync(s2Latest)) as QuizAccess

    expect(quizAccessTokenS1.amount).to.equal(0n)
    expect(quizAccessTokenS2.amount).to.equal(0n)

    //await mine(1)
    await updateWalletBalances('afterAttempts')

    // Student 1 claimed the reward, so record the full rewardEarned with paymentTxId
    const quizResult1: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student1PubKey,
      isCorrect: await attempt1.isCorrect,
      rewardEarned: await attempt1.rewardEarned,
      paymentTxId: await payment._id,
      timestamp: Date.now(),
    }

    // Student 2 answered correctly but didn't claim (claimed2 === false), so rewardEarned should be 0
    const quizResult2: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student2PubKey,
      isCorrect: await attempt2.isCorrect,
      rewardEarned: claimed2 ? await attempt2.rewardEarned : 0n,
      timestamp: Date.now(),
    }

    await leaderboardHelper.recordQuizResult(quizResult1)
    await leaderboardHelper.recordQuizResult(quizResult2)
  })

  it('should transfer payment to winner', async function () {
    await payment.transfer(student1PubKey)
    const owners = await payment._owners
    expect(owners[0]).to.equal(student1PubKey)

    await mine(1)
    await updateWalletBalances('afterTransfer')
  })

  it('should allow winner to withdraw payment', async function () {
    await mine(1)

    const student1PaymentHelper = new PaymentHelper(student1Computer)
    const withdrawnAmount = await student1PaymentHelper.withdrawPayment(payment)
    expect(withdrawnAmount).to.equal(999454n)

    //await mine(1)
    await updateWalletBalances('afterWithdrawal')
  })

  it('should verify teacher received entry fees', async function () {
    const owners1 = await entryFeePaymentS1._owners
    const owners2 = await entryFeePaymentS2._owners

    expect(owners1).deep.eq([teacherPubKey])
    expect(owners2).deep.eq([teacherPubKey])

    const totalEntryFees = (await entryFeePaymentS1._satoshis) + (await entryFeePaymentS2._satoshis)
    console.log(`\n💰 Total entry fees collected: ${totalEntryFees} sats`)

    const teacherBalance = await teacherComputer.getBalance()
    const teacherBalanceNum = Number(teacherBalance.confirmed || teacherBalance.balance)
    expect(teacherBalanceNum).to.be.greaterThan(100000000)
  })

  it('should verify leaderboard shows correct rewards and payment ownership', async function () {
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    const finalOwners = await payment._owners
    expect(finalOwners[0]).to.equal(student1PubKey)

    console.log('\n📈 LEADERBOARD:')
    const leaderboard = leaderboardHelper.getLeaderboard()
    if (leaderboard.length > 0) {
      leaderboard.forEach((student, index) => {
        console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
      })
    }
  })
})