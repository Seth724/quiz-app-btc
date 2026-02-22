import { Buffer } from 'buffer'
import type { Computer } from '@bitcoin-computer/lib'
import { Transaction } from '@bitcoin-computer/lib'
import { loadExportedClass } from './contract-loader.js'

type DecodeResult = {
  exp: string
  env: Record<string, string>
  mod: string
}

type EncodeResult = {
  tx: any
  effect: {
    res?: unknown
    env: Record<string, unknown>
  }
}

export class QuizAccessSaleHelper {
  computer: Computer
  quizAccessSaleMod: string

  constructor(computer: Computer, quizAccessSaleMod: string) {
    this.computer = computer
    this.quizAccessSaleMod = quizAccessSaleMod
  }

  async deploy(): Promise<string> {
    const QuizAccessSale = await loadExportedClass<any>(this.computer, this.quizAccessSaleMod, 'QuizAccessSale')
    const mod = await this.computer.deploy(`export ${QuizAccessSale}`)
    return mod
  }

  async createOfferTx(access: any, payment: any): Promise<EncodeResult> {
    const QuizAccessSale = await loadExportedClass<any>(this.computer, this.quizAccessSaleMod, 'QuizAccessSale')
    
    const sighashType = (Transaction as any).SIGHASH_SINGLE | (Transaction as any).SIGHASH_ANYONECANPAY
    
    return this.computer.encode({
      exp: `QuizAccessSale.exec(o, p)`,
      env: { o: access._rev, p: payment._rev },
      mocks: { p: payment },
      sighashType,
      inputIndex: 0,
      fund: false,
    }) as unknown as Promise<EncodeResult>
  }

  async checkOfferTx(tx: any): Promise<bigint> {
    const decoded = (await this.computer.decode(tx)) as unknown as DecodeResult
    const { exp, env, mod } = decoded

    if (exp !== 'QuizAccessSale.exec(o, p)') throw new Error('Unexpected expression')
    if (mod !== this.quizAccessSaleMod) throw new Error('Unexpected module specifier')

    const price = BigInt(tx.outs[0].value)
    
    // Create a mock payment for validation
    class PaymentMock {
      _id: string
      _rev: string
      _root: string
      _satoshis: bigint
      _owners: string[]
      
      constructor(price: bigint) {
        this._id = `mock:${price.toString()}:0`
        this._rev = `mock:${price.toString()}:0`
        this._root = `mock:${price.toString()}`
        this._satoshis = price
        this._owners = ['023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c']
      }
      
      transfer(to: string) {
        this._owners = [to]
      }
      
      setSatoshis(a: bigint) {
        this._satoshis = a
      }
    }
    
    const pMock = new PaymentMock(price)
    env.p = pMock._rev

    const reencoded = (await this.computer.encode({
      exp,
      env,
      mod,
      mocks: { p: pMock },
      fund: false,
      sign: false,
    })) as unknown as EncodeResult

    if (reencoded.effect.res === undefined) throw new Error('Unexpected result')
    return price
  }

  static finalizeOfferTx(tx: any, payment: any, scriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)
    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey })
    return tx
  }
}
