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

      const quiz = await createQuiz(teacherClient, formData)
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter quiz description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Entry Fee (satoshis)
              </label>
              <input
                type="number"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reward Amount (satoshis)
              </label>
              <input
                type="number"
                value={formData.rewardAmount}
                onChange={(e) => setFormData({ ...formData, rewardAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                min="0"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question - Only ONE */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Question</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Each quiz contains exactly ONE question with 4 options. The first student to answer correctly wins the full reward!
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question Text</label>
            <input
              type="text"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter your question"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Options (Select the correct answer)</label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  )
}
