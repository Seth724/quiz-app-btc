/**
 * Hook for quiz operations
 */

'use client'

import { useState, useEffect } from 'react'
import { useQuizClient } from '@/hooks'
import { getQuiz, listQuizzesByTeacher, type Quiz } from '../quizzes.service'

export function useQuiz(quizId: string) {
  const quizClient = useQuizClient()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('🪝 useQuiz - fetchQuiz START, quizId:', quizId)
        console.log('🪝 useQuiz - quizClient exists:', !!quizClient)
        setLoading(true)
        setError(null)
        const data = await getQuiz(quizClient, quizId)
        console.log('🪝 useQuiz - fetchQuiz GOT DATA:', data ? 'quiz found' : 'null')
        if (data) {
          console.log('🪝 useQuiz - quiz title:', data.title, 'keys:', Object.keys(data))
        }
        setQuiz(data)
        console.log('🪝 useQuiz - state updated with quiz data')
      } catch (err) {
        console.error('❌ useQuiz - fetchQuiz ERROR:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch quiz')
      } finally {
        setLoading(false)
        console.log('🪝 useQuiz - fetchQuiz DONE, loading set to false')
      }
    }

    if (quizId) {
      console.log('🪝 useQuiz - triggering fetchQuiz for quizId:', quizId)
      fetchQuiz()
    } else {
      console.log('🪝 useQuiz - no quizId, skipping fetch')
    }
  }, [quizId]) // Remove quizClient from dependencies to prevent infinite loop

  return { quiz, loading, error }
}

export function useTeacherQuizzes(teacherId: string) {
  const quizClient = useQuizClient()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listQuizzesByTeacher(quizClient, teacherId)
      console.log('👍👍👍Fetched quizzes for teacher', teacherId, data)
      setQuizzes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }
 console.log('👌👌👌useTeacherQuizzes - teacherId:', teacherId)
  useEffect(() => {
    if (teacherId) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]) // Remove quizClient from dependencies to prevent infinite loop

  return { quizzes, loading, error, refresh }
}
