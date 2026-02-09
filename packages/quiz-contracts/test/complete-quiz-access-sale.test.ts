// import { Computer } from '@bitcoin-computer/lib'
// import { expect } from 'chai'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import { Payment, PaymentMock } from '../src/payment.js'
// import { QuizAccessHelper, QuizAccessSaleHelper } from '../src/index.js'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { AttemptHelper } from '../src/helpers/attempt-helper.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'
// import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'
// import { MineBlocks } from '../src/utils/mineblock.js'

// describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
//   this.timeout(300000)

//   const chain = 'LTC'
//   const network = 'regtest'
//   const url = 'http://localhost:1031'
//   const basePath = `m/44'/2'/0'/0`

//   let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
//   let teacherHelper: TeacherHelper,
//     student1Helper: StudentHelper,
//     student2Helper: StudentHelper,
//     attempt1Helper: AttemptHelper,
//     attempt2Helper: AttemptHelper,
//     paymentHelper: PaymentHelper,
//     leaderboardHelper: LeaderboardHelper

//   let teacher: Teacher, student1: Student, student2: Student
//   let quiz: Quiz, payment: Payment
//   let quizId: string
//   let teacherPubKey: string, student1PubKey: string, student2PubKey: string

//   let quizAccessHelper: QuizAccessHelper
//   let quizAccessSaleHelper: QuizAccessSaleHelper

//   let entryFeePaymentS1: Payment
//   let entryFeePaymentS2: Payment

//   // store access tokens for attempt enforcement
//   let quizAccessTokenS1: any
//   let quizAccessTokenS2: any

//   const walletBalances = {
//     teacher: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
//     student1: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
//     student2: { initial: 0, afterSetup: 0, afterQuizCreation: 0, afterEntryFees: 0, afterAttempts: 0, afterTransfer: 0, afterWithdrawal: 0 },
//   }

//   async function updateWalletBalances(stage: keyof typeof walletBalances.teacher) {
//     const teacherBal = await teacherComputer.getBalance()
//     const student1Bal = await student1Computer.getBalance()
//     const student2Bal = await student2Computer.getBalance()

//     walletBalances.teacher[stage] = Number(teacherBal.confirmed || teacherBal.balance)
//     walletBalances.student1[stage] = Number(student1Bal.confirmed || student1Bal.balance)
//     walletBalances.student2[stage] = Number(student2Bal.confirmed || student2Bal.balance)
//   }

//   // ✅ Mine blocks (to node wallet) only on regtest
//   const mine = async (blocks = 1) => {
//     if (network === 'regtest') {
//       await MineBlocks.mine(url, chain, network, blocks)
//       console.log(`⛏️  Mining..`)
//     }
//   }

//   before(async function () {
//     teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
//     student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
//     student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

//     teacherPubKey = teacherComputer.getPublicKey()
//     student1PubKey = student1Computer.getPublicKey()
//     student2PubKey = student2Computer.getPublicKey()

//     if (network === 'regtest') {
//       await teacherComputer.faucet(2e8)
//       await student1Computer.faucet(2e8)
//       await student2Computer.faucet(2e8)

//       await updateWalletBalances('initial')
//       // confirm faucet txs without polluting wallets with coinbase
//       await mine(1)
//     }

//     teacherHelper = new TeacherHelper(teacherComputer)
//     student1Helper = new StudentHelper(student1Computer)
//     student2Helper = new StudentHelper(student2Computer)
//     attempt1Helper = new AttemptHelper(student1Computer)
//     attempt2Helper = new AttemptHelper(student2Computer)
//     paymentHelper = new PaymentHelper(teacherComputer)
//     leaderboardHelper = new LeaderboardHelper(teacherComputer)

//     quizAccessHelper = new QuizAccessHelper(teacherComputer)
//     await quizAccessHelper.deploy()
//     await mine(1)

//     quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
//     await quizAccessSaleHelper.deploy()
//     await mine(1)

//     await paymentHelper.deploy()
//     await mine(1)

    
//     await updateWalletBalances('afterSetup')
//   })

//   it('should create teacher and students', async function () {
//     teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
//     student1 = await student1Helper.createStudent('Alice', student1PubKey)
//     student2 = await student2Helper.createStudent('Bob', student2PubKey)

//     expect(await student1.name).to.equal('Alice')
//     expect(await student2.name).to.equal('Bob')

//     await mine(1)
//   })

//   it('should create quiz with payment', async function () {
//     const quizData = {
//       title: 'Math Quiz',
//       questionText: 'What is 2+2?',
//       options: ['3', '4', '5', '6'],
//       correctAnswer: 1,
//       rewardAmount: 1000000n,
//       entryFee: 50000n,
//       teacher: teacher,
//     }

//     const quizResult = await teacherHelper.createQuiz(quizData)
//     quiz = quizResult.quiz
//     quizId = await quiz._id
//     const paymentTxId = quizResult.paymentTxId
//     payment = (await teacherComputer.sync(paymentTxId)) as Payment

//     expect(await quiz.title).to.equal('Math Quiz')
//     expect(await payment._satoshis).to.equal(1000000n)
//     expect(await quiz.entryFee).to.equal(50000n)

//     await mine(1)
//     await updateWalletBalances('afterQuizCreation')
//   })

//   it('should allow students to purchase access to the quiz (SALE OFFERS)', async function () {
//     console.log('\n🧾 SALE OFFER MECHANISM INITIATED')
//     console.log('==================================')

//     // Student 1
//     console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

//     const quizAccess1 = await quizAccessHelper.createQuizAccess(quizId)
//     console.log(`📋 Access token minted: ${await quizAccess1._id}`)

//     const mock1 = new PaymentMock(await quiz.entryFee)
//     const { tx: offerTx1 } = await quizAccessSaleHelper.createOfferTx(quizAccess1, mock1)
//     console.log(`📝 Offer tx created (partially signed): ${offerTx1.getId()}`)

//     const studentSaleHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
//     expect(await studentSaleHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

//     const entryFeePayment1 = await student1Computer.new(Payment, [await quiz.entryFee])

//     const s1Script = student1Computer.toScriptPubKey()
//     if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')

//     QuizAccessSaleHelper.finalizeOfferTx(offerTx1, entryFeePayment1, s1Script)

//     await student1Computer.fund(offerTx1)
//     await student1Computer.sign(offerTx1)
//     const txId1 = await student1Computer.broadcast(offerTx1)
//     await mine(1)

//     const {
//       env: { o: quizAccessS1, p: entryFeePaymentS1_temp },
//     } = (await student1Computer.sync(txId1)) as { env: { o: any; p: any } }

//     expect(quizAccessS1._owners).deep.eq([student1PubKey])
//     expect(entryFeePaymentS1_temp._owners).deep.eq([teacherPubKey])

//     quizAccessTokenS1 = quizAccessS1
//     entryFeePaymentS1 = entryFeePaymentS1_temp

//     console.log(`✅ Student 1 purchase complete: access->student, payment->teacher`)

//     // Student 2
//     console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

//     const quizAccess2 = await quizAccessHelper.createQuizAccess(quizId)
//     console.log(`📋 Access token minted: ${await quizAccess2._id}`)

//     const mock2 = new PaymentMock(await quiz.entryFee)
//     const { tx: offerTx2 } = await quizAccessSaleHelper.createOfferTx(quizAccess2, mock2)
//     console.log(`📝 Offer tx created (partially signed): ${offerTx2.getId()}`)

//     const studentSaleHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
//     expect(await studentSaleHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

//     const entryFeePayment2 = await student2Computer.new(Payment, [await quiz.entryFee])

//     const s2Script = student2Computer.toScriptPubKey()
//     if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')

//     QuizAccessSaleHelper.finalizeOfferTx(offerTx2, entryFeePayment2, s2Script)

//     await student2Computer.fund(offerTx2)
//     await student2Computer.sign(offerTx2)
//     const txId2 = await student2Computer.broadcast(offerTx2)
//     await mine(1)

//     const {
//       env: { o: quizAccessS2, p: entryFeePaymentS2_temp },
//     } = (await student2Computer.sync(txId2)) as { env: { o: any; p: any } }

//     expect(quizAccessS2._owners).deep.eq([student2PubKey])
//     expect(entryFeePaymentS2_temp._owners).deep.eq([teacherPubKey])

//     quizAccessTokenS2 = quizAccessS2
//     entryFeePaymentS2 = entryFeePaymentS2_temp

//     console.log(`✅ Student 2 purchase complete: access->student, payment->teacher`)

//     await updateWalletBalances('afterEntryFees')

//     console.log(`\n✅ SALE OFFER MECHANISM COMPLETED SUCCESSFULLY`)
//     console.log('==============================================')
//   })

//   it('should allow students with access to attempt the quiz', async function () {
//     console.log('\n🎯 QUIZ ATTEMPT PHASE')
//     console.log('====================')

//     console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) attempting quiz first>`)
//     const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
//     await attempt1.submitAnswer(quizAccessTokenS1, 1, await quiz.correctAnswer, await quiz.rewardAmount)
//     await quiz.addAttemptedStudent(student1PubKey)
//     const claimed1 = await quiz.claimReward(student1PubKey)

//     console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) attempting quiz second>`)
//     const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
//     await attempt2.submitAnswer(quizAccessTokenS2, 1, await quiz.correctAnswer, await quiz.rewardAmount)
//     await quiz.addAttemptedStudent(student2PubKey)
//     const claimed2 = await quiz.claimReward(student2PubKey)

//     expect(claimed1).to.equal(true)
//     expect(claimed2).to.equal(false)
//     expect(await quiz.isClaimed).to.equal(true)
//     expect(await quiz.claimedBy).to.equal(student1PubKey)

//     // prove tokens are consumed
//     expect(await quizAccessTokenS1.used).to.equal(true)
//     expect(await quizAccessTokenS2.used).to.equal(true)

//     await mine(1)
//     await updateWalletBalances('afterAttempts')

//     const quizResult1: QuizResult = {
//       quizId: quizId,
//       quizTitle: await quiz.title,
//       studentPublicKey: student1PubKey,
//       isCorrect: await attempt1.isCorrect,
//       rewardEarned: await attempt1.rewardEarned,
//       paymentTxId: await payment._id,
//       timestamp: Date.now(),
//     }

//     const quizResult2: QuizResult = {
//       quizId: quizId,
//       quizTitle: await quiz.title,
//       studentPublicKey: student2PubKey,
//       isCorrect: await attempt2.isCorrect,
//       rewardEarned: await attempt2.rewardEarned,
//       timestamp: Date.now(),
//     }

//     await leaderboardHelper.recordQuizResult(quizResult1)
//     await leaderboardHelper.recordQuizResult(quizResult2)
//   })

//   it('should transfer payment to winner', async function () {
//     await payment.transfer(student1PubKey)
//     const owners = await payment._owners
//     expect(owners[0]).to.equal(student1PubKey)

//     await mine(1)
//     await updateWalletBalances('afterTransfer')
//   })

//   it('should allow winner to withdraw payment', async function () {
//     // confirm chain before withdraw (prevents too-long-mempool-chain)
//     await mine(1)

//     const student1PaymentHelper = new PaymentHelper(student1Computer)
//     const withdrawnAmount = await student1PaymentHelper.withdrawPayment(payment)
//     expect(withdrawnAmount).to.equal(999454n)

//     await mine(1)
//     await updateWalletBalances('afterWithdrawal')
//   })

//   it('should verify teacher received entry fees', async function () {
//     const owners1 = await entryFeePaymentS1._owners
//     const owners2 = await entryFeePaymentS2._owners

//     expect(owners1).deep.eq([teacherPubKey])
//     expect(owners2).deep.eq([teacherPubKey])

//     const totalEntryFees = (await entryFeePaymentS1._satoshis) + (await entryFeePaymentS2._satoshis)
//     console.log(`\n💰 Total entry fees collected: ${totalEntryFees} sats`)

//     const teacherBalance = await teacherComputer.getBalance()
//     const teacherBalanceNum = Number(teacherBalance.confirmed || teacherBalance.balance)
//     expect(teacherBalanceNum).to.be.greaterThan(100000000)
//   })

//   it('should verify leaderboard shows correct rewards and payment ownership', async function () {
//     expect(await quiz.isClaimed).to.equal(true)
//     expect(await quiz.claimedBy).to.equal(student1PubKey)

//     const finalOwners = await payment._owners
//     expect(finalOwners[0]).to.equal(student1PubKey)

//     console.log('\n📈 LEADERBOARD:')
//     const leaderboard = leaderboardHelper.getLeaderboard()
//     if (leaderboard.length > 0) {
//       leaderboard.forEach((student, index) => {
//         console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
//       })
//     }
//   })
// })

import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { Payment, PaymentMock } from '../src/payment.js'
import { QuizAccessHelper, QuizAccessSaleHelper } from '../src/index.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'
import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'
import { MineBlocks } from '../src/utils/mineblock.js'

describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
  this.timeout(300000)

  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
  let teacherHelper: TeacherHelper,
    student1Helper: StudentHelper,
    student2Helper: StudentHelper,
    attempt1Helper: AttemptHelper,
    attempt2Helper: AttemptHelper,
    paymentHelper: PaymentHelper,
    leaderboardHelper: LeaderboardHelper

  let teacher: Teacher, student1: Student, student2: Student
  let quiz: Quiz, payment: Payment
  let quizId: string
  let teacherPubKey: string, student1PubKey: string, student2PubKey: string

  let quizAccessHelper: QuizAccessHelper
  let quizAccessSaleHelper: QuizAccessSaleHelper

  let entryFeePaymentS1: Payment
  let entryFeePaymentS2: Payment

  let quizAccessTokenS1: any
  let quizAccessTokenS2: any

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

  // Mine ONLY when you withdraw payment objects (your request)
  const mine = async (blocks = 1) => {
    if (network === 'regtest') {
      await MineBlocks.mine(url, chain, network, blocks)
      console.log(`⛏️  Mined ${blocks} block(s)`)
    }
  }

  before(async function () {
    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
    student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    if (network === 'regtest') {
      await teacherComputer.faucet(2e8)
      await student1Computer.faucet(2e8)
      await student2Computer.faucet(2e8)
      await updateWalletBalances('initial')
      await new Promise((r) => setTimeout(r, 2000))
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

    await updateWalletBalances('afterSetup')
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')
  })

  it('should create quiz with payment (split into two steps)', async function () {
    const quizData = {
      title: 'Math Quiz',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      rewardAmount: 1000000n,
      entryFee: 50000n,
      teacher: teacher,
    }

    // Step 1: payment only (isolated)
    const { payment: rewardPayment, paymentTxId } = await teacherHelper.createQuizRewardPayment(quizData.rewardAmount)
    payment = rewardPayment

    // Step 2: quiz only (uses paymentTxId)
    quiz = await teacherHelper.createQuizWithPayment({ ...quizData, paymentTxId })

    quizId = await quiz._id

    expect(await quiz.title).to.equal('Math Quiz')
    expect(await payment._satoshis).to.equal(1000000n)
    expect(await quiz.entryFee).to.equal(50000n)
    expect(await quiz.paymentTxId).to.equal(paymentTxId)

    await updateWalletBalances('afterQuizCreation')
  })

  it('should allow students to purchase access to the quiz (SALE OFFERS)', async function () {
    console.log('\n🧾 SALE OFFER MECHANISM INITIATED')
    console.log('==================================')

    // Student 1
    console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

    const quizAccess1 = await quizAccessHelper.createQuizAccess(quizId)
    console.log(`📋 Access token minted: ${await quizAccess1._id}`)

    const mock1 = new PaymentMock(await quiz.entryFee)
    const { tx: offerTx1 } = await quizAccessSaleHelper.createOfferTx(quizAccess1, mock1)
    console.log(`📝 Offer tx created (partially signed): ${offerTx1.getId()}`)

    const studentSaleHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
    expect(await studentSaleHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

    const entryFeePayment1 = await student1Computer.new(Payment, [await quiz.entryFee])

    const s1Script = student1Computer.toScriptPubKey()
    if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')

    QuizAccessSaleHelper.finalizeOfferTx(offerTx1, entryFeePayment1, s1Script)

    await student1Computer.fund(offerTx1)
    await student1Computer.sign(offerTx1)
    const txId1 = await student1Computer.broadcast(offerTx1)

    const {
      env: { o: quizAccessS1, p: entryFeePaymentS1_temp },
    } = (await student1Computer.sync(txId1)) as { env: { o: any; p: any } }

    expect(quizAccessS1._owners).deep.eq([student1PubKey])
    expect(entryFeePaymentS1_temp._owners).deep.eq([teacherPubKey])

    quizAccessTokenS1 = quizAccessS1
    entryFeePaymentS1 = entryFeePaymentS1_temp

    console.log(`✅ Student 1 purchase complete: access->student, payment->teacher`)

    // Student 2
    console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

    const quizAccess2 = await quizAccessHelper.createQuizAccess(quizId)
    console.log(`📋 Access token minted: ${await quizAccess2._id}`)

    const mock2 = new PaymentMock(await quiz.entryFee)
    const { tx: offerTx2 } = await quizAccessSaleHelper.createOfferTx(quizAccess2, mock2)
    console.log(`📝 Offer tx created (partially signed): ${offerTx2.getId()}`)

    const studentSaleHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
    expect(await studentSaleHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

    const entryFeePayment2 = await student2Computer.new(Payment, [await quiz.entryFee])

    const s2Script = student2Computer.toScriptPubKey()
    if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')

    QuizAccessSaleHelper.finalizeOfferTx(offerTx2, entryFeePayment2, s2Script)

    await student2Computer.fund(offerTx2)
    await student2Computer.sign(offerTx2)
    const txId2 = await student2Computer.broadcast(offerTx2)

    const {
      env: { o: quizAccessS2, p: entryFeePaymentS2_temp },
    } = (await student2Computer.sync(txId2)) as { env: { o: any; p: any } }

    expect(quizAccessS2._owners).deep.eq([student2PubKey])
    expect(entryFeePaymentS2_temp._owners).deep.eq([teacherPubKey])

    quizAccessTokenS2 = quizAccessS2
    entryFeePaymentS2 = entryFeePaymentS2_temp

    console.log(`✅ Student 2 purchase complete: access->student, payment->teacher`)

    await updateWalletBalances('afterEntryFees')

    console.log(`\n✅ SALE OFFER MECHANISM COMPLETED SUCCESSFULLY`)
    console.log('==============================================')
  })

  it('should allow students with access to attempt the quiz', async function () {
    console.log('\n🎯 QUIZ ATTEMPT PHASE')
    console.log('====================')

    console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) attempting quiz first>`)
    const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
    await attempt1.submitAnswer(quizAccessTokenS1, 1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student1PubKey)
    const claimed1 = await quiz.claimReward(student1PubKey)

    console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) attempting quiz second>`)
    const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
    await attempt2.submitAnswer(quizAccessTokenS2, 1, await quiz.correctAnswer, await quiz.rewardAmount)
    await quiz.addAttemptedStudent(student2PubKey)
    const claimed2 = await quiz.claimReward(student2PubKey)

    expect(claimed1).to.equal(true)
    expect(claimed2).to.equal(false)
    expect(await quiz.isClaimed).to.equal(true)
    expect(await quiz.claimedBy).to.equal(student1PubKey)

    expect(await quizAccessTokenS1.used).to.equal(true)
    expect(await quizAccessTokenS2.used).to.equal(true)

    await updateWalletBalances('afterAttempts')

    const quizResult1: QuizResult = {
      quizId: quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student1PubKey,
      isCorrect: await attempt1.isCorrect,
      rewardEarned: await attempt1.rewardEarned,
      paymentTxId: await payment._id,
      timestamp: Date.now(),
    }

    const quizResult2: QuizResult = {
      quizId: quizId,
      quizTitle: await quiz.title,
      studentPublicKey: student2PubKey,
      isCorrect: await attempt2.isCorrect,
      rewardEarned: await attempt2.rewardEarned,
      timestamp: Date.now(),
    }

    await leaderboardHelper.recordQuizResult(quizResult1)
    await leaderboardHelper.recordQuizResult(quizResult2)
  })

  it('should transfer payment to winner', async function () {
    await payment.transfer(student1PubKey)
    const owners = await payment._owners
    expect(owners[0]).to.equal(student1PubKey)

    await updateWalletBalances('afterTransfer')
  })

  it('should allow winner to withdraw payment', async function () {
    // mine only here (your requirement)
    await mine(1)

    const student1PaymentHelper = new PaymentHelper(student1Computer)
    const withdrawnAmount = await student1PaymentHelper.withdrawPayment(payment)
    expect(withdrawnAmount).to.equal(999454n)

    await mine(1)
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
    const leaderboard = await leaderboardHelper.getLeaderboard()
    if (leaderboard.length > 0) {
      leaderboard.forEach((student, index) => {
        console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
      })
    }
  })
})