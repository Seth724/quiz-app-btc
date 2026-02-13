import { Buffer } from 'buffer'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { QuizAccessSale } from '../quiz-access-sale.js'
import { Payment, PaymentMock } from '../payment.js'
import { QuizAccess } from '../quiz-access.js'

const sighashType = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

type DecodeResult = {
  exp: string
  env: Record<string, string>
  mod: string
}

type EncodeResult = {
  tx: TransactionType
  effect: {
    res?: unknown
    env: Record<string, unknown>
  }
}

export class QuizAccessSaleHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${QuizAccessSale}`)
    return this.mod
  }

  createOfferTx(access: QuizAccess, payment: PaymentMock): Promise<EncodeResult> {
    if (!this.mod) throw new Error('QuizAccessSaleHelper not deployed')
    return this.computer.encode({
      exp: `QuizAccessSale.exec(o, p)`,
      env: { o: access._rev, p: payment._rev },
      mocks: { p: payment },
      sighashType,
      inputIndex: 0,
      fund: false,
      mod: this.mod,
    }) as unknown as Promise<EncodeResult>
  }

  async checkOfferTx(tx: TransactionType): Promise<bigint> {
    const decoded = (await this.computer.decode(tx)) as unknown as DecodeResult
    const { exp, env, mod } = decoded

    if (exp !== 'QuizAccessSale.exec(o, p)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    const price = BigInt(tx.outs[0].value)
    const pMock = new PaymentMock(price)
    env.p = pMock._rev

    const reencoded = (await this.computer.encode({
      exp,
      env, // ✅ now Record<string,string>
      mod,
      mocks: { p: pMock },
      fund: false,
      sign: false,
      sighashType,
    })) as unknown as EncodeResult

    if (reencoded.effect.res === undefined) throw new Error('Unexpected result')
    return price
  }

  static finalizeOfferTx(tx: TransactionType, payment: Payment, scriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)
    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey })
    return tx
  }
}