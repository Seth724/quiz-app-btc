/**
 * Payment Row Component - Display payment info from blockchain
 */

'use client'

import { formatSatoshis } from '@/services'
import { truncatePublicKey } from '@/lib'

export interface PaymentDisplay {
  _id: string
  _rev: string
  _satoshis: number
  _owners?: string[]
}

interface PaymentRowProps {
  payment: PaymentDisplay
}

export function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">ID:</span>
            <span className="text-sm font-mono">
              {payment._id.substring(0, 12)}...
            </span>
          </div>
          {payment._owners && payment._owners.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Owner:</span>
              <span className="text-sm font-mono">
                {truncatePublicKey(payment._owners[0])}
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatSatoshis(payment._satoshis)} LTC
          </div>
        </div>
      </div>
    </div>
  )
}
