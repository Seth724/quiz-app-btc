/**
 * Helper-based Student Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { StudentHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS } from '@/config/env'

export interface StudentDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  name: string
  publicKey: string
  attemptedQuizzes: string[]
  claimedRewards: bigint
  totalRewards: bigint
  createdAt: number
}

export class HelperStudentClient {
  private studentHelper: StudentHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module specs
    this.studentHelper = new StudentHelper(
      computer,
      undefined,
      MODULE_SPECS.studentMod,
      MODULE_SPECS.attemptMod
    )
    this.utils = new BlockchainUtils(computer)
  }

  async createStudent(name: string, publicKey: string): Promise<StudentDTO> {
    const student = await this.studentHelper.createStudent(name, publicKey)
    return {
      ...student,
      attemptedQuizzes: (student as any).attemptedQuizzes || [],
      claimedRewards: (student as any).claimedRewards || BigInt(0),
      totalRewards: (student as any).getTotalRewards?.() || BigInt(0),
      createdAt: Date.now(),
    } as StudentDTO
  }

  async getStudent(studentId: string): Promise<StudentDTO> {
    const student: any = await this.utils.syncOrMine(studentId)
    return {
      ...student,
      attemptedQuizzes: student.attemptedQuizzes || [],
      claimedRewards: student.claimedRewards || BigInt(0),
      totalRewards: student.getTotalRewards?.() || BigInt(0),
      createdAt: student.createdAt || Date.now(),
    } as StudentDTO
  }

  async getOrCreateStudent(name: string, publicKey: string): Promise<StudentDTO> {
    const studentIds = await this.computer.query({
      mod: MODULE_SPECS.studentMod,
      publicKey,
    })

    if (studentIds.length > 0) {
      return await this.getStudent(studentIds[0])
    }

    return await this.createStudent(name, publicKey)
  }

  async getTotalRewards(studentId: string): Promise<bigint> {
    return await this.studentHelper.getStudentTotalRewards(studentId)
  }

  async attemptQuiz(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<{
    isCorrect: boolean
    rewardEarned: bigint
    selectedAnswer: number
  }> {
    const accessToken = await this.utils.syncOrMine<any>(accessTokenId)
    return await this.studentHelper.attemptQuizWithQuizAttempt(quizId, selectedAnswer, accessToken)
  }
}
