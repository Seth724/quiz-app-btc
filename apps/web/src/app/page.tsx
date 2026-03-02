'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks'
import { truncatePublicKey } from '@/lib'
import { useSessionStore } from '@/stores'
import { hasAuthToken } from '@/services/backend'
import { LoginModal } from '@/common-components/LoginModal'
import { SignupModal } from '@/common-components/SignupModal'

type AuthModal = 'login' | 'signup' | null

export default function HomePage() {
  const router = useRouter()
  const { isConnected, publicKey } = useWallet()
  const { userName, role, setRole } = useSessionStore()
  const [authModal, setAuthModal] = useState<AuthModal>(null)

  // Auto-redirect logged-in users to their role dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && hasAuthToken() && userName && role) {
      router.replace(role === 'teacher' ? '/teacher' : '/student')
    }
  }, [userName, role, router])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 dark:bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl w-full space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 text-sm text-indigo-700 dark:text-indigo-300 mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Powered by Bitcoin Computer on LTC
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              QuizChain
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Learn, compete, and earn rewards on the blockchain. 
            Every answer counts.
          </p>
        </div>

        {/* Wallet / Login Status */}
        {isConnected && publicKey && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              {userName ? (
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{userName}</span>
              ) : (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Connected as</span>
                  <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {truncatePublicKey(publicKey)}
                  </span>
                </>
              )}
              {!userName && (
                <button
                  onClick={() => setAuthModal('login')}
                  className="ml-2 text-xs px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                >
                  Set Name
                </button>
              )}
            </div>
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Teacher Card */}
          <Link
            href="/teacher"
            onClick={(e) => {
              // If already logged in as student, block teacher access
              if (userName && role === 'student') {
                e.preventDefault()
                return
              }
              setRole('teacher')
              if (!userName) setAuthModal('login')
            }}
            className={`group relative bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border transition-all duration-300 hover:-translate-y-1 ${
              userName && role === 'student'
                ? 'border-gray-200/30 dark:border-gray-700/30 opacity-50 cursor-not-allowed'
                : 'border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Teacher</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Create quizzes, set rewards, and track student progress on-chain
              </p>
              {userName && role === 'student' && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  You are signed in as a Student
                </p>
              )}
            </div>
          </Link>

          {/* Student Card */}
          <Link
            href="/student"
            onClick={(e) => {
              // If already logged in as teacher, block student access
              if (userName && role === 'teacher') {
                e.preventDefault()
                return
              }
              setRole('student')
              if (!userName) setAuthModal('login')
            }}
            className={`group relative bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border transition-all duration-300 hover:-translate-y-1 ${
              userName && role === 'teacher'
                ? 'border-gray-200/30 dark:border-gray-700/30 opacity-50 cursor-not-allowed'
                : 'border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Student</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Browse quizzes, earn LTC rewards, and climb the leaderboard
              </p>
              {userName && role === 'teacher' && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  You are signed in as a Teacher
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <Link
            href="/leaderboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <span>🏆</span> Leaderboard
          </Link>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <Link
            href="/wallet"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <span>💳</span> Wallet Setup
          </Link>
        </div>
      </div>

      {authModal === 'login' && (
        <LoginModal
          onClose={() => setAuthModal(null)}
          onSwitchToSignup={() => setAuthModal('signup')}
        />
      )}
      {authModal === 'signup' && (
        <SignupModal
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal('login')}
        />
      )}
    </div>
  )
}
