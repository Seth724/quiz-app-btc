/**
 * Access Service - Handle quiz access via QuizAccessSale atomic swap
 *
 * Now backed by NestJS API + MongoDB (no more in-memory store).
 *
 * Flow:
 * 1. Student requests access → stored in DB via NestJS API
 * 2. Teacher approves → mints QuizAccess + creates offer tx → stored in DB
 * 3. Student finalizes → deserializes offer tx, creates Payment, broadcasts atomic swap
 */

'use client'

import type { BrowserAccessClient } from '@/services/bc/BrowserAccessClient'
import { accessRequestService, type AccessRequestData } from '@/services/backend'

export type { AccessRequestData }

// ─────────────────────────────────────────────
// Access Request API helpers (via NestJS backend)
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
  return accessRequestService.create(params)
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
  return accessRequestService.list(filters)
}

/**
 * Get a single access request by ID
 */
export async function getAccessRequest(id: string): Promise<AccessRequestData> {
  return accessRequestService.getById(id)
}

/**
 * Teacher approves an access request (updates with offer tx hex)
 */
export async function approveAccessRequest(
  requestId: string,
  offerTxHex: string,
  accessTokenId: string
): Promise<AccessRequestData> {
  return accessRequestService.update(requestId, {
    status: 'approved',
    offerTxHex,
    accessTokenId,
  })
}

/**
 * Student marks access request as completed after finalizing
 */
export async function completeAccessRequest(
  requestId: string,
  completedTxId: string
): Promise<AccessRequestData> {
  return accessRequestService.update(requestId, {
    status: 'completed',
    completedTxId,
  })
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
