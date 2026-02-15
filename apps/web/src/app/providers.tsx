'use client'

import { ReactNode } from 'react'

/**
 * Client-side providers wrapper
 * Add any context providers, state managers, etc. here
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}
