'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { BuyAccessModal } from '@/features/access'
import { hasAccess } from '@/features/access'
import { useAccessClient } from '@/hooks'
import { useSessionStore } from '@/stores'
import { formatSatoshis } from '@/services'

export default function QuizDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.id as string
  const { quiz, loading } = useQuiz(quizId)
  const accessClient = useAccessClient()
  const { userId } = useSessionStore()
  
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [hasAccessToQuiz, setHasAccessToQuiz] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    const checkQuizAccess = async () => {
      if (quiz && userId) {
        try {
          const access = await hasAccess(accessClient, userId, quizId)
          setHasAccessToQuiz(access)
        } catch (error) {
          console.error('Failed to check access:', error)
        } finally {
          setCheckingAccess(false)
        }
      }
    }

    checkQuizAccess()
  }, [quiz, userId, quizId, accessClient])

  const handleStartQuiz = () => {
    if (hasAccessToQuiz) {
      router.push(`/student/quizzes/${quizId}/attempt`)
    } else {
      setShowBuyModal(true)
    }
  }

  const handlePurchaseSuccess = () => {
    setHasAccessToQuiz(true)
    router.push(`/student/quizzes/${quizId}/attempt`)
  }

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz Not Found</h1>
          <Link href="/student/quizzes" className="text-blue-600 hover:underline">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/student/quizzes" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Quizzes
          </Link>
        </div>

        {/* Quiz Header */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
            Answer this question correctly to win the reward!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entry Fee</p>
              <p className="text-2xl font-bold text-blue-600">{formatSatoshis(quiz.entryFee)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reward</p>
              <p className="text-2xl font-bold text-green-600">{formatSatoshis(quiz.rewardAmount)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Attempts</p>
              <p className="text-2xl font-bold text-purple-600">{quiz.attemptCount}</p>
            </div>
          </div>

          <div className="flex gap-4">
            {hasAccessToQuiz ? (
              <>
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition"
                >
                  Start Quiz
                </button>
                <div className="px-6 py-4 bg-green-100 dark:bg-green-900 rounded-lg flex items-center">
                  <span className="text-green-700 dark:text-green-200 font-medium">
                    ✓ Access Granted
                  </span>
                </div>
              </>
            ) : (
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition"
              >
                Purchase Access & Start Quiz
              </button>
            )}
          </div>
        </div>

        {/* Question Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Question Preview</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">{quiz.questionText}</p>
                <div className="grid grid-cols-2 gap-2">
                  {quiz.options.map((option, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                      {String.fromCharCode(65 + idx)}. {option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Access Modal */}
        {quiz && (
          <BuyAccessModal
            quiz={quiz}
            isOpen={showBuyModal}
            onClose={() => setShowBuyModal(false)}
            onSuccess={handlePurchaseSuccess}
          />
        )}
      </div>
    </div>
  )
}
