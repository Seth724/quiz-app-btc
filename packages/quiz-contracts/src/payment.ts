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
  }

  transfer(to: string) {
    this._owners = [to]

    console.log(`Payment transferred to new owner: ${to}`)
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }

  // Add withdraw method that sets satoshis to minimum dust amount after funds are transferred
  withdraw() {
    this._satoshis = 546n // minimum non-dust amount after withdrawal
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

// The Withdraw contract that reduces payment satoshis to minimum dust amount
// This releases the excess satoshis to the owner's wallet through the Bitcoin Computer's UTXO model
export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.withdraw())
  }
}