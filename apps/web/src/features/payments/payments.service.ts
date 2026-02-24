/**
 * Payments Service - Handle payment operations via quiz-contracts helpers
 */

'use client'

import { PaymentHelper } from '@quiz-app/contracts'
import { Payment as PaymentContract } from '@quiz-app/contracts'

export interface PaymentInfo {
  _id: string
  _rev: string
  _satoshis: bigint
  _owners: string[]
}

/**
 * Create a payment object on-chain
 */
export async function createPayment(
  paymentHelper: PaymentHelper,
  satoshis: bigint
): Promise<PaymentContract> {
  return paymentHelper.createPayment(satoshis)
}

/**
 * Withdraw a single payment (claim satoshis to wallet)
 */
export async function withdrawPayment(
  paymentHelper: PaymentHelper,
  paymentTxId: string
): Promise<bigint> {
  return paymentHelper.withdrawPaymentById(paymentTxId)
}

/**
 * Withdraw multiple payments (batch claim)
 */
export async function withdrawPayments(
  paymentHelper: PaymentHelper,
  paymentTxIds: string[]
): Promise<bigint> {
  let totalWithdrawn = BigInt(0)
  for (const txId of paymentTxIds) {
    const amount = await paymentHelper.withdrawPaymentById(txId)
    totalWithdrawn += amount
  }
  return totalWithdrawn
}

/**
 * Get payment info by transaction ID
 */
export async function getPayment(
  paymentHelper: PaymentHelper,
  paymentTxId: string
): Promise<PaymentContract> {
  return paymentHelper.getPayment(paymentTxId)
}

/**
 * Transfer payment to another public key
 */
export async function transferPayment(
  paymentHelper: PaymentHelper,
  paymentTxId: string,
  toPublicKey: string
): Promise<void> {
  return paymentHelper.transferPaymentById(paymentTxId, toPublicKey)
}

/**
 * Send reward directly to a student's address
 */
export async function sendReward(
  paymentHelper: PaymentHelper,
  amount: bigint,
  recipientAddress: string
): Promise<string> {
  return paymentHelper.sendRewardToStudent(amount, recipientAddress)
}

/**
 * Calculate total available balance from payment amounts
 */
export function calculateAvailableBalance(amounts: bigint[]): bigint {
  return amounts.reduce((sum, amount) => sum + amount, BigInt(0))
}
