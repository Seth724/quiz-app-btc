'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { hasAccess, getAccessTokenId, requestAccess, getAccessRequests, completeAccessRequest, type AccessRequestData } from '@/features/access'
import { useAccessClient, useAttemptClient } from '@/hooks'
import { useWalletStore } from '@/stores'
import { formatSatoshis } from '@/services'

type FlowState =
  | 'loading'
  | 'already-attempted' // Student already attempted this quiz
  | 'has-access'       // Already owns a valid QuizAccess token
  | 'no-request'       // No pending request — show "Request Access" button
  | 'pending'          // Request sent, waiting for teacher approval
  | 'approved'         // Teacher approved — show "Finalize Purchase" button
  | 'finalizing'       // Broadcasting atomic swap
  | 'completed'        // Access granted after atomic swap

export default function QuizDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = decodeURIComponent(params?.id as string)
  const { quiz, loading } = useQuiz(quizId)
  const accessClient = useAccessClient()
  const attemptClient = useAttemptClient()
  const { publicKey } = useWalletStore()

  const [flowState, setFlowState] = useState<FlowState>('loading')
  const [accessRequest, setAccessRequest] = useState<AccessRequestData | null>(null)
  const [accessTokenId, setAccessTokenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  // Check current access state
  const checkAccessState = useCallback(async () => {
    if (!quiz || !publicKey) {
      if (!loading) setFlowState('no-request')
      return
    }

    try {
      // 0. Check if student has already attempted this quiz
      const alreadyAttempted = await attemptClient.hasStudentAttemptedQuiz(quizId, publicKey)
      if (alreadyAttempted) {
        setFlowState('already-attempted')
        return
      }

      // 1. Check if student already has on-chain access
      const alreadyHasAccess = await hasAccess(accessClient, publicKey, quizId)
      if (alreadyHasAccess) {
        const tokenId = await getAccessTokenId(accessClient, publicKey, quizId)
        setAccessTokenId(tokenId)
        setFlowState('has-access')
        return
      }

      // 2. Check for pending/approved access requests via API
      const requests = await getAccessRequests({
        quizId,
        studentPublicKey: publicKey,
      })

      const pending = requests.find(r => r.status === 'pending')
      const approved = requests.find(r => r.status === 'approved')

      if (approved) {
        setAccessRequest(approved)
        setFlowState('approved')
      } else if (pending) {
        setAccessRequest(pending)
        setFlowState('pending')
      } else {
        setFlowState('no-request')
      }
    } catch (err) {
      console.error('Failed to check access state:', err)
      setFlowState('no-request')
    }
  }, [quiz, publicKey, quizId, accessClient, attemptClient, loading])

  useEffect(() => {
    checkAccessState()
  }, [checkAccessState])

  // Poll for approval when pending
  useEffect(() => {
    if (flowState !== 'pending') return
    const interval = setInterval(async () => {
      try {
        const requests = await getAccessRequests({
          quizId,
          studentPublicKey: publicKey || '',
        })
        const approved = requests.find(r => r.status === 'approved')
        if (approved) {
          setAccessRequest(approved)
          setFlowState('approved')
        }
      } catch {
        // ignore polling errors
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [flowState, quizId, publicKey])

  // ─── Actions ───

  const handleRequestAccess = async () => {
    if (!quiz || !publicKey) return
    try {
      setRequesting(true)
      setError(null)

      const request = await requestAccess({
        quizId: quiz._id,
        quizTitle: quiz.title,
        studentPublicKey: publicKey,
        teacherPublicKey: quiz.teacherPublicKey,
        entryFee: quiz.entryFee.toString(),
      })

      setAccessRequest(request)
      setFlowState('pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request access')
    } finally {
      setRequesting(false)
    }
  }

  const handleFinalizePurchase = async () => {
    if (!accessRequest?.offerTxHex || !quiz) return
    try {
      setFinalizing(true)
      setFlowState('finalizing')
      setError(null)

      console.log('💳 [Student] Finalizing purchase for quiz:', quiz._id)

      const result = await accessClient.finalizeAndBroadcastOffer(
        accessRequest.offerTxHex,
        BigInt(quiz.entryFee)
      )

      console.log('✅ [Student] Finalized! txId:', result.txId, 'accessTokenId:', result.accessTokenId)

      // Mark the request as completed in the relay
      await completeAccessRequest(accessRequest.id, result.txId)

      setAccessTokenId(result.accessTokenId)
      setFlowState('has-access')
    } catch (err) {
      console.error('❌ [Student] Finalize failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to finalize purchase')
      setFlowState('approved') // revert to approved state
    } finally {
      setFinalizing(false)
    }
  }

  const handleStartQuiz = () => {
    if (accessTokenId) {
      router.push(`/student/quizzes/${quizId}/attempt?accessTokenId=${encodeURIComponent(accessTokenId)}`)
    }
  }

  // ─── Render ───

  if (loading || (flowState === 'loading' && !quiz)) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz Not Found</h1>
          <Link href="/student/quizzes" className="text-blue-600 hover:underline">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/student/quizzes" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Quizzes
          </Link>
        </div>

        {/* Quiz Header */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
            {quiz.questionText}
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quiz.isActive ? (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm font-medium">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm font-medium">
                Inactive
              </span>
            )}
            {quiz.isClaimed && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full text-sm font-medium">
                Reward Claimed
              </span>
            )}
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium">
              {quiz.attemptCount || 0} Attempt{(quiz.attemptCount || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entry Fee</p>
              <p className="text-2xl font-bold text-blue-600">{formatSatoshis(quiz.entryFee)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reward</p>
              <p className="text-2xl font-bold text-green-600">{formatSatoshis(quiz.rewardAmount)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Options</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
              ❌ {error}
            </div>
          )}

          {/* Action Buttons based on flow state */}
          <div className="flex gap-4">
            {flowState === 'already-attempted' ? (
              <div className="flex-1 py-4 bg-gray-500 text-white rounded-lg font-bold text-lg text-center cursor-not-allowed">
                ✅ Already Attempted — You can only attempt each quiz once
              </div>
            ) : quiz.isClaimed ? (
              <div className="flex-1 py-4 bg-gray-400 text-white rounded-lg font-bold text-lg text-center cursor-not-allowed">
                Reward Already Claimed
              </div>
            ) : !quiz.isActive ? (
              <div className="flex-1 py-4 bg-gray-400 text-white rounded-lg font-bold text-lg text-center cursor-not-allowed">
                Quiz Inactive
              </div>
            ) : flowState === 'has-access' || flowState === 'completed' ? (
              <>
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition"
                >
                  🎯 Start Quiz
                </button>
                <div className="px-6 py-4 bg-green-100 dark:bg-green-900 rounded-lg flex items-center">
                  <span className="text-green-700 dark:text-green-200 font-medium">
                    ✓ Access Granted
                  </span>
                </div>
              </>
            ) : flowState === 'no-request' ? (
              <button
                onClick={handleRequestAccess}
                disabled={requesting || !publicKey}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition disabled:opacity-50"
              >
                {requesting
                  ? '⏳ Sending Request...'
                  : !publicKey
                  ? 'Connect Wallet First'
                  : `📝 Request Access (${formatSatoshis(quiz.entryFee)})`}
              </button>
            ) : flowState === 'pending' ? (
              <div className="flex-1 py-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg font-bold text-lg text-center">
                ⏳ Access Requested — Waiting for teacher approval...
                <p className="text-sm font-normal mt-1">
                  The teacher will mint an access token and create a sale offer for you.
                </p>
              </div>
            ) : flowState === 'approved' ? (
              <button
                onClick={handleFinalizePurchase}
                disabled={finalizing}
                className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition disabled:opacity-50"
              >
                {finalizing
                  ? '⏳ Finalizing Atomic Swap...'
                  : `💳 Finalize Purchase (${formatSatoshis(quiz.entryFee)})`}
              </button>
            ) : flowState === 'finalizing' ? (
              <div className="flex-1 py-4 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg font-bold text-lg text-center">
                ⏳ Broadcasting atomic swap transaction...
              </div>
            ) : null}
          </div>
        </div>

        {/* Quiz Info details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Quiz Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                Q
              </div>
              <div className="flex-1">
                <p className="font-medium">1 Question · Multiple Choice (4 options)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Winner takes all — first correct answer claims the reward</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                💰
              </div>
              <div className="flex-1">
                <p className="font-medium">Reward: {formatSatoshis(quiz.rewardAmount)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entry Fee: {formatSatoshis(quiz.entryFee)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Flow Info */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🔐 How Access Works</h2>
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className={`font-bold ${flowState === 'no-request' ? 'text-blue-600' : 'text-gray-400'}`}>1.</span>
              <span className={flowState === 'no-request' ? 'font-medium' : ''}>
                Click &quot;Request Access&quot; to notify the teacher
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`font-bold ${flowState === 'pending' ? 'text-blue-600' : 'text-gray-400'}`}>2.</span>
              <span className={flowState === 'pending' ? 'font-medium' : ''}>
                Teacher approves &amp; creates a QuizAccessSale offer (atomic swap)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`font-bold ${flowState === 'approved' ? 'text-blue-600' : 'text-gray-400'}`}>3.</span>
              <span className={flowState === 'approved' ? 'font-medium' : ''}>
                Click &quot;Finalize Purchase&quot; to complete the payment and receive your access token
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`font-bold ${flowState === 'has-access' ? 'text-blue-600' : 'text-gray-400'}`}>4.</span>
              <span className={flowState === 'has-access' ? 'font-medium' : ''}>
                Start the quiz! Your access token will be consumed when you submit your answer.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
