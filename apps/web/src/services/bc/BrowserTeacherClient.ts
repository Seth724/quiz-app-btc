/**
 * Browser-Safe Teacher Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { BrowserQuizClient } from './BrowserQuizClient'

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

/**
 * Browser-safe TeacherClient using deployed module specs
 */
export class BrowserTeacherClient {
  private quizClient: BrowserQuizClient

  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.quizClient = new BrowserQuizClient(computer)
  }

  /**
   * Create a new teacher account
   */
  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    const exp = `new Teacher("${name}", "${publicKey}")`

    const encoded = await this.computer.encode({
      exp,
      mod: MODULE_SPECS.teacherMod,
    })

    await this.computer.broadcast(encoded.tx)

    return {
      ...encoded.effect.res,
      createdAt: Date.now()
    } as TeacherDTO
  }

  /**
   * Get or create teacher by public key
   */
  async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    try {
      // Try to find existing teacher
      const teacherIds = await this.computer.query({ 
        mod: MODULE_SPECS.teacherMod,
        publicKey 
      })
      
      if (teacherIds.length > 0) {
        const teacher = await this.computer.sync(teacherIds[0])
        return {
          ...teacher,
          createdAt: teacher.createdAt || Date.now()
        } as TeacherDTO
      }
      
      // Create new teacher if not found
      return await this.createTeacher(name, publicKey)
    } catch (error) {
      console.error('Failed to get/create teacher:', error)
      throw error
    }
  }

  /**
   * Create a quiz with payment (following test flow)
   */
  async createQuiz(quizData: QuizData): Promise<any> {
    return await this.quizClient.createQuiz(quizData)
  }

  /**
   * Get teacher's quizzes from blockchain
   */
  async getTeacherQuizzes(teacherPublicKey: string): Promise<any[]> {
    return await this.quizClient.getQuizzesByTeacher(teacherPublicKey)
  }
}
