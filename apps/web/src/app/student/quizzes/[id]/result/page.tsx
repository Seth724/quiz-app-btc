'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { useAttemptClient } from '@/hooks'
import { getAttempt, type Attempt } from '@/features/attempts'
import { ResultPanel } from '@/features/attempts'

export default function QuizResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params?.id as string
  const attemptId = searchParams?.get('attemptId')
  
  const { quiz, loading: quizLoading } = useQuiz(quizId)
  const attemptClient = useAttemptClient()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttempt = async () => {
      if (attemptId) {
        try {
          setLoading(true)
          const data = await getAttempt(attemptClient, attemptId)
          setAttempt(data)
        } catch (error) {
          console.error('Failed to fetch attempt:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAttempt()
  }, [attemptId, attemptClient])

  if (loading || quizLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Result Not Found</h1>
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
          <Link href="/student" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Quiz Results: {quiz.title}</h1>
        </div>

        <ResultPanel attempt={attempt} quiz={quiz} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/student/quizzes"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Browse More Quizzes
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
