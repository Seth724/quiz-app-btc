/**
 * @deprecated - Replaced by inline request/finalize flow in student quiz detail page.
 * The proper flow uses QuizAccessSale atomic swap:
 *   1. Student requests access (POST /api/access-requests)
 *   2. Teacher approves & creates offer (mintAndCreateOffer)
 *   3. Student finalizes purchase (finalizeAndBroadcastOffer)
 * See: apps/web/src/app/student/quizzes/[id]/page.tsx
 */

'use client'

import type { Quiz } from '@/features/quizzes'

interface BuyAccessModalProps {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BuyAccessModal({ isOpen }: BuyAccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <p className="text-red-600 font-bold">
          This modal is deprecated. Access purchase now uses the QuizAccessSale atomic swap flow
          built into the quiz detail page.
        </p>
      </div>
    </div>
  )
}
