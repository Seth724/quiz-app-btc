'use client'

import Link from 'next/link'
import { useWallet } from '@/hooks'
import { WalletConnect, WalletDisplay } from '@/features/wallet'

export default function WalletPage() {
  const { isConnected } = useWallet()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your blockchain wallet connection
          </p>
        </div>

        {isConnected ? (
          <WalletDisplay />
        ) : (
          <WalletConnect redirectTo="/" />
        )}
      </div>
    </div>
  )
}
