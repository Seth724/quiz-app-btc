/**
 * Wallet Display Component - Shows wallet balance and info
 */

'use client'

import { useState } from 'react'
import { useWalletStore } from '@/stores'
import { useWalletInfo } from '../hooks/useWalletInfo'
import { truncatePublicKey } from '@/lib'
import { formatSatoshis } from '@/services'
import { fundWallet } from '../wallet.service'
import { useComputer } from '@/hooks'

export function WalletDisplay() {
  const { publicKey, address, chain, network, disconnect } = useWalletStore()
  const { walletInfo, loading, refresh } = useWalletInfo()
  const computer = useComputer()
  const [funding, setFunding] = useState(false)

  const handleFund = async () => {
    if (!computer) return
    try {
      setFunding(true)
      await fundWallet(computer)
      await refresh()
    } catch (error) {
      console.error('Failed to fund wallet:', error)
    } finally {
      setFunding(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow p-6">
      {/* Balance */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Balance</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
            {walletInfo ? formatSatoshis(walletInfo.balance) : '0'} {chain}
          </p>
          <button
            onClick={refresh}
            className="p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded"
            title="Refresh balance"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 uppercase mt-1">
          {network}
        </p>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
        <p className="text-sm font-mono break-all">{address}</p>
      </div>

      {/* Public Key */}
      <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Public Key</p>
        <p className="text-sm font-mono break-all">
          {publicKey && truncatePublicKey(publicKey)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {network === 'regtest' && (
          <button
            onClick={handleFund}
            disabled={funding}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {funding ? 'Funding...' : 'Fund Wallet'}
          </button>
        )}
        <button
          onClick={disconnect}
          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}
