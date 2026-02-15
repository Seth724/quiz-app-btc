# API-Frontend Connection Guide

This document explains how the frontend and API are connected in the Quiz App.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  User Browser                        │
│  ┌──────────────────┐      ┌──────────────────┐    │
│  │   Next.js Web    │      │   API Calls      │    │
│  │  (Port 3000)     │─────▶│                  │    │
│  └──────────────────┘      └──────────────────┘    │
└─────────────────────────────────────────────────────┘
           │                           │
           │ SDK Calls                 │ HTTP/REST
           ↓                           ↓
┌─────────────────────┐    ┌────────────────────────┐
│  @quiz-app/sdk      │    │   NestJS API           │
│  (Contract Clients) │    │   (Port 3001)          │
└─────────────────────┘    └────────────────────────┘
           │                           │
           │ Blockchain Calls          │ Database
           ↓                           ↓
┌─────────────────────┐    ┌────────────────────────┐
│  Smart Contracts    │    │   PostgreSQL           │
│  (Blockchain)       │    │   (Port 5432)          │
└─────────────────────┘    └────────────────────────┘
```

## 🔄 Two Data Flows

### Flow 1: Blockchain Operations (via SDK)
**Frontend → SDK → Contracts → Blockchain**

Used for:
- Creating quizzes
- Purchasing access tokens
- Submitting quiz attempts
- Withdrawing payments

Example:
```typescript
// apps/web/src/features/quiz/hooks/useCreateQuiz.ts
import { useTeacherClient } from '@/hooks'

export function useCreateQuiz() {
  const teacherClient = useTeacherClient()
  
  return async (data: QuizData) => {
    // Direct blockchain operation via SDK
    const quiz = await teacherClient.createQuiz(data)
    
    // After blockchain success, notify API
    await fetch('http://localhost:3001/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        id: quiz._id,
        title: data.title,
        ...data
      })
    })
    
    return quiz
  }
}
```

### Flow 2: Fast Queries (via API)
**Frontend → API → Database**

Used for:
- Listing quizzes with filters
- Viewing leaderboard
- Getting user stats
- Searching quizzes

Example:
```typescript
// apps/web/src/features/quiz/hooks/useQuizzes.ts
import { useState, useEffect } from 'react'

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  
  useEffect(() => {
    // Fast query from database via API
    fetch('http://localhost:3001/api/quizzes?isActive=true')
      .then(res => res.json())
      .then(data => setQuizzes(data.data))
  }, [])
  
  return { quizzes }
}
```

## 📡 API Service Layer

Create an API service to centralize API calls:

```typescript
// apps/web/src/services/api/apiService.ts
import { BASE_API_URL } from '@/config'

class ApiService {
  private baseUrl = BASE_API_URL || 'http://localhost:3001/api'
  
  async createQuiz(quizData: any) {
    const response = await fetch(`${this.baseUrl}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    })
    return response.json()
  }
  
  async getQuizzes(filters?: any) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.baseUrl}/quizzes?${params}`)
    return response.json()
  }
  
  async getLeaderboard(limit = 100) {
    const response = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`)
    return response.json()
  }
  
  async recordAttempt(attemptData: any) {
    const response = await fetch(`${this.baseUrl}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attemptData)
    })
    return response.json()
  }
}

export const apiService = new ApiService()
```

## 🔧 Configuration

### Frontend Config (apps/web/src/config/env.ts)

Add API URL:
```typescript
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
```

### Frontend .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📊 Complete Example: Teacher Creates Quiz

### Step 1: Teacher Creates Quiz (Frontend)

```typescript
// apps/web/src/features/quiz/services/quizService.ts
import { useTeacherClient } from '@/hooks'
import { apiService } from '@/services/api/apiService'

export async function createQuizComplete(quizData: QuizData) {
  // 1. Create on blockchain via SDK
  const teacherClient = useTeacherClient()
  const quiz = await teacherClient.createQuiz(quizData)
  
  // 2. Index in database via API
  await apiService.createQuiz({
    id: quiz._id,
    title: quizData.title,
    questionText: quizData.questionText,
    options: quizData.options,
    rewardAmount: Number(quizData.rewardAmount),
    entryFee: Number(quizData.entryFee),
    paymentTxId: quizData.paymentTxId,
    teacherPubKey: teacherClient.computer.getPublicKey()
  })
  
  return quiz
}
```

### Step 2: Student Views Quiz List (Fast)

```typescript
// apps/web/src/features/quiz/hooks/useQuizList.ts
import { useState, useEffect } from 'react'
import { apiService } from '@/services/api/apiService'

export function useQuizList(filters?: any) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    apiService.getQuizzes(filters)
      .then(response => {
        setQuizzes(response.data)
        setLoading(false)
      })
  }, [filters])
  
  return { quizzes, loading }
}
```

### Step 3: Student Attempts Quiz (Blockchain + API)

```typescript
// apps/web/src/features/quiz/services/attemptService.ts
import { useStudentClient } from '@/hooks'
import { apiService } from '@/services/api/apiService'

export async function attemptQuizComplete(
  quizId: string,
  selectedAnswer: number,
  accessTokenId: string
) {
  // 1. Submit on blockchain via SDK
  const studentClient = useStudentClient()
  const result = await studentClient.attemptQuizWithAccess(
    quizId,
    selectedAnswer,
    accessTokenId
  )
  
  // 2. Record in database via API
  await apiService.recordAttempt({
    quizId,
    studentPubKey: studentClient.computer.getPublicKey(),
    selectedAnswer,
    isCorrect: result.isCorrect,
    rewardEarned: Number(result.rewardEarned),
    blockchainTxId: result.attemptTxId // if available
  })
  
  return result
}
```

## 🎯 When to Use What

### Use SDK (Blockchain) for:
✅ Writing data (create, update, delete)  
✅ Payments and transfers  
✅ Access token operations  
✅ Single object reads (when you have the ID)  

### Use API (Database) for:
✅ Listing with filters  
✅ Pagination  
✅ Sorting  
✅ Searching  
✅ Aggregations (leaderboard)  
✅ Stats and analytics  
✅ Fast repeated queries  

## 🔐 CORS Configuration

The API is configured to allow requests from the frontend:

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

Make sure `CORS_ORIGIN` in `apps/api/.env` matches your frontend URL.

## 📈 Performance Tips

1. **Cache API responses** when data doesn't change frequently
2. **Use SWR or React Query** for automatic caching and revalidation
3. **Paginate large lists** using API skip/take parameters
4. **Debounce search** queries
5. **Use blockchain for truth**, API for speed

## 🧪 Testing the Connection

### Test 1: Health Check
```bash
curl http://localhost:3001/api/quizzes
```

### Test 2: From Frontend Console
```javascript
fetch('http://localhost:3001/api/quizzes')
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Swagger UI
Visit http://localhost:3001/api and try endpoints

## 🔄 Update Flow Diagram

```
Teacher Creates Quiz:
  Web Form → SDK Client → Blockchain → Success
                ↓
         API POST /quizzes → PostgreSQL
                ↓
         Confirmation to User

Student Views Quizzes:
  Web Component → API GET /quizzes → PostgreSQL
                ↓
         Display List (Fast!)

Student Attempts:
  Submit Answer → SDK Client → Blockchain → Success
                ↓
         API POST /attempts → PostgreSQL → Update Leaderboard
                ↓
         Show Result + Updated Rank
```

## 🎁 Bonus: React Query Integration (Optional)

For better API state management:

```bash
npm install @tanstack/react-query --workspace=@quiz-app/web
```

```typescript
// apps/web/src/hooks/useApiQuery.ts
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api/apiService'

export function useQuizzes(filters?: any) {
  return useQuery({
    queryKey: ['quizzes', filters],
    queryFn: () => apiService.getQuizzes(filters)
  })
}

export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => apiService.getLeaderboard(limit),
    refetchInterval: 30000 // Refresh every 30s
  })
}
```

This provides automatic caching, refetching, and loading states!
