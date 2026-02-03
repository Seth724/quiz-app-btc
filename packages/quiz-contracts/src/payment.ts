import { getMockedRev } from './utils/index.js'
import { Contract } from '@bitcoin-computer/lib'

const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c'

/**
 * Payment contract that holds reward funds for quiz winners
 * Gas fees: Creator pays initial deployment fee, transfer/withdraw operations require fees from respective actors
 */
export class Payment extends Contract {
  _id!: string
  _rev!: string
  _root!: string
  _satoshis!: bigint
  _owners!: string[]


  /**
   * Creates a new payment contract with specified satoshis
   * @param _satoshis - Amount of satoshis to lock in this payment contract
   * Gas fee: Paid by the creator of this contract
   */
  constructor(_satoshis: bigint) {
    super({ _satoshis })
  }

  /**
   * Transfers ownership of this payment contract to a new public key
   * @param to - Public key of the new owner
   * Gas fee: Paid by the caller of this method
   */
  transfer(to: string) {
    this._owners = [to]


  }

  /**
   * Sets the satoshi amount of this payment contract
   * @param a - New satoshi amount
   * Gas fee: Paid by the caller of this method
   */
  setSatoshis(a: bigint) {
    this._satoshis = a
  }

  /**
   * Withdraws funds from the payment contract by reducing it to minimum dust
   * The excess satoshis are automatically transferred to the owner's wallet via UTXO mechanics
   * Gas fee: Paid by the caller of this method
   * @throws Error if the payment amount is below the minimum required for withdrawal
   */
  withdraw() {
    // Ensure there are sufficient funds for withdrawal (more than dust amount)
    if (this._satoshis <= 546n) {
      throw new Error(`Insufficient funds for withdrawal. Minimum required: 547 sats, current: ${this._satoshis} sats`);
    }

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

/**
 * The Withdraw contract that reduces payment satoshis to minimum dust amount
 * This releases the excess satoshis to the owner's wallet through the Bitcoin Computer's UTXO model
 * Gas fee: Paid by the caller of this static method
 */
export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.withdraw())
  }
}