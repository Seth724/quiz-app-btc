import { Computer } from '@bitcoin-computer/lib'
import { Payment } from '../payment.js'
import { MineBlocks } from '../utils/mineblock.js'

export class PaymentHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Payment}`)
    return this.mod
  }

  async createPaymentTx(satoshis: bigint): Promise<unknown> {
    const exp = `new Payment(${satoshis}n)`
    return this.computer.encode({
      exp,
      mod: this.mod,
    })
  }

  async createPayment(satoshis: bigint): Promise<Payment> {
    const payment = await this.computer.new(Payment, [satoshis])
    await this.mineBlock()
    return payment
  }

  async getPayment(paymentTxId: string): Promise<Payment> {
    // Use the payment ID directly if it already includes the revision, otherwise sync directly
    const syncedPayment = await this.computer.sync(paymentTxId) as Payment
    return syncedPayment
  }

  // Direct transfer is now handled in student helper for better control
  // async transferPayment method removed - use payment.transfer() directly

  async updatePaymentAmount(payment: Payment, newAmount: bigint) {
    payment.setSatoshis(newAmount)
    await this.mineBlock()
  }

  async mineBlock() {
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
  }
}