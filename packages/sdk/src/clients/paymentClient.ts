import { Computer } from '@bitcoin-computer/lib'
import { PaymentHelper } from '@quiz-app/contracts'
import type { WithdrawResult } from '@quiz-app/shared'

/**
 * PaymentClient - Clean interface for payment operations
 */
export class PaymentClient {
  private computer: Computer
  private paymentHelper: PaymentHelper

  constructor(computer: Computer, paymentMod?: string) {
    this.computer = computer
    this.paymentHelper = new PaymentHelper(computer, paymentMod)
  }

  /**
   * Deploy payment module
   */
  async deploy() {
    return await this.paymentHelper.deploy()
  }

  /**
   * Create a payment object
   */
  async createPayment(satoshis: bigint) {
    return await this.paymentHelper.createPayment(satoshis)
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentTxId: string) {
    return await this.paymentHelper.getPayment(paymentTxId)
  }

  /**
   * Transfer payment to another public key
   */
  async transferPayment(paymentTxId: string, toPublicKey: string) {
    await this.paymentHelper.transferPaymentById(paymentTxId, toPublicKey)
  }

  /**
   * Check if payment is owned by a specific public key
   */
  async isPaymentOwnedBy(paymentTxId: string, publicKey: string): Promise<boolean> {
    return await this.paymentHelper.isPaymentOwnedBy(paymentTxId, publicKey)
  }

  /**
   * Get payment owners
   */
  async getPaymentOwners(paymentTxId: string): Promise<string[]> {
    return await this.paymentHelper.getPaymentOwners(paymentTxId)
  }

  /**
   * Get payment amount
   */
  async getPaymentAmount(paymentTxId: string): Promise<bigint> {
    return await this.paymentHelper.getPaymentAmount(paymentTxId)
  }

  /**
   * Withdraw payment (claim satoshis)
   */
  async withdrawPayment(paymentTxId: string): Promise<bigint> {
    return await this.paymentHelper.withdrawPaymentById(paymentTxId)
  }

  /**
   * Send reward directly to student address
   */
  async sendRewardToStudent(amount: bigint, studentAddress: string): Promise<string> {
    return await this.paymentHelper.sendRewardToStudent(amount, studentAddress)
  }
}
