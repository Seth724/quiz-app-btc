/**
 * Result Panel Component - Show quiz result (correct/incorrect + reward)
 */

'use client'

import { formatSatoshis } from '@/services'
import type { Attempt } from '../attempts.service'
import type { Quiz } from '@/features/quizzes'

interface ResultPanelProps {
  attempt: Attempt
  quiz: Quiz
  onWithdraw?: () => void
}

// Safely convert blockchain BigInt/string values to a number for display
function safeBigIntToNumber(val: unknown): number {
  if (typeof val === 'bigint') return Number(val)
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val.replace(/n$/, '')) || 0
  return 0
}

export function ResultPanel({ attempt, quiz, onWithdraw }: ResultPanelProps) {
  const isCorrect = attempt.isCorrect === true
  const rewardNum = safeBigIntToNumber(attempt.rewardEarned)
  const hasReward = rewardNum > 0
  const validAnswer = typeof attempt.selectedAnswer === 'number' && attempt.selectedAnswer >= 0 && attempt.selectedAnswer < quiz.options.length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Result Display */}
      <div className={`bg-gradient-to-br rounded-lg shadow-lg p-8 mb-6 text-center ${
        isCorrect 
          ? 'from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900'
          : 'from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900'
      }`}>
        <div className="text-6xl mb-4">
          {isCorrect ? '🎉' : '😔'}
        </div>
        
        <h2 className="text-3xl font-bold mb-4">
          {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
        </h2>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          {isCorrect 
            ? 'Congratulations! You answered correctly! The teacher will process your reward shortly.'
            : 'Sorry, that was not the correct answer. Better luck next time!'}
        </p>

        {/* Reward Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 inline-block">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {hasReward ? 'Your Reward' : 'Reward Earned'}
          </p>
          <p className={`text-4xl font-bold ${
            hasReward 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-400 dark:text-gray-600'
          }`}>
            {formatSatoshis(rewardNum)} LTC
          </p>
        </div>

        {/* Withdraw Button */}
        {hasReward && onWithdraw && (
          <div className="mt-6">
            <button
              onClick={onWithdraw}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-all"
            >
              Withdraw Reward
            </button>
          </div>
        )}
      </div>

      {/* Question Review */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Question Review</h3>
        
        <div className={`border-l-4 rounded p-4 ${
          isCorrect
            ? 'border-green-500 bg-green-50 dark:bg-green-900'
            : 'border-red-500 bg-red-50 dark:bg-red-900'
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {isCorrect ? '✓' : '✗'}
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-3">
                {quiz.questionText}
              </p>
              
              <div className="space-y-2">
                <div className={`p-2 rounded ${
                  validAnswer && attempt.selectedAnswer === quiz.correctAnswer
                    ? 'bg-green-200 dark:bg-green-800'
                    : 'bg-red-200 dark:bg-red-800'
                }`}>
                  <span className="font-medium">Your answer:</span>{' '}
                  {validAnswer ? quiz.options[attempt.selectedAnswer] : 'Not answered'}
                </div>
                
                {!isCorrect && (
                  <div className="p-2 rounded bg-blue-200 dark:bg-blue-800">
                    <span className="font-medium">Correct answer:</span>{' '}
                    {quiz.options[quiz.correctAnswer]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attempt Details */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-3">Attempt Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Quiz Title</p>
            <p className="font-semibold">{quiz.title}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Status</p>
            <p className={`font-semibold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Reward Pool</p>
            <p className="font-semibold">{formatSatoshis(safeBigIntToNumber(quiz.rewardAmount))} LTC</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">You Earned</p>
            <p className={`font-semibold ${
              hasReward ? 'text-green-600' : 'text-gray-600'
            }`}>
              {formatSatoshis(rewardNum)} LTC
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
