import type { Computer } from '@bitcoin-computer/lib'
import { loadExportedClass } from './contract-loader.js'

type Payment = any
type Withdraw = any

export class PaymentHelper {
  computer: Computer
  paymentMod: string

  constructor(computer: Computer, paymentMod: string) {
    this.computer = computer
    this.paymentMod = paymentMod
  }

  async createPayment(rewardAmount: bigint): Promise<any> {
    const Payment = await loadExportedClass<any>(this.computer, this.paymentMod, 'Payment')
    const payment = await this.computer.new(Payment, [rewardAmount])
    await new Promise((r) => setTimeout(r, 1500))
    return payment
  }

  async getPayment(paymentTxId: string): Promise<any> {
    const id = paymentTxId.includes(':') ? paymentTxId : `${paymentTxId}:0`
    const rev = await this.computer.getLatestRev(id)
    return await this.computer.sync(rev)
  }

  async transferPayment(payment: any, toPublicKey: string): Promise<void> {
    await payment.transfer(toPublicKey)
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  async transferPaymentById(paymentTxId: string, toPublicKey: string): Promise<void> {
    const payment = await this.getPayment(paymentTxId)
    await this.transferPayment(payment, toPublicKey)
  }

  async isPaymentOwnedBy(paymentTxId: string, publicKey: string): Promise<boolean> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners.includes(publicKey)
  }

  async getPaymentOwners(paymentTxId: string): Promise<string[]> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners
  }

  async getPaymentAmount(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return payment._satoshis
  }

  async withdrawPayment(payment: any): Promise<bigint> {
    const paymentId = await payment._id
    const originalAmount = await payment._satoshis

    if (originalAmount <= 546n) {
      throw new Error(`Payment ${paymentId} has insufficient funds for withdrawal. Current: ${originalAmount} sats`)
    }

    const ownerPayment = await this.getPayment(paymentId)
    console.log('Payment object:', ownerPayment)

    console.log(`💰 Withdrawing payment of ${originalAmount} sats to owner's wallet...`)
    await ownerPayment.withdraw()

    console.log('successfully withdrawn')

    const withdrawnAmount = originalAmount - 546n
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return withdrawnAmount
  }

  async withdrawPaymentById(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return this.withdrawPayment(payment)
  }

  async sendRewardToStudent(amount: bigint, studentAddress: string): Promise<string> {
    try {
      console.log(`💰 Sending reward of ${amount} sats to ${studentAddress}`)
      const txId = await this.computer.send(amount, studentAddress)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log(`✅ Reward sent successfully: ${txId}`)
      return txId
    } catch (error) {
      console.error(`❌ Reward transfer failed:`, error)
      throw error
    }
  }

  async transferRewardDirectly(amount: bigint, recipientAddress: string): Promise<string> {
    return await this.sendRewardToStudent(amount, recipientAddress)
  }
}
