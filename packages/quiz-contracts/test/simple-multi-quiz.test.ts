// import { Computer } from '@bitcoin-computer/lib'
// import { expect } from 'chai'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import { Payment } from '../src/payment.js'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { AttemptHelper } from '../src/helpers/attempt-helper.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'

// describe('Simple Multi-Quiz Test', function () {
//   this.timeout(300000)

//   const chain = 'LTC'
//   const network = 'regtest'
//   const url = 'http://localhost:1031'
//   const basePath = `m/44'/2'/0'/0`

//   let teacherComputer: Computer, student1Computer: Computer, student2Computer: Computer
//   let teacherHelper: TeacherHelper, student1Helper: StudentHelper, student2Helper: StudentHelper, attempt1Helper: AttemptHelper, attempt2Helper: AttemptHelper, paymentHelper: PaymentHelper
//   let teacher: Teacher
//   let student1: Student
//   let student2: Student
//   let quiz1: Quiz, quiz2: Quiz, payment1: Payment, payment2: Payment
//   let teacherPubKey: string, student1PubKey: string, student2PubKey: string

//   before(async function () {
//     teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
//     student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
//     student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

//     teacherPubKey = teacherComputer.getPublicKey()
//     student1PubKey = student1Computer.getPublicKey()
//     student2PubKey = student2Computer.getPublicKey()

//     teacherHelper = new TeacherHelper(teacherComputer)
//     student1Helper = new StudentHelper(student1Computer)
//     student2Helper = new StudentHelper(student2Computer)
//     attempt1Helper = new AttemptHelper(student1Computer)
//     attempt2Helper = new AttemptHelper(student2Computer)
//     paymentHelper = new PaymentHelper(teacherComputer)

//     if (network === 'regtest') {
//       await teacherComputer.faucet(1e8)
//       await student1Computer.faucet(1e8)
//       await student2Computer.faucet(1e8)
//     }

//     await paymentHelper.deploy()
//   })

//   it('should create teacher and students', async function () {
//     teacher = await teacherHelper.createTeacher('Professor', teacherPubKey)
//     student1 = await student1Helper.createStudent('Alice', student1PubKey)
//     student2 = await student2Helper.createStudent('Bob', student2PubKey)
//   })

//   it('should create two quizzes with payments', async function () {
//     // Quiz 1
//     const quiz1Data = {
//       title: 'Math Quiz',
//       questionText: 'What is 2+2?',
//       options: ['3', '4', '5', '6'],
//       correctAnswer: 1,
//       rewardAmount: 500000n,
//       teacher: teacher
//     }
//     const quiz1Result = await teacherHelper.createQuiz(quiz1Data)
//     quiz1 = quiz1Result.quiz
//     const paymentTxId1 = quiz1Result.paymentTxId
//     payment1 = await teacherComputer.sync(paymentTxId1) as Payment

//     // Add delay between quiz creations to avoid mempool conflicts
//     await new Promise(resolve => setTimeout(resolve, 10000));

//     // Quiz 2
//     const quiz2Data = {
//       title: 'Science Quiz',
//       questionText: 'What is H2O?',
//       options: ['Oxygen', 'Water', 'Hydrogen', 'Nitrogen'],
//       correctAnswer: 1,
//       rewardAmount: 750000n,
//       teacher: teacher
//     }
//     const quiz2Result = await teacherHelper.createQuiz(quiz2Data)
//     quiz2 = quiz2Result.quiz
//     const paymentTxId2 = quiz2Result.paymentTxId
//     payment2 = await teacherComputer.sync(paymentTxId2) as Payment

//     expect(await quiz1.title).to.equal('Math Quiz')
//     expect(await quiz2.title).to.equal('Science Quiz')
//     expect(await payment1._satoshis).to.equal(500000n)
//     expect(await payment2._satoshis).to.equal(750000n)
//   })

//   it('should allow student1 to answer both quizzes first', async function () {
//     const quiz1Id = await quiz1._id
//     const quiz2Id = await quiz2._id

//     // Student 1 answers Quiz 1 first
//     const attempt1Quiz1 = await attempt1Helper.createAttempt(quiz1Id, student1PubKey)
//     await attempt1Quiz1.submitAnswer(1, await quiz1.correctAnswer, await quiz1.rewardAmount)
//     await quiz1.addAttemptedStudent(student1PubKey)
//     const quiz1Claimed = await quiz1.claimReward(student1PubKey)

//     // Student 1 answers Quiz 2 first
//     const attempt1Quiz2 = await attempt1Helper.createAttempt(quiz2Id, student1PubKey)
//     await attempt1Quiz2.submitAnswer(1, await quiz2.correctAnswer, await quiz2.rewardAmount)
//     await quiz2.addAttemptedStudent(student1PubKey)
//     const quiz2Claimed = await quiz2.claimReward(student1PubKey)

//     expect(quiz1Claimed).to.equal(true)
//     expect(quiz2Claimed).to.equal(true)
//     expect(await quiz1.isClaimed).to.equal(true)
//     expect(await quiz2.isClaimed).to.equal(true)
//   })

//   it('should prevent student2 from claiming rewards (too late)', async function () {
//     const quiz1Id = await quiz1._id
//     const quiz2Id = await quiz2._id

//     // Student 2 tries to answer (too late)
//     const attempt2Quiz1 = await attempt2Helper.createAttempt(quiz1Id, student2PubKey)
//     await attempt2Quiz1.submitAnswer(1, await quiz1.correctAnswer, await quiz1.rewardAmount)
//     await quiz1.addAttemptedStudent(student2PubKey)
//     const quiz1Claimed = await quiz1.claimReward(student2PubKey)

//     const attempt2Quiz2 = await attempt2Helper.createAttempt(quiz2Id, student2PubKey)
//     await attempt2Quiz2.submitAnswer(1, await quiz2.correctAnswer, await quiz2.rewardAmount)
//     await quiz2.addAttemptedStudent(student2PubKey)
//     const quiz2Claimed = await quiz2.claimReward(student2PubKey)

//     expect(quiz1Claimed).to.equal(false)
//     expect(quiz2Claimed).to.equal(false)
//   })

//   it('should transfer payments to winner and allow withdrawal', async function () {
//     // Transfer payments to winner (student1)
//     await payment1.transfer(student1PubKey)
//     await payment2.transfer(student1PubKey)

//     const owners1 = await payment1._owners
//     const owners2 = await payment2._owners
//     expect(owners1[0]).to.equal(student1PubKey)
//     expect(owners2[0]).to.equal(student1PubKey)

//     // Withdraw payments
//     const student1PaymentHelper = new PaymentHelper(student1Computer)
//     const withdrawnAmount1 = await student1PaymentHelper.withdrawPayment(payment1)
//     const withdrawnAmount2 = await student1PaymentHelper.withdrawPayment(payment2)

//     expect(withdrawnAmount1).to.equal(499454n) // 500000 - 546
//     expect(withdrawnAmount2).to.equal(749454n) // 750000 - 546
//   })

//   it('should verify final states', async function () {
//     expect(await quiz1.isClaimed).to.equal(true)
//     expect(await quiz2.isClaimed).to.equal(true)
//     expect(await quiz1.claimedBy).to.equal(student1PubKey)
//     expect(await quiz2.claimedBy).to.equal(student1PubKey)
//   })
// })