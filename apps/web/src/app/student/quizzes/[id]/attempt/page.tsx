'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { AttemptForm } from '@/features/attempts'

export default function AttemptQuizPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = decodeURIComponent(params?.id as string)
  const accessTokenId = searchParams?.get('accessTokenId') || ''
  const { quiz, loading } = useQuiz(quizId)

  if (loading) {
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
          <h1 className="text-2xl font-bold mb-4">Missing Access Token</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need a valid access token to attempt this quiz.
          </p>
          <Link href={`/student/quizzes/${quizId}`} className="text-blue-600 hover:underline">
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
