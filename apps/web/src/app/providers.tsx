'use client'

import { ReactNode } from 'react'
import { ClientProviders } from '@/common-components/ClientProvider'

/**
 * Client-side providers wrapper
 * Add any context providers, state managers, etc. here
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  )
}
