'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSessionStore, useWalletStore } from '@/stores'
import { useTeacherQuizzes } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'

export default function TeacherPage() {
  const { userId, setRole } = useSessionStore()
  const { isConnected } = useWalletStore()
  const { quizzes, loading } = useTeacherQuizzes(userId || '')

  useEffect(() => {
    setRole('teacher')
  }, [setRole])

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please connect your wallet to access the teacher dashboard
          </p>
          <Link
            href="/wallet"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your quizzes and track student progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Quizzes</h3>
            <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Active Quizzes</h3>
            <p className="text-3xl font-bold text-green-600">{quizzes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Attempts</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Quizzes</h2>
            <Link
              href="/teacher/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Quiz
            </Link>
          </div>
          
          <QuizGrid 
            quizzes={quizzes} 
            viewMode="teacher"
            loading={loading}
            emptyMessage="No quizzes yet. Create your first quiz to get started!"
          />
        </div>
      </div>
    </div>
  )
}
