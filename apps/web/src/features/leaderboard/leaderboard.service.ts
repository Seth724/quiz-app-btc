/**
 * Leaderboard Service - Handle leaderboard operations
 */

'use client'

import { apiClient } from '@/services'

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  score: number
  totalRewards: number
  quizzesCompleted: number
}

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const data = await apiClient.getLeaderboard()
    return data as LeaderboardEntry[]
  } catch (error) {
    console.error('Failed to get leaderboard:', error)
    return []
  }
}

/**
 * Get leaderboard for specific quiz
 */
export async function getQuizLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
  try {
    const data = await apiClient.getLeaderboard(quizId)
    return data as LeaderboardEntry[]
  } catch (error) {
    console.error('Failed to get quiz leaderboard:', error)
    return []
  }
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
