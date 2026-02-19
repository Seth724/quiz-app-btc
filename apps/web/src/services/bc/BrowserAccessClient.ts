/**
 * Browser-Safe Access Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { encodeBroadcastWithRetry, withComputerLock } from './txUtils'

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

const nowMs = () => {
  if (typeof performance !== 'undefined' && (performance as any).timeOrigin !== undefined) {
    return Math.floor((performance as any).timeOrigin + performance.now())
  }
  return Date.now()
}

export class BrowserAccessClient {
  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  async purchase(quizId: string, price: bigint): Promise<AccessDTO> {
    return withComputerLock(this.computer, async () => {
      console.log('🔨 Purchasing access for quiz:', quizId, 'price:', price)

      const accessExp = `new QuizAccess(${JSON.stringify(this.computer.getPublicKey())}, ${JSON.stringify(
        quizId
      )}, 1n)`

      const encoded = await encodeBroadcastWithRetry(
        this.computer,
        { exp: accessExp, mod: MODULE_SPECS.quizAccessMod },
        { label: 'purchaseAccess' }
      )

      const accessToken: any = encoded.effect.res

      return {
        _id: accessToken._id,
        _rev: accessToken._rev,
        _root: accessToken._root,
        _owners: accessToken._owners,
        _satoshis: accessToken._satoshis,
        quizId: accessToken.quizId,
        studentId: this.computer.getPublicKey(),
        hasAccess: true,
        purchasedAt: nowMs(),
      } as AccessDTO
    })
  }

  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    const accessIds = await this.computer.query({
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId,
    })

    for (const id of accessIds) {
      try {
        const access: any = await this.computer.sync(id)
        if (access.quizId === quizId && access.amount > 0n) return true
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }
    return false
  }

  async listByStudent(studentId: string): Promise<AccessDTO[]> {
    const accessIds = await this.computer.query({
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId,
    })

    const accesses: AccessDTO[] = []
    for (const id of accessIds) {
      try {
        const access: any = await this.computer.sync(id)
        accesses.push({
          _id: access._id,
          _rev: access._rev,
          _root: access._root,
          _owners: access._owners,
          _satoshis: access._satoshis,
          quizId: access.quizId,
          studentId,
          hasAccess: access.amount > 0n,
          purchasedAt: access.createdAt || nowMs(),
        })
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }
    return accesses
  }

  async createSaleOffer(quizId: string, price: bigint): Promise<SaleOfferDTO> {
    return withComputerLock(this.computer, async () => {
      console.log('🏪 Creating sale offer for quiz:', quizId, 'price:', price)

      const paymentEncoded = await encodeBroadcastWithRetry(
        this.computer,
        { exp: `new Payment(${price}n)`, mod: MODULE_SPECS.paymentMod },
        { label: 'createSaleOfferPayment' }
      )

      const payment: any = paymentEncoded.effect.res

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
    })
  }
}