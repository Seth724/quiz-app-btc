/**
 * Buy Access Modal Component
 */

'use client'

import { useState } from 'react'
import { useAccessClient } from '@/hooks'
import { purchaseAccess } from '../access.service'
import { formatSatoshis } from '@/services'
import type { Quiz } from '@/features/quizzes'

interface BuyAccessModalProps {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BuyAccessModal({ quiz, isOpen, onClose, onSuccess }: BuyAccessModalProps) {
  const accessClient = useAccessClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use entryFee as the price to purchase access
      await purchaseAccess(accessClient, quiz._id, quiz.entryFee)

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase access')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Purchase Quiz Access</h2>

        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Answer the question correctly to win the reward!
            </p>
            <div className="flex justify-between text-sm">
              <span>Entry Fee:</span>
              <span className="font-medium">{formatSatoshis(quiz.entryFee)} LTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reward:</span>
              <span className="font-medium">{formatSatoshis(quiz.rewardAmount)} LTC</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Price:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatSatoshis(quiz.entryFee)} LTC
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Purchasing...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  )
}
