/**
 * Quizzes Service - Handle quiz operations
 * NOTE: Each quiz has ONLY ONE question with 4 options
 *
 * Strategy: DB-first for reads, blockchain for writes, sync to DB after writes.
 */

'use client'

import type { QuizData } from '@/types'
import { BrowserTeacherClient, BrowserQuizClient } from '@/services/bc'
import { quizService, type QuizResponse } from '@/services/backend'

export interface Quiz {
  _id: string
  _rev?: string
  title: string
  description?: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string
  isClaimed: boolean
  claimedBy: string
  attemptCount: number
  createdAt?: number
}

export interface CreateQuizParams {
  title: string
  description?: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: number
  entryFee: number
}

/**
 * Create a new quiz (1 question, 4 options)
 * 1. Create on blockchain
 * 2. Sync to DB
 */
export async function createQuiz(
  teacherClient: BrowserTeacherClient,
  params: CreateQuizParams
): Promise<Quiz> {
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
    paymentTxId: ''
  }

  const quiz = await teacherClient.createQuiz(quizData)
  console.log('✅ Quiz created on blockchain with ID:', quiz._id)

  // Sync to DB (fire-and-forget — blockchain is the source of truth)
  try {
    await quizService.create({
      id: quiz._id,
      title: params.title,
      description: params.description,
      questionText: params.questionText,
      options: params.options,
      correctAnswer: params.correctAnswer,
      rewardAmount: params.rewardAmount,
      entryFee: params.entryFee,
      paymentTxId: quiz.paymentTxId || quiz._id,
      teacherPubKey: quiz.teacherPublicKey || quiz._owners?.[0] || '',
    })
    console.log('✅ Quiz synced to database')
  } catch (error) {
    console.warn('⚠️ DB sync failed (blockchain op succeeded):', error)
  }

  return quiz as Quiz
}

/**
 * Get quiz by ID — try DB first, fallback to blockchain
 */
export async function getQuiz(
  quizClient: BrowserQuizClient,
  quizId: string
): Promise<Quiz | null> {
  // Try DB first (fast)
  try {
    const dbQuiz = await quizService.getById(quizId)
    if (dbQuiz) return dbQuizToQuiz(dbQuiz)
  } catch { /* DB miss — fall through */ }

  // Fallback to blockchain (slow)
  try {
    const quiz = await quizClient.getQuiz(quizId)
    return quiz ? (quiz as unknown as Quiz) : null
  } catch (error) {
    console.error('Failed to get quiz:', error)
    return null
  }
}

/**
 * List quizzes by teacher — DB-first
 */
export async function listQuizzesByTeacher(
  quizClient: BrowserQuizClient,
  teacherPublicKey: string
): Promise<Quiz[]> {
  // Try DB first
  try {
    const res = await quizService.list({ teacherPubKey: teacherPublicKey, take: 100 })
    if (res.data.length > 0) return res.data.map(dbQuizToQuiz)
  } catch { /* fall through */ }

  // Fallback to blockchain
  try {
    const quizzes = await quizClient.getQuizzesByTeacher(teacherPublicKey)
    return quizzes as unknown as Quiz[]
  } catch (error) {
    console.error('Failed to list quizzes:', error)
    return []
  }
}

/**
 * Deactivate quiz
 */
export async function deactivateQuiz(
  quizClient: BrowserQuizClient,
  quizId: string
): Promise<void> {
  try {
    await quizClient.deactivateQuiz(quizId)
    try { await quizService.update(quizId, { isActive: false }) } catch { /* ignore */ }
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
  } catch {
    return false
  }
}

/**
 * Get all quizzes — DB-first, fallback to blockchain
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  // Try DB first (fast)
  try {
    const res = await quizService.list({ take: 200 })
    if (res.data.length > 0) {
      console.log('📋 Loaded', res.data.length, 'quizzes from DB')
      return res.data.map(dbQuizToQuiz)
    }
  } catch (err) {
    console.warn('⚠️ DB quiz fetch failed, falling back to blockchain:', err)
  }

  // Fallback to blockchain (slow)
  try {
    const { createQuizClient } = await import('@/hooks/useClients')
    const quizClient = createQuizClient()
    if (!quizClient) return []

    const dtos = await quizClient.getAllQuizzes()
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

/** Convert a DB quiz response to the Quiz interface */
function dbQuizToQuiz(q: QuizResponse & { description?: string }): Quiz {
  return {
    _id: q.id,
    _rev: q.id,
    title: q.title,
    description: q.description,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer ?? -1,
    rewardAmount: BigInt(q.rewardAmount || 0),
    entryFee: BigInt(q.entryFee || 0),
    teacherPublicKey: q.teacherPubKey,
    isActive: q.isActive ?? true,
    paymentTxId: q.paymentTxId || '',
    isClaimed: q.isClaimed ?? false,
    claimedBy: q.claimedBy || '',
    attemptCount: q._count?.attempts || 0,
    createdAt: q.createdAt ? new Date(q.createdAt).getTime() : Date.now(),
  }
}
