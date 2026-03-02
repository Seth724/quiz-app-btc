/**
 * Login Modal — prompts user for email/password to authenticate.
 * Calls the NestJS auth endpoint to login and get JWT tokens.
 */

'use client'

import { useState } from 'react'
import { authService } from '@/services/backend'
import { useSessionStore } from '@/stores'
import { useWalletStore } from '@/stores'

interface LoginModalProps {
  onClose: () => void
  onSwitchToSignup?: () => void
  required?: boolean
}

export function LoginModal({ onClose, onSwitchToSignup, required = false }: LoginModalProps) {
  const { setUser, setRole } = useSessionStore()
  const { publicKey: walletPublicKey } = useWalletStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login({
        email: email.trim(),
        password,
      })
      setRole(res.user.role === 'TEACHER' ? 'teacher' : 'student')
      setUser(res.user.id, res.user.name)

      // Auto-sync wallet to API if already connected in browser
      if (walletPublicKey && !res.user.publicKey) {
        try {
          const mnemonic = typeof window !== 'undefined' ? localStorage.getItem('BIP_39_KEY') : null
          await authService.connectWallet({
            publicKey: walletPublicKey,
            mnemonic: mnemonic || undefined,
          })
          console.log('✅ Wallet auto-synced to API on login')
        } catch (err) {
          console.warn('⚠️ Wallet auto-sync failed on login:', err)
        }
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {onSwitchToSignup && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Sign Up
              </button>
            </p>
          )}

          {!required && (
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
