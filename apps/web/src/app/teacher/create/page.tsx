'use client'

import Link from 'next/link'
import { QuizForm } from '@/features/quizzes'

export default function CreateQuizPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Create Quiz</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create a new quiz for students
          </p>
        </div>

        <QuizForm />
      </div>
    </div>
  )
}
