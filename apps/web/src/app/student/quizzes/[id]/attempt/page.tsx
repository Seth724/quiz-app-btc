'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuiz } from '@/features/quizzes'
import { AttemptForm } from '@/features/attempts'
import { useAccessClient } from '@/hooks'
import { hasAccess } from '@/features/access'
import { useSessionStore } from '@/stores'

export default function AttemptQuizPage() {
  const params = useParams()
  const quizId = params?.id as string
  const { quiz, loading } = useQuiz(quizId)
  const accessClient = useAccessClient()
  const { userId } = useSessionStore()

  const [accessTokenId, setAccessTokenId] = useState<string | null>(null)
  const [loadingAccess, setLoadingAccess] = useState(true)

  useEffect(() => {
    const loadAccessToken = async () => {
      if (!quiz || !userId) {
        setLoadingAccess(false)
        return
      }

      try {
        // Get access tokens for this quiz
        const accesses = await accessClient.listByStudent(userId)
        const quizAccess = accesses.find(a => a.quizId === quizId && a.hasAccess)

        if (quizAccess) {
          setAccessTokenId(quizAccess._id)
        }
      } catch (error) {
        console.error('Failed to load access token:', error)
      } finally {
        setLoadingAccess(false)
      }
    }

    loadAccessToken()
  }, [quiz, userId, accessClient])

  if (loading || loadingAccess) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  if (!accessTokenId) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">No Access</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have access to this quiz. Please purchase access first.
          </p>
          <Link
            href={`/student/quizzes/${quizId}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Quiz Details
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Good luck! Take your time and read each question carefully.
          </p>
        </div>

        <AttemptForm quiz={quiz} accessTokenId={accessTokenId} />
      </div>
    </div>
  )
}
