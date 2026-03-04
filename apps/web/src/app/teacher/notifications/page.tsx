/**
 * Teacher Notifications - Access Requests
 * Shows real student access requests and allows teacher to approve them
 * by minting QuizAccess tokens and creating QuizAccessSale offers.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useWalletStore, useSessionStore } from '@/stores'
import { useAccessClient } from '@/hooks'
import {
  getAccessRequests,
  approveAccessRequest,
  type AccessRequestData,
} from '@/features/access/access.service'

export default function TeacherNotificationsPage() {
  const accessClient = useAccessClient()
  const { publicKey, isConnected } = useWalletStore()
  const { setRole } = useSessionStore()

  const [notifications, setNotifications] = useState<AccessRequestData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const  fetchNotifications = useCallback(async () => {
    if (!publicKey) return
    try {
      setLoading(true)
      const requests = await getAccessRequests({ teacherPublicKey: publicKey })
      setNotifications(requests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  useEffect(() => {
    setRole('teacher')
    fetchNotifications()

    // Poll every 10 seconds for new requests
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [setRole, fetchNotifications])

  const handleApprove = async (notification: AccessRequestData) => {
    try {
      setApprovingId(notification.id)
      setError(null)

      if (!accessClient) {
        throw new Error('Access client not connected')
      }

      console.log('🔐 [Teacher] Approving access request:', notification.id)
      console.log('🔐 [Teacher] Quiz:', notification.quizId, 'Student:', notification.studentPublicKey)

      // Step 1: Mint QuizAccess token + create offer tx
      const result = await accessClient.mintAndCreateOffer(
        notification.quizId,
        BigInt(notification.entryFee)
      )

      console.log('✅ [Teacher] Offer created:', result)

      // Step 2: Store offer tx hex in the relay API
      await approveAccessRequest(
        notification.id,
        result.offerTxHex,
        result.accessTokenId
      )

      console.log('✅ [Teacher] Access request approved and offer stored')

      // Refresh notifications
      await fetchNotifications()
    } catch (err) {
      console.error('❌ [Teacher] Failed to approve:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve access request')
    } finally {
      setApprovingId(null)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please connect your wallet to view notifications
          </p>
          <Link
            href="/wallet"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">🔔 Access Request Notifications</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Approve student requests to access your quizzes via atomic swap
              </p>
            </div>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-2xl mb-4">📭</p>
            <h2 className="text-xl font-bold mb-2">No Access Requests</h2>
            <p className="text-gray-600 dark:text-gray-300">
              When students request access to your quizzes, you&apos;ll see notifications here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {notification.status === 'pending' && '⏳'}
                        {notification.status === 'approved' && '✅'}
                        {notification.status === 'completed' && '✓'}
                        {notification.status === 'rejected' && '❌'}
                      </span>
                      <h3 className="text-lg font-bold">
                        {notification.quizTitle || `Quiz ${notification.quizId.slice(0, 8)}...`}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        notification.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : notification.status === 'approved'
                          ? 'bg-blue-100 text-blue-700'
                          : notification.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {notification.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 ml-10">
                      <p>
                        <span className="font-medium">Student:</span>{' '}
                        {notification.studentPublicKey.slice(0, 16)}...
                      </p>
                      <p>
                        <span className="font-medium">Entry Fee:</span>{' '}
                        {Number(notification.entryFee).toLocaleString()} sats
                      </p>
                      <p>
                        <span className="font-medium">Requested:</span>{' '}
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {notification.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(notification)}
                        disabled={approvingId === notification.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition disabled:opacity-50"
                      >
                        {approvingId === notification.id
                          ? '⏳ Minting & Creating Offer...'
                          : '✅ Approve & Create Offer'}
                      </button>
                    )}
                    {notification.status === 'approved' && (
                      <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md text-center text-sm">
                        ⏳ Waiting for student to finalize payment...
                      </div>
                    )}
                    {notification.status === 'completed' && (
                      <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-center text-sm">
                        ✓ Complete! Student has access, you received the entry fee.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📋 How Access Requests Work</h2>
          <ol className="space-y-3 text-gray-700 dark:text-gray-200">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</span>
              <div>
                <p className="font-medium">Student Requests Access</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student clicks &quot;Request Access&quot; on your quiz</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</span>
              <div>
                <p className="font-medium">You Approve &amp; Mint</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click &quot;Approve&quot; → mints a QuizAccess token and creates an atomic swap offer</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-medium">Student Finalizes Payment</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student sees approval, creates real Payment, signs and broadcasts</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</span>
              <div>
                <p className="font-medium">Atomic Swap Complete</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student gets QuizAccess token, you receive the entry fee Payment</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
