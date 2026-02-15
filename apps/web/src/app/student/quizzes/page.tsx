'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllQuizzes, type Quiz } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const data = await getAllQuizzes()
        setQuizzes(data as Quiz[])
      } catch (error) {
        console.error('Failed to fetch quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/student" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Browse Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Explore all available quizzes and start learning
          </p>
        </div>

        <QuizGrid 
          quizzes={quizzes} 
          viewMode="student"
          loading={loading}
          emptyMessage="No quizzes available at the moment"
        />
      </div>
    </div>
  )
}
