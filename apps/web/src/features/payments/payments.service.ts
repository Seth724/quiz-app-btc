/**
 * Payments Service - Handle payment operations
 */

'use client'

// Note: Payment operations are now handled by PaymentHelper from @quiz-app/contracts
// This service file is kept for backward compatibility but can be removed

export interface Payment {
  _id: string
  _rev: string
  amount: bigint
  recipient: string
  sender: string
  createdAt: number
}

/**
 * Create payment - Use PaymentHelper from @quiz-app/contracts instead
 */
export async function createPayment(
  // paymentClient: PaymentClient,  // Deprecated - use PaymentHelper
  recipient: string,
  amount: bigint
): Promise<Payment> {
  throw new Error('Use PaymentHelper from @quiz-app/contracts instead')
}

/**
 * Withdraw payments - Use PaymentHelper from @quiz-app/contracts instead
 */
export async function withdrawPayments(
  // paymentClient: PaymentClient,  // Deprecated - use PaymentHelper
  paymentRevs: string[]
): Promise<void> {
  throw new Error('Use PaymentHelper from @quiz-app/contracts instead')
}

/**
 * Get user payments - Query blockchain directly instead
 */
export async function getUserPayments(
  // paymentClient: PaymentClient,  // Deprecated - use PaymentHelper
  userId: string
): Promise<Payment[]> {
  console.warn('Use PaymentHelper from @quiz-app/contracts instead')
  return []
}

/**
 * Calculate total available balance
 */
export function calculateAvailableBalance(payments: Payment[]): bigint {
  return payments.reduce((sum, payment) => sum + payment.amount, BigInt(0))
}
