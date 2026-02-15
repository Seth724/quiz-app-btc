'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config'

type UserRole = 'teacher' | 'student' | null

interface SessionState {
  // User role
  role: UserRole
  
  // User data
  userId: string | null // teacher/student contract ID
  userName: string | null
  
  // Navigation
  lastVisitedPage: string | null
  
  // Actions
  setRole: (role: UserRole) => void
  setUser: (userId: string, userName: string) => void
  clearUser: () => void
  setLastVisitedPage: (page: string) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // Initial state
      role: null,
      userId: null,
      userName: null,
      lastVisitedPage: null,
      
      // Actions
      setRole: (role) => set({ role }),
      
      setUser: (userId, userName) => set({ userId, userName }),
      
      clearUser: () => set({ userId: null, userName: null }),
      
      setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
      
      reset: () => set({
        role: null,
        userId: null,
        userName: null,
        lastVisitedPage: null
      })
    }),
    {
      name: STORAGE_KEYS.SESSION
    }
  )
)
