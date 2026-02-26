'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSessionStore, useWalletStore } from '@/stores'
import { userService, type UserStats } from '@/services/backend'
import { truncatePublicKey } from '@/lib'

export default function ProfilePage() {
  const { userName, setUser } = useSessionStore()
  const { isConnected, publicKey } = useWalletStore()
  const [name, setName] = useState(userName || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (!publicKey) return
    userService.getStats(publicKey).then(setStats).catch(() => {})
  }, [publicKey])

  useEffect(() => {
    setName(userName || '')
  }, [userName])

  const handleSave = async () => {
    if (!name.trim() || !publicKey) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await userService.update(publicKey, { name: name.trim() })
      setUser(publicKey, updated.name || name.trim())
      setMessage('Profile updated successfully!')
    } catch (err) {
      setMessage(`Failed to update: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (!isConnected || !publicKey) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Connect Wallet</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Connect your wallet to view your profile
          </p>
          <Link
            href="/wallet"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Edit your display name and view stats</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-6">
          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Public Key
            </label>
            <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 font-mono text-sm text-gray-700 dark:text-gray-300">
              {truncatePublicKey(publicKey, 12, 8)}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim() || name.trim() === userName}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {message && (
              <p className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              {stats.role === 'STUDENT' ? (
                <>
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes Attempted</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.correctAttempts || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{((stats.successRate || 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Rewards</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRewards || 0} sat</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeQuizzes || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEarnings || 0} sat</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
