/**
 * Quizzes Service - Handle quiz operations
 * NOTE: Each quiz has ONLY ONE question with 4 options
 */

'use client'

import type { QuizData } from '@/types'
import { apiClient } from '@/services'
import { BrowserTeacherClient, BrowserQuizClient } from '@/services/bc'

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
  teacherClient: BrowserTeacherClient,
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

  console.log('✅ Quiz created on blockchain with ID:', quiz)

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
  quizClient: BrowserQuizClient,
  quizId: string
): Promise<Quiz | null> {
  try {
    console.log('📋 quizzes.service.getQuiz - START, quizId:', quizId)
    console.log('📋 quizzes.service.getQuiz - quizClient exists:', !!quizClient)
    const quiz = await quizClient.getQuiz(quizId)
    console.log('📋 quizzes.service.getQuiz - result:', quiz ? 'GOT QUIZ' : 'NULL')
    if (quiz) {
      console.log('📋 quizzes.service.getQuiz - quiz title:', quiz.title, 'isActive:', quiz.isActive)
    }
    return quiz ? (quiz as unknown as Quiz) : null
  } catch (error) {
    console.error('❌ quizzes.service.getQuiz - FAILED:', error)
    return null
  }
}

/**
 * List quizzes by teacher
 */
// export async function listQuizzesByTeacher(
//   teacherClient: BrowserTeacherClient, // TeacherClient instance
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
  quizClient: BrowserQuizClient,
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
  quizClient: BrowserQuizClient,
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
  quizClient: BrowserQuizClient,
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
    // For now use the BrowserQuizClient directly
    // In the future, this could also query API/database for cached results
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
