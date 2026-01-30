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
    if (questions.length === 0) {
      throw new Error('Quiz must have at least one question')
    }

    if (rewardPerCorrect <= 0) {
      throw new Error('Reward must be greater than 0')
    }
  }

  getQuizCount() {
    return this.createdQuizzes.length
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

  canAttemptQuiz(quiz) {
    // Check if quiz exists and is active
    if (!quiz.isActive) {
      return false
    }

    // Check if student has already attempted this quiz
    if (quiz.hasStudentAttempted(this.publicKey)) {
      return false
    }

    return true
  }

  completeQuiz(quizId, earnedReward) {
    this.completedQuizzes.push(quizId)
    this.totalEarnings += BigInt(earnedReward)
  }

  getCompletedQuizCount() {
    return this.completedQuizzes.length
  }

  hasCompletedQuiz(quizId) {
    return this.completedQuizzes.includes(quizId)
  }
}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const quizMod = await deployWithRetry('Quiz', `
import { Contract } from '@bitcoin-computer/lib'

export class Quiz extends Contract {
  title
  description
  questionTexts
  questionOptions
  correctAnswers
  rewardPerCorrect
  totalReward
  teacherPublicKey
  isActive
  createdAt
  duration
  attemptedStudents
  attempts
  paymentTxIds
  questionRewardsClaimed

  constructor(params) {
    const questionTexts = params.questions.map(q => q.text)
    const questionOptions = params.questions.map(q => q.options)
    const correctAnswers = params.questions.map(q => q.correctAnswer)
    const totalReward = BigInt(params.questions.length) * BigInt(params.rewardPerCorrect)

    super({
      _owners: [params.teacherPublicKey],
      title: params.title,
      description: params.description,
      questionTexts,
      questionOptions,
      correctAnswers,
      rewardPerCorrect: params.rewardPerCorrect,
      totalReward,
      teacherPublicKey: params.teacherPublicKey,
      isActive: true,
      createdAt: Date.now(),
      duration: params.duration,
      attemptedStudents: [],
      attempts: [],
      paymentTxIds: params.paymentTxIds || [],
      questionRewardsClaimed: Array(params.questions.length).fill(false)
    })
  }

  addAttemptedStudent(studentPublicKey) {
    if (!this.attemptedStudents.includes(studentPublicKey)) {
      this.attemptedStudents.push(studentPublicKey)
    } else {
      throw new Error('Student has already attempted this quiz')
    }
  }

  deactivate() {
    this.isActive = false
  }

  hasStudentAttempted(studentPublicKey) {
    return this.attemptedStudents.includes(studentPublicKey)
  }

  isQuestionRewardClaimed(questionIndex) {
    if (questionIndex < 0 || questionIndex >= this.questionRewardsClaimed.length) {
      throw new Error('Invalid question index')
    }
    return this.questionRewardsClaimed[questionIndex]
  }

  claimQuestionReward(questionIndex, studentPublicKey) {
    if (questionIndex < 0 || questionIndex >= this.questionRewardsClaimed.length) {
      throw new Error('Invalid question index')
    }

    if (this.questionRewardsClaimed[questionIndex]) {
      return false // Already claimed by someone else
    }

    // Mark the question as claimed
    this.questionRewardsClaimed[questionIndex] = true
    return true
  }

  getPaymentTxIdForQuestion(questionIndex) {
    if (questionIndex < 0 || questionIndex >= this.paymentTxIds.length) {
      return undefined
    }
    return this.paymentTxIds[questionIndex]
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
  rewardEarned
  isCompleted
  questionRewardsClaimed

  constructor(quizId, studentPublicKey) {
    super({
      quizId,
      studentPublicKey,
      answers: [],
      score: 0,
      rewardEarned: 0n,
      isCompleted: false,
      questionRewardsClaimed: [] // Initialize as empty, will be filled when submitting answers
    })
  }

  submitAnswers(answers, correctAnswers, rewardPerCorrect) {
    if (this.answers.length > 0) {
      throw new Error('Quiz already submitted')
    }

    // Validate answers length
    if (answers.length !== correctAnswers.length) {
      throw new Error('Invalid number of answers')
    }

    this.answers = answers

    // Grade immediately - inline to reduce complexity
    let correctCount = 0
    this.questionRewardsClaimed = new Array(answers.length).fill(false) // Initialize tracking

    for (let i = 0; i < correctAnswers.length; i++) {
      if (answers[i] === correctAnswers[i]) {
        correctCount++
        this.questionRewardsClaimed[i] = true // Mark this question as answered correctly
      }
    }

    this.score = correctCount
    this.rewardEarned = BigInt(correctCount) * BigInt(rewardPerCorrect)
    this.isCompleted = true
  }
}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const paymentMod = await deployWithRetry('Payment', `
import { Contract } from '@bitcoin-computer/lib'

export class Payment extends Contract {
  _id
  _rev
  _root
  _satoshis
  _owners

  constructor(_satoshis) {
    super({ _satoshis })
  }

  transfer(to) {
    this._owners = [to]
  }

  setSatoshis(a) {
    this._satoshis = a
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