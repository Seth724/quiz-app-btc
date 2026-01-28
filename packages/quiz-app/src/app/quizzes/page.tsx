"use client";

export default function QuizzesPage() {
  return (
    <>
      <h1 className="text-4xl font-bold dark:text-white mb-8">All Quizzes</h1>
      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Quiz Browser</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Browse all available quizzes on the platform.
          </p>
          <div className="text-center py-8">
            <p className="text-gray-500">No quizzes available yet.</p>
            <p className="text-sm text-gray-400 mt-2">Teachers can create quizzes to get started.</p>
          </div>
        </div>
      </div>
    </>
  );
}