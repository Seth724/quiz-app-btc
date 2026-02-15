/**
 * Quiz Grid Component - Display multiple quizzes
 */

'use client'

import { QuizCard } from './QuizCard'
import type { Quiz } from '../quizzes.service'

interface QuizGridProps {
  quizzes: Quiz[]
  viewMode?: 'teacher' | 'student'
  loading?: boolean
  emptyMessage?: string
}

export function QuizGrid({ 
  quizzes, 
  viewMode = 'student', 
  loading = false,
  emptyMessage = 'No quizzes available'
}: QuizGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz._id} quiz={quiz} viewMode={viewMode} />
      ))}
    </div>
  )
}
