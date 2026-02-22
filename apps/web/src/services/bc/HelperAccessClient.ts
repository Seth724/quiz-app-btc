/**
 * Helper-based Access Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { QuizAccessHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS } from '@/config/env'

export interface AccessDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentId: string
  hasAccess: boolean
  purchasedAt: number
  expiresAt?: number
}

export interface SaleOfferDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  teacherId: string
  price: bigint
  isActive: boolean
}

export class HelperAccessClient {
  private accessHelper: QuizAccessHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module spec
    this.accessHelper = new QuizAccessHelper(computer, MODULE_SPECS.quizAccessMod)
    this.utils = new BlockchainUtils(computer)
  }

  /**
   * Purchase access (mint access token) using helper
   */
  async purchase(quizId: string, price: bigint): Promise<AccessDTO> {
    console.log('🔨 Purchasing access for quiz:', quizId, 'price:', price)

    const accessToken = await this.accessHelper.createQuizAccess(quizId, BigInt(1))

    return {
      _id: accessToken._id,
      _rev: accessToken._rev,
      _root: accessToken._root,
      _owners: accessToken._owners,
      _satoshis: accessToken._satoshis,
      quizId: accessToken.quizId,
      studentId: this.computer.getPublicKey(),
      hasAccess: true,
      purchasedAt: Date.now(),
    } as AccessDTO
  }

  /**
   * Check if student has access to quiz
   */
  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    return await this.accessHelper.balanceOf(studentId, quizId) > BigInt(0)
  }

  /**
   * List all access tokens by student
   */
  async listByStudent(studentId: string): Promise<AccessDTO[]> {
    const accessIds = await this.computer.query({
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId,
    })

    const accesses: AccessDTO[] = []
    for (const id of accessIds) {
      try {
        const access: any = await this.utils.syncOrMine(id)
        accesses.push({
          _id: access._id,
          _rev: access._rev,
          _root: access._root,
          _owners: access._owners,
          _satoshis: access._satoshis,
          quizId: access.quizId,
          studentId,
          hasAccess: access.amount > BigInt(0),
          purchasedAt: access.createdAt || Date.now(),
        })
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }
    return accesses
  }

  /**
   * Mint access token for a quiz using helper
   */
  async mintAccess(quizId: string, amount: bigint = BigInt(1)): Promise<any> {
    return await this.accessHelper.mint(this.computer.getPublicKey(), quizId, amount, 'QACC')
  }

  /**
   * Get balance of access tokens for a quiz using helper
   */
  async getBalance(quizId: string): Promise<bigint> {
    return await this.accessHelper.balanceOf(this.computer.getPublicKey(), quizId)
  }

  /**
   * Transfer access token to another student using helper
   */
  async transferAccess(to: string, amount: bigint, quizId: string): Promise<void> {
    await this.accessHelper.transfer(to, amount, quizId)
  }
}
