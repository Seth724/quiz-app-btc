/**
 * API Client - Handles communication with NestJS backend
 * @deprecated Use services from '@/services/backend' instead.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

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
