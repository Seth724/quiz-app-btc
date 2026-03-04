'use client'

import { useMemo } from 'react'
import { useWalletStore } from '@/stores'
import { createComputerFromStorage } from '@/services'
import { createBrowserSDK, BrowserQuizClient, BrowserTeacherClient, BrowserAttemptClient, BrowserAccessClient } from '@/services/bc'
import type { Computer } from '@bitcoin-computer/lib'

/**
 * Hook to access Computer instance.
 * Returns null if wallet is not connected yet.
 */
export function useComputer(): Computer | null {
  const { isConnected } = useWalletStore()
  return useMemo(() => {
    return createComputerFromStorage()
  }, [isConnected])
}

/**
 * Hook to access browser-safe SDK clients.
 * Returns null if wallet is not connected.
 */
export function useBrowserSDK() {
  const computer = useComputer()
  
  return useMemo(() => {
    if (!computer) return null
    return createBrowserSDK(computer)
  }, [computer])
}

/**
 * Hook to access specific browser-safe clients.
 * Returns null if wallet is not connected.
 */
export function useTeacherClient(): BrowserTeacherClient | null {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk?.createTeacherClient() ?? null, [sdk])
}

export function useQuizClient(): BrowserQuizClient | null {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk?.createQuizClient() ?? null, [sdk])
}

export function useAttemptClient(): BrowserAttemptClient | null {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk?.createAttemptClient() ?? null, [sdk])
}

export function useAccessClient(): BrowserAccessClient | null {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk?.createAccessClient() ?? null, [sdk])
}

/**
 * Create quiz client instance outside of React components.
 * Returns null if wallet is not connected.
 */
export function createQuizClient(): BrowserQuizClient | null {
  const computer = createComputerFromStorage()
  if (!computer) return null
  const sdk = createBrowserSDK(computer)
  return sdk.createQuizClient()
}
