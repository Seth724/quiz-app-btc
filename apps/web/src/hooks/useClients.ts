'use client'

import { useMemo } from 'react'
import { useWalletStore } from '@/stores'
import { createComputerFromStorage } from '@/services'
import {
  createHelperSDK,
  HelperQuizClient,
  HelperTeacherClient,
  HelperAttemptClient,
  HelperAccessClient,
  HelperStudentClient,
} from '@/services/bc'

/**
 * Hook to access Computer instance
 */
export function useComputer() {
  return useMemo(() => {
    return createComputerFromStorage()
  }, [])
}

/**
 * Hook to access browser-safe SDK clients (Helper-based - RECOMMENDED)
 * Uses helpers from @quiz-app/contracts package
 */
export function useHelperSDK() {
  const computer = useComputer()
  return useMemo(() => createHelperSDK(computer), [computer])
}

/**
 * Hook to access specific helper-based clients (RECOMMENDED)
 */
export function useTeacherClient(): HelperTeacherClient {
  const sdk = useHelperSDK()
  return useMemo(() => sdk.createTeacherClient(), [sdk])
}

export function useQuizClient(): HelperQuizClient {
  const sdk = useHelperSDK()
  return useMemo(() => sdk.createQuizClient(), [sdk])
}

export function useAttemptClient(): HelperAttemptClient {
  const sdk = useHelperSDK()
  return useMemo(() => sdk.createAttemptClient(), [sdk])
}

export function useAccessClient(): HelperAccessClient {
  const sdk = useHelperSDK()
  return useMemo(() => sdk.createAccessClient(), [sdk])
}

export function useStudentClient(): HelperStudentClient {
  const sdk = useHelperSDK()
  return useMemo(() => sdk.createStudentClient(), [sdk])
}

/**
 * Create quiz client instance outside of React components (RECOMMENDED)
 */
export function createQuizClient(): HelperQuizClient {
  const computer = createComputerFromStorage()
  const sdk = createHelperSDK(computer)
  return sdk.createQuizClient()
}
