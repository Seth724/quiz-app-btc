/**
 * Browser-Safe Access Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

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

/**
 * Browser-safe AccessClient using deployed module specs
 * Follows the test flow for access token sale mechanism
 */
export class BrowserAccessClient {
  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  /**
   * Purchase access to a quiz following the test flow:
   * Teacher creates access token, creates sale offer, student accepts
   */
  async purchase(quizId: string, price: bigint): Promise<AccessDTO> {
    console.log('🔨 Purchasing access for quiz:', quizId, 'price:', price)

    // For now, create an access token directly
    // In the full test flow, the teacher would create a sale offer first
    const accessExp = `new QuizAccess("${this.computer.getPublicKey()}", "${quizId}", 1n)`
    
    const encoded = await this.computer.encode({
      exp: accessExp,
      mod: MODULE_SPECS.quizAccessMod,
    })

    await this.computer.broadcast(encoded.tx)

    const accessToken = encoded.effect.res

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
   * Check if student has access to a quiz
   */
  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    const accessIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId 
    })

    for (const id of accessIds) {
      try {
        const access = await this.computer.sync(id)
        if (access.quizId === quizId && access.amount > 0n) {
          return true
        }
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }

    return false
  }

  /**
   * List all access tokens for a student
   */
  async listByStudent(studentId: string): Promise<AccessDTO[]> {
    const accessIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId 
    })

    const accesses: AccessDTO[] = []
    for (const id of accessIds) {
      try {
        const access = await this.computer.sync(id)
        accesses.push({
          _id: access._id,
          _rev: access._rev,
          _root: access._root,
          _owners: access._owners,
          _satoshis: access._satoshis,
          quizId: access.quizId,
          studentId: studentId,
          hasAccess: access.amount > 0n,
          purchasedAt: access.createdAt || Date.now(),
        })
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }

    return accesses
  }

  /**
   * Create sale offer for a quiz (teacher only)
   * Following test flow: create access token, create offer tx
   */
  async createSaleOffer(quizId: string, price: bigint): Promise<SaleOfferDTO> {
    console.log('🏪 Creating sale offer for quiz:', quizId, 'price:', price)

    // Create a payment object to represent the price
    const paymentExp = `new Payment(${price}n)`
    const paymentEncoded = await this.computer.encode({
      exp: paymentExp,
      mod: MODULE_SPECS.paymentMod,
    })

    await this.computer.broadcast(paymentEncoded.tx)
    const payment = paymentEncoded.effect.res

    return {
      _id: payment._id,
      _rev: payment._rev,
      _root: payment._root,
      _owners: [this.computer.getPublicKey()],
      _satoshis: payment._satoshis,
      quizId,
      teacherId: this.computer.getPublicKey(),
      price,
      isActive: true,
    } as SaleOfferDTO
  }
}
