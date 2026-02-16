'use client'

import { useMemo } from 'react'
import { useWalletStore } from '@/stores'
import { createComputerFromStorage } from '@/services'
import { createBrowserSDK, BrowserQuizClient, BrowserTeacherClient, BrowserAttemptClient, BrowserAccessClient } from '@/services/bc'

/**
 * Hook to access Computer instance
 */
export function useComputer() {
  return useMemo(() => {
    return createComputerFromStorage()
  }, [])
}

/**
 * Hook to access browser-safe SDK clients
 */
export function useBrowserSDK() {
  const computer = useComputer()
  
  return useMemo(() => createBrowserSDK(computer), [computer])
}

/**
 * Hook to access specific browser-safe clients
 */
export function useTeacherClient(): BrowserTeacherClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createTeacherClient(), [sdk])
}

export function useQuizClient(): BrowserQuizClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createQuizClient(), [sdk])
}

export function useAttemptClient(): BrowserAttemptClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createAttemptClient(), [sdk])
}

export function useAccessClient(): BrowserAccessClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createAccessClient(), [sdk])
}

/**
 * Create quiz client instance outside of React components
 */
export function createQuizClient(): BrowserQuizClient {
  const computer = createComputerFromStorage()
  const sdk = createBrowserSDK(computer)
  return sdk.createQuizClient()
}
