/**
 * Attempts Service - Handle quiz attempts
 * NOTE: Each attempt is for ONE question. Answer is either correct or wrong.
 */

'use client'

import type { BrowserAttemptClient } from '@/services/bc/BrowserAttemptClient'

export interface Attempt {
  _id: string
  _rev: string
  quizId: string
  studentPublicKey: string
  selectedAnswer: number  // Index 0-3
  isCorrect: boolean      // True if correct
  isCompleted: boolean     // True after submission
  rewardEarned: bigint    // Full reward if correct, 0 if wrong
  submittedAt: number
}

export interface SubmitAttemptParams {
  quizId: string
  selectedAnswer: number  // Index 0-3
  accessTokenId: string   // QuizAccess token ID
}

/**
 * Submit quiz attempt
 * Flow:
 * 1. Create attempt with quizId
 * 2. Submit answer with access token (burns 1 unit)
 * 3. If correct → Payment transferred to student
 */
export async function submitAttempt(
  attemptClient: BrowserAttemptClient,
  params: SubmitAttemptParams
): Promise<Attempt> {
  const attempt = await attemptClient.submitAttempt(
    params.quizId,
    params.selectedAnswer,
    params.accessTokenId
  )

  return attempt as Attempt
}

/**
 * Get attempt by ID
 */
export async function getAttempt(
  attemptClient: BrowserAttemptClient,
  attemptId: string
): Promise<Attempt | null> {
  try {
    const attempt = await attemptClient.getAttempt(attemptId)
    return attempt
  } catch (error) {
    console.error('Failed to get attempt:', error)
    return null
  }
}

/**
 * Get all attempts by student
 */
export async function getStudentAttempts(
  attemptClient: BrowserAttemptClient,
  studentPublicKey: string,
  quizId?: string
): Promise<Attempt[]> {
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
