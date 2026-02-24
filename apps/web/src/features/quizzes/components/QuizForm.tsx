/**
 * Quiz Form Component - Create a quiz with ONE question
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTeacherClient } from '@/hooks'
import { createQuiz, type CreateQuizParams } from '../quizzes.service'

export function QuizForm() {
  const router = useRouter()
  const teacherClient = useTeacherClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateQuizParams>({
    title: '',
    description: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    rewardAmount: 10000,
    entryFee: 1000,
  })

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      // Validate
      if (!formData.title.trim()) throw new Error('Title is required')
      if (formData.description && !formData.description.trim()) throw new Error('Description cannot be empty')
      if (!formData.questionText.trim()) throw new Error('Question is required')
      if (formData.options.some(o => !o.trim())) throw new Error('All 4 options must be filled')
      if (formData.rewardAmount < 547) throw new Error('Reward amount must be at least 547 satoshis (minimum non-dust value)')
      if (formData.entryFee < 0) throw new Error('Entry fee cannot be negative')

      const quiz = await createQuiz(teacherClient, formData)
      console.log("❤️ quiz created in QuizForm.tsx:", quiz)
      router.push(`/teacher/quizzes/${quiz._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Basic Info */}
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
            <span className="text-lg">📋</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Details</h2>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none"
              placeholder="Enter quiz description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entry Fee (satoshis)
              </label>
              <input
                type="number"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white"
                min="0"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">Set to 0 for free quizzes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reward Amount (satoshis)
              </label>
              <input
                type="number"
                value={formData.rewardAmount}
                onChange={(e) => setFormData({ ...formData, rewardAmount: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white"
                min="547"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">Minimum 547 satoshis (non-dust)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
            <span className="text-lg">❓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Question</h2>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 ml-[52px]">
          Each quiz has exactly one question with 4 options. First correct answer wins!
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Text</label>
            <input
              type="text"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Enter your question"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Options <span className="text-gray-400 font-normal">(select the correct answer)</span>
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <label key={index} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.correctAnswer === index
                    ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500/20"
                  />
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border-0 bg-transparent focus:ring-0 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    required
                  />
                  {formData.correctAnswer === index && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                      ✓ Correct
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <span className="text-sm">⚠️</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:hover:translate-y-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Creating...
            </span>
          ) : (
            'Create Quiz'
          )}
        </button>
      </div>
    </form>
  )
}
