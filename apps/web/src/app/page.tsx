'use client'

import Link from 'next/link'
import { useWallet } from '@/hooks'
import { truncatePublicKey } from '@/lib'

export default function HomePage() {
  const { isConnected, publicKey } = useWallet()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Quiz App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Blockchain-powered learning platform
          </p>
        </div>

        {/* Wallet Status */}
        {isConnected && publicKey && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Connected as
            </p>
            <p className="text-lg font-mono font-semibold">
              {truncatePublicKey(publicKey)}
            </p>
          </div>
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <Link
            href="/teacher"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold mb-3">Teacher</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create quizzes, manage rewards, and track student progress
            </p>
          </Link>

          {/* Student Card */}
          <Link
            href="/student"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center border-2 border-transparent hover:border-green-500"
          >
            <div className="text-5xl mb-4">👨‍🎓</div>
            <h2 className="text-2xl font-bold mb-3">Student</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Browse quizzes, earn rewards, and climb the leaderboard
            </p>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="text-center space-x-4 pt-8">
          <Link
            href="/leaderboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Leaderboard
          </Link>
          <span className="text-gray-400">·</span>
          <Link
            href="/wallet"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Wallet Setup
          </Link>
        </div>
      </div>
    </div>
  )
}
