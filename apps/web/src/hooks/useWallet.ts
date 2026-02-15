'use client'

import { useWalletStore } from '@/stores'

/**
 * Hook to access wallet state and actions
 */
export function useWallet() {
  const wallet = useWalletStore()
  
  return {
    // State
    publicKey: wallet.publicKey,
    address: wallet.address,
    path: wallet.path,
    isConnected: wallet.isConnected,
    
    // Config
    chain: wallet.chain,
    network: wallet.network,
    url: wallet.url,
    
    // Module specs
    moduleSpecs: wallet.moduleSpecs,
    
    // Actions
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    updateConfig: wallet.updateConfig,
    setModuleSpecs: wallet.setModuleSpecs
  }
}
