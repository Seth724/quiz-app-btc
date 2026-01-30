import { getMockedRev } from './utils/index.js'
import { Contract } from '@bitcoin-computer/lib'

const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c'

export class Payment extends Contract {
  _id!: string
  _rev!: string
  _root!: string
  _satoshis!: bigint
  _owners!: string[]
  constructor(_satoshis: bigint) {
    super({ _satoshis })
    // The _owners will be set automatically by Bitcoin Computer to the creator's public key
  }

  transfer(to: string) {
    this._owners = [to]
    console.log(`Payment transfer: changing owner to [${to}]`)
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }
}

export class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(satoshis: bigint) {
    this._id = getMockedRev()
    this._rev = getMockedRev()
    this._root = getMockedRev()
    this._satoshis = satoshis
    this._owners = [randomPublicKey]
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }
}

export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.setSatoshis(0n))
  }
}
