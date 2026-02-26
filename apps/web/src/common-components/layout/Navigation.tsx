/**
 * Layout Navigation Component — Professional Design
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWalletStore, useSessionStore } from '@/stores'
import { truncatePublicKey } from '@/lib'

export function Navigation() {
  const pathname = usePathname()
  const { isConnected, publicKey } = useWalletStore()
  const { role, userName } = useSessionStore()

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠', show: true },
    { href: '/teacher', label: 'Teacher', icon: '👨‍🏫', show: role === 'teacher' || !role },
    { href: '/student', label: 'Student', icon: '🎓', show: role === 'student' || !role },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', show: true },
    { href: '/gallery', label: 'Gallery', icon: '🖼️', show: true },
    { href: '/wallet', label: 'Wallet', icon: '💳', show: true },
    { href: '/profile', label: 'Profile', icon: '👤', show: isConnected },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0c0a1d]/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QuizChain
              </span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-1">
              {navLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            {isConnected && publicKey ? (
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 dark:border-emerald-700/50 hover:border-emerald-300 dark:hover:border-emerald-600/50 transition-all">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                {userName ? (
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{userName}</span>
                ) : (
                  <span className="text-sm font-mono text-emerald-700 dark:text-emerald-300">
                    {truncatePublicKey(publicKey, 6, 4)}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/wallet"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.filter(link => link.show).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
