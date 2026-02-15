/**
 * Access Service - Handle quiz access purchase
 */

'use client'

import type { AccessClient } from '@quiz-app/sdk'

export interface QuizAccess {
  _id: string
  _rev: string
  quizId: string
  studentId: string
  purchasedAt: number
}

/**
 * Purchase quiz access
 */
export async function purchaseAccess(
  accessClient: AccessClient,
  quizId: string,
  price: number
): Promise<QuizAccess> {
  const access = await accessClient.purchase(quizId, price)
  return access
}

/**
 * Check if student has access to quiz
 */
export async function hasAccess(
  accessClient: AccessClient,
  studentId: string,
  quizId: string
): Promise<boolean> {
  try {
    const access = await accessClient.checkAccess(studentId, quizId)
    return !!access
  } catch (error) {
    return false
  }
}

/**
 * Get all access for a student
 */
export async function getStudentAccess(
  accessClient: AccessClient,
  studentId: string
): Promise<QuizAccess[]> {
  try {
    const accessList = await accessClient.listByStudent(studentId)
    return accessList
  } catch (error) {
    console.error('Failed to get student access:', error)
    return []
  }
}
