/**
 * Browser-Safe Teacher Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { BrowserQuizClient } from './BrowserQuizClient'
import { encodeBroadcastWithRetry, withComputerLock } from './txUtils'

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

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.quizClient = new BrowserQuizClient(computer)
  }

  // async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
  //   return withComputerLock(this.computer, async () => {
  //     const exp = `new Teacher(${JSON.stringify(name)}, ${JSON.stringify(publicKey)})`

  //     const encoded = await encodeBroadcastWithRetry(
  //       this.computer,
  //       { exp, mod: MODULE_SPECS.teacherMod },
  //       { label: 'createTeacher' }
  //     )

  //     return {
  //       ...encoded.effect.res, // ✅ MUST spread
  //       createdAt: Date.now(),
  //     } as TeacherDTO
  //   })
  // }

  // async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
  //   try {
  //     const teacherIds = await this.computer.query({
  //       mod: MODULE_SPECS.teacherMod,
  //       publicKey,
  //     })

  //     if (teacherIds.length > 0) {
  //       const teacher = await this.computer.sync(teacherIds[0])
  //       return {
  //         ...teacher,
  //         createdAt: (teacher as any).createdAt || Date.now(),
  //       } as TeacherDTO
  //     }

  //     return await this.createTeacher(name, publicKey)
  //   } catch (error) {
  //     console.error('Failed to get/create teacher:', error)
  //     throw error
  //   }
  // }
  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
  return withComputerLock(this.computer, async () => {
    const exp = `new Teacher(${JSON.stringify(name)}, ${JSON.stringify(publicKey)})`

    const encoded = await encodeBroadcastWithRetry(
      this.computer,
      { exp, mod: MODULE_SPECS.teacherMod },
      { label: 'createTeacher' }
    )

    const res = encoded.effect.res as Record<string, any>

    return {
      ...res,
      createdAt: Date.now(),
    } as TeacherDTO
  })
}

async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
  const teacherIds = await this.computer.query({ mod: MODULE_SPECS.teacherMod, publicKey })

  if (teacherIds.length > 0) {
    const teacher = (await this.computer.sync(teacherIds[0])) as Record<string, any>
    return {
      ...teacher,
      createdAt: teacher.createdAt ?? Date.now(),
    } as TeacherDTO
  }

  return this.createTeacher(name, publicKey)
}
  async createQuiz(quizData: QuizData): Promise<any> {
    return await this.quizClient.createQuiz(quizData)
  }

  async getTeacherQuizzes(teacherPublicKey: string): Promise<any[]> {
    return await this.quizClient.getQuizzesByTeacher(teacherPublicKey)
  }
}