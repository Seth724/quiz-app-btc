/**
 * Access Service - Handle quiz access via QuizAccessSale atomic swap
 * 
 * Flow:
 * 1. Student requests access → stored in API relay
 * 2. Teacher approves → mints QuizAccess + creates offer tx → stores in relay
 * 3. Student finalizes → deserializes offer tx, creates Payment, broadcasts atomic swap
 */

'use client'

import type { BrowserAccessClient } from '@/services/bc/BrowserAccessClient'
import type { AccessRequestData } from '@/lib/accessRequestStore'

export type { AccessRequestData }

// ─────────────────────────────────────────────
// Access Request API helpers
// ─────────────────────────────────────────────

/**
 * Student requests access to a quiz
 */
export async function requestAccess(params: {
  quizId: string
  quizTitle: string
  studentPublicKey: string
  teacherPublicKey: string
  entryFee: string
}): Promise<AccessRequestData> {
  const response = await fetch('/api/access-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new Error('Failed to create access request')
  return response.json()
}

/**
 * Get access requests (filtered)
 */
export async function getAccessRequests(filters?: {
  quizId?: string
  studentPublicKey?: string
  teacherPublicKey?: string
  status?: string
}): Promise<AccessRequestData[]> {
  const params = new URLSearchParams()
  if (filters?.quizId) params.set('quizId', filters.quizId)
  if (filters?.studentPublicKey) params.set('studentPublicKey', filters.studentPublicKey)
  if (filters?.teacherPublicKey) params.set('teacherPublicKey', filters.teacherPublicKey)
  if (filters?.status) params.set('status', filters.status)

  const response = await fetch(`/api/access-requests?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch access requests')
  return response.json()
}

/**
 * Get a single access request by ID
 */
export async function getAccessRequest(id: string): Promise<AccessRequestData> {
  const response = await fetch(`/api/access-requests/${id}`)
  if (!response.ok) throw new Error('Access request not found')
  return response.json()
}

/**
 * Teacher approves an access request (updates with offer tx hex)
 */
export async function approveAccessRequest(
  requestId: string,
  offerTxHex: string,
  accessTokenId: string
): Promise<AccessRequestData> {
  const response = await fetch(`/api/access-requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'approved',
      offerTxHex,
      accessTokenId,
    }),
  })
  if (!response.ok) throw new Error('Failed to approve access request')
  return response.json()
}

/**
 * Student marks access request as completed after finalizing
 */
export async function completeAccessRequest(
  requestId: string,
  completedTxId: string
): Promise<AccessRequestData> {
  const response = await fetch(`/api/access-requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'completed',
      completedTxId,
    }),
  })
  if (!response.ok) throw new Error('Failed to complete access request')
  return response.json()
}

// ─────────────────────────────────────────────
// Blockchain access checks
// ─────────────────────────────────────────────

/**
 * Check if student has access to quiz (on-chain check)
 */
export async function hasAccess(
  accessClient: BrowserAccessClient,
  studentId: string,
  quizId: string
): Promise<boolean> {
  try {
    return await accessClient.checkAccess(studentId, quizId)
  } catch (error) {
    return false
  }
}

/**
 * Get access token ID for student-quiz pair
 */
export async function getAccessTokenId(
  accessClient: BrowserAccessClient,
  studentId: string,
  quizId: string
): Promise<string | null> {
  try {
    return await accessClient.getAccessTokenId(studentId, quizId)
  } catch {
    return null
  }
}
