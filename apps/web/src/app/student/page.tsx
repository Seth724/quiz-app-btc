'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSessionStore, useWalletStore } from '@/stores'
import { getAllQuizzes, type Quiz } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'
import { useAttemptClient, useQuizClient } from '@/hooks'
import { getStudentAttempts } from '@/features/attempts'
import { formatSatoshis } from '@/services'

export default function StudentPage() {
  const { userId, setRole } = useSessionStore()
  const { isConnected, publicKey } = useWalletStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [quizzesTaken, setQuizzesTaken] = useState(0)
  const [totalRewards, setTotalRewards] = useState(0)
  const [withdrawableAmount, setWithdrawableAmount] = useState(0)
  const [withdrawableCount, setWithdrawableCount] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null)
  const attemptClient = useAttemptClient()
  const quizClient = useQuizClient()

  useEffect(() => {
    setRole('student')
  }, [setRole])

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

  // Fetch student stats from blockchain (deduplicated by quiz)
  // Only counts rewards where quiz.claimedBy matches this student (actual payment recipient)
  useEffect(() => {
    if (!publicKey) return
    const fetchStats = async () => {
      try {
        const attempts = await getStudentAttempts(attemptClient, publicKey)
        const completed = attempts.filter(a => a.selectedAnswer !== undefined && a.selectedAnswer >= 0)
        
        // Deduplicate by quizId — only count one attempt per quiz
        const quizMap = new Map<string, typeof completed[0]>()
        for (const a of completed) {
          if (!quizMap.has(a.quizId)) {
            quizMap.set(a.quizId, a)
          }
        }
        
        setQuizzesTaken(quizMap.size)

        // Check quiz.claimedBy on-chain to determine actual reward recipient
        // (same approach as leaderboard — only count rewards if this student was paid)
        let rewards = 0
        const { createComputerFromStorage } = await import('@/services')
        const computer = createComputerFromStorage()
        for (const [quizId, a] of quizMap) {
          try {
            let quizRev = quizId
            try {
              const latestQuizRev = await computer.latest(quizId)
              if (latestQuizRev) quizRev = latestQuizRev
            } catch { /* use original */ }
            const quiz = await computer.sync(quizRev) as any
            // Only count reward if this student actually received the payment
            if (quiz?.claimedBy === publicKey) {
              rewards += Number(String(quiz?.rewardAmount ?? a.rewardEarned ?? 0).replace(/n$/, ''))
            }
          } catch {
            // Skip unresolvable quizzes
          }
        }
        setTotalRewards(rewards)
      } catch (err) {
        console.error('Failed to fetch student stats:', err)
      }
    }
    fetchStats()
  }, [publicKey, attemptClient])

  // Fetch withdrawable payment objects
  useEffect(() => {
    if (!publicKey) return
    const fetchPayments = async () => {
      try {
        const payments = await quizClient.getOwnedPayments(publicKey)
        const total = payments.reduce((s, p) => s + p._satoshis, 0)
        setWithdrawableAmount(total)
        setWithdrawableCount(payments.length)
      } catch (err) {
        console.error('Failed to fetch withdrawable payments:', err)
      }
    }
    fetchPayments()
  }, [publicKey, quizClient])

  const handleWithdrawAll = async () => {
    setWithdrawing(true)
    setWithdrawResult(null)
    try {
      const result = await quizClient.withdrawAllPayments()
      if (result.count > 0) {
        setWithdrawResult(`Successfully withdrew ${formatSatoshis(result.totalWithdrawn)} LTC from ${result.count} payment(s)`)
        setWithdrawableAmount(0)
        setWithdrawableCount(0)
      } else {
        setWithdrawResult('No payments to withdraw')
      }
    } catch (err) {
      setWithdrawResult(`Withdraw failed: ${(err as any)?.message}`)
    } finally {
      setWithdrawing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Connect Wallet</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Connect your wallet to access quizzes and start earning rewards
          </p>
          <Link
            href="/wallet"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Browse quizzes and earn rewards</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Quizzes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizzesTaken}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">💎</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rewards</h3>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{formatSatoshis(totalRewards)} LTC</p>
          </div>
        </div>

        {/* Withdraw Rewards Card */}
        {withdrawableCount > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    {withdrawableCount} Reward Payment{withdrawableCount > 1 ? 's' : ''} Available
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatSatoshis(withdrawableAmount)} LTC ready to withdraw
                  </p>
                </div>
              </div>
              <button
                onClick={handleWithdrawAll}
                disabled={withdrawing}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {withdrawing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Withdrawing...
                  </span>
                ) : (
                  'Withdraw All'
                )}
              </button>
            </div>
            {withdrawResult && (
              <p className={`mt-3 text-sm font-medium ${withdrawResult.includes('Successfully') ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
                {withdrawResult}
              </p>
            )}
          </div>
        )}

        {/* Available Quizzes */}
        <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Quizzes</h2>
            <Link
              href="/student/quizzes"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
          
          <QuizGrid 
            quizzes={quizzes.slice(0, 6)} 
            viewMode="student"
            loading={loading}
            emptyMessage="No quizzes available. Check back later!"
          />
        </div>
      </div>
    </div>
  )
}
