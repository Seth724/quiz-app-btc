'use client'

import { useMemo } from 'react'
import { useWalletStore } from '@/stores'
import { getComputer, getAllClients } from '@/services'

/**
 * Hook to access Computer instance
 */
export function useComputer() {
  const { chain, network, url, path } = useWalletStore()
  
  return useMemo(() => {
    return getComputer({ chain, network, url, path: path || undefined })
  }, [chain, network, url, path])
}

/**
 * Hook to access all SDK clients
 */
export function useClients() {
  const computer = useComputer()
  
  return useMemo(() => getAllClients(computer), [computer])
}

/**
 * Hook to access specific client
 */
export function useTeacherClient() {
  const { teacher } = useClients()
  return teacher
}

export function useStudentClient() {
  const { student } = useClients()
  return student
}

export function useQuizClient() {
  const { quiz } = useClients()
  return quiz
}

export function useAccessClient() {
  const { access } = useClients()
  return access
}

export function usePaymentClient() {
  const { payment } = useClients()
  return payment
}

export function useAttemptClient() {
  const { attempt } = useClients()
  return attempt
}
