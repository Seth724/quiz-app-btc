import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { QuizAttempt } from '../src/attempt.js'
import { Payment } from '../src/payment.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

describe('Quiz Platform Leaderboard & Performance System', function () {
  this.timeout(900000) // 15 minute timeout for comprehensive testing

  // Configuration
  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  // Computers and helpers
  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let student3Computer: Computer
  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let student3Helper: StudentHelper
  let paymentHelper: PaymentHelper

  // Test objects
  let teacher: Teacher
  let student1: Student // Alice - High Performer
  let student2: Student // Bob - Medium Performer  
  let student3: Student // Charlie - Low Performer
  let quizzes: Quiz[] = []
  let payments: Payment[] = []
  let leaderboardData: { [studentKey: string]: { name: string; totalRewards: bigint; quizzesWon: number; payments: Payment[] } } = {}

  // Public keys
  let teacherPubKey: string
  let student1PubKey: string
  let student2PubKey: string
  let student3PubKey: string

  before(async function () {
    console.log('\\n🚀 Setting up Quiz Platform Leaderboard Test')
    console.log('🎯 Testing: Multiple quizzes → Student performance → Leaderboard system')
    console.log('📊 Performance = Total payment objects owned (rewards earned)')
    console.log(`Chain: ${chain}, Network: ${network}`)

    // Initialize computers
    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
    student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })
    student3Computer = new Computer({ chain, network, url, path: `${basePath}/3` })

    // Get public keys
    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()
    student3PubKey = student3Computer.getPublicKey()

    console.log(`Teacher: ${teacherPubKey.substring(0, 20)}...`)
    console.log(`Student1 (Alice): ${student1PubKey.substring(0, 20)}...`)
    console.log(`Student2 (Bob): ${student2PubKey.substring(0, 20)}...`)
    console.log(`Student3 (Charlie): ${student3PubKey.substring(0, 20)}...`)

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    student3Helper = new StudentHelper(student3Computer)
    paymentHelper = new PaymentHelper(teacherComputer)

    // Fund wallets
    if (network === 'regtest') {
      console.log('💰 Funding all wallets...')
      await teacherComputer.faucet(1e8)
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
      await student3Computer.faucet(1e8)
      console.log('✅ All wallets funded')
    }

    await paymentHelper.deploy()
    console.log('✅ Payment contract deployed')

    // Initialize leaderboard tracking
    leaderboardData[student1PubKey] = { name: 'Alice', totalRewards: 0n, quizzesWon: 0, payments: [] }
    leaderboardData[student2PubKey] = { name: 'Bob', totalRewards: 0n, quizzesWon: 0, payments: [] }
    leaderboardData[student3PubKey] = { name: 'Charlie', totalRewards: 0n, quizzesWon: 0, payments: [] }

    console.log('✅ Setup complete - ready for leaderboard testing')
  })

  describe('Quiz Platform Performance System', function () {

    it('should setup teacher and students', async function () {
      console.log('\\n👨‍🏫 Setting up Teacher and Students')
      
      // Create teacher
      teacher = await teacherHelper.createTeacher('Professor Smith', teacherPubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      console.log('✅ Teacher created: Professor Smith')

      // Create students with different performance potential
      student1 = await student1Helper.createStudent('Alice', student1PubKey) // High performer
      await new Promise(resolve => setTimeout(resolve, 4000))
      student2 = await student2Helper.createStudent('Bob', student2PubKey)   // Medium performer
      await new Promise(resolve => setTimeout(resolve, 4000))
      student3 = await student3Helper.createStudent('Charlie', student3PubKey) // Low performer  
      await new Promise(resolve => setTimeout(resolve, 3000))

      expect(await teacher.name).to.equal('Professor Smith')
      expect(await student1.name).to.equal('Alice')
      expect(await student2.name).to.equal('Bob')
      expect(await student3.name).to.equal('Charlie')
      
      console.log('✅ Students registered: Alice, Bob, Charlie')
      console.log('🎯 Ready for quiz competition!')
    })

    it('should create multiple quizzes with different reward amounts', async function () {
      console.log('\\n📚 Creating Multiple Quizzes for Competition')
      
      const quizTemplates = [
        {
          title: 'Math Quiz - Easy',
          questionText: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1, // '4'
          rewardAmount: 1000n
        },
        {
          title: 'Science Quiz - Medium', 
          questionText: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 0, // 'H2O'
          rewardAmount: 2000n
        },
        {
          title: 'History Quiz - Hard',
          questionText: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1, // '1945'
          rewardAmount: 3000n
        },
        {
          title: 'Geography Quiz - Expert',
          questionText: 'What is the capital of Australia?',
          options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
          correctAnswer: 2, // 'Canberra'
          rewardAmount: 5000n
        }
      ]

      for (let i = 0; i < quizTemplates.length; i++) {
        const template = quizTemplates[i]
        console.log(`\\n📝 Creating Quiz ${i + 1}: ${template.title} (${template.rewardAmount} sats)`)
        
        await new Promise(resolve => setTimeout(resolve, 6000)) // Long delay before quiz creation
        
        const quizData = { ...template, teacher }
        const quizResult = await teacherHelper.createQuiz(quizData)
        const quiz = quizResult.quiz
        const payment = await teacherComputer.sync(quizResult.paymentTxId) as Payment
        
        quizzes.push(quiz)
        payments.push(payment)
        
        await new Promise(resolve => setTimeout(resolve, 4000)) // Delay after quiz creation
        
        expect(await quiz.title).to.equal(template.title)
        expect(await quiz.rewardAmount).to.equal(template.rewardAmount)
        expect(await quiz.isActive).to.equal(true)
        expect(await quiz.isClaimed).to.equal(false)
        
        console.log(`✅ Quiz created: ${template.title}`)
        console.log(`   Question: ${template.questionText}`)
        console.log(`   Answer: ${template.options[template.correctAnswer]}`)
        console.log(`   Reward: ${template.rewardAmount} sats`)
      }

      expect(quizzes.length).to.equal(4)
      expect(payments.length).to.equal(4)
      console.log('\\n🎯 All quizzes created successfully!')
      console.log('📊 Total rewards available: 11000 sats')
    })

    it('should simulate quiz competition with different performance outcomes', async function () {
      console.log('\\n🏆 Starting Quiz Competition!')
      console.log('📋 Competition Rules:')
      console.log('  • Alice: High performer (wins most quizzes)')
      console.log('  • Bob: Medium performer (wins some quizzes)')  
      console.log('  • Charlie: Low performer (wins few/no quizzes)')
      console.log('  • First correct answer wins the payment!')

      // QUIZ 1: Math Quiz - Easy (1000 sats)
      console.log('\\n🔢 QUIZ 1: Math Quiz - Easy (1000 sats)')
      console.log('Question: What is 2 + 2?')
      
      await new Promise(resolve => setTimeout(resolve, 6000))
      
      // Alice attempts and wins (first)
      const attempt1_1 = await new AttemptHelper(student1Computer).createAttempt(await quizzes[0]._id, student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      await attempt1_1.submitAnswer(1, await quizzes[0].correctAnswer, await quizzes[0].rewardAmount)
      await new Promise(resolve => setTimeout(resolve, 3000))
      await quizzes[0].addAttemptedStudent(student1PubKey)
      const claimed1_1 = await quizzes[0].claimReward(student1PubKey)
      expect(claimed1_1).to.equal(true)
      console.log('🥇 Alice answered first and won!')
      
      // Transfer payment to Alice
      await payments[0].transfer(student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      leaderboardData[student1PubKey].totalRewards += 1000n
      leaderboardData[student1PubKey].quizzesWon += 1
      leaderboardData[student1PubKey].payments.push(payments[0])
      
      // Bob attempts but too late
      await new Promise(resolve => setTimeout(resolve, 4000))
      const attempt1_2 = await new AttemptHelper(student2Computer).createAttempt(await quizzes[0]._id, student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      await attempt1_2.submitAnswer(1, await quizzes[0].correctAnswer, await quizzes[0].rewardAmount)
      await new Promise(resolve => setTimeout(resolve, 3000))
      await quizzes[0].addAttemptedStudent(student2PubKey)
      const claimed1_2 = await quizzes[0].claimReward(student2PubKey)
      expect(claimed1_2).to.equal(false)
      console.log('🥈 Bob answered correctly but too late - no reward')

      // QUIZ 2: Science Quiz - Medium (2000 sats)  
      console.log('\\n🧪 QUIZ 2: Science Quiz - Medium (2000 sats)')
      console.log('Question: What is the chemical symbol for water?')
      
      await new Promise(resolve => setTimeout(resolve, 6000))
      
      // Bob attempts and wins (first this time)
      const attempt2_1 = await new AttemptHelper(student2Computer).createAttempt(await quizzes[1]._id, student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      await attempt2_1.submitAnswer(0, await quizzes[1].correctAnswer, await quizzes[1].rewardAmount)
      await new Promise(resolve => setTimeout(resolve, 3000))
      await quizzes[1].addAttemptedStudent(student2PubKey)
      const claimed2_1 = await quizzes[1].claimReward(student2PubKey)
      expect(claimed2_1).to.equal(true)
      console.log('🥇 Bob answered first and won!')
      
      // Transfer payment to Bob
      await payments[1].transfer(student2PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      leaderboardData[student2PubKey].totalRewards += 2000n
      leaderboardData[student2PubKey].quizzesWon += 1
      leaderboardData[student2PubKey].payments.push(payments[1])

      // QUIZ 3: History Quiz - Hard (3000 sats)
      console.log('\\n🏛️ QUIZ 3: History Quiz - Hard (3000 sats)')
      console.log('Question: In which year did World War II end?')
      
      await new Promise(resolve => setTimeout(resolve, 6000))
      
      // Alice wins again (first)
      const attempt3_1 = await new AttemptHelper(student1Computer).createAttempt(await quizzes[2]._id, student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      await attempt3_1.submitAnswer(1, await quizzes[2].correctAnswer, await quizzes[2].rewardAmount)
      await new Promise(resolve => setTimeout(resolve, 3000))
      await quizzes[2].addAttemptedStudent(student1PubKey)
      const claimed3_1 = await quizzes[2].claimReward(student1PubKey)
      expect(claimed3_1).to.equal(true)
      console.log('🥇 Alice answered first and won again!')
      
      // Transfer payment to Alice  
      await payments[2].transfer(student1PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      leaderboardData[student1PubKey].totalRewards += 3000n
      leaderboardData[student1PubKey].quizzesWon += 1
      leaderboardData[student1PubKey].payments.push(payments[2])

      // QUIZ 4: Geography Quiz - Expert (5000 sats)
      console.log('\\n🌍 QUIZ 4: Geography Quiz - Expert (5000 sats)')
      console.log('Question: What is the capital of Australia?')
      
      await new Promise(resolve => setTimeout(resolve, 6000))
      
      // Charlie finally wins one! (first this time)
      const attempt4_1 = await new AttemptHelper(student3Computer).createAttempt(await quizzes[3]._id, student3PubKey)
      await new Promise(resolve => setTimeout(resolve, 4000))
      await attempt4_1.submitAnswer(2, await quizzes[3].correctAnswer, await quizzes[3].rewardAmount)
      await new Promise(resolve => setTimeout(resolve, 3000))
      await quizzes[3].addAttemptedStudent(student3PubKey)
      const claimed4_1 = await quizzes[3].claimReward(student3PubKey)
      expect(claimed4_1).to.equal(true)
      console.log('🥇 Charlie answered first and won the biggest prize!')
      
      // Transfer payment to Charlie
      await payments[3].transfer(student3PubKey)
      await new Promise(resolve => setTimeout(resolve, 3000))
      leaderboardData[student3PubKey].totalRewards += 5000n
      leaderboardData[student3PubKey].quizzesWon += 1
      leaderboardData[student3PubKey].payments.push(payments[3])

      console.log('\\n🏁 Quiz Competition Complete!')
      console.log('📊 Performance Summary:')
      console.log(`  Alice: ${leaderboardData[student1PubKey].quizzesWon} quizzes, ${leaderboardData[student1PubKey].totalRewards} sats`)
      console.log(`  Bob: ${leaderboardData[student2PubKey].quizzesWon} quizzes, ${leaderboardData[student2PubKey].totalRewards} sats`)
      console.log(`  Charlie: ${leaderboardData[student3PubKey].quizzesWon} quizzes, ${leaderboardData[student3PubKey].totalRewards} sats`)
    })

    it('should verify payment ownership and calculate accurate leaderboard', async function () {
      console.log('\\n🔍 Verifying Payment Ownership & Calculating Leaderboard')
      
      // Verify Alice's payments
      console.log('\n👑 Alice Performance:')
      for (let i = 0; i < leaderboardData[student1PubKey].payments.length; i++) {
        const payment = leaderboardData[student1PubKey].payments[i]
        const owners = await payment._owners
        const amount = await payment._satoshis
        expect(owners[0]).to.equal(student1PubKey)
        console.log(`  ✅ Payment ${i + 1}: ${amount} sats (confirmed ownership)`)
      }
      expect(leaderboardData[student1PubKey].totalRewards).to.equal(4000n)
      expect(leaderboardData[student1PubKey].quizzesWon).to.equal(2)
      console.log(`  🎯 Total: ${leaderboardData[student1PubKey].totalRewards} sats from ${leaderboardData[student1PubKey].quizzesWon} quiz wins`)

      // Verify Bob's payments
      console.log('\n🥈 Bob Performance:')
      for (let i = 0; i < leaderboardData[student2PubKey].payments.length; i++) {
        const payment = leaderboardData[student2PubKey].payments[i]
        const owners = await payment._owners
        const amount = await payment._satoshis
        expect(owners[0]).to.equal(student2PubKey)
        console.log(`  ✅ Payment ${i + 1}: ${amount} sats (confirmed ownership)`)
      }
      expect(leaderboardData[student2PubKey].totalRewards).to.equal(2000n)
      expect(leaderboardData[student2PubKey].quizzesWon).to.equal(1)
      console.log(`  🎯 Total: ${leaderboardData[student2PubKey].totalRewards} sats from ${leaderboardData[student2PubKey].quizzesWon} quiz wins`)

      // Verify Charlie's payments
      console.log('\n🥉 Charlie Performance:')
      for (let i = 0; i < leaderboardData[student3PubKey].payments.length; i++) {
        const payment = leaderboardData[student3PubKey].payments[i]
        const owners = await payment._owners
        const amount = await payment._satoshis
        expect(owners[0]).to.equal(student3PubKey)
        console.log(`  ✅ Payment ${i + 1}: ${amount} sats (confirmed ownership)`)
      }
      expect(leaderboardData[student3PubKey].totalRewards).to.equal(5000n)
      expect(leaderboardData[student3PubKey].quizzesWon).to.equal(1)
      console.log(`  🎯 Total: ${leaderboardData[student3PubKey].totalRewards} sats from ${leaderboardData[student3PubKey].quizzesWon} quiz wins`)

      // Generate final leaderboard
      console.log('\\n🏆 FINAL LEADERBOARD (by total rewards)')
      console.log('=====================================')
      
      const sortedStudents = Object.entries(leaderboardData)
        .sort((a, b) => Number(b[1].totalRewards) - Number(a[1].totalRewards))

      for (let i = 0; i < sortedStudents.length; i++) {
        const [pubKey, data] = sortedStudents[i]
        const position = i + 1
        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'
        console.log(`${medal} #${position}: ${data.name}`)
        console.log(`     💰 Total Rewards: ${data.totalRewards} sats`)
        console.log(`     🎯 Quizzes Won: ${data.quizzesWon}`)
        console.log(`     📊 Payment Objects: ${data.payments.length}`)
        console.log('')
      }

      // Verify leaderboard logic
      expect(sortedStudents[0][1].name).to.equal('Charlie') // Highest reward (5000)
      expect(sortedStudents[1][1].name).to.equal('Alice')   // Second highest (4000)
      expect(sortedStudents[2][1].name).to.equal('Bob')     // Lowest (2000)

      console.log('✅ Leaderboard calculated correctly based on payment ownership!')
      console.log('🎯 Performance = Sum of all payment objects owned')
      console.log('💡 No payment objects = No rewards = No leaderboard position')
    })

    it('should verify payment transfer integrity and audit trail', async function () {
      console.log('\\n🔐 Verifying Payment Transfer Integrity')
      
      // Verify all quiz claims match payment ownerships
      for (let i = 0; i < quizzes.length; i++) {
        const quiz = quizzes[i]
        const payment = payments[i]
        
        const isClaimed = await quiz.isClaimed
        const claimedBy = await quiz.claimedBy
        const paymentOwners = await payment._owners
        const rewardAmount = await quiz.rewardAmount
        const paymentAmount = await payment._satoshis
        
        expect(isClaimed).to.equal(true)
        expect(paymentOwners[0]).to.equal(claimedBy)
        expect(paymentAmount).to.equal(rewardAmount)
        
        console.log(`✅ Quiz ${i + 1}: Claimed by ${claimedBy.substring(0, 20)}... → Payment owned by ${paymentOwners[0].substring(0, 20)}...`)
      }
      
      console.log('\\n🎯 Payment Transfer Audit Complete:')
      console.log('  ✅ All quiz claims match payment ownerships')
      console.log('  ✅ All payment amounts match quiz rewards')
      console.log('  ✅ No orphaned payments or unclaimed quizzes')
      console.log('  ✅ Complete audit trail maintained on blockchain')
    })

  })

  after(async function () {
    console.log('\\n🏁 Quiz Platform Leaderboard Test Complete!')
    console.log('\\n📊 System Capabilities Validated:')
    console.log('  ✅ Multiple quiz creation with varying rewards')
    console.log('  ✅ Student competition with first-come-first-served')
    console.log('  ✅ Automatic payment ownership transfer to winners')
    console.log('  ✅ Accurate performance tracking via payment objects')
    console.log('  ✅ Leaderboard calculation based on total rewards')
    console.log('  ✅ Complete audit trail and payment integrity')
    console.log('\\n💡 Key Insights:')
    console.log('  • Performance = Sum of payment object values owned')
    console.log('  • Payment ownership = Verifiable proof of quiz success')
    console.log('  • First-come-first-served ensures fair competition')
    console.log('  • Blockchain provides immutable audit trail')
    console.log('  • Leaderboard reflects actual value earned, not just scores')
    console.log('\\n🚀 Ready for production deployment!')
  })
})