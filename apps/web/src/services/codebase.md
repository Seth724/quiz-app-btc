# api.client.ts

```ts
/**
 * API Client - Handles communication with NestJS backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class APIClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Quiz endpoints
  async getQuizzes(params?: { teacherId?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.teacherId) searchParams.append('teacherId', params.teacherId)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    const query = searchParams.toString()
    return this.request(`/quizzes${query ? `?${query}` : ''}`)
  }

  async getQuizById(id: string) {
    return this.request(`/quizzes/${id}`)
  }

  async syncQuiz(quizData: any) {
    return this.request('/quizzes/sync', {
      method: 'POST',
      body: JSON.stringify(quizData),
    })
  }

  // Attempt endpoints
  async getAttempts(params?: { studentId?: string; quizId?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.studentId) searchParams.append('studentId', params.studentId)
    if (params?.quizId) searchParams.append('quizId', params.quizId)
    
    const query = searchParams.toString()
    return this.request(`/attempts${query ? `?${query}` : ''}`)
  }

  async submitAttempt(attemptData: any) {
    return this.request('/attempts', {
      method: 'POST',
      body: JSON.stringify(attemptData),
    })
  }

  // Leaderboard endpoints
  async getLeaderboard(quizId?: string) {
    return this.request(`/leaderboard${quizId ? `?quizId=${quizId}` : ''}`)
  }

  // User endpoints
  async getUserProfile(userId: string) {
    return this.request(`/users/${userId}`)
  }
}

// Export singleton instance
export const apiClient = new APIClient()

```

# bc\HelperAccessClient.ts

```ts
/**
 * Helper-based Access Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { QuizAccessHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS } from '@/config/env'

export interface AccessDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentId: string
  hasAccess: boolean
  purchasedAt: number
  expiresAt?: number
}

export interface SaleOfferDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  teacherId: string
  price: bigint
  isActive: boolean
}

export class HelperAccessClient {
  private accessHelper: QuizAccessHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module spec
    this.accessHelper = new QuizAccessHelper(computer, MODULE_SPECS.quizAccessMod)
    this.utils = new BlockchainUtils(computer)
  }

  /**
   * Purchase access (mint access token) using helper
   */
  async purchase(quizId: string, price: bigint): Promise<AccessDTO> {
    console.log('🔨 Purchasing access for quiz:', quizId, 'price:', price)

    const accessToken = await this.accessHelper.createQuizAccess(quizId, 1n)

    return {
      _id: accessToken._id,
      _rev: accessToken._rev,
      _root: accessToken._root,
      _owners: accessToken._owners,
      _satoshis: accessToken._satoshis,
      quizId: accessToken.quizId,
      studentId: this.computer.getPublicKey(),
      hasAccess: true,
      purchasedAt: Date.now(),
    } as AccessDTO
  }

  /**
   * Check if student has access to quiz
   */
  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    return await this.accessHelper.balanceOf(studentId, quizId) > 0n
  }

  /**
   * List all access tokens by student
   */
  async listByStudent(studentId: string): Promise<AccessDTO[]> {
    const accessIds = await this.computer.query({
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId,
    })

    const accesses: AccessDTO[] = []
    for (const id of accessIds) {
      try {
        const access: any = await this.utils.syncOrMine(id)
        accesses.push({
          _id: access._id,
          _rev: access._rev,
          _root: access._root,
          _owners: access._owners,
          _satoshis: access._satoshis,
          quizId: access.quizId,
          studentId,
          hasAccess: access.amount > 0n,
          purchasedAt: access.createdAt || Date.now(),
        })
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }
    return accesses
  }

  /**
   * Mint access token for a quiz using helper
   */
  async mintAccess(quizId: string, amount: bigint = 1n): Promise<any> {
    return await this.accessHelper.mint(this.computer.getPublicKey(), quizId, amount, 'QACC')
  }

  /**
   * Get balance of access tokens for a quiz using helper
   */
  async getBalance(quizId: string): Promise<bigint> {
    return await this.accessHelper.balanceOf(this.computer.getPublicKey(), quizId)
  }

  /**
   * Transfer access token to another student using helper
   */
  async transferAccess(to: string, amount: bigint, quizId: string): Promise<void> {
    await this.accessHelper.transfer(to, amount, quizId)
  }
}

```

# bc\HelperAttemptClient.ts

```ts
/**
 * Helper-based Attempt Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { AttemptHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS } from '@/config/env'

export interface AttemptDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentPublicKey: string
  selectedAnswer: number
  isCorrect: boolean
  rewardEarned: bigint
  submittedAt: number
}

export class HelperAttemptClient {
  private attemptHelper: AttemptHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module spec
    this.attemptHelper = new AttemptHelper(computer, MODULE_SPECS.quizAttemptMod)
    this.utils = new BlockchainUtils(computer)
  }

  /**
   * Submit quiz attempt using the helper
   */
  async submitAttempt(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptDTO> {
    console.log('📝 Student attempting quiz:', quizId)

    // Get quiz and access token
    const quiz = await this.utils.syncOrMine<any>(quizId)
    const accessToken = await this.utils.syncOrMine<any>(accessTokenId)

    // Create attempt using helper
    const attempt = await this.attemptHelper.createAttempt(quizId, this.computer.getPublicKey())

    // Submit answer with access token using helper
    const result = await this.attemptHelper.submitAnswerWithAccess(
      attempt,
      accessToken,
      selectedAnswer,
      quiz
    )

    // Sync and return
    const updatedAttempt = await this.utils.syncOrMine<any>(attempt._id)

    return {
      ...updatedAttempt,
      submittedAt: Date.now(),
    } as AttemptDTO
  }

  /**
   * Get attempt by ID
   */
  async getAttempt(attemptId: string): Promise<AttemptDTO | null> {
    try {
      const attempt = await this.utils.syncOrMine<any>(attemptId)
      return {
        ...attempt,
        submittedAt: attempt.submittedAt || Date.now(),
      } as AttemptDTO
    } catch (error) {
      console.error('Failed to get attempt:', error)
      return null
    }
  }

  /**
   * Get student's attempts from blockchain
   */
  async getStudentAttempts(
    studentPublicKey: string,
    quizId?: string
  ): Promise<AttemptDTO[]> {
    const attemptIds = await this.computer.query({
      mod: MODULE_SPECS.quizAttemptMod,
      publicKey: studentPublicKey,
    })

    const attempts: AttemptDTO[] = []
    for (const id of attemptIds) {
      try {
        const attempt = await this.utils.syncOrMine<any>(id)
        if (!quizId || attempt.quizId === quizId) {
          attempts.push({
            ...attempt,
            submittedAt: attempt.attemptedAt || Date.now(),
          } as AttemptDTO)
        }
      } catch (attemptError) {
        console.error(`Failed to sync attempt ${id}:`, attemptError)
      }
    }

    return attempts
  }
}

```

# bc\HelperQuizClient.ts

```ts
/**
 * Helper-based Quiz Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { QuizHelper, TeacherHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import type { QuizData } from '@quiz-app/shared'

export interface QuizDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  title: string
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
  attemptedStudents: string[]
  attemptCount: number
  createdAt: number
}

export class HelperQuizClient {
  private quizHelper: QuizHelper
  private teacherHelper: TeacherHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    if (!hasModuleSpecs()) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    // Initialize helpers with module specs
    this.quizHelper = new QuizHelper(computer, MODULE_SPECS.quizMod)
    this.teacherHelper = new TeacherHelper(computer, MODULE_SPECS.teacherMod, MODULE_SPECS.quizMod)
    this.utils = new BlockchainUtils(computer)
  }

  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    console.log('🎯 Creating quiz with data:', quizData)

    // First check if teacher exists, if not create one
    let teacher
    try {
      teacher = await this.teacherHelper.getTeacher(this.computer.getPublicKey())
    } catch {
      // Teacher doesn't exist, create one
      console.log('📝 Creating new teacher...')
      teacher = await this.teacherHelper.createTeacher('Teacher', this.computer.getPublicKey())
    }

    const { quiz, paymentTxId } = await this.teacherHelper.createQuiz({
      title: quizData.title,
      questionText: quizData.questionText,
      options: quizData.options,
      correctAnswer: quizData.correctAnswer,
      rewardAmount: quizData.rewardAmount,
      entryFee: quizData.entryFee,
      teacher,
    })

    // Sync quiz with retry logic
    const syncedQuiz = await this.utils.syncOrMine<any>(quiz._id)
    const attemptedStudents = syncedQuiz.attemptedStudents || []

    return {
      ...syncedQuiz,
      paymentTxId,
      attemptedStudents,
      attemptCount: attemptedStudents.length,
      createdAt: syncedQuiz.createdAt || Date.now(),
    } as QuizDTO
  }

  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      console.log('🔍 Fetching quiz with ID:', quizId)
      const quiz = await this.utils.syncOrMine<any>(quizId)
      const attemptedStudents = quiz.attemptedStudents || []
      return {
        ...quiz,
        attemptedStudents,
        attemptCount: attemptedStudents.length,
      } as QuizDTO
    } catch (error) {
      console.error('Failed to get quiz:', error)
      return null
    }
  }

  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    return await this.quizHelper.canStudentAttemptQuiz(quizId, studentPublicKey)
  }

  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      await this.quizHelper.deactivateQuiz(quizId)
      return await this.getQuiz(quizId)
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  async getAllQuizzes(): Promise<QuizDTO[]> {
    // Query all quizzes from blockchain
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })

    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.utils.syncOrMine<any>(id)
        if (quiz && quiz.isActive) {
          const attemptedStudents = quiz.attemptedStudents || []
          quizzes.push({
            ...quiz,
            attemptedStudents,
            attemptCount: attemptedStudents.length,
          } as QuizDTO)
        }
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }

    return quizzes
  }

  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    console.log(`🔍 Fetching quizzes for teacherPublicKey: ${teacherPublicKey}`)
    const quizzes = await this.quizHelper.getQuizzesByTeacher(teacherPublicKey)
    
    const quizDTOs: QuizDTO[] = quizzes.map(quiz => ({
      ...quiz,
      attemptedStudents: quiz.attemptedStudents || [],
      attemptCount: (quiz.attemptedStudents || []).length,
      createdAt: quiz.createdAt || Date.now(),
    }))
    
    console.log("🙌🙌🙌Fetched quizzes for teacher:", quizDTOs)
    return quizDTOs
  }
}

```

# bc\HelperStudentClient.ts

```ts
/**
 * Helper-based Student Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { StudentHelper, BlockchainUtils } from '@quiz-app/contracts'
import { MODULE_SPECS } from '@/config/env'

export interface StudentDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  name: string
  publicKey: string
  attemptedQuizzes: string[]
  claimedRewards: bigint
  totalRewards: bigint
  createdAt: number
}

export class HelperStudentClient {
  private studentHelper: StudentHelper
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module spec
    this.studentHelper = new StudentHelper(computer, undefined, MODULE_SPECS.studentMod)
    this.utils = new BlockchainUtils(computer)
  }

  async createStudent(name: string, publicKey: string): Promise<StudentDTO> {
    const student = await this.studentHelper.createStudent(name, publicKey)
    return {
      ...student,
      attemptedQuizzes: (student as any).attemptedQuizzes || [],
      claimedRewards: (student as any).claimedRewards || 0n,
      totalRewards: (student as any).getTotalRewards?.() || 0n,
      createdAt: Date.now(),
    } as StudentDTO
  }

  async getStudent(studentId: string): Promise<StudentDTO> {
    const student: any = await this.utils.syncOrMine(studentId)
    return {
      ...student,
      attemptedQuizzes: student.attemptedQuizzes || [],
      claimedRewards: student.claimedRewards || 0n,
      totalRewards: student.getTotalRewards?.() || 0n,
      createdAt: student.createdAt || Date.now(),
    } as StudentDTO
  }

  async getOrCreateStudent(name: string, publicKey: string): Promise<StudentDTO> {
    // Try to find existing student
    const studentIds = await this.computer.query({
      mod: MODULE_SPECS.studentMod,
      publicKey,
    })

    if (studentIds.length > 0) {
      return await this.getStudent(studentIds[0])
    }

    // Create new student
    return await this.createStudent(name, publicKey)
  }

  async getTotalRewards(studentId: string): Promise<bigint> {
    return await this.studentHelper.getStudentTotalRewards(studentId)
  }
}

```

# bc\HelperTeacherClient.ts

```ts
/**
 * Helper-based Teacher Client for Browser
 * Uses helpers from quiz-contracts with deployed module specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { TeacherHelper, BlockchainUtils } from '@quiz-app/contracts'
import { HelperQuizClient } from './HelperQuizClient'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS } from '@/config/env'

export interface TeacherDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  name: string
  publicKey: string
  quizCount: number
  totalEarnings: bigint
  createdAt: number
}

export class HelperTeacherClient {
  private teacherHelper: TeacherHelper
  private quizClient: HelperQuizClient
  private utils: BlockchainUtils

  constructor(private computer: Computer) {
    // Initialize helper with module specs
    this.teacherHelper = new TeacherHelper(computer, MODULE_SPECS.teacherMod, MODULE_SPECS.quizMod)
    this.quizClient = new HelperQuizClient(computer)
    this.utils = new BlockchainUtils(computer)
  }

  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    const teacher = await this.teacherHelper.createTeacher(name, publicKey)
    return {
      ...teacher,
      quizCount: (teacher as any).createdQuizzes?.length || 0,
      totalEarnings: BigInt(0),
      createdAt: Date.now(),
    } as TeacherDTO
  }

  async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    // Try to find existing teacher
    const teacherIds = await this.computer.query({
      mod: MODULE_SPECS.teacherMod,
      publicKey,
    })

    if (teacherIds.length > 0) {
      const teacher: any = await this.utils.syncOrMine(teacherIds[0])
      return {
        ...teacher,
        quizCount: teacher.createdQuizzes?.length || 0,
        totalEarnings: BigInt(0),
        createdAt: teacher.createdAt || Date.now(),
      } as TeacherDTO
    }

    // Create new teacher
    return await this.createTeacher(name, publicKey)
  }

  async getTeacher(teacherId: string): Promise<TeacherDTO> {
    const teacher: any = await this.teacherHelper.getTeacher(teacherId)
    return {
      ...teacher,
      quizCount: teacher.createdQuizzes?.length || 0,
      totalEarnings: BigInt(0),
      createdAt: teacher.createdAt || Date.now(),
    } as TeacherDTO
  }

  async createQuiz(quizData: QuizData): Promise<any> {
    return await this.quizClient.createQuiz(quizData)
  }

  async getTeacherQuizzes(teacherPublicKey: string): Promise<any[]> {
    return await this.quizClient.getQuizzesByTeacher(teacherPublicKey)
  }
}

```

# bc\index.ts

```ts
/**
 * Browser-Safe SDK Factory - Creates clients using helpers from quiz-contracts
 */

import { Computer } from '@bitcoin-computer/lib'
import { BrowserQuizClient } from './BrowserQuizClient'
import { BrowserTeacherClient } from './BrowserTeacherClient'
import { BrowserAttemptClient } from './BrowserAttemptClient'
import { BrowserAccessClient } from './BrowserAccessClient'
import { HelperQuizClient } from './HelperQuizClient'
import { HelperTeacherClient } from './HelperTeacherClient'
import { HelperAttemptClient } from './HelperAttemptClient'
import { HelperAccessClient } from './HelperAccessClient'
import { HelperStudentClient } from './HelperStudentClient'
import type { ComputerConfig } from '@quiz-app/shared'

/**
 * Create Computer instance
 */
export function createBrowserComputer(config: ComputerConfig): Computer {
  return new Computer(config)
}

/**
 * Browser-safe client factory - Helper-based (RECOMMENDED)
 * Uses helpers from @quiz-app/contracts package
 */
export class HelperSDKFactory {
  constructor(private computer: Computer) {}

  createQuizClient(): HelperQuizClient {
    return new HelperQuizClient(this.computer)
  }

  createTeacherClient(): HelperTeacherClient {
    return new HelperTeacherClient(this.computer)
  }

  createAttemptClient(): HelperAttemptClient {
    return new HelperAttemptClient(this.computer)
  }

  createAccessClient(): HelperAccessClient {
    return new HelperAccessClient(this.computer)
  }

  createStudentClient(): HelperStudentClient {
    return new HelperStudentClient(this.computer)
  }
}

/**
 * Browser-safe client factory - Browser*Client based (DEPRECATED)
 * Legacy implementation - use HelperSDKFactory instead
 */
export class BrowserSDKFactory {
  constructor(private computer: Computer) {}

  createQuizClient(): BrowserQuizClient {
    return new BrowserQuizClient(this.computer)
  }

  createTeacherClient(): BrowserTeacherClient {
    return new BrowserTeacherClient(this.computer)
  }

  createAttemptClient(): BrowserAttemptClient {
    return new BrowserAttemptClient(this.computer)
  }

  createAccessClient(): BrowserAccessClient {
    return new BrowserAccessClient(this.computer)
  }
}

/**
 * Create helper-based factory (RECOMMENDED)
 */
export function createHelperSDK(computer: Computer): HelperSDKFactory {
  return new HelperSDKFactory(computer)
}

/**
 * Create browser-based factory (DEPRECATED)
 */
export function createBrowserSDK(computer: Computer): BrowserSDKFactory {
  return new BrowserSDKFactory(computer)
}

// Re-export helper-based clients (preferred)
export * from './HelperQuizClient'
export * from './HelperTeacherClient'
export * from './HelperAttemptClient'
export * from './HelperAccessClient'
export * from './HelperStudentClient'

// Re-export legacy Browser* clients for backward compatibility
export * from './BrowserQuizClient'
export * from './BrowserTeacherClient'
export * from './BrowserAttemptClient'
export * from './BrowserAccessClient'
```

# bc\README.md

```md
# Helper-Based Client Architecture

## Overview

This directory contains **helper-based client wrappers** that use the tested helper classes from `@quiz-app/contracts` package. This is the **RECOMMENDED** approach for building quiz functionality in the web app.

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      Web App (frontend)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Helper*Client (NEW - RECOMMENDED)                   │   │
│  │  - HelperQuizClient                                  │   │
│  │  - HelperTeacherClient                               │   │
│  │  - HelperAttemptClient                               │   │
│  │  - HelperAccessClient                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  @quiz-app/contracts (Single Source of Truth)        │   │
│  │  - QuizHelper, TeacherHelper, StudentHelper          │   │
│  │  - AttemptHelper, PaymentHelper                      │   │
│  │  - QuizAccessHelper, LeaderboardHelper               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Bitcoin Computer  │
                  │  Blockchain        │
                  └────────────────────┘
\`\`\`

## Migration Guide

### Old Approach (DEPRECATED)
\`\`\`typescript
import { BrowserQuizClient, BrowserTeacherClient } from '@/services/bc'

const quizClient = new BrowserQuizClient(computer)
const teacherClient = new BrowserTeacherClient(computer)
\`\`\`

### New Approach (RECOMMENDED)
\`\`\`typescript
import { HelperQuizClient, HelperTeacherClient } from '@/services/bc'
// Or use hooks:
import { useQuizClient, useTeacherClient } from '@/hooks/useClients'

const quizClient = new HelperQuizClient(computer)
// Or in React components:
const quizClient = useQuizClient()
\`\`\`

## Available Helper Clients

### HelperQuizClient
Wraps `QuizHelper` from `@quiz-app/contracts`

\`\`\`typescript
import { useQuizClient } from '@/hooks/useClients'

function MyComponent() {
  const quizClient = useQuizClient()
  
  // Create quiz
  const quiz = await quizClient.createQuiz(quizData)
  
  // Get quiz
  const quiz = await quizClient.getQuiz(quizId)
  
  // Get all quizzes
  const quizzes = await quizClient.getAllQuizzes()
  
  // Get teacher's quizzes
  const quizzes = await quizClient.getQuizzesByTeacher(teacherPublicKey)
  
  // Deactivate quiz
  await quizClient.deactivateQuiz(quizId)
  
  // Check if student can attempt
  const canAttempt = await quizClient.canStudentAttempt(quizId, studentPublicKey)
}
\`\`\`

### HelperTeacherClient
Wraps `TeacherHelper` from `@quiz-app/contracts`

\`\`\`typescript
import { useTeacherClient } from '@/hooks/useClients'

function MyComponent() {
  const teacherClient = useTeacherClient()
  
  // Create teacher
  const teacher = await teacherClient.createTeacher(name, publicKey)
  
  // Get or create teacher
  const teacher = await teacherClient.getOrCreateTeacher(name, publicKey)
  
  // Create quiz (handles payment + quiz creation)
  const quiz = await teacherClient.createQuiz(quizData)
  
  // Get teacher's quizzes
  const quizzes = await teacherClient.getTeacherQuizzes(teacherPublicKey)
}
\`\`\`

### HelperAttemptClient
Wraps `AttemptHelper` and `StudentHelper` from `@quiz-app/contracts`

\`\`\`typescript
import { useAttemptClient } from '@/hooks/useClients'

function MyComponent() {
  const attemptClient = useAttemptClient()
  
  // Submit attempt with access token
  const result = await attemptClient.submitAttempt(
    quizId,
    selectedAnswer,
    accessTokenId
  )
  
  // Get attempt
  const attempt = await attemptClient.getAttempt(attemptId)
  
  // Get student's attempts
  const attempts = await attemptClient.getStudentAttempts(studentPublicKey)
}
\`\`\`

### HelperAccessClient
Wraps `QuizAccessHelper` from `@quiz-app/contracts`

\`\`\`typescript
import { useAccessClient } from '@/hooks/useClients'

function MyComponent() {
  const accessClient = useAccessClient()
  
  // Purchase access (mint token)
  const access = await accessClient.purchase(quizId, price)
  
  // Check access
  const hasAccess = await accessClient.checkAccess(studentId, quizId)
  
  // List access tokens
  const accesses = await accessClient.listByStudent(studentId)
  
  // Mint access token
  const token = await accessClient.mintAccess(quizId, amount)
  
  // Get balance
  const balance = await accessClient.getBalance(quizId)
  
  // Transfer access
  await accessClient.transferAccess(to, amount, quizId)
}
\`\`\`

## Benefits

1. **Single Source of Truth**: Business logic lives in `@quiz-app/contracts` helpers
2. **Tested Code**: Helpers are thoroughly tested in the quiz-contracts package
3. **Code Reuse**: Same helpers work in tests and frontend
4. **Cleaner Architecture**: No duplication of logic
5. **Easier Maintenance**: Changes to helpers automatically propagate to web app

## File Structure

\`\`\`
apps/web/src/services/bc/
├── HelperQuizClient.ts          # ✅ NEW - Recommended
├── HelperTeacherClient.ts       # ✅ NEW - Recommended
├── HelperAttemptClient.ts       # ✅ NEW - Recommended
├── HelperAccessClient.ts        # ✅ NEW - Recommended
├── BrowserQuizClient.ts         # ⚠️ DEPRECATED
├── BrowserTeacherClient.ts      # ⚠️ DEPRECATED
├── BrowserAttemptClient.ts      # ⚠️ DEPRECATED
├── BrowserAccessClient.ts       # ⚠️ DEPRECATED
├── index.ts                     # Exports both Helper* and Browser* clients
└── txUtils.ts                   # Utility functions
\`\`\`

## Hooks

Updated hooks in `apps/web/src/hooks/useClients.ts`:

\`\`\`typescript
// ✅ Recommended
useHelperSDK()
useQuizClient()      // Returns HelperQuizClient
useTeacherClient()   // Returns HelperTeacherClient
useAttemptClient()   // Returns HelperAttemptClient
useAccessClient()    // Returns HelperAccessClient

// ⚠️ Deprecated
useBrowserSDK()
\`\`\`

## Testing

The helper-based clients use the same underlying helpers that are tested in the quiz-contracts package:

\`\`\`bash
# Test helpers in quiz-contracts
cd packages/quiz-contracts
npm run test:teacher-helper
npm run test:student-helper
npm run test:quiz-helper
\`\`\`

## Migration Checklist

- [ ] Update imports from `Browser*Client` to `Helper*Client`
- [ ] Replace `useBrowserSDK()` with `useHelperSDK()`
- [ ] Update service files to use helper-based clients
- [ ] Test all quiz operations (create, attempt, claim reward)
- [ ] Remove deprecated Browser*Client files (after full migration)

## Notes

- The deprecated `Browser*Client` files are kept for backward compatibility
- New features should only use helper-based clients
- Consider removing deprecated clients after full migration

```

# bc\txUtils.ts

```ts
import type { Computer } from '@bitcoin-computer/lib'

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * One global queue per Computer instance so *all* clients sharing the same computer
 * cannot broadcast conflicting txs concurrently.
 */
const computerLocks = new WeakMap<Computer, Promise<void>>()

export async function withComputerLock<T>(computer: Computer, fn: () => Promise<T>): Promise<T> {
  const prev = computerLocks.get(computer) ?? Promise.resolve()

  let release!: () => void
  const next = new Promise<void>((r) => (release = r))

  computerLocks.set(computer, prev.then(() => next))

  await prev
  try {
    return await fn()
  } finally {
    release()
  }
}

function msgOf(err: any) {
  return String(err?.message ?? err?.toString?.() ?? '')
}

export function isRetryableBcNetworkError(err: any) {
  const msg = msgOf(err)
  const code = String(err?.code ?? '')

  // Axios/browser/network-ish
  if (code === 'ERR_NETWORK') return true
  if (msg.includes('Network Error')) return true
  if (msg.includes('ERR_EMPTY_RESPONSE')) return true
  if (msg.includes('ECONNRESET')) return true
  if (msg.toLowerCase().includes('timeout')) return true

  return false
}

export function isRetryableMempoolError(err: any) {
  const msg = msgOf(err)
  return (
    msg.includes('txn-mempool-conflict') ||
    msg.includes('too-long-mempool-chain') ||
    msg.includes('insufficient fee') // sometimes transient with dynamic fee estimation
  )
}

/**
 * Wait until the BCN indexer can `sync(id)` (helps after broadcast before next encode/fund).
 * Works for unconfirmed objects too (mempool).
 */
export async function waitForSync(
  computer: Computer,
  id: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {}
) {
  const timeoutMs = opts.timeoutMs ?? 15_000
  const intervalMs = opts.intervalMs ?? 300

  const start = Date.now()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await computer.sync(id)
      return
    } catch (e) {
      if (Date.now() - start > timeoutMs) throw e
      await sleep(intervalMs)
    }
  }
}

type EncodeArgs = {
  exp: string
  mod: string
  env?: Record<string, string>
}

type EncodeBroadcastOpts = {
  label?: string
  maxAttempts?: number
  baseDelayMs?: number
  postBroadcastDelayMs?: number
  waitForEffectSync?: boolean
}

/**
 * Re-encodes and re-broadcasts on transient errors.
 * IMPORTANT: on mempool-conflict you *must* re-encode to get different inputs.
 */
export async function encodeBroadcastWithRetry(
  computer: Computer,
  args: EncodeArgs,
  opts: EncodeBroadcastOpts = {}
): Promise<any> {
  const label = opts.label ?? 'tx'
  const maxAttempts = opts.maxAttempts ?? 6
  const baseDelayMs = opts.baseDelayMs ?? 450
  const postBroadcastDelayMs = opts.postBroadcastDelayMs ?? 800
  const waitForEffectSync = opts.waitForEffectSync ?? true

  let lastErr: any

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const encoded = await computer.encode(args)

      await computer.broadcast(encoded.tx)

      // give BCN a moment to update UTXO view / mempool index
      if (waitForEffectSync) {
        const id = encoded?.effect?.res?._id
        if (typeof id === 'string' && id.length > 10) {
          try {
            await waitForSync(computer, id, { timeoutMs: 12_000, intervalMs: 250 })
          } catch {
            // not fatal; we still delay below
          }
        }
      }

      await sleep(postBroadcastDelayMs)
      return encoded
    } catch (err: any) {
      lastErr = err

      const retryable =
        isRetryableBcNetworkError(err) ||
        isRetryableMempoolError(err)

      if (!retryable || attempt === maxAttempts) break

      // backoff
      const extra = isRetryableMempoolError(err) ? 600 : 0
      const delay = baseDelayMs * attempt + extra
      console.warn(`⚠️ ${label} failed (attempt ${attempt}/${maxAttempts}): ${msgOf(err)}. Retrying in ${delay}ms`)
      await sleep(delay)
    }
  }

  throw lastErr
}
```

# contracts\contractsService.ts

```ts
/**
 * Contracts Service - Manages Computer instance and Helper clients
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS } from '@/config'
import { createComputerFromStorage } from '../sdk.factory'
import {
  HelperTeacherClient,
  HelperStudentClient,
  HelperQuizClient,
  HelperAccessClient,
  HelperAttemptClient,
} from '@/services/bc'

/**
 * Get Computer instance from storage (same as wallet)
 */
export function getComputer(): Computer {
  return createComputerFromStorage()
}

/**
 * Create a new Computer instance (useful for multi-wallet scenarios)
 */
export function createNewComputer(config: any): Computer {
  return new Computer(config)
}

/**
 * Reset Computer instance
 */
export function resetComputer(): void {
  // No singleton to reset since we're using storage-based computer
}

/**
 * Get Helper clients
 */
export function getTeacherClient(computer?: Computer): HelperTeacherClient {
  return new HelperTeacherClient(computer || getComputer())
}

export function getStudentClient(computer?: Computer): HelperStudentClient {
  return new HelperStudentClient(computer || getComputer())
}

export function getQuizClient(computer?: Computer): HelperQuizClient {
  return new HelperQuizClient(computer || getComputer())
}

export function getAccessClient(computer?: Computer): HelperAccessClient {
  return new HelperAccessClient(computer || getComputer())
}

export function getAttemptClient(computer?: Computer): HelperAttemptClient {
  return new HelperAttemptClient(computer || getComputer())
}

/**
 * Get all clients at once
 */
export function getAllClients(computer?: Computer) {
  const comp = computer || getComputer()
  return {
    teacher: getTeacherClient(comp),
    student: getStudentClient(comp),
    quiz: getQuizClient(comp),
    access: getAccessClient(comp),
    attempt: getAttemptClient(comp)
  }
}

```

# contracts\index.ts

```ts
export * from './contractsService'

```

# index.ts

```ts
export * from './contracts/index'
export * from './sdk.factory'
export * from './api.client'
export * from './tx/txParser'
export * from './bc'

```

# sdk.factory.ts

```ts
/**
 * SDK Factory - Creates SDK clients from wallet/config
 */

import { Computer } from '@bitcoin-computer/lib'
import { createComputer } from '@quiz-app/shared'
import type { ComputerConfig, Chain, Network } from '@quiz-app/shared'

export interface SDKFactoryConfig {
  chain: Chain
  network: Network
  url: string
  mnemonic?: string
  path?: string
}

/**
 * Create Computer instance with config
 */
export function createComputerInstance(config: SDKFactoryConfig): Computer {
  const computerConfig: ComputerConfig = {
    chain: config.chain,
    network: config.network,
    url: config.url,
  }

  if (config.mnemonic) {
    computerConfig.mnemonic = config.mnemonic
  }

  if (config.path) {
    computerConfig.path = config.path
  }

  return createComputer(computerConfig)
}

/**
 * Create Computer from localStorage (for bc components)
 */
export function createComputerFromStorage(): Computer {
  const mnemonic = typeof window !== 'undefined' ? localStorage.getItem('BIP_39_KEY') : null
  const chain = typeof window !== 'undefined' ? (localStorage.getItem('CHAIN') as Chain) : 'LTC'
  const network = typeof window !== 'undefined' ? (localStorage.getItem('NETWORK') as Network) : 'regtest'
  const url = typeof window !== 'undefined' ? localStorage.getItem('URL') : 'http://localhost:1031'
  const path = typeof window !== 'undefined' ? localStorage.getItem('PATH') : undefined

  const config: any = { chain, network, url }
  if (mnemonic) config.mnemonic = mnemonic
  if (path) config.path = path

  return new Computer(config)
}

```

# tx\txParser.ts

```ts
/**
 * Transaction Parser - Decode Bitcoin Computer transactions for UI display
 */

import type { Computer } from '@bitcoin-computer/lib'

export interface ParsedTransaction {
  txId: string
  inputs: ParsedInput[]
  outputs: ParsedOutput[]
  fee: number
  timestamp?: number
}

export interface ParsedInput {
  address: string
  value: number
  prevTxId: string
  prevIndex: number
}

export interface ParsedOutput {
  address: string
  value: number
  index: number
  isChange?: boolean
}

/**
 * Parse transaction data from Computer
 */
export async function parseTransaction(
  computer: Computer,
  txId: string
): Promise<ParsedTransaction | null> {
  try {
    // This is a simplified parser. Extend based on your needs
    const tx = await computer.provider.blockchain.tx.fetch(txId)
    
    if (!tx) return null

    return {
      txId,
      inputs: tx.vin?.map((input: any) => ({
        address: input.addr || 'Unknown',
        value: input.value || 0,
        prevTxId: input.txid,
        prevIndex: input.vout,
      })) || [],
      outputs: tx.vout?.map((output: any, index: number) => ({
        address: output.scriptPubKey?.addresses?.[0] || 'Unknown',
        value: output.value || 0,
        index,
      })) || [],
      fee: 0, // Calculate from inputs/outputs if needed
      timestamp: tx.time,
    }
  } catch (error) {
    console.error('Failed to parse transaction:', error)
    return null
  }
}

/**
 * Get transaction URL for block explorer
 */
export function getExplorerUrl(
  txId: string,
  chain: string,
  network: string
): string {
  if (network === 'regtest' || network === 'testnet') {
    return `#` // No explorer for regtest
  }

  if (chain === 'BTC') {
    return `https://blockstream.info/tx/${txId}`
  }

  if (chain === 'LTC') {
    return `https://blockexplorer.one/litecoin/mainnet/tx/${txId}`
  }

  return '#'
}

/**
 * Format satoshis to readable amount
 */
export function formatSatoshis(satoshis: number | bigint, decimals: number = 8): string {
  const amount = Number(satoshis) / Math.pow(10, decimals)
  return amount.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * Parse smart object revision
 */
export function parseRevision(rev: string): { txId: string; index: number } | null {
  const parts = rev.split(':')
  if (parts.length !== 2) return null
  
  return {
    txId: parts[0],
    index: parseInt(parts[1], 10),
  }
}

```

# utils\mineblock.ts

```ts
type BcnRpcEnvelope = {
  result: {
    result: unknown
    error: unknown
    id: number
  }
}

async function bcnRpc(url: string, chain: string, network: string, method: string, params: string = '') {
  const endpoint = `${url}/v1/${chain}/${network}/rpc`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  })

  const json = (await res.json()) as BcnRpcEnvelope
  if (!res.ok || json.result.error) {
    throw new Error(`RPC ${method} failed: ${JSON.stringify(json.result.error ?? json)}`)
  }
  return json.result.result
}

export class MineBlocks {
  /**
   * Mines blocks to a node-wallet address (NOT your Computer wallet),
   * so it confirms txs without creating immature coinbase UTXOs in your test wallet.
   */
  static async mine(url: string, chain: string, network: string, blocks: number = 1) {
    const addr = (await bcnRpc(url, chain, network, 'getnewaddress', 'mining legacy')) as string
    await bcnRpc(url, chain, network, 'generatetoaddress', `${blocks} ${addr}`)
    await new Promise((r) => setTimeout(r, 300))
  }
}
```

