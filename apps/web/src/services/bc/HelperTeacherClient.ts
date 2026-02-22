/**
 * Helper-based Teacher Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { TeacherHelper, BlockchainUtils } from '@quiz-app/contracts'
import { HelperQuizClient } from './HelperQuizClient'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS } from '@/config/env'

export interface TeacherDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  name: string
  publicKey: string
  quizCount: number
  totalEarnings: bigint
  createdAt: number
}

export class HelperTeacherClient {
  private teacherHelper: TeacherHelper
  private quizClient: HelperQuizClient
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module specs
    this.teacherHelper = new TeacherHelper(
      computer,
      MODULE_SPECS.teacherMod,
      MODULE_SPECS.quizMod,
      MODULE_SPECS.paymentMod
    )
    this.quizClient = new HelperQuizClient(computer)
    this.utils = new BlockchainUtils(computer)
  }

  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    const teacher = await this.teacherHelper.createTeacher(name, publicKey)
    return {
      ...teacher,
      quizCount: (teacher as any).createdQuizzes?.length || 0,
      totalEarnings: BigInt(0),
      createdAt: Date.now(),
    } as TeacherDTO
  }

  async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    const teacherIds = await this.computer.query({
      mod: MODULE_SPECS.teacherMod,
      publicKey,
    })

    if (teacherIds.length > 0) {
      const teacher: any = await this.utils.syncOrMine(teacherIds[0])
      return {
        ...teacher,
        quizCount: teacher.createdQuizzes?.length || 0,
        totalEarnings: BigInt(0),
        createdAt: teacher.createdAt || Date.now(),
      } as TeacherDTO
    }

    return await this.createTeacher(name, publicKey)
  }

  async getTeacher(teacherId: string): Promise<TeacherDTO> {
    const teacher: any = await this.teacherHelper.getTeacher(teacherId)
    return {
      ...teacher,
      quizCount: teacher.createdQuizzes?.length || 0,
      totalEarnings: BigInt(0),
      createdAt: teacher.createdAt || Date.now(),
    } as TeacherDTO
  }

  async getTeacherByPublicKey(publicKey: string): Promise<TeacherDTO | null> {
    const teacher = await this.teacherHelper.getTeacherByPublicKey(publicKey)
    if (!teacher) return null

    return {
      ...teacher,
      quizCount: teacher.createdQuizzes?.length || 0,
      totalEarnings: BigInt(0),
      createdAt: teacher.createdAt || Date.now(),
    } as TeacherDTO
  }

  async createQuiz(quizData: QuizData): Promise<any> {
    return await this.quizClient.createQuiz(quizData)
  }

  async getTeacherQuizzes(teacherPublicKey: string): Promise<any[]> {
    return await this.quizClient.getQuizzesByTeacher(teacherPublicKey)
  }
}
