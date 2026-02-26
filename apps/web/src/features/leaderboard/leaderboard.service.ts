/**
 * Leaderboard Service - DB-first, built from attempt/leaderboard data in MongoDB.
 * Falls back to blockchain scan only if DB is empty/unavailable.
 */

'use client'

import { leaderboardService } from '@/services/backend'

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  score: number
  totalRewards: number
  quizzesCompleted: number
}

/**
 * Get the global leaderboard from the database.
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const entries = await leaderboardService.getLeaderboard(100)
    console.log('📊 [Leaderboard] Loaded', entries.length, 'entries from DB')

    return entries.map(e => ({
      rank: e.rank,
      studentId: e.publicKey,
      studentName: e.name || '',
      score: e.correctCount,
      totalRewards: Number(String(e.totalRewards || 0).replace(/n$/, '')),
      quizzesCompleted: e.totalAttempts,
    }))
  } catch (error) {
    console.error('Failed to load leaderboard from DB:', error)
    return []
  }
}

/**
 * Get leaderboard for specific quiz
 */
export async function getQuizLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
  // For now just return global leaderboard
  return getGlobalLeaderboard()
}

/**
 * Get student rank
 */
export function getStudentRank(
  leaderboard: LeaderboardEntry[],
  studentId: string
): number | null {
  const entry = leaderboard.find(e => e.studentId === studentId)
  return entry?.rank ?? null
}
