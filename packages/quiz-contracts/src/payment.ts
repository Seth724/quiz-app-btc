import { Contract } from '@bitcoin-computer/lib'

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
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }
}

export class PaymentHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Payment}`)
    return this.mod
  }

  async createPaymentTx(satoshis: bigint) {
    const exp = `new Payment(${satoshis}n)`
    return this.computer.encode({
      exp,
      mod: this.mod,
    })
  }

  async getPayment(paymentTxId: string): Promise<Payment> {
    const rev = await this.computer.latest(`${paymentTxId}:0`)
    const syncedPayment: Payment = await this.computer.sync(rev)
    return syncedPayment
  }

  async transferPayment(paymentTxId: string, recipientPublicKey: string): Promise<string> {
    // Get the payment object
    const payment = await this.getPayment(paymentTxId)
    
    // Transfer ownership to recipient
    await payment.transfer(recipientPublicKey)
    
    // Return the payment transaction ID
    return paymentTxId
  }

  
}

export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.setSatoshis(0n))
  }
}