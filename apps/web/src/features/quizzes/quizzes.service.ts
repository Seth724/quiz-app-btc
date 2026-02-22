/**
 * Quizzes Service - Handle quiz operations
 * NOTE: Each quiz has ONLY ONE question with 4 options
 */

'use client'

import type { QuizData } from '@quiz-app/shared'
import { apiClient } from '@/services'
import { HelperTeacherClient, HelperQuizClient } from '@/services/bc'

export interface Quiz {
  _id: string
  _rev: string
  title: string
  questionText: string  // Single question text
  options: string[]      // Exactly 4 options
  correctAnswer: number  // Index 0-3
  rewardAmount: bigint   // Reward in satoshis
  entryFee: bigint       // Cost to attempt
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string    // Associated payment object
  isClaimed: boolean     // Has reward been claimed?
  claimedBy: string      // Who claimed it
  attemptCount: number   // Total attempts
  createdAt?: number
}

export interface CreateQuizParams {
  title: string
  description?: string
  questionText: string
  options: string[]      // Must be exactly 4 options
  correctAnswer: number  // Index 0-3
  rewardAmount: number   // In satoshis
  entryFee: number       // In satoshis
}

/**
 * Create a new quiz (1 question, 4 options)
 * Flow:
 * 1. Create Payment object with reward
 * 2. Create Quiz with payment reference
 */
export async function createQuiz(
  teacherClient: HelperTeacherClient,
  params: CreateQuizParams
): Promise<Quiz> {
  // Validate
  if (params.options.length !== 4) {
    throw new Error('Must have exactly 4 options')
  }
  if (params.correctAnswer < 0 || params.correctAnswer > 3) {
    throw new Error('Correct answer must be between 0 and 3')
  }

  const quizData: QuizData = {
    title: params.title,
    questionText: params.questionText,
    options: params.options,
    correctAnswer: params.correctAnswer,
    rewardAmount: BigInt(params.rewardAmount),
    entryFee: BigInt(params.entryFee),
    paymentTxId: '' // Will be populated by the teacher client
  }

  const quiz = await teacherClient.createQuiz(quizData)

  // Sync with backend (optional - don't fail if backend is unavailable)
  try {
    await apiClient.syncQuiz({
      id: quiz._id,
      rev: quiz._rev,
      ...params,
      teacherId: quiz.teacherPublicKey,
    })
  } catch (error) {
    console.warn('⚠️ Backend sync failed (ignoring - blockchain operation succeeded):', error)
  }

  return quiz as Quiz
}

/**
 * Get quiz by ID
 */
export async function getQuiz(
  quizClient: HelperQuizClient,
  quizId: string
): Promise<Quiz | null> {
  try {
    const quiz = await quizClient.getQuiz(quizId)
    return quiz ? (quiz as unknown as Quiz) : null
  } catch (error) {
    console.error('Failed to get quiz:', error)
    return null
  }
}

/**
 * List quizzes by teacher
 */
// export async function listQuizzesByTeacher(
//   teacherClient: HelperTeacherClient, // TeacherClient instance
//   teacherId: string
// ): Promise<Quiz[]> {
//   try {
//     const quizzes = await teacherClient.getTeacherQuizzes(teacherId)
//     return quizzes
//   } catch (error) {
//     console.error('Failed to list quizzes:', error)
//     return []
//   }
// }



export async function listQuizzesByTeacher(
  quizClient: HelperQuizClient,
  teacherPublicKey: string
): Promise<Quiz[]> {
  try {
    console.log('🙌🙌listQuizzesByTeacher - fetching quizzes for teacherPublicKey:', teacherPublicKey)
    const quizzes = await quizClient.getQuizzesByTeacher(teacherPublicKey)

    console.log('❤️❤️❤️listQuizzesByTeacher - raw quizzes from client:', quizzes)
    return quizzes as unknown as Quiz[]
  } catch (error) {
    console.error('Failed to list quizzes:', error)
    return []
  }
}
/**
 * Deactivate quiz (prevent further attempts)
 */
export async function deactivateQuiz(
  quizClient: HelperQuizClient,
  quizId: string
): Promise<void> {
  try {
    await quizClient.deactivateQuiz(quizId)
  } catch (error) {
    console.error('Failed to deactivate quiz:', error)
    throw error
  }
}

/**
 * Check if student can attempt quiz
 */
export async function canAttemptQuiz(
  quizClient: HelperQuizClient,
  quizId: string,
  studentPublicKey: string
): Promise<boolean> {
  try {
    return await quizClient.canStudentAttempt(quizId, studentPublicKey)
  } catch (error) {
    console.error('Failed to check attempt eligibility:', error)
    return false
  }
}

/**
 * Get all active quizzes for students to attempt
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    // Use the helper-based quiz client
    const { createQuizClient } = await import('@/hooks/useClients')
    const quizClient = createQuizClient()

    if (!quizClient) {
      console.error('Quiz client not available')
      return []
    }

    const dtos = await quizClient.getAllQuizzes()
    // Convert DTOs to Quiz interface
    return dtos.map(dto => ({
      _id: dto._id,
      _rev: dto._rev,
      title: dto.title,
      questionText: dto.questionText,
      options: dto.options,
      correctAnswer: dto.correctAnswer,
      rewardAmount: dto.rewardAmount,
      entryFee: dto.entryFee,
      teacherPublicKey: dto.teacherPublicKey,
      isActive: dto.isActive || true,
      paymentTxId: dto.paymentTxId || '',
      isClaimed: dto.isClaimed || false,
      claimedBy: dto.claimedBy || '',
      attemptCount: dto.attemptCount || 0,
      createdAt: dto.createdAt || Date.now()
    }))
  } catch (error) {
    console.error('Failed to get all quizzes:', error)
    return []
  }
}
