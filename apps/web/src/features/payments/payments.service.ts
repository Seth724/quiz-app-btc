/**
 * Payments Service - Handle payment operations
 */

'use client'

import type { PaymentClient } from '@quiz-app/sdk'

export interface Payment {
  _id: string
  _rev: string
  amount: number
  recipient: string
  sender: string
  createdAt: number
}

/**
 * Create payment
 */
export async function createPayment(
  paymentClient: PaymentClient,
  recipient: string,
  amount: number
): Promise<Payment> {
  const payment = await paymentClient.create(recipient, amount)
  return payment
}

/**
 * Withdraw payments (batch delete)
 */
export async function withdrawPayments(
  paymentClient: PaymentClient,
  paymentRevs: string[]
): Promise<void> {
  await paymentClient.withdraw(paymentRevs)
}

/**
 * Get user payments
 */
export async function getUserPayments(
  paymentClient: PaymentClient,
  userId: string
): Promise<Payment[]> {
  try {
    const payments = await paymentClient.listByUser(userId)
    return payments
  } catch (error) {
    console.error('Failed to get payments:', error)
    return []
  }
}

/**
 * Calculate total available balance
 */
export function calculateAvailableBalance(payments: Payment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0)
}
