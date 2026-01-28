import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher'
import { Student } from '../student'
import { Quiz } from '../quiz'
import { QuizAttempt } from '../attempt'
import { Payment } from '../payment'

export async function deployQuizContracts(computer: Computer, contractDirectory: string): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
}> {
  
  // Helper function to deploy with minimal retry logic
  const deployWithRetry = async (name: string, contractCode: string, retries = 2): Promise<string> => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(` - Deploying ${name} contract...`)
        const mod = await computer.deploy(contractCode)
        console.log(` ✅ ${name} deployed: ${mod.slice(0, 20)}...`)
        return mod
      } catch (error: any) {
        console.log(` ⚠️ ${name} deployment failed: ${error.message}`)
        
        if (i === retries - 1) {
          throw error
        }
        
        // Brief wait before retry
        console.log(` 🔄 Retrying ${name} deployment...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    throw new Error(`Failed to deploy ${name} after ${retries} attempts`)
  }

  console.log('\n📦 Starting contract deployment...')
  
  // Deploy modules with full source code including dependencies
  const teacherMod = await deployWithRetry('Teacher', `
import { Contract } from '@bitcoin-computer/lib'

export class Teacher extends Contract {
  name
  publicKey
  createdQuizzes
  registeredAt
  
  constructor(name, publicKey) {
    super({
      name,
      publicKey,
      createdQuizzes: [],
      registeredAt: Date.now()
    })
  }

  addQuiz(quizId) {
    this.createdQuizzes.push(quizId)
  }

  static validateQuizParams(questions, rewardPerCorrect) {
    if (!questions || questions.length === 0) {
      throw new Error('Quiz must have at least one question')
    }
    if (rewardPerCorrect <= 0) {
      throw new Error('Reward per correct answer must be positive')
    }
    questions.forEach((q, idx) => {
      if (!q.text || !q.text.trim()) {
        throw new Error(\`Question \${idx + 1} must have text\`)
      }
      if (!q.options || q.options.length < 2) {
        throw new Error(\`Question \${idx + 1} must have at least 2 options\`)
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        throw new Error(\`Question \${idx + 1} correct answer index is invalid\`)
      }
    })
  }
}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const studentMod = await deployWithRetry('Student', `
import { Contract } from '@bitcoin-computer/lib'

export class Student extends Contract {
  name
  publicKey
  completedQuizzes
  totalEarnings
  registeredAt
  
  constructor(name, publicKey) {
    super({
      name,
      publicKey,
      completedQuizzes: [],
      totalEarnings: 0n,
      registeredAt: Date.now()
    })
  }

  completeQuiz(quizId, earnings) {
    this.completedQuizzes.push(quizId)
    this.totalEarnings += BigInt(earnings)
  }
}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const quizMod = await deployWithRetry('Quiz', `
import { Contract } from '@bitcoin-computer/lib'

export class Quiz extends Contract {
  title
  description
  questions
  correctAnswers
  rewardPerCorrect
  teacherPublicKey
  isActive
  createdAt
  attemptedStudents
  duration
  paymentTxId
  
  constructor(params) {
    const correctAnswers = params.questions.map(q => q.correctAnswer)
    super({
      title: params.title,
      description: params.description,
      questions: params.questions,
      correctAnswers,
      rewardPerCorrect: params.rewardPerCorrect,
      teacherPublicKey: params.teacherPublicKey,
      isActive: true,
      createdAt: Date.now(),
      attemptedStudents: [],
      duration: params.duration || 300,
      paymentTxId: params.paymentTxId
    })
  }

  addAttemptedStudent(studentPublicKey) {
    if (!this.attemptedStudents.includes(studentPublicKey)) {
      this.attemptedStudents.push(studentPublicKey)
    }
  }

  deactivate() {
    this.isActive = false
  }
}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const attemptMod = await deployWithRetry('QuizAttempt', `
import { Contract } from '@bitcoin-computer/lib'

export class QuizAttempt extends Contract {
  quizId
  studentPublicKey
  answers
  score
  submittedAt
  rewardEarned
  
  constructor(quizId, studentPublicKey) {
    super({
      quizId,
      studentPublicKey,
      answers: [],
      score: 0,
      submittedAt: null,
      rewardEarned: 0n
    })
  }

  submitAnswers(answers, correctAnswers, rewardPerCorrect) {
    this.answers = answers
    this.submittedAt = Date.now()
    
    let correctCount = 0
    for (let i = 0; i < Math.min(answers.length, correctAnswers.length); i++) {
      if (answers[i] === correctAnswers[i]) {
        correctCount++
      }
    }
    
    this.score = correctCount
    this.rewardEarned = BigInt(correctCount) * BigInt(rewardPerCorrect)
  }
}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const paymentMod = await deployWithRetry('Payment', `
import { Contract } from '@bitcoin-computer/lib'

export class Payment extends Contract {
  constructor(amount) {
    super({}, amount)
  }
}`)

  return {
    teacherMod,
    studentMod,
    quizMod,
    attemptMod,
    paymentMod
  }
}