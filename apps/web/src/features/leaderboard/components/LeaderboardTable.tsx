/**
 * Leaderboard Table Component — Professional Design
 */

'use client'

import { formatSatoshis } from '@/services'
import { truncatePublicKey } from '@/lib'
import type { LeaderboardEntry } from '../leaderboard.service'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentStudentId?: string
  loading?: boolean
}

export function LeaderboardTable({ entries, currentStudentId, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="animate-pulse space-y-1 p-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
          <span className="text-3xl">🏆</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          No leaderboard entries yet. Be the first!
        </p>
      </div>
    )
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', bg: 'bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-500/20 dark:to-yellow-500/10' }
    if (rank === 2) return { emoji: '🥈', bg: 'bg-gradient-to-r from-gray-100 to-slate-50 dark:from-gray-500/20 dark:to-slate-500/10' }
    if (rank === 3) return { emoji: '🥉', bg: 'bg-gradient-to-r from-orange-100 to-amber-50 dark:from-orange-500/20 dark:to-amber-500/10' }
    return { emoji: '', bg: '' }
  }

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700/50">
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Quizzes
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Rewards
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isCurrentStudent = entry.studentId === currentStudentId
              const { emoji, bg } = getRankDisplay(entry.rank)
              
              return (
                <tr
                  key={entry.studentId}
                  className={`border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors ${
                    isCurrentStudent
                      ? 'bg-indigo-50/50 dark:bg-indigo-500/10'
                      : `hover:bg-gray-50/50 dark:hover:bg-white/[0.02] ${bg}`
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {emoji ? (
                        <span className="text-2xl">{emoji}</span>
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                          {entry.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {(entry.studentName || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {entry.studentName || 'Anonymous'}
                          {isCurrentStudent && (
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {truncatePublicKey(entry.studentId)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{entry.quizzesCompleted}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold ${
                      entry.totalRewards > 0
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {formatSatoshis(entry.totalRewards)} LTC
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
