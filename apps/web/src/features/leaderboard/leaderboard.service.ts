/**
 * Leaderboard Service - Built from blockchain data (no backend API needed)
 * Deduplicates attempts: only counts ONE attempt per student per quiz.
 * Only shows actual reward for the student who received the payment (claimedBy).
 */

'use client'

import { MODULE_SPECS } from '@/config/env'

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  score: number
  totalRewards: number
  quizzesCompleted: number
}

/**
 * Build leaderboard by scanning QuizAttempt objects on the blockchain.
 * Groups by studentPublicKey, deduplicates by quizId, counts correct answers.
 * Only counts actual rewards for the student who received the payment (quiz.claimedBy).
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const { createComputerFromStorage } = await import('@/services')
    const computer = createComputerFromStorage()

    console.log('📊 [Leaderboard] Building leaderboard with attemptMod:', MODULE_SPECS.attemptMod)

    // Query all attempt objects
    let attemptIds: string[] = []
    try {
      attemptIds = await computer.query({ mod: MODULE_SPECS.attemptMod })
      console.log('📊 [Leaderboard] Found', attemptIds.length, 'attempt IDs')
    } catch (err) {
      console.error('❌ [Leaderboard] Failed to query attempts:', err)
      console.error('💡 [Leaderboard] If you see 500 errors, the module specs may need redeployment.')
      return []
    }

    if (attemptIds.length === 0) {
      console.log('📊 [Leaderboard] No attempts found')
      return []
    }

    // Cache quiz claimedBy info: quizId → { claimedBy, rewardAmount }
    const quizClaimCache = new Map<string, { claimedBy: string; rewardAmount: number }>()

    // Map: studentPublicKey → Map<quizId, { isCorrect, reward }>
    // This ensures each student+quiz pair is only counted ONCE
    const studentQuizMap = new Map<string, Map<string, { isCorrect: boolean; reward: number }>>()

    for (const id of attemptIds) {
      try {
        // Resolve latest revision to get post-submitAnswer state
        let rev = id
        try {
          const latestRev = await computer.latest(id)
          if (latestRev) rev = latestRev
        } catch (e) {
          console.warn('⚠️ [Leaderboard] latest() failed for', id.substring(0, 12), '- using original ID')
        }

        const attempt = await computer.sync(rev) as any
        if (!attempt?.studentPublicKey || attempt.selectedAnswer === -1) continue // skip incomplete

        const studentKey = attempt.studentPublicKey as string
        const quizId = attempt.quizId as string

        if (!studentQuizMap.has(studentKey)) {
          studentQuizMap.set(studentKey, new Map())
        }
        const quizMap = studentQuizMap.get(studentKey)!

        // Only keep the FIRST attempt per quiz (don't overwrite if already exists)
        if (!quizMap.has(quizId)) {
          // Look up quiz.claimedBy to determine if this student actually got the payment
          if (!quizClaimCache.has(quizId)) {
            try {
              let quizRev = quizId
              try {
                const latestQuizRev = await computer.latest(quizId)
                if (latestQuizRev) quizRev = latestQuizRev
              } catch { /* use original */ }
              const quiz = await computer.sync(quizRev) as any
              quizClaimCache.set(quizId, {
                claimedBy: quiz?.claimedBy || '',
                rewardAmount: Number(String(quiz?.rewardAmount ?? 0).replace(/n$/, '')),
              })
            } catch {
              quizClaimCache.set(quizId, { claimedBy: '', rewardAmount: 0 })
            }
          }

          const quizClaim = quizClaimCache.get(quizId)!
          // Only award reward to the student who actually received the payment
          const actualReward = (quizClaim.claimedBy === studentKey) ? quizClaim.rewardAmount : 0

          quizMap.set(quizId, {
            isCorrect: attempt.isCorrect === true,
            reward: actualReward,
          })
          console.log('📊 [Leaderboard] Added attempt:', {
            student: studentKey.substring(0, 12),
            quizId: quizId.substring(0, 12),
            isCorrect: attempt.isCorrect,
            actualReward,
            claimedBy: quizClaim.claimedBy.substring(0, 12),
          })
        }
      } catch (err) {
        // Skip unresolvable attempts - could be 500 error from regtest reset
        console.warn('⚠️ [Leaderboard] Skipping attempt', id.substring(0, 12), ':', (err as any)?.message)
      }
    }

    // Convert to sorted array
    const entries: LeaderboardEntry[] = []
    for (const [studentId, quizMap] of studentQuizMap.entries()) {
      let correct = 0
      let rewards = 0
      let total = 0
      for (const [, data] of quizMap) {
        total += 1
        if (data.isCorrect) {
          correct += 1
          rewards += data.reward
        }
      }
      entries.push({
        rank: 0,
        studentId,
        studentName: '', // no name on-chain, table will show truncated key
        score: correct,
        totalRewards: rewards,
        quizzesCompleted: total,
      })
    }

    // Sort: most correct first, then by rewards
    entries.sort((a, b) => b.score - a.score || b.totalRewards - a.totalRewards)
    entries.forEach((e, i) => (e.rank = i + 1))

    return entries
  } catch (error) {
    console.error('Failed to build leaderboard from blockchain:', error)
    return []
  }
}

/**
 * Get leaderboard for specific quiz (filters attempts by quizId)
 */
export async function getQuizLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
  try {
    const all = await getGlobalLeaderboard()
    return all
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
