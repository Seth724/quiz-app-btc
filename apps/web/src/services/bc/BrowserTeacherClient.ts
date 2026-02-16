/**
 * Browser-Safe Teacher Client - Uses mod specs instead of contract imports
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS } from '@/config/env'
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
 * Browser-safe TeacherClient using mod specs
 */
export class BrowserTeacherClient {
  private quizClient: BrowserQuizClient

  constructor(private computer: Computer) {
    this.quizClient = new BrowserQuizClient(computer)
  }

  /**
   * Create a new teacher account
   */
  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    // Check if module specs are available
    if (!MODULE_SPECS.teacherMod) {
      console.warn('Module specs not deployed, creating mock teacher for development')
      return this.createMockTeacher(name, publicKey)
    }
    
    const exp = `new Teacher("${name}", "${publicKey}")`
    
    const encoded = await this.computer.encode({
      exp,
      mod: MODULE_SPECS.teacherMod,
    })
    
    await this.computer.broadcast(encoded.tx)
    
    return {
      ...encoded.effect.res,
      createdAt: Date.now()
    } as unknown as TeacherDTO
  }

  /**
   * Create mock teacher for development
   */
  private createMockTeacher(name: string, publicKey: string): TeacherDTO {
    const mockId = 'mock-teacher-' + Date.now()
    return {
      _id: mockId,
      _rev: mockId + ':0',
      _root: mockId,
      _owners: [publicKey],
      _satoshis: BigInt(1000),
      name,
      publicKey,
      quizCount: 0,
      totalEarnings: BigInt(0),
      createdAt: Date.now()
    }
  }

  /**
   * Get teacher by public key (or create if doesn't exist)
   */
  async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    try {
      // Try to find existing teacher (simplified - in production you'd have proper indexing)
      // For now, create a new one each time
      return await this.createTeacher(name, publicKey)
    } catch (error) {
      console.error('Failed to get/create teacher:', error)
      throw error
    }
  }

  /**
   * Create a quiz with payment
   */
  async createQuiz(quizData: QuizData): Promise<any> {
    return await this.quizClient.createQuiz(quizData)
  }

  /**
   * Get teacher's quizzes
   */
  async getTeacherQuizzes(teacherPublicKey: string): Promise<any[]> {
    try {
      // This would need proper indexing in production
      // For now return empty array
      return []
    } catch (error) {
      console.error('Failed to get teacher quizzes:', error)
      return []
    }
  }
}