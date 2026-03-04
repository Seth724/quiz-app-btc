/**
 * Attempts Service - Handle quiz attempts
 * NOTE: Each attempt is for ONE question. Answer is either correct or wrong.
 *
 * Strategy: Blockchain for writes, sync to DB, DB-first for reads.
 * Auto-reward: If correct answer, frontend processes reward via BrowserQuizClient.autoProcessReward().
 */

'use client'

import type { BrowserAttemptClient } from '@/services/bc/BrowserAttemptClient'
import { BrowserQuizClient } from '@/services/bc/BrowserQuizClient'
import { attemptService, quizService } from '@/services/backend'

export interface Attempt {
  _id: string
  _rev: string
  quizId: string
  studentPublicKey: string
  selectedAnswer: number
  isCorrect: boolean
  isCompleted: boolean
  rewardEarned: bigint
  submittedAt: number
}

export interface SubmitAttemptParams {
  quizId: string
  selectedAnswer: number
  accessTokenId: string
}

/**
 * Submit quiz attempt
 * 1. Submit on blockchain
 * 2. Sync to DB (also updates leaderboard automatically)
 * 3. If correct, auto-process reward client-side via BrowserQuizClient.autoProcessReward()
 */
export async function submitAttempt(
  attemptClient: BrowserAttemptClient | null,
  params: SubmitAttemptParams
): Promise<Attempt> {
  if (!attemptClient) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  const attempt = await attemptClient.submitAttempt(
    params.quizId,
    params.selectedAnswer,
    params.accessTokenId
  )

  // Sync attempt to DB
  try {
    const rewardNum = Number(String(attempt.rewardEarned ?? 0).replace(/n$/, ''))
    await attemptService.create({
      quizId: params.quizId,
      studentPubKey: attempt.studentPublicKey || '',
      selectedAnswer: params.selectedAnswer,
      isCorrect: attempt.isCorrect ?? false,
      rewardEarned: rewardNum,
      blockchainTxId: attempt._id,
    })
    console.log('✅ Attempt synced to database')

    // If correct, auto-process reward client-side
    if (attempt.isCorrect) {
      try {
        const rewardData = await attemptService.getAutoRewardData(
          params.quizId,
          attempt.studentPublicKey || ''
        )

        if (rewardData.status === 'available' && rewardData.mnemonic && rewardData.paymentTxId) {
          console.log('🏆 [AutoReward] Processing reward client-side...')
          const result = await BrowserQuizClient.autoProcessReward({
            mnemonic: rewardData.mnemonic,
            quizId: params.quizId,
            winnerPublicKey: attempt.studentPublicKey || '',
            paymentTxId: rewardData.paymentTxId,
          })

          if (result.status === 'success') {
            console.log('✅ [AutoReward] Reward processed successfully')
          } else {
            console.warn('⚠️ [AutoReward] Reward processing issue:', result.error)
          }
        } else if (rewardData.status === 'already_claimed') {
          console.log('ℹ️ [AutoReward] Quiz already claimed')
        } else {
          console.warn('⚠️ [AutoReward] Cannot auto-process reward:', rewardData.error || rewardData.status)
        }

        // Mark quiz as claimed in DB
        await quizService.update(params.quizId, {
          isClaimed: true,
          claimedBy: attempt.studentPublicKey || '',
        })
        console.log('✅ Quiz marked as claimed in DB')
      } catch (rewardErr) {
        console.warn('⚠️ Auto-reward failed:', rewardErr)
      }
    }
  } catch (error) {
    console.warn('⚠️ DB attempt sync failed:', error)
  }

  return attempt as Attempt
}

/**
 * Get attempt by ID
 */
export async function getAttempt(
  attemptClient: BrowserAttemptClient | null,
  attemptId: string
): Promise<Attempt | null> {
  if (!attemptClient) return null
  try {
    const attempt = await attemptClient.getAttempt(attemptId)
    return attempt
  } catch (error) {
    console.error('Failed to get attempt:', error)
    return null
  }
}

/**
 * Get all attempts by student — DB-first, fallback to blockchain
 */
export async function getStudentAttempts(
  attemptClient: BrowserAttemptClient,
  studentPublicKey: string,
  quizId?: string
): Promise<Attempt[]> {
  // Try DB first
  try {
    const dbAttempts = await attemptService.list(studentPublicKey)
    if (dbAttempts.length > 0) {
      let filtered = dbAttempts
      if (quizId) filtered = dbAttempts.filter(a => a.quizId === quizId)
      return filtered.map(a => ({
        _id: a.id,
        _rev: a.id,
        quizId: a.quizId,
        studentPublicKey: a.studentPubKey,
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect,
        isCompleted: true,
        rewardEarned: BigInt(a.rewardEarned || 0),
        submittedAt: new Date(a.attemptedAt).getTime(),
      }))
    }
  } catch { /* fall through */ }

  // Fallback to blockchain
  try {
    const attempts = await attemptClient.getStudentAttempts(studentPublicKey, quizId)
    return attempts as Attempt[]
  } catch (error) {
    console.error('Failed to get attempts:', error)
    return []
  }
}

/**
 * Check if student has attempted quiz
 */
export async function hasAttempted(
  attemptClient: BrowserAttemptClient,
  studentPublicKey: string,
  quizId: string
): Promise<boolean> {
  const attempts = await getStudentAttempts(attemptClient, studentPublicKey, quizId)
  return attempts.length > 0
}
