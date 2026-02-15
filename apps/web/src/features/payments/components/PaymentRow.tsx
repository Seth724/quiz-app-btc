/**
 * Payment Row Component - Display payment info
 */

'use client'

import { formatSatoshis } from '@/services'
import { truncatePublicKey } from '@/lib'
import type { Payment } from '../payments.service'

interface PaymentRowProps {
  payment: Payment
}

export function PaymentRow({ payment }: PaymentRowProps) {
  const date = new Date(payment.createdAt).toLocaleDateString()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
            <span className="text-sm font-mono">
              {truncatePublicKey(payment.sender)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">To:</span>
            <span className="text-sm font-mono">
              {truncatePublicKey(payment.recipient)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatSatoshis(payment.amount)} LTC
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {date}
          </div>
        </div>
      </div>
    </div>
  )
}
