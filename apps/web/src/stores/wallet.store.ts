'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chain, Network } from '@/types'
import { STORAGE_KEYS } from '@/config'

interface WalletState {
  publicKey: string | null
  address: string | null
  path: string | null
  chain: Chain | null
  network: Network | null
  url: string | null
  moduleSpecs: Record<string, string>
  isConnected: boolean
  connect: (data: {
    publicKey: string
    address: string
    chain: Chain
    network: Network
    url: string
    path?: string
  }) => void
  disconnect: () => void
  updateConfig: (config: Partial<{
    chain: Chain
    network: Network
    url: string
    path: string
  }>) => void
  setModuleSpecs: (specs: Record<string, string>) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // Initial state — no hardcoded values
      publicKey: null,
      address: null,
      path: null,
      chain: null,
      network: null,
      url: null,
      moduleSpecs: {},
      isConnected: false,

      // Actions
      connect: (data) => {
        if (typeof window !== 'undefined') {
          const mnemonic = localStorage.getItem('BIP_39_KEY')
          if (mnemonic) {
            localStorage.setItem('CHAIN', data.chain)
            localStorage.setItem('NETWORK', data.network)
            localStorage.setItem('URL', data.url)
            if (data.path) {
              localStorage.setItem('PATH', data.path)
            }
          }
        }
        set({
          publicKey: data.publicKey,
          address: data.address,
          chain: data.chain,
          network: data.network,
          url: data.url,
          path: data.path || null,
          isConnected: true,
        })
      },

      disconnect: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('BIP_39_KEY')
          localStorage.removeItem('CHAIN')
          localStorage.removeItem('NETWORK')
          localStorage.removeItem('URL')
          localStorage.removeItem('PATH')
        }
        set({
          publicKey: null,
          address: null,
          path: null,
          chain: null,
          network: null,
          url: null,
          isConnected: false,
        })
      },

      updateConfig: (config) => {
        set((state) => ({
          ...state,
          ...config,
        }))
      },

      setModuleSpecs: (specs) => {
        set({ moduleSpecs: specs })
      },
    }),
    {
      name: STORAGE_KEYS.WALLET,
    }
  )
)