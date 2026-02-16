'use client'

import { ReactNode } from 'react'
import { UtilsProvider } from '@/components/bc'

/**
 * Client-side providers wrapper
 * Add any context providers, state managers, etc. here
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <UtilsProvider>
      {children}
    </UtilsProvider>
  )
}
