# app\gallery\page.tsx

```tsx
/**
 * Gallery page to display all smart contract objects
 * Uses the common Gallery component
 */

'use client'

import { Gallery } from '@/common-components'

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Smart Contract Objects Gallery</h1>
      <Gallery.WithPagination />
    </div>
  )
}
```

# app\globals.css

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

```

# app\layout.tsx

```tsx
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Navigation } from "@/components/layout";
import "./globals.css";

// Font configurations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Quiz App - Blockchain Learning Platform",
  description: "Learn and earn through blockchain-powered quizzes. Create quizzes as a teacher or take quizzes as a student.",
  keywords: "quiz, blockchain, learning, education, bitcoin, rewards",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

```

# app\leaderboard\page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSessionStore } from '@/stores'
import { LeaderboardTable, getGlobalLeaderboard, type LeaderboardEntry } from '@/features/leaderboard'

export default function LeaderboardPage() {
  const { userId } = useSessionStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const data = await getGlobalLeaderboard()
        setLeaderboard(data)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">🏆 Leaderboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Top performers and their achievements
          </p>
        </div>

        <LeaderboardTable 
          entries={leaderboard} 
          currentStudentId={userId || undefined}
          loading={loading}
        />
      </div>
    </div>
  )
}

```

# app\objects\[rev]\page.tsx

```tsx
/**
 * Dynamic route for displaying smart contract objects
 * Uses the common SmartObject component
 */

'use client'

import { SmartObject } from '@/common-components'

export default function ObjectPage({ params }: { params: { rev: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <SmartObject.Component title={`Object: ${decodeURIComponent(params.rev)}`} />
    </div>
  )
}
```

# app\page.tsx

```tsx
'use client'

import Link from 'next/link'
import { useWallet } from '@/hooks'
import { truncatePublicKey } from '@/lib'

export default function HomePage() {
  const { isConnected, publicKey } = useWallet()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Quiz App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Blockchain-powered learning platform
          </p>
        </div>

        {/* Wallet Status */}
        {isConnected && publicKey && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Connected as
            </p>
            <p className="text-lg font-mono font-semibold">
              {truncatePublicKey(publicKey)}
            </p>
          </div>
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <Link
            href="/teacher"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold mb-3">Teacher</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create quizzes, manage rewards, and track student progress
            </p>
          </Link>

          {/* Student Card */}
          <Link
            href="/student"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 text-center border-2 border-transparent hover:border-green-500"
          >
            <div className="text-5xl mb-4">👨‍🎓</div>
            <h2 className="text-2xl font-bold mb-3">Student</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Browse quizzes, earn rewards, and climb the leaderboard
            </p>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="text-center space-x-4 pt-8">
          <Link
            href="/leaderboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Leaderboard
          </Link>
          <span className="text-gray-400">·</span>
          <Link
            href="/wallet"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Wallet Setup
          </Link>
        </div>
      </div>
    </div>
  )
}

```

# app\providers.tsx

```tsx
'use client'

import { ReactNode } from 'react'
import { ClientProviders } from '@/common-components/ClientProvider'

/**
 * Client-side providers wrapper
 * Add any context providers, state managers, etc. here
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  )
}

```

# app\student\page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSessionStore, useWalletStore } from '@/stores'
import { getAllQuizzes, type Quiz } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'

export default function StudentPage() {
  const { userId, setRole } = useSessionStore()
  const { isConnected } = useWalletStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setRole('student')
  }, [setRole])

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const data = await getAllQuizzes(10)
        setQuizzes(data as Quiz[])
      } catch (error) {
        console.error('Failed to fetch quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please connect your wallet to access the student dashboard
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Browse quizzes and earn rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Quizzes Available</h3>
            <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Quizzes Taken</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Rewards</h3>
            <p className="text-3xl font-bold text-purple-600">- sats</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Quizzes</h2>
            <Link
              href="/student/quizzes"
              className="text-blue-600 hover:underline"
            >
              View All →
            </Link>
          </div>
          
          <QuizGrid 
            quizzes={quizzes.slice(0, 6)} 
            viewMode="student"
            loading={loading}
            emptyMessage="No quizzes available. Check back later!"
          />
        </div>
      </div>
    </div>
  )
}

```

# app\student\quizzes\[id]\attempt\page.tsx

```tsx
'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { AttemptForm } from '@/features/attempts'

export default function AttemptQuizPage() {
  const params = useParams()
  const quizId = params?.id as string
  const { quiz, loading } = useQuiz(quizId)

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Good luck! Take your time and read each question carefully.
          </p>
        </div>

        <AttemptForm quiz={quiz} />
      </div>
    </div>
  )
}

```

# app\student\quizzes\[id]\page.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { BuyAccessModal } from '@/features/access'
import { hasAccess } from '@/features/access'
import { useAccessClient } from '@/hooks'
import { useSessionStore } from '@/stores'
import { formatSatoshis } from '@/services'

export default function QuizDetailPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.id as string
  const { quiz, loading } = useQuiz(quizId)
  const accessClient = useAccessClient()
  const { userId } = useSessionStore()
  
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [hasAccessToQuiz, setHasAccessToQuiz] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    const checkQuizAccess = async () => {
      if (quiz && userId) {
        try {
          const access = await hasAccess(accessClient, userId, quizId)
          setHasAccessToQuiz(access)
        } catch (error) {
          console.error('Failed to check access:', error)
        } finally {
          setCheckingAccess(false)
        }
      }
    }

    checkQuizAccess()
  }, [quiz, userId, quizId, accessClient])

  const handleStartQuiz = () => {
    if (hasAccessToQuiz) {
      router.push(`/student/quizzes/${quizId}/attempt`)
    } else {
      setShowBuyModal(true)
    }
  }

  const handlePurchaseSuccess = () => {
    setHasAccessToQuiz(true)
    router.push(`/student/quizzes/${quizId}/attempt`)
  }

  if (loading || checkingAccess) {
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
            {quiz.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Questions</p>
              <p className="text-2xl font-bold">{quiz.questions.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
              <p className="text-2xl font-bold text-blue-600">{formatSatoshis(quiz.price)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reward/Q</p>
              <p className="text-2xl font-bold text-green-600">{formatSatoshis(quiz.rewardPerQuestion)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Max Reward</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatSatoshis(quiz.rewardPerQuestion * quiz.questions.length)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {hasAccessToQuiz ? (
              <>
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition"
                >
                  Start Quiz
                </button>
                <div className="px-6 py-4 bg-green-100 dark:bg-green-900 rounded-lg flex items-center">
                  <span className="text-green-700 dark:text-green-200 font-medium">
                    ✓ Access Granted
                  </span>
                </div>
              </>
            ) : (
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition"
              >
                Purchase Access & Start Quiz
              </button>
            )}
          </div>
        </div>

        {/* Questions Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Quiz Preview</h2>
          <div className="space-y-4">
            {quiz.questions.map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">Question {index + 1}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Multiple choice</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buy Access Modal */}
        {quiz && (
          <BuyAccessModal
            quiz={quiz}
            isOpen={showBuyModal}
            onClose={() => setShowBuyModal(false)}
            onSuccess={handlePurchaseSuccess}
          />
        )}
      </div>
    </div>
  )
}

```

# app\student\quizzes\[id]\result\page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuiz } from '@/features/quizzes'
import { useAttemptClient } from '@/hooks'
import { getAttempt, type Attempt } from '@/features/attempts'
import { ResultPanel } from '@/features/attempts'

export default function QuizResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params?.id as string
  const attemptId = searchParams?.get('attemptId')
  
  const { quiz, loading: quizLoading } = useQuiz(quizId)
  const attemptClient = useAttemptClient()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttempt = async () => {
      if (attemptId) {
        try {
          setLoading(true)
          const data = await getAttempt(attemptClient, attemptId)
          setAttempt(data)
        } catch (error) {
          console.error('Failed to fetch attempt:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAttempt()
  }, [attemptId, attemptClient])

  if (loading || quizLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Result Not Found</h1>
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
          <Link href="/student" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Quiz Results: {quiz.title}</h1>
        </div>

        <ResultPanel attempt={attempt} quiz={quiz} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/student/quizzes"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Browse More Quizzes
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}

```

# app\student\quizzes\page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllQuizzes, type Quiz } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const data = await getAllQuizzes()
        setQuizzes(data as Quiz[])
      } catch (error) {
        console.error('Failed to fetch quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/student" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Browse Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Explore all available quizzes and start learning
          </p>
        </div>

        <QuizGrid 
          quizzes={quizzes} 
          viewMode="student"
          loading={loading}
          emptyMessage="No quizzes available at the moment"
        />
      </div>
    </div>
  )
}

```

# app\teacher\create\page.tsx

```tsx
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

```

# app\teacher\page.tsx

```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSessionStore, useWalletStore } from '@/stores'
import { useTeacherQuizzes } from '@/features/quizzes'
import { QuizGrid } from '@/features/quizzes'

export default function TeacherPage() {
  const { userId, setRole } = useSessionStore()
  const { isConnected } = useWalletStore()
  const { quizzes, loading } = useTeacherQuizzes(userId || '')

  useEffect(() => {
    setRole('teacher')
  }, [setRole])

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please connect your wallet to access the teacher dashboard
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your quizzes and track student progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Quizzes</h3>
            <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Active Quizzes</h3>
            <p className="text-3xl font-bold text-green-600">{quizzes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Attempts</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Quizzes</h2>
            <Link
              href="/teacher/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Quiz
            </Link>
          </div>
          
          <QuizGrid 
            quizzes={quizzes} 
            viewMode="teacher"
            loading={loading}
            emptyMessage="No quizzes yet. Create your first quiz to get started!"
          />
        </div>
      </div>
    </div>
  )
}

```

# app\teacher\quizzes\[id]\page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getQuiz, type Quiz } from '@/features/quizzes'
import { useQuizClient } from '@/hooks/useClients'
import { Card, Loader } from '@/components'

export default function TeacherQuizDetailPage() {
  const params = useParams<{ id: string }>()
  const quizId = params?.id as string
  const quizClient = useQuizClient()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Validate quiz ID format
  const isValidQuizId = (id: string) => {
    if (!id) return false
    // Check for transaction ID format (64 hex chars : number)
    const txPattern = /^[0-9a-f]{64}:\d+$/i
    return txPattern.test(id)
  }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!quizClient) {
          setError('Quiz client not available')
          return
        }

        if (!quizId) {
          setError('Quiz ID missing')
          return
        }

        if (!isValidQuizId(quizId)) {
          setError(`Invalid quiz ID format: ${quizId}. Expected format: 64hex:number`)
          return
        }

        const quizData = await getQuiz(quizClient, quizId)
        if (quizData) {
          setQuiz(quizData)
        } else {
          setError('Quiz not found')
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz details')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, quizClient])

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/teacher" className="text-blue-600 hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Quiz not found</p>
              <Link href="/teacher" className="text-blue-600 hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/teacher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Quiz Details
          </p>
        </div>

        <div className="grid gap-8">
          {/* Quiz Details */}
          <Card>
            <h2 className="text-2xl font-semibold mb-6">Quiz Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <p className="text-lg">{quiz.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question
                </label>
                <p className="text-lg">{quiz.questionText}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Options
                </label>
                <div className="space-y-2">
                  {quiz.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index === quiz.correctAnswer 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      {index === quiz.correctAnswer && (
                        <span className="ml-2 text-green-600 font-semibold">(Correct Answer)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entry Fee
                  </label>
                  <p className="text-lg">{Number(quiz.entryFee)} satoshis</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reward Amount
                  </label>
                  <p className="text-lg">{Number(quiz.rewardAmount)} satoshis</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <p className={`text-lg font-semibold ${quiz.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Attempts
                  </label>
                  <p className="text-lg">{quiz.attemptCount}</p>
                </div>
              </div>
              
              {quiz.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Created
                  </label>
                  <p className="text-lg">{new Date(quiz.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="text-2xl font-semibold mb-6">Actions</h2>
            <div className="flex gap-4">
              <Link 
                href="/teacher/create"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another Quiz
              </Link>
              
              <button 
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => window.location.reload()}
              >
                Refresh Details
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

# app\transactions\[txn]\page.tsx

```tsx
/**
 * Dynamic route for displaying blockchain transactions
 * Uses the common Transaction component
 */

'use client'

import { Transaction } from '@/common-components'

export default function TransactionPage({ params }: { params: { txn: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Transaction.Component />
    </div>
  )
}
```

# app\wallet\page.tsx

```tsx
'use client'

import Link from 'next/link'
import { useWallet } from '@/hooks'
import { WalletConnect, WalletDisplay } from '@/features/wallet'
import { Wallet } from '@/common-components'
import { useComputer } from '@/hooks'

export default function WalletPage() {
  const { isConnected } = useWallet()
  const computer = useComputer()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your blockchain wallet connection
          </p>
        </div>

        {isConnected ? (
          <>
            <WalletDisplay />
            <div className="mt-8">
              <Wallet modSpecs={[
                process.env.NEXT_PUBLIC_TEACHER_MOD || '',
                process.env.NEXT_PUBLIC_STUDENT_MOD || '',
                process.env.NEXT_PUBLIC_QUIZ_MOD || '',
                process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD || '',
                process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
                process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
                process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || ''
              ].filter(spec => spec !== '')} />
            </div>
          </>
        ) : (
          <WalletConnect redirectTo="/" />
        )}
      </div>
    </div>
  )
}

```

# common-components\Auth.tsx

```tsx
import { Dispatch, RefObject, useEffect, useRef, useState } from "react";
import { Computer } from "@bitcoin-computer/lib";
import { initFlowbite } from "flowbite";
import { HiRefresh } from "react-icons/hi";
import { useUtilsComponents } from "./UtilsContext";
import { Modal } from "./Modal";
import type { Chain, Network, ModuleStorageType } from "./common/types";
export type TBCChain = "LTC" | "BTC" | "PEPE" | "DOGE";
export type TBCNetwork = "testnet" | "mainnet" | "regtest";
export type AddressType = "p2pkh" | "p2wpkh" | "p2tr";

export type ComputerOptions = Partial<{
  chain: TBCChain;
  mnemonic: string;
  network: TBCNetwork;
  passphrase: string;
  path: string;
  url: string;
  satPerByte: number;
  addressType: AddressType;
  moduleStorageType: ModuleStorageType;
  thresholdBytes: number;
  mode: "dev" | "prod";
}>;

function isLoggedIn(): boolean {
  return !!localStorage.getItem("BIP_39_KEY");
}

function logout() {
  localStorage.removeItem("BIP_39_KEY");
  localStorage.removeItem("CHAIN");
  localStorage.removeItem("NETWORK");
  localStorage.removeItem("PATH");
  localStorage.removeItem("URL");
  window.location.href = "/";
}

function getCoinType(chain: string, network: string): number {
  if (["testnet", "regtest"].includes(network)) return 1;

  if (chain === "BTC") return 0;
  if (chain === "LTC") return 2;
  if (chain === "DOGE") return 3;
  if (chain === "PEPE") return 3434;
  if (chain === "BCH") return 145;

  throw new Error(`Unsupported chain ${chain} or network ${network}`);
}

function getBip44Path({ purpose = 44, coinType = 2, account = 0 } = {}) {
  return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`;
}

function loggedOutConfiguration() {
  return {
    chain: process.env.NEXT_PUBLIC_CHAIN as Chain,
    network: process.env.NEXT_PUBLIC_NETWORK as Network,
    url: process.env.NEXT_PUBLIC_URL,
    moduleStorageType: process.env
      .NEXT_PUBLIC_MODULE_STORAGE_TYPE as ModuleStorageType,
  };
}

function loggedInConfiguration() {
  return {
    mnemonic: localStorage.getItem("BIP_39_KEY"),
    chain: (localStorage.getItem("CHAIN") ||
      process.env.NEXT_PUBLIC_CHAIN) as Chain,
    network: (localStorage.getItem("NETWORK") ||
      process.env.NEXT_PUBLIC_NETWORK) as Network,
    url: localStorage.getItem("URL") || process.env.NEXT_PUBLIC_URL,
    moduleStorageType: process.env
      .NEXT_PUBLIC_MODULE_STORAGE_TYPE as ModuleStorageType,
  };
}

export function getComputer(options: ComputerOptions = {}): Computer {
  const defaultConfiguration = isLoggedIn()
    ? loggedInConfiguration()
    : loggedOutConfiguration();
  return new Computer({ ...defaultConfiguration, ...options });
}

function MnemonicInput({
  mnemonic,
  setMnemonic,
}: {
  mnemonic: string;
  setMnemonic: Dispatch<string>;
}) {
  return (
    <>
      <div className="flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          BIP 39 Mnemonic
        </label>
        <HiRefresh
          onClick={() => setMnemonic(new Computer().getMnemonic())}
          className="w-4 h-4 ml-2 text-sm font-medium text-gray-900 dark:text-white inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
        />
      </div>
      <input
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        required
      />
    </>
  );
}

function ChainInput({
  chain,
  setChain,
}: {
  chain: Chain | undefined;
  setChain: Dispatch<Chain>;
}) {
  return (
    <>
      <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Chain
      </label>
      <fieldset className="flex">
        <legend className="sr-only">Chain</legend>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("LTC")}
            checked={chain === "LTC"}
            id="chain-ltc"
            type="radio"
            name="chain"
            value="LTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-ltc"
            className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            LTC
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("BTC")}
            checked={chain === "BTC"}
            id="chain-btc"
            type="radio"
            name="chain"
            value="BTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-btc"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            BTC
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("PEPE")}
            id="chain-pepe"
            type="radio"
            name="chain"
            value="PEPE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-pepe"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            PEPE
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain("DOGE")}
            id="chain-doge"
            type="radio"
            name="chain"
            value="DOGE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            disabled
          />
          <label
            htmlFor="chain-doge"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            DOGE
          </label>
        </div>
      </fieldset>
    </>
  );
}

function NetworkInput({
  network,
  setNetwork,
}: {
  network: Network | undefined;
  setNetwork: Dispatch<Network>;
}) {
  return (
    <>
      <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Network
      </label>
      <fieldset className="flex">
        <legend className="sr-only">Network</legend>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork("mainnet")}
            checked={network === "mainnet"}
            id="network-mainnet"
            type="radio"
            name="network"
            value="Mainnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-mainnet"
            className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Mainnet
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork("testnet")}
            checked={network === "testnet"}
            id="network-testnet"
            type="radio"
            name="network"
            value="Testnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-testnet"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Testnet
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork("regtest")}
            checked={network === "regtest"}
            id="network-regtest"
            type="radio"
            name="network"
            value="Regtest"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-regtest"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Regtest
          </label>
        </div>
      </fieldset>
    </>
  );
}

function UrlInput({
  urlInputRef,
}: {
  urlInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Node Url
        </label>
      </div>
      <input
        ref={urlInputRef}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      />
    </>
  );
}

function LoginButton({
  mnemonic,
  chain,
  network,
  path,
  url,
  urlInputRef,
}: {
  urlInputRef: RefObject<HTMLInputElement | null>;
  mnemonic: string;
  chain: Chain | undefined;
  network: Network | undefined;
  path?: string;
  url: string | undefined;
}) {
  const { showSnackBar } = useUtilsComponents();

  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggedIn())
      showSnackBar("A user is already logged in, please log out first.", false);
    if (mnemonic.length === 0)
      showSnackBar("Please don't use an empty mnemonic string.", false);

    if (!mnemonic || !chain || !network || !url) {
      return showSnackBar("Please provide valid values.", false);
    }

    localStorage.setItem("BIP_39_KEY", mnemonic);
    localStorage.setItem("CHAIN", chain);
    localStorage.setItem("NETWORK", network);
    if (path) localStorage.setItem("PATH", path);
    localStorage.setItem("URL", urlInputRef.current?.value || url);

    window.location.href = "/";
  };

  return (
    <>
      <button
        onClick={login}
        type="submit"
        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Log In
      </button>
      {/* {show && <SnackBar message={message} success={success} hideSnackBar={setShow} />} */}
    </>
  );
}

function LoginForm() {
  const [mnemonic, setMnemonic] = useState<string>(
    new Computer().getMnemonic()
  );
  const [chain, setChain] = useState<Chain | undefined>(
    process.env.NEXT_PUBLIC_CHAIN as Chain | undefined
  );
  const [network, setNetwork] = useState<Network | undefined>(
    process.env.NEXT_PUBLIC_NETWORK as Network | undefined
  );
  const [url] = useState<string | undefined>(process.env.NEXT_PUBLIC_URL);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="max-w-sm mx-auto p-4 md:p-5 space-y-4">
        <form className="space-y-6">
          <div>
            <MnemonicInput mnemonic={mnemonic} setMnemonic={setMnemonic} />
            {<ChainInput chain={chain} setChain={setChain} />}
            {<NetworkInput network={network} setNetwork={setNetwork} />}
            {!url && <UrlInput urlInputRef={urlInputRef} />}
          </div>
        </form>
      </div>
      <div className="max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <LoginButton
          mnemonic={mnemonic}
          chain={chain}
          network={network}
          url={url}
          urlInputRef={urlInputRef}
        />
      </div>
    </>
  );
}

function LoginModal() {
  return (
    <Modal.Component title="Sign in" content={LoginForm} id="sign-in-modal" />
  );
}

export const Auth = {
  isLoggedIn,
  logout,
  getCoinType,
  getBip44Path,
  defaultConfiguration: loggedOutConfiguration,
  browserConfiguration: loggedInConfiguration,
  getComputer,
  LoginForm,
  LoginModal,
};

```

# common-components\Card.tsx

```tsx
 
export function Card({ content, id }: any) {
  return (
    <div className="block mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <pre
        id={id ?? undefined}
        className="font-normal text-gray-700 dark:text-gray-400 text-xs"
      >
        {content}
      </pre>
    </div>
  );
}

```

# common-components\ClientProvider.tsx

```tsx
// src/app/common-components/ClientProviders.tsx
"use client";

import React, { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { UtilsProvider } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";
import { getComputer } from "./Auth";
import { Computer } from "@bitcoin-computer/lib";
import dynamic from "next/dynamic";

const Wallet = dynamic(() => import("./Wallet").then((mod) => mod.Wallet), {
  ssr: false,
});

const Navbar = dynamic(() => import("./Navbar").then((mod) => mod.Navbar), {
  ssr: false,
});

const LoginModal = dynamic(
  () => import("./Auth").then((mod) => mod.Auth.LoginModal),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [computer, setComputer] = useState<Computer | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize SES lockdown before creating Computer instance
      // This is required for deployed contracts to work properly
      try {
        Computer.lockdown({
          consoleTaming: 'unsafe',
          errorTaming: 'unsafe',
          mathTaming: 'unsafe',
          dateTaming: 'unsafe',
          overrideTaming: 'severe',
        });
        console.log('✅ SES lockdown initialized');
      } catch (error: any) {
        // Lockdown might already be called, which is fine
        if (!error.message?.includes('already called')) {
          console.warn('⚠️ SES lockdown warning:', error.message);
        }
      }
      
      // Create Computer instance after lockdown
      const comp = getComputer();
      setComputer(comp);
      console.log('✅ Computer instance created');
    }
  }, []);

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <UtilsProvider>
      <ComputerContext.Provider value={computer}>
        {computer ? (
          <>
            <LoginModal />
            <Wallet />
            <Navbar />
            <div className="m-4 bg-gray-100 dark:bg-gray-800">{children}</div>
          </>
        ) : (
          <></>
        )}
      </ComputerContext.Provider>
    </UtilsProvider>
  );
}

```

# common-components\common\Components.tsx

```tsx
export function Loader() {
  return (
    <div className="grid place-items-center h-screen w-full top-0 left-0 fixed">
      <svg
        aria-hidden="true"
        className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  )
}

```

# common-components\common\SmartCallExecutionResult.tsx

```tsx
import Link from "next/link";
import { useRouter } from "next/navigation";

 
export function FunctionResultModalContent({ functionResult }: any) {
  const router = useRouter();

  if (
    functionResult &&
    typeof functionResult === "object" &&
    !Array.isArray(functionResult)
  )
    return (
      <>
        <div
          id="smart-call-execution-success"
          className="p-4 md:p-5 dark:text-gray-400"
        >
          You created a&nbsp;
          <Link
            id="smart-call-execution-counter-link"
            href={`/objects/${functionResult._rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              router.push(`/objects/${functionResult._rev}`);
            }}
          >
            smart object
          </Link>
          .
        </div>
      </>
    );

  if (functionResult._rev && functionResult.res.toString())
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        You created the value below at Revision {functionResult._rev}
        <pre>{functionResult.res.toString()}</pre>
      </p>
    );

  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
      {functionResult}
    </p>
  );
}

```

# common-components\common\types.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'testnet' | 'mainnet' | 'regtest'
export type ModuleStorageType = 'taproot' | 'multisig'

```

# common-components\common\TypeSelectionDropdown.tsx

```tsx
import { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownInterface,
  DropdownOptions,
  InstanceOptions,
  initFlowbite,
} from "flowbite";

export const TypeSelectionDropdown = ({
  id,
  onSelectMethod,
  dropdownList,
  selectedType,
   
}: any) => {
  const [dropDown, setDropdown] = useState<DropdownInterface>();
  const [type, setType] = useState(selectedType || "Type");
  const [dropdownSelectionList] = useState(dropdownList);

  useEffect(() => {
    initFlowbite();
    const $targetEl: HTMLElement = document.getElementById(
      `dropdownMenu${id}`
    ) as HTMLElement;
    const $triggerEl: HTMLElement = document.getElementById(
      `dropdownButton${id}`
    ) as HTMLElement;
    const options: DropdownOptions = {
      placement: "bottom",
      triggerType: "click",
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
    };
    const instanceOptions: InstanceOptions = {
      id: `dropdownMenu${id}`,
      override: true,
    };
    setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions));
  }, [id]);

  const handleClick = (clickType: string) => {
    setType(clickType);
    onSelectMethod(clickType);
    if (dropDown) dropDown.hide();
  };

  return (
    <>
      <button
        id={`dropdownButton${id}`}
        data-dropdown-toggle={`dropdownMenu${id}`}
        className="flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button"
      >
        {type}
        <svg
          className="w-2.5 h-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          ></path>
        </svg>
      </button>

      <div
        id={`dropdownMenu${id}`}
        className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby={`dropdownButton${id}`}
        >
          {dropdownSelectionList.map((option: string, index: number) => (
            <li key={index}>
              <span
                onClick={() => {
                  handleClick(option);
                }}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {option}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

```

# common-components\common\utils.ts

```ts
type Json = JBasic | JObject | JArray;
type JBasic = undefined | null | boolean | number | string | symbol | bigint;
type JArray = Json[];
type JObject = { [x: string]: Json };

const isJUndefined = (a: any): a is undefined => typeof a === "undefined";

const isJNull = (a: any): a is null => a === null;

const isJBoolean = (a: any): a is boolean => typeof a === "boolean";

const isJNumber = (a: any): a is number => typeof a === "number";

const isJString = (a: any): a is string => typeof a === "string";

const isJSymbol = (a: any): a is symbol => typeof a === "symbol";

const isJBigInt = (a: any): a is bigint => typeof a === "bigint";

const isJBasic = (a: any): a is JBasic =>
  isJNull(a) ||
  isJUndefined(a) ||
  isJNumber(a) ||
  isJString(a) ||
  isJBoolean(a) ||
  isJSymbol(a) ||
  isJBigInt(a);

const isJObject = (a: any): a is JObject => !isJBasic(a) && !Array.isArray(a);

const isJArray = (a: any): a is JArray => !isJBasic(a) && Array.isArray(a);

const objectEntryMap =
  (g: (el: [string, Json]) => [string, Json]) =>
  (object: JObject): JObject =>
    Object.fromEntries(Object.entries(object).map(g));

const objectMap =
  (f: (el: Json) => Json) =>
  (object: JObject): JObject =>
    objectEntryMap(([key, value]) => [key, f(value)])(object);

export const jsonMap =
  (g: (el: Json) => Json) =>
  (json: Json): Json => {
    if (isJBasic(json)) return g(json);
    if (isJArray(json)) return g(json.map(jsonMap(g)));
    if (isJObject(json)) return g(objectMap(jsonMap(g))(json));
    throw new Error("Unsupported type");
  };

export const strip = (value: Json): Json => {
  if (isJBasic(value)) return value;
  if (isJArray(value)) return value.map(strip);

   
  const { _id, _root, _rev, _satoshis, _owners, ...rest } = value;
  return rest;
};

// https://github.com/GoogleChromeLabs/jsbi/issues/30

export const toObject = (obj: any) =>
  JSON.stringify(
    obj,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export function isValidRevString(outId: string): boolean {
  return /^[0-9A-Fa-f]{64}:\d+$/.test(outId);
}

export function isValidRev(
  value: string | number | boolean | null | undefined
): boolean {
  return typeof value === "string" && isValidRevString(value);
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function bigIntToStr(a: bigint): string {
  if (a < 0n) throw new Error("Balance must be a non-negative");

  const scale = BigInt(1e8);
  const integerPart = (a / scale).toString();
  const fractionalPart = (a % scale)
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "");
  return `${integerPart}.${fractionalPart || "0"}`;
}

export function strToBigInt(a: string): bigint {
  // Validate number contains at most one dot and is not empty
  if ((a.match(/\./g) || []).length > 1 || a === "." || a === "") {
    throw new Error("Invalid number");
  }

  const [integerPart, fractionalPart = ""] = a.split(".");

  // Validate integer and fractional part contains only digits (or is empty)
  if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error("Invalid number");
  }

  const paddedFractionalPart = fractionalPart.padEnd(8, "0").slice(0, 8);
  const totalSatoshisStr = integerPart + paddedFractionalPart;

  return BigInt(totalSatoshisStr);
}

```

# common-components\ComputerContext.tsx

```tsx
import { Computer } from "@bitcoin-computer/lib";
import { createContext } from "react";

export const ComputerContext = createContext<Computer | null>(null);



```

# common-components\Drawer.tsx

```tsx
function ShowDrawer({ text, id }: { text: string; id: string }) {
  return (
    <button
      data-drawer-target={id}
      data-drawer-show={id}
      data-drawer-placement="right"
      aria-controls={id}
    >
      {text}
    </button>
  );
}

 
function Component({ Content, id }: any) {
  return (
    <div
      id={id}
      className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-80 dark:bg-gray-800"
      tabIndex={-1}
      aria-labelledby="drawer-right-label"
    >
      <button
        type="button"
        data-drawer-hide={id}
        aria-controls={id}
        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      {Content()}
    </div>
  );
}

export const Drawer = {
  Component,
  ShowDrawer,
};

```

# common-components\Err.tsx

```tsx
export const Err = ({ message }: { message: string }) => (
  <>
    <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600">
      400
    </h1>
    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white">
      Something went wrong.
    </p>
    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
      {message}
    </p>
  </>
);

```

# common-components\Error404.tsx

```tsx
import { Err } from "./Err";
import { Missing } from "./Missing";

export const Error404 = ({ message: m }: { message?: string }) => {
  return (
    <section className="w-full bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          {m ? <Err message={m} /> : <Missing />}
        </div>
      </div>
    </section>
  );
};

```

# common-components\Gallery.tsx

```tsx
"use client";
import { Computer } from "@bitcoin-computer/lib";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { initFlowbite } from "flowbite";
import { jsonMap, strip, toObject } from "./common/utils";
import { useUtilsComponents } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";
import { useMemo } from "react";

export type Class = new (...args: any) => any;

export type UserQuery<T extends Class> = Partial<{
  mod: string;
  publicKey: string;
  limit: number;
  offset: number;
  order: "ASC" | "DESC";
  ids: string[];
  contract: {
    class: T;
    args?: ConstructorParameters<T>;
  };
}>;

function HomePageCard({ content }: any) {
  return (
    <div className="block w-72 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <pre className="font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs">
        {content()}
      </pre>
    </div>
  );
}

function ValueComponent({
  rev,
  computer,
}: {
  rev: string;
  computer: Computer;
}) {
  const [value, setValue] = useState<any>("loading...");
  const [errorMsg, setMsgError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced: any = await computer.sync(rev);
        setValue(toObject(jsonMap(strip)(synced)));
      } catch (err) {
        if (err instanceof Error) setMsgError(`Error: ${err.message}`);
      }
      setLoading(false);
    };
    fetch();
  }, [computer, rev]);

  const loadingContent = () => (
    <>
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="#1C64F2"
        />
      </svg>
      <span className="loading-smart-contract-span">&nbsp;Loading...</span>
    </>
  );

  return loading ? (
    <HomePageCard content={loadingContent} />
  ) : (
    <HomePageCard content={() => errorMsg || value} />
  );
}

function FromRevs({ revs, computer }: { revs: string[]; computer: any }) {
  return (
    <div className="flex flex-wrap flex-col max-h-[75vh] gap-4 mb-4 mt-4">
      {revs.map((rev) => (
        <div key={rev}>
          <Link
            href={`/objects/${rev}`}
            className="block font-medium text-blue-600 dark:text-blue-500"
          >
            <ValueComponent rev={rev} computer={computer} />
          </Link>
        </div>
      ))}
    </div>
  );
}

function Pagination({
  isPrevAvailable,
  handlePrev,
  isNextAvailable,
  handleNext,
}: any) {
  return (
    <nav
      className="flex items-center justify-between"
      aria-label="Table navigation"
    >
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            disabled={!isPrevAvailable}
            onClick={handlePrev}
            className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
          </button>
        </li>
        <li>
          <button
            disabled={!isNextAvailable}
            onClick={handleNext}
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default function WithPagination<T extends Class>(q: UserQuery<T>) {
  const contractsPerPage = 12;
  const computer = useContext(ComputerContext);
  const { showLoader } = useUtilsComponents();
  const [pageNum, setPageNum] = useState(0);
  const [isNextAvailable, setIsNextAvailable] = useState(true);
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0);
  const [showNoAsset, setShowNoAsset] = useState(false);
  const [revs, setRevs] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const params = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );

  useEffect(() => {
    initFlowbite();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      showLoader(true);
      if (computer) {
        const query = { ...q, ...params };
        query.offset = contractsPerPage * pageNum;
        query.limit = contractsPerPage + 1;
        query.order = "DESC";
        
        // Use getOUTXOs to get output transaction objects
        const result = await computer.getOUTXOs(query);
        setIsNextAvailable(result.length > contractsPerPage);
        setRevs(result.slice(0, contractsPerPage));
        if (pageNum === 0 && result?.length === 0) {
          setShowNoAsset(true);
        }
      }

      showLoader(false);
    };
    fetch();
  }, [computer, pageNum]);

  const handleNext = async () => {
    setIsPrevAvailable(true);
    setPageNum(pageNum + 1);
  };

  const handlePrev = async () => {
    setIsNextAvailable(true);
    if (pageNum - 1 === 0) setIsPrevAvailable(false);
    setPageNum(pageNum - 1);
  };

  return (
    <div className="relative sm:rounded-lg pt-4 w-full">
      <FromRevs revs={revs} computer={computer} />
      {!(pageNum === 0 && revs && revs.length === 0) && (
        <Pagination
          revs={revs}
          isPrevAvailable={isPrevAvailable}
          handlePrev={handlePrev}
          isNextAvailable={isNextAvailable}
          handleNext={handleNext}
        />
      )}
      {pageNum === 0 && revs && revs.length === 0 && showNoAsset && (
        <h1 className="w-full mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white text-center mx-auto">
          No Objects Found
        </h1>
      )}
    </div>
  );
}

export const Gallery = {
  FromRevs,
  WithPagination,
};

```

# common-components\index.tsx

```tsx
export { SnackBar } from "./SnackBar";
export { Auth } from "./Auth";
export { Modal } from "./Modal";
export { Gallery } from "./Gallery";
export { SmartObject } from "./SmartObject";
export { Transaction } from "./Transaction";
export { Error404 } from "./Error404";
export { UtilsProvider, useUtilsComponents } from "./UtilsContext";
export { ComputerContext } from "./ComputerContext";
export { FunctionResultModalContent } from "./common/SmartCallExecutionResult";
export { Drawer } from "./Drawer";
export { Wallet, WalletComponents } from "./Wallet";
export { Card } from "./Card";
export * from "./common/utils";

```

# common-components\Loader.tsx

```tsx
export function Loader() {
  return (
    <div className="grid place-items-center h-screen w-full top-0 left-0 fixed z-50">
      <svg
        aria-hidden="true"
        className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  )
}

```

# common-components\Missing.tsx

```tsx
import Link from "next/link";

export const Missing = () => (
  <>
    <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600">
      404
    </h1>
    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white">
      Something&apos;s missing.
    </p>
    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
      Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on
      the home page.
    </p>
    <Link
      href="/"
      className="inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4"
    >
      Back to Homepage
    </Link>
  </>
);

```

# common-components\Modal.tsx

```tsx
import { Modal as ModalClass } from "flowbite";
import type { ModalOptions, InstanceOptions } from "flowbite";

const get = (id: string) => {
  const $modalElement = document.querySelector(`#${id}`) as HTMLElement;
  const modalOptions: ModalOptions = {};
  const instanceOptions: InstanceOptions = { id, override: true };
  return new ModalClass($modalElement, modalOptions, instanceOptions);
};

const showModal = (id: string) => {
  get(id).show();
};

const hideModal = (id: string, onClickClose?: () => void) => {
  get(id).hide();
  if (onClickClose) {
    onClickClose();
  }
};

const toggleModal = (id: string) => {
  get(id).toggle();
};

 
const ShowButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-show={id} type="button">
    {text}
  </button>
);

 
const HideButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-hide={id} type="button">
    {text}
  </button>
);

 
const ToggleButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-toggle={id} type="button">
    {text}
  </button>
);

const Component = ({
  title,
  content,
  contentData,
  id,
  onClickClose,
}: {
  title: string;
  content: any;  
  id: string;
  contentData?: any;  
  onClickClose?: () => void;
}) => (
  <div
    id={id}
    tabIndex={-1}
    aria-hidden="true"
    style={{ zIndex: 45 }}
    className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div className="relative p-4 w-full max-w-sm max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide={id}
            data-modal-target={id}
            onClick={() => hideModal(id, onClickClose)}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        {content(contentData)}
      </div>
    </div>
  </div>
);

export const Modal = {
  get,
  showModal,
  hideModal,
  toggleModal,
  ShowButton,
  HideButton,
  ToggleButton,
  Component,
};

```

# common-components\Navbar.tsx

```tsx
"use client";
import Link from "next/link";
import { Modal, Auth, useUtilsComponents, Drawer } from "./index";
import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { Chain, Network } from "../types/common";

const modalTitle = "Connect to Node";
const modalId = "unsupported-config-modal";
export const signInModal = "sign-in-modal";

function formatChainAndNetwork(chain: Chain, network: Network) {
  if (!chain || !network) return "";
  const map = {
    mainnet: "",
    testnet: "t",
    regtest: "r",
  };
  const prefix = map[network];
  return `${prefix}${chain}`;
}

function ModalContent() {
  const [url, setUrl] = useState<string>("");
  function setNetwork(e: React.SyntheticEvent) {
    e.preventDefault();
    localStorage.setItem("URL", url);
  }

  function closeModal() {
    Modal.get(modalId).hide();
  }

  return (
    <form onSubmit={setNetwork}>
      <div className="p-4 md:p-5">
        <div>
          <label
            htmlFor="url"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Please insert the URL of a node for your desired configuration
          </label>

          <input
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            type="text"
            name="url"
            id="url"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="http://127.0.0.1:1031"
            required
          />

          <label className="block mt-4 text-sm font-medium text-gray-900 dark:text-white">
            Want to run your own node? Click&nbsp;
            <Link
              href="https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme"
              target="_blank"
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              here
            </Link>
          </label>
        </div>
      </div>

      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Connect
        </button>
        <button
          onClick={closeModal}
          className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SignInItem() {
  return (
    <li className="py-2">
      <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
        <Modal.ShowButton text="Sign in" id={signInModal} />
      </label>
    </li>
  );
}

export function NotLoggedMenu() {
  const [dropDownLabel, setDropDownLabel] = useState<string>("LTC");
  const { showSnackBar } = useUtilsComponents();

  useEffect(() => {
    initFlowbite();

    const { chain, network } = Auth.defaultConfiguration();
    // default to LTC regtest
    setDropDownLabel(
      formatChainAndNetwork(chain, network)
        ? formatChainAndNetwork(chain, network)
        : formatChainAndNetwork("LTC", "regtest")
    );
  }, []);

  const setChainAndNetwork = (chain: Chain, network: Network) => {
    try {
      localStorage.setItem("CHAIN", chain);
      localStorage.setItem("NETWORK", network);
      // default to LTC regtest
      setDropDownLabel(
        formatChainAndNetwork(chain, network)
          ? formatChainAndNetwork(chain, network)
          : formatChainAndNetwork("LTC", "regtest")
      );
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = "/";
    } catch (error) {
      if (error instanceof Error) {
        showSnackBar(
          `Error setting chain and network: ${error.message}`,
          false
        );
        Modal.get(modalId).show();
      }
    }
  };

  function CoinSelectionItem({
    chain,
    network,
  }: {
    chain: Chain;
    network: Network;
  }) {
    return (
      <li>
        <div
          onClick={() => setChainAndNetwork(chain, network)}
          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          {chain} {network}
        </div>
      </li>
    );
  }

  return (
    <>
      <Modal.Component title={modalTitle} content={ModalContent} id={modalId} />
      <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
        <li className="py-2">
          <button
            id="dropdownNavbarLink"
            data-dropdown-toggle="dropdownNavbar"
            className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
          >
            {dropDownLabel}
            <svg
              className="w-2.5 h-2.5 ms-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            id="dropdownNavbar"
            className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-400 cursor-pointer"
              aria-labelledby="dropdownLargeButton"
            >
              <CoinSelectionItem chain={"LTC"} network={"mainnet"} />
              <CoinSelectionItem chain={"LTC"} network={"testnet"} />
              <CoinSelectionItem chain={"LTC"} network={"regtest"} />
            </ul>
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-400 cursor-pointer"
              aria-labelledby="dropdownLargeButton"
            >
              <CoinSelectionItem chain={"BTC"} network={"mainnet"} />
              <CoinSelectionItem chain={"BTC"} network={"testnet"} />
              <CoinSelectionItem chain={"BTC"} network={"regtest"} />
            </ul>
          </div>
        </li>

        <SignInItem />
      </ul>
    </>
  );
}

function WalletItem() {
  return (
    <li className="py-2">
      <label className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
        <Drawer.ShowDrawer text="Wallet" id="wallet-drawer" />
      </label>
    </li>
  );
}

const capitalizeFirstLetter = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

function Item({ dest }: { dest: string }) {
  return (
    <Link
      href={`/${dest}`}
      className="flex items-center space-x-3 rtl:space-x-reverse"
    >
      <span
        id={`${dest}-button`}
        className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
      >
        {capitalizeFirstLetter(dest)}
      </span>
    </Link>
  );
}

export function LoggedInMenu() {
  return (
    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <Item dest={"mine"} />
      <Item dest={"mint"} />
      <WalletItem />
    </ul>
  );
}

function NavbarDropdownButton() {
  return (
    <button
      data-collapse-toggle="navbar-dropdown"
      type="button"
      className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      aria-controls="navbar-dropdown"
      aria-expanded="false"
    >
      <span className="sr-only">Open main menu</span>
      <svg
        className="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 17 14"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M1 1h15M1 7h15M1 13h15"
        />
      </svg>
    </button>
  );
}

export function Logo() {
  const { chain } = Auth.defaultConfiguration();
  const AppName =
    chain === "LTC"
      ? "Lite Chess"
      : chain === "DOGE"
        ? "Doge Chess"
        : chain === "PEPE"
          ? "Pepe Chess"
          : "Bit Chess";
  return (
    <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
      <img src="/logo.png" className="h-10" alt="Bitcoin Computer Logo" />
      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
        {AppName}
      </span>
    </Link>
  );
}

export function Navbar() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Logo />
          <NavbarDropdownButton />
          <div
            className="hidden w-full md:block md:w-auto"
            id="navbar-dropdown"
          >
            {Auth.isLoggedIn() ? <LoggedInMenu /> : <NotLoggedMenu />}
          </div>
        </div>
      </nav>
    </>
  );
}

```

# common-components\SmartObject.tsx

```tsx
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import reactStringReplace from "react-string-replace";
import { HiOutlineClipboard } from "react-icons/hi";
import { capitalizeFirstLetter, toObject } from "./common/utils";
import { Card } from "./Card";
import { Modal } from "./Modal";
import { FunctionResultModalContent } from "./common/SmartCallExecutionResult";
import { SmartObjectFunctions } from "./SmartObjectFunctions";
import { ComputerContext } from "./ComputerContext";

const keywords = ["_id", "_rev", "_owners", "_root", "_satoshis"];
const modalId = "smart-object-info-modal";

export const getFnParamNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/);
  return match
    ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",")
    : [];
};

function Copy({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="cursor-pointer pl-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      aria-label="Copy Transaction ID"
    >
      <HiOutlineClipboard />
    </button>
  );
}

function ObjectValueCard({ content, id }: { content: string; id?: string }) {
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g;
  const revLink = (rev: string, i: number) => (
    <Link
      key={i}
      href={`/objects/${rev}`}
      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {rev}
    </Link>
  );
  const formattedContent = reactStringReplace(content, isRev, revLink);

  return <Card content={formattedContent} id={`property-${id}-value`} />;
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>;
  return (
    <>
      {Object.entries(smartObject)
        .filter(([k]) => !keywords.includes(k))
        .map(([key, value], i) => (
          <div key={i}>
            <h3 className="mt-2 text-xl font-bold dark:text-white">
              {capitalizeFirstLetter(key)}
            </h3>
            <ObjectValueCard id={key} content={toObject(value)} />
          </div>
        ))}
    </>
  );
};

function MetaData({ smartObject, prev, next }: any) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      <div className="pt-6 pb-6 space-y-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex">
          <a
            href={prev ? `/objects/${prev}` : undefined}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      ${
        prev
          ? "bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
      }`}
            aria-disabled={!prev}
          >
            Previous
          </a>
          <a
            href={next ? `/objects/${next}` : undefined}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      ${
        next
          ? "bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
      }`}
            aria-disabled={!next}
          >
            Next
          </a>
          <button
            onClick={toggleVisibility}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700`}
          >
            {isVisible ? "Hide Metadata" : "Show Metadata"}
          </button>
        </div>
      </div>

      {isVisible && (
        <table className="w-full mt-4 mb-8 text-[12px] text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-2">
                Key
              </th>
              <th scope="col" className="px-4 py-2">
                Short
              </th>
              <th scope="col" className="px-4 py-2">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Identity</td>
              <td className="px-4 py-2">
                <pre>_id</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/objects/${smartObject?._id}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._id}
                </Link>
                <Copy text={smartObject?._id} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Revision</td>
              <td className="px-4 py-2">
                <pre>_rev</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/objects/${smartObject?._rev}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._rev}
                </Link>
                <Copy text={smartObject?._rev} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Root</td>
              <td className="px-4 py-2">
                <pre>_root</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/objects/${smartObject?._root}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._root}
                </Link>
                <Copy text={smartObject?._root} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Owners</td>
              <td className="px-4 py-2">
                <pre>_owners</pre>
              </td>
              <td className="px-4 py-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject?._owners}
                </span>
                <Copy text={JSON.stringify(smartObject?._owners)} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Amount</td>
              <td className="px-4 py-2">
                <pre>_satoshis</pre>
              </td>
              <td className="px-4 py-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject?._satoshis} Satoshi
                </span>
                <Copy text={smartObject?._satoshis} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

function Component({ title }: { title?: string }) {
  const router = useRouter();

  const params = useParams();
  const [rev] = useState<string>(
    typeof params.rev === "string"
      ? decodeURIComponent(params.rev)
      : decodeURIComponent(params.rev?.[0] || "")
  );
  const computer = useContext(ComputerContext);
  const [smartObject, setSmartObject] = useState<any | null>(null);
  const [next, setNext] = useState<string | undefined>(undefined);
  const [prev, setPrev] = useState<string | undefined>(undefined);
  const [functionsExist, setFunctionsExist] = useState(false);
  const [functionResult, setFunctionResult] = useState<any>({});
  const options = [
    "object",
    "string",
    "number",
    "bigint",
    "boolean",
    "undefined",
    "symbol",
  ];

  const [modalTitle, setModalTitle] = useState("");

  const setShow: any = (flag: boolean) => {
    if (flag) {
      Modal.get(modalId).show();
    } else {
      Modal.get(modalId).hide();
    }
  };

  useEffect(() => {
    const fetch = async () => {
      if (computer) {
        try {
          const synced = await computer.sync(rev);
          setSmartObject(synced);
        } catch (error) {
          console.log(error);
          const [txId] = rev.split(":");
          router.push(`/transactions/${txId}`);
        }

        try {
          setPrev(await computer.prev(rev));
          setNext(await computer.next(rev));
        } catch (error) {
          console.log({ error });
        }
      }
    };
    fetch();
  }, [computer, rev]);

  useEffect(() => {
    let funcExist = false;
    if (smartObject) {
      const filteredSmartObject = Object.getOwnPropertyNames(
        Object.getPrototypeOf(smartObject)
      ).filter(
        (key) =>
          key !== "constructor" &&
          typeof Object.getPrototypeOf(smartObject)[key] === "function"
      );

      Object.keys(filteredSmartObject).forEach((key) => {
        if (key) {
          funcExist = true;
        }
      });
    }
    setFunctionsExist(funcExist);
  }, [smartObject]);

  const [txId, outNum] = rev.split(":");

  return (
    <>
      <div className="max-w-screen-md mx-auto">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">
          {title || "Object"}
        </h1>
        <div className="mb-8">
          <Link
            href={`/transactions/${txId}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {txId}
          </Link>
          <span>:{outNum}</span>
          <Copy text={`${txId}:${outNum}`} />
        </div>

        <SmartObjectValues smartObject={smartObject} />

        <SmartObjectFunctions
          smartObject={smartObject}
          functionsExist={functionsExist}
          options={options}
          setFunctionResult={setFunctionResult}
          setShow={setShow}
          setModalTitle={setModalTitle}
        />

        <MetaData smartObject={smartObject} prev={prev} next={next} />
      </div>
      <Modal.Component
        title={modalTitle}
        content={FunctionResultModalContent}
        contentData={{ functionResult }}
        id={modalId}
      />
    </>
  );
}

export const SmartObject = {
  Component,
};

```

# common-components\SmartObjectFunction.tsx

```tsx
import { useContext, useMemo, useState } from "react";
import { TypeSelectionDropdown } from "./common/TypeSelectionDropdown";
import { isValidRev, sleep } from "./common/utils";
import { useUtilsComponents } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";

export const getErrorMessage = (error: any): string => {
  if (
    error?.response?.data?.error ===
    "mandatory-script-verify-flag-failed (Operation not valid with the current stack size)"
  )
    return "You are not authorized to make changes to this smart object";
  if (error?.response?.data?.error) return error?.response?.data?.error;
  return error.message ? error.message : "Error occurred";
};

const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
    case "number":
      return Number(stringValue);
    case "string":
      return stringValue;
    case "boolean":
      return stringValue === "true";
    case "undefined":
      return undefined;
    case "null":
      return null;
    case "object":
      return stringValue;
    default:
      return Number(stringValue);
  }
};

export const getParameterNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/);
  return match
    ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",")
    : [];
};

const getParameters = (params: string[], fnName: string, formState: any) =>
  params.map((param) => {
    const key = `${fnName}-${param}`;
    const paramValue = getValueForType(
      formState[`${key}--types`],
      formState[key]
    );

    if (isValidRev(paramValue)) return param;
    if (typeof paramValue === "string") return `'${paramValue}'`;
    return paramValue;
  });

export const SmartObjectFunction = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
  funcName,
}: {
  smartObject: any;
  functionsExist: boolean;
  options: string[];
  setFunctionResult: React.Dispatch<any>;
  setShow: any;
  setModalTitle: React.Dispatch<React.SetStateAction<string>>;
  funcName: string;
}) => {
  const parameterList = getParameterNames(
    Object.getPrototypeOf(smartObject)[funcName]
  ).filter((val) => val);
  const [formState, setFormState] = useState<any>(
    Object.fromEntries(
      parameterList.flatMap((key) => [
        [`${funcName}-${key}`, ""],
        [`${funcName}-${key}--types`, ""],
      ])
    )
  );
  const { showLoader } = useUtilsComponents();
  const computer = useContext(ComputerContext);

  const handleMethodCall = async (
    event: any,
    smartObj: any,
    fnName: string,
    params: string[]
  ) => {
    event.preventDefault();
    showLoader(true);
    try {
      if (!computer) {
        return;
      }
      const revMap: any = {};

      // Create Rev Map to pass smart objects as params
      params.forEach((param) => {
        const key = `${fnName}-${param}`;
        const paramValue = getValueForType(
          formState[`${key}--types`],
          formState[key]
        );
        if (isValidRev(paramValue)) {
          revMap[param] = paramValue;
        }
      });

      const { tx } = await computer.encode({
        exp: `smartObject.${fnName}(${getParameters(params, fnName, formState)})`,
        env: { smartObject: smartObj._rev, ...revMap },
      });

      await computer.broadcast(tx!);
      await sleep(1000);
      const [rev] = await computer.latest(smartObject._id);
      setFunctionResult({ _rev: rev });
      setModalTitle("Success");
      setShow(true);
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error));
      setModalTitle("Error!");
      setShow(true);
    } finally {
      showLoader(false);
    }
  };

  const updateForm = (e: any, key: string) => {
    e.preventDefault();
    const value = { ...formState };
    value[key] = e.target.value;
    setFormState(value);
  };

  const updateTypes = (option: string, key: string) => {
    const value = { ...formState };
    value[`${key}--types`] = option;
    setFormState(value);
  };

  const capitalizeFirstLetter = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1);

  const isDisabled = useMemo(
    () =>
      Object.keys(formState).length > 0 &&
      Object.values(formState).some((value) => value === ""),
    [formState]
  );

  if (!functionsExist) return <></>;
  return (
    <>
      <div className="mt-6 mb-6" id={`function-${funcName}`}>
        <h3 className="my-2 text-xl font-bold dark:text-white">
          {capitalizeFirstLetter(funcName)}
        </h3>
        <form>
          {parameterList.map((paramName, paramIndex) => (
            <div key={paramIndex} className="mb-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  id={`${funcName}-${paramName}`}
                  value={formState[`${funcName}-${paramName}`] || ""}
                  onChange={(e) => updateForm(e, `${funcName}-${paramName}`)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder={paramName}
                  required
                />
                <TypeSelectionDropdown
                  id={`${funcName}${paramName}`}
                  dropdownList={options}
                  onSelectMethod={(option: string) =>
                    updateTypes(option, `${funcName}-${paramName}`)
                  }
                />
              </div>
            </div>
          ))}
          <button
            id={`${funcName}-call-function-button`}
            disabled={isDisabled}
            className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:ring-4 focus:outline-none
              ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}
            `}
            onClick={(evt) =>
              handleMethodCall(evt, smartObject, funcName, parameterList)
            }
          >
            Call Function
          </button>
        </form>
      </div>
    </>
  );
};

```

# common-components\SmartObjectFunctions.tsx

```tsx
import { SmartObjectFunction } from './SmartObjectFunction'

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
  setFunctionResult: React.Dispatch<any>
  setShow: any
  setModalTitle: React.Dispatch<React.SetStateAction<string>>
}) => {
  if (!functionsExist) return <></>
  return (
    <>
      {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
        .filter(
          (key) =>
            key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function',
        )
        .map((key, fnIndex) => (
            <div key={fnIndex}>
              <SmartObjectFunction
                funcName={key}
                smartObject={smartObject}
                functionsExist={functionsExist}
                options={options}
                setFunctionResult={setFunctionResult}
                setShow={setShow}
                setModalTitle={setModalTitle}
              ></SmartObjectFunction>
            </div>
          ))}
    </>
  )
}

```

# common-components\SnackBar.tsx

```tsx
import { useEffect } from "react";

interface SnackBarProps {
  message: string;
  success: boolean;
  hideSnackBar: () => void;
}

export function SnackBar(props: SnackBarProps) {
  const { message, success, hideSnackBar } = props;

   
  const closeMessage = (evt: any) => {
    evt.preventDefault();
    hideSnackBar();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      hideSnackBar();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [hideSnackBar]);

  return (
    <div
      className={
        success
          ? `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
          : `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
      }
      role="alert"
    >
      <strong className="font-bold pr-6">{message}</strong>
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={closeMessage}
      >
        <svg
          className={
            success
              ? `fill-current h-6 w-6 text-green-500`
              : `fill-current h-6 w-6 text-red-500`
          }
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  );
}

```

# common-components\Transaction.tsx

```tsx
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import reactStringReplace from "react-string-replace";
import { Computer } from "@bitcoin-computer/lib";
import { Card } from "./Card";
import { ComputerContext } from "./ComputerContext";

function ExpressionCard({
  content,
  env,
}: {
  content: string;
  env: { [s: string]: string };
}) {
  const entries = Object.entries(env);
  let formattedContent = content as any;
  entries.forEach((entry) => {
    const [name, rev] = entry;
    const regExp = new RegExp(`(${name})`, "g");
    const replacer = (n: string, ind: number) => (
      <Link
        key={`${rev}|${ind}`}
        href={`/objects/${rev}`}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        {n}
      </Link>
    );
    formattedContent = reactStringReplace(formattedContent, regExp, replacer);
  });
  return <Card content={formattedContent} />;
}

function Component() {
  const params = useParams();
  const computer = useContext(ComputerContext);
  const [txn, setTxn] = useState<string>(
    typeof params.txn === "string"
      ? decodeURIComponent(params.txn)
      : decodeURIComponent(params.txn?.[0] || "")
  );
  const [txnData, setTxnData] = useState<any | null>(null);
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null);
  const [transition, setTransition] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (computer) {
        setTxn(
          typeof params.txn === "string"
            ? decodeURIComponent(params.txn)
            : decodeURIComponent(params.txn?.[0] || "")
        );
        const [hex] = await computer.db.wallet.restClient.getRawTxs([
          params.txn as string,
        ]);
        const tx = Computer.txFromHex({ hex });
        setTxnData(tx);

        const { result } = await computer.rpc(
          "getrawtransaction",
          `${params.txn} 2`
        );
        setRPCTxnData(result);
      }
    };
    fetch();
  }, [computer, txn, params.txn]);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (txnData && computer) setTransition(await computer.decode(txnData));
      } catch (err) {
        if (err instanceof Error) {
          setTransition("");

          console.log("Error parsing transaction", err.message);
        }
      }
    };
    fetch();
  }, [computer, txnData, txn]);

  const envTable = (env: { [s: string]: string }) => (
    <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3 break-keep">
            Output
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(env).map(([name, output]) => (
          <tr
            key={output}
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
          >
            <td className="px-6 py-4 break-all">{name}</td>
            <td className="px-6 py-4">
              <Link
                href={`/objects/${output}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {output}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const transitionComponent = () => (
    <div>
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Expression</h2>
      <ExpressionCard content={transition.exp} env={transition.env} />

      <h2 className="mb-2 text-4xl font-bold dark:text-white">Environment</h2>
      {envTable(transition.env)}

      {transition.mod && (
        <>
          <h2 className="mb-2 text-4xl font-bold dark:text-white">
            Module Specifier
          </h2>
          <Card content={transition.mod} />
        </>
      )}
    </div>
  );

  const inputsComponent = () => (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Inputs</h2>

      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Transaction Id
            </th>
            <th scope="col" className="px-6 py-3 break-keep">
              Output Number
            </th>
            <th scope="col" className="px-6 py-3">
              Script
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vin?.map((input: any, ind: any) => (
            <tr
              key={`${input.txid}|${ind}`}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 break-all">
                <Link
                  href={`/transactions/${input.txid}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {input.txid}
                </Link>
              </td>

              <td className="px-6 py-4">
                <Link
                  href={`/objects/${input.txid}:${input.vout}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  #{input.vout}
                </Link>
              </td>

              <td className="px-6 py-4 break-all">{input.scriptSig?.asm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const outputsComponent = () => (
    <div className="relative overflow-x-auto">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Objects</h2>

      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Number
            </th>

            <th scope="col" className="px-6 py-3">
              Value
            </th>
            <th scope="col" className="px-6 py-3">
              Type
            </th>
            <th scope="col" className="px-6 py-3">
              Script PubKey
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vout?.map((output: any) => (
            <tr
              key={output.n}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 break-all">
                <Link
                  href={`/objects/${txn}:${output.n}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  #{output.n}
                </Link>
              </td>

              <td className="px-6 py-4">{output.value}</td>
              <td className="px-6 py-4">{output.scriptPubKey.type}</td>
              <td className="px-6 py-4 break-all">{output.scriptPubKey.asm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="pt-8">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">
          Transaction
        </h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {txn}
        </p>

        {transition && transitionComponent()}

        {rpcTxnData?.vin && inputsComponent()}

        {rpcTxnData?.vout && outputsComponent()}
      </div>
    </>
  );
}

export const Transaction = { Component };

```

# common-components\UtilsContext.tsx

```tsx
import React, { createContext, ReactNode, useContext, useState } from "react";
import { SnackBar } from "./SnackBar";
import { Loader } from "./Loader";

interface UtilsContextProps {
  showSnackBar: (message: string, success: boolean) => void;
  hideSnackBar: () => void;
  showLoader: (show: boolean) => void;
}

const utilsContext = createContext<UtilsContextProps | undefined>(undefined);

export const useUtilsComponents = (): UtilsContextProps => {
  const context = useContext(utilsContext);
  if (!context) {
    throw new Error("useUtilsComponents must be used within a UtilsProvider");
  }
  return context;
};

interface UtilsProviderProps {
  children: ReactNode; // Explicitly type children as ReactNode
}

export const UtilsProvider: React.FC<UtilsProviderProps> = ({ children }) => {
  const [snackBar, setSnackBar] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showSnackBar = (message: string, success: boolean) => {
    setSnackBar({ message, success });
  };

  const showLoader = (show: boolean) => {
    setIsLoading(show);
  };

  const hideSnackBar = () => {
    setSnackBar(null);
  };

  return (
    <utilsContext.Provider value={{ showSnackBar, hideSnackBar, showLoader }}>
      {children}
      {snackBar && (
        <SnackBar
          message={snackBar.message}
          success={snackBar.success}
          hideSnackBar={hideSnackBar}
        />
      )}
      {isLoading && <Loader />}
    </utilsContext.Provider>
  );
};

```

# common-components\Wallet.tsx

```tsx
import { useCallback, useContext, useEffect, useState } from "react";
import { HiRefresh } from "react-icons/hi";
import { FiCopy, FiCheck } from "react-icons/fi";
import { Computer } from "@bitcoin-computer/lib";
import { Auth } from "./Auth";
import { Drawer } from "./Drawer";
import { useUtilsComponents } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";
import { bigIntToStr } from "./common/utils";

const Balance = ({
  computer,
  modSpecs,
}: {
  computer: Computer;
  modSpecs: string[];
}) => {
  const [balance, setBalance] = useState<bigint>(0n);
  const [, setChain] = useState<string>(localStorage.getItem("CHAIN") || "LTC");
  const { showSnackBar, showLoader } = useUtilsComponents();

  const refreshBalance = useCallback(async () => {
    try {
      if (computer) {
        showLoader(true);
        const publicKey = computer.getPublicKey();
        const dust = computer.db.wallet.getDustThreshold(false);
        const balances: bigint[] = await Promise.all(
          modSpecs.map(async (mod) => {
            const paymentRevs = modSpecs
              ? await computer.getOUTXOs({ publicKey, mod })
              : [];
            const payments = (await Promise.all(
              paymentRevs.map((rev: string) => computer.sync(rev))
            )) as any[];
            return payments && payments.length
              ? payments.reduce(
                  (total, pay) => total + (pay._satoshis - BigInt(dust)),
                  0n
                )
              : 0;
          })
        );
        const amountsInPayments: bigint = balances.reduce(
          (acc, curr) => acc + BigInt(curr),
          0n
        );
        const walletBalance = await computer.getBalance();
        setBalance(walletBalance.balance + amountsInPayments);
        setChain(computer.getChain());
        showLoader(false);
      }
    } catch (err) {
      showLoader(false);
      showSnackBar(
        `${err instanceof Error ? err.message : "Error fetching wallet details"}`,
        false
      );
    }
  }, [computer]);

  const fund = async () => {
    await computer.faucet(1e8);
    setBalance((await computer.getBalance()).balance);
  };

  useEffect(() => {
    refreshBalance();
  }, []);

  return (
    <div
      id="dropdown-cta"
      className="relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900"
      role="alert"
    >
      <div className="text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400">
        {bigIntToStr(balance)} {computer.getChain()}{" "}
        <HiRefresh
          onClick={refreshBalance}
          className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
        />
      </div>
      <div className="text-center uppercase text-xs text-blue-800 dark:text-blue-400">
        {computer.getNetwork()}
      </div>
      {computer.getNetwork() === "regtest" && (
        <button
          id="fund-wallet"
          type="button"
          onClick={fund}
          className="absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
        >
          Fund
        </button>
      )}
    </div>
  );
};

const Address = ({ computer }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(computer.getAddress());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset icon color after 2 seconds
  };

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <h6 className="text-lg font-bold dark:text-white">Address</h6>
        <button
          onClick={handleCopy}
          className={`ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`}
          aria-label="Copy address"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
        {computer.getAddress()}
      </p>
    </div>
  );
};

const PublicKey = ({ computer }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(computer.getPublicKey());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset icon color after 2 seconds
  };

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <h6 className="text-lg font-bold dark:text-white">Public Key</h6>
        <button
          onClick={handleCopy}
          className={`ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`}
          aria-label="Copy public key"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
        {computer.getPublicKey()}
      </p>
    </div>
  );
};

const Mnemonic = ({ computer }: any) => {
  const [mnemonicShown, setMnemonicShown] = useState(false);
  return (
    <div className="mb-4">
      <h6 className="text-lg font-bold dark:text-white">
        Mnemonic&nbsp;
        <button
          onClick={() => setMnemonicShown(!mnemonicShown)}
          className="text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
        >
          {mnemonicShown ? "hide" : "show"}
        </button>
      </h6>
      <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
        {mnemonicShown ? computer.getMnemonic() : ""}
      </p>
    </div>
  );
};

const Url = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Node Url</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getUrl()}
    </p>
  </div>
);

const Chain = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Chain</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getChain()}
    </p>
  </div>
);

const Network = ({ computer }: any) => (
  <div className="mb-4">
    <h6 className="text-lg font-bold dark:text-white">Network</h6>
    <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
      {computer.getNetwork()}
    </p>
  </div>
);

const LogOut = () => (
  <>
    <div className="mb-6">
      <h6 className="text-lg font-bold dark:text-white">Log out</h6>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        Logging out will delete your mnemonic. Make sure to write it down.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={Auth.logout}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
      >
        Log out
      </button>
    </div>
  </>
);

export function Wallet({ modSpecs }: { modSpecs?: string[] }) {
  const computer = useContext(ComputerContext);
  const Content = () => (
    <>
      <h4 className="text-2xl font-bold dark:text-white">Wallet</h4>
      {!!computer && <Balance computer={computer} modSpecs={modSpecs || []} />}
      <Address computer={computer} />
      <PublicKey computer={computer} />
      <Mnemonic computer={computer} />
      {!process.env.CHAIN && <Chain computer={computer} />}
      {!process.env.NETWORK && <Network computer={computer} />}
      {!process.env.URL && <Url computer={computer} />}
      <hr className="h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" />
      <LogOut />
    </>
  );

  return <Drawer.Component Content={Content} id="wallet-drawer" />;
}

export const WalletComponents = {
  Balance,
  Address,
  PublicKey,
  Mnemonic,
  Chain,
  Network,
  Url,
  LogOut,
};

```

# components\bc\.babelrc

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

# components\bc\.eslintrc

```
{
  "parser": "@typescript-eslint/parser",
  "extends": ["airbnb-base", "prettier", "plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint"],
  "env": {
    "jest": true,
    "browser": true
  },
  "globals": {},
  "rules": {
    "semi": ["error", "never"],
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "lines-between-class-members": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-underscore-dangle": [
      "error",
      {
        "allowAfterThis": true,
        "allow": ["_readers", "_owners", "_satoshis", "_id", "_rev", "_root"]
      }
    ]
  }
}

```

# components\bc\.prettierrc

```
{
  "printWidth": 100,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}

```

# components\bc\eslint.config.js

```js
const js = require('@eslint/js')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')
const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  { ignores: ['dist', 'build'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // remove them later
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)

```

# components\bc\index.ts

```ts
/**
 * BC Components - Wrappers for bitcoin-computer components
 */

'use client'

// Only export the essential components that exist and work
export { UtilsProvider, UtilsContext } from './src/UtilsContext'
export { ComputerContext } from './src/ComputerContext'
export { Wallet } from './src/Wallet'

```

# components\bc\LEGAL.md

```md
# Legal Notice

**Summary**: This software is free to use and modify under the [MIT License](./LICENSE.md) for its source code. However, it includes patented technology that requires payment for use, facilitated through a cryptocurrency mechanism. You are responsible for complying with all applicable laws and bear full liability for your use of the software.

## Patent and Payment Notice

This software includes technology protected by US Patent Nos. 11694197 and 11188911. Using this patented technology, which forms a core part of the software’s functionality, requires payment through the software’s built-in cryptocurrency mechanism. The payment amount is determined automatically by the software, and the cryptocurrency used (e.g., BTC, LTC, DOGE) depends on the blockchain you select. For detailed payment instructions, please refer to the software's [documentation](https://github.com/bitcoin-computer/monorepo/blob/main/packages/docs/fees.md).

You may modify the software freely under the MIT License, but any use of the patented functionality, including in modified versions, requires compliance with these payment terms or obtaining an alternative license. Bypassing the payment mechanism while still using the patented technology may constitute patent infringement. For alternative licensing options, please contact clemens@bitcoincomputer.io.

You may use the software for free for testing purposes on testnet and regtest, as these environments use test coins with no real value. However, any use on mainnet or other production environments requires compliance with the payment terms outlined in this notice.

## Disclaimer Regarding User Modifications

**BCDB Does Not Endorse or Promote User Software Activity**. We are publishing certain portions of the Software, on an open-source basis, to demonstrate the utility of the Bitcoin Computer. As this Software is open-source, it may be modified and deployed for a wide range of uses that we may not have intended. We do not endorse or promote, and expressly disclaim liability for, any non-BCDB use or modification of the Software.

## Legal and Regulatory Compliance

**Sanctioned Users are Prohibited**. You may not access or use this software if you are (i) a resident of any country with which transactions or dealings are prohibited by governmental sanctions imposed by the U.S., the United Nations, the European Union, the United Kingdom, or any other applicable jurisdiction (collectively, “Sanctions Regimes”); (ii) a person, entity or government prohibited under an applicable Sanctions Regime (“Sanctioned Person”), including the Office of Foreign Assets Control, Specially Designated Nationals and Blocked Persons List; or (iii) prohibited from accessing or using the Software pursuant to the laws, rules, and regulations in the jurisdiction in which you reside or otherwise access and use the Software.

**Users Must Comply with Applicable Law**. You may only access or use the Software in compliance with laws, rules, and regulations in the jurisdiction in which you reside or otherwise access and use the Software, including, as applicable, Sanctions Regimes, anti-money laundering laws and regulations, and securities laws and regulations.

Additionally, you are solely responsible for ensuring that your cryptocurrency transactions comply with all applicable laws, including anti-money laundering and tax regulations in your jurisdiction.

## Liability Disclaimer and Indemnification

BCDB Inc. provides this software "as is," without any warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. BCDB Inc. shall not be liable for any direct, indirect, incidental, special, exemplary, or consequential damages resulting from your use or modification of the software.

By using this software, you agree to indemnify, defend, and hold harmless BCDB Inc. and its affiliates from any claims, damages, liabilities, or expenses (including attorneys’ fees and costs) arising from your use or modification of the software, including but not limited to violations of applicable laws or infringement of third-party rights.

## Intellectual Property

The patented technology is protected under US Patent Nos. 11694197 and 11188911. This patent applies in the United States only. If you are outside the US, you should review your local patent laws to understand any additional obligations.

## Contact Information

For questions, alternative licensing options, or further clarification, please contact clemens@bitcoincomputer.io.

```

# components\bc\LICENSE.md

```md
MIT License

Copyright (c) 2025 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**Note**: This license applies only to the copyright of the source code and documentation. For additional terms, including patent notices and payment requirements, see [LEGAL.md](./LEGAL.md).

```

# components\bc\package.json

```json
{
  "name": "@bitcoin-computer/components",
  "version": "0.26.0-beta.0",
  "description": "",
  "homepage": "http://bitcoincomputer.io/",
  "bugs": {
    "url": "https://github.com/bitcoin-computer/monorepo/issues"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/bitcoin-computer/monorepo/tree/main/packages/components"
  },
  "license": "MIT",
  "author": {
    "name": "Clemens Ley",
    "email": "clemens@bitcoincomputer.io",
    "url": "https://github.com/bitcoin-computer"
  },
  "contributors": [
    "Clemens Ley",
    "Laura Tardivo",
    "Vivek Singh"
  ],
  "main": "built/index.js",
  "types": "built/index.d.ts",
  "files": [
    "LICENSE.md",
    "LEGAL.md"
  ],
  "scripts": {
    "build": "npm run tsc:compile",
    "build:turbo": "turbo run build",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,scss,md}\"",
    "lint": "eslint --fix . --ext .ts,.tsx --ignore-pattern built/",
    "lint:fix": "eslint src --fix",
    "tsc:compile": "rm -rf built/* && tsc",
    "types": "tsc --noEmit"
  },
  "dependencies": {
    "@bitcoin-computer/lib": "^0.26.0-beta.0",
    "flowbite": "^2.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.2.1",
    "react-router-dom": "^6.23.1",
    "react-string-replace": "^1.1.1"
  },
  "devDependencies": {
    "@babel/preset-react": "^7.23.3",
    "@typescript-eslint/eslint-plugin": "^8.35.0",
    "vitest": "^2.0.5"
  }
}

```

# components\bc\README.md

```md
<div align="center">
  <h1>Bitcoin Computer Components</h1>
  <p>
    A component library for smart contract driven applications
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

This package contains components that are used in several applications. Have a look at the other packages for how to use.

Currently it contains the following:

- [Auth](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Auth.tsx) - Login and logout
- [Wallet](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Wallet.tsx) - Deposit cryptocurrency
- [Gallery](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Gallery.tsx) - displays a grid of smart objects
- [SmartObject](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/SmartObject.tsx) - displays a smart object and has a form for each of its methods
- [Transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Transaction.tsx) - displays a transaction including its Bitcoin Computer expression if it has one
- [Modal](https://github.com/bitcoin-computer/monorepo/blob/main/packages/components/src/Modal.tsx) - displays a modal window

## Use

To re-build the code run

\`\`\`js
npm run build
\`\`\`

To run lint run

\`\`\`js
npm run lint
\`\`\`

To run types run

\`\`\`js
npm run types
\`\`\`

</font>

You might have to restart the applications.

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.

```

# components\bc\src\ActionButtons.tsx

```tsx
import React, { useState } from 'react'

// Props interface for the button components
interface ActionButtonProps {
  text: string
  onClick: (...args: any[]) => Promise<void> | void
  disabled?: boolean
  className?: string
}

// Shared SVG loader component
const Loader = () => (
  <svg
    aria-hidden="true"
    role="status"
    className="inline w-4 h-4 ml-3 text-white animate-spin dark:text-gray-400"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentColor"
    />
  </svg>
)

// Primary Action Button (Blue button)
export const PrimaryActionButton = ({
  text,
  onClick,
  disabled = false,
  className = '',
}: ActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (...args: any[]) => {
    if (isLoading || disabled) return
    setIsLoading(true)
    try {
      await onClick(...args) // Handle both sync and async onClick
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed dark:disabled:bg-gray-600 dark:disabled:text-gray-300 ${className}`}
      onClick={handleClick}
      disabled={isLoading || disabled}
    >
      {text}
      {isLoading && <Loader />}
    </button>
  )
}

// Secondary Action Button (Gray/Alternative button)
export const SecondaryActionButton = ({
  text,
  onClick,
  disabled = false,
  className = '',
}: ActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (...args: any[]) => {
    if (isLoading || disabled) return
    setIsLoading(true)
    try {
      await onClick(...args) // Handle both sync and async onClick
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`py-2.5 px-5 me-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${className}`}
      onClick={handleClick}
      disabled={isLoading || disabled}
    >
      {text}
      {isLoading && <Loader />}
    </button>
  )
}

```

# components\bc\src\Auth.tsx

```tsx
import { Dispatch, useEffect, useRef, useState } from 'react'
import { Computer } from '@bitcoin-computer/lib'
import { initFlowbite } from 'flowbite'
import { HiRefresh } from 'react-icons/hi'
import { useUtilsComponents } from './UtilsContext'
import { Modal } from './Modal'
import type { Chain, Network, ModuleStorageType } from './common/types'
import { getEnv } from './common/utils'

export type TBCChain = 'LTC' | 'BTC' | 'PEPE' | 'DOGE'
export type TBCNetwork = 'testnet' | 'mainnet' | 'regtest'
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr'
const pathPattern = /^(m\/)?(\d+'?\/)*\d+'?$/

export type ComputerOptions = Partial<{
  chain: TBCChain
  mnemonic: string
  network: TBCNetwork
  passphrase: string
  path: string
  url: string
  satPerByte: number
  addressType: AddressType
  moduleStorageType: ModuleStorageType
  thresholdBytes: number
  mode: 'prod' | 'dev'
}>

function isLoggedIn(): boolean {
  return !!localStorage.getItem('BIP_39_KEY')
}

function logout() {
  localStorage.removeItem('BIP_39_KEY')
  localStorage.removeItem('CHAIN')
  localStorage.removeItem('NETWORK')
  localStorage.removeItem('PATH')
  localStorage.removeItem('URL')
  window.location.href = '/'
}

function getCoinType(chain: string = 'LTC', network: string = 'regtest'): number {
  if (['testnet', 'regtest'].includes(network)) return 1

  if (chain === 'BTC') return 0
  if (chain === 'LTC') return 2
  if (chain === 'DOGE') return 3
  if (chain === 'PEPE') return 3434
  if (chain === 'BCH') return 145

  throw new Error(`Unsupported chain ${chain} or network ${network}`)
}

function getBip44Path({ purpose = 44, coinType = 1, account = 0 } = {}) {
  return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`
}

function getPath({ chain, network }: { chain?: Chain; network?: Network }): string {
  return getBip44Path({ coinType: getCoinType(chain, network) })
}

function loggedOutConfiguration() {
  return {
    chain: getEnv('CHAIN') as Chain,
    network: getEnv('NETWORK') as Network,
    url: getEnv('URL'),
    path: getEnv('PATH'),
  }
}

function loggedInConfiguration() {
  return {
    mnemonic: localStorage.getItem('BIP_39_KEY'),
    chain: (localStorage.getItem('CHAIN') || getEnv('CHAIN')) as Chain,
    network: (localStorage.getItem('NETWORK') || getEnv('NETWORK')) as Network,
    url: localStorage.getItem('URL') || getEnv('URL'),
    path: localStorage.getItem('PATH') || getEnv('PATH'),
  }
}

function getComputer(options: ComputerOptions = {}): Computer {
  const defaultConfiguration = isLoggedIn() ? loggedInConfiguration() : loggedOutConfiguration()
  return new Computer({ ...defaultConfiguration, ...options })
}

function MnemonicInput({
  mnemonic,
  setMnemonic,
}: {
  mnemonic: string
  setMnemonic: Dispatch<string>
}) {
  return (
    <>
      <div className="flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          BIP 39 Mnemonic
        </label>
        <HiRefresh
          onClick={() => setMnemonic(new Computer().getMnemonic())}
          className="w-4 h-4 ml-2 text-sm font-medium text-gray-900 dark:text-white inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
        />
      </div>
      <input
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        required
      />
    </>
  )
}

function ChainInput({ chain, setChain }: { chain: Chain | undefined; setChain: Dispatch<Chain> }) {
  return (
    <>
      <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Chain
      </label>
      <fieldset className="flex">
        <legend className="sr-only">Chain</legend>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain('LTC')}
            checked={chain === 'LTC'}
            id="chain-ltc"
            type="radio"
            name="chain"
            value="LTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-ltc"
            className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            LTC
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain('BTC')}
            checked={chain === 'BTC'}
            id="chain-btc"
            type="radio"
            name="chain"
            value="BTC"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-btc"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            BTC
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain('PEPE')}
            id="chain-pepe"
            type="radio"
            name="chain"
            value="PEPE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="chain-pepe"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            PEPE
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setChain('DOGE')}
            id="chain-doge"
            type="radio"
            name="chain"
            value="DOGE"
            className="w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            disabled
          />
          <label
            htmlFor="chain-doge"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            DOGE
          </label>
        </div>
      </fieldset>
    </>
  )
}

function NetworkInput({
  network,
  setNetwork,
}: {
  network: Network | undefined
  setNetwork: Dispatch<Network>
}) {
  return (
    <>
      <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Network
      </label>
      <fieldset className="flex">
        <legend className="sr-only">Network</legend>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork('mainnet')}
            checked={network === 'mainnet'}
            id="network-mainnet"
            type="radio"
            name="network"
            value="Mainnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-mainnet"
            className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Mainnet
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork('testnet')}
            checked={network === 'testnet'}
            id="network-testnet"
            type="radio"
            name="network"
            value="Testnet"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-testnet"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Testnet
          </label>
        </div>

        <div className="flex items-center mr-4">
          <input
            onChange={() => setNetwork('regtest')}
            checked={network === 'regtest'}
            id="network-regtest"
            type="radio"
            name="network"
            value="Regtest"
            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="network-regtest"
            className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Regtest
          </label>
        </div>
      </fieldset>
    </>
  )
}

function UrlInput({ url, setUrl }: { url: string; setUrl: Dispatch<string> }) {
  return (
    <>
      <div className="mt-4 flex justify-between">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Node Url
        </label>
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      />
    </>
  )
}

function PathInput({ path, setPath }: { path: string; setPath: Dispatch<string> }) {
  return (
    <>
      <div className="flex justify-between">
        <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Path
        </label>
      </div>
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        required
      />
    </>
  )
}

function LoginButton({ mnemonic, chain, network, path, url, urlInputRef }: any) {
  const { showSnackBar } = useUtilsComponents()

  const login = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isLoggedIn()) {
      showSnackBar('A user is already logged in, please log out first.', false)
      return
    }
    if (mnemonic.length === 0) {
      showSnackBar("Please don't use an empty mnemonic string.", false)
      return
    }
    if (chain === undefined) {
      showSnackBar('Please select a chain.', false)
      return
    }
    if (network === undefined) {
      showSnackBar('Please select a network.', false)
      return
    }
    if (path.length === 0) {
      showSnackBar('Please enter a valid path.', false)
      return
    }
    if (path.match(pathPattern) === null) {
      showSnackBar("Path format must be in the form m/44'/0'/0'/0/0.", false)
      return
    }

    if (url === undefined || url?.length === 0) {
      showSnackBar('Please enter a valid URL.', false)
      return
    }
    if (isLoggedIn()) return

    localStorage.setItem('BIP_39_KEY', mnemonic)
    localStorage.setItem('CHAIN', chain)
    localStorage.setItem('NETWORK', network)
    localStorage.setItem('PATH', path)
    localStorage.setItem('URL', urlInputRef.current?.value || url)

    window.location.href = '/'
  }

  return (
    <>
      <button
        onClick={login}
        type="submit"
        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Log In
      </button>
      {/* {show && <SnackBar message={message} success={success} hideSnackBar={setShow} />} */}
    </>
  )
}

function LoginForm() {
  const [mnemonic, setMnemonic] = useState<string>(() => new Computer().getMnemonic())
  const [chain, setChain] = useState<Chain | undefined>(getEnv('CHAIN') as Chain | undefined)
  const [network, setNetwork] = useState<Network | undefined>(
    getEnv('NETWORK') as Network | undefined,
  )
  const [url, setUrl] = useState<string | undefined>(getEnv('URL') || 'http://localhost:1031')
  const urlInputRef = useRef<HTMLInputElement>(null)
  const [path, setPath] = useState<string>(getEnv('PATH') || getPath({ chain, network }))

  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <>
      <div className="max-w-sm mx-auto p-4 md:p-5 space-y-4">
        <form className="space-y-6">
          <div>
            <MnemonicInput mnemonic={mnemonic} setMnemonic={setMnemonic} />
            {!getEnv('CHAIN') && <ChainInput chain={chain} setChain={setChain} />}
            {!getEnv('NETWORK') && <NetworkInput network={network} setNetwork={setNetwork} />}
            {!getEnv('URL') && <UrlInput url={url || ''} setUrl={setUrl} />}
            {!getEnv('PATH') && <PathInput path={path} setPath={setPath} />}
          </div>
        </form>
      </div>
      <div className="max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <LoginButton
          mnemonic={mnemonic}
          chain={chain}
          network={network}
          url={url}
          path={path}
          urlInputRef={urlInputRef}
        />
      </div>
    </>
  )
}

function LoginModal() {
  return <Modal.Component title="Sign in" content={LoginForm} id="sign-in-modal" hideClose={true} />
}

export const Auth = {
  isLoggedIn,
  logout,
  getCoinType,
  getBip44Path,
  defaultConfiguration: loggedOutConfiguration,
  browserConfiguration: loggedInConfiguration,
  getComputer,
  LoginForm,
  LoginModal,
}

```

# components\bc\src\Card.tsx

```tsx
export function Card({ content, id }: any) {
  return (
    <div className="block mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <pre id={id ?? undefined} className="font-normal text-gray-700 dark:text-gray-400 text-xs">
        {content}
      </pre>
    </div>
  )
}

```

# components\bc\src\common\Components.tsx

```tsx
export function Loader() {
  return (
    <div className="grid place-items-center h-screen w-full top-0 left-0 fixed">
      <svg
        aria-hidden="true"
        className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  )
}

```

# components\bc\src\common\modSpecs.ts

```ts
const getEnvVar = (key: string): string => {
  // Use process.env for Next.js instead of import.meta.env (Vite) - Fixed for Next.js
  const value = process.env[key]
  if (value) return value
  return ''
}

export const VITE_WITHDRAW_MOD_SPEC: string = getEnvVar('NEXT_PUBLIC_WITHDRAW_MOD_SPEC')

```

# components\bc\src\common\SmartCallExecutionResult.tsx

```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function FunctionResultModalContent({ functionResult }: any) {
  const router = useRouter()

  if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult))
    return (
      <>
        <div id="smart-call-execution-success" className="p-4 md:p-5 dark:text-gray-400">
          You created an&nbsp;
          <Link
            id="smart-call-execution-counter-link"
            href={`/objects/${functionResult._rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              router.push(`/objects/${functionResult._rev}`)
              window.location.reload()
            }}
          >
            on chain object
          </Link>
          .
        </div>
      </>
    )

  if (functionResult._rev && functionResult.res.toString())
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        You created the value below at Revision {functionResult._rev}
        <pre>{functionResult.res.toString()}</pre>
      </p>
    )

  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
      {functionResult}
    </p>
  )
}

```

# components\bc\src\common\types.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'testnet' | 'mainnet' | 'regtest'
export type ModuleStorageType = 'taproot' | 'multisig'

```

# components\bc\src\common\TypeSelectionDropdown.tsx

```tsx
import { useEffect, useState } from 'react'
import {
  Dropdown,
  DropdownInterface,
  DropdownOptions,
  InstanceOptions,
  initFlowbite,
} from 'flowbite'

export const TypeSelectionDropdown = ({ id, onSelectMethod, dropdownList, selectedType }: any) => {
  const [dropDown, setDropdown] = useState<DropdownInterface>()
  const [type, setType] = useState(selectedType || 'Type')
  const [dropdownSelectionList] = useState(dropdownList)

  useEffect(() => {
    initFlowbite()
    const $targetEl: HTMLElement = document.getElementById(`dropdownMenu${id}`) as HTMLElement
    const $triggerEl: HTMLElement = document.getElementById(`dropdownButton${id}`) as HTMLElement
    const options: DropdownOptions = {
      placement: 'bottom',
      triggerType: 'click',
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
    }
    const instanceOptions: InstanceOptions = {
      id: `dropdownMenu${id}`,
      override: true,
    }
    setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions))
  }, [id])

  const handleClick = (clickType: string) => {
    setType(clickType)
    onSelectMethod(clickType)
    if (dropDown) dropDown.hide()
  }

  return (
    <>
      <button
        id={`dropdownButton${id}`}
        data-dropdown-toggle={`dropdownMenu${id}`}
        className="flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button"
      >
        {type}
        <svg
          className="w-2.5 h-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          ></path>
        </svg>
      </button>

      <div
        id={`dropdownMenu${id}`}
        className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby={`dropdownButton${id}`}
        >
          {dropdownSelectionList.map((option: string, index: number) => (
            <li key={index}>
              <span
                onClick={() => {
                  handleClick(option)
                }}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {option}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

```

# components\bc\src\common\utils.ts

```ts
type Json = JBasic | JObject | JArray
type JBasic = undefined | null | boolean | number | string | symbol | bigint
type JArray = Json[]
type JObject = { [x: string]: Json }

const isJUndefined = (a: any): a is undefined => typeof a === 'undefined'
const isJNull = (a: any): a is null => a === null
const isJBoolean = (a: any): a is boolean => typeof a === 'boolean'
const isJNumber = (a: any): a is number => typeof a === 'number'
const isJString = (a: any): a is string => typeof a === 'string'
const isJSymbol = (a: any): a is symbol => typeof a === 'symbol'
const isJBigInt = (a: any): a is bigint => typeof a === 'bigint'
const isJBasic = (a: any): a is JBasic =>
  isJNull(a) ||
  isJUndefined(a) ||
  isJNumber(a) ||
  isJString(a) ||
  isJBoolean(a) ||
  isJSymbol(a) ||
  isJBigInt(a)
const isJObject = (a: any): a is JObject => !isJBasic(a) && !Array.isArray(a)
const isJArray = (a: any): a is JArray => !isJBasic(a) && Array.isArray(a)

const objectEntryMap =
  (g: (el: [string, Json]) => [string, Json]) =>
  (object: JObject): JObject =>
    Object.fromEntries(Object.entries(object).map(g))

const objectMap =
  (f: (el: Json) => Json) =>
  (object: JObject): JObject =>
    objectEntryMap(([key, value]) => [key, f(value)])(object)

export const jsonMap =
  (g: (el: Json) => Json) =>
  (json: Json): Json => {
    if (isJBasic(json)) return g(json)
    if (isJArray(json)) return g(json.map(jsonMap(g)))
    if (isJObject(json)) return g(objectMap(jsonMap(g))(json))
    throw new Error('Unsupported type')
  }

export const strip = (value: Json): Json => {
  if (isJBasic(value)) return value
  if (isJArray(value)) return value.map(strip)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, _root, _rev, _satoshis, _owners, ...rest } = value
  return rest
}

// https://github.com/GoogleChromeLabs/jsbi/issues/30
export const toObject = (obj: any) =>
  JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export function isValidRevString(outId: string): boolean {
  return /^[0-9A-Fa-f]{64}:\d+$/.test(outId)
}

export function isValidRev(value: string | number | boolean | null | undefined): boolean {
  return typeof value === 'string' && isValidRevString(value)
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export function getEnv(name: string) {
  return (
    (typeof process !== 'undefined' && process.env[`REACT_APP_${name}`]) ||
    (typeof process !== 'undefined' && process.env[`NEXT_PUBLIC_${name}`]) ||
    (typeof process !== 'undefined' && process.env[`VITE_${name}`]) ||
    ''
  )
}

export function bigIntToStr(a: bigint): string {
  if (a < 0n) throw new Error('Balance must be a non-negative')

  const scale = BigInt(1e8)
  const integerPart = (a / scale).toString()
  const fractionalPart = (a % scale).toString().padStart(8, '0').replace(/0+$/, '')
  return `${integerPart}.${fractionalPart || '0'}`
}

export function strToBigInt(a: string): bigint {
  // Validate number contains at most one dot and is not empty
  if ((a.match(/\./g) || []).length > 1 || a === '.' || a === '') {
    throw new Error('Invalid number')
  }

  const [integerPart, fractionalPart = ''] = a.split('.')

  // Validate integer and fractional part contains only digits (or is empty)
  if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error('Invalid number')
  }

  const paddedFractionalPart = fractionalPart.padEnd(8, '0').slice(0, 8)
  const totalSatoshisStr = integerPart + paddedFractionalPart

  return BigInt(totalSatoshisStr)
}

```

# components\bc\src\ComputerContext.tsx

```tsx
import { Computer } from '@bitcoin-computer/lib'
import { createContext } from 'react'

export const ComputerContext = createContext(new Computer())

```

# components\bc\src\Drawer.tsx

```tsx
import { useState, useEffect, useRef } from 'react'

export function ShowDrawer({ text, id }: { text: string; id: string }) {
  return (
    <button
      data-drawer-target={id}
      data-drawer-show={id}
      data-drawer-placement="right"
      aria-controls={id}
    >
      {text}
    </button>
  )
}

export function DrawerComponent({
  Content,
  id,
}: {
  Content: (props: { isOpen: boolean }) => JSX.Element
  id: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const drawerElement = drawerRef.current
    if (drawerElement) {
      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName === 'transform')
          setIsOpen(!drawerElement.classList.contains('translate-x-full'))
      }

      drawerElement.addEventListener('transitionend', onTransitionEnd as EventListener)

      return () => {
        drawerElement.removeEventListener('transitionend', onTransitionEnd as EventListener)
      }
    }
    return undefined
  }, [])

  return (
    <div
      ref={drawerRef}
      id={id}
      className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform duration-300 translate-x-full bg-white w-80 dark:bg-gray-800"
      tabIndex={-1}
      aria-labelledby="drawer-right-label"
    >
      <button
        type="button"
        data-drawer-hide={id}
        aria-controls={id}
        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      {Content({ isOpen })}
    </div>
  )
}

export const Drawer = {
  Component: DrawerComponent,
  ShowDrawer,
}

```

# components\bc\src\Error404.tsx

```tsx
export const Error404 = ({ message: m }: { message?: string }) => {
  const Missing = () => (
    <>
      <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600">
        404
      </h1>
      <p className="mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white">
        Something's missing.
      </p>
      <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
        Sorry, we can't find that page. You'll find lots to explore on the home page.{' '}
      </p>
      <a
        href="/"
        className="inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4"
      >
        Back to Homepage
      </a>
    </>
  )

  const Err = ({ message }: { message: string }) => (
    <>
      <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600">
        400
      </h1>
      <p className="mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white">
        Something went wrong.
      </p>
      <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{message}</p>
    </>
  )

  return (
    <section className="w-full bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          {m ? <Err message={m} /> : <Missing />}
        </div>
      </div>
    </section>
  )
}

```

# components\bc\src\Gallery.tsx

```tsx
import { Computer } from '@bitcoin-computer/lib'
import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { initFlowbite } from 'flowbite'
import { jsonMap, strip, toObject } from './common/utils'
import { useUtilsComponents } from './UtilsContext'
import { ComputerContext } from './ComputerContext'

export type Class = new (...args: any) => any

export type UserQuery<T extends Class> = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
  contract: {
    class: T
    args?: ConstructorParameters<T>
  }
}>

function HomePageCard({ content }: any) {
  return (
    <div className="block w-72 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <pre className="font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs">
        {content()}
      </pre>
    </div>
  )
}

function ValueComponent({ rev, computer }: { rev: string; computer: Computer }) {
  const [value, setValue] = useState<any>('loading...')
  const [errorMsg, setMsgError] = useState('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced: any = await computer.sync(rev)
        setValue(toObject(jsonMap(strip)(synced)))
      } catch (err) {
        if (err instanceof Error) setMsgError(`Error: ${err.message}`)
      }
      setLoading(false)
    }
    fetch()
  }, [computer, rev])

  const loadingContent = () => (
    <>
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="#1C64F2"
        />
      </svg>
      <span className="loading-smart-contract-span">&nbsp;Loading...</span>
    </>
  )

  return loading ? (
    <HomePageCard content={loadingContent} />
  ) : (
    <HomePageCard content={() => errorMsg || value} />
  )
}

function FromRevs({ revs, computer }: { revs: string[]; computer: any }) {
  return (
    <div className="flex flex-wrap flex-col max-h-[75vh] gap-4 mb-4 mt-4">
      {revs.map((rev) => (
        <div key={rev}>
          <Link
            href={`/objects/${rev}`}
            className="block font-medium text-blue-600 dark:text-blue-500"
          >
            <ValueComponent rev={rev} computer={computer} />
          </Link>
        </div>
      ))}
    </div>
  )
}

function Pagination({ isPrevAvailable, handlePrev, isNextAvailable, handleNext }: any) {
  return (
    <nav className="flex items-center justify-between" aria-label="Table navigation">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            disabled={!isPrevAvailable}
            onClick={handlePrev}
            className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
          </button>
        </li>
        <li>
          <button
            disabled={!isNextAvailable}
            onClick={handleNext}
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export function GalleryWithPagination<T extends Class>(q: UserQuery<T>) {
  const contractsPerPage = 12
  const computer = useContext(ComputerContext)
  const { showLoader } = useUtilsComponents()
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0)
  const [showNoAsset, setShowNoAsset] = useState(false)
  const [revs, setRevs] = useState<string[]>([])
  const params = {}

  useEffect(() => {
    initFlowbite()
  }, [])

  useEffect(() => {
    const fetch = async () => {
      showLoader(true)
      const query = { ...q, ...params }
      query.offset = contractsPerPage * pageNum
      query.limit = contractsPerPage + 1
      query.order = 'DESC'
      const result = await computer.getOUTXOs(query)
      setIsNextAvailable(result.length > contractsPerPage)
      setRevs(result.slice(0, contractsPerPage))
      if (pageNum === 0 && result?.length === 0) setShowNoAsset(true)
      showLoader(false)
    }
    fetch()
  }, [computer, pageNum])

  const handleNext = async () => {
    setIsPrevAvailable(true)
    setPageNum(pageNum + 1)
  }

  const handlePrev = async () => {
    setIsNextAvailable(true)
    if (pageNum - 1 === 0) setIsPrevAvailable(false)
    setPageNum(pageNum - 1)
  }

  return (
    <div className="relative sm:rounded-lg pt-4 w-full">
      <FromRevs revs={revs} computer={computer} />
      {!(pageNum === 0 && revs && revs.length === 0) && (
        <Pagination
          revs={revs}
          isPrevAvailable={isPrevAvailable}
          handlePrev={handlePrev}
          isNextAvailable={isNextAvailable}
          handleNext={handleNext}
        />
      )}
      {pageNum === 0 && revs && revs.length === 0 && showNoAsset && (
        <h1 className="w-full mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white text-center mx-auto">
          No Assets
        </h1>
      )}
    </div>
  )
}

export const Gallery = {
  FromRevs,
  WithPagination: GalleryWithPagination,
}

```

# components\bc\src\index.tsx

```tsx
export { SnackBar } from './SnackBar'
export { Auth } from './Auth'
export {
  Modal,
  getModal,
  showModal,
  hideModal,
  toggleModal,
  ShowModalButton,
  HideModalButton,
  ToggleModalButton,
  ModalComponent,
} from './Modal'
export { Gallery, GalleryWithPagination } from './Gallery'
export { SmartObject } from './SmartObject'
export { Transaction, TransactionComponent } from './Transaction'
export { Error404 } from './Error404'
export { UtilsContext, UtilsProvider, useUtilsComponents } from './UtilsContext'
export { ComputerContext } from './ComputerContext'
export { FunctionResultModalContent } from './common/SmartCallExecutionResult'
export { Drawer, DrawerComponent, ShowDrawer } from './Drawer'
export { Wallet } from './Wallet'
export { Card } from './Card'
export * from './common/utils'
export { PrimaryActionButton, SecondaryActionButton } from './ActionButtons'

```

# components\bc\src\Loader.tsx

```tsx
export function Loader() {
  return (
    <div className="grid place-items-center h-screen w-full top-0 left-0 fixed z-50">
      <svg
        aria-hidden="true"
        className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  )
}

```

# components\bc\src\Modal.tsx

```tsx
import { Modal as ModalClass } from 'flowbite'
import type { ModalOptions, InstanceOptions } from 'flowbite'

export const getModal = (id: string) => {
  const $modalElement = document.querySelector(`#${id}`) as HTMLElement
  const modalOptions: ModalOptions = {}
  const instanceOptions: InstanceOptions = { id, override: true }
  return new ModalClass($modalElement, modalOptions, instanceOptions)
}

export const showModal = (id: string) => {
  getModal(id).show()
}

export const hideModal = (id: string, onClickClose?: () => void) => {
  getModal(id).hide()
  if (onClickClose) {
    onClickClose()
  }
}

export const toggleModal = (id: string) => {
  getModal(id).toggle()
}

export const ShowModalButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-show={id} type="button">
    {text}
  </button>
)

export const HideModalButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-hide={id} type="button">
    {text}
  </button>
)

export const ToggleModalButton = ({ id, text }: any) => (
  <button data-modal-target={id} data-modal-toggle={id} type="button">
    {text}
  </button>
)

export const ModalComponent = ({
  title,
  content,
  contentData,
  id,
  onClickClose,
  hideClose,
}: {
  title: string
  content: any
  id: string
  contentData?: any
  onClickClose?: () => void
  hideClose?: boolean
}) => (
  <div
    id={id}
    tabIndex={-1}
    aria-hidden="true"
    style={{ zIndex: 45 }}
    className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div className="relative p-4 w-full max-w-sm max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          {!hideClose ? (
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide={id}
              data-modal-target={id}
              onClick={() => hideModal(id, onClickClose)}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          ) : (
            <></>
          )}
        </div>
        {content(contentData)}
      </div>
    </div>
  </div>
)

export const Modal = {
  get: getModal,
  showModal,
  hideModal,
  toggleModal,
  ShowButton: ShowModalButton,
  HideButton: HideModalButton,
  ToggleButton: ToggleModalButton,
  Component: ModalComponent,
}

```

# components\bc\src\SmartObject.tsx

```tsx
import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import reactStringReplace from 'react-string-replace'
import { HiOutlineClipboard } from 'react-icons/hi'
import { capitalizeFirstLetter, toObject } from './common/utils'
import { Card } from './Card'
import { Modal } from './Modal'
import { FunctionResultModalContent } from './common/SmartCallExecutionResult'
import { SmartObjectFunctions } from './SmartObjectFunctions'
import { ComputerContext } from './ComputerContext'

const keywords = ['_id', '_rev', '_owners', '_root', '_satoshis']
const modalId = 'smart-object-info-modal'

export const getFnParamNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
}

function Copy({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="cursor-pointer pl-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      aria-label="Copy Transaction ID"
    >
      <HiOutlineClipboard />
    </button>
  )
}

function ObjectValueCard({ content, id }: { content: string; id?: string }) {
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
  const revLink = (rev: string, i: number) => (
    <Link
      key={i}
      href={`/objects/${rev}`}
      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {rev}
    </Link>
  )
  const formattedContent = reactStringReplace(content, isRev, revLink)

  return <Card content={formattedContent} id={`property-${id}-value`} />
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>
  return (
    <>
      {Object.entries(smartObject)
        .filter(([k]) => !keywords.includes(k))
        .map(([key, value], i) => (
          <div key={i}>
            <h3 className="mt-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
            <ObjectValueCard id={key} content={toObject(value)} />
          </div>
        ))}
    </>
  )
}

function MetaData({ smartObject, prev, next }: any) {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  return (
    <div>
      <div className="pt-6 pb-6 space-y-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex">
          <Link
            href={prev ? `/objects/${prev}` : '#'}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition
      ${
        prev
          ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
      }`}
            aria-disabled={!prev}
          >
            Previous
          </Link>
          <Link
            href={next ? `/objects/${next}` : '#'}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition
      ${
        next
          ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
      }`}
            aria-disabled={!next}
          >
            Next
          </Link>
          <button
            onClick={toggleVisibility}
            className={`flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700`}
          >
            {isVisible ? 'Hide Metadata' : 'Show Metadata'}
          </button>
        </div>
      </div>

      {isVisible && (
        <table className="w-full mt-4 mb-8 text-[12px] text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-2">
                Key
              </th>
              <th scope="col" className="px-4 py-2">
                Short
              </th>
              <th scope="col" className="px-4 py-2">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Identity</td>
              <td className="px-4 py-2">
                <pre>_id</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/objects/${smartObject?._id}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._id}
                </Link>
                <Copy text={smartObject?._id} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Revision</td>
              <td className="px-4 py-2">
                <pre>_rev</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/objects/${smartObject?._rev}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._rev}
                </Link>
                <Copy text={smartObject?._rev} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Root</td>
              <td className="px-4 py-2">
                <pre>_root</pre>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/objects/${smartObject?._root}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {smartObject?._root}
                </Link>
                <Copy text={smartObject?._root} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Owners</td>
              <td className="px-4 py-2">
                <pre>_owners</pre>
              </td>
              <td className="px-4 py-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject?._owners}
                </span>
                <Copy text={JSON.stringify(smartObject?._owners)} />
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-4 py-2">Amount</td>
              <td className="px-4 py-2">
                <pre>_satoshis</pre>
              </td>
              <td className="px-4 py-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {smartObject?._satoshis.toString()}
                </span>
                <Copy text={smartObject?._satoshis.toString()} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

function Component({ title }: { title?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const [rev] = useState(params.rev || '')
  const computer = useContext(ComputerContext)
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [next, setNext] = useState<string | undefined>(undefined)
  const [prev, setPrev] = useState<string | undefined>(undefined)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol']

  const [modalTitle, setModalTitle] = useState('')

  const setShow: any = (flag: boolean) => {
    if (flag) {
      Modal.get(modalId).show()
    } else {
      Modal.get(modalId).hide()
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const [o, p, n] = await Promise.all([
          computer.sync(rev),
          computer.prev(rev),
          computer.next(rev),
        ])

        setSmartObject(o)
        setPrev(p)
        setNext(n)
      } catch (err) {
        if (err instanceof Error) console.log('Error syncing to object:', err.message)
        const [txId] = rev.split(':')
        router.push(`/transactions/${txId}`)
      }
    }
    fetch()
  }, [computer, rev, pathname, router])

  useEffect(() => {
    let funcExist = false
    if (smartObject) {
      const filteredSmartObject = Object.getOwnPropertyNames(
        Object.getPrototypeOf(smartObject),
      ).filter(
        (key) =>
          key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function',
      )

      Object.keys(filteredSmartObject).forEach((key) => {
        if (key) {
          funcExist = true
        }
      })
    }
    setFunctionsExist(funcExist)
  }, [smartObject])

  const [txId, outNum] = rev.split(':')

  return (
    <>
      <div className="max-w-screen-md mx-auto">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">{title || 'Object'}</h1>
        <div className="mb-8">
          <Link
            href={`/transactions/${txId}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {txId}
          </Link>
          <span>:{outNum}</span>
          <Copy text={`${txId}:${outNum}`} />
        </div>

        <SmartObjectValues smartObject={smartObject} />

        <SmartObjectFunctions
          smartObject={smartObject}
          functionsExist={functionsExist}
          options={options}
          setFunctionResult={setFunctionResult}
          setShow={setShow}
          setModalTitle={setModalTitle}
        />

        <MetaData smartObject={smartObject} prev={prev} next={next} />
      </div>
      <Modal.Component
        title={modalTitle}
        content={FunctionResultModalContent}
        contentData={{ functionResult }}
        id={modalId}
      />
    </>
  )
}

export const SmartObject = {
  Component,
}

```

# components\bc\src\SmartObjectFunction.tsx

```tsx
import { useContext, useMemo, useState } from 'react'
import { TypeSelectionDropdown } from './common/TypeSelectionDropdown'
import { isValidRev, sleep } from './common/utils'
import { UtilsContext } from './UtilsContext'
import { ComputerContext } from './ComputerContext'

export const getErrorMessage = (error: any): string => {
  if (
    error?.response?.data?.error ===
    'mandatory-script-verify-flag-failed (Operation not valid with the current stack size)'
  )
    return 'You are not authorized to make changes to this smart object'
  if (error?.response?.data?.error) return error?.response?.data?.error
  return error.message ? error.message : 'Error occurred'
}

const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
    case 'number':
      return Number(stringValue)
    case 'string':
      return stringValue
    case 'boolean':
      return stringValue === 'true'
    case 'undefined':
      return undefined
    case 'null':
      return null
    case 'object':
      return stringValue
    default:
      return Number(stringValue)
  }
}

export const getParameterNames = (fn: string) => {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : []
}

const getParameters = (params: string[], fnName: string, formState: any) =>
  params.map((param) => {
    const key = `${fnName}-${param}`
    const paramValue = getValueForType(formState[`${key}--types`], formState[key])

    if (isValidRev(paramValue)) return param
    if (typeof paramValue === 'string') return `'${paramValue}'`
    return paramValue
  })

export const SmartObjectFunction = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
  funcName,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
  setFunctionResult: React.Dispatch<any>
  setShow: any
  setModalTitle: React.Dispatch<React.SetStateAction<string>>
  funcName: string
}) => {
  const parameterList = getParameterNames(Object.getPrototypeOf(smartObject)[funcName]).filter(
    (val) => val,
  )
  const [formState, setFormState] = useState<any>(
    Object.fromEntries(
      parameterList.flatMap((key) => [
        [`${funcName}-${key}`, ''],
        [`${funcName}-${key}--types`, ''],
      ]),
    ),
  )
  const { showLoader } = UtilsContext.useUtilsComponents()
  const computer = useContext(ComputerContext)

  const handleMethodCall = async (event: any, smartObj: any, fnName: string, params: string[]) => {
    event.preventDefault()
    showLoader(true)
    try {
      const revMap: any = {}

      // Create Rev Map to pass smart objects as params
      params.forEach((param) => {
        const key = `${fnName}-${param}`
        const paramValue = getValueForType(formState[`${key}--types`], formState[key])
        if (isValidRev(paramValue)) {
          revMap[param] = paramValue
        }
      })

      const { tx } = await computer.encode({
        exp: `smartObject.${fnName}(${getParameters(params, fnName, formState)})`,
        env: { smartObject: smartObj._rev, ...revMap },
      })

      await computer.broadcast(tx!)
      await sleep(1000)
      const rev = await computer.getLatestRev(smartObject._id)
      setFunctionResult({ _rev: rev })
      setModalTitle('Success')
      setShow(true)
    } catch (error: any) {
      setFunctionResult(getErrorMessage(error))
      setModalTitle('Error!')
      setShow(true)
    } finally {
      showLoader(false)
    }
  }

  const updateForm = (e: any, key: string) => {
    e.preventDefault()
    const value = { ...formState }
    value[key] = e.target.value
    setFormState(value)
  }

  const updateTypes = (option: string, key: string) => {
    const value = { ...formState }
    value[`${key}--types`] = option
    setFormState(value)
  }

  const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const isDisabled = useMemo(
    () =>
      Object.keys(formState).length > 0 && Object.values(formState).some((value) => value === ''),
    [formState],
  )

  if (!functionsExist) return <></>
  return (
    <>
      <div className="mt-6 mb-6" id={`function-${funcName}`}>
        <h3 className="my-2 text-xl font-bold dark:text-white">
          {capitalizeFirstLetter(funcName)}
        </h3>
        <form>
          {parameterList.map((paramName, paramIndex) => (
            <div key={paramIndex} className="mb-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  id={`${funcName}-${paramName}`}
                  value={formState[`${funcName}-${paramName}`] || ''}
                  onChange={(e) => updateForm(e, `${funcName}-${paramName}`)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder={paramName}
                  required
                />
                <TypeSelectionDropdown
                  id={`${funcName}${paramName}`}
                  dropdownList={options}
                  onSelectMethod={(option: string) =>
                    updateTypes(option, `${funcName}-${paramName}`)
                  }
                />
              </div>
            </div>
          ))}
          <button
            id={`${funcName}-call-function-button`}
            disabled={isDisabled}
            className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:ring-4 focus:outline-none
              ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'}
            `}
            onClick={(evt) => handleMethodCall(evt, smartObject, funcName, parameterList)}
          >
            Call Function
          </button>
        </form>
      </div>
    </>
  )
}

```

# components\bc\src\SmartObjectFunctions.tsx

```tsx
import { SmartObjectFunction } from './SmartObjectFunction'

export const SmartObjectFunctions = ({
  smartObject,
  functionsExist,
  options,
  setFunctionResult,
  setShow,
  setModalTitle,
}: {
  smartObject: any
  functionsExist: boolean
  options: string[]
  setFunctionResult: React.Dispatch<any>
  setShow: any
  setModalTitle: React.Dispatch<React.SetStateAction<string>>
}) => {
  if (!functionsExist) return <></>
  return (
    <>
      {Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
        .filter(
          (key) =>
            key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function',
        )
        .map((key, fnIndex) => (
            <div key={fnIndex}>
              <SmartObjectFunction
                funcName={key}
                smartObject={smartObject}
                functionsExist={functionsExist}
                options={options}
                setFunctionResult={setFunctionResult}
                setShow={setShow}
                setModalTitle={setModalTitle}
              ></SmartObjectFunction>
            </div>
          ))}
    </>
  )
}

```

# components\bc\src\SnackBar.tsx

```tsx
import { useEffect } from 'react'

interface SnackBarProps {
  message: string
  success: boolean
  hideSnackBar: () => void
}

export function SnackBar(props: SnackBarProps) {
  const { message, success, hideSnackBar } = props

  const closeMessage = (evt: any) => {
    evt.preventDefault()
    hideSnackBar()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      hideSnackBar()
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [hideSnackBar])

  return (
    <div
      className={
        success
          ? `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
          : `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
      }
      role="alert"
    >
      <strong className="font-bold pr-6">{message}</strong>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={closeMessage}>
        <svg
          className={
            success ? `fill-current h-6 w-6 text-green-500` : `fill-current h-6 w-6 text-red-500`
          }
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  )
}

```

# components\bc\src\Transaction.tsx

```tsx
import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useParams } from 'next/navigation'
import reactStringReplace from 'react-string-replace'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { Card } from './Card'
import { ComputerContext } from './ComputerContext'

function ExpressionCard({ content, env }: { content: string; env: { [s: string]: string } }) {
  const entries = Object.entries(env)
  let formattedContent = content as any
  entries.forEach((entry) => {
    const [name, rev] = entry
    const regExp = new RegExp(`(${name})`, 'g')
    const replacer = (n: string, ind: number) => (
      <Link
        key={`${rev}|${ind}`}
        to={`/objects/${rev}`}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        {n}
      </Link>
    )
    formattedContent = reactStringReplace(formattedContent, regExp, replacer)
  })
  return <Card content={formattedContent} />
}

export function TransactionComponent() {
  const location = useLocation()
  const params = useParams()
  const computer = useContext(ComputerContext)
  const [txn, setTxn] = useState(params.txn)
  const [txnData, setTxnData] = useState<any | null>(null)
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null)
  const [transition, setTransition] = useState<any | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setTxn(params.txn)
      const [hex] = await computer.db.wallet.restClient.getRawTxs([params.txn as string])
      const tx = BCTransaction.fromHex(hex)
      setTxnData(tx)

      const { result } = await computer.rpcCall('getrawtransaction', `${params.txn} 2`)
      setRPCTxnData(result)
    }
    fetch()
  }, [computer, txn, location, params.txn])

  useEffect(() => {
    const fetch = async () => {
      try {
        if (txnData) setTransition(await computer.decode(txnData))
      } catch (err) {
        if (err instanceof Error) {
          setTransition('')

          console.log('Error parsing transaction', err.message)
        }
      }
    }
    fetch()
  }, [computer, txnData, txn])

  const envTable = (env: { [s: string]: string }) => (
    <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3 break-keep">
            Output
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(env).map(([name, output]) => (
          <tr key={output} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4 break-all">{name}</td>
            <td className="px-6 py-4">
              <Link
                to={`/objects/${output}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {output}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const transitionComponent = () => (
    <div>
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Expression</h2>
      <ExpressionCard content={transition.exp} env={transition.env} />

      <h2 className="mb-2 text-4xl font-bold dark:text-white">Environment</h2>
      {envTable(transition.env)}

      {transition.mod && (
        <>
          <h2 className="mb-2 text-4xl font-bold dark:text-white">Module Specifier</h2>
          <Card content={transition.mod} />
        </>
      )}
    </div>
  )

  const inputsComponent = () => (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Inputs</h2>

      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Transaction Id
            </th>
            <th scope="col" className="px-6 py-3 break-keep">
              Output Number
            </th>
            <th scope="col" className="px-6 py-3">
              Script
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vin?.map((input: any, ind: any) => (
            <tr
              key={`${input.txid}|${ind}`}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 break-all">
                <Link
                  to={`/transactions/${input.txid}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {input.txid}
                </Link>
              </td>

              <td className="px-6 py-4">
                <Link
                  to={`/objects/${input.txid}:${input.vout}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  #{input.vout}
                </Link>
              </td>

              <td className="px-6 py-4 break-all">{input.scriptSig?.asm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const outputsComponent = () => (
    <div className="relative overflow-x-auto">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Objects</h2>

      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Number
            </th>

            <th scope="col" className="px-6 py-3">
              Value
            </th>
            <th scope="col" className="px-6 py-3">
              Type
            </th>
            <th scope="col" className="px-6 py-3">
              Script PubKey
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vout?.map((output: any) => (
            <tr key={output.n} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4 break-all">
                <Link
                  to={`/objects/${txn}:${output.n}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  #{output.n}
                </Link>
              </td>

              <td className="px-6 py-4">{output.value}</td>
              <td className="px-6 py-4">{output.scriptPubKey.type}</td>
              <td className="px-6 py-4 break-all">{output.scriptPubKey.asm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <div className="pt-8">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Transaction</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {txn}
        </p>

        {transition && transitionComponent()}

        {rpcTxnData?.vin && inputsComponent()}

        {rpcTxnData?.vout && outputsComponent()}
      </div>
    </>
  )
}

export const Transaction = { Component: TransactionComponent }

```

# components\bc\src\UtilsContext.tsx

```tsx
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { SnackBar } from './SnackBar'
import { Loader } from './Loader'

interface UtilsContextProps {
  showSnackBar: (message: string, success: boolean) => void
  hideSnackBar: () => void
  showLoader: (show: boolean) => void
}

const utilsContext = createContext<UtilsContextProps | undefined>(undefined)

export const useUtilsComponents = (): UtilsContextProps => {
  const context = useContext(utilsContext)
  if (!context) throw new Error('useUtilsComponents must be used within a UtilsProvider')
  return context
}

interface UtilsProviderProps {
  children: ReactNode // Explicitly type children as ReactNode
}

export const UtilsProvider: React.FC<UtilsProviderProps> = ({ children }) => {
  const [snackBar, setSnackBar] = useState<{ message: string; success: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const showSnackBar = (message: string, success: boolean) => {
    setSnackBar({ message, success })
  }

  const showLoader = (show: boolean) => {
    setIsLoading(show)
  }

  const hideSnackBar = () => {
    setSnackBar(null)
  }

  return (
    <utilsContext.Provider value={{ showSnackBar, hideSnackBar, showLoader }}>
      {children}
      {snackBar && (
        <SnackBar
          message={snackBar.message}
          success={snackBar.success}
          hideSnackBar={hideSnackBar}
        />
      )}
      {isLoading && <Loader />}
    </utilsContext.Provider>
  )
}

export const UtilsContext = {
  UtilsProvider,
  useUtilsComponents,
}

```

# components\bc\src\Wallet.tsx

```tsx
import { useCallback, useContext, useEffect, useState } from 'react'
import { HiRefresh } from 'react-icons/hi'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { Computer } from '@bitcoin-computer/lib'
import { Auth } from './Auth'
import { Drawer } from './Drawer'
import { UtilsContext } from './UtilsContext'
import { ComputerContext } from './ComputerContext'
import { getEnv, bigIntToStr } from './common/utils'
import { VITE_WITHDRAW_MOD_SPEC } from './common/modSpecs'

const Loader = () => (
  <span role="status">
    <svg
      aria-hidden="true"
      className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </span>
)

const BalanceDisplay = ({
  balance,
  chain,
  network,
  isRegtest,
  isRefreshing,
  onRefresh,
  onFund,
}: {
  balance: bigint
  chain: string
  network: string
  isRegtest: boolean
  isRefreshing: boolean
  onRefresh: () => Promise<void>
  onFund: () => Promise<void>
}) => (
  <div
    id="dropdown-cta"
    className="relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900"
    role="alert"
  >
    <div className="text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400">
      {bigIntToStr(balance)} {chain}{' '}
      <HiRefresh
        onClick={onRefresh}
        className={`w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100 ${isRefreshing ? 'animate-spin' : ''}`}
      />
    </div>
    <div className="text-center uppercase text-xs text-blue-800 dark:text-blue-400">{network}</div>
    {isRegtest && (
      <button
        id="fund-wallet"
        type="button"
        onClick={onFund}
        className="absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
      >
        Fund
      </button>
    )}
  </div>
)

const Withdraw = ({
  computer,
  paymentsWrapper: payments,
  onSuccess,
}: {
  computer: Computer
  paymentsWrapper: any[]
  onSuccess?: () => Promise<void>
}) => {
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const [address, setAddress] = useState<string>('')
  const [withdrawing, setWithdrawing] = useState<boolean>(false)

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true)
      if (!address || !address.trim()) {
        showSnackBar('Please input valid address', false)
        return
      }

      const revs = payments.map((p) => p._rev)
      await computer.delete(revs)

      const { balance } = await computer.getBalance()
      const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')))
      await computer.send(balance - minDust, address)

      setAddress('')
      if (onSuccess) await onSuccess()
    } catch (err) {
      if (err instanceof Error) showSnackBar(`Something went wrong, ${err.message}`, false)
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="my-2">
      <h6 className="text-lg font-bold dark:text-white">Withdraw to Address</h6>
      <div className="flex items-center space-x-2 my-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Recipient Address"
        />

        <button
          type="button"
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="px-3 py-1.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          {withdrawing ? <Loader /> : <>Withdraw</>}
        </button>
      </div>
    </div>
  )
}

const Balance = ({
  computer,
  modSpecs,
  isOpen,
}: {
  computer: Computer
  modSpecs: string[]
  isOpen: boolean
}) => {
  const [balance, setBalance] = useState<bigint>(0n)
  const [paymentsWrapper, setPaymentsWrapper] = useState<any[]>([])
  const { showSnackBar } = UtilsContext.useUtilsComponents()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshBalance = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const publicKey = computer.getPublicKey()
      const allPayments: any[] = []
      const balances: bigint[] = await Promise.all(
        modSpecs.map(async (mod) => {
          const paymentRevs = await computer.getOUTXOs({ publicKey, mod })
          const payments = (await Promise.all(
            paymentRevs.map((rev: string) => computer.sync(rev)),
          )) as any[]
          allPayments.push(...payments)
          const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')))
          return payments && payments.length
            ? payments.reduce((total, pay) => total + (pay._satoshis - minDust), 0n)
            : 0n
        }),
      )
      const amountsInPayments: bigint = balances.reduce((acc, curr) => acc + curr, 0n)
      const walletBalance = await computer.getBalance()

      setBalance(walletBalance.balance + amountsInPayments)
      setPaymentsWrapper(allPayments)
    } catch {
      showSnackBar('Error fetching wallet details', false)
    } finally {
      setIsRefreshing(false)
    }
  }, [computer, modSpecs, showSnackBar])

  const fund = async () => {
    setIsRefreshing(true)
    try {
      const amount = computer.getChain() === 'PEPE' ? 10e8 : 1e8
      await computer.faucet(amount)
      await refreshBalance()
    } catch (err) {
      if (err instanceof Error) {
        showSnackBar(`Error funding wallet: ${err.message}`, false)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isOpen) refreshBalance()
  }, [isOpen, refreshBalance])

  return (
    <>
      <BalanceDisplay
        balance={balance}
        chain={computer.getChain()}
        network={computer.getNetwork()}
        isRegtest={computer.getNetwork() === 'regtest'}
        isRefreshing={isRefreshing}
        onRefresh={refreshBalance}
        onFund={fund}
      />
      <Address computer={computer} />
      {!!VITE_WITHDRAW_MOD_SPEC && (
        <Withdraw
          computer={computer}
          paymentsWrapper={paymentsWrapper}
          onSuccess={refreshBalance}
        />
      )}
    </>
  )
}

const CopyableField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2">
      <div className="flex items-center">
        <h6 className="text-lg font-bold dark:text-white">{label}</h6>
        <button
          onClick={handleCopy}
          className="ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="my-2 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">{value}</p>
    </div>
  )
}

const Address = ({ computer }: { computer: Computer }) => (
  <CopyableField label="Deposit Address" value={computer.getAddress()} />
)

const PublicKey = ({ computer }: { computer: Computer }) => (
  <CopyableField label="Public Key" value={computer.getPublicKey()} />
)

const RevealableField = ({ label, getValue }: { label: string; getValue: () => string }) => {
  const [shown, setShown] = useState(false)
  return (
    <div className="my-2">
      <h6 className="text-lg font-bold dark:text-white">
        {label}{' '}
        <button
          onClick={() => setShown(!shown)}
          className="text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline"
        >
          {shown ? 'hide' : 'show'}
        </button>
      </h6>
      <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-words">
        {shown ? getValue() : ''}
      </p>
    </div>
  )
}

const Mnemonic = ({ computer }: { computer: Computer }) => (
  <RevealableField label="Mnemonic" getValue={computer.getMnemonic} />
)

const SimpleField = ({ label, value }: { label: string; value: string }) => (
  <div className="my-2">
    <h6 className="text-lg font-bold dark:text-white">{label}</h6>
    <p className="my-2 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">{value}</p>
  </div>
)

const Url = ({ computer }: { computer: Computer }) => (
  <SimpleField label="Node Url" value={computer.getUrl()} />
)

const Chain = ({ computer }: { computer: Computer }) => (
  <SimpleField label="Chain" value={computer.getChain()} />
)

const Network = ({ computer }: { computer: Computer }) => (
  <SimpleField label="Network" value={computer.getNetwork()} />
)

const Path = ({ computer }: { computer: Computer }) => (
  <SimpleField label="Path" value={computer.getPath()} />
)

const LogOut = () => (
  <>
    <div className="my-2">
      <h6 className="text-lg font-bold dark:text-white">Log Out</h6>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        Logging out will delete your mnemonic. Make sure to write it down.
      </p>
    </div>
    <button
      type="button"
      onClick={Auth.logout}
      className="px-3 py-1.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
    >
      Log Out
    </button>
  </>
)

export function Wallet({ modSpecs }: { modSpecs?: string[] }) {
  const computer = useContext(ComputerContext)
  const Content = ({ isOpen }: { isOpen: boolean }) => (
    <>
      <h4 className="text-2xl font-bold dark:text-white">Wallet</h4>
      <Balance computer={computer} modSpecs={modSpecs || []} isOpen={isOpen} />
      <PublicKey computer={computer} />
      <Mnemonic computer={computer} />
      {!getEnv('CHAIN') && <Chain computer={computer} />}
      {!getEnv('NETWORK') && <Network computer={computer} />}
      {!getEnv('URL') && <Url computer={computer} />}
      {!getEnv('PATH') && <Path computer={computer} />}
      <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
      <LogOut />
    </>
  )

  return <Drawer.Component Content={Content} id="wallet-drawer" />
}

```

# components\bc\test\utils.test.ts

```ts
import { describe, it, expect } from 'vitest'
import { bigIntToStr, strToBigInt } from '../src/common/utils'

describe('strToBigInt/bigIntToStr', () => {
  it('Should throw if an invalid number is provided', async () => {
    const invalidInputs = [
      '1.1.1',
      '12a.34',
      '12.3z',
      '12$3.45',
      'abc',
      '.',
      '',
      '-',
      '-0',
      '-0.00000000',
    ]

    invalidInputs.forEach((input) => {
      expect(() => strToBigInt(input)).toThrowError('Invalid number')
    })
  })

  it('handles valid numbers correctly', () => {
    const validInputs = ['123', '0.98765432', '123456789.1', '.5', '000123.45', '123.']

    validInputs.forEach((input) => {
      expect(() => strToBigInt(input)).not.toThrow()
    })
  })

  it('Should parse a string encoding a rounded integer', async () => {
    expect(strToBigInt('1')).to.eq(BigInt(1e8))
    expect(strToBigInt('1.')).to.eq(BigInt(1e8))
    expect(strToBigInt('.1')).to.eq(BigInt(1e7))
    expect(bigIntToStr(BigInt(1e8))).to.eq('1.0')
  })

  it('Should parse a string encoding a floating point number', async () => {
    expect(strToBigInt('1.5')).to.eq(BigInt(1.5 * 1e8))
    expect(bigIntToStr(BigInt(1.5 * 1e8))).to.eq('1.5')
  })

  it('Should parse a string encoding the smallest number in 64 bits', async () => {
    expect(strToBigInt('0.00000001')).to.eq(1n)
    expect(bigIntToStr(1n)).to.eq('0.00000001')
  })

  it('Should parse a string encoding the biggest number in 64 bits', async () => {
    expect(strToBigInt('1000000000000000000000.00000001')).to.eq(
      BigInt('100000000000000000000000000001'),
    )
    expect(bigIntToStr(BigInt('100000000000000000000000000001'))).to.eq(
      '1000000000000000000000.00000001',
    )
  })
})

```

# components\bc\tsconfig.json

```json
// {
//   "compilerOptions": {
//     "target": "ES2020",
//     "lib": ["dom", "dom.iterable", "esnext"],
//     "allowJs": true,
//     "skipLibCheck": true,
//     "esModuleInterop": true,
//     "allowSyntheticDefaultImports": true,
//     "strict": true,
//     "forceConsistentCasingInFileNames": true,
//     "noFallthroughCasesInSwitch": true,
//     "module": "esnext",
//     "moduleResolution": "node",
//     "resolveJsonModule": true,
//     "isolatedModules": true,
//     "noEmit": false,
//     "jsx": "react-jsx",
//     "declaration": true,
//     "outDir": "./built",
//     "types": ["vite/client"],
//     "paths": {
//       "react": ["./node_modules/@types/react"]
//     }
//   },
//   "include": ["src"],
//   "exclude": ["./built/*"]
// }


{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "./built",
    "paths": {
      "react": ["./node_modules/@types/react"]
    }
  },
  "include": ["src"],
  "exclude": ["./built/*"]
}
```

# components\Button.tsx

```tsx
import React, { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

```

# components\Card.tsx

```tsx
import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''
  
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  )
}

```

# components\index.ts

```ts
export { Button } from './Button'
export { Card } from './Card'
export { Loader } from './Loader'
export * from './layout'
export * from './bc'

```

# components\layout\index.ts

```ts
export { Navigation } from './Navigation'

```

# components\layout\Navigation.tsx

```tsx
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
    { href: '/gallery', label: 'Gallery', show: true },
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

```

# components\Loader.tsx

```tsx
import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  )
}

```

# config\constants.ts

```ts
/**
 * Application constants
 */

// Wallet
export const DEFAULT_WALLET_PATH = "m/44'/2'/0'/0/0"

// UI
export const TRUNCATE_PUBLIC_KEY_CHARS = 10
export const TRUNCATE_TX_ID_CHARS = 8

// Quiz
export const MIN_QUIZ_OPTIONS = 2
export const MAX_QUIZ_OPTIONS = 4
export const QUIZ_TITLE_MAX_LENGTH = 100
export const QUIZ_QUESTION_MAX_LENGTH = 500

// Delays (for blockchain sync)
export const SYNC_DELAY_MS = 1500
export const POLL_INTERVAL_MS = 3000

// Local storage keys
export const STORAGE_KEYS = {
  WALLET: 'quiz-app-wallet',
  SESSION: 'quiz-app-session',
  THEME: 'quiz-app-theme'
} as const


export const MODULE_SPECS = {
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC || process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC || process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_MOD || '',
  quizAttemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || '',
}
```

# config\env.ts

```ts
/**
 * Client-side environment configuration
 * Only NEXT_PUBLIC_ variables are available here
 */

import type { Chain, Network } from '@quiz-app/shared'

// Blockchain configuration
export const CHAIN = (process.env.NEXT_PUBLIC_CHAIN || 'LTC') as Chain
export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'regtest') as Network
export const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'

// Derive API endpoints from BASE_URL if needed
export const RPC_ENDPOINT = `${BASE_URL}/rpc`
export const WS_ENDPOINT = BASE_URL.replace('http', 'ws')

// Module specifications (deployed contract modules)
export const MODULE_SPECS = {
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC || process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC || process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_MOD || '',
  attemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || process.env.NEXT_PUBLIC_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || ''
}

// Force log all environment variables for debugging
console.log('🔧 ALL NEXT_PUBLIC env vars:', {
  NEXT_PUBLIC_TEACHER_MOD: process.env.NEXT_PUBLIC_TEACHER_MOD,
  NEXT_PUBLIC_STUDENT_MOD: process.env.NEXT_PUBLIC_STUDENT_MOD,
  NEXT_PUBLIC_QUIZ_MOD: process.env.NEXT_PUBLIC_QUIZ_MOD,
  NEXT_PUBLIC_ATTEMPT_MOD: process.env.NEXT_PUBLIC_ATTEMPT_MOD,
  NEXT_PUBLIC_PAYMENT_MOD: process.env.NEXT_PUBLIC_PAYMENT_MOD,
  NEXT_PUBLIC_QUIZ_ACCESS_MOD: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD,
  NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD
})

// Blockchain config object
export const BLOCKCHAIN_CONFIG = {
  chain: CHAIN,
  network: NETWORK,
  url: BASE_URL
} as const

// Validate required environment variables
export function validateClientEnv(): { valid: boolean; missing: string[] } {
  const required = ['NEXT_PUBLIC_CHAIN', 'NEXT_PUBLIC_NETWORK', 'NEXT_PUBLIC_URL']
  const missing = required.filter(key => !process.env[key])
  
  return {
    valid: missing.length === 0,
    missing
  }
}

// Check if module specs are configured
export function hasModuleSpecs(): boolean {
  // Debug: Log what we actually have
  console.log('🔍 Debug MODULE_SPECS:', MODULE_SPECS)
  console.log('🔍 Debug env vars:', {
    teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD,
    paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD,
    quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD
  })
  
  const hasSpecs = Object.values(MODULE_SPECS).every(mod => mod !== '')
  console.log('🔍 hasModuleSpecs result:', hasSpecs)
  
  if (!hasSpecs) {
    console.info('🔧 Development Mode: Module specs not deployed, using mock implementations')
  } else {
    console.info('✅ Production Mode: Using deployed blockchain contracts')
  }
  return hasSpecs
}

// Get Computer configuration
export function getComputerConfig(path?: string, mnemonic?: string) {
  return {
    chain: CHAIN,
    network: NETWORK,
    url: BASE_URL,
    path,
    mnemonic
  }
}

```

# config\index.ts

```ts
export * from './env'
export * from './constants'

```

# features\access\access.service.ts

```ts
/**
 * Access Service - Handle quiz access purchase
 */

'use client'

import type { AccessClient } from '@quiz-app/sdk'

export interface QuizAccess {
  _id: string
  _rev: string
  quizId: string
  studentId: string
  purchasedAt: number
}

/**
 * Purchase quiz access
 */
export async function purchaseAccess(
  accessClient: AccessClient,
  quizId: string,
  price: number
): Promise<QuizAccess> {
  const access = await accessClient.purchase(quizId, price)
  return access
}

/**
 * Check if student has access to quiz
 */
export async function hasAccess(
  accessClient: AccessClient,
  studentId: string,
  quizId: string
): Promise<boolean> {
  try {
    const access = await accessClient.checkAccess(studentId, quizId)
    return !!access
  } catch (error) {
    return false
  }
}

/**
 * Get all access for a student
 */
export async function getStudentAccess(
  accessClient: AccessClient,
  studentId: string
): Promise<QuizAccess[]> {
  try {
    const accessList = await accessClient.listByStudent(studentId)
    return accessList
  } catch (error) {
    console.error('Failed to get student access:', error)
    return []
  }
}

```

# features\access\components\BuyAccessModal.tsx

```tsx
/**
 * Buy Access Modal Component
 */

'use client'

import { useState } from 'react'
import { useAccessClient } from '@/hooks'
import { purchaseAccess } from '../access.service'
import { formatSatoshis } from '@/services'
import type { Quiz } from '@/features/quizzes'

interface BuyAccessModalProps {
  quiz: Quiz
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BuyAccessModal({ quiz, isOpen, onClose, onSuccess }: BuyAccessModalProps) {
  const accessClient = useAccessClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await purchaseAccess(accessClient, quiz._id, quiz.price)
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase access')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Purchase Quiz Access</h2>
        
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {quiz.description}
            </p>
            <div className="flex justify-between text-sm">
              <span>Questions:</span>
              <span className="font-medium">{quiz.questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reward per question:</span>
              <span className="font-medium">{formatSatoshis(quiz.rewardPerQuestion)} LTC</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Price:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatSatoshis(quiz.price)} LTC
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Purchasing...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  )
}

```

# features\access\components\index.ts

```ts
export { BuyAccessModal } from './BuyAccessModal'

```

# features\access\index.ts

```ts
export * from './access.service'
export * from './components'

```

# features\attempts\attempts.service.ts

```ts
/**
 * Attempts Service - Handle quiz attempts
 * NOTE: Each attempt is for ONE question. Answer is either correct or wrong.
 */

'use client'

import type { AttemptClient } from '@quiz-app/sdk'
import { apiClient } from '@/services'

export interface Attempt {
  _id: string
  _rev: string
  quizId: string
  studentPublicKey: string
  selectedAnswer: number  // Index 0-3
  isCorrect: boolean      // True if correct
  rewardEarned: bigint    // Full reward if correct, 0 if wrong
  attemptedAt: number
  isCompleted: boolean
}

export interface SubmitAttemptParams {
  quizId: string
  selectedAnswer: number  // Index 0-3
  accessTokenId: string   // QuizAccess token ID
}

/**
 * Submit quiz attempt
 * Flow:
 * 1. Create attempt with quizId
 * 2. Submit answer with access token (burns 1 unit)
 * 3. If correct → Payment transferred to student
 */
export async function submitAttempt(
  attemptClient: AttemptClient,
  params: SubmitAttemptParams
): Promise<Attempt> {
  const attempt = await attemptClient.submit(
    params.quizId,
    params.selectedAnswer,
    params.accessTokenId
  )

  // Sync with backend
  try {
    await apiClient.submitAttempt({
      id: attempt._id,
      rev: attempt._rev,
      quizId: attempt.quizId,
      studentId: attempt.studentPublicKey,
      selectedAnswer: attempt.selectedAnswer,
      isCorrect: attempt.isCorrect,
      rewardEarned: attempt.rewardEarned.toString(),
      attemptedAt: attempt.attemptedAt,
    })
  } catch (error) {
    console.error('Failed to sync attempt with backend:', error)
  }

  return attempt as Attempt
}

/**
 * Get attempt by ID
 */
export async function getAttempt(
  attemptClient: AttemptClient,
  attemptId: string
): Promise<Attempt | null> {
  try {
    const attempt = await attemptClient.get(attemptId)
    return attempt
  } catch (error) {
    console.error('Failed to get attempt:', error)
    return null
  }
}

/**
 * Get all attempts by student
 */
export async function getStudentAttempts(
  attemptClient: AttemptClient,
  studentPublicKey: string,
  quizId?: string
): Promise<Attempt[]> {
  try {
    const attempts = await attemptClient.listByStudent(studentPublicKey, quizId)
    return attempts as Attempt[]
  } catch (error) {
    console.error('Failed to get attempts:', error)
    return []
  }
}

/**
 * Check if student has attempted quiz
 */
export async function hasAttempted(
  attemptClient: AttemptClient,
  studentPublicKey: string,
  quizId: string
): Promise<boolean> {
  const attempts = await getStudentAttempts(attemptClient, studentPublicKey, quizId)
  return attempts.length > 0
}

```

# features\attempts\components\AttemptForm.tsx

```tsx
/**
 * Attempt Form Component - Answer ONE quiz question
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAttemptClient } from '@/hooks'
import { submitAttempt } from '../attempts.service'
import type { Quiz } from '@/features/quizzes'

interface AttemptFormProps {
  quiz: Quiz
  accessTokenId: string // QuizAccess token ID to burn
  onComplete?: (attemptId: string) => void
}

export function AttemptForm({ quiz, accessTokenId, onComplete }: AttemptFormProps) {
  const router = useRouter()
  const attemptClient = useAttemptClient()
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate answer selected
      if (selectedAnswer === -1) {
        throw new Error('Please select an answer')
      }

      const attempt = await submitAttempt(attemptClient, {
        quizId: quiz._id,
        selectedAnswer,
        accessTokenId,
      })

      onComplete?.(attempt._id)
      router.push(`/student/quizzes/${quiz._id}/result?attemptId=${attempt._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attempt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          ⚡ <strong>Winner takes all!</strong> The first student to answer correctly wins the full reward of{' '}
          <strong>{Number(quiz.rewardAmount).toLocaleString()} satoshis</strong>
        </p>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">{quiz.questionText}</h2>

        <div className="space-y-3">
          {quiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              disabled={loading}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                selectedAnswer === index
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === -1 || loading}
          className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {/* Warning */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        ⚠️ Once submitted, you cannot change your answer. Your QuizAccess token will be consumed.
      </p>
    </div>
  )
}

```

# features\attempts\components\index.ts

```ts
export { AttemptForm } from './AttemptForm'
export { ResultPanel } from './ResultPanel'

```

# features\attempts\components\ResultPanel.tsx

```tsx
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

export function ResultPanel({ attempt, quiz, onWithdraw }: ResultPanelProps) {
  const isCorrect = attempt.isCorrect
  const hasReward = attempt.rewardEarned > BigInt(0)

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
            ? 'Congratulations! You answered correctly and won the reward!'
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
            {formatSatoshis(attempt.rewardEarned)} LTC
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
                  attempt.selectedAnswer === quiz.correctAnswer
                    ? 'bg-green-200 dark:bg-green-800'
                    : 'bg-red-200 dark:bg-red-800'
                }`}>
                  <span className="font-medium">Your answer:</span>{' '}
                  {quiz.options[attempt.selectedAnswer]}
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
            <p className="font-semibold">{formatSatoshis(quiz.rewardAmount)} LTC</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">You Earned</p>
            <p className={`font-semibold ${
              hasReward ? 'text-green-600' : 'text-gray-600'
            }`}>
              {formatSatoshis(attempt.rewardEarned)} LTC
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

```

# features\attempts\index.ts

```ts
export * from './attempts.service'
export * from './components'

```

# features\index.ts

```ts
/**
 * Features - Vertical slices for app functionality
 */

export * from './wallet'
export * from './quizzes'
export * from './access'
export * from './attempts'
export * from './payments'
export * from './leaderboard'

```

# features\leaderboard\components\index.ts

```ts
export { LeaderboardTable } from './LeaderboardTable'

```

# features\leaderboard\components\LeaderboardTable.tsx

```tsx
/**
 * Leaderboard Table Component
 */

'use client'

import { formatSatoshis } from '@/services'
import { truncatePublicKey } from '@/lib'
import type { LeaderboardEntry } from '../leaderboard.service'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentStudentId?: string
  loading?: boolean
}

export function LeaderboardTable({ entries, currentStudentId, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="animate-pulse space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No leaderboard entries yet
        </p>
      </div>
    )
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Quizzes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rewards
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {entries.map((entry) => {
              const isCurrentStudent = entry.studentId === currentStudentId
              
              return (
                <tr
                  key={entry.studentId}
                  className={`${
                    isCurrentStudent
                      ? 'bg-blue-50 dark:bg-blue-900'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                      <span className="text-lg font-bold">{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">
                        {entry.studentName || 'Anonymous'}
                        {isCurrentStudent && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {truncatePublicKey(entry.studentId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-semibold">{entry.score}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm">{entry.quizzesCompleted}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatSatoshis(entry.totalRewards)} LTC
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

```

# features\leaderboard\index.ts

```ts
export * from './leaderboard.service'
export * from './components'

```

# features\leaderboard\leaderboard.service.ts

```ts
/**
 * Leaderboard Service - Handle leaderboard operations
 */

'use client'

import { apiClient } from '@/services'

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  score: number
  totalRewards: number
  quizzesCompleted: number
}

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const data = await apiClient.getLeaderboard()
    return data as LeaderboardEntry[]
  } catch (error) {
    console.error('Failed to get leaderboard:', error)
    return []
  }
}

/**
 * Get leaderboard for specific quiz
 */
export async function getQuizLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
  try {
    const data = await apiClient.getLeaderboard(quizId)
    return data as LeaderboardEntry[]
  } catch (error) {
    console.error('Failed to get quiz leaderboard:', error)
    return []
  }
}

/**
 * Get student rank
 */
export function getStudentRank(
  leaderboard: LeaderboardEntry[],
  studentId: string
): number | null {
  const entry = leaderboard.find(e => e.studentId === studentId)
  return entry?.rank ?? null
}

```

# features\payments\components\index.ts

```ts
export { WithdrawButton } from './WithdrawButton'
export { PaymentRow } from './PaymentRow'

```

# features\payments\components\PaymentRow.tsx

```tsx
/**
 * Payment Row Component - Display payment info
 */

'use client'

import { formatSatoshis } from '@/services'
import { truncatePublicKey } from '@/lib'
import type { Payment } from '../payments.service'

interface PaymentRowProps {
  payment: Payment
}

export function PaymentRow({ payment }: PaymentRowProps) {
  const date = new Date(payment.createdAt).toLocaleDateString()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
            <span className="text-sm font-mono">
              {truncatePublicKey(payment.sender)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">To:</span>
            <span className="text-sm font-mono">
              {truncatePublicKey(payment.recipient)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatSatoshis(payment.amount)} LTC
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {date}
          </div>
        </div>
      </div>
    </div>
  )
}

```

# features\payments\components\WithdrawButton.tsx

```tsx
/**
 * Withdraw Button Component - Handle payment withdrawals
 */

'use client'

import { useState } from 'react'
import { usePaymentClient } from '@/hooks'
import { withdrawPayments, calculateAvailableBalance, type Payment } from '../payments.service'
import { formatSatoshis } from '@/services'

interface WithdrawButtonProps {
  payments: Payment[]
  address: string
  onSuccess?: () => void
}

export function WithdrawButton({ payments, address, onSuccess }: WithdrawButtonProps) {
  const paymentClient = usePaymentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const totalBalance = calculateAvailableBalance(payments)

  const handleWithdraw = async () => {
    try {
      setLoading(true)
      setError(null)

      if (payments.length === 0) {
        throw new Error('No payments to withdraw')
      }

      const paymentRevs = payments.map(p => p._rev)
      await withdrawPayments(paymentClient, paymentRevs)

      onSuccess?.()
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={payments.length === 0}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Withdraw {formatSatoshis(totalBalance)} LTC
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Withdrawal</h2>
            
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Amount:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatSatoshis(totalBalance)} LTC
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payments:</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
                <p className="text-sm font-medium mb-1">To Address:</p>
                <p className="text-xs font-mono break-all">{address}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Withdrawing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

```

# features\payments\index.ts

```ts
export * from './payments.service'
export * from './components'

```

# features\payments\payments.service.ts

```ts
/**
 * Payments Service - Handle payment operations
 */

'use client'

import type { PaymentClient } from '@quiz-app/sdk'

export interface Payment {
  _id: string
  _rev: string
  amount: number
  recipient: string
  sender: string
  createdAt: number
}

/**
 * Create payment
 */
export async function createPayment(
  paymentClient: PaymentClient,
  recipient: string,
  amount: number
): Promise<Payment> {
  const payment = await paymentClient.create(recipient, amount)
  return payment
}

/**
 * Withdraw payments (batch delete)
 */
export async function withdrawPayments(
  paymentClient: PaymentClient,
  paymentRevs: string[]
): Promise<void> {
  await paymentClient.withdraw(paymentRevs)
}

/**
 * Get user payments
 */
export async function getUserPayments(
  paymentClient: PaymentClient,
  userId: string
): Promise<Payment[]> {
  try {
    const payments = await paymentClient.listByUser(userId)
    return payments
  } catch (error) {
    console.error('Failed to get payments:', error)
    return []
  }
}

/**
 * Calculate total available balance
 */
export function calculateAvailableBalance(payments: Payment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0)
}

```

# features\quizzes\components\index.ts

```ts
export { QuizCard } from './QuizCard'
export { QuizGrid } from './QuizGrid'
export { QuizForm } from './QuizForm'

```

# features\quizzes\components\QuizCard.tsx

```tsx
/**
 * Quiz Card Component - Display a single quiz (1 question)
 */

'use client'

import Link from 'next/link'
import { formatSatoshis } from '@/services'
import type { Quiz } from '../quizzes.service'

interface QuizCardProps {
  quiz: Quiz
  viewMode?: 'teacher' | 'student'
}

export function QuizCard({ quiz, viewMode = 'student' }: QuizCardProps) {
  const href = viewMode === 'teacher' 
    ? `/teacher/quizzes/${quiz._id}` 
    : `/student/quizzes/${quiz._id}`

  return (
    <Link
      href={href}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
        {quiz.title}
      </h3>

      {/* Question Preview */}
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {quiz.questionText}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">
              4 options
            </span>
          </div>

          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">
              {quiz.attemptCount || 0} attempts
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        {/* Entry Fee */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Entry Fee</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {formatSatoshis(quiz.entryFee)} LTC
          </p>
        </div>

        {/* Reward */}
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Reward</p>
          <p className="font-bold text-green-600 dark:text-green-400">
            {formatSatoshis(quiz.rewardAmount)} LTC
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-2 mt-3">
        {!quiz.isActive && (
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            Inactive
          </span>
        )}
        {quiz.isClaimed && (
          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
            Claimed
          </span>
        )}
        {quiz.isActive && !quiz.isClaimed && (
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
            Available
          </span>
        )}
      </div>
    </Link>
  )
}

```

# features\quizzes\components\QuizForm.tsx

```tsx
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

```

# features\quizzes\components\QuizGrid.tsx

```tsx
/**
 * Quiz Grid Component - Display multiple quizzes
 */

'use client'

import { QuizCard } from './QuizCard'
import type { Quiz } from '../quizzes.service'

interface QuizGridProps {
  quizzes: Quiz[]
  viewMode?: 'teacher' | 'student'
  loading?: boolean
  emptyMessage?: string
}

export function QuizGrid({ 
  quizzes, 
  viewMode = 'student', 
  loading = false,
  emptyMessage = 'No quizzes available'
}: QuizGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz._id} quiz={quiz} viewMode={viewMode} />
      ))}
    </div>
  )
}

```

# features\quizzes\hooks\index.ts

```ts
export { useQuiz, useTeacherQuizzes } from './useQuiz'

```

# features\quizzes\hooks\useQuiz.ts

```ts
/**
 * Hook for quiz operations
 */

'use client'

import { useState, useEffect } from 'react'
import { useQuizClient } from '@/hooks'
import { getQuiz, listQuizzesByTeacher, type Quiz } from '../quizzes.service'

export function useQuiz(quizId: string) {
  const quizClient = useQuizClient()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getQuiz(quizClient, quizId)
        setQuiz(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quiz')
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    }
  }, [quizId]) // Remove quizClient from dependencies to prevent infinite loop

  return { quiz, loading, error }
}

export function useTeacherQuizzes(teacherId: string) {
  const quizClient = useQuizClient()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listQuizzesByTeacher(quizClient, teacherId)
      setQuizzes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (teacherId) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]) // Remove quizClient from dependencies to prevent infinite loop

  return { quizzes, loading, error, refresh }
}

```

# features\quizzes\index.ts

```ts
export * from './quizzes.service'
export * from './components'
export * from './hooks'

```

# features\quizzes\quizzes.service.ts

```ts
/**
 * Quizzes Service - Handle quiz operations
 * NOTE: Each quiz has ONLY ONE question with 4 options
 */

'use client'

import type { QuizData } from '@quiz-app/shared'
import { apiClient } from '@/services'
import { BrowserTeacherClient, BrowserQuizClient } from '@/services/bc'

export interface Quiz {
  _id: string
  _rev: string
  title: string
  questionText: string  // Single question text
  options: string[]      // Exactly 4 options
  correctAnswer: number  // Index 0-3
  rewardAmount: bigint   // Reward in satoshis
  entryFee: bigint       // Cost to attempt
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string    // Associated payment object
  isClaimed: boolean     // Has reward been claimed?
  claimedBy: string      // Who claimed it
  attemptCount: number   // Total attempts
  createdAt?: number
}

export interface CreateQuizParams {
  title: string
  description?: string
  questionText: string
  options: string[]      // Must be exactly 4 options
  correctAnswer: number  // Index 0-3
  rewardAmount: number   // In satoshis
  entryFee: number       // In satoshis
}

/**
 * Create a new quiz (1 question, 4 options)
 * Flow:
 * 1. Create Payment object with reward
 * 2. Create Quiz with payment reference
 */
export async function createQuiz(
  teacherClient: BrowserTeacherClient,
  params: CreateQuizParams
): Promise<Quiz> {
  // Validate
  if (params.options.length !== 4) {
    throw new Error('Must have exactly 4 options')
  }
  if (params.correctAnswer < 0 || params.correctAnswer > 3) {
    throw new Error('Correct answer must be between 0 and 3')
  }

  const quizData: QuizData = {
    title: params.title,
    questionText: params.questionText,
    options: params.options,
    correctAnswer: params.correctAnswer,
    rewardAmount: BigInt(params.rewardAmount),
    entryFee: BigInt(params.entryFee),
    paymentTxId: '' // Will be populated by the teacher client
  }

  const quiz = await teacherClient.createQuiz(quizData)

  // Sync with backend (optional - don't fail if backend is unavailable)
  try {
    await apiClient.syncQuiz({
      id: quiz._id,
      rev: quiz._rev,
      ...params,
      teacherId: quiz.teacherPublicKey,
    })
  } catch (error) {
    console.warn('⚠️ Backend sync failed (ignoring - blockchain operation succeeded):', error)
  }

  return quiz as Quiz
}

/**
 * Get quiz by ID
 */
export async function getQuiz(
  quizClient: BrowserQuizClient,
  quizId: string
): Promise<Quiz | null> {
  try {
    const quiz = await quizClient.getQuiz(quizId)
    return quiz ? (quiz as unknown as Quiz) : null
  } catch (error) {
    console.error('Failed to get quiz:', error)
    return null
  }
}

/**
 * List quizzes by teacher
 */
export async function listQuizzesByTeacher(
  teacherClient: any, // TeacherClient instance
  teacherId: string
): Promise<Quiz[]> {
  try {
    const quizzes = await teacherClient.getQuizzesByTeacher(teacherId)
    return quizzes
  } catch (error) {
    console.error('Failed to list quizzes:', error)
    return []
  }
}

/**
 * Deactivate quiz (prevent further attempts)
 */
export async function deactivateQuiz(
  quizClient: BrowserQuizClient,
  quizId: string
): Promise<void> {
  try {
    await quizClient.deactivateQuiz(quizId)
  } catch (error) {
    console.error('Failed to deactivate quiz:', error)
    throw error
  }
}

/**
 * Check if student can attempt quiz
 */
export async function canAttemptQuiz(
  quizClient: BrowserQuizClient,
  quizId: string,
  studentPublicKey: string
): Promise<boolean> {
  try {
    return await quizClient.canStudentAttempt(quizId, studentPublicKey)
  } catch (error) {
    console.error('Failed to check attempt eligibility:', error)
    return false
  }
}

/**
 * Get all active quizzes for students to attempt
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    // For now use the BrowserQuizClient directly
    // In the future, this could also query API/database for cached results
    const { createQuizClient } = await import('@/hooks/useClients')
    const quizClient = createQuizClient()
    
    if (!quizClient) {
      console.error('Quiz client not available')
      return []
    }

    const dtos = await quizClient.getAllQuizzes()
    // Convert DTOs to Quiz interface
    return dtos.map(dto => ({
      _id: dto._id,
      _rev: dto._rev,
      title: dto.title,
      questionText: dto.questionText,
      options: dto.options,
      correctAnswer: dto.correctAnswer,
      rewardAmount: dto.rewardAmount,
      entryFee: dto.entryFee,
      teacherPublicKey: dto.teacherPublicKey,
      isActive: dto.isActive || true,
      paymentTxId: dto.paymentTxId || '',
      isClaimed: dto.isClaimed || false,
      claimedBy: dto.claimedBy || '',
      attemptCount: dto.attemptCount || 0,
      createdAt: dto.createdAt || Date.now()
    }))
  } catch (error) {
    console.error('Failed to get all quizzes:', error)
    return []
  }
}

```

# features\wallet\components\index.ts

```ts
export { WalletConnect } from './WalletConnect'
export { WalletDisplay } from './WalletDisplay'

```

# features\wallet\components\WalletConnect.tsx

```tsx
/**
 * Wallet Connect Component - Wrapper around bc Auth component
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/stores'
import { connectWallet, generateMnemonic, getWalletInfo } from '../wallet.service'
import { createComputerFromStorage } from '@/services'
import type { Chain, Network } from '@quiz-app/shared'

interface WalletConnectProps {
  onConnect?: () => void
  redirectTo?: string
}

export function WalletConnect({ onConnect, redirectTo }: WalletConnectProps) {
  const router = useRouter()
  const { connect: storeConnect, updateConfig } = useWalletStore()
  const [mnemonic, setMnemonic] = useState('')
  const [chain, setChain] = useState<Chain>('LTC')
  const [network, setNetwork] = useState<Network>('regtest')
  const [url, setUrl] = useState('http://localhost:1031')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!mnemonic.trim()) {
        throw new Error('Please enter a mnemonic')
      }

      // Store in localStorage
      connectWallet(mnemonic, chain, network, url)

      // Update store config
      updateConfig({ chain, network, url })

      // Get wallet info
      const computer = createComputerFromStorage()
      const info = await getWalletInfo(computer)

      // Update wallet store
      storeConnect({
        publicKey: info.publicKey,
        address: info.address,
      })

      onConnect?.()
      
      if (redirectTo) {
        router.push(redirectTo)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMnemonic = () => {
    setMnemonic(generateMnemonic())
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h2>
      
      <div className="space-y-4">
        {/* Mnemonic Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              BIP 39 Mnemonic
            </label>
            <button
              onClick={handleGenerateMnemonic}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Generate
            </button>
          </div>
          <textarea
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter or generate mnemonic"
          />
        </div>

        {/* Chain Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value as Chain)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="LTC">Litecoin</option>
            <option value="BTC">Bitcoin</option>
          </select>
        </div>

        {/* Network Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="regtest">Regtest</option>
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
          </select>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium mb-2">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="http://localhost:1031"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  )
}

```

# features\wallet\components\WalletDisplay.tsx

```tsx
/**
 * Wallet Display Component - Shows wallet balance and info
 */

'use client'

import { useState } from 'react'
import { useWalletStore } from '@/stores'
import { useWalletInfo } from '../hooks/useWalletInfo'
import { truncatePublicKey } from '@/lib'
import { formatSatoshis } from '@/services'
import { fundWallet } from '../wallet.service'
import { useComputer } from '@/hooks'

export function WalletDisplay() {
  const { publicKey, address, chain, network, disconnect } = useWalletStore()
  const { walletInfo, loading, refresh } = useWalletInfo()
  const computer = useComputer()
  const [funding, setFunding] = useState(false)

  const handleFund = async () => {
    try {
      setFunding(true)
      await fundWallet(computer)
      await refresh()
    } catch (error) {
      console.error('Failed to fund wallet:', error)
    } finally {
      setFunding(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow p-6">
      {/* Balance */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Balance</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
            {walletInfo ? formatSatoshis(walletInfo.balance) : '0'} {chain}
          </p>
          <button
            onClick={refresh}
            className="p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded"
            title="Refresh balance"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 uppercase mt-1">
          {network}
        </p>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
        <p className="text-sm font-mono break-all">{address}</p>
      </div>

      {/* Public Key */}
      <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Public Key</p>
        <p className="text-sm font-mono break-all">
          {publicKey && truncatePublicKey(publicKey)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {network === 'regtest' && (
          <button
            onClick={handleFund}
            disabled={funding}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {funding ? 'Funding...' : 'Fund Wallet'}
          </button>
        )}
        <button
          onClick={disconnect}
          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}

```

# features\wallet\hooks\index.ts

```ts
export { useWalletInfo } from './useWalletInfo'

```

# features\wallet\hooks\useWalletInfo.ts

```ts
/**
 * Hook for wallet information
 */

'use client'

import { useEffect, useState } from 'react'
import { useComputer } from '@/hooks'
import { getWalletInfo, type WalletInfo } from '../wallet.service'

export function useWalletInfo() {
  const computer = useComputer()
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const info = await getWalletInfo(computer)
      setWalletInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove computer from dependencies since it's memoized

  return {
    walletInfo,
    loading,
    error,
    refresh,
  }
}

```

# features\wallet\index.ts

```ts
export * from './wallet.service'
export * from './components'
export * from './hooks'

```

# features\wallet\wallet.service.ts

```ts
/**
 * Wallet Service - Handle wallet operations
 */

'use client'

import { Computer } from '@bitcoin-computer/lib'
import { createComputerFromStorage } from '@/services'
import type { Chain, Network } from '@quiz-app/shared'

export interface WalletInfo {
  publicKey: string
  address: string
  balance: bigint
}

type BalanceObj = {
  confirmed?: unknown
  unconfirmed?: unknown
  balance?: unknown
}

const toBigInt = (v: unknown): bigint => {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number') return BigInt(Math.trunc(v))
  if (typeof v === 'string') return BigInt(v)
  throw new Error(`Invalid bigint value: ${String(v)}`)
}

const normalizeBalance = (raw: unknown): bigint => {
  if (raw && typeof raw === 'object') {
    const b = raw as BalanceObj
    if (b.balance !== undefined) return toBigInt(b.balance)
  }
  return toBigInt(raw)
}

/**
 * Get wallet information from Computer
 */
export async function getWalletInfo(computer: Computer): Promise<WalletInfo> {
  const publicKey = computer.getPublicKey()
  const address = computer.getAddress()
  const rawBalance = await computer.getBalance()
  const balance = normalizeBalance(rawBalance)

  return {
    publicKey,
    address,
    balance,
  }
}

/**
 * Fund wallet (regtest only)
 */
export async function fundWallet(computer: Computer, amount: number = 1e8): Promise<void> {
  await computer.faucet(amount)
}

/**
 * Connect wallet with mnemonic
 */
export function connectWallet(mnemonic: string, chain: Chain, network: Network, url: string, path?: string) {
  if (typeof window === 'undefined') return

  localStorage.setItem('BIP_39_KEY', mnemonic)
  localStorage.setItem('CHAIN', chain)
  localStorage.setItem('NETWORK', network)
  localStorage.setItem('URL', url)
  if (path) {
    localStorage.setItem('PATH', path)
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('BIP_39_KEY')
  localStorage.removeItem('CHAIN')
  localStorage.removeItem('NETWORK')
  localStorage.removeItem('URL')
  localStorage.removeItem('PATH')
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('BIP_39_KEY')
}

/**
 * Get stored wallet config
 */
export function getStoredWalletConfig() {
  if (typeof window === 'undefined') return null

  return {
    mnemonic: localStorage.getItem('BIP_39_KEY'),
    chain: localStorage.getItem('CHAIN') as Chain,
    network: localStorage.getItem('NETWORK') as Network,
    url: localStorage.getItem('URL'),
    path: localStorage.getItem('PATH'),
  }
}

/**
 * Generate new mnemonic
 */
export function generateMnemonic(): string {
  const computer = new Computer()
  return computer.getMnemonic()
}

```

# hooks\index.ts

```ts
export * from './useClients'
export * from './useWallet'

```

# hooks\useClients.ts

```ts
'use client'

import { useMemo } from 'react'
import { useWalletStore } from '@/stores'
import { createComputerFromStorage } from '@/services'
import { createBrowserSDK, BrowserQuizClient, BrowserTeacherClient, BrowserAttemptClient, BrowserAccessClient } from '@/services/bc'

/**
 * Hook to access Computer instance
 */
export function useComputer() {
  return useMemo(() => {
    return createComputerFromStorage()
  }, [])
}

/**
 * Hook to access browser-safe SDK clients
 */
export function useBrowserSDK() {
  const computer = useComputer()
  
  return useMemo(() => createBrowserSDK(computer), [computer])
}

/**
 * Hook to access specific browser-safe clients
 */
export function useTeacherClient(): BrowserTeacherClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createTeacherClient(), [sdk])
}

export function useQuizClient(): BrowserQuizClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createQuizClient(), [sdk])
}

export function useAttemptClient(): BrowserAttemptClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createAttemptClient(), [sdk])
}

export function useAccessClient(): BrowserAccessClient {
  const sdk = useBrowserSDK()
  return useMemo(() => sdk.createAccessClient(), [sdk])
}

/**
 * Create quiz client instance outside of React components
 */
export function createQuizClient(): BrowserQuizClient {
  const computer = createComputerFromStorage()
  const sdk = createBrowserSDK(computer)
  return sdk.createQuizClient()
}

```

# hooks\useWallet.ts

```ts
'use client'

import { useWalletStore } from '@/stores'

/**
 * Hook to access wallet state and actions
 */
export function useWallet() {
  const wallet = useWalletStore()
  
  return {
    // State
    publicKey: wallet.publicKey,
    address: wallet.address,
    path: wallet.path,
    isConnected: wallet.isConnected,
    
    // Config
    chain: wallet.chain,
    network: wallet.network,
    url: wallet.url,
    
    // Module specs
    moduleSpecs: wallet.moduleSpecs,
    
    // Actions
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    updateConfig: wallet.updateConfig,
    setModuleSpecs: wallet.setModuleSpecs
  }
}

```

# lib\errors.ts

```ts
/**
 * Custom error classes for Quiz App
 */

export class QuizAppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuizAppError'
  }
}

export class WalletError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'WalletError'
  }
}

export class ContractError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'ContractError'
  }
}

export class ValidationError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

```

# lib\index.ts

```ts
export * from './utils'
export * from './errors'

```

# lib\utils.ts

```ts
/**
 * Utility functions for the Quiz App
 */

// Re-export utilities from shared package
export {
  formatSatsToBTC,
  formatSats,
  truncatePublicKey,
  truncateTxId,
  formatTimestamp,
  isValidAnswerIndex
} from '@quiz-app/shared'

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * Format error message
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

```

# mine\page.tsx

```tsx
"use client";
import { ComputerContext, Gallery } from "../common-components";
import { useContext } from "react";
import { NEXT_PUBLIC_COUNTER_MOD_SPEC } from "../contracts/modSpecs";

export default function MyAssets() {
  const computer = useContext(ComputerContext);

  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My Counters</h2>
      {computer && !!computer.getPublicKey() && (
        <Gallery.WithPagination
          mod={NEXT_PUBLIC_COUNTER_MOD_SPEC}
          publicKey={computer.getPublicKey()}
        />
      )}
    </>
  );
}

```

# mint\page.tsx

```tsx
"use client";
import { useContext, useState } from "react";
import { ComputerContext, Modal } from "../common-components";
import Link from "next/link";
import { Counter } from "../contracts/counter";
import { NEXT_PUBLIC_COUNTER_MOD_SPEC } from "../contracts/modSpecs";

function SuccessContent(rev: string) {
  return (
    <>
      <div id="mint-success" className="p-4 md:p-5 dark:text-gray-400">
        <div>
          You created a{" "}
          <Link
            id="counter-link"
            href={`/objects/${rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              Modal.hideModal("success-modal");
            }}
          >
            counter
          </Link>
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => Modal.hideModal("success-modal")}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  );
}

function ErrorContent(msg: string) {
  return (
    <>
      <div className="p-4 md:p-5 dark:text-gray-400">
        <div>
          Something went wrong.
          <br />
          <br />
          {msg}
        </div>
      </div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={() => {
            Modal.hideModal("error-modal");
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Close
        </button>
      </div>
    </>
  );
}

export default function Mint() {
  const computer = useContext(ComputerContext);
  const [successRev, setSuccessRev] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!computer) {
      return;
    }
    try {
      const { tx, effect } = await computer.encode({
        exp: `new Counter()`,
        mod: NEXT_PUBLIC_COUNTER_MOD_SPEC,
      });
      await computer.broadcast(tx);

      const counter = effect.res as unknown as Counter;
      setSuccessRev(counter._id);
      Modal.showModal("success-modal");
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
        Modal.showModal("error-modal");
      }
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <button
          id="mint-counter-button"
          type="submit"
          className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Mint Counter
        </button>
      </form>
      <Modal.Component
        title={"Success"}
        content={SuccessContent}
        contentData={successRev}
        id={"success-modal"}
      />
      <Modal.Component
        title={"Error"}
        content={ErrorContent}
        contentData={errorMsg}
        id={"error-modal"}
      />
    </>
  );
}

```

# objects\[rev]\page.tsx

```tsx
"use client";

import { SmartObject } from "@/app/common-components";

export default function SmartObjectComponent() {
  return <SmartObject.Component />;
}

```

# services\api.client.ts

```ts
/**
 * API Client - Handles communication with NestJS backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class APIClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Quiz endpoints
  async getQuizzes(params?: { teacherId?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.teacherId) searchParams.append('teacherId', params.teacherId)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    const query = searchParams.toString()
    return this.request(`/quizzes${query ? `?${query}` : ''}`)
  }

  async getQuizById(id: string) {
    return this.request(`/quizzes/${id}`)
  }

  async syncQuiz(quizData: any) {
    return this.request('/quizzes/sync', {
      method: 'POST',
      body: JSON.stringify(quizData),
    })
  }

  // Attempt endpoints
  async getAttempts(params?: { studentId?: string; quizId?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.studentId) searchParams.append('studentId', params.studentId)
    if (params?.quizId) searchParams.append('quizId', params.quizId)
    
    const query = searchParams.toString()
    return this.request(`/attempts${query ? `?${query}` : ''}`)
  }

  async submitAttempt(attemptData: any) {
    return this.request('/attempts', {
      method: 'POST',
      body: JSON.stringify(attemptData),
    })
  }

  // Leaderboard endpoints
  async getLeaderboard(quizId?: string) {
    return this.request(`/leaderboard${quizId ? `?quizId=${quizId}` : ''}`)
  }

  // User endpoints
  async getUserProfile(userId: string) {
    return this.request(`/users/${userId}`)
  }
}

// Export singleton instance
export const apiClient = new APIClient()

```

# services\bc\BrowserAccessClient.ts

```ts
/**
 * Browser-Safe Access Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

export interface AccessDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentId: string
  hasAccess: boolean
  purchasedAt: number
  expiresAt?: number
}

export interface SaleOfferDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  teacherId: string
  price: bigint
  isActive: boolean
}

// Safe timestamp function that works in SES secure mode
const nowMs = () => {
  if (typeof performance !== 'undefined' && performance.timeOrigin !== undefined) {
    return Math.floor(performance.timeOrigin + performance.now())
  }
  return Date.now()
}

/**
 * Browser-safe AccessClient using deployed module specs
 * Follows the test flow for access token sale mechanism
 */
export class BrowserAccessClient {
  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  /**
   * Purchase access to a quiz following the test flow:
   * Teacher creates access token, creates sale offer, student accepts
   */
  async purchase(quizId: string, price: bigint): Promise<AccessDTO> {
    console.log('🔨 Purchasing access for quiz:', quizId, 'price:', price)

    // For now, create an access token directly
    // In the full test flow, the teacher would create a sale offer first
    const accessExp = `new QuizAccess("${this.computer.getPublicKey()}", "${quizId}", 1n)`
    
    const encoded = await this.computer.encode({
      exp: accessExp,
      mod: MODULE_SPECS.quizAccessMod,
    })

    await this.computer.broadcast(encoded.tx)

    const accessToken = encoded.effect.res

    return {
      _id: accessToken._id,
      _rev: accessToken._rev,
      _root: accessToken._root,
      _owners: accessToken._owners,
      _satoshis: accessToken._satoshis,
      quizId: accessToken.quizId,
      studentId: this.computer.getPublicKey(),
      hasAccess: true,
      purchasedAt: nowMs(),
    } as AccessDTO
  }

  /**
   * Check if student has access to a quiz
   */
  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    const accessIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId 
    })

    for (const id of accessIds) {
      try {
        const access = await this.computer.sync(id)
        if (access.quizId === quizId && access.amount > 0n) {
          return true
        }
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }

    return false
  }

  /**
   * List all access tokens for a student
   */
  async listByStudent(studentId: string): Promise<AccessDTO[]> {
    const accessIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizAccessMod,
      publicKey: studentId 
    })

    const accesses: AccessDTO[] = []
    for (const id of accessIds) {
      try {
        const access = await this.computer.sync(id)
        accesses.push({
          _id: access._id,
          _rev: access._rev,
          _root: access._root,
          _owners: access._owners,
          _satoshis: access._satoshis,
          quizId: access.quizId,
          studentId: studentId,
          hasAccess: access.amount > 0n,
          purchasedAt: access.createdAt || nowMs(),
        })
      } catch (accessError) {
        console.error(`Failed to sync access token ${id}:`, accessError)
      }
    }

    return accesses
  }

  /**
   * Create sale offer for a quiz (teacher only)
   * Following test flow: create access token, create offer tx
   */
  async createSaleOffer(quizId: string, price: bigint): Promise<SaleOfferDTO> {
    console.log('🏪 Creating sale offer for quiz:', quizId, 'price:', price)

    // Create a payment object to represent the price
    const paymentExp = `new Payment(${price}n)`
    const paymentEncoded = await this.computer.encode({
      exp: paymentExp,
      mod: MODULE_SPECS.paymentMod,
    })

    await this.computer.broadcast(paymentEncoded.tx)
    const payment = paymentEncoded.effect.res

    return {
      _id: payment._id,
      _rev: payment._rev,
      _root: payment._root,
      _owners: [this.computer.getPublicKey()],
      _satoshis: payment._satoshis,
      quizId,
      teacherId: this.computer.getPublicKey(),
      price,
      isActive: true,
    } as SaleOfferDTO
  }
}

```

# services\bc\BrowserAttemptClient.ts

```ts
/**
 * Browser-Safe Attempt Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

export interface AttemptDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentPublicKey: string
  selectedAnswer: number
  isCorrect: boolean
  rewardEarned: bigint
  submittedAt: number
}

// Safe timestamp function that works in SES secure mode
const nowMs = () => {
  if (typeof performance !== 'undefined' && performance.timeOrigin !== undefined) {
    return Math.floor(performance.timeOrigin + performance.now())
  }
  return Date.now()
}

/**
 * Browser-safe AttemptClient using deployed module specs
 * Follows the exact test flow from the test file
 */
export class BrowserAttemptClient {
  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  /**
   * Submit quiz attempt following the test flow:
   * 1. Create QuizAttempt
   * 2. Call submitAnswer with access token
   * 3. Add student to attempted list
   * 4. Try to claim reward
   * 5. Transfer payment if claimed
   */
  async submitAttempt(
    quizId: string,
    selectedAnswer: number,
    accessTokenId: string
  ): Promise<AttemptDTO> {
    // Get the quiz and access token
    const quiz = await this.computer.sync(quizId)
    const accessToken = await this.computer.sync(accessTokenId)

    // Create attempt
    const attemptExp = `new QuizAttempt("${quizId}", "${this.computer.getPublicKey()}")`
    const encoded = await this.computer.encode({
      exp: attemptExp,
      mod: MODULE_SPECS.quizAttemptMod,
    })
    await this.computer.broadcast(encoded.tx)

    // Get the newly created attempt
    const attempt = await this.computer.sync(encoded.effect.res._id)

    // Submit the answer (this burns the access token internally)
    const submitExp = `attempt.submitAnswer(accessToken, ${selectedAnswer}, ${quiz.correctAnswer}, ${quiz.rewardAmount}n)`
    const submitEncoded = await this.computer.encode({
      exp: submitExp,
      env: { 
        attempt: attempt._rev,
        accessToken: accessToken._rev
      },
      mod: MODULE_SPECS.quizAttemptMod,
    })
    await this.computer.broadcast(submitEncoded.tx)

    // Get updated attempt
    const updatedAttempt = await this.computer.sync(submitEncoded.effect.res._id)

    // Add student to attempted list
    const addAttemptExp = `quiz.addAttemptedStudent("${this.computer.getPublicKey()}")`
    const addAttemptEncoded = await this.computer.encode({
      exp: addAttemptExp,
      env: { quiz: quiz._rev },
      mod: MODULE_SPECS.quizMod,
    })
    await this.computer.broadcast(addAttemptEncoded.tx)

    // Try to claim reward (first-come-first-served)
    const claimExp = `quiz.claimReward("${this.computer.getPublicKey()}")`
    const claimEncoded = await this.computer.encode({
      exp: claimExp,
      env: { quiz: quiz._rev },
      mod: MODULE_SPECS.quizMod,
    })
    await this.computer.broadcast(claimEncoded.tx)

    // Check if claim was successful and transfer payment
    const updatedQuiz = await this.computer.sync(quiz._id)
    if (updatedQuiz.isClaimed && updatedQuiz.claimedBy === this.computer.getPublicKey()) {
      const payment = await this.computer.sync(quiz.paymentTxId)
      const transferExp = `payment.transfer("${this.computer.getPublicKey()}")`
      const transferEncoded = await this.computer.encode({
        exp: transferExp,
        env: { payment: payment._rev },
        mod: MODULE_SPECS.paymentMod,
      })
      await this.computer.broadcast(transferEncoded.tx)
    }

    return {
      ...updatedAttempt,
      submittedAt: nowMs()
    } as AttemptDTO
  }

  /**
   * Get attempt by ID
   */
  async getAttempt(attemptId: string): Promise<AttemptDTO | null> {
    try {
      const attempt = await this.computer.sync(attemptId)
      return attempt as unknown as AttemptDTO
    } catch (error) {
      console.error('Failed to get attempt:', error)
      return null
    }
  }

  /**
   * Get student's attempts from blockchain
   */
  async getStudentAttempts(
    studentPublicKey: string,
    quizId?: string
  ): Promise<AttemptDTO[]> {
    const attemptIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizAttemptMod,
      publicKey: studentPublicKey 
    })
    
    const attempts: AttemptDTO[] = []
    for (const id of attemptIds) {
      try {
        const attempt = await this.computer.sync(id)
        if (!quizId || attempt.quizId === quizId) {
          attempts.push({
            ...attempt,
            submittedAt: attempt.attemptedAt || nowMs()
          } as AttemptDTO)
        }
      } catch (attemptError) {
        console.error(`Failed to sync attempt ${id}:`, attemptError)
      }
    }
    
    return attempts
  }
}

```

# services\bc\BrowserQuizClient.ts

```ts
/**
 * Browser-Safe Quiz Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'

export interface QuizDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  teacherPublicKey: string
  isActive: boolean
  paymentTxId: string
  isClaimed: boolean
  claimedBy: string
  attemptedStudents: string[]
  attemptCount: number
  createdAt: number
}

// Safe timestamp function that works in SES secure mode
const nowMs = () => {
  if (typeof performance !== 'undefined' && performance.timeOrigin !== undefined) {
    return Math.floor(performance.timeOrigin + performance.now())
  }
  return Date.now()
}

/**
 * Browser-safe QuizClient using deployed module specs
 * Follows the exact test flow: create payment first, then quiz
 */
export class BrowserQuizClient {
  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
  }

  /**
   * Create a new quiz following the test flow:
   * 1. Create Payment object with reward amount
   * 2. Create Quiz referencing the paymentTxId
   */
  async createQuiz(quizData: QuizData): Promise<QuizDTO> {
    console.log('🎯 Creating quiz with data:', quizData)

    try {
      // STEP 1: Create the payment object with reward amount
      console.log('📤 Creating payment...')
      const paymentEncoded = await this.computer.encode({
        exp: `new Payment(${quizData.rewardAmount}n)`,
        mod: MODULE_SPECS.paymentMod,
      })

      await this.computer.broadcast(paymentEncoded.tx)
      const payment = paymentEncoded.effect.res
      const paymentTxId = payment._id
      console.log('✅ Payment created:', paymentTxId)

      // STEP 2: Create the quiz referencing the payment
      // Using JSON.stringify for safe string interpolation
      console.log('📤 Creating quiz...')
      const quizEncoded = await this.computer.encode({
        exp: `new Quiz({
          title: ${JSON.stringify(quizData.title)},
          questionText: ${JSON.stringify(quizData.questionText)},
          options: ${JSON.stringify(quizData.options)},
          correctAnswer: ${quizData.correctAnswer},
          rewardAmount: ${quizData.rewardAmount}n,
          entryFee: ${quizData.entryFee}n,
          teacherPublicKey: "${this.computer.getPublicKey()}",
          paymentTxId: "${paymentTxId}"
        })`,
        mod: MODULE_SPECS.quizMod,
      })

      await this.computer.broadcast(quizEncoded.tx)
      const quiz = quizEncoded.effect.res
      const quizId = quiz._id
      console.log('✅ Quiz created:', quizId)

      // Sync to get latest state
      const syncedQuiz = await this.computer.sync(quizId)

      return {
        ...syncedQuiz,
        paymentTxId,
        attemptedStudents: syncedQuiz.attemptedStudents || [],
        attemptCount: 0,
        createdAt: nowMs()
      } as QuizDTO
    } catch (error: any) {
      console.error('❌ Quiz creation error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      throw new Error(`Failed to create quiz: ${error.message}`)
    }
  }

  /**
   * Get quiz by ID - sync from blockchain
   */
  async getQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.computer.sync(quizId)
      return {
        ...quiz,
        attemptedStudents: quiz.attemptedStudents || [],
        attemptCount: (quiz.attemptedStudents || []).length,
      } as QuizDTO
    } catch (error) {
      console.error('Failed to get quiz:', error)
      return null
    }
  }

  /**
   * Check if student can attempt quiz
   */
  async canStudentAttempt(quizId: string, studentPublicKey: string): Promise<boolean> {
    const quiz = await this.getQuiz(quizId)
    if (!quiz) return false
    
    // Quiz must be active and not claimed
    if (!quiz.isActive || quiz.isClaimed) return false
    
    // Student must not have attempted already
    if (quiz.attemptedStudents?.includes(studentPublicKey)) return false
    
    return true
  }

  /**
   * Deactivate quiz
   */
  async deactivateQuiz(quizId: string): Promise<QuizDTO | null> {
    try {
      const quiz = await this.getQuiz(quizId)
      if (!quiz) return null

      const encoded = await this.computer.encode({
        exp: `quiz.deactivate()`,
        env: { quiz: quiz._rev },
        mod: MODULE_SPECS.quizMod,
      })

      await this.computer.broadcast(encoded.tx)
      return await this.getQuiz(quizId)
    } catch (error) {
      console.error('Failed to deactivate quiz:', error)
      return null
    }
  }

  /**
   * Get all active quizzes from blockchain
   */
  async getAllQuizzes(): Promise<QuizDTO[]> {
    console.log('🔍 Getting all quizzes from blockchain')

    // Query all Quiz objects from blockchain
    const quizIds = await this.computer.query({ mod: MODULE_SPECS.quizMod })
    
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.computer.sync(id)
        if (quiz && quiz.isActive) {
          quizzes.push({
            ...quiz,
            attemptedStudents: quiz.attemptedStudents || [],
            attemptCount: (quiz.attemptedStudents || []).length,
          } as QuizDTO)
        }
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }
    
    console.log(`✅ Found ${quizzes.length} active quizzes`)
    return quizzes
  }

  /**
   * Get quizzes by teacher public key
   */
  async getQuizzesByTeacher(teacherPublicKey: string): Promise<QuizDTO[]> {
    const quizIds = await this.computer.query({ 
      mod: MODULE_SPECS.quizMod,
      publicKey: teacherPublicKey 
    })
    
    const quizzes: QuizDTO[] = []
    for (const id of quizIds) {
      try {
        const quiz = await this.computer.sync(id)
        quizzes.push({
          ...quiz,
          attemptedStudents: quiz.attemptedStudents || [],
          attemptCount: (quiz.attemptedStudents || []).length,
        } as QuizDTO)
      } catch (quizError) {
        console.error(`Failed to sync quiz ${id}:`, quizError)
      }
    }
    
    return quizzes
  }
}

```

# services\bc\BrowserTeacherClient.ts

```ts
/**
 * Browser-Safe Teacher Client - Uses deployed mod specs following test flow
 * NO MOCK DATA - Uses real blockchain contracts only
 */

import { Computer } from '@bitcoin-computer/lib'
import type { QuizData } from '@quiz-app/shared'
import { MODULE_SPECS, hasModuleSpecs } from '@/config/env'
import { BrowserQuizClient } from './BrowserQuizClient'

export interface TeacherDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  name: string
  publicKey: string
  quizCount: number
  totalEarnings: bigint
  createdAt: number
}

/**
 * Browser-safe TeacherClient using deployed module specs
 */
export class BrowserTeacherClient {
  private quizClient: BrowserQuizClient

  constructor(private computer: Computer) {
    const hasSpecs = hasModuleSpecs()
    if (!hasSpecs) {
      throw new Error('Module specs not deployed. Please run deployment script first.')
    }
    this.quizClient = new BrowserQuizClient(computer)
  }

  /**
   * Create a new teacher account
   */
  async createTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    const exp = `new Teacher("${name}", "${publicKey}")`

    const encoded = await this.computer.encode({
      exp,
      mod: MODULE_SPECS.teacherMod,
    })

    await this.computer.broadcast(encoded.tx)

    return {
      ...encoded.effect.res,
      createdAt: Date.now()
    } as TeacherDTO
  }

  /**
   * Get or create teacher by public key
   */
  async getOrCreateTeacher(name: string, publicKey: string): Promise<TeacherDTO> {
    try {
      // Try to find existing teacher
      const teacherIds = await this.computer.query({ 
        mod: MODULE_SPECS.teacherMod,
        publicKey 
      })
      
      if (teacherIds.length > 0) {
        const teacher = await this.computer.sync(teacherIds[0])
        return {
          ...teacher,
          createdAt: teacher.createdAt || Date.now()
        } as TeacherDTO
      }
      
      // Create new teacher if not found
      return await this.createTeacher(name, publicKey)
    } catch (error) {
      console.error('Failed to get/create teacher:', error)
      throw error
    }
  }

  /**
   * Create a quiz with payment (following test flow)
   */
  async createQuiz(quizData: QuizData): Promise<any> {
    return await this.quizClient.createQuiz(quizData)
  }

  /**
   * Get teacher's quizzes from blockchain
   */
  async getTeacherQuizzes(teacherPublicKey: string): Promise<any[]> {
    return await this.quizClient.getQuizzesByTeacher(teacherPublicKey)
  }
}

```

# services\bc\index.ts

```ts
/**
 * Browser-Safe SDK Factory - Creates clients using mod specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { BrowserQuizClient } from './BrowserQuizClient'
import { BrowserTeacherClient } from './BrowserTeacherClient'
import { BrowserAttemptClient } from './BrowserAttemptClient'
import { BrowserAccessClient } from './BrowserAccessClient'
import type { ComputerConfig } from '@quiz-app/shared'

/**
 * Create Computer instance
 */
export function createBrowserComputer(config: ComputerConfig): Computer {
  return new Computer(config)
}

/**
 * Browser-safe client factory
 */
export class BrowserSDKFactory {
  constructor(private computer: Computer) {}

  createQuizClient(): BrowserQuizClient {
    return new BrowserQuizClient(this.computer)
  }

  createTeacherClient(): BrowserTeacherClient {
    return new BrowserTeacherClient(this.computer)
  }

  createAttemptClient(): BrowserAttemptClient {
    return new BrowserAttemptClient(this.computer)
  }

  createAccessClient(): BrowserAccessClient {
    return new BrowserAccessClient(this.computer)
  }

  // Add other clients as needed
  // createPaymentClient() ...
}

/**
 * Create factory from computer instance
 */
export function createBrowserSDK(computer: Computer): BrowserSDKFactory {
  return new BrowserSDKFactory(computer)
}

export * from './BrowserQuizClient'
export * from './BrowserTeacherClient'
export * from './BrowserAttemptClient'
export * from './BrowserAccessClient'
```

# services\contracts\contractsService.ts

```ts
/**
 * Contracts Service - Manages Computer instance and SDK clients
 */

import { Computer } from '@bitcoin-computer/lib'
import {
  TeacherClient,
  StudentClient,
  QuizClient,
  AccessClient,
  PaymentClient,
  AttemptClient
} from '@quiz-app/sdk'
import { MODULE_SPECS } from '@/config'
import { createComputerFromStorage } from '../sdk.factory'

/**
 * Get Computer instance from storage (same as wallet)
 */
export function getComputer(): Computer {
  return createComputerFromStorage()
}

/**
 * Create a new Computer instance (useful for multi-wallet scenarios)
 */
export function createNewComputer(config: any): Computer {
  return new Computer(config)
}

/**
 * Reset Computer instance
 */
export function resetComputer(): void {
  // No singleton to reset since we're using storage-based computer
}

/**
 * Get SDK clients
 */
export function getTeacherClient(computer?: Computer): TeacherClient {
  return new TeacherClient(computer || getComputer())
}

export function getStudentClient(computer?: Computer): StudentClient {
  return new StudentClient(computer || getComputer())
}

export function getQuizClient(computer?: Computer): QuizClient {
  return new QuizClient(computer || getComputer())
}

export function getAccessClient(computer?: Computer): AccessClient {
  const comp = computer || getComputer()
  return new AccessClient(comp, MODULE_SPECS.quizAccessMod, MODULE_SPECS.quizAccessSaleMod)
}

export function getPaymentClient(computer?: Computer): PaymentClient {
  const comp = computer || getComputer()
  return new PaymentClient(comp, MODULE_SPECS.paymentMod)
}

export function getAttemptClient(computer?: Computer): AttemptClient {
  return new AttemptClient(computer || getComputer())
}

/**
 * Get all clients at once
 */
export function getAllClients(computer?: Computer) {
  const comp = computer || getComputer()
  return {
    teacher: getTeacherClient(comp),
    student: getStudentClient(comp),
    quiz: getQuizClient(comp),
    access: getAccessClient(comp),
    payment: getPaymentClient(comp),
    attempt: getAttemptClient(comp)
  }
}

```

# services\contracts\index.ts

```ts
export * from './contractsService'

```

# services\index.ts

```ts
export * from './contracts/index'
export * from './sdk.factory'
export * from './api.client'
export * from './tx/txParser'
export * from './bc'

```

# services\sdk.factory.ts

```ts
/**
 * SDK Factory - Creates SDK clients from wallet/config
 */

import { Computer } from '@bitcoin-computer/lib'
import { createComputer } from '@quiz-app/sdk'
import type { ComputerConfig, Chain, Network } from '@quiz-app/shared'

export interface SDKFactoryConfig {
  chain: Chain
  network: Network
  url: string
  mnemonic?: string
  path?: string
}

/**
 * Create Computer instance with config
 */
export function createComputerInstance(config: SDKFactoryConfig): Computer {
  const computerConfig: ComputerConfig = {
    chain: config.chain,
    network: config.network,
    url: config.url,
  }

  if (config.mnemonic) {
    computerConfig.mnemonic = config.mnemonic
  }

  if (config.path) {
    computerConfig.path = config.path
  }

  return createComputer(computerConfig)
}

/**
 * Create Computer from localStorage (for bc components)
 */
export function createComputerFromStorage(): Computer {
  const mnemonic = typeof window !== 'undefined' ? localStorage.getItem('BIP_39_KEY') : null
  const chain = typeof window !== 'undefined' ? (localStorage.getItem('CHAIN') as Chain) : 'LTC'
  const network = typeof window !== 'undefined' ? (localStorage.getItem('NETWORK') as Network) : 'regtest'
  const url = typeof window !== 'undefined' ? localStorage.getItem('URL') : 'http://localhost:1031'
  const path = typeof window !== 'undefined' ? localStorage.getItem('PATH') : undefined

  const config: any = { chain, network, url }
  if (mnemonic) config.mnemonic = mnemonic
  if (path) config.path = path

  return new Computer(config)
}

```

# services\tx\txParser.ts

```ts
/**
 * Transaction Parser - Decode Bitcoin Computer transactions for UI display
 */

import type { Computer } from '@bitcoin-computer/lib'

export interface ParsedTransaction {
  txId: string
  inputs: ParsedInput[]
  outputs: ParsedOutput[]
  fee: number
  timestamp?: number
}

export interface ParsedInput {
  address: string
  value: number
  prevTxId: string
  prevIndex: number
}

export interface ParsedOutput {
  address: string
  value: number
  index: number
  isChange?: boolean
}

/**
 * Parse transaction data from Computer
 */
export async function parseTransaction(
  computer: Computer,
  txId: string
): Promise<ParsedTransaction | null> {
  try {
    // This is a simplified parser. Extend based on your needs
    const tx = await computer.provider.blockchain.tx.fetch(txId)
    
    if (!tx) return null

    return {
      txId,
      inputs: tx.vin?.map((input: any) => ({
        address: input.addr || 'Unknown',
        value: input.value || 0,
        prevTxId: input.txid,
        prevIndex: input.vout,
      })) || [],
      outputs: tx.vout?.map((output: any, index: number) => ({
        address: output.scriptPubKey?.addresses?.[0] || 'Unknown',
        value: output.value || 0,
        index,
      })) || [],
      fee: 0, // Calculate from inputs/outputs if needed
      timestamp: tx.time,
    }
  } catch (error) {
    console.error('Failed to parse transaction:', error)
    return null
  }
}

/**
 * Get transaction URL for block explorer
 */
export function getExplorerUrl(
  txId: string,
  chain: string,
  network: string
): string {
  if (network === 'regtest' || network === 'testnet') {
    return `#` // No explorer for regtest
  }

  if (chain === 'BTC') {
    return `https://blockstream.info/tx/${txId}`
  }

  if (chain === 'LTC') {
    return `https://blockexplorer.one/litecoin/mainnet/tx/${txId}`
  }

  return '#'
}

/**
 * Format satoshis to readable amount
 */
export function formatSatoshis(satoshis: number | bigint, decimals: number = 8): string {
  const amount = Number(satoshis) / Math.pow(10, decimals)
  return amount.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * Parse smart object revision
 */
export function parseRevision(rev: string): { txId: string; index: number } | null {
  const parts = rev.split(':')
  if (parts.length !== 2) return null
  
  return {
    txId: parts[0],
    index: parseInt(parts[1], 10),
  }
}

```

# stores\index.ts

```ts
export { useWalletStore } from './wallet.store'
export { useSessionStore } from './session.store'

```

# stores\session.store.ts

```ts
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config'

type UserRole = 'teacher' | 'student' | null

interface SessionState {
  // User role
  role: UserRole
  
  // User data
  userId: string | null // teacher/student contract ID
  userName: string | null
  
  // Navigation
  lastVisitedPage: string | null
  
  // Actions
  setRole: (role: UserRole) => void
  setUser: (userId: string, userName: string) => void
  clearUser: () => void
  setLastVisitedPage: (page: string) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // Initial state
      role: null,
      userId: null,
      userName: null,
      lastVisitedPage: null,
      
      // Actions
      setRole: (role) => set({ role }),
      
      setUser: (userId, userName) => set({ userId, userName }),
      
      clearUser: () => set({ userId: null, userName: null }),
      
      setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
      
      reset: () => set({
        role: null,
        userId: null,
        userName: null,
        lastVisitedPage: null
      })
    }),
    {
      name: STORAGE_KEYS.SESSION
    }
  )
)

```

# stores\wallet.store.ts

```ts
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chain, Network } from '@quiz-app/shared'
import { STORAGE_KEYS } from '@/config'

interface WalletState {
  // Wallet data
  publicKey: string | null
  address: string | null
  path: string | null
  
  // Blockchain config
  chain: Chain
  network: Network
  url: string
  
  // Module specs (cached from config or deployment)
  moduleSpecs: {
    teacherMod?: string
    studentMod?: string
    quizMod?: string
    attemptMod?: string
    paymentMod?: string
    quizAccessMod?: string
    quizAccessSaleMod?: string
  }
  
  // Connection state
  isConnected: boolean
  
  // Actions
  connect: (data: {
    publicKey: string
    address: string
    path?: string
  }) => void
  disconnect: () => void
  updateConfig: (config: { chain?: Chain; network?: Network; url?: string }) => void
  setModuleSpecs: (specs: Partial<WalletState['moduleSpecs']>) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // Initial state
      publicKey: null,
      address: null,
      path: null,
      chain: 'LTC',
      network: 'regtest',
      url: 'http://localhost:1031',
      moduleSpecs: {},
      isConnected: false,
      
      // Actions
      connect: (data) => {
        if (typeof window !== 'undefined') {
          // Store wallet info in localStorage to sync with computer instance
          const mnemonic = localStorage.getItem('BIP_39_KEY')
          if (mnemonic) {
            localStorage.setItem('CHAIN', 'LTC')
            localStorage.setItem('NETWORK', 'regtest')
            localStorage.setItem('URL', 'http://localhost:1031')
          }
        }
        
        set({
          publicKey: data.publicKey,
          address: data.address,
          path: data.path,
          isConnected: true
        })
      },

      disconnect: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('BIP_39_KEY')
          localStorage.removeItem('CHAIN')
          localStorage.removeItem('NETWORK')
          localStorage.removeItem('URL')
          localStorage.removeItem('PATH')
        }
        
        set({
          publicKey: null,
          address: null,
          path: null,
          isConnected: false
        })
      },
      
      updateConfig: (config) => set((state) => ({
        chain: config.chain ?? state.chain,
        network: config.network ?? state.network,
        url: config.url ?? state.url
      })),
      
      setModuleSpecs: (specs) => set((state) => ({
        moduleSpecs: { ...state.moduleSpecs, ...specs }
      }))
    }),
    {
      name: STORAGE_KEYS.WALLET
    }
  )
)

```

# transactions\[txn]\page.tsx

```tsx
"use client";

import { Transaction } from "@/app/common-components";

export default function TransactionComponent() {
  return <Transaction.Component />;
}

```

# types\common.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'testnet' | 'mainnet' | 'regtest'

```

