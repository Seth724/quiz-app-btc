// import { expect } from 'chai'
// import { Computer } from '@bitcoin-computer/lib'
// import dotenv from 'dotenv'
// import path from 'path'

// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import { Payment, PaymentMock } from '../src/payment.js'
// import { QuizAccess } from '../src/quiz-access.js'

// import { QuizAccessHelper, QuizAccessSaleHelper } from '../src/index.js'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { AttemptHelper } from '../src/helpers/attempt-helper.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'
// import { LeaderboardHelper, QuizResult } from '../src/helpers/leaderboard-helper.js'
// import { MineBlocks } from '../src/utils/mineblock.js'

// const envPaths = [
//   path.resolve(process.cwd(), './packages/node/.env'),
//   '../node/.env',
// ]
// for (const envPath of envPaths) dotenv.config({ path: envPath })

// const url = process.env.BCN_URL
// const chain = process.env.BCN_CHAIN
// const network = process.env.BCN_NETWORK

// if (!url || !chain || !network) {
//   throw new Error('Missing BCN_URL / BCN_CHAIN / BCN_NETWORK in env')
// }

// const basePath = process.env.BCN_BASE_PATH || `m/44'/2'/0'/0`

// type SaleSync = { env: { o: QuizAccess; p: Payment } }

// describe('Comprehensive Quiz with Leaderboard (Sale offers for access, Fungible tokens)', function () {
//   this.timeout(300000)

//   let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
//   let teacherHelper: TeacherHelper
//   let student1Helper: StudentHelper
//   let student2Helper: StudentHelper
//   let attempt1Helper: AttemptHelper
//   let attempt2Helper: AttemptHelper
//   let paymentHelper: PaymentHelper
//   let leaderboardHelper: LeaderboardHelper

//   let teacher: Teacher, student1: Student, student2: Student
//   let quiz: Quiz
//   let rewardPayment: Payment
//   let quizId: string

//   let teacherPubKey: string, student1PubKey: string, student2PubKey: string

//   let quizAccessHelper: QuizAccessHelper
//   let quizAccessSaleHelper: QuizAccessSaleHelper

//   let entryFeePaymentS1: Payment
//   let entryFeePaymentS2: Payment

//   let quizAccessTokenS1: QuizAccess
//   let quizAccessTokenS2: QuizAccess

//   const mine = async (blocks: number = 1) => {
//     if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
//   }

//   const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

//   const syncOrMine = async <T>(computer: Computer, id: string): Promise<T> => {
//     try {
//       return (await computer.sync(id)) as unknown as T
//     } catch {
//       await mine(1)
//       return (await computer.sync(id)) as unknown as T
//     }
//   }

//   before(async function () {
//     teacherComputer = new Computer({ url, chain, network, path: `${basePath}/0` })
//     student1Computer = new Computer({ url, chain, network, path: `${basePath}/1` })
//     student2Computer = new Computer({ url, chain, network, path: `${basePath}/2` })

//     teacherPubKey = teacherComputer.getPublicKey()
//     student1PubKey = student1Computer.getPublicKey()
//     student2PubKey = student2Computer.getPublicKey()

//     if (network === 'regtest') {
//       await teacherComputer.faucet(2e8)
//       await student1Computer.faucet(2e8)
//       await student2Computer.faucet(2e8)
//       await sleep(500)
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

//     quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
//     await quizAccessSaleHelper.deploy()

//     await paymentHelper.deploy()
//   })

//   it('should create teacher and students', async function () {
//     teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
//     student1 = await student1Helper.createStudent('Alice', student1PubKey)
//     student2 = await student2Helper.createStudent('Bob', student2PubKey)

//     expect(await student1.name).to.equal('Alice')
//     expect(await student2.name).to.equal('Bob')
//   })

//   it('should create reward payment then quiz (separate steps)', async function () {
//     const quizData = {
//       title: 'Math Quiz',
//       questionText: 'What is 2+2?',
//       options: ['3', '4', '5', '6'],
//       correctAnswer: 1,
//       rewardAmount: 1000000n,
//       entryFee: 100000000n,
//       teacher,
//     }

//     // STEP A: reward payment
//     rewardPayment = await teacherHelper.createQuizWithPayment(quizData.rewardAmount)
//     const paymentTxId = await rewardPayment._id

//     expect(await rewardPayment._satoshis).to.equal(1000000n)
//     expect(await rewardPayment._owners).deep.eq([teacherPubKey])

//     // STEP B: quiz creation referencing paymentTxId
//     quiz = await teacherHelper.createQuizOnly({
//       ...quizData,
//       paymentTxId,
//     })

//     quizId = await quiz._id

//     expect(await quiz.title).to.equal('Math Quiz')
//     expect(await quiz.entryFee).to.equal(100000000n)
//     expect(await quiz.paymentTxId).to.equal(paymentTxId)
//   })

//   it('should allow students to purchase access (SALE OFFERS) using fungible access token', async function () {
//     console.log('\n🧾 SALE OFFER MECHANISM (FUNGIBLE ACCESS TOKENS)')
//     console.log('===============================================')

//     // ---------- Student 1 ----------
//     console.log(`\n<Student 1 (${student1PubKey.substring(0, 10)}...) accepting offer>`)

//     // Teacher mints a 1-unit access token to themselves
//     const access1 = await quizAccessHelper.createQuizAccess(quizId, 1n)
//     const teacherBalanceBefore = await teacherComputer.db.wallet.getBalance() // sync before broadcast to avoid mempool conflict
    
//     console.log('😊Teacher balance before offer broadcast:', teacherBalanceBefore)
//     expect(access1._owners).deep.eq([teacherPubKey])
//     expect(access1.quizId).to.equal(quizId)
//     expect(access1.amount).to.equal(1n)

//     console.log('Teacher minted access token:', {
//       id: access1._id,
//       rev: access1._rev,
//       quizId: access1.quizId,
//       amount: access1.amount.toString(),
//       owner: access1._owners[0].slice(0, 10) + '...',
//     })

//     // Teacher builds offer using PaymentMock(entryFee)
//     const mock1 = new PaymentMock(await quiz.entryFee)
//     const offer1 = await quizAccessSaleHelper.createOfferTx(access1, mock1)
//     const offerTx1 = offer1.tx

//     // Offer tx shape checks (partial signature)
//     expect(offerTx1.ins).to.have.lengthOf(2)
//     expect(offerTx1.ins[0].script.length).to.be.greaterThan(0)
//     expect(offerTx1.ins[1].script.length).to.equal(0)
//     expect(BigInt(offerTx1.outs[0].value)).to.equal(await quiz.entryFee)
//     expect(BigInt(offerTx1.outs[1].value)).to.be.greaterThan(0)

//     console.log('Offer tx (teacher created, before student finalizes):', {
//       id: offerTx1.getId(),
//       out0Value: offerTx1.outs[0].value,
//       out1Value: offerTx1.outs[1].value,
//     })

//     // Student checks offer
//     const sHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
//     expect(await sHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

//     // Student creates real payment + finalizes + signs + broadcasts
//     const pay1 = await student1Computer.new(Payment, [await quiz.entryFee])
//     const s1Script = student1Computer.toScriptPubKey()
//     if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')
//     QuizAccessSaleHelper.finalizeOfferTx(offerTx1, pay1, s1Script)

//     await student1Computer.fund(offerTx1)
//     await student1Computer.sign(offerTx1)
//     await sleep(1000) // avoid mempool conflicts
    
//     const txId1 = await student1Computer.broadcast(offerTx1)
//     await sleep(5000)
    

//     const synced1 = await syncOrMine<SaleSync>(student1Computer, txId1)
//     quizAccessTokenS1 = synced1.env.o
//     entryFeePaymentS1 = synced1.env.p
//     const teacherBalanceAfter = await teacherComputer.db.wallet.getBalance() // sync before balance check to avoid mempool conflict
//     console.log("❤️balance after broadcast:", teacherBalanceAfter)

//     expect(quizAccessTokenS1._owners).deep.eq([student1PubKey])
//     expect(entryFeePaymentS1._owners).deep.eq([teacherPubKey])
//     expect(quizAccessTokenS1.amount).to.equal(1n)

//     console.log('After broadcast (Student 1):', {
//       accessOwner: quizAccessTokenS1._owners[0].slice(0, 10) + '...',
//       accessAmount: quizAccessTokenS1.amount.toString(),
//       paymentOwner: entryFeePaymentS1._owners[0].slice(0, 10) + '...',
//       paymentSats: entryFeePaymentS1._satoshis.toString(),
//     })

//     // ---------- Student 2 ----------
//     console.log(`\n<Student 2 (${student2PubKey.substring(0, 10)}...) accepting offer>`)

//     const access2 = await quizAccessHelper.createQuizAccess(quizId, 1n)
//     expect(access2._owners).deep.eq([teacherPubKey])
//     expect(access2.quizId).to.equal(quizId)
//     expect(access2.amount).to.equal(1n)

//     const mock2 = new PaymentMock(await quiz.entryFee)
//     const offer2 = await quizAccessSaleHelper.createOfferTx(access2, mock2)
//     const offerTx2 = offer2.tx

//     const sHelper2 = new QuizAccessSaleHelper(student2Computer, quizAccessSaleHelper.mod)
//     expect(await sHelper2.checkOfferTx(offerTx2)).to.equal(await quiz.entryFee)

//     const pay2 = await student2Computer.new(Payment, [await quiz.entryFee])
//     const s2Script = student2Computer.toScriptPubKey()
//     if (!s2Script) throw new Error('student2Computer.toScriptPubKey() returned undefined')
//     QuizAccessSaleHelper.finalizeOfferTx(offerTx2, pay2, s2Script)

//     await student2Computer.fund(offerTx2)
//     await student2Computer.sign(offerTx2)
//     const txId2 = await student2Computer.broadcast(offerTx2)

//     const synced2 = await syncOrMine<SaleSync>(student2Computer, txId2)
//     quizAccessTokenS2 = synced2.env.o
//     entryFeePaymentS2 = synced2.env.p

//     expect(quizAccessTokenS2._owners).deep.eq([student2PubKey])
//     expect(entryFeePaymentS2._owners).deep.eq([teacherPubKey])
//     expect(quizAccessTokenS2.amount).to.equal(1n)

//     console.log('After broadcast (Student 2):', {
//       accessOwner: quizAccessTokenS2._owners[0].slice(0, 10) + '...',
//       accessAmount: quizAccessTokenS2.amount.toString(),
//       paymentOwner: entryFeePaymentS2._owners[0].slice(0, 10) + '...',
//       paymentSats: entryFeePaymentS2._satoshis.toString(),
//     })
//   })

//   it('should allow students with access to attempt the quiz (burn access unit)', async function () {
//     console.log('\n🎯 QUIZ ATTEMPT PHASE (burn 1 access unit)')
//     console.log('=========================================')

//     // keep revs so we can prove they changed after burn
//     const s1AccessRevBefore = quizAccessTokenS1._rev
//     const s2AccessRevBefore = quizAccessTokenS2._rev

//     await mine(1) 
//     const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
//     await attempt1.submitAnswer(quizAccessTokenS1, 1, await quiz.correctAnswer, await quiz.rewardAmount)
//     await quiz.addAttemptedStudent(student1PubKey)
//     const claimed1 = await quiz.claimReward(student1PubKey)

//     const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
//     await attempt2.submitAnswer(quizAccessTokenS2, 1, await quiz.correctAnswer, await quiz.rewardAmount)
//     await quiz.addAttemptedStudent(student2PubKey)
//     const claimed2 = await quiz.claimReward(student2PubKey)

//     expect(claimed1).to.equal(true)
//     expect(claimed2).to.equal(false)
//     expect(await quiz.isClaimed).to.equal(true)
//     expect(await quiz.claimedBy).to.equal(student1PubKey)

//     // re-sync latest access token revisions and assert amount burned to 0
//     const s1LatestRev = await student1Computer.getLatestRev(quizAccessTokenS1._id)
//     const s2LatestRev = await student2Computer.getLatestRev(quizAccessTokenS2._id)

//     expect(s1LatestRev).to.not.equal(s1AccessRevBefore)
//     expect(s2LatestRev).to.not.equal(s2AccessRevBefore)

//     quizAccessTokenS1 = (await student1Computer.sync(s1LatestRev)) as unknown as QuizAccess
//     quizAccessTokenS2 = (await student2Computer.sync(s2LatestRev)) as unknown as QuizAccess

//     expect(quizAccessTokenS1.amount).to.equal(0n)
//     expect(quizAccessTokenS2.amount).to.equal(0n)

//     console.log('Access burned:', {
//       s1Amount: quizAccessTokenS1.amount.toString(),
//       s2Amount: quizAccessTokenS2.amount.toString(),
//     })

//     const quizResult1: QuizResult = {
//       quizId,
//       quizTitle: await quiz.title,
//       studentPublicKey: student1PubKey,
//       isCorrect: await attempt1.isCorrect,
//       rewardEarned: await attempt1.rewardEarned,
//       paymentTxId: await rewardPayment._id,
//       timestamp: Date.now(),
//     }

//     const quizResult2: QuizResult = {
//       quizId,
//       quizTitle: await quiz.title,
//       studentPublicKey: student2PubKey,
//       isCorrect: await attempt2.isCorrect,
//       rewardEarned: await attempt2.rewardEarned,
//       timestamp: Date.now(),
//     }

//     await leaderboardHelper.recordQuizResult(quizResult1)
//     await leaderboardHelper.recordQuizResult(quizResult2)
//   })

//   it('should transfer reward payment to winner', async function () {
//     await rewardPayment.transfer(student1PubKey)
//     expect(await rewardPayment._owners).deep.eq([student1PubKey])
//   })

//   it('should allow winner to withdraw reward payment (mine only here)', async function () {
//     await mine(1) // confirm previous chain to avoid too-long-mempool-chain

//     const student1PaymentHelper = new PaymentHelper(student1Computer)
//     const withdrawnAmount = await student1PaymentHelper.withdrawPayment(rewardPayment)
//     expect(withdrawnAmount).to.equal(999454n)
//   })

  
//   it('should allow teacher to withdraw entry fees (real withdrawal)', async function () {
//     await mine(1) // confirm chain before teacher withdrawals
//     console.log('Before w1:', await teacherComputer.getBalance())
// const w1 = await paymentHelper.withdrawPayment(entryFeePaymentS1)
// console.log('After w1:', await teacherComputer.getBalance())

// await mine(1)
// console.log('After mine:', await teacherComputer.getBalance())

// const w2 = await paymentHelper.withdrawPayment(entryFeePaymentS2)
// console.log('After w2:', await teacherComputer.getBalance())

// await mine(1)
// console.log('After mine 2:', await teacherComputer.getBalance())

//     // entryFee 50000n => 50000 - 546 = 49454
//     //expect(w1).to.equal(49454n)
//     //expect(w2).to.equal(49454n)
//     console.log('Teacher withdrew entry fees:', { w1, w2 })
//     console.log('Teacher balance:',await teacherComputer.getBalance())
//   })

//   it('should verify leaderboard and ownerships', async function () {
//     expect(await quiz.isClaimed).to.equal(true)
//     expect(await quiz.claimedBy).to.equal(student1PubKey)

//     const leaderboard = leaderboardHelper.getLeaderboard()
//     expect(leaderboard.length).to.be.greaterThan(0)

//     console.log('\n📈 LEADERBOARD:')
//     leaderboard.forEach((s, i) => {
//       console.log(`${i + 1}. ${s.publicKey.substring(0, 10)}... - ${s.totalRewards} sats`)
//     })
//   })
// })

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
// import dotenv from 'dotenv'
// dotenv.config()

// describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
//   this.timeout(300000)

//   const chain = process.env.CHAIN || 'LTC'
//   const network = process.env.NETWORK || 'regtest'
//   const url = process.env.URL || 'http://localhost:3000'
//   const basePath = process.env.PATH || `m/44'/1'/0'/0`

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

//   const mine = async (blocks = 1) => {
//     if (network === 'regtest') {
//       await MineBlocks.mine(url, chain, network, blocks)
//       //console.log(`⛏️  Mining..`)
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

//     const quizAccess1 = await quizAccessHelper.createQuizAccess(quizId) // amount=1n
//     console.log(`📋 Access token minted: ${await quizAccess1._id}`)

//     const mock1 = new PaymentMock(await quiz.entryFee)
//     const { tx: offerTx1 } = await quizAccessSaleHelper.createOfferTx(quizAccess1, mock1)
//     console.log("swap objects in offerTx1.env:", offerTx1.env)
//     console.log(`📝 Offer tx created (partially signed): ${offerTx1}`)

//     console.log(offerTx1)

//     const studentSaleHelper1 = new QuizAccessSaleHelper(student1Computer, quizAccessSaleHelper.mod)
//     expect(await studentSaleHelper1.checkOfferTx(offerTx1)).to.equal(await quiz.entryFee)

//     const entryFeePayment1 = await student1Computer.new(Payment, [await quiz.entryFee])

//     const s1Script = student1Computer.toScriptPubKey()
//     if (!s1Script) throw new Error('student1Computer.toScriptPubKey() returned undefined')

//     QuizAccessSaleHelper.finalizeOfferTx(offerTx1, entryFeePayment1, s1Script)

//     console.log("swap objects in offerTx1.env:", offerTx1.env)

//     console.log(offerTx1)

//     await student1Computer.fund(offerTx1)
//     await student1Computer.sign(offerTx1)
//     console.log(offerTx1)
//     const txId1 = await student1Computer.broadcast(offerTx1)
//     console.log(offerTx1)
//     console.log("swap objects in offerTx1.env:", offerTx1.env)
//     await mine(1)

//     const {
//       env: { o: quizAccessS1, p: entryFeePaymentS1_temp },
//     } = (await student1Computer.sync(txId1)) as { env: { o: any; p: any } }

//     expect(quizAccessS1._owners).deep.eq([student1PubKey])
//     expect(entryFeePaymentS1_temp._owners).deep.eq([teacherPubKey])

//     // NEW: access token is fungible-bag style
//     expect(quizAccessS1.quizId).to.equal(quizId)
//     expect(quizAccessS1.amount).to.equal(1n)

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

//     expect(quizAccessS2.quizId).to.equal(quizId)
//     expect(quizAccessS2.amount).to.equal(1n)

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

//     // IMPORTANT: submitAnswer now takes (accessToken, selectedAnswer, correctAnswer, rewardAmount)
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

//     // NEW: tokens are "burned" (amount goes to 0n)
//     // Safer to re-sync latest state
//     const s1Latest = await student1Computer.getLatestRev(quizAccessTokenS1._id)
//     const s2Latest = await student2Computer.getLatestRev(quizAccessTokenS2._id)
//     quizAccessTokenS1 = await student1Computer.sync(s1Latest)
//     quizAccessTokenS2 = await student2Computer.sync(s2Latest)

//     expect(await quizAccessTokenS1.amount).to.equal(0n)
//     expect(await quizAccessTokenS2.amount).to.equal(0n)

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

// Type for sale transaction sync result
type SaleSyncResult = { env: { o: QuizAccess; p: Payment } }

// Load env like other monorepo tests
const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  path.resolve(process.cwd(), './.env'),
  '../node/.env',
]
for (const envPath of envPaths) dotenv.config({ path: envPath })

describe('Comprehensive Quiz with Leaderboard (Sale offers for access)', function () {
  this.timeout(300000)

  // Use BCN_* (same convention as the standard tests)
  const chain = process.env.BCN_CHAIN || 'LTC'
  const network = process.env.BCN_NETWORK || 'regtest'
  const url = process.env.BCN_URL || 'http://localhost:1031'
  const basePath = process.env.BCN_BASE_PATH || `m/44'/2'/0'/0`

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
    console.log('ENV:', { url, chain, network, basePath })

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
      await mine(1)
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
    await mine(1)

    quizAccessSaleHelper = new QuizAccessSaleHelper(teacherComputer)
    await quizAccessSaleHelper.deploy()
    await mine(1)

    await paymentHelper.deploy()
    await mine(1)

    await updateWalletBalances('afterSetup')
  })

  it('should create teacher and students', async function () {
    teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
    student1 = await student1Helper.createStudent('Alice', student1PubKey)
    student2 = await student2Helper.createStudent('Bob', student2PubKey)

    expect(await student1.name).to.equal('Alice')
    expect(await student2.name).to.equal('Bob')

    await mine(1)
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

    await mine(1)
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
    await mine(1)

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

    await mine(1)
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
    const leaderboard = leaderboardHelper.getLeaderboard()
    if (leaderboard.length > 0) {
      leaderboard.forEach((student, index) => {
        console.log(`${index + 1}. ${student.publicKey.substring(0, 10)}... - ${student.totalRewards} sats`)
      })
    }
  })
})