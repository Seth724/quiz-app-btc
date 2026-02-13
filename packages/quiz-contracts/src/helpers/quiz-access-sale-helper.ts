import { Buffer } from 'buffer'
import { Transaction } from '@bitcoin-computer/lib'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { QuizAccessSale } from '../quiz-access-sale.js'
import { Payment, PaymentMock } from '../payment.js'


const sighashType = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

export class QuizAccessSaleHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${QuizAccessSale}`)
    return this.mod
  }

  /**
   * Teacher builds a partially signed offer:
   * input0 = access (signed by teacher)
   * input1 = mock payment (placeholder)
   */
  createOfferTx(access: any, paymentMock: PaymentMock) {
    return this.computer.encode({
      exp: `QuizAccessSale.exec(o, p)`,
      env: { o: access._rev, p: paymentMock._rev },
      mocks: { p: paymentMock },

      sighashType,
      inputIndex: 0,
      fund: false,
      sign: true,
      mod: this.mod,
    })
  }

  async isOfferTx(tx: TransactionType): Promise<boolean> {
    try {
      const { exp, mod } = await this.computer.decode(tx)
      return exp === 'QuizAccessSale.exec(o, p)' && mod === this.mod
    } catch {
      return false
    }
  }

  /**
   * Checks:
   * - correct exp + module
   * - effect env keys are exactly o,p
   * Returns the asking price (tx.outs[0].value).
   */
  async checkOfferTx(tx: TransactionType): Promise<bigint> {
    const { exp, env, mod } = await this.computer.decode(tx)
    if (exp !== 'QuizAccessSale.exec(o, p)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    // Re-simulate with a fresh mock payment of the advertised price
    const price = tx.outs[0].value as bigint
    const p = new PaymentMock(price)
    env.p = p._rev

    const mocks = { p }
    const fund = false
    const sign = false

    const { effect } = await this.computer.encode({
      exp,
      env,
      mod,
      mocks,
      fund,
      sign,
      sighashType,
    })

    // RIGHT
    if (effect.res === undefined) throw new Error('Unexpected result')

// also make env key check order-safe
    const keys = Object.keys(effect.env).sort().join(',')
    if (keys !== 'o,p') throw new Error('Unexpected environment')
    if (Object.keys(effect.env).toString() !== 'o,p') throw new Error('Unexpected environment keys')

    return price
  }

  /**
   * Student completion step:
   * - replace input[1] with real payment outpoint
   * - set output[1] scriptPubKey so student receives the access object
   */
  static finalizeOfferTx(tx: TransactionType, payment: Payment, buyerScriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)

    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey: buyerScriptPubKey })

    return tx
  }
}