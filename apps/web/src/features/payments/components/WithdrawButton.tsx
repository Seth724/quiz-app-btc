/**
 * Withdraw Button Component - Handle payment withdrawals via blockchain
 */

'use client'

import { useState } from 'react'
import { useQuizClient } from '@/hooks'
import { formatSatoshis } from '@/services'
import type { PaymentDisplay } from './PaymentRow'

interface WithdrawButtonProps {
  payments: PaymentDisplay[]
  address: string
  onSuccess?: () => void
}

export function WithdrawButton({ payments, address, onSuccess }: WithdrawButtonProps) {
  const quizClient = useQuizClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const totalBalance = payments.reduce((sum, p) => sum + p._satoshis, 0)

  const handleWithdraw = async () => {
    try {
      setLoading(true)
      setError(null)

      if (payments.length === 0) {
        throw new Error('No payments to withdraw')
      }

      const result = await quizClient.withdrawAllPayments()
      console.log(`Withdrawn ${result.totalWithdrawn} sats from ${result.count} payments`)

      onSuccess?.()
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={payments.length === 0}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Withdraw {formatSatoshis(totalBalance)} LTC
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Withdrawal</h2>
            
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Amount:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatSatoshis(totalBalance)} LTC
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payments:</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
                <p className="text-sm font-medium mb-1">To Address:</p>
                <p className="text-xs font-mono break-all">{address}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Withdrawing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
