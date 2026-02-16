'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getQuiz, type Quiz } from '@/features/quizzes'
import { useQuizClient } from '@/hooks/useClients'
import { Card, Loader } from '@/components'

export default function TeacherQuizDetailPage() {
  const params = useParams()
  const quizId = params.id as string
  const quizClient = useQuizClient()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!quizClient || !quizId) {
          setError('Quiz client not available or quiz ID missing')
          return
        }

        const quizData = await getQuiz(quizClient, quizId)
        if (quizData) {
          setQuiz(quizData)
        } else {
          setError('Quiz not found')
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err)
        setError('Failed to load quiz details')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, quizClient])

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/teacher" className="text-blue-600 hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Quiz not found</p>
              <Link href="/teacher" className="text-blue-600 hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Quiz Details
          </p>
        </div>

        <div className="grid gap-8">
          {/* Quiz Details */}
          <Card>
            <h2 className="text-2xl font-semibold mb-6">Quiz Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <p className="text-lg">{quiz.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question
                </label>
                <p className="text-lg">{quiz.questionText}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Options
                </label>
                <div className="space-y-2">
                  {quiz.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index === quiz.correctAnswer 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      {index === quiz.correctAnswer && (
                        <span className="ml-2 text-green-600 font-semibold">(Correct Answer)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entry Fee
                  </label>
                  <p className="text-lg">{Number(quiz.entryFee)} satoshis</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reward Amount
                  </label>
                  <p className="text-lg">{Number(quiz.rewardAmount)} satoshis</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <p className={`text-lg font-semibold ${quiz.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Attempts
                  </label>
                  <p className="text-lg">{quiz.attemptCount}</p>
                </div>
              </div>
              
              {quiz.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Created
                  </label>
                  <p className="text-lg">{new Date(quiz.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="text-2xl font-semibold mb-6">Actions</h2>
            <div className="flex gap-4">
              <Link 
                href="/teacher/create"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another Quiz
              </Link>
              
              <button 
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => window.location.reload()}
              >
                Refresh Details
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}