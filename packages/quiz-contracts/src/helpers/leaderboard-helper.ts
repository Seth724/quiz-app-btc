import { Computer } from '@bitcoin-computer/lib'
import { PaymentHelper } from './payment-helper.js'
import { PaymentType } from '../types/index.js'

export interface StudentReward {
  publicKey: string
  name?: string
  totalRewards: bigint
  claimedPayments: string[] // Payment transaction IDs
  rank: number
}

export interface QuizResult {
  quizId: string
  quizTitle: string
  studentPublicKey: string
  isCorrect: boolean
  rewardEarned: bigint
  paymentTxId?: string
  timestamp: number
}

export class LeaderboardHelper {
  computer: Computer
  paymentHelper: PaymentHelper

  // In-memory storage for tracking student rewards
  // In production, this would be stored in a database
  private studentRewards: Map<string, StudentReward> = new Map()
  private quizResults: QuizResult[] = []

  constructor(computer: Computer) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer)
  }

  // Record a quiz result for leaderboard tracking
  async recordQuizResult(result: QuizResult): Promise<void> {
    this.quizResults.push(result)

    // Update student reward only if they actually claimed the reward
    // A claimed reward requires: isCorrect AND rewardEarned > 0 AND paymentTxId provided
    if (result.isCorrect && result.rewardEarned > 0n && result.paymentTxId) {
      await this.addStudentReward(result.studentPublicKey, result.rewardEarned, result.paymentTxId)
    } else {
      // Student participated but didn't claim a reward (either wrong answer, 
      // or correct but didn't claim first, or reward was 0)
      // Still track them for participation statistics
      await this.ensureStudentExists(result.studentPublicKey)
    }
  }

  // Ensure a student exists in the rewards map (for tracking participants)
  async ensureStudentExists(studentPublicKey: string): Promise<void> {
    if (!this.studentRewards.has(studentPublicKey)) {
      const studentReward = {
        publicKey: studentPublicKey,
        totalRewards: 0n,
        claimedPayments: [],
        rank: 0
      }
      this.studentRewards.set(studentPublicKey, studentReward)
    }
  }

  // Add a reward to a student's total
  async addStudentReward(studentPublicKey: string, rewardAmount: bigint, paymentTxId: string): Promise<void> {
    let studentReward = this.studentRewards.get(studentPublicKey)

    if (!studentReward) {
      studentReward = {
        publicKey: studentPublicKey,
        totalRewards: 0n,
        claimedPayments: [],
        rank: 0
      }
    }

    studentReward.totalRewards += rewardAmount
    if (paymentTxId) {  // Only add to claimedPayments if paymentTxId is not empty
      studentReward.claimedPayments.push(paymentTxId)
    }

    this.studentRewards.set(studentPublicKey, studentReward)
  }

  // Get a student's current reward total
  getStudentRewards(studentPublicKey: string): StudentReward | null {
    return this.studentRewards.get(studentPublicKey) || null
  }

  // Get all quiz results for a student
  getStudentQuizHistory(studentPublicKey: string): QuizResult[] {
    return this.quizResults.filter(result => result.studentPublicKey === studentPublicKey)
  }

  // Calculate and return the current leaderboard
  getLeaderboard(): StudentReward[] {
    const leaderboard = Array.from(this.studentRewards.values())

    // Sort by total rewards (descending)
    leaderboard.sort((a, b) => Number(b.totalRewards - a.totalRewards))

    // Assign ranks
    leaderboard.forEach((student, index) => {
      student.rank = index + 1
    })

    return leaderboard
  }

  // Get top N students
  getTopStudents(n: number): StudentReward[] {
    const leaderboard = this.getLeaderboard()
    return leaderboard.slice(0, n)
  }

  // Verify payment ownership (checks if student actually owns the payment)
  async verifyPaymentOwnership(studentPublicKey: string, paymentTxId: string): Promise<boolean> {
    try {
      return await this.paymentHelper.isPaymentOwnedBy(paymentTxId, studentPublicKey)
    } catch (error) {
      console.error(`Error verifying payment ownership:`, error)
      return false
    }
  }

  // Audit all recorded payments to ensure they're still valid
  async auditStudentRewards(studentPublicKey: string): Promise<{ verified: bigint, invalid: bigint }> {
    const studentReward = this.getStudentRewards(studentPublicKey)
    if (!studentReward) {
      return { verified: 0n, invalid: 0n }
    }

    let verifiedAmount = 0n
    let invalidAmount = 0n

    for (const paymentTxId of studentReward.claimedPayments) {
      try {
        const isOwned = await this.verifyPaymentOwnership(studentPublicKey, paymentTxId)
        const paymentAmount = await this.paymentHelper.getPaymentAmount(paymentTxId)

        if (isOwned) {
          verifiedAmount += paymentAmount
        } else {
          invalidAmount += paymentAmount
        }
      } catch (error) {
        // Payment might not exist anymore
        console.warn(`Could not verify payment ${paymentTxId}:`, error)
      }
    }

    return { verified: verifiedAmount, invalid: invalidAmount }
  }

  // Display formatted leaderboard
  displayLeaderboard(limit: number = 10): void {
    const leaderboard = this.getTopStudents(limit)

    console.log('\n🏆 QUIZ LEADERBOARD 🏆')
    console.log('=' .repeat(50))

    if (leaderboard.length === 0) {
      console.log('No students have earned rewards yet.')
      return
    }

    leaderboard.forEach((student, index) => {
      const rank = index + 1
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  '
      const publicKeyShort = `${student.publicKey.substring(0, 8)}...${student.publicKey.substring(-8)}`
      const rewardsFormatted = Number(student.totalRewards).toLocaleString()

      console.log(`${medal} ${rank}. ${publicKeyShort} - ${rewardsFormatted} sats`)
      console.log(`     Claimed Payments: ${student.claimedPayments.length}`)

      if (rank <= 3) {
        console.log(`     Payment IDs: ${student.claimedPayments.map(id => id.substring(0, 8)).join(', ')}`)
      }
      console.log()
    })
  }

  // Get statistics
  getStatistics(): {
    totalStudents: number,
    totalRewardsDistributed: bigint,
    totalQuizzes: number,
    successRate: number
  } {
    const totalStudents = this.studentRewards.size
    let totalRewardsDistributed = 0n

    for (const student of this.studentRewards.values()) {
      totalRewardsDistributed += student.totalRewards
    }

    const totalQuizzes = this.quizResults.length
    const successfulQuizzes = this.quizResults.filter(result => result.isCorrect).length
    const successRate = totalQuizzes > 0 ? (successfulQuizzes / totalQuizzes) * 100 : 0

    return {
      totalStudents,
      totalRewardsDistributed,
      totalQuizzes,
      successRate
    }
  }

  // Clear all data (for testing)
  reset(): void {
    this.studentRewards.clear()
    this.quizResults = []
  }
}