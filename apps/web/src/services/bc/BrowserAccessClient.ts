/**
 * Browser-Safe Access Client - Implements proper QuizAccessSale atomic swap flow
 * 
 * Teacher flow: mintAndCreateOffer → creates QuizAccess token + partial offer tx
 * Student flow: finalizeAndBroadcastOffer → finalizes offer tx + broadcasts atomic swap
 */

import { Computer, Transaction } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { encodeBroadcastWithRetry, withComputerLock } from './txUtils'

const sighashType = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

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

// Inline PaymentMock (avoids heavy contract import in browser)
class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(satoshis: bigint) {
    const mockRev = `mock-${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._id = mockRev
    this._rev = mockRev
    this._root = mockRev
    this._satoshis = satoshis
    this._owners = ['023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c']
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }
}

export class BrowserAccessClient {
  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  // ─────────────────────────────────────────────
  // TEACHER: Mint access token + create offer tx
  // ─────────────────────────────────────────────

  /**
   * Teacher mints a QuizAccess token and creates a partially-signed offer tx.
   * The offer tx encodes `QuizAccessSale.exec(o, p)` with:
   *   - Input 0: teacher's access token (signed with SIGHASH_SINGLE|ANYONECANPAY)
   *   - Input 1: placeholder for student's payment (unsigned)
   *   - Output 0: entryFee payment going to teacher
   *   - Output 1: access token going to student (placeholder)
   * 
   * Returns the serialized offer tx hex for relay to the student.
   */
  async mintAndCreateOffer(quizId: string, entryFee: bigint): Promise<MintOfferResult> {
    return withComputerLock(this.computer, async () => {
      console.log('🏭 [Teacher] Minting QuizAccess token for quiz:', quizId)

      // Step 1: Mint a 1-unit QuizAccess token owned by teacher
      const mintExp = `new QuizAccess(${JSON.stringify(this.computer.getPublicKey())}, ${JSON.stringify(quizId)}, 1n)`
      const mintEncoded = await encodeBroadcastWithRetry(
        this.computer,
        { exp: mintExp, mod: MODULE_SPECS.quizAccessMod },
        { label: 'mintQuizAccess' }
      )
      const accessToken = mintEncoded.effect.res as any
      console.log('✅ [Teacher] QuizAccess minted:', accessToken._id, 'rev:', accessToken._rev)

      // Step 2: Create a partially-signed offer tx
      const mock = new PaymentMock(entryFee)
      console.log('🔨 [Teacher] Creating offer tx with mock payment, entryFee:', entryFee.toString())

      const offerEncoded = await this.computer.encode({
        exp: `QuizAccessSale.exec(o, p)`,
        env: { o: accessToken._rev, p: mock._rev },
        mocks: { p: mock },
        sighashType,
        inputIndex: 0,
        fund: false,
        mod: MODULE_SPECS.quizAccessSaleMod,
      })

      const offerTx = offerEncoded.tx
      const offerTxHex = offerTx.toHex()
      console.log('✅ [Teacher] Offer tx created, hex length:', offerTxHex.length)
      console.log('✅ [Teacher] Offer tx inputs:', offerTx.ins.length, 'outputs:', offerTx.outs.length)

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
   * 1. Create a real Payment(entryFee) 
   * 2. Deserialize the offer tx
   * 3. Update input 1 with real payment UTXO
   * 4. Update output 1 with student's scriptPubKey
   * 5. Fund + sign + broadcast
   * 6. Sync result to get the QuizAccess token
   * 
   * After broadcast, the atomic swap is complete:
   *   - Student owns the QuizAccess token
   *   - Teacher owns the Payment (entryFee)
   */
  async finalizeAndBroadcastOffer(offerTxHex: string, entryFee: bigint): Promise<FinalizeResult> {
    return withComputerLock(this.computer, async () => {
      console.log('💳 [Student] Finalizing offer, entryFee:', entryFee.toString())

      // Step 1: Create a real Payment(entryFee) on-chain
      const paymentExp = `new Payment(${entryFee}n)`
      const paymentEncoded = await encodeBroadcastWithRetry(
        this.computer,
        { exp: paymentExp, mod: MODULE_SPECS.paymentMod },
        { label: 'createPaymentForAccess' }
      )
      const payment = paymentEncoded.effect.res as any
      console.log('✅ [Student] Payment created:', payment._id, '_rev:', payment._rev)

      // Step 2: Deserialize the offer tx
      const offerTx = Transaction.fromHex(offerTxHex)
      console.log('✅ [Student] Offer tx deserialized, inputs:', offerTx.ins.length, 'outputs:', offerTx.outs.length)

      // Step 3: Finalize – update input 1 with the real payment UTXO
      const [paymentTxId, paymentIndex] = payment._rev.split(':')
      const index = parseInt(paymentIndex, 10)
      offerTx.updateInput(1, { txId: paymentTxId, index })

      // Step 4: Update output 1 with student's scriptPubKey
      const scriptPubKey = this.computer.toScriptPubKey()
      if (!scriptPubKey) throw new Error('Could not get scriptPubKey from student computer')
      offerTx.updateOutput(1, { scriptPubKey })

      console.log('✅ [Student] Offer finalized, funding and signing...')

      // Step 5: Fund (add change outputs) and sign
      await this.computer.fund(offerTx)
      await this.computer.sign(offerTx)

      // Step 6: Broadcast
      const txId = await this.computer.broadcast(offerTx)
      console.log('✅ [Student] Offer broadcast! txId:', txId)

      // Step 7: Sync the result to get the QuizAccess token
      // QuizAccessSale.exec(o, p) returns [p, o] so env has o (access) and p (payment)
      const synced = await this.computer.sync(txId) as any
      const accessToken = synced?.env?.o

      // IMPORTANT: Use _rev (the post-swap revision) not _id (the original mint revision).
      // sync() does NOT auto-follow the revision chain, so the attempt client
      // needs the exact post-swap revision to see correct _owners.
      const accessTokenId = accessToken?._rev || accessToken?._id || txId

      console.log('✅ [Student] Atomic swap complete!')
      console.log('  AccessToken _id:', accessToken?._id)
      console.log('  AccessToken _rev (post-swap):', accessToken?._rev)
      console.log('  AccessToken _owners:', accessToken?._owners)
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
          // Return _rev (latest revision), not _id, so submitAttempt can use it directly
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