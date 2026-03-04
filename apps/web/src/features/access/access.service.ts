/**
 * Access Service - Handle quiz access via QuizAccessSale atomic swap
 *
 * Now backed by NestJS API + MongoDB (no more in-memory store).
 *
 * Flow:
 * 1. Student requests access → stored in DB via NestJS API
 * 2. Auto-approve if teacher has stored mnemonic:
 *    a. Frontend gets teacher mnemonic from API
 *    b. Frontend mints QuizAccess + creates offer tx (BrowserAccessClient)
 *    c. Frontend updates DB with offer details
 * 3. Student finalizes → deserializes offer tx, creates Payment, broadcasts atomic swap
 */

'use client'

import type { BrowserAccessClient } from '@/services/bc/BrowserAccessClient'
import { BrowserAccessClient as BrowserAccessClientClass } from '@/services/bc/BrowserAccessClient'
import { accessRequestService, type AccessRequestData } from '@/services/backend'

export type { AccessRequestData }

// ─────────────────────────────────────────────
// Access Request API helpers (via NestJS backend)
// ─────────────────────────────────────────────

/**
 * Student requests access to a quiz.
 * If the teacher has a stored mnemonic, auto-approve is attempted:
 * the frontend gets the mnemonic, performs blockchain ops, and updates the DB.
 */
export async function requestAccess(params: {
  quizId: string
  quizTitle: string
  studentPublicKey: string
  teacherPublicKey: string
  entryFee: string
}): Promise<AccessRequestData> {
  const request = await accessRequestService.create(params)

  // Try auto-approve if request is pending
  if (request.status === 'pending') {
    try {
      const data = await accessRequestService.getAutoApproveData(request.id)
      if (data.status === 'available' && data.mnemonic) {
        console.log('🏭 [Access] Auto-approving request:', request.id)

        // Perform blockchain operations client-side
        const result = await BrowserAccessClientClass.autoMintAndCreateOffer({
          mnemonic: data.mnemonic,
          quizId: data.quizId || request.quizId,
          entryFee: BigInt(data.entryFee || request.entryFee || '0'),
        })

        // Update the access request in DB with blockchain results
        const updated = await accessRequestService.update(request.id, {
          status: 'approved',
          offerTxHex: result.offerTxHex,
          accessTokenId: result.accessTokenId,
        })

        console.log('✅ [Access] Auto-approved request:', request.id)
        return updated
      }
    } catch (err) {
      console.warn('⚠️ [Access] Auto-approve failed, request remains pending:', err)
    }
  }

  return request
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
