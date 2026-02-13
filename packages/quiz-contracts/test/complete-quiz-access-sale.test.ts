import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'

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

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'),
  '../node/.env',
]
for (const envPath of envPaths) dotenv.config({ path: envPath })

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

if (!url || !chain || !network) {
  throw new Error('Missing BCN_URL / BCN_CHAIN / BCN_NETWORK in env')
}

const basePath = process.env.BCN_BASE_PATH || `m/44'/2'/0'/0`

type SaleSync = { env: { o: QuizAccess; p: Payment } }

describe('Comprehensive Quiz with Leaderboard (Sale offers for access, Fungible tokens)', function () {
  this.timeout(300000)

  let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let attempt1Helper: AttemptHelper
  let attempt2Helper: AttemptHelper
  let paymentHelper: PaymentHelper
  let leaderboardHelper: LeaderboardHelper

  let teacher: Teacher, student1: Student, student2: Student
  let quiz: Quiz
  let rewardPayment: Payment
  let quizId: string

  let teacherPubKey: string, student1PubKey: string, student2PubKey: string

  let quizAccessHelper: QuizAccessHelper
  let quizAccessSaleHelper: QuizAccessSaleHelper

  let entryFeePaymentS1: Payment
  let entryFeePaymentS2: Payment

  let quizAccessTokenS1: QuizAccess
  let quizAccessTokenS2: QuizAccess

  const mine = async (blocks: number = 1) => {
    if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
  }

  const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

  const syncOrMine = async <T>(computer: Computer, id: string): Promise<T> => {
    try {
      return (await computer.sync(id)) as unknown as T
    } catch {
      await mine(1)
      return (await computer.sync(id)) as unknown as T
    }
  }

  before(async function () {
    teacherComputer = new Computer({ url, chain, network, path: `${basePath}/0` })
    student1Computer = new Computer({ url, chain, network, path: `${basePath}/1` })
    student2Computer = new Computer({ url, chain, network, path: `${basePath}/2` })

    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    if (network === 'regtest') {
      await teacherComputer.faucet(2e8)
      await student1Computer.faucet(2e8)
      await student2Computer.faucet(2e8)
      await sleep(500)
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

    quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
    await quizAccessSaleHelper.deploy()

    await paymentHelper.deploy()
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')
  })

  it('should create reward payment then quiz (separate steps)', async function () {
    const quizData = {
      title: 'Math Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      entryFee: 50000n,
      teacher,
    }

    // STEP A: reward payment
    rewardPayment = await teacherHelper.createRewardPayment(quizData.rewardAmount)
    const paymentTxId = await rewardPayment._id

    expect(await rewardPayment._satoshis).to.equal(1000000n)
    expect(await rewardPayment._owners).deep.eq([teacherPubKey])

    // STEP B: quiz creation referencing paymentTxId
    quiz = await teacherHelper.createQuizOnly({
      ...quizData,
      paymentTxId,
    })

    quizId = await quiz._id

    expect(await quiz.title).to.equal('Math Quiz')
    expect(await quiz.entryFee).to.equal(50000n)
    expect(await quiz.paymentTxId).to.equal(paymentTxId)
  })

  it('should allow students to purchase access (SALE OFFERS) using fungible access token', async function () {
    console.log('\n🧾 SALE OFFER MECHANISM (FUNGIBLE ACCESS TOKENS)')
    console.log('===============================================')

    // ---------- Student 1 ----------
    console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

    // Teacher mints a 1-unit access token to themselves
    const access1 = await quizAccessHelper.createQuizAccess(quizId, 1n)
    expect(access1._owners).deep.eq([teacherPubKey])
    expect(access1.quizId).to.equal(quizId)
    expect(access1.amount).to.equal(1n)

    console.log('Teacher minted access token:', {
      id: access1._id,
      rev: access1._rev,
      quizId: access1.quizId,
      amount: access1.amount.toString(),
      owner: access1._owners[0].slice(0, 10) + '...',
    })

    // Teacher builds offer using PaymentMock(entryFee)
    const mock1 = new PaymentMock(await quiz.entryFee)
    const offer1 = await quizAccessSaleHelper.createOfferTx(access1, mock1)
    const offerTx1 = offer1.tx

    // Offer tx shape checks (partial signature)
    expect(offerTx1.ins).to.have.lengthOf(2)
    expect(offerTx1.ins[0].script.length).to.be.greaterThan(0)
    expect(offerTx1.ins[1].script.length).to.equal(0)
    expect(BigInt(offerTx1.outs[0].value)).to.equal(await quiz.entryFee)
    expect(BigInt(offerTx1.outs[1].value)).to.be.greaterThan(0)

    console.log('Offer tx (teacher created, before student finalizes):', {
      id: offerTx1.getId(),
      out0Value: offerTx1.outs[0].value,
      out1Value: offerTx1.outs[1].value,
    })

    // Student checks offer
    const sHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
    expect(await sHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

    // Student creates real payment + finalizes + signs + broadcasts
    const pay1 = await student1Computer.new(Payment, [await quiz.entryFee])
    const s1Script = student1Computer.toScriptPubKey()
    if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')
    QuizAccessSaleHelper.finalizeOfferTx(offerTx1, pay1, s1Script)

    await student1Computer.fund(offerTx1)
    await student1Computer.sign(offerTx1)
    const txId1 = await student1Computer.broadcast(offerTx1)

    const synced1 = await syncOrMine<SaleSync>(student1Computer, txId1)
    quizAccessTokenS1 = synced1.env.o
    entryFeePaymentS1 = synced1.env.p

    expect(quizAccessTokenS1._owners).deep.eq([student1PubKey])
    expect(entryFeePaymentS1._owners).deep.eq([teacherPubKey])
    expect(quizAccessTokenS1.amount).to.equal(1n)

    console.log('After broadcast (Student 1):', {
      accessOwner: quizAccessTokenS1._owners[0].slice(0, 10) + '...',
      accessAmount: quizAccessTokenS1.amount.toString(),
      paymentOwner: entryFeePaymentS1._owners[0].slice(0, 10) + '...',
      paymentSats: entryFeePaymentS1._satoshis.toString(),
    })

    // ---------- Student 2 ----------
    console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

    const access2 = await quizAccessHelper.createQuizAccess(quizId, 1n)
    expect(access2._owners).deep.eq([teacherPubKey])
    expect(access2.quizId).to.equal(quizId)
    expect(access2.amount).to.equal(1n)

    const mock2 = new PaymentMock(await quiz.entryFee)
    const offer2 = await quizAccessSaleHelper.createOfferTx(access2, mock2)
    const offerTx2 = offer2.tx

    const sHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
    expect(await sHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

    const pay2 = await student2Computer.new(Payment, [await quiz.entryFee])
    const s2Script = student2Computer.toScriptPubKey()
    if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')
    QuizAccessSaleHelper.finalizeOfferTx(offerTx2, pay2, s2Script)

    await student2Computer.fund(offerTx2)
    await student2Computer.sign(offerTx2)
    const txId2 = await student2Computer.broadcast(offerTx2)

    const synced2 = await syncOrMine<SaleSync>(student2Computer, txId2)
    quizAccessTokenS2 = synced2.env.o
    entryFeePaymentS2 = synced2.env.p

    expect(quizAccessTokenS2._owners).deep.eq([student2PubKey])
    expect(entryFeePaymentS2._owners).deep.eq([teacherPubKey])
    expect(quizAccessTokenS2.amount).to.equal(1n)

    console.log('After broadcast (Student 2):', {
      accessOwner: quizAccessTokenS2._owners[0].slice(0, 10) + '...',
      accessAmount: quizAccessTokenS2.amount.toString(),
      paymentOwner: entryFeePaymentS2._owners[0].slice(0, 10) + '...',
      paymentSats: entryFeePaymentS2._satoshis.toString(),
    })
  })

  it('should allow students with access to attempt the quiz (burn access unit)', async function () {
    console.log('\n🎯 QUIZ ATTEMPT PHASE (burn 1 access unit)')
    console.log('=========================================')

    // keep revs so we can prove they changed after burn
    const s1AccessRevBefore = quizAccessTokenS1._rev
    const s2AccessRevBefore = quizAccessTokenS2._rev

    await mine(1) 
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

    // re-sync latest access token revisions and assert amount burned to 0
    const s1LatestRev = await student1Computer.getLatestRev(quizAccessTokenS1._id)
    const s2LatestRev = await student2Computer.getLatestRev(quizAccessTokenS2._id)

    expect(s1LatestRev).to.not.equal(s1AccessRevBefore)
    expect(s2LatestRev).to.not.equal(s2AccessRevBefore)

    quizAccessTokenS1 = (await student1Computer.sync(s1LatestRev)) as unknown as QuizAccess
    quizAccessTokenS2 = (await student2Computer.sync(s2LatestRev)) as unknown as QuizAccess

    expect(quizAccessTokenS1.amount).to.equal(0n)
    expect(quizAccessTokenS2.amount).to.equal(0n)

    console.log('Access burned:', {
      s1Amount: quizAccessTokenS1.amount.toString(),
      s2Amount: quizAccessTokenS2.amount.toString(),
    })

    const quizResult1: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student1PubKey,
      isCorrect: await attempt1.isCorrect,
      rewardEarned: await attempt1.rewardEarned,
      paymentTxId: await rewardPayment._id,
      timestamp: Date.now(),
    }

    const quizResult2: QuizResult = {
      quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student2PubKey,
      isCorrect: await attempt2.isCorrect,
      rewardEarned: await attempt2.rewardEarned,
      timestamp: Date.now(),
    }

    await leaderboardHelper.recordQuizResult(quizResult1)
    await leaderboardHelper.recordQuizResult(quizResult2)
  })

  it('should transfer reward payment to winner', async function () {
    await rewardPayment.transfer(student1PubKey)
    expect(await rewardPayment._owners).deep.eq([student1PubKey])
  })

  it('should allow winner to withdraw reward payment (mine only here)', async function () {
    await mine(1) // confirm previous chain to avoid too-long-mempool-chain

    const student1PaymentHelper = new PaymentHelper(student1Computer)
    const withdrawnAmount = await student1PaymentHelper.withdrawPayment(rewardPayment)
    expect(withdrawnAmount).to.equal(999454n)
  })

  
  it('should allow teacher to withdraw entry fees (real withdrawal)', async function () {
    await mine(1) // confirm chain before teacher withdrawals
    console.log('Before w1:', await teacherComputer.getBalance())
const w1 = await paymentHelper.withdrawPayment(entryFeePaymentS1)
console.log('After w1:', await teacherComputer.getBalance())

await mine(1)
console.log('After mine:', await teacherComputer.getBalance())

const w2 = await paymentHelper.withdrawPayment(entryFeePaymentS2)
console.log('After w2:', await teacherComputer.getBalance())

await mine(1)
console.log('After mine 2:', await teacherComputer.getBalance())

    // entryFee 50000n => 50000 - 546 = 49454
    expect(w1).to.equal(49454n)
    expect(w2).to.equal(49454n)
    console.log('Teacher withdrew entry fees:', { w1, w2 })
    console.log('Teacher balance:',await teacherComputer.getBalance())
  })

  it('should verify leaderboard and ownerships', async function () {
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    const leaderboard = leaderboardHelper.getLeaderboard()
    expect(leaderboard.length).to.be.greaterThan(0)

    console.log('\n📈 LEADERBOARD:')
    leaderboard.forEach((s, i) => {
      console.log(`${i + 1}. ${s.publicKey.substring(0, 10)}... - ${s.totalRewards} sats`)
    })
  })
})