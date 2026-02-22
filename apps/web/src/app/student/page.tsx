'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSessionStore, useWalletStore } from '@/stores'
import { getAllQuizzes, type Quiz } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'

export default function StudentPage() {
  const { userId, setRole } = useSessionStore()
  const { isConnected } = useWalletStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

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

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please connect your wallet to access the student dashboard
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
          <h1 className="text-4xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Browse quizzes and earn rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Quizzes Available</h3>
            <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Quizzes Taken</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Rewards</h3>
            <p className="text-3xl font-bold text-purple-600">- sats</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Quizzes</h2>
            <Link
              href="/student/quizzes"
              className="text-blue-600 hover:underline"
            >
              View All →
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
