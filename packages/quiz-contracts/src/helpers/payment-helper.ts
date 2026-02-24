import { Computer } from '@bitcoin-computer/lib'
import { Payment, Withdraw } from '../payment.js'
//import { PaymentType } from '../types/index.js'

export class PaymentHelper {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${Payment}; export ${Withdraw}`)
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
    const payment = await this.computer.new(Payment, [satoshis]) as unknown as Payment
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 1500))
    return payment
  }

  async getPayment(paymentTxId: string): Promise<Payment> {

    const id = paymentTxId.includes(':') ? paymentTxId :`${paymentTxId}:0`
    const rev = await this.computer.getLatestRev(id)

    const syncedPayment = await this.computer.sync(rev) as unknown as Payment
    return syncedPayment
  }

  // Transfer payment ownership to another public key
  async transferPayment(payment: Payment, toPublicKey: string): Promise<void> {
    await payment.transfer(toPublicKey)
    // Add delay to ensure blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Transfer payment by payment ID
  async transferPaymentById(paymentTxId: string, toPublicKey: string): Promise<void> {
    const payment = await this.getPayment(paymentTxId)
    await this.transferPayment(payment, toPublicKey)
  }

  // Verify if payment is owned by a specific public key
  async isPaymentOwnedBy(paymentTxId: string, publicKey: string): Promise<boolean> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners.includes(publicKey)
  }

  // Get current owners of a payment
  async getPaymentOwners(paymentTxId: string): Promise<string[]> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners
  }

  // Get the satoshi amount of a payment
  async getPaymentAmount(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return payment._satoshis
  }

  // Withdraw/claim the satoshis from a payment object to the owner's wallet using Withdraw contract
  async withdrawPayment(payment: Payment): Promise<bigint> {

    // Get payment ID and original amount
    const paymentId = await payment._id
    const originalAmount = await payment._satoshis

    // Check if payment has sufficient funds for withdrawal
    if (originalAmount <= 546n) {
      throw new Error(`Payment ${paymentId} has insufficient funds for withdrawal. Current: ${originalAmount} sats`);
    }

    // Sync the latest payment state
    const ownerPayment = await this.getPayment(paymentId)
    console.log('Payment object:', ownerPayment)

    console.log(`💰 Withdrawing payment of ${ originalAmount} sats to owner's wallet...`)
    await ownerPayment.withdraw()

    console.log("successfully withdrawn")

    const withdrawnAmount = originalAmount - 546n // Calculate the actual withdrawn amount
    await new Promise(resolve => setTimeout(resolve, 1500)) // wait for blockchain confirmation

    return withdrawnAmount
  }

  // Withdraw payment by payment ID
  async withdrawPaymentById(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return this.withdrawPayment(payment)
  }

  // Send reward directly from teacher's wallet to student's wallet
  async sendRewardToStudent(amount: bigint, studentAddress: string): Promise<string> {
    try {
      console.log(`💰 Sending reward of ${amount} sats to ${studentAddress}`)

      // Use Bitcoin Computer's send method to transfer satoshis directly
      const txId = await this.computer.send(amount, studentAddress)

      // Add delay to avoid mempool conflicts
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log(`✅ Reward sent successfully: ${txId}`)
      return txId
    } catch (error) {
      console.error(`❌ Reward transfer failed:`, error)
      throw error
    }
  }

  // Direct transfer of satoshis to winner's wallet (bypassing Payment objects) - for compatibility
  async transferRewardDirectly(amount: bigint, recipientAddress: string): Promise<string> {
    return await this.sendRewardToStudent(amount, recipientAddress);
  }
}