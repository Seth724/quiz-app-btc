/**
 * Attempt Form Component - Answer ONE quiz question
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAttemptClient } from '@/hooks'
import { submitAttempt } from '../attempts.service'
import type { Quiz } from '@/features/quizzes'

interface AttemptFormProps {
  quiz: Quiz
  accessTokenId: string // QuizAccess token ID to burn
  onComplete?: (attemptId: string) => void
}

export function AttemptForm({ quiz, accessTokenId, onComplete }: AttemptFormProps) {
  const router = useRouter()
  const attemptClient = useAttemptClient()
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate answer selected
      if (selectedAnswer === -1) {
        throw new Error('Please select an answer')
      }

      const attempt = await submitAttempt(attemptClient, {
        quizId: quiz._id,
        selectedAnswer,
        accessTokenId,
      })

      onComplete?.(attempt._id)
      router.push(`/student/quizzes/${quiz._id}/result?attemptId=${attempt._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attempt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          ⚡ <strong>Winner takes all!</strong> The first student to answer correctly wins the full reward of{' '}
          <strong>{Number(quiz.rewardAmount).toLocaleString()} satoshis</strong>
        </p>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">{quiz.questionText}</h2>

        <div className="space-y-3">
          {quiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              disabled={loading}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                selectedAnswer === index
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === -1 || loading}
          className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {/* Warning */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        ⚠️ Once submitted, you cannot change your answer. Your QuizAccess token will be consumed.
      </p>
    </div>
  )
}
