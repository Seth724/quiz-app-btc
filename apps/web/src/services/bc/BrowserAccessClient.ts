/**
 * Browser-Safe Access Client - Uses quiz-contracts helpers for atomic swap flow
 *
 * Teacher flow: mintAndCreateOffer → QuizAccessHelper.createQuizAccess + QuizAccessSaleHelper.createOfferTx
 * Student flow: finalizeAndBroadcastOffer → PaymentHelper.createPayment + QuizAccessSaleHelper.finalizeOfferTx
 */

import { Computer, Transaction } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import {
  QuizAccessHelper,
  QuizAccessSaleHelper,
  PaymentHelper,
  PaymentMock,
} from '@quiz-app/contracts'
import { withComputerLock } from './txUtils'

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

export interface MintOfferResult {
  accessTokenId: string
  accessTokenRev: string
  offerTxHex: string
}

export interface FinalizeResult {
  txId: string
  accessTokenId: string
}

export class BrowserAccessClient {
  private accessHelper: QuizAccessHelper
  private saleHelper: QuizAccessSaleHelper
  private paymentHelper: PaymentHelper

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.accessHelper = new QuizAccessHelper(computer, MODULE_SPECS.quizAccessMod)
    this.saleHelper = new QuizAccessSaleHelper(computer, MODULE_SPECS.quizAccessSaleMod)
    this.paymentHelper = new PaymentHelper(computer, MODULE_SPECS.paymentMod)
  }

  // ─────────────────────────────────────────────
  // TEACHER: Mint access token + create offer tx
  // ─────────────────────────────────────────────

  /**
   * Teacher mints a QuizAccess token and creates a partially-signed offer tx.
   * Uses QuizAccessHelper for minting and QuizAccessSaleHelper for offer creation.
   */
  async mintAndCreateOffer(quizId: string, entryFee: bigint): Promise<MintOfferResult> {
    return withComputerLock(this.computer, async () => {
      console.log('🏭 [Teacher] Minting QuizAccess token for quiz:', quizId)

      // Step 1: Mint a 1-unit QuizAccess token using helper
      const accessToken = await this.accessHelper.createQuizAccess(quizId, BigInt(1))
      console.log('✅ [Teacher] QuizAccess minted:', accessToken._id, 'rev:', accessToken._rev)

      // Step 2: Create a partially-signed offer tx using helper
      const mock = new PaymentMock(entryFee)
      console.log('🔨 [Teacher] Creating offer tx with mock payment, entryFee:', entryFee.toString())

      const offerEncoded = await this.saleHelper.createOfferTx(accessToken, mock)

      const offerTx = offerEncoded.tx
      const offerTxHex = offerTx.toHex()
      console.log('✅ [Teacher] Offer tx created, hex length:', offerTxHex.length)

      return {
        accessTokenId: accessToken._id,
        accessTokenRev: accessToken._rev,
        offerTxHex,
      }
    })
  }

  // ─────────────────────────────────────────────
  // STUDENT: Finalize offer + broadcast
  // ─────────────────────────────────────────────

  /**
   * Student finalizes the teacher's offer tx:
   * 1. Create a real Payment(entryFee) using PaymentHelper
   * 2. Finalize the offer tx using QuizAccessSaleHelper
   * 3. Fund, sign, broadcast
   * 4. Sync result
   */
  async finalizeAndBroadcastOffer(offerTxHex: string, entryFee: bigint): Promise<FinalizeResult> {
    return withComputerLock(this.computer, async () => {
      console.log('💳 [Student] Finalizing offer, entryFee:', entryFee.toString())

      // Step 1: Create a real Payment(entryFee) using PaymentHelper
      const payment = await this.paymentHelper.createPayment(entryFee)
      console.log('✅ [Student] Payment created:', payment._id, '_rev:', payment._rev)

      // Step 2: Deserialize the offer tx
      const offerTx = Transaction.fromHex(offerTxHex)
      console.log('✅ [Student] Offer tx deserialized, inputs:', offerTx.ins.length, 'outputs:', offerTx.outs.length)

      // Step 3: Finalize using QuizAccessSaleHelper.finalizeOfferTx
      const scriptPubKey = this.computer.toScriptPubKey()
      if (!scriptPubKey) throw new Error('Could not get scriptPubKey from student computer')
      QuizAccessSaleHelper.finalizeOfferTx(offerTx, payment as any, scriptPubKey)

      console.log('✅ [Student] Offer finalized, funding and signing...')

      // Step 4: Fund + sign + broadcast
      await this.computer.fund(offerTx)
      await this.computer.sign(offerTx)
      const txId = await this.computer.broadcast(offerTx)
      console.log('✅ [Student] Offer broadcast! txId:', txId)

      // Step 5: Sync the result to get the QuizAccess token
      const synced = await this.computer.sync(txId) as any
      const accessToken = synced?.env?.o

      // Use _rev (post-swap revision) not _id (original mint revision)
      const accessTokenId = accessToken?._rev || accessToken?._id || txId

      console.log('✅ [Student] Atomic swap complete!')
      console.log('  AccessToken _id:', accessToken?._id)
      console.log('  AccessToken _rev (post-swap):', accessToken?._rev)
      console.log('  Returning accessTokenId:', accessTokenId)

      return {
        txId,
        accessTokenId,
      }
    })
  }

  // ─────────────────────────────────────────────
  // COMMON: Check access + list
  // ─────────────────────────────────────────────

  /**
   * Check if student has access to a quiz (owns a QuizAccess token with amount > 0)
   */
  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    try {
      const accessIds = await this.computer.query({
        mod: MODULE_SPECS.quizAccessMod,
        publicKey: studentId,
      })

      for (const id of accessIds) {
        try {
          const access: any = await this.computer.sync(id)
          if (access.quizId === quizId && access.amount > BigInt(0)) return true
        } catch (accessError) {
          console.error(`Failed to sync access token ${id}:`, accessError)
        }
      }
      return false
    } catch (error) {
      console.error('Failed to check access:', error)
      return false
    }
  }

  /**
   * Get the access token ID for a student-quiz pair
   */
  async getAccessTokenId(studentId: string, quizId: string): Promise<string | null> {
    try {
      const accessIds = await this.computer.query({
        mod: MODULE_SPECS.quizAccessMod,
        publicKey: studentId,
      })

      for (const id of accessIds) {
        try {
          const access: any = await this.computer.sync(id)
          if (access.quizId === quizId && access.amount > BigInt(0)) return access._rev
        } catch {
          // skip
        }
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * List all access tokens for a student
   */
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
          hasAccess: access.amount > BigInt(0),
          purchasedAt: access.createdAt || Date.now(),
        })
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }
    return accesses
  }
}
