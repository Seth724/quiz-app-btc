/**
 * Browser-Safe Teacher Client - Uses quiz-contracts TeacherHelper
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@/types'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { TeacherHelper } from '@quiz-app/contracts'
import { BrowserQuizClient, QuizDTO } from './BrowserQuizClient'
import { withComputerLock } from './txUtils'

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

export class BrowserTeacherClient {
  private quizClient: BrowserQuizClient
  private teacherHelper: TeacherHelper

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.quizClient = new BrowserQuizClient(computer)
    this.teacherHelper = new TeacherHelper(computer, MODULE_SPECS.teacherMod, MODULE_SPECS.paymentMod)
  }

  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    return withComputerLock(this.computer, async () => {
      const teacher = await this.teacherHelper.createTeacher(name, publicKey)
      return {
        ...(teacher as unknown as TeacherDTO),
        createdAt: Date.now(),
      }
    })
  }

  async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    // Query for existing teacher objects by this public key
    const teacherIds = await this.computer.query({ mod: MODULE_SPECS.teacherMod, publicKey })

    if (teacherIds.length > 0) {
      const teacher = await this.computer.sync(teacherIds[0]) as TeacherDTO
      return {
        ...teacher,
        createdAt: teacher.createdAt ?? Date.now(),
      }
    }

    return this.createTeacher(name, publicKey)
  }

  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    return await this.quizClient.createQuiz(quizData)
  }

  async getTeacherQuizzes(teacherPublicKey: string): Promise<QuizDTO[]> {
    return await this.quizClient.getQuizzesByTeacher(teacherPublicKey)
  }
}