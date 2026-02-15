'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chain, Network } from '@quiz-app/shared'
import { STORAGE_KEYS } from '@/config'

interface WalletState {
  // Wallet data
  publicKey: string | null
  address: string | null
  path: string | null
  
  // Blockchain config
  chain: Chain
  network: Network
  url: string
  
  // Module specs (cached from config or deployment)
  moduleSpecs: {
    teacherMod?: string
    studentMod?: string
    quizMod?: string
    attemptMod?: string
    paymentMod?: string
    quizAccessMod?: string
    quizAccessSaleMod?: string
  }
  
  // Connection state
  isConnected: boolean
  
  // Actions
  connect: (data: {
    publicKey: string
    address: string
    path?: string
  }) => void
  disconnect: () => void
  updateConfig: (config: { chain?: Chain; network?: Network; url?: string }) => void
  setModuleSpecs: (specs: Partial<WalletState['moduleSpecs']>) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // Initial state
      publicKey: null,
      address: null,
      path: null,
      chain: 'LTC',
      network: 'regtest',
      url: 'http://localhost:1031',
      moduleSpecs: {},
      isConnected: false,
      
      // Actions
      connect: (data) => set({
        publicKey: data.publicKey,
        address: data.address,
        path: data.path,
        isConnected: true
      }),
      
      disconnect: () => set({
        publicKey: null,
        address: null,
        path: null,
        isConnected: false
      }),
      
      updateConfig: (config) => set((state) => ({
        chain: config.chain ?? state.chain,
        network: config.network ?? state.network,
        url: config.url ?? state.url
      })),
      
      setModuleSpecs: (specs) => set((state) => ({
        moduleSpecs: { ...state.moduleSpecs, ...specs }
      }))
    }),
    {
      name: STORAGE_KEYS.WALLET
    }
  )
)
