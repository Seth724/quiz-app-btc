/**
 * Hook for wallet information
 */

'use client'

import { useEffect, useState } from 'react'
import { useComputer } from '@/hooks'
import { getWalletInfo, type WalletInfo } from '../wallet.service'

export function useWalletInfo() {
  const computer = useComputer()
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    if (!computer) {
      setWalletInfo(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const info = await getWalletInfo(computer)
      setWalletInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer]) // Re-fetch when computer becomes available

  return {
    walletInfo,
    loading,
    error,
    refresh,
  }
}
