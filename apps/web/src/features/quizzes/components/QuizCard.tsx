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
  onDeactivate?: (quizId: string) => void
  deactivating?: boolean
}

export function QuizCard({ quiz, viewMode = 'student', onDeactivate, deactivating }: QuizCardProps) {
  const href = viewMode === 'teacher' 
    ? `/teacher/quizzes/${quiz._id}` 
    : `/student/quizzes/${quiz._id}`

  const statusConfig = !quiz.isActive
    ? { label: 'Inactive', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }
    : quiz.isClaimed
    ? { label: 'Claimed', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' }
    : { label: 'Available', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' }

  return (
    <div className="group relative rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 overflow-hidden">
      <Link href={href} className="block p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {quiz.attemptCount || 0} attempts
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {quiz.title}
        </h3>

        {/* Question Preview */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
          {quiz.questionText}
        </p>

        {/* Fee & Reward */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium mb-0.5">Entry Fee</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatSatoshis(quiz.entryFee)} LTC
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium mb-0.5">Reward</p>
            <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatSatoshis(quiz.rewardAmount)} LTC
            </p>
          </div>
        </div>
      </Link>

      {/* Deactivate button — teacher only, active quizzes only */}
      {viewMode === 'teacher' && quiz.isActive && onDeactivate && (
        <div className="px-6 pb-5">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDeactivate(quiz._id)
            }}
            disabled={deactivating}
            className="w-full py-2.5 px-4 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deactivating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Deactivating...
              </span>
            ) : (
              '🚫 Deactivate Quiz'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
