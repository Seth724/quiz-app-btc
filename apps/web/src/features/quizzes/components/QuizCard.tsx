/**
 * Quiz Card Component - Display a single quiz (1 question)
 */

'use client'

import Link from 'next/link'
import { formatSatoshis } from '@/services'
import type { Quiz } from '../quizzes.service'

interface QuizCardProps {
  quiz: Quiz
  viewMode?: 'teacher' | 'student'
}

export function QuizCard({ quiz, viewMode = 'student' }: QuizCardProps) {
  const href = viewMode === 'teacher' 
    ? `/teacher/quizzes/${quiz._id}` 
    : `/student/quizzes/${quiz._id}`

  return (
    <Link
      href={href}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
        {quiz.title}
      </h3>

      {/* Question Preview */}
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {quiz.questionText}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">
              4 options
            </span>
          </div>

          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">
              {quiz.attemptCount || 0} attempts
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        {/* Entry Fee */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Entry Fee</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {formatSatoshis(quiz.entryFee)} LTC
          </p>
        </div>

        {/* Reward */}
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Reward</p>
          <p className="font-bold text-green-600 dark:text-green-400">
            {formatSatoshis(quiz.rewardAmount)} LTC
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-2 mt-3">
        {!quiz.isActive && (
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            Inactive
          </span>
        )}
        {quiz.isClaimed && (
          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
            Claimed
          </span>
        )}
        {quiz.isActive && !quiz.isClaimed && (
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
            Available
          </span>
        )}
      </div>
    </Link>
  )
}
