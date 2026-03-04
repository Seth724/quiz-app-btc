'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSessionStore, useWalletStore } from '@/stores'
import { useTeacherQuizzes, deactivateQuiz } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'
import { useQuizClient } from '@/hooks/useClients'
import { getAccessRequests } from '@/features/access/access.service'
import { formatSatoshis } from '@/services'
import { LoginModal } from '@/common-components/LoginModal'
import { SignupModal } from '@/common-components/SignupModal'
import { userService, hasAuthToken } from '@/services/backend'

type AuthModal = 'login' | 'signup' | null

export default function TeacherPage() {
  const router = useRouter()
  const { userId, userName, role, setRole } = useSessionStore()
  const { isConnected, publicKey } = useWalletStore()
  const { quizzes, loading, refresh } = useTeacherQuizzes(publicKey || '')
  const quizClient = useQuizClient()
  const [pendingRequests, setPendingRequests] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [withdrawableAmount, setWithdrawableAmount] = useState(0)
  const [withdrawableCount, setWithdrawableCount] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null)
  const [deactivatingQuizId, setDeactivatingQuizId] = useState<string | null>(null)
  const [authModal, setAuthModal] = useState<AuthModal>(null)

  // Show LoginModal if user isn't authenticated (no JWT token or no userName)
  const isAuthenticated = typeof window !== 'undefined' && hasAuthToken()
  useEffect(() => {
    if (!userName || !isAuthenticated) setAuthModal('login')
  }, [userName, isAuthenticated])

  // Redirect students away from teacher dashboard
  useEffect(() => {
    if (userName && isAuthenticated && role === 'student') {
      router.replace('/student')
    }
  }, [userName, isAuthenticated, role, router])

  useEffect(() => {
    if (!role || role === 'teacher') setRole('teacher')
  }, [setRole, role])

  // Auto-store teacher mnemonic for on-demand access token creation
  const mnemonicStored = useRef(false)
  useEffect(() => {
    if (!publicKey || mnemonicStored.current || !hasAuthToken()) return
    const mnemonic = typeof window !== 'undefined' ? localStorage.getItem('BIP_39_KEY') : null
    if (!mnemonic) return
    mnemonicStored.current = true
    userService.hasMnemonic(publicKey).then(has => {
      if (!has) {
        userService.storeMnemonic(publicKey, mnemonic).catch(() => {})
      }
    }).catch(() => {})
  }, [publicKey])

  // Fetch pending access request count
  useEffect(() => {
    if (!publicKey) return
    async function fetchPendingCount() {
      try {
        const requests = await getAccessRequests({ teacherPublicKey: publicKey!, status: 'pending' })
        setPendingRequests(requests.length)
      } catch {
        // ignore
      }
    }
    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 10000)
    return () => clearInterval(interval)
  }, [publicKey])

  // Derive Total Attempts from quiz.attemptCount (set from attemptedStudents.length)
  useEffect(() => {
    if (!quizzes.length) return
    let total = 0
    for (const quiz of quizzes) {
      total += quiz.attemptCount || 0
    }
    setTotalAttempts(total)
  }, [quizzes])

  // NOTE: Reward processing is now automatic (client-side via BrowserQuizClient.autoProcessReward()).
  // When a student answers correctly, the frontend processes the reward using the
  // teacher's stored mnemonic. Teachers only need to withdraw entry-fee payments.

  // Fetch withdrawable entry fee payments (exclude reward payments)
  useEffect(() => {
    if (!publicKey || !quizClient) return
    const fetchPayments = async () => {
      try {
        const payments = await quizClient.getOwnedPayments(publicKey, { excludeRewardPayments: true })
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
    if (!quizClient) return
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setWithdrawResult(`Withdraw failed: ${message}`)
    } finally {
      setWithdrawing(false)
    }
  }

  const handleDeactivateQuiz = async (quizId: string) => {
    setDeactivatingQuizId(quizId)
    try {
      await deactivateQuiz(quizClient, quizId)
      refresh()
    } catch (err) {
      console.error('Failed to deactivate quiz:', err)
    } finally {
      setDeactivatingQuizId(null)
    }
  }

  if (!isConnected) {
    return (
      <>
        {authModal === 'login' && <LoginModal onClose={() => setAuthModal(null)} onSwitchToSignup={() => setAuthModal('signup')} required />}
      {authModal === 'signup' && <SignupModal onClose={() => setAuthModal(null)} onSwitchToLogin={() => setAuthModal('login')} />}
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Connect Wallet</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Connect your wallet to access the teacher dashboard
          </p>
          <Link
            href="/wallet"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      {authModal === 'login' && <LoginModal onClose={() => setAuthModal(null)} onSwitchToSignup={() => setAuthModal('signup')} required />}
      {authModal === 'signup' && <SignupModal onClose={() => setAuthModal(null)} onSwitchToLogin={() => setAuthModal('login')} />}
      <div className="min-h-[calc(100vh-4rem)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-xl">👨‍🏫</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your quizzes and track progress</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Quizzes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizzes.filter(q => q.isActive).length}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Attempts</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalAttempts}</p>
          </div>
        </div>

        {/* Withdraw Entry Fees */}
        {withdrawableCount > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    {withdrawableCount} Entry Fee Payment{withdrawableCount > 1 ? 's' : ''} Available
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

        {/* Access Requests Card */}
        <Link href="/teacher/notifications" className="block group">
          <div className={`rounded-2xl p-6 transition-all duration-200 border hover:shadow-lg hover:-translate-y-0.5 ${
            pendingRequests > 0
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/50'
              : 'bg-white/70 dark:bg-white/5 border-gray-200/50 dark:border-gray-700/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  pendingRequests > 0
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/25'
                }`}>
                  <span className="text-2xl">🔔</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Access Requests</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review and approve student quiz access requests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pendingRequests > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-red-500/25 animate-pulse">
                    {pendingRequests} pending
                  </span>
                )}
                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </Link>

        {/* My Quizzes Section */}
        <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Quizzes</h2>
            <Link
              href="/teacher/create"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Create Quiz
            </Link>
          </div>
          
          <QuizGrid 
            quizzes={quizzes} 
            viewMode="teacher"
            loading={loading}
            emptyMessage="No quizzes yet. Create your first quiz to get started!"
            onDeactivate={handleDeactivateQuiz}
            deactivatingQuizId={deactivatingQuizId}
          />
        </div>
      </div>
    </div>
    </>
  )
}
