/**
 * Browser-Safe Quiz Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { encodeBroadcastWithRetry, withComputerLock } from './txUtils'
import { MineBlocks } from '../utils/mineblock'


const url='http://localhost:9112'
const chain = process.env.NEXT_PUBLIC_BCN_CHAIN || 'regtest'
const network = process.env.NEXT_PUBLIC_BCN_NETWORK || 'regtest'
export interface QuizDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string
  isClaimed: boolean
  claimedBy: string
  attemptedStudents: string[]
  attemptCount: number
  createdAt: number
}

const nowMs = () => {
  if (typeof performance !== 'undefined' && (performance as any).timeOrigin !== undefined) {
    return Math.floor((performance as any).timeOrigin + performance.now())
  }
  return Date.now()
}

export class BrowserQuizClient {
  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    return withComputerLock(this.computer, async () => {
      console.log('🎯 Creating quiz with data:', quizData)

      // STEP 1: Payment
      console.log('📤 Creating payment...')
      const paymentEncoded = await encodeBroadcastWithRetry(
        this.computer,
        {
          exp: `new Payment(${quizData.rewardAmount}n)`,
          mod: MODULE_SPECS.paymentMod,
        },
        { label: 'createPayment', postBroadcastDelayMs: 2500 }
      )

      const payment = paymentEncoded.effect.res
      const paymentTxId = payment._id as string
      console.log('✅ Payment created:', paymentTxId)

      // NEW: wait until BCN can sync the payment object reliably
      await this.computer.sync(paymentTxId)

      // NEW: add extra settle time (regtest indexers often lag)
      await new Promise((r) => setTimeout(r, 2500))

      const mine = async (blocks: number = 1) => {
        if (network === 'regtest') await MineBlocks.mine(url, chain, network, blocks)
      }

      //await mine(2) // ensure payment is well-confirmed in regtest before creating quiz

      // STEP 2: Quiz (after payment is visible to BCN’s UTXO view)
      console.log('📤 Creating quiz...')
      const quizExp = `new Quiz({
        title: ${JSON.stringify(quizData.title)},
        questionText: ${JSON.stringify(quizData.questionText)},
        options: ${JSON.stringify(quizData.options)},
        correctAnswer: ${quizData.correctAnswer},
        rewardAmount: ${quizData.rewardAmount}n,
        entryFee: ${quizData.entryFee}n,
        teacherPublicKey: ${JSON.stringify(this.computer.getPublicKey())},
        paymentTxId: ${JSON.stringify(paymentTxId)}
      })`

      const quizEncoded = await encodeBroadcastWithRetry(
        this.computer,
        { exp: quizExp, mod: MODULE_SPECS.quizMod },
        { label: 'createQuiz', postBroadcastDelayMs: 2500 }
      )

      const quiz = quizEncoded.effect.res
      const quizId = quiz._id as string
      console.log('✅ Quiz created:', quizId)

      const syncedQuiz = await this.computer.sync(quizId)

      const attemptedStudents = (syncedQuiz as any).attemptedStudents || []
      return {
        ...(syncedQuiz as any),
        paymentTxId,
        attemptedStudents,
        attemptCount: attemptedStudents.length,
        createdAt: (syncedQuiz as any).createdAt || nowMs(),
      } as QuizDTO
    })
  }

  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      console.log('🔍 Fetching quiz with ID:', quizId)
      const quiz = await this.computer.sync(quizId)
      const attemptedStudents = (quiz as any).attemptedStudents || []
      return {
        ...(quiz as any),
        attemptedStudents,
        attemptCount: attemptedStudents.length,
      } as QuizDTO
    } catch (error) {
      console.error('Failed to get quiz:', error)
      return null
    }
  }

  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    if (!quiz) return false
    if (!quiz.isActive || quiz.isClaimed) return false
    if (quiz.attemptedStudents?.includes(studentPublicKey)) return false
    return true
  }

  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.getQuiz(quizId)
      if (!quiz) return null

      await encodeBroadcastWithRetry(
        this.computer,
        { exp: `quiz.deactivate()`, env: { quiz: quiz._rev }, mod: MODULE_SPECS.quizMod },
        { label: 'deactivateQuiz' }
      )

      return await this.getQuiz(quizId)
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  async getAllQuizzes(): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })

    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.computer.sync(id)
        if (quiz && (quiz as any).isActive) {
          const attemptedStudents = (quiz as any).attemptedStudents || []
          quizzes.push({
            ...(quiz as any),
            attemptedStudents,
            attemptCount: attemptedStudents.length,
          } as QuizDTO)
        }
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }

    return quizzes
  }

  // async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
  //   const quizIds = await this.computer.query({
  //     mod: MODULE_SPECS.quizMod,
  //     publicKey: teacherPublicKey,
  //   })

  //   const quizzes: QuizDTO[] = []
  //   for (const id of quizIds) {
  //     try {
  //       const quiz = await this.computer.sync(id)
  //       const attemptedStudents = (quiz as any).attemptedStudents || []
  //       quizzes.push({
  //         ...(quiz as any),
  //         attemptedStudents,
  //         attemptCount: attemptedStudents.length,
  //       } as QuizDTO)
  //     } catch (quizError) {
  //       console.error(`Failed to sync quiz ${id}:`, quizError)
  //     }
  //   }

  //   return quizzes
  // }
  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    console.log(`🔍 Fetching quizzes for teacherPublicKey: ${teacherPublicKey}`)
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod }) // no publicKey filter
    console.log(`❤️❤️❤️Queried quiz IDs: ${quizIds.join(', ')}`)
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
      const quiz = await this.computer.sync(id)
      console.log(`💕💕Queried quiz ${id} with teacherPublicKey: ${(quiz as any).teacherPublicKey}`)
      console.log("😊😊😊teacherPublicKey:", teacherPublicKey, "quiz teacherPublicKey:", (quiz as any).teacherPublicKey)
      console.log(`👍👍👍Comparing with requested teacherPublicKey : ${(quiz as any).teacherPublicKey === teacherPublicKey} `)
      if ((quiz as any).teacherPublicKey === teacherPublicKey) {
        const attemptedStudents = (quiz as any).attemptedStudents || []
        quizzes.push({
          ...(quiz as any),
          attemptedStudents,
          attemptCount: attemptedStudents.length,
        } as QuizDTO)
      }
    } catch (e) {
      console.error(`Failed to sync quiz ${id}:`, e)
    }
    console.log("🙌🙌🙌Fetched quizzes for teacher:", quizzes )
  }
  return quizzes
}
}