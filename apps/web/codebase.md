# .gitignore

```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.production
.env.development

# Build
dist/
build/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo
next-env.d.ts

```

# eslint.config.mjs

```mjs
import next from "eslint-config-next";

export default [
  ...next,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
];

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

# next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@quiz-app/sdk', '@quiz-app/contracts', '@quiz-app/shared']
};

export default nextConfig;

```

# package.json

```json
{
  "name": "@quiz-app/web",
  "version": "0.26.0-beta.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "next build",
    "dev": "next dev --turbopack",
    "lint": "next lint",
    "start": "next start"
  },
  "dependencies": {
    "@bitcoin-computer/lib": "^0.26.0-beta.0",
    "@quiz-app/contracts": "*",
    "@quiz-app/sdk": "*",
    "@quiz-app/shared": "*",
    "flowbite": "^4.0.1",
    "next": "^16.0.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.13.0",
    "react-string-replace": "^2.0.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "9.29.0",
    "eslint-config-next": "^16.0.1",
    "tailwindcss": "^4",
    "typescript": "^5.8.3"
  }
}

```

# postcss.config.mjs

```mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

```

# README.md

```md
# Quiz App Web

Next.js frontend for the Quiz App built on Bitcoin Computer.

## Architecture

This app follows a clean, feature-based architecture:

\`\`\`
src/
  app/                    # Next.js App Router pages
  components/             # Shared/reusable UI components
  features/               # Feature modules (vertical slices)
  services/               # Business logic & API clients
  stores/                 # Zustand state management
  config/                 # Configuration & environment
  lib/                    # Utilities & helpers
  hooks/                  # Shared React hooks
\`\`\`

## Features

- Teacher quiz creation and management
- Student quiz browsing and attempts
- Access token purchase flow (atomic swap)
- Payment withdrawals
- Leaderboard

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Environment Variables

Create `.env.local` file:

\`\`\`env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031

# Contract Module Specifications (after deployment)
NEXT_PUBLIC_TEACHER_MOD=
NEXT_PUBLIC_STUDENT_MOD=
NEXT_PUBLIC_QUIZ_MOD=
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=
NEXT_PUBLIC_PAYMENT_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_MOD=
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=
\`\`\`

```

# src\app\globals.css

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

# src\app\layout.tsx

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

# src\app\leaderboard\page.tsx

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

# src\app\page.tsx

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

# src\app\providers.tsx

```tsx
'use client'

import { ReactNode } from 'react'

/**
 * Client-side providers wrapper
 * Add any context providers, state managers, etc. here
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

```

# src\app\student\page.tsx

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

# src\app\student\quizzes\[id]\attempt\page.tsx

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

# src\app\student\quizzes\[id]\page.tsx

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

# src\app\student\quizzes\[id]\result\page.tsx

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

# src\app\student\quizzes\page.tsx

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

# src\app\teacher\create\page.tsx

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

# src\app\teacher\page.tsx

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

# src\app\wallet\page.tsx

```tsx
'use client'

import Link from 'next/link'
import { useWallet } from '@/hooks'
import { WalletConnect, WalletDisplay } from '@/features/wallet'
import { Wallet as BCWallet } from '@/components/bc/src'
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
              <BCWallet modSpecs={[
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

# src\components\bc\.babelrc

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

# src\components\bc\.eslintrc

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

# src\components\bc\.prettierrc

```
{
  "printWidth": 100,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}

```

# src\components\bc\built\ActionButtons.d.ts

```ts
interface ActionButtonProps {
    text: string;
    onClick: (...args: any[]) => Promise<void> | void;
    disabled?: boolean;
    className?: string;
}
export declare const PrimaryActionButton: ({ text, onClick, disabled, className, }: ActionButtonProps) => import("react/jsx-runtime").JSX.Element;
export declare const SecondaryActionButton: ({ text, onClick, disabled, className, }: ActionButtonProps) => import("react/jsx-runtime").JSX.Element;
export {};

```

# src\components\bc\built\ActionButtons.js

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
// Shared SVG loader component
const Loader = () => (_jsxs("svg", { "aria-hidden": "true", role: "status", className: "inline w-4 h-4 ml-3 text-white animate-spin dark:text-gray-400", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentColor" })] }));
// Primary Action Button (Blue button)
export const PrimaryActionButton = ({ text, onClick, disabled = false, className = '', }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async (...args) => {
        if (isLoading || disabled)
            return;
        setIsLoading(true);
        try {
            await onClick(...args); // Handle both sync and async onClick
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("button", { type: "button", className: `text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed dark:disabled:bg-gray-600 dark:disabled:text-gray-300 ${className}`, onClick: handleClick, disabled: isLoading || disabled, children: [text, isLoading && _jsx(Loader, {})] }));
};
// Secondary Action Button (Gray/Alternative button)
export const SecondaryActionButton = ({ text, onClick, disabled = false, className = '', }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async (...args) => {
        if (isLoading || disabled)
            return;
        setIsLoading(true);
        try {
            await onClick(...args); // Handle both sync and async onClick
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("button", { type: "button", className: `py-2.5 px-5 me-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${className}`, onClick: handleClick, disabled: isLoading || disabled, children: [text, isLoading && _jsx(Loader, {})] }));
};

```

# src\components\bc\built\Auth.d.ts

```ts
import { Computer } from '@bitcoin-computer/lib';
import type { Chain, Network, ModuleStorageType } from './common/types';
export type TBCChain = 'LTC' | 'BTC' | 'PEPE' | 'DOGE';
export type TBCNetwork = 'testnet' | 'mainnet' | 'regtest';
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr';
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
    mode: 'prod' | 'dev';
}>;
declare function isLoggedIn(): boolean;
declare function logout(): void;
declare function getCoinType(chain?: string, network?: string): number;
declare function getBip44Path({ purpose, coinType, account }?: {
    purpose?: number | undefined;
    coinType?: number | undefined;
    account?: number | undefined;
}): string;
declare function loggedOutConfiguration(): {
    chain: Chain;
    network: Network;
    url: any;
    path: any;
};
declare function loggedInConfiguration(): {
    mnemonic: string | null;
    chain: Chain;
    network: Network;
    url: any;
    path: any;
};
declare function getComputer(options?: ComputerOptions): Computer;
declare function LoginForm(): import("react/jsx-runtime").JSX.Element;
declare function LoginModal(): import("react/jsx-runtime").JSX.Element;
export declare const Auth: {
    isLoggedIn: typeof isLoggedIn;
    logout: typeof logout;
    getCoinType: typeof getCoinType;
    getBip44Path: typeof getBip44Path;
    defaultConfiguration: typeof loggedOutConfiguration;
    browserConfiguration: typeof loggedInConfiguration;
    getComputer: typeof getComputer;
    LoginForm: typeof LoginForm;
    LoginModal: typeof LoginModal;
};
export {};

```

# src\components\bc\built\Auth.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Computer } from '@bitcoin-computer/lib';
import { initFlowbite } from 'flowbite';
import { HiRefresh } from 'react-icons/hi';
import { useUtilsComponents } from './UtilsContext';
import { Modal } from './Modal';
import { getEnv } from './common/utils';
const pathPattern = /^(m\/)?(\d+'?\/)*\d+'?$/;
function isLoggedIn() {
    return !!localStorage.getItem('BIP_39_KEY');
}
function logout() {
    localStorage.removeItem('BIP_39_KEY');
    localStorage.removeItem('CHAIN');
    localStorage.removeItem('NETWORK');
    localStorage.removeItem('PATH');
    localStorage.removeItem('URL');
    window.location.href = '/';
}
function getCoinType(chain = 'LTC', network = 'regtest') {
    if (['testnet', 'regtest'].includes(network))
        return 1;
    if (chain === 'BTC')
        return 0;
    if (chain === 'LTC')
        return 2;
    if (chain === 'DOGE')
        return 3;
    if (chain === 'PEPE')
        return 3434;
    if (chain === 'BCH')
        return 145;
    throw new Error(`Unsupported chain ${chain} or network ${network}`);
}
function getBip44Path({ purpose = 44, coinType = 1, account = 0 } = {}) {
    return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`;
}
function getPath({ chain, network }) {
    return getBip44Path({ coinType: getCoinType(chain, network) });
}
function loggedOutConfiguration() {
    return {
        chain: getEnv('CHAIN'),
        network: getEnv('NETWORK'),
        url: getEnv('URL'),
        path: getEnv('PATH'),
    };
}
function loggedInConfiguration() {
    return {
        mnemonic: localStorage.getItem('BIP_39_KEY'),
        chain: (localStorage.getItem('CHAIN') || getEnv('CHAIN')),
        network: (localStorage.getItem('NETWORK') || getEnv('NETWORK')),
        url: localStorage.getItem('URL') || getEnv('URL'),
        path: localStorage.getItem('PATH') || getEnv('PATH'),
    };
}
function getComputer(options = {}) {
    const defaultConfiguration = isLoggedIn() ? loggedInConfiguration() : loggedOutConfiguration();
    return new Computer({ ...defaultConfiguration, ...options });
}
function MnemonicInput({ mnemonic, setMnemonic, }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("label", { className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "BIP 39 Mnemonic" }), _jsx(HiRefresh, { onClick: () => setMnemonic(new Computer().getMnemonic()), className: "w-4 h-4 ml-2 text-sm font-medium text-gray-900 dark:text-white inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100" })] }), _jsx("input", { value: mnemonic, onChange: (e) => setMnemonic(e.target.value), className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white", required: true })] }));
}
function ChainInput({ chain, setChain }) {
    return (_jsxs(_Fragment, { children: [_jsx("label", { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Chain" }), _jsxs("fieldset", { className: "flex", children: [_jsx("legend", { className: "sr-only", children: "Chain" }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('LTC'), checked: chain === 'LTC', id: "chain-ltc", type: "radio", name: "chain", value: "LTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "chain-ltc", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300", children: "LTC" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('BTC'), checked: chain === 'BTC', id: "chain-btc", type: "radio", name: "chain", value: "BTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "chain-btc", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "BTC" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('PEPE'), id: "chain-pepe", type: "radio", name: "chain", value: "PEPE", className: "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "chain-pepe", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "PEPE" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('DOGE'), id: "chain-doge", type: "radio", name: "chain", value: "DOGE", className: "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600", disabled: true }), _jsx("label", { htmlFor: "chain-doge", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "DOGE" })] })] })] }));
}
function NetworkInput({ network, setNetwork, }) {
    return (_jsxs(_Fragment, { children: [_jsx("label", { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Network" }), _jsxs("fieldset", { className: "flex", children: [_jsx("legend", { className: "sr-only", children: "Network" }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setNetwork('mainnet'), checked: network === 'mainnet', id: "network-mainnet", type: "radio", name: "network", value: "Mainnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "network-mainnet", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300", children: "Mainnet" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setNetwork('testnet'), checked: network === 'testnet', id: "network-testnet", type: "radio", name: "network", value: "Testnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "network-testnet", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "Testnet" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setNetwork('regtest'), checked: network === 'regtest', id: "network-regtest", type: "radio", name: "network", value: "Regtest", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "network-regtest", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "Regtest" })] })] })] }));
}
function UrlInput({ url, setUrl }) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-4 flex justify-between", children: _jsx("label", { className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Node Url" }) }), _jsx("input", { value: url, onChange: (e) => setUrl(e.target.value), className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" })] }));
}
function PathInput({ path, setPath }) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex justify-between", children: _jsx("label", { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Path" }) }), _jsx("input", { value: path, onChange: (e) => setPath(e.target.value), className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white", required: true })] }));
}
function LoginButton({ mnemonic, chain, network, path, url, urlInputRef }) {
    const { showSnackBar } = useUtilsComponents();
    const login = (e) => {
        e.preventDefault();
        if (isLoggedIn()) {
            showSnackBar('A user is already logged in, please log out first.', false);
            return;
        }
        if (mnemonic.length === 0) {
            showSnackBar("Please don't use an empty mnemonic string.", false);
            return;
        }
        if (chain === undefined) {
            showSnackBar('Please select a chain.', false);
            return;
        }
        if (network === undefined) {
            showSnackBar('Please select a network.', false);
            return;
        }
        if (path.length === 0) {
            showSnackBar('Please enter a valid path.', false);
            return;
        }
        if (path.match(pathPattern) === null) {
            showSnackBar("Path format must be in the form m/44'/0'/0'/0/0.", false);
            return;
        }
        if (url === undefined || url?.length === 0) {
            showSnackBar('Please enter a valid URL.', false);
            return;
        }
        if (isLoggedIn())
            return;
        localStorage.setItem('BIP_39_KEY', mnemonic);
        localStorage.setItem('CHAIN', chain);
        localStorage.setItem('NETWORK', network);
        localStorage.setItem('PATH', path);
        localStorage.setItem('URL', urlInputRef.current?.value || url);
        window.location.href = '/';
    };
    return (_jsx(_Fragment, { children: _jsx("button", { onClick: login, type: "submit", className: "w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800", children: "Log In" }) }));
}
function LoginForm() {
    const [mnemonic, setMnemonic] = useState(() => new Computer().getMnemonic());
    const [chain, setChain] = useState(getEnv('CHAIN'));
    const [network, setNetwork] = useState(getEnv('NETWORK'));
    const [url, setUrl] = useState(getEnv('URL') || 'http://localhost:1031');
    const urlInputRef = useRef(null);
    const [path, setPath] = useState(getEnv('PATH') || getPath({ chain, network }));
    useEffect(() => {
        initFlowbite();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "max-w-sm mx-auto p-4 md:p-5 space-y-4", children: _jsx("form", { className: "space-y-6", children: _jsxs("div", { children: [_jsx(MnemonicInput, { mnemonic: mnemonic, setMnemonic: setMnemonic }), !getEnv('CHAIN') && _jsx(ChainInput, { chain: chain, setChain: setChain }), !getEnv('NETWORK') && _jsx(NetworkInput, { network: network, setNetwork: setNetwork }), !getEnv('URL') && _jsx(UrlInput, { url: url || '', setUrl: setUrl }), !getEnv('PATH') && _jsx(PathInput, { path: path, setPath: setPath })] }) }) }), _jsx("div", { className: "max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600", children: _jsx(LoginButton, { mnemonic: mnemonic, chain: chain, network: network, url: url, path: path, urlInputRef: urlInputRef }) })] }));
}
function LoginModal() {
    return _jsx(Modal.Component, { title: "Sign in", content: LoginForm, id: "sign-in-modal", hideClose: true });
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

# src\components\bc\built\Card.d.ts

```ts
export declare function Card({ content, id }: any): import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\Card.js

```js
import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ content, id }) {
    return (_jsx("div", { className: "block mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700", children: _jsx("pre", { id: id ?? undefined, className: "font-normal text-gray-700 dark:text-gray-400 text-xs", children: content }) }));
}

```

# src\components\bc\built\common\Components.d.ts

```ts
export declare function Loader(): import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\common\Components.js

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Loader() {
    return (_jsx("div", { className: "grid place-items-center h-screen w-full top-0 left-0 fixed", children: _jsxs("svg", { "aria-hidden": "true", className: "mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentFill" })] }) }));
}

```

# src\components\bc\built\common\modSpecs.d.ts

```ts
export declare const VITE_WITHDRAW_MOD_SPEC: string;

```

# src\components\bc\built\common\modSpecs.js

```js
const getEnvVar = (key) => {
    const value = import.meta.env[key];
    if (value)
        return value;
    return '';
};
export const VITE_WITHDRAW_MOD_SPEC = getEnvVar('VITE_WITHDRAW_MOD_SPEC');

```

# src\components\bc\built\common\SmartCallExecutionResult.d.ts

```ts
export declare function FunctionResultModalContent({ functionResult }: any): import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\common\SmartCallExecutionResult.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
export function FunctionResultModalContent({ functionResult }) {
    const navigate = useNavigate();
    if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult))
        return (_jsx(_Fragment, { children: _jsxs("div", { id: "smart-call-execution-success", className: "p-4 md:p-5 dark:text-gray-400", children: ["You created an\u00A0", _jsx(Link, { id: "smart-call-execution-counter-link", to: `/objects/${functionResult._rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", onClick: () => {
                            navigate(`/objects/${functionResult._rev}`);
                            window.location.reload();
                        }, children: "on chain object" }), "."] }) }));
    if (functionResult._rev && functionResult.res.toString())
        return (_jsxs("p", { className: "text-base leading-relaxed text-gray-500 dark:text-gray-400", children: ["You created the value below at Revision ", functionResult._rev, _jsx("pre", { children: functionResult.res.toString() })] }));
    return (_jsx("p", { className: "text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2", children: functionResult }));
}

```

# src\components\bc\built\common\types.d.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE';
export type Network = 'testnet' | 'mainnet' | 'regtest';
export type ModuleStorageType = 'taproot' | 'multisig';

```

# src\components\bc\built\common\types.js

```js
export {};

```

# src\components\bc\built\common\TypeSelectionDropdown.d.ts

```ts
export declare const TypeSelectionDropdown: ({ id, onSelectMethod, dropdownList, selectedType }: any) => import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\common\TypeSelectionDropdown.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Dropdown, initFlowbite, } from 'flowbite';
export const TypeSelectionDropdown = ({ id, onSelectMethod, dropdownList, selectedType }) => {
    const [dropDown, setDropdown] = useState();
    const [type, setType] = useState(selectedType || 'Type');
    const [dropdownSelectionList] = useState(dropdownList);
    useEffect(() => {
        initFlowbite();
        const $targetEl = document.getElementById(`dropdownMenu${id}`);
        const $triggerEl = document.getElementById(`dropdownButton${id}`);
        const options = {
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
        };
        const instanceOptions = {
            id: `dropdownMenu${id}`,
            override: true,
        };
        setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions));
    }, [id]);
    const handleClick = (clickType) => {
        setType(clickType);
        onSelectMethod(clickType);
        if (dropDown)
            dropDown.hide();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { id: `dropdownButton${id}`, "data-dropdown-toggle": `dropdownMenu${id}`, className: "flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", type: "button", children: [type, _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 10 6", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 4 4 4-4" }) })] }), _jsx("div", { id: `dropdownMenu${id}`, className: "z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700", children: _jsx("ul", { className: "py-2 text-sm text-gray-700 dark:text-gray-200", "aria-labelledby": `dropdownButton${id}`, children: dropdownSelectionList.map((option, index) => (_jsx("li", { children: _jsx("span", { onClick: () => {
                                handleClick(option);
                            }, className: "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white", children: option }) }, index))) }) })] }));
};

```

# src\components\bc\built\common\utils.d.ts

```ts
type Json = JBasic | JObject | JArray;
type JBasic = undefined | null | boolean | number | string | symbol | bigint;
type JArray = Json[];
type JObject = {
    [x: string]: Json;
};
export declare const jsonMap: (g: (el: Json) => Json) => (json: Json) => Json;
export declare const strip: (value: Json) => Json;
export declare const toObject: (obj: any) => string;
export declare const capitalizeFirstLetter: (string: string) => string;
export declare function isValidRevString(outId: string): boolean;
export declare function isValidRev(value: string | number | boolean | null | undefined): boolean;
export declare const sleep: (ms: number) => Promise<void>;
export declare function getEnv(name: string): any;
export declare function bigIntToStr(a: bigint): string;
export declare function strToBigInt(a: string): bigint;
export {};

```

# src\components\bc\built\common\utils.js

```js
const isJUndefined = (a) => typeof a === 'undefined';
const isJNull = (a) => a === null;
const isJBoolean = (a) => typeof a === 'boolean';
const isJNumber = (a) => typeof a === 'number';
const isJString = (a) => typeof a === 'string';
const isJSymbol = (a) => typeof a === 'symbol';
const isJBigInt = (a) => typeof a === 'bigint';
const isJBasic = (a) => isJNull(a) ||
    isJUndefined(a) ||
    isJNumber(a) ||
    isJString(a) ||
    isJBoolean(a) ||
    isJSymbol(a) ||
    isJBigInt(a);
const isJObject = (a) => !isJBasic(a) && !Array.isArray(a);
const isJArray = (a) => !isJBasic(a) && Array.isArray(a);
const objectEntryMap = (g) => (object) => Object.fromEntries(Object.entries(object).map(g));
const objectMap = (f) => (object) => objectEntryMap(([key, value]) => [key, f(value)])(object);
export const jsonMap = (g) => (json) => {
    if (isJBasic(json))
        return g(json);
    if (isJArray(json))
        return g(json.map(jsonMap(g)));
    if (isJObject(json))
        return g(objectMap(jsonMap(g))(json));
    throw new Error('Unsupported type');
};
export const strip = (value) => {
    if (isJBasic(value))
        return value;
    if (isJArray(value))
        return value.map(strip);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _root, _rev, _satoshis, _owners, ...rest } = value;
    return rest;
};
// https://github.com/GoogleChromeLabs/jsbi/issues/30
export const toObject = (obj) => JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
export function isValidRevString(outId) {
    return /^[0-9A-Fa-f]{64}:\d+$/.test(outId);
}
export function isValidRev(value) {
    return typeof value === 'string' && isValidRevString(value);
}
export const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
export function getEnv(name) {
    return ((typeof process !== 'undefined' && process.env[`REACT_APP_${name}`]) ||
        (import.meta.env && import.meta.env[`VITE_${name}`]));
}
export function bigIntToStr(a) {
    if (a < 0n)
        throw new Error('Balance must be a non-negative');
    const scale = BigInt(1e8);
    const integerPart = (a / scale).toString();
    const fractionalPart = (a % scale).toString().padStart(8, '0').replace(/0+$/, '');
    return `${integerPart}.${fractionalPart || '0'}`;
}
export function strToBigInt(a) {
    // Validate number contains at most one dot and is not empty
    if ((a.match(/\./g) || []).length > 1 || a === '.' || a === '') {
        throw new Error('Invalid number');
    }
    const [integerPart, fractionalPart = ''] = a.split('.');
    // Validate integer and fractional part contains only digits (or is empty)
    if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
        throw new Error('Invalid number');
    }
    const paddedFractionalPart = fractionalPart.padEnd(8, '0').slice(0, 8);
    const totalSatoshisStr = integerPart + paddedFractionalPart;
    return BigInt(totalSatoshisStr);
}

```

# src\components\bc\built\ComputerContext.d.ts

```ts
import { Computer } from '@bitcoin-computer/lib';
export declare const ComputerContext: import("react").Context<Computer>;

```

# src\components\bc\built\ComputerContext.js

```js
import { Computer } from '@bitcoin-computer/lib';
import { createContext } from 'react';
export const ComputerContext = createContext(new Computer());

```

# src\components\bc\built\Drawer.d.ts

```ts
export declare function ShowDrawer({ text, id }: {
    text: string;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function DrawerComponent({ Content, id, }: {
    Content: (props: {
        isOpen: boolean;
    }) => JSX.Element;
    id: string;
}): import("react/jsx-runtime").JSX.Element;
export declare const Drawer: {
    Component: typeof DrawerComponent;
    ShowDrawer: typeof ShowDrawer;
};

```

# src\components\bc\built\Drawer.js

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
export function ShowDrawer({ text, id }) {
    return (_jsx("button", { "data-drawer-target": id, "data-drawer-show": id, "data-drawer-placement": "right", "aria-controls": id, children: text }));
}
export function DrawerComponent({ Content, id, }) {
    const [isOpen, setIsOpen] = useState(false);
    const drawerRef = useRef(null);
    useEffect(() => {
        const drawerElement = drawerRef.current;
        if (drawerElement) {
            const onTransitionEnd = (event) => {
                if (event.propertyName === 'transform')
                    setIsOpen(!drawerElement.classList.contains('translate-x-full'));
            };
            drawerElement.addEventListener('transitionend', onTransitionEnd);
            return () => {
                drawerElement.removeEventListener('transitionend', onTransitionEnd);
            };
        }
        return undefined;
    }, []);
    return (_jsxs("div", { ref: drawerRef, id: id, className: "fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform duration-300 translate-x-full bg-white w-80 dark:bg-gray-800", tabIndex: -1, "aria-labelledby": "drawer-right-label", children: [_jsxs("button", { type: "button", "data-drawer-hide": id, "aria-controls": id, className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white", children: [_jsx("svg", { className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) }), _jsx("span", { className: "sr-only", children: "Close menu" })] }), Content({ isOpen })] }));
}
export const Drawer = {
    Component: DrawerComponent,
    ShowDrawer,
};

```

# src\components\bc\built\Error404.d.ts

```ts
export declare const Error404: ({ message: m }: {
    message?: string;
}) => import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\Error404.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const Error404 = ({ message: m }) => {
    const Missing = () => (_jsxs(_Fragment, { children: [_jsx("h1", { className: "mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600", children: "404" }), _jsx("p", { className: "mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white", children: "Something's missing." }), _jsxs("p", { className: "mb-4 text-lg font-light text-gray-500 dark:text-gray-400", children: ["Sorry, we can't find that page. You'll find lots to explore on the home page.", ' '] }), _jsx("a", { href: "/", className: "inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4", children: "Back to Homepage" })] }));
    const Err = ({ message }) => (_jsxs(_Fragment, { children: [_jsx("h1", { className: "mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600", children: "400" }), _jsx("p", { className: "mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white", children: "Something went wrong." }), _jsx("p", { className: "mb-4 text-lg font-light text-gray-500 dark:text-gray-400", children: message })] }));
    return (_jsx("section", { className: "w-full bg-white dark:bg-gray-900", children: _jsx("div", { className: "py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6", children: _jsx("div", { className: "mx-auto max-w-screen-sm text-center", children: m ? _jsx(Err, { message: m }) : _jsx(Missing, {}) }) }) }));
};

```

# src\components\bc\built\Gallery.d.ts

```ts
export type Class = new (...args: any) => any;
export type UserQuery<T extends Class> = Partial<{
    mod: string;
    publicKey: string;
    limit: number;
    offset: number;
    order: 'ASC' | 'DESC';
    ids: string[];
    contract: {
        class: T;
        args?: ConstructorParameters<T>;
    };
}>;
declare function FromRevs({ revs, computer }: {
    revs: string[];
    computer: any;
}): import("react/jsx-runtime").JSX.Element;
export declare function GalleryWithPagination<T extends Class>(q: UserQuery<T>): import("react/jsx-runtime").JSX.Element;
export declare const Gallery: {
    FromRevs: typeof FromRevs;
    WithPagination: typeof GalleryWithPagination;
};
export {};

```

# src\components\bc\built\Gallery.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { initFlowbite } from 'flowbite';
import { jsonMap, strip, toObject } from './common/utils';
import { useUtilsComponents } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
function HomePageCard({ content }) {
    return (_jsx("div", { className: "block w-72 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700", children: _jsx("pre", { className: "font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs", children: content() }) }));
}
function ValueComponent({ rev, computer }) {
    const [value, setValue] = useState('loading...');
    const [errorMsg, setMsgError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetch = async () => {
            try {
                const synced = await computer.sync(rev);
                setValue(toObject(jsonMap(strip)(synced)));
            }
            catch (err) {
                if (err instanceof Error)
                    setMsgError(`Error: ${err.message}`);
            }
            setLoading(false);
        };
        fetch();
    }, [computer, rev]);
    const loadingContent = () => (_jsxs(_Fragment, { children: [_jsxs("svg", { "aria-hidden": "true", role: "status", className: "inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "#1C64F2" })] }), _jsx("span", { className: "loading-smart-contract-span", children: "\u00A0Loading..." })] }));
    return loading ? (_jsx(HomePageCard, { content: loadingContent })) : (_jsx(HomePageCard, { content: () => errorMsg || value }));
}
function FromRevs({ revs, computer }) {
    return (_jsx("div", { className: "flex flex-wrap flex-col max-h-[75vh] gap-4 mb-4 mt-4", children: revs.map((rev) => (_jsx("div", { children: _jsx(Link, { to: `/objects/${rev}`, className: "block font-medium text-blue-600 dark:text-blue-500", children: _jsx(ValueComponent, { rev: rev, computer: computer }) }) }, rev))) }));
}
function Pagination({ isPrevAvailable, handlePrev, isNextAvailable, handleNext }) {
    return (_jsx("nav", { className: "flex items-center justify-between", "aria-label": "Table navigation", children: _jsxs("ul", { className: "inline-flex items-center -space-x-px", children: [_jsx("li", { children: _jsxs("button", { disabled: !isPrevAvailable, onClick: handlePrev, className: "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Previous" }), _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 1 1 5l4 4" }) })] }) }), _jsx("li", { children: _jsxs("button", { disabled: !isNextAvailable, onClick: handleNext, className: "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Next" }), _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 9 4-4-4-4" }) })] }) })] }) }));
}
export function GalleryWithPagination(q) {
    const contractsPerPage = 12;
    const computer = useContext(ComputerContext);
    const { showLoader } = useUtilsComponents();
    const [pageNum, setPageNum] = useState(0);
    const [isNextAvailable, setIsNextAvailable] = useState(true);
    const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0);
    const [showNoAsset, setShowNoAsset] = useState(false);
    const [revs, setRevs] = useState([]);
    const location = useLocation();
    const params = Object.fromEntries(new URLSearchParams(location.search));
    useEffect(() => {
        initFlowbite();
    }, []);
    useEffect(() => {
        const fetch = async () => {
            showLoader(true);
            const query = { ...q, ...params };
            query.offset = contractsPerPage * pageNum;
            query.limit = contractsPerPage + 1;
            query.order = 'DESC';
            const result = await computer.getOUTXOs(query);
            setIsNextAvailable(result.length > contractsPerPage);
            setRevs(result.slice(0, contractsPerPage));
            if (pageNum === 0 && result?.length === 0)
                setShowNoAsset(true);
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
        if (pageNum - 1 === 0)
            setIsPrevAvailable(false);
        setPageNum(pageNum - 1);
    };
    return (_jsxs("div", { className: "relative sm:rounded-lg pt-4 w-full", children: [_jsx(FromRevs, { revs: revs, computer: computer }), !(pageNum === 0 && revs && revs.length === 0) && (_jsx(Pagination, { revs: revs, isPrevAvailable: isPrevAvailable, handlePrev: handlePrev, isNextAvailable: isNextAvailable, handleNext: handleNext })), pageNum === 0 && revs && revs.length === 0 && showNoAsset && (_jsx("h1", { className: "w-full mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white text-center mx-auto", children: "No Assets" }))] }));
}
export const Gallery = {
    FromRevs,
    WithPagination: GalleryWithPagination,
};

```

# src\components\bc\built\index.d.ts

```ts
export { SnackBar } from './SnackBar';
export { Auth } from './Auth';
export { Modal, getModal, showModal, hideModal, toggleModal, ShowModalButton, HideModalButton, ToggleModalButton, ModalComponent, } from './Modal';
export { Gallery, GalleryWithPagination } from './Gallery';
export { SmartObject } from './SmartObject';
export { Transaction, TransactionComponent } from './Transaction';
export { Error404 } from './Error404';
export { UtilsContext, UtilsProvider, useUtilsComponents } from './UtilsContext';
export { ComputerContext } from './ComputerContext';
export { FunctionResultModalContent } from './common/SmartCallExecutionResult';
export { Drawer, DrawerComponent, ShowDrawer } from './Drawer';
export { Wallet } from './Wallet';
export { Card } from './Card';
export * from './common/utils';
export { PrimaryActionButton, SecondaryActionButton } from './ActionButtons';

```

# src\components\bc\built\index.js

```js
export { SnackBar } from './SnackBar';
export { Auth } from './Auth';
export { Modal, getModal, showModal, hideModal, toggleModal, ShowModalButton, HideModalButton, ToggleModalButton, ModalComponent, } from './Modal';
export { Gallery, GalleryWithPagination } from './Gallery';
export { SmartObject } from './SmartObject';
export { Transaction, TransactionComponent } from './Transaction';
export { Error404 } from './Error404';
export { UtilsContext, UtilsProvider, useUtilsComponents } from './UtilsContext';
export { ComputerContext } from './ComputerContext';
export { FunctionResultModalContent } from './common/SmartCallExecutionResult';
export { Drawer, DrawerComponent, ShowDrawer } from './Drawer';
export { Wallet } from './Wallet';
export { Card } from './Card';
export * from './common/utils';
export { PrimaryActionButton, SecondaryActionButton } from './ActionButtons';

```

# src\components\bc\built\Loader.d.ts

```ts
export declare function Loader(): import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\Loader.js

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Loader() {
    return (_jsx("div", { className: "grid place-items-center h-screen w-full top-0 left-0 fixed z-50", children: _jsxs("svg", { "aria-hidden": "true", className: "mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentFill" })] }) }));
}

```

# src\components\bc\built\Modal.d.ts

```ts
import { Modal as ModalClass } from 'flowbite';
export declare const getModal: (id: string) => ModalClass;
export declare const showModal: (id: string) => void;
export declare const hideModal: (id: string, onClickClose?: () => void) => void;
export declare const toggleModal: (id: string) => void;
export declare const ShowModalButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
export declare const HideModalButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
export declare const ToggleModalButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
export declare const ModalComponent: ({ title, content, contentData, id, onClickClose, hideClose, }: {
    title: string;
    content: any;
    id: string;
    contentData?: any;
    onClickClose?: () => void;
    hideClose?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export declare const Modal: {
    get: (id: string) => ModalClass;
    showModal: (id: string) => void;
    hideModal: (id: string, onClickClose?: () => void) => void;
    toggleModal: (id: string) => void;
    ShowButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    HideButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    ToggleButton: ({ id, text }: any) => import("react/jsx-runtime").JSX.Element;
    Component: ({ title, content, contentData, id, onClickClose, hideClose, }: {
        title: string;
        content: any;
        id: string;
        contentData?: any;
        onClickClose?: () => void;
        hideClose?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
};

```

# src\components\bc\built\Modal.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Modal as ModalClass } from 'flowbite';
export const getModal = (id) => {
    const $modalElement = document.querySelector(`#${id}`);
    const modalOptions = {};
    const instanceOptions = { id, override: true };
    return new ModalClass($modalElement, modalOptions, instanceOptions);
};
export const showModal = (id) => {
    getModal(id).show();
};
export const hideModal = (id, onClickClose) => {
    getModal(id).hide();
    if (onClickClose) {
        onClickClose();
    }
};
export const toggleModal = (id) => {
    getModal(id).toggle();
};
export const ShowModalButton = ({ id, text }) => (_jsx("button", { "data-modal-target": id, "data-modal-show": id, type: "button", children: text }));
export const HideModalButton = ({ id, text }) => (_jsx("button", { "data-modal-target": id, "data-modal-hide": id, type: "button", children: text }));
export const ToggleModalButton = ({ id, text }) => (_jsx("button", { "data-modal-target": id, "data-modal-toggle": id, type: "button", children: text }));
export const ModalComponent = ({ title, content, contentData, id, onClickClose, hideClose, }) => (_jsx("div", { id: id, tabIndex: -1, "aria-hidden": "true", style: { zIndex: 45 }, className: "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full", children: _jsx("div", { className: "relative p-4 w-full max-w-sm max-h-full", children: _jsxs("div", { className: "relative bg-white rounded-lg shadow dark:bg-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: title }), !hideClose ? (_jsxs("button", { type: "button", className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white", "data-modal-hide": id, "data-modal-target": id, onClick: () => hideModal(id, onClickClose), children: [_jsx("svg", { className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) }), _jsx("span", { className: "sr-only", children: "Close modal" })] })) : (_jsx(_Fragment, {}))] }), content(contentData)] }) }) }));
export const Modal = {
    get: getModal,
    showModal,
    hideModal,
    toggleModal,
    ShowButton: ShowModalButton,
    HideButton: HideModalButton,
    ToggleButton: ToggleModalButton,
    Component: ModalComponent,
};

```

# src\components\bc\built\SmartObject.d.ts

```ts
export declare const getFnParamNames: (fn: string) => string[];
declare function Component({ title }: {
    title?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare const SmartObject: {
    Component: typeof Component;
};
export {};

```

# src\components\bc\built\SmartObject.js

```js
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { HiOutlineClipboard } from 'react-icons/hi';
import { capitalizeFirstLetter, toObject } from './common/utils';
import { Card } from './Card';
import { Modal } from './Modal';
import { FunctionResultModalContent } from './common/SmartCallExecutionResult';
import { SmartObjectFunctions } from './SmartObjectFunctions';
import { ComputerContext } from './ComputerContext';
const keywords = ['_id', '_rev', '_owners', '_root', '_satoshis'];
const modalId = 'smart-object-info-modal';
export const getFnParamNames = (fn) => {
    const match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
};
function Copy({ text }) {
    return (_jsx("button", { onClick: () => navigator.clipboard.writeText(text), className: "cursor-pointer pl-2 text-gray-600 hover:text-gray-800 focus:outline-none", "aria-label": "Copy Transaction ID", children: _jsx(HiOutlineClipboard, {}) }));
}
function ObjectValueCard({ content, id }) {
    const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g;
    const revLink = (rev, i) => (_jsx(Link, { to: `/objects/${rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: rev }, i));
    const formattedContent = reactStringReplace(content, isRev, revLink);
    return _jsx(Card, { content: formattedContent, id: `property-${id}-value` });
}
const SmartObjectValues = ({ smartObject }) => {
    if (!smartObject)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: Object.entries(smartObject)
            .filter(([k]) => !keywords.includes(k))
            .map(([key, value], i) => (_jsxs("div", { children: [_jsx("h3", { className: "mt-2 text-xl font-bold dark:text-white", children: capitalizeFirstLetter(key) }), _jsx(ObjectValueCard, { id: key, content: toObject(value) })] }, i))) }));
};
function MetaData({ smartObject, prev, next }) {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "pt-6 pb-6 space-y-4 border-t border-gray-300 dark:border-gray-700", children: _jsxs("div", { className: "flex", children: [_jsx("a", { href: prev ? `/objects/${prev}` : undefined, className: `flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      ${prev
                                ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`, "aria-disabled": !prev, children: "Previous" }), _jsx("a", { href: next ? `/objects/${next}` : undefined, className: `flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      ${next
                                ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`, "aria-disabled": !next, children: "Next" }), _jsx("button", { onClick: toggleVisibility, className: `flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition 
      bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700`, children: isVisible ? 'Hide Metadata' : 'Show Metadata' })] }) }), isVisible && (_jsxs("table", { className: "w-full mt-4 mb-8 text-[12px] text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 py-2", children: "Key" }), _jsx("th", { scope: "col", className: "px-4 py-2", children: "Short" }), _jsx("th", { scope: "col", className: "px-4 py-2", children: "Value" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Identity" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_id" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: `/objects/${smartObject?._id}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject?._id }), _jsx(Copy, { text: smartObject?._id })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Revision" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_rev" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: `/objects/${smartObject?._rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject?._rev }), _jsx(Copy, { text: smartObject?._rev })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Root" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_root" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: `/objects/${smartObject?._root}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject?._root }), _jsx(Copy, { text: smartObject?._root })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Owners" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_owners" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject?._owners }), _jsx(Copy, { text: JSON.stringify(smartObject?._owners) })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Amount" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_satoshis" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject?._satoshis.toString() }), _jsx(Copy, { text: smartObject?._satoshis.toString() })] })] })] })] }))] }));
}
function Component({ title }) {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const [rev] = useState(params.rev || '');
    const computer = useContext(ComputerContext);
    const [smartObject, setSmartObject] = useState(null);
    const [next, setNext] = useState(undefined);
    const [prev, setPrev] = useState(undefined);
    const [functionsExist, setFunctionsExist] = useState(false);
    const [functionResult, setFunctionResult] = useState({});
    const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol'];
    const [modalTitle, setModalTitle] = useState('');
    const setShow = (flag) => {
        if (flag) {
            Modal.get(modalId).show();
        }
        else {
            Modal.get(modalId).hide();
        }
    };
    useEffect(() => {
        const fetch = async () => {
            try {
                const [o, p, n] = await Promise.all([
                    computer.sync(rev),
                    computer.prev(rev),
                    computer.next(rev),
                ]);
                setSmartObject(o);
                setPrev(p);
                setNext(n);
            }
            catch (err) {
                if (err instanceof Error)
                    console.log('Error syncing to object:', err.message);
                const [txId] = rev.split(':');
                navigate(`/transactions/${txId}`);
            }
        };
        fetch();
    }, [computer, rev, location, navigate]);
    useEffect(() => {
        let funcExist = false;
        if (smartObject) {
            const filteredSmartObject = Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject)).filter((key) => key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function');
            Object.keys(filteredSmartObject).forEach((key) => {
                if (key) {
                    funcExist = true;
                }
            });
        }
        setFunctionsExist(funcExist);
    }, [smartObject]);
    const [txId, outNum] = rev.split(':');
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "max-w-screen-md mx-auto", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: title || 'Object' }), _jsxs("div", { className: "mb-8", children: [_jsx(Link, { to: `/transactions/${txId}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: txId }), _jsxs("span", { children: [":", outNum] }), _jsx(Copy, { text: `${txId}:${outNum}` })] }), _jsx(SmartObjectValues, { smartObject: smartObject }), _jsx(SmartObjectFunctions, { smartObject: smartObject, functionsExist: functionsExist, options: options, setFunctionResult: setFunctionResult, setShow: setShow, setModalTitle: setModalTitle }), _jsx(MetaData, { smartObject: smartObject, prev: prev, next: next })] }), _jsx(Modal.Component, { title: modalTitle, content: FunctionResultModalContent, contentData: { functionResult }, id: modalId })] }));
}
export const SmartObject = {
    Component,
};

```

# src\components\bc\built\SmartObjectFunction.d.ts

```ts
export declare const getErrorMessage: (error: any) => string;
export declare const getParameterNames: (fn: string) => string[];
export declare const SmartObjectFunction: ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, funcName, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    setFunctionResult: React.Dispatch<any>;
    setShow: any;
    setModalTitle: React.Dispatch<React.SetStateAction<string>>;
    funcName: string;
}) => import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\SmartObjectFunction.js

```js
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useMemo, useState } from 'react';
import { TypeSelectionDropdown } from './common/TypeSelectionDropdown';
import { isValidRev, sleep } from './common/utils';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
export const getErrorMessage = (error) => {
    if (error?.response?.data?.error ===
        'mandatory-script-verify-flag-failed (Operation not valid with the current stack size)')
        return 'You are not authorized to make changes to this smart object';
    if (error?.response?.data?.error)
        return error?.response?.data?.error;
    return error.message ? error.message : 'Error occurred';
};
const getValueForType = (type, stringValue) => {
    switch (type) {
        case 'number':
            return Number(stringValue);
        case 'string':
            return stringValue;
        case 'boolean':
            return stringValue === 'true';
        case 'undefined':
            return undefined;
        case 'null':
            return null;
        case 'object':
            return stringValue;
        default:
            return Number(stringValue);
    }
};
export const getParameterNames = (fn) => {
    const match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
};
const getParameters = (params, fnName, formState) => params.map((param) => {
    const key = `${fnName}-${param}`;
    const paramValue = getValueForType(formState[`${key}--types`], formState[key]);
    if (isValidRev(paramValue))
        return param;
    if (typeof paramValue === 'string')
        return `'${paramValue}'`;
    return paramValue;
});
export const SmartObjectFunction = ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, funcName, }) => {
    const parameterList = getParameterNames(Object.getPrototypeOf(smartObject)[funcName]).filter((val) => val);
    const [formState, setFormState] = useState(Object.fromEntries(parameterList.flatMap((key) => [
        [`${funcName}-${key}`, ''],
        [`${funcName}-${key}--types`, ''],
    ])));
    const { showLoader } = UtilsContext.useUtilsComponents();
    const computer = useContext(ComputerContext);
    const handleMethodCall = async (event, smartObj, fnName, params) => {
        event.preventDefault();
        showLoader(true);
        try {
            const revMap = {};
            // Create Rev Map to pass smart objects as params
            params.forEach((param) => {
                const key = `${fnName}-${param}`;
                const paramValue = getValueForType(formState[`${key}--types`], formState[key]);
                if (isValidRev(paramValue)) {
                    revMap[param] = paramValue;
                }
            });
            const { tx } = await computer.encode({
                exp: `smartObject.${fnName}(${getParameters(params, fnName, formState)})`,
                env: { smartObject: smartObj._rev, ...revMap },
            });
            await computer.broadcast(tx);
            await sleep(1000);
            const rev = await computer.latest(smartObject._id);
            setFunctionResult({ _rev: rev });
            setModalTitle('Success');
            setShow(true);
        }
        catch (error) {
            setFunctionResult(getErrorMessage(error));
            setModalTitle('Error!');
            setShow(true);
        }
        finally {
            showLoader(false);
        }
    };
    const updateForm = (e, key) => {
        e.preventDefault();
        const value = { ...formState };
        value[key] = e.target.value;
        setFormState(value);
    };
    const updateTypes = (option, key) => {
        const value = { ...formState };
        value[`${key}--types`] = option;
        setFormState(value);
    };
    const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const isDisabled = useMemo(() => Object.keys(formState).length > 0 && Object.values(formState).some((value) => value === ''), [formState]);
    if (!functionsExist)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "mt-6 mb-6", id: `function-${funcName}`, children: [_jsx("h3", { className: "my-2 text-xl font-bold dark:text-white", children: capitalizeFirstLetter(funcName) }), _jsxs("form", { children: [parameterList.map((paramName, paramIndex) => (_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("input", { type: "text", id: `${funcName}-${paramName}`, value: formState[`${funcName}-${paramName}`] || '', onChange: (e) => updateForm(e, `${funcName}-${paramName}`), className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500", placeholder: paramName, required: true }), _jsx(TypeSelectionDropdown, { id: `${funcName}${paramName}`, dropdownList: options, onSelectMethod: (option) => updateTypes(option, `${funcName}-${paramName}`) })] }) }, paramIndex))), _jsx("button", { id: `${funcName}-call-function-button`, disabled: isDisabled, className: `text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:ring-4 focus:outline-none
              ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'}
            `, onClick: (evt) => handleMethodCall(evt, smartObject, funcName, parameterList), children: "Call Function" })] })] }) }));
};

```

# src\components\bc\built\SmartObjectFunctions.d.ts

```ts
export declare const SmartObjectFunctions: ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, }: {
    smartObject: any;
    functionsExist: boolean;
    options: string[];
    setFunctionResult: React.Dispatch<any>;
    setShow: any;
    setModalTitle: React.Dispatch<React.SetStateAction<string>>;
}) => import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\SmartObjectFunctions.js

```js
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { SmartObjectFunction } from './SmartObjectFunction';
export const SmartObjectFunctions = ({ smartObject, functionsExist, options, setFunctionResult, setShow, setModalTitle, }) => {
    if (!functionsExist)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
            .filter((key) => key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function')
            .map((key, fnIndex) => (_jsx("div", { children: _jsx(SmartObjectFunction, { funcName: key, smartObject: smartObject, functionsExist: functionsExist, options: options, setFunctionResult: setFunctionResult, setShow: setShow, setModalTitle: setModalTitle }) }, fnIndex))) }));
};

```

# src\components\bc\built\SnackBar.d.ts

```ts
interface SnackBarProps {
    message: string;
    success: boolean;
    hideSnackBar: () => void;
}
export declare function SnackBar(props: SnackBarProps): import("react/jsx-runtime").JSX.Element;
export {};

```

# src\components\bc\built\SnackBar.js

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export function SnackBar(props) {
    const { message, success, hideSnackBar } = props;
    const closeMessage = (evt) => {
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
    return (_jsxs("div", { className: success
            ? `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
            : `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`, role: "alert", children: [_jsx("strong", { className: "font-bold pr-6", children: message }), _jsx("span", { className: "absolute top-0 bottom-0 right-0 px-4 py-3", onClick: closeMessage, children: _jsxs("svg", { className: success ? `fill-current h-6 w-6 text-green-500` : `fill-current h-6 w-6 text-red-500`, role: "button", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", children: [_jsx("title", { children: "Close" }), _jsx("path", { d: "M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" })] }) })] }));
}

```

# src\components\bc\built\Transaction.d.ts

```ts
export declare function TransactionComponent(): import("react/jsx-runtime").JSX.Element;
export declare const Transaction: {
    Component: typeof TransactionComponent;
};

```

# src\components\bc\built\Transaction.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { Card } from './Card';
import { ComputerContext } from './ComputerContext';
function ExpressionCard({ content, env }) {
    const entries = Object.entries(env);
    let formattedContent = content;
    entries.forEach((entry) => {
        const [name, rev] = entry;
        const regExp = new RegExp(`(${name})`, 'g');
        const replacer = (n, ind) => (_jsx(Link, { to: `/objects/${rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: n }, `${rev}|${ind}`));
        formattedContent = reactStringReplace(formattedContent, regExp, replacer);
    });
    return _jsx(Card, { content: formattedContent });
}
export function TransactionComponent() {
    const location = useLocation();
    const params = useParams();
    const computer = useContext(ComputerContext);
    const [txn, setTxn] = useState(params.txn);
    const [txnData, setTxnData] = useState(null);
    const [rpcTxnData, setRPCTxnData] = useState(null);
    const [transition, setTransition] = useState(null);
    useEffect(() => {
        const fetch = async () => {
            setTxn(params.txn);
            const [hex] = await computer.db.wallet.restClient.getRawTxs([params.txn]);
            const tx = BCTransaction.fromHex(hex);
            setTxnData(tx);
            const { result } = await computer.rpc('getrawtransaction', `${params.txn} 2`);
            setRPCTxnData(result);
        };
        fetch();
    }, [computer, txn, location, params.txn]);
    useEffect(() => {
        const fetch = async () => {
            try {
                if (txnData)
                    setTransition(await computer.decode(txnData));
            }
            catch (err) {
                if (err instanceof Error) {
                    setTransition('');
                    console.log('Error parsing transaction', err.message);
                }
            }
        };
        fetch();
    }, [computer, txnData, txn]);
    const envTable = (env) => (_jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output" })] }) }), _jsx("tbody", { children: Object.entries(env).map(([name, output]) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: name }), _jsx("td", { className: "px-6 py-4", children: _jsx(Link, { to: `/objects/${output}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: output }) })] }, output))) })] }));
    const transitionComponent = () => (_jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Expression" }), _jsx(ExpressionCard, { content: transition.exp, env: transition.env }), _jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Environment" }), envTable(transition.env), transition.mod && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Module Specifier" }), _jsx(Card, { content: transition.mod })] }))] }));
    const inputsComponent = () => (_jsxs("div", { className: "relative overflow-x-auto sm:rounded-lg", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Inputs" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Transaction Id" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script" })] }) }), _jsx("tbody", { children: rpcTxnData?.vin?.map((input, ind) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsx(Link, { to: `/transactions/${input.txid}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: input.txid }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs(Link, { to: `/objects/${input.txid}:${input.vout}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", input.vout] }) }), _jsx("td", { className: "px-6 py-4 break-all", children: input.scriptSig?.asm })] }, `${input.txid}|${ind}`))) })] })] }));
    const outputsComponent = () => (_jsxs("div", { className: "relative overflow-x-auto", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Objects" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Value" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Type" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script PubKey" })] }) }), _jsx("tbody", { children: rpcTxnData?.vout?.map((output) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsxs(Link, { to: `/objects/${txn}:${output.n}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", output.n] }) }), _jsx("td", { className: "px-6 py-4", children: output.value }), _jsx("td", { className: "px-6 py-4", children: output.scriptPubKey.type }), _jsx("td", { className: "px-6 py-4 break-all", children: output.scriptPubKey.asm })] }, output.n))) })] })] }));
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "pt-8", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: "Transaction" }), _jsx("p", { className: "mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400", children: txn }), transition && transitionComponent(), rpcTxnData?.vin && inputsComponent(), rpcTxnData?.vout && outputsComponent()] }) }));
}
export const Transaction = { Component: TransactionComponent };

```

# src\components\bc\built\UtilsContext.d.ts

```ts
import React, { ReactNode } from 'react';
interface UtilsContextProps {
    showSnackBar: (message: string, success: boolean) => void;
    hideSnackBar: () => void;
    showLoader: (show: boolean) => void;
}
export declare const useUtilsComponents: () => UtilsContextProps;
interface UtilsProviderProps {
    children: ReactNode;
}
export declare const UtilsProvider: React.FC<UtilsProviderProps>;
export declare const UtilsContext: {
    UtilsProvider: React.FC<UtilsProviderProps>;
    useUtilsComponents: () => UtilsContextProps;
};
export {};

```

# src\components\bc\built\UtilsContext.js

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { SnackBar } from './SnackBar';
import { Loader } from './Loader';
const utilsContext = createContext(undefined);
export const useUtilsComponents = () => {
    const context = useContext(utilsContext);
    if (!context)
        throw new Error('useUtilsComponents must be used within a UtilsProvider');
    return context;
};
export const UtilsProvider = ({ children }) => {
    const [snackBar, setSnackBar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const showSnackBar = (message, success) => {
        setSnackBar({ message, success });
    };
    const showLoader = (show) => {
        setIsLoading(show);
    };
    const hideSnackBar = () => {
        setSnackBar(null);
    };
    return (_jsxs(utilsContext.Provider, { value: { showSnackBar, hideSnackBar, showLoader }, children: [children, snackBar && (_jsx(SnackBar, { message: snackBar.message, success: snackBar.success, hideSnackBar: hideSnackBar })), isLoading && _jsx(Loader, {})] }));
};
export const UtilsContext = {
    UtilsProvider,
    useUtilsComponents,
};

```

# src\components\bc\built\Wallet.d.ts

```ts
export declare function Wallet({ modSpecs }: {
    modSpecs?: string[];
}): import("react/jsx-runtime").JSX.Element;

```

# src\components\bc\built\Wallet.js

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useContext, useEffect, useState } from 'react';
import { HiRefresh } from 'react-icons/hi';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { Auth } from './Auth';
import { Drawer } from './Drawer';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
import { getEnv, bigIntToStr } from './common/utils';
import { VITE_WITHDRAW_MOD_SPEC } from './common/modSpecs';
const Loader = () => (_jsxs("span", { role: "status", children: [_jsxs("svg", { "aria-hidden": "true", className: "inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentFill" })] }), _jsx("span", { className: "sr-only", children: "Loading..." })] }));
const BalanceDisplay = ({ balance, chain, network, isRegtest, isRefreshing, onRefresh, onFund, }) => (_jsxs("div", { id: "dropdown-cta", className: "relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900", role: "alert", children: [_jsxs("div", { className: "text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400", children: [bigIntToStr(balance), " ", chain, ' ', _jsx(HiRefresh, { onClick: onRefresh, className: `w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100 ${isRefreshing ? 'animate-spin' : ''}` })] }), _jsx("div", { className: "text-center uppercase text-xs text-blue-800 dark:text-blue-400", children: network }), isRegtest && (_jsx("button", { id: "fund-wallet", type: "button", onClick: onFund, className: "absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800", children: "Fund" }))] }));
const Withdraw = ({ computer, paymentsWrapper: payments, onSuccess, }) => {
    const { showSnackBar } = UtilsContext.useUtilsComponents();
    const [address, setAddress] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const handleWithdraw = async () => {
        try {
            setWithdrawing(true);
            if (!address || !address.trim()) {
                showSnackBar('Please input valid address', false);
                return;
            }
            const revs = payments.map((p) => p._rev);
            await computer.delete(revs);
            const { balance } = await computer.getBalance();
            const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')));
            await computer.send(balance - minDust, address);
            setAddress('');
            if (onSuccess)
                await onSuccess();
        }
        catch (err) {
            if (err instanceof Error)
                showSnackBar(`Something went wrong, ${err.message}`, false);
        }
        finally {
            setWithdrawing(false);
        }
    };
    return (_jsxs("div", { className: "my-2", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Withdraw to Address" }), _jsxs("div", { className: "flex items-center space-x-2 my-2", children: [_jsx("input", { type: "text", value: address, onChange: (e) => setAddress(e.target.value), className: "block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500", placeholder: "Recipient Address" }), _jsx("button", { type: "button", onClick: handleWithdraw, disabled: withdrawing, className: "px-3 py-1.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", children: withdrawing ? _jsx(Loader, {}) : _jsx(_Fragment, { children: "Withdraw" }) })] })] }));
};
const Balance = ({ computer, modSpecs, isOpen, }) => {
    const [balance, setBalance] = useState(0n);
    const [paymentsWrapper, setPaymentsWrapper] = useState([]);
    const { showSnackBar } = UtilsContext.useUtilsComponents();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshBalance = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const publicKey = computer.getPublicKey();
            const allPayments = [];
            const balances = await Promise.all(modSpecs.map(async (mod) => {
                const paymentRevs = await computer.getOUTXOs({ publicKey, mod });
                const payments = (await Promise.all(paymentRevs.map((rev) => computer.sync(rev))));
                allPayments.push(...payments);
                const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')));
                return payments && payments.length
                    ? payments.reduce((total, pay) => total + (pay._satoshis - minDust), 0n)
                    : 0n;
            }));
            const amountsInPayments = balances.reduce((acc, curr) => acc + curr, 0n);
            const walletBalance = await computer.getBalance();
            setBalance(walletBalance.balance + amountsInPayments);
            setPaymentsWrapper(allPayments);
        }
        catch {
            showSnackBar('Error fetching wallet details', false);
        }
        finally {
            setIsRefreshing(false);
        }
    }, [computer, modSpecs, showSnackBar]);
    const fund = async () => {
        setIsRefreshing(true);
        try {
            const amount = computer.getChain() === 'PEPE' ? 10e8 : 1e8;
            await computer.faucet(amount);
            await refreshBalance();
        }
        catch (err) {
            if (err instanceof Error) {
                showSnackBar(`Error funding wallet: ${err.message}`, false);
            }
        }
        finally {
            setIsRefreshing(false);
        }
    };
    useEffect(() => {
        if (isOpen)
            refreshBalance();
    }, [isOpen, refreshBalance]);
    return (_jsxs(_Fragment, { children: [_jsx(BalanceDisplay, { balance: balance, chain: computer.getChain(), network: computer.getNetwork(), isRegtest: computer.getNetwork() === 'regtest', isRefreshing: isRefreshing, onRefresh: refreshBalance, onFund: fund }), _jsx(Address, { computer: computer }), !!VITE_WITHDRAW_MOD_SPEC && (_jsx(Withdraw, { computer: computer, paymentsWrapper: paymentsWrapper, onSuccess: refreshBalance }))] }));
};
const CopyableField = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { className: "my-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: label }), _jsx("button", { onClick: handleCopy, className: "ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white", "aria-label": `Copy ${label.toLowerCase()}`, children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "my-2 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: value })] }));
};
const Address = ({ computer }) => (_jsx(CopyableField, { label: "Deposit Address", value: computer.getAddress() }));
const PublicKey = ({ computer }) => (_jsx(CopyableField, { label: "Public Key", value: computer.getPublicKey() }));
const RevealableField = ({ label, getValue }) => {
    const [shown, setShown] = useState(false);
    return (_jsxs("div", { className: "my-2", children: [_jsxs("h6", { className: "text-lg font-bold dark:text-white", children: [label, ' ', _jsx("button", { onClick: () => setShown(!shown), className: "text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline", children: shown ? 'hide' : 'show' })] }), _jsx("p", { className: "text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: shown ? getValue() : '' })] }));
};
const Mnemonic = ({ computer }) => (_jsx(RevealableField, { label: "Mnemonic", getValue: computer.getMnemonic }));
const SimpleField = ({ label, value }) => (_jsxs("div", { className: "my-2", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: label }), _jsx("p", { className: "my-2 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: value })] }));
const Url = ({ computer }) => (_jsx(SimpleField, { label: "Node Url", value: computer.getUrl() }));
const Chain = ({ computer }) => (_jsx(SimpleField, { label: "Chain", value: computer.getChain() }));
const Network = ({ computer }) => (_jsx(SimpleField, { label: "Network", value: computer.getNetwork() }));
const Path = ({ computer }) => (_jsx(SimpleField, { label: "Path", value: computer.getPath() }));
const LogOut = () => (_jsxs(_Fragment, { children: [_jsxs("div", { className: "my-2", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Log Out" }), _jsx("p", { className: "mb-1 text-sm text-gray-500 dark:text-gray-400", children: "Logging out will delete your mnemonic. Make sure to write it down." })] }), _jsx("button", { type: "button", onClick: Auth.logout, className: "px-3 py-1.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", children: "Log Out" })] }));
export function Wallet({ modSpecs }) {
    const computer = useContext(ComputerContext);
    const Content = ({ isOpen }) => (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-2xl font-bold dark:text-white", children: "Wallet" }), _jsx(Balance, { computer: computer, modSpecs: modSpecs || [], isOpen: isOpen }), _jsx(PublicKey, { computer: computer }), _jsx(Mnemonic, { computer: computer }), !getEnv('CHAIN') && _jsx(Chain, { computer: computer }), !getEnv('NETWORK') && _jsx(Network, { computer: computer }), !getEnv('URL') && _jsx(Url, { computer: computer }), !getEnv('PATH') && _jsx(Path, { computer: computer }), _jsx("hr", { className: "h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] }));
    return _jsx(Drawer.Component, { Content: Content, id: "wallet-drawer" });
}

```

# src\components\bc\eslint.config.js

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

# src\components\bc\index.ts

```ts
/**
 * BC Components - Wrappers for bitcoin-computer components
 */

'use client'

export { ComputerContext } from './ComputerContext'
export { UtilsProvider, UtilsContext } from './UtilsContext'
export { Wallet } from './Wallet'
export { Auth } from './Auth'
export { SmartObject } from './SmartObject'
export { Transaction } from './Transaction'
export { Card } from './Card'
export { Modal, showModal, hideModal, toggleModal } from './Modal'
export { Gallery } from './Gallery'
export { SnackBar } from './SnackBar'

```

# src\components\bc\LEGAL.md

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

# src\components\bc\LICENSE.md

```md
MIT License

Copyright (c) 2025 BCDB Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**Note**: This license applies only to the copyright of the source code and documentation. For additional terms, including patent notices and payment requirements, see [LEGAL.md](./LEGAL.md).

```

# src\components\bc\package.json

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

# src\components\bc\README.md

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

# src\components\bc\src\ActionButtons.tsx

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

# src\components\bc\src\Auth.tsx

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

# src\components\bc\src\Card.tsx

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

# src\components\bc\src\common\Components.tsx

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

# src\components\bc\src\common\modSpecs.ts

```ts
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key]
  if (value) return value
  return ''
}

export const VITE_WITHDRAW_MOD_SPEC: string = getEnvVar('VITE_WITHDRAW_MOD_SPEC')

```

# src\components\bc\src\common\SmartCallExecutionResult.tsx

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

# src\components\bc\src\common\types.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'testnet' | 'mainnet' | 'regtest'
export type ModuleStorageType = 'taproot' | 'multisig'

```

# src\components\bc\src\common\TypeSelectionDropdown.tsx

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

# src\components\bc\src\common\utils.ts

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
    (import.meta.env && import.meta.env[`VITE_${name}`])
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

# src\components\bc\src\ComputerContext.tsx

```tsx
import { Computer } from '@bitcoin-computer/lib'
import { createContext } from 'react'

export const ComputerContext = createContext(new Computer())

```

# src\components\bc\src\Drawer.tsx

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

# src\components\bc\src\Error404.tsx

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

# src\components\bc\src\Gallery.tsx

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

# src\components\bc\src\index.tsx

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

# src\components\bc\src\Loader.tsx

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

# src\components\bc\src\Modal.tsx

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

# src\components\bc\src\SmartObject.tsx

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

# src\components\bc\src\SmartObjectFunction.tsx

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
      const rev = await computer.latest(smartObject._id)
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

# src\components\bc\src\SmartObjectFunctions.tsx

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

# src\components\bc\src\SnackBar.tsx

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

# src\components\bc\src\Transaction.tsx

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

      const { result } = await computer.rpc('getrawtransaction', `${params.txn} 2`)
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

# src\components\bc\src\UtilsContext.tsx

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

# src\components\bc\src\Wallet.tsx

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

# src\components\bc\test\utils.test.ts

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

# src\components\bc\tsconfig.json

```json
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
    "types": ["vite/client"],
    "paths": {
      "react": ["./node_modules/@types/react"]
    }
  },
  "include": ["src"],
  "exclude": ["./built/*"]
}

```

# src\components\Button.tsx

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

# src\components\Card.tsx

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

# src\components\index.ts

```ts
export { Button } from './Button.js'
export { Card } from './Card.js'
export { Loader } from './Loader.js'
export * from './layout'
export * from './bc'

```

# src\components\layout\index.ts

```ts
export { Navigation } from './Navigation'

```

# src\components\layout\Navigation.tsx

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

# src\components\Loader.tsx

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

# src\config\constants.ts

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
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD || '',
  quizAttemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || '',
}
```

# src\config\env.ts

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
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD || '',
  attemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || ''
}

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
  return Object.values(MODULE_SPECS).every(mod => mod !== '')
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

# src\config\index.ts

```ts
export * from './env'
export * from './constants'

```

# src\features\access\access.service.ts

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

# src\features\access\components\BuyAccessModal.tsx

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

# src\features\access\components\index.ts

```ts
export { BuyAccessModal } from './BuyAccessModal'

```

# src\features\access\index.ts

```ts
export * from './access.service'
export * from './components'

```

# src\features\attempts\attempts.service.ts

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

# src\features\attempts\components\AttemptForm.tsx

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

# src\features\attempts\components\index.ts

```ts
export { AttemptForm } from './AttemptForm'
export { ResultPanel } from './ResultPanel'

```

# src\features\attempts\components\ResultPanel.tsx

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

# src\features\attempts\index.ts

```ts
export * from './attempts.service'
export * from './components'

```

# src\features\index.ts

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

# src\features\leaderboard\components\index.ts

```ts
export { LeaderboardTable } from './LeaderboardTable'

```

# src\features\leaderboard\components\LeaderboardTable.tsx

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

# src\features\leaderboard\index.ts

```ts
export * from './leaderboard.service'
export * from './components'

```

# src\features\leaderboard\leaderboard.service.ts

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

# src\features\payments\components\index.ts

```ts
export { WithdrawButton } from './WithdrawButton'
export { PaymentRow } from './PaymentRow'

```

# src\features\payments\components\PaymentRow.tsx

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

# src\features\payments\components\WithdrawButton.tsx

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

# src\features\payments\index.ts

```ts
export * from './payments.service'
export * from './components'

```

# src\features\payments\payments.service.ts

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

# src\features\quizzes\components\index.ts

```ts
export { QuizCard } from './QuizCard'
export { QuizGrid } from './QuizGrid'
export { QuizForm } from './QuizForm'

```

# src\features\quizzes\components\QuizCard.tsx

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

# src\features\quizzes\components\QuizForm.tsx

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

# src\features\quizzes\components\QuizGrid.tsx

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

# src\features\quizzes\hooks\index.ts

```ts
export { useQuiz, useTeacherQuizzes } from './useQuiz'

```

# src\features\quizzes\hooks\useQuiz.ts

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
  }, [quizId, quizClient])

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
  }, [teacherId, quizClient])

  return { quizzes, loading, error, refresh }
}

```

# src\features\quizzes\index.ts

```ts
export * from './quizzes.service'
export * from './components'
export * from './hooks'

```

# src\features\quizzes\quizzes.service.ts

```ts
/**
 * Quizzes Service - Handle quiz operations
 * NOTE: Each quiz has ONLY ONE question with 4 options
 */

'use client'

import type { TeacherClient, QuizClient } from '@quiz-app/sdk'
import { apiClient } from '@/services'
import type { QuizData } from '@quiz-app/shared'

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
  teacherClient: TeacherClient,
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

  // Sync with backend
  try {
    await apiClient.syncQuiz({
      id: quiz._id,
      rev: quiz._rev,
      ...params,
      teacherId: quiz.teacherPublicKey,
    })
  } catch (error) {
    console.error('Failed to sync quiz with backend:', error)
  }

  return quiz as Quiz
}

/**
 * Get quiz by ID
 */
export async function getQuiz(
  quizClient: QuizClient,
  quizId: string
): Promise<Quiz | null> {
  try {
    const quizDetails = await quizClient.getQuizDetails(quizId)
    // Create a mock quiz object with the details
    const quiz: Quiz = {
      _id: quizId,
      _rev: quizId, // Simplified for now
      title: quizDetails.title,
      questionText: quizDetails.questionText,
      options: quizDetails.options,
      correctAnswer: 0, // Not available from details
      rewardAmount: quizDetails.rewardAmount,
      entryFee: quizDetails.entryFee,
      teacherPublicKey: '', // Not available from details
      isActive: quizDetails.isActive,
      paymentTxId: quizDetails.paymentTxId,
      isClaimed: quizDetails.isClaimed,
      claimedBy: quizDetails.claimedBy,
      attemptCount: quizDetails.attemptCount,
    }
    return quiz
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
  quizClient: QuizClient,
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
  quizClient: QuizClient,
  quizId: string,
  studentPublicKey: string
): Promise<boolean> {
  try {
    return await quizClient.canStudentAttemptQuiz(quizId, studentPublicKey)
  } catch (error) {
    console.error('Failed to check attempt eligibility:', error)
    return false
  }
}

```

# src\features\wallet\components\index.ts

```ts
export { WalletConnect } from './WalletConnect'
export { WalletDisplay } from './WalletDisplay'

```

# src\features\wallet\components\WalletConnect.tsx

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

# src\features\wallet\components\WalletDisplay.tsx

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

# src\features\wallet\hooks\index.ts

```ts
export { useWalletInfo } from './useWalletInfo'

```

# src\features\wallet\hooks\useWalletInfo.ts

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
  }, [computer])

  return {
    walletInfo,
    loading,
    error,
    refresh,
  }
}

```

# src\features\wallet\index.ts

```ts
export * from './wallet.service'
export * from './components'
export * from './hooks'

```

# src\features\wallet\wallet.service.ts

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

# src\hooks\index.ts

```ts
export * from './useClients'
export * from './useWallet'

```

# src\hooks\useClients.ts

```ts
'use client'

import { useMemo } from 'react'
import { useWalletStore } from '@/stores'
import { getComputer, getAllClients } from '@/services'

/**
 * Hook to access Computer instance
 */
export function useComputer() {
  return useMemo(() => {
    return getComputer()
  }, [])
}

/**
 * Hook to access all SDK clients
 */
export function useClients() {
  const computer = useComputer()
  
  return useMemo(() => getAllClients(computer), [computer])
}

/**
 * Hook to access specific client
 */
export function useTeacherClient() {
  const { teacher } = useClients()
  return teacher
}

export function useStudentClient() {
  const { student } = useClients()
  return student
}

export function useQuizClient() {
  const { quiz } = useClients()
  return quiz
}

export function useAccessClient() {
  const { access } = useClients()
  return access
}

export function usePaymentClient() {
  const { payment } = useClients()
  return payment
}

export function useAttemptClient() {
  const { attempt } = useClients()
  return attempt
}

```

# src\hooks\useWallet.ts

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

# src\lib\errors.ts

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

# src\lib\index.ts

```ts
export * from './utils'
export * from './errors'

```

# src\lib\utils.ts

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

# src\services\api.client.ts

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

# src\services\contracts\contractsService.ts

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

# src\services\contracts\index.ts

```ts
export * from './contractsService'

```

# src\services\index.ts

```ts
export * from './contracts/index'
export * from './sdk.factory'
export * from './api.client'
export * from './tx/txParser'

```

# src\services\sdk.factory.ts

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

# src\services\tx\txParser.ts

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

# src\stores\index.ts

```ts
export { useWalletStore } from './wallet.store'
export { useSessionStore } from './session.store'

```

# src\stores\session.store.ts

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

# src\stores\wallet.store.ts

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

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@bitcoin-computer/components/built/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "blue-1": "#000F38",
        "blue-2": "#002A99",
        "blue-3": "#0046FF",
        "blue-4": "#A7BFFF",
      },
    },
  },
  plugins: [],
};

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "es6",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/components/*": [
        "./src/components/*"
      ],
      "@/features/*": [
        "./src/features/*"
      ],
      "@/services/*": [
        "./src/services/*"
      ],
      "@/stores/*": [
        "./src/stores/*"
      ],
      "@/config/*": [
        "./src/config/*"
      ],
      "@/lib/*": [
        "./src/lib/*"
      ],
      "@/hooks/*": [
        "./src/hooks/*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

