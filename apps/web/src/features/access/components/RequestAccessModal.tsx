/**
 * Request Access Modal - Student requests access to quiz
 * This initiates the access purchase flow
 */

'use client'

import { useState } from 'react'
import { useComputer } from '@/hooks'
import { useWalletStore } from '@/stores'
import { requestAccess } from '../access.service'
import { formatSats } from '@/lib'
import type { Quiz } from '@/features/quizzes'

interface RequestAccessModalProps {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RequestAccessModal({ quiz, isOpen, onClose, onSuccess }: RequestAccessModalProps) {
  const computer = useComputer()
  const { publicKey } = useWalletStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'init' | 'payment' | 'waiting'>('init')

  const handleRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      setStep('payment')

      if (!publicKey) {
        throw new Error('Wallet not connected')
      }

      // Step 1: Create entry fee payment
      const result = await requestAccess({
        quizId: quiz._id,
        quizTitle: quiz.title,
        studentPublicKey: publicKey,
        teacherPublicKey: quiz.teacherPublicKey || '',
        entryFee: String(quiz.entryFee),
      })

      console.log('✅ Access request created:', result.id)
      setStep('waiting')

      // Step 2: In a real implementation, this would:
      // - Send notification to teacher
      // - Teacher mints QuizAccess token
      // - Teacher creates sale offer
      // - Student finalizes and broadcasts
      
      // For now, we'll simulate the flow
      setTimeout(() => {
        setStep('init')
        onSuccess()
      }, 2000)

    } catch (err) {
      console.error('Access request failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to request access')
      setStep('init')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setStep('init')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">💰 Request Quiz Access</h2>

        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {quiz.questionText}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Entry Fee:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {formatSats(quiz.entryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reward:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatSats(quiz.rewardAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2">📋 How it works:</h4>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Request access by creating entry fee payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Teacher receives notification and mints access token</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Teacher creates sale offer for you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>You finalize the transaction and get access</span>
              </li>
            </ol>
          </div>

          {step === 'waiting' && (
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 text-center">
              <p className="text-yellow-700 dark:text-yellow-200 font-medium">
                ⏳ Waiting for teacher to approve your access request...
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
                The teacher will see your request in their notifications and create your access token.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {step === 'waiting' ? 'Close' : 'Cancel'}
          </button>
          {step !== 'waiting' && (
            <button
              onClick={handleRequest}
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Payment...' : 'Request Access'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
