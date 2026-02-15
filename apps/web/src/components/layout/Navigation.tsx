/**
 * Layout Navigation Component
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWalletStore, useSessionStore } from '@/stores'
import { truncatePublicKey } from '@/lib'

export function Navigation() {
  const pathname = usePathname()
  const { isConnected, publicKey } = useWalletStore()
  const { role } = useSessionStore()

  const navLinks = [
    { href: '/', label: 'Home', show: true },
    { href: '/teacher', label: 'Teacher', show: role === 'teacher' || !role },
    { href: '/student', label: 'Student', show: role === 'student' || !role },
    { href: '/leaderboard', label: 'Leaderboard', show: true },
    { href: '/wallet', label: 'Wallet', show: true },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                QuizApp
              </span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              {navLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === link.href
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            {isConnected && publicKey ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 dark:bg-green-900">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-mono">
                  {truncatePublicKey(publicKey, 6, 4)}
                </span>
              </div>
            ) : (
              <Link
                href="/wallet"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.filter(link => link.show).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                pathname === link.href
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600'
                  : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
