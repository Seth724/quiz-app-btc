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
  onDeactivate?: (quizId: string) => void
  deactivatingQuizId?: string | null
}

export function QuizGrid({ 
  quizzes, 
  viewMode = 'student', 
  loading = false,
  emptyMessage = 'No quizzes available',
  onDeactivate,
  deactivatingQuizId,
}: QuizGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/70 dark:bg-white/5 border border-gray-200/50 dark:border-gray-700/50 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-5 w-5/6"></div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between">
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz._id}
          quiz={quiz}
          viewMode={viewMode}
          onDeactivate={onDeactivate}
          deactivating={deactivatingQuizId === quiz._id}
        />
      ))}
    </div>
  )
}
