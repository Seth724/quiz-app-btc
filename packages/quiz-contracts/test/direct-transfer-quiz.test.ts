import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { TeacherHelper } from '../src/helpers/teacher-helper.js'
import { StudentHelper } from '../src/helpers/student-helper.js'
import { AttemptHelper } from '../src/helpers/attempt-helper.js'

describe('Direct Transfer Quiz Workflow', function () {
  this.timeout(600000) // 10 minute timeout

  // Configuration
  const chain = 'LTC'
  const network = 'regtest'
  const url = 'http://localhost:1031'
  const basePath = `m/44'/2'/0'/0`

  // Computers and helpers
  let teacherComputer: Computer
  let student1Computer: Computer
  let student2Computer: Computer
  let teacherHelper: TeacherHelper
  let student1Helper: StudentHelper
  let student2Helper: StudentHelper
  let attempt1Helper: AttemptHelper
  let attempt2Helper: AttemptHelper

  // Test objects
  let teacher: Teacher
  let student1: Student
  let student2: Student
  let quiz: Quiz
  let teacherPubKey: string
  let student1PubKey: string
  let student2PubKey: string

  // Wallet balance tracking
  const walletBalances = {
    teacher: { initial: 0, current: 0 },
    student1: { initial: 0, current: 0 },
    student2: { initial: 0, current: 0 }
  }

  // Helper function to get and log wallet balances
  async function updateWalletBalances(step: string) {
    const teacherBal = await teacherComputer.getBalance()
    const student1Bal = await student1Computer.getBalance()
    const student2Bal = await student2Computer.getBalance()
    
    walletBalances.teacher.current = Number(teacherBal.balance) || 0
    walletBalances.student1.current = Number(student1Bal.balance) || 0
    walletBalances.student2.current = Number(student2Bal.balance) || 0
    
    console.log(`\\n💰 Wallet Balances - ${step}:`)
    console.log(`   Teacher: ${walletBalances.teacher.current.toLocaleString()} sats`)
    console.log(`   Student1 (Bob): ${walletBalances.student1.current.toLocaleString()} sats`)
    console.log(`   Student2 (Charlie): ${walletBalances.student2.current.toLocaleString()} sats`)
  }

  before(async function () {
    console.log('\\n🚀 Setting up Direct Transfer Quiz Workflow')
    console.log('🎯 Testing: Direct satoshi transfers to quiz winners')

    // Initialize computers
    teacherComputer = new Computer({ chain, network, url, path: `${basePath}/0` })
    student1Computer = new Computer({ chain, network, url, path: `${basePath}/1` })
    student2Computer = new Computer({ chain, network, url, path: `${basePath}/2` })

    // Get public keys
    teacherPubKey = teacherComputer.getPublicKey()
    student1PubKey = student1Computer.getPublicKey()
    student2PubKey = student2Computer.getPublicKey()

    // Initialize helpers
    teacherHelper = new TeacherHelper(teacherComputer)
    student1Helper = new StudentHelper(student1Computer)
    student2Helper = new StudentHelper(student2Computer)
    attempt1Helper = new AttemptHelper(student1Computer)
    attempt2Helper = new AttemptHelper(student2Computer)

    // Fund wallets
    if (network === 'regtest') {
      console.log('💰 Funding wallets...')
      await teacherComputer.faucet(2e8) // Extra funds for rewards
      await student1Computer.faucet(1e8)
      await student2Computer.faucet(1e8)
    }

    // Record initial balances
    await updateWalletBalances('Initial Setup')
    walletBalances.teacher.initial = walletBalances.teacher.current
    walletBalances.student1.initial = walletBalances.student1.current
    walletBalances.student2.initial = walletBalances.student2.current

    console.log('✅ Setup complete')
  })

  describe('Direct Transfer Quiz Workflow', function () {
    it('should transfer satoshis directly to quiz winner', async function () {
      console.log('\\n🎯 Starting Direct Transfer Quiz Test')

      // === STEP 1: CREATE PARTICIPANTS ===
      console.log('\\n👥 STEP 1: Creating Participants')
      teacher = await teacherHelper.createTeacher('Professor Alice', teacherPubKey)
      student1 = await student1Helper.createStudent('Bob', student1PubKey)
      student2 = await student2Helper.createStudent('Charlie', student2PubKey)
      console.log('✅ All participants created')

      // === STEP 2: CREATE QUIZ (NO PAYMENT OBJECT) ===
      console.log('\\n📚 STEP 2: Creating Quiz Without Payment Object')
      const quizData = {
        title: 'Simple Math Quiz',
        questionText: 'What is 10 + 15?',
        options: ['20', '25', '30', '35'],
        correctAnswer: 1, // Answer: 25
        rewardAmount: 5000n, // 5000 satoshis reward
        teacher: teacher
      }

      // Create quiz without payment object (we'll handle rewards manually)
      quiz = await teacherHelper.createQuizOnly(quizData) // This method creates only quiz, no payment
      console.log(`✅ Quiz created: ${await quiz.title}`)
      console.log(`💰 Manual reward amount: ${quizData.rewardAmount} sats`)

      await updateWalletBalances('After Quiz Creation')

      // === STEP 3: STUDENTS ATTEMPT QUIZ ===
      console.log('\\n🎯 STEP 3: Students Attempt Quiz')
      
      const quizId = await quiz._id

      // Student1 attempts first
      console.log('\\n🏃‍♂️ Student1 (Bob) attempting...')
      const attempt1 = await attempt1Helper.createAttempt(quizId, student1PubKey)
      await attempt1.submitAnswer(1, await quiz.correctAnswer, quizData.rewardAmount)
      
      console.log(`✅ Bob answered: ${attempt1.selectedAnswer} (correct: ${await quiz.correctAnswer})`)
      const bob_correct = await attempt1.isCorrect
      console.log(`🎯 Bob's answer correct: ${bob_correct}`)

      // Student2 attempts second
      console.log('\\n🏃‍♂️ Student2 (Charlie) attempting...')
      const attempt2 = await attempt2Helper.createAttempt(quizId, student2PubKey)
      await attempt2.submitAnswer(1, await quiz.correctAnswer, quizData.rewardAmount)
      
      console.log(`✅ Charlie answered: ${attempt2.selectedAnswer} (correct: ${await quiz.correctAnswer})`)
      const charlie_correct = await attempt2.isCorrect
      console.log(`🎯 Charlie's answer correct: ${charlie_correct}`)

      await updateWalletBalances('After Quiz Attempts')

      // === STEP 4: DETERMINE WINNER AND TRANSFER REWARD ===
      console.log('\\n🏆 STEP 4: Determine Winner and Transfer Reward')

      // Check who answered first and correctly
      let winner = null
      let winnerAddress = null

      if (bob_correct) {
        // Bob wins (first correct answer)
        winner = 'Bob'
        winnerAddress = student1Computer.getAddress()
        
        // Mark quiz as claimed by Bob
        await quiz.addAttemptedStudent(student1PubKey)
        const claimed = await quiz.claimReward(student1PubKey)
        
        if (claimed) {
          console.log('🥇 Bob wins! (First correct answer)')
          console.log(`💰 Transferring ${quizData.rewardAmount} sats to Bob...`)
          
          // Teacher sends reward directly to Bob's wallet
          const rewardTxId = await teacherComputer.send(quizData.rewardAmount, winnerAddress)
          console.log(`✅ Direct transfer successful: ${rewardTxId}`)
          
          // Wait for transaction confirmation
          await new Promise(resolve => setTimeout(resolve, 5000))
          
        } else {
          console.log('❌ Bob cannot claim (quiz already claimed)')
        }
      }

      // Charlie tries to claim but should fail (Bob was first)
      if (charlie_correct) {
        console.log('\\n🏃‍♂️ Charlie tries to claim...')
        await quiz.addAttemptedStudent(student2PubKey)
        const charlie_claimed = await quiz.claimReward(student2PubKey)
        
        if (!charlie_claimed) {
          console.log('❌ Charlie cannot claim - Bob was first!')
        }
      }

      // === STEP 5: VERIFY RESULTS ===
      console.log('\\n✅ STEP 5: Verify Results')
      
      await updateWalletBalances('Final Results')
      
      const bobChange = walletBalances.student1.current - walletBalances.student1.initial
      const charlieChange = walletBalances.student2.current - walletBalances.student2.initial
      const teacherChange = walletBalances.teacher.current - walletBalances.teacher.initial
      
      console.log(`\\n💵 Final Balance Changes:`)
      console.log(`   Teacher change: ${teacherChange.toLocaleString()} sats`)
      console.log(`   Bob change: ${bobChange >= 0 ? '+' : ''}${bobChange.toLocaleString()} sats`)
      console.log(`   Charlie change: ${charlieChange >= 0 ? '+' : ''}${charlieChange.toLocaleString()} sats`)
      
      // Verify Bob has more than Charlie
      const difference = walletBalances.student1.current - walletBalances.student2.current
      console.log(`\\n🏆 Winner Verification:`)
      console.log(`   Bob: ${walletBalances.student1.current.toLocaleString()} sats`)
      console.log(`   Charlie: ${walletBalances.student2.current.toLocaleString()} sats`)
      console.log(`   Difference: ${difference >= 0 ? '+' : ''}${difference.toLocaleString()} sats`)
      
      if (difference > 0) {
        console.log(`✅ SUCCESS: Bob has more sats than Charlie (winner verified!)`)
      } else {
        console.log(`❌ PROBLEM: Bob should have more sats than Charlie`)
      }

      // Assertions
      expect(bob_correct).to.be.true
      expect(charlie_correct).to.be.true
      expect(difference).to.be.greaterThan(0, 'Winner should have more sats than non-winner')
      expect(bobChange).to.be.greaterThan(charlieChange, 'Winner should have gained more than non-winner')

      console.log('\\n🎉 Direct Transfer Quiz Test Successful!')
      console.log('🏆 Bob correctly received more satoshis for winning!')
    })
  })

  after(async function () {
    console.log('\\n🏁 Direct Transfer Quiz Tests Completed!')
  })
})