/**
 * Wallet Connect Component - Wrapper around bc Auth component
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/stores'
import { connectWallet, generateMnemonic, getWalletInfo } from '../wallet.service'
import { createComputerFromStorage } from '@/services'
import type { Chain, Network } from '@/types'
import { useSessionStore } from '@/stores'

interface WalletConnectProps {
  onConnect?: () => void
  redirectTo?: string
}

export function WalletConnect({ onConnect, redirectTo }: WalletConnectProps) {
  const router = useRouter()
  const {setUser} = useSessionStore()
  const { connect: storeConnect, updateConfig } = useWalletStore()
  const [mnemonic, setMnemonic] = useState('')
  const [chain, setChain] = useState<Chain>('LTC')
  const [network, setNetwork] = useState<Network>('regtest')
  const [url, setUrl] = useState('http://localhost:1031')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!mnemonic.trim()) {
        throw new Error('Please enter a mnemonic')
      }

      // Store in localStorage
      connectWallet(mnemonic, chain, network, url)

      // Update store config
      updateConfig({ chain, network, url })

      // Get wallet info
      const computer = createComputerFromStorage()
      const info = await getWalletInfo(computer)

      setUser(computer.getPublicKey(), computer.getAddress())
      // Update wallet store
      storeConnect({
        publicKey: info.publicKey,
        address: info.address,
      })

      onConnect?.()
      
      if (redirectTo) {
        router.push(redirectTo)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMnemonic = () => {
    setMnemonic(generateMnemonic())
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h2>
      
      <div className="space-y-4">
        {/* Mnemonic Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              BIP 39 Mnemonic
            </label>
            <button
              onClick={handleGenerateMnemonic}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Generate
            </button>
          </div>
          <textarea
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter or generate mnemonic"
          />
        </div>

        {/* Chain Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value as Chain)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="LTC">Litecoin</option>
            <option value="BTC">Bitcoin</option>
          </select>
        </div>

        {/* Network Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="regtest">Regtest</option>
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
          </select>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium mb-2">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="http://localhost:1031"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  )
}
