'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSessionStore } from '@/stores'
import { LeaderboardTable, getGlobalLeaderboard, type LeaderboardEntry } from '@/features/leaderboard'

export default function LeaderboardPage() {
  const { userId } = useSessionStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const data = await getGlobalLeaderboard()
        setLeaderboard(data)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">🏆 Leaderboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Top performers and their achievements
          </p>
        </div>

        <LeaderboardTable 
          entries={leaderboard} 
          currentStudentId={userId || undefined}
          loading={loading}
        />
      </div>
    </div>
  )
}
