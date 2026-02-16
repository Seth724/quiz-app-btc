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
import webpack from 'webpack';

const nextConfig: NextConfig = {
  transpilePackages: ['@quiz-app/sdk', '@quiz-app/contracts', '@quiz-app/shared', '@bitcoin-computer/lib'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        process: require.resolve('process/browser'),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: ['process'],
        }),
      );
    }
    return config;
  },
  // Ensure environment variables are properly exposed to the client
  env: {
    NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_PATH: process.env.NEXT_PUBLIC_PATH,
    NEXT_PUBLIC_TEACHER_MOD: process.env.NEXT_PUBLIC_TEACHER_MOD,
    NEXT_PUBLIC_STUDENT_MOD: process.env.NEXT_PUBLIC_STUDENT_MOD,
    NEXT_PUBLIC_QUIZ_MOD: process.env.NEXT_PUBLIC_QUIZ_MOD,
    NEXT_PUBLIC_ATTEMPT_MOD: process.env.NEXT_PUBLIC_ATTEMPT_MOD,
    NEXT_PUBLIC_PAYMENT_MOD: process.env.NEXT_PUBLIC_PAYMENT_MOD,
    NEXT_PUBLIC_QUIZ_ACCESS_MOD: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD,
    NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD,
  },
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

# src\app\gallery\page.tsx

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

# src\app\objects\[rev]\page.tsx

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

# src\app\teacher\quizzes\[id]\page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getQuiz, type Quiz } from '@/features/quizzes'
import { useQuizClient } from '@/hooks/useClients'
import { Card, Loader } from '@/components'

export default function TeacherQuizDetailPage() {
  const params = useParams()
  const quizId = params.id as string
  const quizClient = useQuizClient()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!quizClient || !quizId) {
          setError('Quiz client not available or quiz ID missing')
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
        setError('Failed to load quiz details')
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

# src\app\transactions\[txn]\page.tsx

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

# src\app\wallet\page.tsx

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

# src\common-components\Auth.tsx

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

# src\common-components\Card.tsx

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

# src\common-components\ClientProvider.tsx

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

# src\common-components\common\Components.tsx

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

# src\common-components\common\SmartCallExecutionResult.tsx

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

# src\common-components\common\types.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'testnet' | 'mainnet' | 'regtest'
export type ModuleStorageType = 'taproot' | 'multisig'

```

# src\common-components\common\TypeSelectionDropdown.tsx

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

# src\common-components\common\utils.ts

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

# src\common-components\ComputerContext.tsx

```tsx
import { Computer } from "@bitcoin-computer/lib";
import { createContext } from "react";

export const ComputerContext = createContext<Computer | null>(null);



```

# src\common-components\Drawer.tsx

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

# src\common-components\Err.tsx

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

# src\common-components\Error404.tsx

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

# src\common-components\Gallery.tsx

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

# src\common-components\index.tsx

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

# src\common-components\Loader.tsx

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

# src\common-components\Missing.tsx

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

# src\common-components\Modal.tsx

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

# src\common-components\Navbar.tsx

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

# src\common-components\SmartObject.tsx

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

# src\common-components\SmartObjectFunction.tsx

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

# src\common-components\SmartObjectFunctions.tsx

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

# src\common-components\SnackBar.tsx

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

# src\common-components\Transaction.tsx

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

# src\common-components\UtilsContext.tsx

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

# src\common-components\Wallet.tsx

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

// Only export the essential components that exist and work
export { UtilsProvider, UtilsContext } from './src/UtilsContext'
export { ComputerContext } from './src/ComputerContext'
export { Wallet } from './src/Wallet'

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
  // Use process.env for Next.js instead of import.meta.env (Vite) - Fixed for Next.js
  const value = process.env[key]
  if (value) return value
  return ''
}

export const VITE_WITHDRAW_MOD_SPEC: string = getEnvVar('NEXT_PUBLIC_WITHDRAW_MOD_SPEC')

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
export { Button } from './Button'
export { Card } from './Card'
export { Loader } from './Loader'
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
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC || process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC || process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_MOD || '',
  quizAttemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || '',
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
  }, []) // Remove computer from dependencies since it's memoized

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

# src\mine\page.tsx

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

# src\mint\page.tsx

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

# src\objects\[rev]\page.tsx

```tsx
"use client";

import { SmartObject } from "@/app/common-components";

export default function SmartObjectComponent() {
  return <SmartObject.Component />;
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

# src\services\bc\BrowserAccessClient.ts

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
      purchasedAt: Date.now(),
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
          purchasedAt: access.createdAt || Date.now(),
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

# src\services\bc\BrowserAttemptClient.ts

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
      submittedAt: Date.now()
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
            submittedAt: attempt.attemptedAt || Date.now()
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

# src\services\bc\BrowserQuizClient.ts

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
      // Using the exact syntax from the test file
      console.log('📤 Creating quiz...')
      const quizEncoded = await this.computer.encode({
        exp: `new Quiz({
          title: "${quizData.title}",
          questionText: "${quizData.questionText}",
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
        createdAt: Date.now()
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

# src\services\bc\BrowserTeacherClient.ts

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

# src\services\bc\index.ts

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
export * from './bc'

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

# src\transactions\[txn]\page.tsx

```tsx
"use client";

import { Transaction } from "@/app/common-components";

export default function TransactionComponent() {
  return <Transaction.Component />;
}

```

# src\types\common.ts

```ts
export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'testnet' | 'mainnet' | 'regtest'

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
    "allowSyntheticDefaultImports": true,
    "module": "esnext",
    "moduleResolution": "node",  // Changed from bundler to node for better compatibility
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
      "@bitcoin-computer/lib": ["../../node_modules/@bitcoin-computer/lib"],
      "@bitcoin-computer/lib/*": ["../../node_modules/@bitcoin-computer/lib/*"],
      "@/common-components/*": [
        "./src/common-components/*"
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

# tsconfig.tsbuildinfo

```tsbuildinfo
{"fileNames":["../../node_modules/typescript/lib/lib.es5.d.ts","../../node_modules/typescript/lib/lib.es2015.d.ts","../../node_modules/typescript/lib/lib.es2016.d.ts","../../node_modules/typescript/lib/lib.es2017.d.ts","../../node_modules/typescript/lib/lib.es2018.d.ts","../../node_modules/typescript/lib/lib.es2019.d.ts","../../node_modules/typescript/lib/lib.es2020.d.ts","../../node_modules/typescript/lib/lib.es2021.d.ts","../../node_modules/typescript/lib/lib.es2022.d.ts","../../node_modules/typescript/lib/lib.es2023.d.ts","../../node_modules/typescript/lib/lib.es2024.d.ts","../../node_modules/typescript/lib/lib.esnext.d.ts","../../node_modules/typescript/lib/lib.dom.d.ts","../../node_modules/typescript/lib/lib.dom.iterable.d.ts","../../node_modules/typescript/lib/lib.es2015.core.d.ts","../../node_modules/typescript/lib/lib.es2015.collection.d.ts","../../node_modules/typescript/lib/lib.es2015.generator.d.ts","../../node_modules/typescript/lib/lib.es2015.iterable.d.ts","../../node_modules/typescript/lib/lib.es2015.promise.d.ts","../../node_modules/typescript/lib/lib.es2015.proxy.d.ts","../../node_modules/typescript/lib/lib.es2015.reflect.d.ts","../../node_modules/typescript/lib/lib.es2015.symbol.d.ts","../../node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts","../../node_modules/typescript/lib/lib.es2016.array.include.d.ts","../../node_modules/typescript/lib/lib.es2016.intl.d.ts","../../node_modules/typescript/lib/lib.es2017.arraybuffer.d.ts","../../node_modules/typescript/lib/lib.es2017.date.d.ts","../../node_modules/typescript/lib/lib.es2017.object.d.ts","../../node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts","../../node_modules/typescript/lib/lib.es2017.string.d.ts","../../node_modules/typescript/lib/lib.es2017.intl.d.ts","../../node_modules/typescript/lib/lib.es2017.typedarrays.d.ts","../../node_modules/typescript/lib/lib.es2018.asyncgenerator.d.ts","../../node_modules/typescript/lib/lib.es2018.asynciterable.d.ts","../../node_modules/typescript/lib/lib.es2018.intl.d.ts","../../node_modules/typescript/lib/lib.es2018.promise.d.ts","../../node_modules/typescript/lib/lib.es2018.regexp.d.ts","../../node_modules/typescript/lib/lib.es2019.array.d.ts","../../node_modules/typescript/lib/lib.es2019.object.d.ts","../../node_modules/typescript/lib/lib.es2019.string.d.ts","../../node_modules/typescript/lib/lib.es2019.symbol.d.ts","../../node_modules/typescript/lib/lib.es2019.intl.d.ts","../../node_modules/typescript/lib/lib.es2020.bigint.d.ts","../../node_modules/typescript/lib/lib.es2020.date.d.ts","../../node_modules/typescript/lib/lib.es2020.promise.d.ts","../../node_modules/typescript/lib/lib.es2020.sharedmemory.d.ts","../../node_modules/typescript/lib/lib.es2020.string.d.ts","../../node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts","../../node_modules/typescript/lib/lib.es2020.intl.d.ts","../../node_modules/typescript/lib/lib.es2020.number.d.ts","../../node_modules/typescript/lib/lib.es2021.promise.d.ts","../../node_modules/typescript/lib/lib.es2021.string.d.ts","../../node_modules/typescript/lib/lib.es2021.weakref.d.ts","../../node_modules/typescript/lib/lib.es2021.intl.d.ts","../../node_modules/typescript/lib/lib.es2022.array.d.ts","../../node_modules/typescript/lib/lib.es2022.error.d.ts","../../node_modules/typescript/lib/lib.es2022.intl.d.ts","../../node_modules/typescript/lib/lib.es2022.object.d.ts","../../node_modules/typescript/lib/lib.es2022.string.d.ts","../../node_modules/typescript/lib/lib.es2022.regexp.d.ts","../../node_modules/typescript/lib/lib.es2023.array.d.ts","../../node_modules/typescript/lib/lib.es2023.collection.d.ts","../../node_modules/typescript/lib/lib.es2023.intl.d.ts","../../node_modules/typescript/lib/lib.es2024.arraybuffer.d.ts","../../node_modules/typescript/lib/lib.es2024.collection.d.ts","../../node_modules/typescript/lib/lib.es2024.object.d.ts","../../node_modules/typescript/lib/lib.es2024.promise.d.ts","../../node_modules/typescript/lib/lib.es2024.regexp.d.ts","../../node_modules/typescript/lib/lib.es2024.sharedmemory.d.ts","../../node_modules/typescript/lib/lib.es2024.string.d.ts","../../node_modules/typescript/lib/lib.esnext.array.d.ts","../../node_modules/typescript/lib/lib.esnext.collection.d.ts","../../node_modules/typescript/lib/lib.esnext.intl.d.ts","../../node_modules/typescript/lib/lib.esnext.disposable.d.ts","../../node_modules/typescript/lib/lib.esnext.promise.d.ts","../../node_modules/typescript/lib/lib.esnext.decorators.d.ts","../../node_modules/typescript/lib/lib.esnext.iterator.d.ts","../../node_modules/typescript/lib/lib.esnext.float16.d.ts","../../node_modules/typescript/lib/lib.esnext.error.d.ts","../../node_modules/typescript/lib/lib.esnext.sharedmemory.d.ts","../../node_modules/typescript/lib/lib.decorators.d.ts","../../node_modules/typescript/lib/lib.decorators.legacy.d.ts","../../node_modules/@types/react/global.d.ts","../../node_modules/csstype/index.d.ts","../../node_modules/@types/react/index.d.ts","../../node_modules/next/dist/styled-jsx/types/css.d.ts","../../node_modules/next/dist/styled-jsx/types/macro.d.ts","../../node_modules/next/dist/styled-jsx/types/style.d.ts","../../node_modules/next/dist/styled-jsx/types/global.d.ts","../../node_modules/next/dist/styled-jsx/types/index.d.ts","../../node_modules/next/dist/server/get-page-files.d.ts","../../node_modules/@types/node/compatibility/disposable.d.ts","../../node_modules/@types/node/compatibility/indexable.d.ts","../../node_modules/@types/node/compatibility/iterators.d.ts","../../node_modules/@types/node/compatibility/index.d.ts","../../node_modules/@types/node/globals.typedarray.d.ts","../../node_modules/@types/node/buffer.buffer.d.ts","../../node_modules/@types/node/globals.d.ts","../../node_modules/@types/node/web-globals/abortcontroller.d.ts","../../node_modules/@types/node/web-globals/domexception.d.ts","../../node_modules/@types/node/web-globals/events.d.ts","../../node_modules/buffer/index.d.ts","../../node_modules/undici-types/header.d.ts","../../node_modules/undici-types/readable.d.ts","../../node_modules/undici-types/file.d.ts","../../node_modules/undici-types/fetch.d.ts","../../node_modules/undici-types/formdata.d.ts","../../node_modules/undici-types/connector.d.ts","../../node_modules/undici-types/client.d.ts","../../node_modules/undici-types/errors.d.ts","../../node_modules/undici-types/dispatcher.d.ts","../../node_modules/undici-types/global-dispatcher.d.ts","../../node_modules/undici-types/global-origin.d.ts","../../node_modules/undici-types/pool-stats.d.ts","../../node_modules/undici-types/pool.d.ts","../../node_modules/undici-types/handlers.d.ts","../../node_modules/undici-types/balanced-pool.d.ts","../../node_modules/undici-types/agent.d.ts","../../node_modules/undici-types/mock-interceptor.d.ts","../../node_modules/undici-types/mock-agent.d.ts","../../node_modules/undici-types/mock-client.d.ts","../../node_modules/undici-types/mock-pool.d.ts","../../node_modules/undici-types/mock-errors.d.ts","../../node_modules/undici-types/proxy-agent.d.ts","../../node_modules/undici-types/env-http-proxy-agent.d.ts","../../node_modules/undici-types/retry-handler.d.ts","../../node_modules/undici-types/retry-agent.d.ts","../../node_modules/undici-types/api.d.ts","../../node_modules/undici-types/interceptors.d.ts","../../node_modules/undici-types/util.d.ts","../../node_modules/undici-types/cookies.d.ts","../../node_modules/undici-types/patch.d.ts","../../node_modules/undici-types/websocket.d.ts","../../node_modules/undici-types/eventsource.d.ts","../../node_modules/undici-types/filereader.d.ts","../../node_modules/undici-types/diagnostics-channel.d.ts","../../node_modules/undici-types/content-type.d.ts","../../node_modules/undici-types/cache.d.ts","../../node_modules/undici-types/index.d.ts","../../node_modules/@types/node/web-globals/fetch.d.ts","../../node_modules/@types/node/assert.d.ts","../../node_modules/@types/node/assert/strict.d.ts","../../node_modules/@types/node/async_hooks.d.ts","../../node_modules/@types/node/buffer.d.ts","../../node_modules/@types/node/child_process.d.ts","../../node_modules/@types/node/cluster.d.ts","../../node_modules/@types/node/console.d.ts","../../node_modules/@types/node/constants.d.ts","../../node_modules/@types/node/crypto.d.ts","../../node_modules/@types/node/dgram.d.ts","../../node_modules/@types/node/diagnostics_channel.d.ts","../../node_modules/@types/node/dns.d.ts","../../node_modules/@types/node/dns/promises.d.ts","../../node_modules/@types/node/domain.d.ts","../../node_modules/@types/node/events.d.ts","../../node_modules/@types/node/fs.d.ts","../../node_modules/@types/node/fs/promises.d.ts","../../node_modules/@types/node/http.d.ts","../../node_modules/@types/node/http2.d.ts","../../node_modules/@types/node/https.d.ts","../../node_modules/@types/node/inspector.generated.d.ts","../../node_modules/@types/node/module.d.ts","../../node_modules/@types/node/net.d.ts","../../node_modules/@types/node/os.d.ts","../../node_modules/@types/node/path.d.ts","../../node_modules/@types/node/perf_hooks.d.ts","../../node_modules/@types/node/process.d.ts","../../node_modules/@types/node/punycode.d.ts","../../node_modules/@types/node/querystring.d.ts","../../node_modules/@types/node/readline.d.ts","../../node_modules/@types/node/readline/promises.d.ts","../../node_modules/@types/node/repl.d.ts","../../node_modules/@types/node/sea.d.ts","../../node_modules/@types/node/stream.d.ts","../../node_modules/@types/node/stream/promises.d.ts","../../node_modules/@types/node/stream/consumers.d.ts","../../node_modules/@types/node/stream/web.d.ts","../../node_modules/@types/node/string_decoder.d.ts","../../node_modules/@types/node/test.d.ts","../../node_modules/@types/node/timers.d.ts","../../node_modules/@types/node/timers/promises.d.ts","../../node_modules/@types/node/tls.d.ts","../../node_modules/@types/node/trace_events.d.ts","../../node_modules/@types/node/tty.d.ts","../../node_modules/@types/node/url.d.ts","../../node_modules/@types/node/util.d.ts","../../node_modules/@types/node/v8.d.ts","../../node_modules/@types/node/vm.d.ts","../../node_modules/@types/node/wasi.d.ts","../../node_modules/@types/node/worker_threads.d.ts","../../node_modules/@types/node/zlib.d.ts","../../node_modules/@types/node/index.d.ts","../../node_modules/@types/react/canary.d.ts","../../node_modules/@types/react/experimental.d.ts","../../node_modules/@types/react-dom/index.d.ts","../../node_modules/@types/react-dom/canary.d.ts","../../node_modules/@types/react-dom/experimental.d.ts","../../node_modules/next/dist/lib/fallback.d.ts","../../node_modules/next/dist/compiled/webpack/webpack.d.ts","../../node_modules/next/dist/shared/lib/modern-browserslist-target.d.ts","../../node_modules/next/dist/shared/lib/entry-constants.d.ts","../../node_modules/next/dist/shared/lib/constants.d.ts","../../node_modules/next/dist/server/config.d.ts","../../node_modules/next/dist/lib/load-custom-routes.d.ts","../../node_modules/next/dist/shared/lib/image-config.d.ts","../../node_modules/next/dist/build/webpack/plugins/subresource-integrity-plugin.d.ts","../../node_modules/next/dist/server/body-streams.d.ts","../../node_modules/next/dist/server/lib/cache-control.d.ts","../../node_modules/next/dist/lib/setup-exception-listeners.d.ts","../../node_modules/next/dist/lib/worker.d.ts","../../node_modules/next/dist/lib/constants.d.ts","../../node_modules/next/dist/lib/bundler.d.ts","../../node_modules/next/dist/server/lib/experimental/ppr.d.ts","../../node_modules/next/dist/lib/page-types.d.ts","../../node_modules/next/dist/build/segment-config/app/app-segment-config.d.ts","../../node_modules/next/dist/build/segment-config/pages/pages-segment-config.d.ts","../../node_modules/next/dist/build/analysis/get-page-static-info.d.ts","../../node_modules/next/dist/build/webpack/loaders/get-module-build-info.d.ts","../../node_modules/next/dist/build/webpack/plugins/middleware-plugin.d.ts","../../node_modules/next/dist/server/require-hook.d.ts","../../node_modules/next/dist/server/node-polyfill-crypto.d.ts","../../node_modules/next/dist/server/node-environment-baseline.d.ts","../../node_modules/next/dist/server/node-environment-extensions/error-inspect.d.ts","../../node_modules/next/dist/server/node-environment-extensions/console-file.d.ts","../../node_modules/next/dist/server/node-environment-extensions/console-exit.d.ts","../../node_modules/next/dist/server/node-environment-extensions/console-dim.external.d.ts","../../node_modules/next/dist/server/node-environment-extensions/unhandled-rejection.d.ts","../../node_modules/next/dist/server/node-environment-extensions/random.d.ts","../../node_modules/next/dist/server/node-environment-extensions/date.d.ts","../../node_modules/next/dist/server/node-environment-extensions/web-crypto.d.ts","../../node_modules/next/dist/server/node-environment-extensions/node-crypto.d.ts","../../node_modules/next/dist/server/node-environment-extensions/fast-set-immediate.external.d.ts","../../node_modules/next/dist/server/node-environment.d.ts","../../node_modules/next/dist/build/page-extensions-type.d.ts","../../node_modules/next/dist/server/route-kind.d.ts","../../node_modules/next/dist/server/route-definitions/route-definition.d.ts","../../node_modules/next/dist/server/route-definitions/app-page-route-definition.d.ts","../../node_modules/next/dist/server/lib/cache-handlers/types.d.ts","../../node_modules/next/dist/server/response-cache/types.d.ts","../../node_modules/next/dist/server/resume-data-cache/cache-store.d.ts","../../node_modules/next/dist/server/resume-data-cache/resume-data-cache.d.ts","../../node_modules/next/dist/client/components/app-router-headers.d.ts","../../node_modules/next/dist/server/render-result.d.ts","../../node_modules/next/dist/server/instrumentation/types.d.ts","../../node_modules/next/dist/lib/coalesced-function.d.ts","../../node_modules/next/dist/shared/lib/router/utils/middleware-route-matcher.d.ts","../../node_modules/next/dist/server/lib/router-utils/types.d.ts","../../node_modules/next/dist/trace/types.d.ts","../../node_modules/next/dist/trace/trace.d.ts","../../node_modules/next/dist/trace/shared.d.ts","../../node_modules/next/dist/trace/index.d.ts","../../node_modules/next/dist/build/load-jsconfig.d.ts","../../node_modules/@next/env/dist/index.d.ts","../../node_modules/next/dist/build/webpack/plugins/telemetry-plugin/use-cache-tracker-utils.d.ts","../../node_modules/next/dist/build/webpack/plugins/telemetry-plugin/telemetry-plugin.d.ts","../../node_modules/next/dist/telemetry/storage.d.ts","../../node_modules/next/dist/build/build-context.d.ts","../../node_modules/next/dist/shared/lib/bloom-filter.d.ts","../../node_modules/next/dist/build/webpack-config.d.ts","../../node_modules/next/dist/build/swc/generated-native.d.ts","../../node_modules/next/dist/build/swc/types.d.ts","../../node_modules/next/dist/server/dev/parse-version-info.d.ts","../../node_modules/next/dist/next-devtools/shared/types.d.ts","../../node_modules/next/dist/server/dev/dev-indicator-server-state.d.ts","../../node_modules/next/dist/next-devtools/dev-overlay/cache-indicator.d.ts","../../node_modules/next/dist/server/lib/parse-stack.d.ts","../../node_modules/next/dist/next-devtools/server/shared.d.ts","../../node_modules/next/dist/next-devtools/shared/stack-frame.d.ts","../../node_modules/next/dist/next-devtools/dev-overlay/utils/get-error-by-type.d.ts","../../node_modules/@types/react/jsx-runtime.d.ts","../../node_modules/next/dist/next-devtools/dev-overlay/container/runtime-error/render-error.d.ts","../../node_modules/next/dist/next-devtools/dev-overlay/shared.d.ts","../../node_modules/next/dist/server/dev/debug-channel.d.ts","../../node_modules/next/dist/server/dev/hot-reloader-types.d.ts","../../node_modules/next/dist/server/lib/i18n-provider.d.ts","../../node_modules/next/dist/server/web/next-url.d.ts","../../node_modules/next/dist/compiled/@edge-runtime/cookies/index.d.ts","../../node_modules/next/dist/server/web/spec-extension/cookies.d.ts","../../node_modules/next/dist/server/web/spec-extension/request.d.ts","../../node_modules/next/dist/server/after/builtin-request-context.d.ts","../../node_modules/next/dist/server/web/spec-extension/fetch-event.d.ts","../../node_modules/next/dist/server/web/spec-extension/response.d.ts","../../node_modules/next/dist/build/segment-config/middleware/middleware-config.d.ts","../../node_modules/next/dist/server/web/types.d.ts","../../node_modules/next/dist/build/webpack/plugins/pages-manifest-plugin.d.ts","../../node_modules/next/dist/shared/lib/router/utils/parse-url.d.ts","../../node_modules/next/dist/server/route-definitions/locale-route-definition.d.ts","../../node_modules/next/dist/server/route-definitions/pages-route-definition.d.ts","../../node_modules/next/dist/build/webpack/plugins/flight-manifest-plugin.d.ts","../../node_modules/next/dist/build/webpack/plugins/next-font-manifest-plugin.d.ts","../../node_modules/next/dist/shared/lib/deep-readonly.d.ts","../../node_modules/next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup.d.ts","../../node_modules/next/dist/server/render.d.ts","../../node_modules/next/dist/shared/lib/mitt.d.ts","../../node_modules/next/dist/client/with-router.d.ts","../../node_modules/next/dist/client/router.d.ts","../../node_modules/next/dist/client/route-loader.d.ts","../../node_modules/next/dist/client/page-loader.d.ts","../../node_modules/next/dist/shared/lib/router/router.d.ts","../../node_modules/next/dist/shared/lib/router-context.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/loadable-context.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/loadable.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/image-config-context.shared-runtime.d.ts","../../node_modules/next/dist/client/components/readonly-url-search-params.d.ts","../../node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/app-router-types.d.ts","../../node_modules/next/dist/client/flight-data-helpers.d.ts","../../node_modules/next/dist/client/components/router-reducer/ppr-navigations.d.ts","../../node_modules/next/dist/client/components/segment-cache/types.d.ts","../../node_modules/next/dist/client/components/segment-cache/navigation.d.ts","../../node_modules/next/dist/client/components/segment-cache/cache-key.d.ts","../../node_modules/next/dist/client/components/router-reducer/fetch-server-response.d.ts","../../node_modules/next/dist/client/components/router-reducer/router-reducer-types.d.ts","../../node_modules/next/dist/shared/lib/app-router-context.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/server-inserted-html.shared-runtime.d.ts","../../node_modules/next/dist/server/route-modules/pages/vendored/contexts/entrypoints.d.ts","../../node_modules/next/dist/server/route-modules/pages/module.compiled.d.ts","../../node_modules/next/dist/build/templates/pages.d.ts","../../node_modules/next/dist/server/route-modules/pages/module.d.ts","../../node_modules/next/dist/server/route-modules/pages/builtin/_error.d.ts","../../node_modules/next/dist/server/load-default-error-components.d.ts","../../node_modules/next/dist/server/base-http/node.d.ts","../../node_modules/next/dist/server/response-cache/index.d.ts","../../node_modules/next/dist/server/route-definitions/pages-api-route-definition.d.ts","../../node_modules/next/dist/server/route-matches/pages-api-route-match.d.ts","../../node_modules/next/dist/server/route-matchers/route-matcher.d.ts","../../node_modules/next/dist/server/route-matcher-providers/route-matcher-provider.d.ts","../../node_modules/next/dist/server/route-matcher-managers/route-matcher-manager.d.ts","../../node_modules/next/dist/server/normalizers/normalizer.d.ts","../../node_modules/next/dist/server/normalizers/locale-route-normalizer.d.ts","../../node_modules/next/dist/server/normalizers/request/pathname-normalizer.d.ts","../../node_modules/next/dist/server/normalizers/request/suffix.d.ts","../../node_modules/next/dist/server/normalizers/request/rsc.d.ts","../../node_modules/next/dist/server/normalizers/request/next-data.d.ts","../../node_modules/next/dist/server/normalizers/request/segment-prefix-rsc.d.ts","../../node_modules/next/dist/build/static-paths/types.d.ts","../../node_modules/next/dist/server/base-server.d.ts","../../node_modules/next/dist/server/lib/async-callback-set.d.ts","../../node_modules/next/dist/shared/lib/router/utils/route-regex.d.ts","../../node_modules/next/dist/shared/lib/router/utils/route-matcher.d.ts","../../node_modules/sharp/lib/index.d.ts","../../node_modules/next/dist/server/image-optimizer.d.ts","../../node_modules/next/dist/server/next-server.d.ts","../../node_modules/next/dist/server/lib/types.d.ts","../../node_modules/next/dist/server/lib/lru-cache.d.ts","../../node_modules/next/dist/server/lib/dev-bundler-service.d.ts","../../node_modules/next/dist/server/use-cache/cache-life.d.ts","../../node_modules/next/dist/server/dev/static-paths-worker.d.ts","../../node_modules/next/dist/server/dev/next-dev-server.d.ts","../../node_modules/next/dist/server/next.d.ts","../../node_modules/next/dist/server/lib/render-server.d.ts","../../node_modules/next/dist/server/lib/router-server.d.ts","../../node_modules/next/dist/shared/lib/router/utils/path-match.d.ts","../../node_modules/next/dist/server/lib/router-utils/filesystem.d.ts","../../node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.d.ts","../../node_modules/next/dist/server/lib/router-utils/router-server-context.d.ts","../../node_modules/next/dist/server/route-modules/route-module.d.ts","../../node_modules/next/dist/server/load-components.d.ts","../../node_modules/next/dist/server/web/adapter.d.ts","../../node_modules/next/dist/server/app-render/types.d.ts","../../node_modules/next/dist/build/webpack/loaders/metadata/types.d.ts","../../node_modules/next/dist/build/webpack/loaders/next-app-loader/index.d.ts","../../node_modules/next/dist/server/lib/app-dir-module.d.ts","../../node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.d.ts","../../node_modules/next/dist/server/async-storage/draft-mode-provider.d.ts","../../node_modules/next/dist/server/web/spec-extension/adapters/headers.d.ts","../../node_modules/next/dist/server/app-render/cache-signal.d.ts","../../node_modules/next/dist/server/app-render/dynamic-rendering.d.ts","../../node_modules/next/dist/server/request/fallback-params.d.ts","../../node_modules/next/dist/server/app-render/work-unit-async-storage-instance.d.ts","../../node_modules/next/dist/server/lib/lazy-result.d.ts","../../node_modules/next/dist/server/lib/implicit-tags.d.ts","../../node_modules/next/dist/server/app-render/staged-rendering.d.ts","../../node_modules/next/dist/server/app-render/work-unit-async-storage.external.d.ts","../../node_modules/next/dist/shared/lib/router/utils/parse-relative-url.d.ts","../../node_modules/next/dist/server/app-render/app-render.d.ts","../../node_modules/next/dist/server/route-modules/app-page/vendored/contexts/entrypoints.d.ts","../../node_modules/next/dist/client/components/error-boundary.d.ts","../../node_modules/next/dist/client/components/layout-router.d.ts","../../node_modules/next/dist/client/components/render-from-template-context.d.ts","../../node_modules/next/dist/server/app-render/action-async-storage-instance.d.ts","../../node_modules/next/dist/server/app-render/action-async-storage.external.d.ts","../../node_modules/next/dist/client/components/client-page.d.ts","../../node_modules/next/dist/client/components/client-segment.d.ts","../../node_modules/next/dist/server/request/search-params.d.ts","../../node_modules/next/dist/client/components/hooks-server-context.d.ts","../../node_modules/next/dist/client/components/http-access-fallback/error-boundary.d.ts","../../node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts","../../node_modules/next/dist/lib/metadata/types/extra-types.d.ts","../../node_modules/next/dist/lib/metadata/types/metadata-types.d.ts","../../node_modules/next/dist/lib/metadata/types/manifest-types.d.ts","../../node_modules/next/dist/lib/metadata/types/opengraph-types.d.ts","../../node_modules/next/dist/lib/metadata/types/twitter-types.d.ts","../../node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts","../../node_modules/next/dist/lib/metadata/types/resolvers.d.ts","../../node_modules/next/dist/lib/metadata/types/icons.d.ts","../../node_modules/next/dist/lib/metadata/resolve-metadata.d.ts","../../node_modules/next/dist/lib/metadata/metadata.d.ts","../../node_modules/next/dist/lib/framework/boundary-components.d.ts","../../node_modules/next/dist/server/app-render/rsc/preloads.d.ts","../../node_modules/next/dist/server/app-render/rsc/postpone.d.ts","../../node_modules/next/dist/server/app-render/rsc/taint.d.ts","../../node_modules/next/dist/shared/lib/segment-cache/segment-value-encoding.d.ts","../../node_modules/next/dist/server/app-render/collect-segment-data.d.ts","../../node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.d.ts","../../node_modules/next/dist/server/app-render/entry-base.d.ts","../../node_modules/next/dist/build/templates/app-page.d.ts","../../node_modules/next/dist/build/rendering-mode.d.ts","../../node_modules/@types/react/jsx-dev-runtime.d.ts","../../node_modules/@types/react/compiler-runtime.d.ts","../../node_modules/next/dist/server/route-modules/app-page/vendored/rsc/entrypoints.d.ts","../../node_modules/@types/react-dom/client.d.ts","../../node_modules/@types/react-dom/static.d.ts","../../node_modules/@types/react-dom/server.d.ts","../../node_modules/next/dist/server/route-modules/app-page/vendored/ssr/entrypoints.d.ts","../../node_modules/next/dist/server/route-modules/app-page/module.d.ts","../../node_modules/next/dist/server/route-modules/app-page/module.compiled.d.ts","../../node_modules/next/dist/server/route-definitions/app-route-route-definition.d.ts","../../node_modules/next/dist/server/async-storage/work-store.d.ts","../../node_modules/next/dist/server/web/http.d.ts","../../node_modules/next/dist/server/route-modules/app-route/shared-modules.d.ts","../../node_modules/next/dist/client/components/redirect-status-code.d.ts","../../node_modules/next/dist/client/components/redirect-error.d.ts","../../node_modules/next/dist/build/templates/app-route.d.ts","../../node_modules/next/dist/server/route-modules/app-route/module.d.ts","../../node_modules/next/dist/server/route-modules/app-route/module.compiled.d.ts","../../node_modules/next/dist/build/segment-config/app/app-segments.d.ts","../../node_modules/next/dist/build/utils.d.ts","../../node_modules/next/dist/server/lib/router-utils/build-prefetch-segment-data-route.d.ts","../../node_modules/next/dist/build/turborepo-access-trace/types.d.ts","../../node_modules/next/dist/build/turborepo-access-trace/result.d.ts","../../node_modules/next/dist/build/turborepo-access-trace/helpers.d.ts","../../node_modules/next/dist/build/turborepo-access-trace/index.d.ts","../../node_modules/next/dist/export/routes/types.d.ts","../../node_modules/next/dist/export/types.d.ts","../../node_modules/next/dist/export/worker.d.ts","../../node_modules/next/dist/build/worker.d.ts","../../node_modules/next/dist/build/index.d.ts","../../node_modules/next/dist/server/lib/incremental-cache/index.d.ts","../../node_modules/next/dist/server/after/after.d.ts","../../node_modules/next/dist/server/after/after-context.d.ts","../../node_modules/next/dist/server/app-render/work-async-storage-instance.d.ts","../../node_modules/next/dist/server/app-render/create-error-handler.d.ts","../../node_modules/next/dist/shared/lib/action-revalidation-kind.d.ts","../../node_modules/next/dist/server/app-render/work-async-storage.external.d.ts","../../node_modules/next/dist/server/request/params.d.ts","../../node_modules/next/dist/server/route-matches/route-match.d.ts","../../node_modules/next/dist/server/request-meta.d.ts","../../node_modules/next/dist/cli/next-test.d.ts","../../node_modules/next/dist/server/config-shared.d.ts","../../node_modules/next/dist/server/base-http/index.d.ts","../../node_modules/next/dist/server/api-utils/index.d.ts","../../node_modules/next/dist/build/adapter/build-complete.d.ts","../../node_modules/next/dist/types.d.ts","../../node_modules/next/dist/shared/lib/html-context.shared-runtime.d.ts","../../node_modules/next/dist/shared/lib/utils.d.ts","../../node_modules/next/dist/pages/_app.d.ts","../../node_modules/next/app.d.ts","../../node_modules/next/dist/server/web/spec-extension/unstable-cache.d.ts","../../node_modules/next/dist/server/web/spec-extension/revalidate.d.ts","../../node_modules/next/dist/server/web/spec-extension/unstable-no-store.d.ts","../../node_modules/next/dist/server/use-cache/cache-tag.d.ts","../../node_modules/next/cache.d.ts","../../node_modules/next/dist/pages/_document.d.ts","../../node_modules/next/document.d.ts","../../node_modules/next/dist/shared/lib/dynamic.d.ts","../../node_modules/next/dynamic.d.ts","../../node_modules/next/dist/pages/_error.d.ts","../../node_modules/next/error.d.ts","../../node_modules/next/dist/shared/lib/head.d.ts","../../node_modules/next/head.d.ts","../../node_modules/next/dist/server/request/cookies.d.ts","../../node_modules/next/dist/server/request/headers.d.ts","../../node_modules/next/dist/server/request/draft-mode.d.ts","../../node_modules/next/headers.d.ts","../../node_modules/next/dist/shared/lib/get-img-props.d.ts","../../node_modules/next/dist/client/image-component.d.ts","../../node_modules/next/dist/shared/lib/image-external.d.ts","../../node_modules/next/image.d.ts","../../node_modules/next/dist/client/link.d.ts","../../node_modules/next/link.d.ts","../../node_modules/next/dist/client/components/unrecognized-action-error.d.ts","../../node_modules/next/dist/client/components/redirect.d.ts","../../node_modules/next/dist/client/components/not-found.d.ts","../../node_modules/next/dist/client/components/forbidden.d.ts","../../node_modules/next/dist/client/components/unauthorized.d.ts","../../node_modules/next/dist/client/components/unstable-rethrow.server.d.ts","../../node_modules/next/dist/client/components/unstable-rethrow.d.ts","../../node_modules/next/dist/client/components/navigation.react-server.d.ts","../../node_modules/next/dist/client/components/navigation.d.ts","../../node_modules/next/navigation.d.ts","../../node_modules/next/router.d.ts","../../node_modules/next/dist/client/script.d.ts","../../node_modules/next/script.d.ts","../../node_modules/next/dist/server/web/spec-extension/user-agent.d.ts","../../node_modules/next/dist/compiled/@edge-runtime/primitives/url.d.ts","../../node_modules/next/dist/server/web/spec-extension/image-response.d.ts","../../node_modules/next/dist/compiled/@vercel/og/satori/index.d.ts","../../node_modules/next/dist/compiled/@vercel/og/emoji/index.d.ts","../../node_modules/next/dist/compiled/@vercel/og/types.d.ts","../../node_modules/next/dist/server/after/index.d.ts","../../node_modules/next/dist/server/request/connection.d.ts","../../node_modules/next/server.d.ts","../../node_modules/next/types/global.d.ts","../../node_modules/next/types/compiled.d.ts","../../node_modules/next/types.d.ts","../../node_modules/next/index.d.ts","../../node_modules/next/image-types/global.d.ts","./.next/dev/types/routes.d.ts","./next-env.d.ts","../../node_modules/acorn/dist/acorn.d.ts","../../node_modules/@types/estree/index.d.ts","../../node_modules/@types/json-schema/index.d.ts","../../node_modules/@eslint/core/dist/esm/types.d.ts","../../node_modules/eslint/lib/types/use-at-your-own-risk.d.ts","../../node_modules/eslint/lib/types/index.d.ts","../../node_modules/@types/eslint-scope/index.d.ts","../../node_modules/webpack/node_modules/schema-utils/declarations/validationerror.d.ts","../../node_modules/fast-uri/types/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/codegen/code.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/codegen/scope.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/codegen/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/rules.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/util.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/validate/subschema.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/errors.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/validate/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/validate/datatype.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/additionalitems.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/items2020.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/contains.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/dependencies.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/propertynames.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/additionalproperties.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/not.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/anyof.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/oneof.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/if.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/applicator/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/limitnumber.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/multipleof.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/pattern.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/required.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/uniqueitems.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/const.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/enum.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/format/format.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedproperties.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/unevaluated/unevaluateditems.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/validation/dependentrequired.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/discriminator/types.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/discriminator/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/vocabularies/errors.d.ts","../../node_modules/webpack/node_modules/ajv/dist/types/json-schema.d.ts","../../node_modules/webpack/node_modules/ajv/dist/types/jtd-schema.d.ts","../../node_modules/webpack/node_modules/ajv/dist/runtime/validation_error.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/ref_error.d.ts","../../node_modules/webpack/node_modules/ajv/dist/core.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/resolve.d.ts","../../node_modules/webpack/node_modules/ajv/dist/compile/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/types/index.d.ts","../../node_modules/webpack/node_modules/ajv/dist/ajv.d.ts","../../node_modules/webpack/node_modules/schema-utils/declarations/validate.d.ts","../../node_modules/webpack/node_modules/schema-utils/declarations/index.d.ts","../../node_modules/tapable/tapable.d.ts","../../node_modules/webpack/types.d.ts","./next.config.ts","./src/common-components/common/types.ts","./src/common-components/common/utils.ts","./src/components/button.tsx","./src/components/card.tsx","./src/components/loader.tsx","../../node_modules/zustand/vanilla.d.ts","../../node_modules/zustand/react.d.ts","../../node_modules/zustand/index.d.ts","../../node_modules/zustand/middleware/redux.d.ts","../../node_modules/zustand/middleware/devtools.d.ts","../../node_modules/zustand/middleware/subscribewithselector.d.ts","../../node_modules/zustand/middleware/combine.d.ts","../../node_modules/zustand/middleware/persist.d.ts","../../node_modules/zustand/middleware/ssrsafe.d.ts","../../node_modules/zustand/middleware.d.ts","../../packages/shared/dist/types/config.types.d.ts","../../packages/shared/dist/types/quiz.types.d.ts","../../packages/shared/dist/types/user.types.d.ts","../../packages/shared/dist/types/payment.types.d.ts","../../packages/shared/dist/types/index.d.ts","../../packages/shared/dist/constants/index.d.ts","../../packages/shared/dist/utils/index.d.ts","../../packages/shared/dist/index.d.ts","./src/config/env.ts","./src/config/constants.ts","./src/config/index.ts","./src/stores/wallet.store.ts","./src/stores/session.store.ts","./src/stores/index.ts","./src/lib/utils.ts","./src/lib/errors.ts","./src/lib/index.ts","./src/components/layout/navigation.tsx","./src/components/layout/index.ts","./src/components/bc/src/snackbar.tsx","./src/components/bc/src/loader.tsx","./src/components/bc/src/utilscontext.tsx","../../node_modules/@bitcoin-computer/nakamotojs/src/networks.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/address.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/crypto.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/types.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/embed.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2ms.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2pk.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2pkh.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2sh.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2wpkh.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2wsh.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/p2tr.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/payments/index.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/ops.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/script_number.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/script_signature.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/script.d.ts","../../node_modules/bip174/src/lib/interfaces.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/psbt/bip371.d.ts","../../node_modules/varuint-bitcoin/index.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/bufferutils.d.ts","../../node_modules/bip174/src/lib/psbt.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/psbt.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/transaction.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/block.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/ecc_lib.d.ts","../../node_modules/@bitcoin-computer/nakamotojs/src/index.d.ts","../../node_modules/bip32/types/bip32.d.ts","../../node_modules/bip32/types/index.d.ts","../../node_modules/@bitcoin-computer/lib/computer.d.ts","../../node_modules/@bitcoin-computer/lib/index.d.ts","./src/components/bc/src/computercontext.tsx","../../node_modules/react-icons/lib/iconsmanifest.d.ts","../../node_modules/react-icons/lib/iconbase.d.ts","../../node_modules/react-icons/lib/iconcontext.d.ts","../../node_modules/react-icons/lib/index.d.ts","../../node_modules/react-icons/hi/index.d.ts","../../node_modules/react-icons/fi/index.d.ts","../../node_modules/flowbite/lib/esm/components/index.d.ts","../../node_modules/flowbite/lib/esm/types/declarations.d.ts","../../node_modules/flowbite/lib/esm/components/accordion/interface.d.ts","../../node_modules/flowbite/lib/esm/components/accordion/types.d.ts","../../node_modules/flowbite/lib/esm/dom/types.d.ts","../../node_modules/flowbite/lib/esm/components/accordion/index.d.ts","../../node_modules/flowbite/lib/esm/components/carousel/interface.d.ts","../../node_modules/flowbite/lib/esm/components/carousel/types.d.ts","../../node_modules/flowbite/lib/esm/components/carousel/index.d.ts","../../node_modules/flowbite/lib/esm/components/collapse/interface.d.ts","../../node_modules/flowbite/lib/esm/components/collapse/types.d.ts","../../node_modules/flowbite/lib/esm/components/collapse/index.d.ts","../../node_modules/flowbite/lib/esm/components/dial/interface.d.ts","../../node_modules/flowbite/lib/esm/components/dial/types.d.ts","../../node_modules/flowbite/lib/esm/components/dial/index.d.ts","../../node_modules/flowbite/lib/esm/components/dismiss/interface.d.ts","../../node_modules/flowbite/lib/esm/components/dismiss/types.d.ts","../../node_modules/flowbite/lib/esm/components/dismiss/index.d.ts","../../node_modules/flowbite/lib/esm/components/drawer/interface.d.ts","../../node_modules/flowbite/lib/esm/components/drawer/types.d.ts","../../node_modules/flowbite/lib/esm/components/drawer/index.d.ts","../../node_modules/@popperjs/core/lib/enums.d.ts","../../node_modules/@popperjs/core/lib/modifiers/popperoffsets.d.ts","../../node_modules/@popperjs/core/lib/modifiers/flip.d.ts","../../node_modules/@popperjs/core/lib/modifiers/hide.d.ts","../../node_modules/@popperjs/core/lib/modifiers/offset.d.ts","../../node_modules/@popperjs/core/lib/modifiers/eventlisteners.d.ts","../../node_modules/@popperjs/core/lib/modifiers/computestyles.d.ts","../../node_modules/@popperjs/core/lib/modifiers/arrow.d.ts","../../node_modules/@popperjs/core/lib/modifiers/preventoverflow.d.ts","../../node_modules/@popperjs/core/lib/modifiers/applystyles.d.ts","../../node_modules/@popperjs/core/lib/types.d.ts","../../node_modules/@popperjs/core/lib/modifiers/index.d.ts","../../node_modules/@popperjs/core/lib/utils/detectoverflow.d.ts","../../node_modules/@popperjs/core/lib/createpopper.d.ts","../../node_modules/@popperjs/core/lib/popper-lite.d.ts","../../node_modules/@popperjs/core/lib/popper.d.ts","../../node_modules/@popperjs/core/lib/index.d.ts","../../node_modules/@popperjs/core/index.d.ts","../../node_modules/flowbite/lib/esm/components/dropdown/interface.d.ts","../../node_modules/flowbite/lib/esm/components/dropdown/types.d.ts","../../node_modules/flowbite/lib/esm/components/dropdown/index.d.ts","../../node_modules/flowbite/lib/esm/components/modal/interface.d.ts","../../node_modules/flowbite/lib/esm/components/modal/types.d.ts","../../node_modules/flowbite/lib/esm/components/modal/index.d.ts","../../node_modules/flowbite/lib/esm/components/popover/interface.d.ts","../../node_modules/flowbite/lib/esm/components/popover/types.d.ts","../../node_modules/flowbite/lib/esm/components/popover/index.d.ts","../../node_modules/flowbite/lib/esm/components/tabs/interface.d.ts","../../node_modules/flowbite/lib/esm/components/tabs/types.d.ts","../../node_modules/flowbite/lib/esm/components/tabs/index.d.ts","../../node_modules/flowbite/lib/esm/components/tooltip/interface.d.ts","../../node_modules/flowbite/lib/esm/components/tooltip/types.d.ts","../../node_modules/flowbite/lib/esm/components/tooltip/index.d.ts","../../node_modules/flowbite/lib/esm/components/input-counter/interface.d.ts","../../node_modules/flowbite/lib/esm/components/input-counter/types.d.ts","../../node_modules/flowbite/lib/esm/components/input-counter/index.d.ts","../../node_modules/flowbite/lib/esm/components/clipboard/interface.d.ts","../../node_modules/flowbite/lib/esm/components/clipboard/types.d.ts","../../node_modules/flowbite/lib/esm/components/clipboard/index.d.ts","../../node_modules/flowbite/lib/esm/components/datepicker/interface.d.ts","../../node_modules/flowbite/lib/esm/components/datepicker/types.d.ts","../../node_modules/flowbite/lib/esm/components/datepicker/index.d.ts","../../node_modules/flowbite/lib/esm/index.d.ts","./src/components/bc/src/modal.tsx","./src/components/bc/src/common/types.ts","./src/components/bc/src/common/utils.ts","./src/components/bc/src/auth.tsx","./src/components/bc/src/drawer.tsx","./src/components/bc/src/common/modspecs.ts","./src/components/bc/src/wallet.tsx","./src/components/bc/index.ts","./src/components/index.ts","./src/components/bc/test/utils.test.ts","../../packages/sdk/dist/computer/createcomputer.d.ts","../../packages/sdk/dist/computer/index.d.ts","../../packages/quiz-contracts/dist/teacher.d.ts","../../packages/quiz-contracts/dist/student.d.ts","../../packages/quiz-contracts/dist/quiz.d.ts","../../packages/quiz-contracts/dist/quiz-access.d.ts","../../packages/quiz-contracts/dist/attempt.d.ts","../../packages/quiz-contracts/dist/payment.d.ts","../../packages/quiz-contracts/dist/quiz-access-sale.d.ts","../../packages/quiz-contracts/dist/helpers/quiz-access-sale-helper.d.ts","../../packages/quiz-contracts/dist/helpers/payment-helper.d.ts","../../packages/quiz-contracts/dist/helpers/student-helper.d.ts","../../packages/quiz-contracts/dist/helpers/teacher-helper.d.ts","../../packages/quiz-contracts/dist/helpers/attempt-helper.d.ts","../../packages/quiz-contracts/dist/helpers/quiz-helper.d.ts","../../packages/quiz-contracts/dist/helpers/quiz-access-helper.d.ts","../../packages/quiz-contracts/dist/helpers/leaderboard-helper.d.ts","../../packages/quiz-contracts/dist/index.d.ts","../../packages/sdk/dist/clients/teacherclient.d.ts","../../packages/sdk/dist/clients/studentclient.d.ts","../../packages/sdk/dist/clients/quizclient.d.ts","../../packages/sdk/dist/clients/attemptclient.d.ts","../../packages/sdk/dist/clients/accessclient.d.ts","../../packages/sdk/dist/clients/paymentclient.d.ts","../../packages/sdk/dist/clients/index.d.ts","../../packages/sdk/dist/index.d.ts","./src/services/sdk.factory.ts","./src/services/contracts/contractsservice.ts","./src/services/contracts/index.ts","./src/services/api.client.ts","./src/services/tx/txparser.ts","./src/services/bc/browserquizclient.ts","./src/services/bc/browserteacherclient.ts","./src/services/bc/browserattemptclient.ts","./src/services/bc/browseraccessclient.ts","./src/services/bc/index.ts","./src/services/index.ts","./src/features/wallet/wallet.service.ts","./src/features/wallet/components/walletconnect.tsx","./src/hooks/useclients.ts","./src/hooks/usewallet.ts","./src/hooks/index.ts","./src/features/wallet/hooks/usewalletinfo.ts","./src/features/wallet/components/walletdisplay.tsx","./src/features/wallet/components/index.ts","./src/features/wallet/hooks/index.ts","./src/features/wallet/index.ts","./src/features/quizzes/quizzes.service.ts","./src/features/quizzes/components/quizcard.tsx","./src/features/quizzes/components/quizgrid.tsx","./src/features/quizzes/components/quizform.tsx","./src/features/quizzes/components/index.ts","./src/features/quizzes/hooks/usequiz.ts","./src/features/quizzes/hooks/index.ts","./src/features/quizzes/index.ts","./src/features/access/access.service.ts","./src/features/access/components/buyaccessmodal.tsx","./src/features/access/components/index.ts","./src/features/access/index.ts","./src/features/attempts/attempts.service.ts","./src/features/attempts/components/attemptform.tsx","./src/features/attempts/components/resultpanel.tsx","./src/features/attempts/components/index.ts","./src/features/attempts/index.ts","./src/features/payments/payments.service.ts","./src/features/payments/components/withdrawbutton.tsx","./src/features/payments/components/paymentrow.tsx","./src/features/payments/components/index.ts","./src/features/payments/index.ts","./src/features/leaderboard/leaderboard.service.ts","./src/features/leaderboard/components/leaderboardtable.tsx","./src/features/leaderboard/components/index.ts","./src/features/leaderboard/index.ts","./src/features/index.ts","./src/types/common.ts","../../node_modules/next/dist/compiled/@next/font/dist/types.d.ts","../../node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts","../../node_modules/next/font/google/index.d.ts","./src/app/providers.tsx","./src/app/layout.tsx","./src/app/page.tsx","./src/app/leaderboard/page.tsx","./src/app/student/page.tsx","./src/app/student/quizzes/page.tsx","./src/app/student/quizzes/[id]/page.tsx","./src/app/student/quizzes/[id]/attempt/page.tsx","./src/app/student/quizzes/[id]/result/page.tsx","./src/app/teacher/page.tsx","./src/app/teacher/create/page.tsx","./src/app/teacher/quizzes/[id]/page.tsx","./src/components/bc/src/gallery.tsx","../../node_modules/react-string-replace/index.d.ts","./src/components/bc/src/card.tsx","./src/components/bc/src/common/smartcallexecutionresult.tsx","./src/components/bc/src/common/typeselectiondropdown.tsx","./src/components/bc/src/smartobjectfunction.tsx","./src/components/bc/src/smartobjectfunctions.tsx","./src/components/bc/src/smartobject.tsx","./src/components/bc/src/transaction.tsx","./src/components/bc/src/error404.tsx","./src/components/bc/src/actionbuttons.tsx","./src/components/bc/src/index.tsx","./src/app/wallet/page.tsx","./src/common-components/snackbar.tsx","./src/common-components/loader.tsx","./src/common-components/utilscontext.tsx","./src/common-components/modal.tsx","./src/common-components/auth.tsx","./src/common-components/card.tsx","./src/common-components/computercontext.tsx","./src/common-components/drawer.tsx","./src/common-components/wallet.tsx","./src/common-components/gallery.tsx","./src/common-components/common/smartcallexecutionresult.tsx","./src/common-components/common/typeselectiondropdown.tsx","./src/common-components/smartobjectfunction.tsx","./src/common-components/smartobjectfunctions.tsx","./src/common-components/smartobject.tsx","./src/common-components/transaction.tsx","./src/common-components/err.tsx","./src/common-components/missing.tsx","./src/common-components/error404.tsx","./src/common-components/index.tsx","./src/common-components/navbar.tsx","./src/common-components/clientprovider.tsx","./src/common-components/common/components.tsx","./src/components/bc/src/common/components.tsx","./src/mine/page.tsx","./src/mint/page.tsx","./src/objects/[rev]/page.tsx","./src/transactions/[txn]/page.tsx","./.next/dev/types/cache-life.d.ts","./.next/dev/types/validator.ts","../../node_modules/@babel/types/lib/index.d.ts","../../node_modules/@types/babel__generator/index.d.ts","../../node_modules/@babel/parser/typings/babel-parser.d.ts","../../node_modules/@types/babel__template/index.d.ts","../../node_modules/@types/babel__traverse/index.d.ts","../../node_modules/@types/babel__core/index.d.ts","../../node_modules/@types/connect/index.d.ts","../../node_modules/@types/body-parser/index.d.ts","../../node_modules/@types/deep-eql/index.d.ts","../../node_modules/assertion-error/index.d.ts","../../node_modules/@types/chai/index.d.ts","../../node_modules/@types/lodash/common/common.d.ts","../../node_modules/@types/lodash/common/array.d.ts","../../node_modules/@types/lodash/common/collection.d.ts","../../node_modules/@types/lodash/common/date.d.ts","../../node_modules/@types/lodash/common/function.d.ts","../../node_modules/@types/lodash/common/lang.d.ts","../../node_modules/@types/lodash/common/math.d.ts","../../node_modules/@types/lodash/common/number.d.ts","../../node_modules/@types/lodash/common/object.d.ts","../../node_modules/@types/lodash/common/seq.d.ts","../../node_modules/@types/lodash/common/string.d.ts","../../node_modules/@types/lodash/common/util.d.ts","../../node_modules/@types/lodash/index.d.ts","../../node_modules/@types/lodash-match-pattern/index.d.ts","../../node_modules/@types/chai-match-pattern/index.d.ts","../../node_modules/@types/cookiejar/index.d.ts","../../node_modules/@types/eslint/use-at-your-own-risk.d.ts","../../node_modules/@types/eslint/index.d.ts","../../node_modules/@types/send/index.d.ts","../../node_modules/@types/qs/index.d.ts","../../node_modules/@types/range-parser/index.d.ts","../../node_modules/@types/express-serve-static-core/index.d.ts","../../node_modules/@types/http-errors/index.d.ts","../../node_modules/@types/serve-static/index.d.ts","../../node_modules/@types/express/index.d.ts","../../node_modules/@types/graceful-fs/index.d.ts","../../node_modules/@types/istanbul-lib-coverage/index.d.ts","../../node_modules/@types/istanbul-lib-report/index.d.ts","../../node_modules/@types/istanbul-reports/index.d.ts","../../node_modules/@jest/expect-utils/build/index.d.ts","../../node_modules/chalk/index.d.ts","../../node_modules/@sinclair/typebox/typebox.d.ts","../../node_modules/@jest/schemas/build/index.d.ts","../../node_modules/pretty-format/build/index.d.ts","../../node_modules/jest-diff/build/index.d.ts","../../node_modules/jest-matcher-utils/build/index.d.ts","../../node_modules/expect/build/index.d.ts","../../node_modules/@types/jest/index.d.ts","../../node_modules/@types/json5/index.d.ts","../../node_modules/@types/methods/index.d.ts","../../node_modules/@types/mocha/index.d.ts","../../node_modules/@types/resolve/index.d.ts","../../node_modules/@types/stack-utils/index.d.ts","../../node_modules/@types/superagent/lib/agent-base.d.ts","../../node_modules/@types/superagent/lib/node/response.d.ts","../../node_modules/@types/superagent/types.d.ts","../../node_modules/@types/superagent/lib/node/agent.d.ts","../../node_modules/@types/superagent/lib/request-base.d.ts","../../node_modules/form-data/index.d.ts","../../node_modules/@types/superagent/lib/node/http2wrapper.d.ts","../../node_modules/@types/superagent/lib/node/index.d.ts","../../node_modules/@types/superagent/index.d.ts","../../node_modules/@types/supertest/types.d.ts","../../node_modules/@types/supertest/lib/agent.d.ts","../../node_modules/@types/supertest/lib/test.d.ts","../../node_modules/@types/supertest/index.d.ts","../../node_modules/@types/validator/lib/isboolean.d.ts","../../node_modules/@types/validator/lib/isemail.d.ts","../../node_modules/@types/validator/lib/isfqdn.d.ts","../../node_modules/@types/validator/lib/isiban.d.ts","../../node_modules/@types/validator/lib/isiso31661alpha2.d.ts","../../node_modules/@types/validator/lib/isiso4217.d.ts","../../node_modules/@types/validator/lib/isiso6391.d.ts","../../node_modules/@types/validator/lib/istaxid.d.ts","../../node_modules/@types/validator/lib/isurl.d.ts","../../node_modules/@types/validator/index.d.ts","../../node_modules/@types/yargs-parser/index.d.ts","../../node_modules/@types/yargs/index.d.ts"],"fileIdsList":[[97,144,460,461,462,463],[97,144],[97,144,270,507,510,798,799,800,801,802,803,804,805,806,807,808,821],[97,144,508,509,510],[97,144,270,508,568],[97,144,270,603,796,797],[85,97,144,270,482,598,791],[97,144,270,482,601,760],[85,97,144,270,716],[85,97,144,270,482,598,773],[97,144,270,482,492,773,782],[85,97,144,270,482,492,598,755,760,773,777],[85,97,144,270,482,492,760,773,782],[85,97,144,270,482,773],[97,144,270,482,773],[85,97,144,270,482,492,717,758,773],[97,144,270,482,760,765,820],[85,97,144,270,570,637,643,708,824,825],[97,144,270],[85,97,144,270,468,637,708,824,826,828,830,842],[97,144,270,482,492],[85,97,144,270,708],[85,97,144,270,637],[97,144,270,838,839],[85,97,144,270,482,492,571,637,708,824,828],[97,144,270,571,822,824,825,826,827,828,829,830,831,832,836,837,840],[97,144,270,482],[97,144,270,708],[85,97,144,270,482,708,793,841],[85,97,144,270,482,492,571,643,810,825,827,828,832,835],[85,97,144,270,571,824,828,833],[97,144,270,834],[85,97,144,270],[85,97,144,270,482,492,637,810,827,828],[85,97,144,270,822,823],[85,97,144,270,571,637,643,644,824,826,828,829],[97,144,270,606,638,715],[85,97,144,270,606,637,643,708,709,710,711],[85,97,144,270,482,606,637,638,708,711],[97,144,270,604,606,638,709,711,712,713,715,809,811,812,816,817,818,819],[85,97,144,270,482,492,638,643,709,711,810,811,812,815],[85,97,144,270,606,638,711,813],[97,144,270,814],[85,97,144,270,482,492,637,638,810,811],[85,97,144,270,604,605],[85,97,144,270,606,637,638,643,644,711,712,713,714],[97,144,270,711],[97,144,270,572,573,574,603,716],[97,144,270,602],[97,144,270,482,492,598,601],[97,144,270,592],[97,144,270,593,594],[97,144,270,744],[85,97,144,270,755,760,773,774],[97,144,270,775],[97,144,270,774,776],[97,144,270,744,755],[85,97,144,270,492,760,773,778],[97,144,270,779,780],[97,144,270,755,773,778],[97,144,270,778,781],[97,144,270,765,773,777,782,787,791],[97,144,270,789],[97,144,270,601,755,788],[97,144,270,788,790],[97,144,270,755],[97,144,270,784,785],[97,144,270,601,755,783],[85,97,144,270,755,760,783],[97,144,270,783,786],[97,144,270,767,768,769],[97,144,270,482,755,766],[85,97,144,270,492,760,766],[97,144,270,766,767],[97,144,270,771],[85,97,144,270,760,766],[97,144,270,766,770,772],[97,144,270,592,754,755,758],[97,144,270,757,762],[85,97,144,270,492,592,598,755,756],[85,97,144,270,598,601,755,756,760,761],[97,144,270,761],[85,97,144,270,756,760],[97,144,270,756,763,764],[97,144,270,592,637,755],[97,144,270,758,759],[85,97,144,270,598,754,755],[97,144,270,598],[97,144,270,599,600],[85,97,144,270,841],[85,97,144,270,482,841],[97,144,270,593,637],[97,144,270,592,593,637],[97,144,270,592,593,637,750],[97,144,270,592,637,750,751,752,753],[97,144,270,595,637,744,745],[97,144,270,746],[97,144,270,745,747,748,749,754],[97,144,270,592,637,744],[97,144,270,637],[97,144,270,596,597],[97,144,270,577,584,595],[97,144,270,577,584,592,595],[97,144,852],[97,144,192,633,635],[97,144,636],[97,144,607],[97,144,630],[97,144,626],[97,144,610],[97,144,607,608,609,619,620,623,625,627,629,630,631,632],[97,144,619],[97,144,607,610,611,612,613,614,615,616,617,618],[97,144,607,624,628,630],[97,144,610,624],[97,144,607,619,620,621,622],[97,144,629],[97,144,514],[97,144,894],[97,144,682],[97,144,676,678],[97,144,666,676,677,679,680,681],[97,144,676],[97,144,666,676],[97,144,667,668,669,670,671,672,673,674,675],[97,144,667,671,672,675,676,679],[97,144,667,668,669,670,671,672,673,674,675,676,677,679,680],[97,144,666,667,668,669,670,671,672,673,674,675],[97,144,852,853,854,855,856],[97,144,852,854],[97,144,158,192,858],[97,144,862,876],[97,144,860,861],[97,144,158,192],[97,144,513,517],[97,144,513,514,879],[97,144,880],[97,144,155,158,192,881,882,883],[97,144,859,884,886],[97,144,156,192],[97,144,889],[97,144,890],[97,144,896,899],[97,144,863,864,865,866,867,868,869,870,871,872,873,874,875],[97,144,863,865,866,867,868,869,870,871,872,873,874,875,876],[97,144,863,864,866,867,868,869,870,871,872,873,874,875,876],[97,144,864,865,866,867,868,869,870,871,872,873,874,875,876],[97,144,863,864,865,867,868,869,870,871,872,873,874,875,876],[97,144,863,864,865,866,868,869,870,871,872,873,874,875,876],[97,144,863,864,865,866,867,869,870,871,872,873,874,875,876],[97,144,863,864,865,866,867,868,870,871,872,873,874,875,876],[97,144,863,864,865,866,867,868,869,871,872,873,874,875,876],[97,144,863,864,865,866,867,868,869,870,872,873,874,875,876],[97,144,863,864,865,866,867,868,869,870,871,873,874,875,876],[97,144,863,864,865,866,867,868,869,870,871,872,874,875,876],[97,144,863,864,865,866,867,868,869,870,871,872,873,875,876],[97,144,863,864,865,866,867,868,869,870,871,872,873,874],[97,141,144],[97,143,144],[144],[97,144,149,177],[97,144,145,150,155,163,174,185],[97,144,145,146,155,163],[92,93,94,97,144],[97,144,147,186],[97,144,148,149,156,164],[97,144,149,174,182],[97,144,150,152,155,163],[97,143,144,151],[97,144,152,153],[97,144,154,155],[97,143,144,155],[97,144,155,156,157,174,185],[97,144,155,156,157,170,174,177],[97,144,152,155,158,163,174,185],[97,144,155,156,158,159,163,174,182,185],[97,144,158,160,174,182,185],[95,96,97,98,99,100,101,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191],[97,144,155,161],[97,144,162,185,190],[97,144,152,155,163,174],[97,144,164],[97,144,165],[97,143,144,166],[97,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191],[97,144,168],[97,144,169],[97,144,155,170,171],[97,144,170,172,186,188],[97,144,155,174,175,177],[97,144,176,177],[97,144,174,175],[97,144,177],[97,144,178],[97,141,144,174,179],[97,144,155,180,181],[97,144,180,181],[97,144,149,163,174,182],[97,144,183],[97,144,163,184],[97,144,158,169,185],[97,144,149,186],[97,144,174,187],[97,144,162,188],[97,144,189],[97,139,144],[97,139,144,155,157,166,174,177,185,188,190],[97,144,174,191],[85,89,97,144,193,194,195,197,455,501],[85,97,144],[85,89,97,144,193,194,195,196,413,455,501],[85,89,97,144,193,194,196,197,455,501],[85,97,144,197,413,414],[85,97,144,197,413],[85,89,97,144,194,195,196,197,455,501],[85,89,97,144,193,195,196,197,455,501],[83,84,97,144],[97,144,156,174,192],[97,144,158,192,885],[97,144,913],[97,144,878,902,906,908,914],[97,144,159,163,174,182,192],[97,144,156,158,159,160,163,174,902,907,908,909,910,911,912],[97,144,158,174,913],[97,144,156,907,908],[97,144,185,907],[97,144,914,915,916,917],[97,144,914,915,918],[97,144,914,915],[97,144,158,159,163,902,914],[97,144,919,920,921,922,923,924,925,926,927],[97,144,929],[97,144,192],[97,144,192,624],[97,144,634],[97,144,513,515,516],[97,144,517],[97,144,892,898],[97,144,647,648,649],[97,144,648],[97,144,647],[97,144,649,651,652],[97,144,652],[97,144,651],[97,144,649,702,703],[97,144,703],[97,144,702],[97,144,649,654,655],[97,144,655],[97,144,654],[97,144,646,649,705,706],[97,144,706],[97,144,705],[97,144,649,657,658],[97,144,658],[97,144,657],[97,144,649,660,661],[97,144,661],[97,144,660],[97,144,649,663,664],[97,144,664],[97,144,663],[97,144,649,683,684,685],[97,144,683,685],[97,144,683,684],[97,144,649,699,700],[97,144,700],[97,144,699],[97,144,649,687,688],[97,144,688],[97,144,687],[97,144,649,683,690,691],[97,144,683,691],[97,144,683,690],[97,144,649,693,694],[97,144,694],[97,144,693],[97,144,649,683,696,697],[97,144,683,697],[97,144,683,696],[97,144,645,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707],[97,144,158,174,192],[97,144,896],[97,144,893,897],[97,144,458],[97,144,202,204,208,219,409,439,451],[97,144,204,214,215,216,218,451],[97,144,204,251,253,255,256,259,451,453],[97,144,204,208,210,211,212,242,337,409,429,430,438,451,453],[97,144,451],[97,144,215,307,418,427,447],[97,144,204],[97,144,198,307,447],[97,144,261],[97,144,260,451],[97,144,158,407,418,506],[97,144,158,375,387,427,446],[97,144,158,318],[97,144,432],[97,144,431,432,433],[97,144,431],[91,97,144,158,198,204,208,211,213,215,219,220,233,234,261,337,348,428,439,451,455],[97,144,202,204,217,251,252,257,258,451,506],[97,144,217,506],[97,144,202,234,362,451,506],[97,144,506],[97,144,204,217,218,506],[97,144,254,506],[97,144,220,429,437],[97,144,169,270,447],[97,144,270,447],[85,97,144,379],[97,144,305,315,316,447,483,490],[97,144,304,424,484,485,486,487,489],[97,144,423],[97,144,423,424],[97,144,242,307,308,312],[97,144,307],[97,144,307,311,313],[97,144,307,308,309,310],[97,144,488],[85,97,144,205,477],[85,97,144,185],[85,97,144,217,297],[85,97,144,217,439],[97,144,295,299],[85,97,144,296,457],[97,144,794],[85,89,97,144,158,192,193,194,195,196,197,455,499,500],[97,144,158],[97,144,158,208,241,293,338,359,361,434,435,439,451,452],[97,144,233,436],[97,144,455],[97,144,203],[85,97,144,364,377,386,396,398,446],[97,144,169,364,377,395,396,397,446,505],[97,144,389,390,391,392,393,394],[97,144,391],[97,144,395],[97,144,268,269,270,272],[85,97,144,262,263,264,265,271],[97,144,268,271],[97,144,266],[97,144,267],[85,97,144,270,296,457],[85,97,144,270,456,457],[85,97,144,270,457],[97,144,338,441],[97,144,441],[97,144,158,452,457],[97,144,383],[97,143,144,382],[97,144,243,307,324,361,370,373,375,376,417,446,449,452],[97,144,289,307,404],[97,144,375,446],[85,97,144,375,380,381,383,384,385,386,387,388,399,400,401,402,403,405,406,446,447,506],[97,144,369],[97,144,158,169,205,241,244,265,290,291,338,348,359,360,417,440,451,452,453,455,506],[97,144,446],[97,143,144,215,291,348,372,440,442,443,444,445,452],[97,144,375],[97,143,144,241,278,324,365,366,367,368,369,370,371,373,374,446,447],[97,144,158,278,279,365,452,453],[97,144,215,338,348,361,440,446,452],[97,144,158,451,453],[97,144,158,174,449,452,453],[97,144,158,169,185,198,208,217,243,244,246,275,280,285,289,290,291,293,322,324,326,329,331,334,335,336,337,359,361,439,440,447,449,451,452,453],[97,144,158,174],[97,144,204,205,206,213,449,450,455,457,506],[97,144,202,451],[97,144,274],[97,144,158,174,185,236,259,261,262,263,264,265,272,273,506],[97,144,169,185,198,236,251,284,285,286,322,323,324,329,337,338,344,347,349,359,361,440,447,449,451],[97,144,213,220,233,337,348,440,451],[97,144,158,185,205,208,324,342,449,451],[97,144,363],[97,144,158,274,345,346,356],[97,144,449,451],[97,144,370,372],[97,144,291,324,439,457],[97,144,158,169,247,251,323,329,344,347,351,449],[97,144,158,220,233,251,352],[97,144,204,246,354,439,451],[97,144,158,185,265,451],[97,144,158,217,245,246,247,256,274,353,355,439,451],[91,97,144,158,291,358,455,457],[97,144,321,359],[97,144,158,169,185,208,219,220,233,243,244,280,284,285,286,290,322,323,324,326,338,339,341,343,359,361,439,440,447,448,449,457],[97,144,158,174,220,344,350,356,449],[97,144,223,224,225,226,227,228,229,230,231,232],[97,144,275,330],[97,144,332],[97,144,330],[97,144,332,333],[97,144,158,208,211,241,242,452],[97,144,158,169,203,205,243,289,290,291,292,320,359,449,453,455,457],[97,144,158,169,185,207,242,292,324,370,440,448,452],[97,144,365],[97,144,366],[97,144,307,337,417],[97,144,367],[97,144,235,239],[97,144,158,208,235,243],[97,144,238,239],[97,144,240],[97,144,235,236],[97,144,235,287],[97,144,235],[97,144,275,328,448],[97,144,327],[97,144,236,447,448],[97,144,325,448],[97,144,236,447],[97,144,417],[97,144,208,237,243,291,307,324,358,361,364,370,377,378,408,409,412,416,439,449,452],[97,144,300,303,305,306,315,316],[85,97,144,195,197,270,410,411],[85,97,144,195,197,270,410,411,415],[97,144,426],[97,144,215,279,291,358,361,375,383,387,419,420,421,422,424,425,428,439,446,451],[97,144,315],[97,144,158,320],[97,144,320],[97,144,158,243,288,293,317,319,358,449,455,457],[97,144,300,301,302,303,305,306,315,316,456],[91,97,144,158,169,185,235,236,244,290,291,324,356,357,359,439,440,449,451,452,455],[97,144,279,281,284,440],[97,144,158,275,451],[97,144,278,375],[97,144,277],[97,144,279,280],[97,144,276,278,451],[97,144,158,207,279,281,282,283,451,452],[85,97,144,307,314,447],[97,144,200,201],[85,97,144,205],[85,97,144,304,447],[85,91,97,144,290,291,455,457],[97,144,205,477,478],[85,97,144,299],[85,97,144,169,185,203,258,294,296,298,457],[97,144,217,447,452],[97,144,340,447],[85,97,144,156,158,169,202,203,253,299,455,456],[85,97,144,193,194,195,196,197,455,501],[85,86,87,88,89,97,144],[97,144,149],[97,144,248,249,250],[97,144,248],[85,89,97,144,158,160,169,192,193,194,195,196,197,198,203,244,351,395,453,454,457,501],[97,144,465],[97,144,467],[97,144,469],[97,144,795],[97,144,471],[97,144,473,474,475],[97,144,479],[90,97,144,459,464,466,468,470,472,476,480,482,492,493,495,504,505,506,507],[97,144,481],[97,144,491],[97,144,296],[97,144,494],[97,143,144,279,281,282,284,496,497,498,501,502,503],[97,144,895],[97,144,642],[97,144,639,640,641],[97,144,174,192],[97,111,115,144,185],[97,111,144,174,185],[97,106,144],[97,108,111,144,182,185],[97,144,163,182],[97,106,144,192],[97,108,111,144,163,185],[97,103,104,107,110,144,155,174,185],[97,111,118,144],[97,103,109,144],[97,111,132,133,144],[97,107,111,144,177,185,192],[97,132,144,192],[97,105,106,144,192],[97,111,144],[97,105,106,107,108,109,110,111,112,113,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,133,134,135,136,137,138,144],[97,111,126,144],[97,111,118,119,144],[97,109,111,119,120,144],[97,110,144],[97,103,106,111,144],[97,111,115,119,120,144],[97,115,144],[97,109,111,114,144,185],[97,103,108,111,118,144],[97,144,174],[97,106,111,132,144,190,192],[97,144,523,524,528,555,556,558,559,560,562,563],[97,144,521,522],[97,144,521],[97,144,523,563],[97,144,523,524,560,561,563],[97,144,563],[97,144,520,563,564],[97,144,523,524,562,563],[97,144,523,524,526,527,562,563],[97,144,523,524,525,562,563],[97,144,523,524,528,555,556,557,558,559,562,563],[97,144,520,523,524,528,560,562],[97,144,528,563],[97,144,530,531,532,533,534,535,536,537,538,539,563],[97,144,553,563],[97,144,529,540,548,549,550,551,552,554],[97,144,533,563],[97,144,541,542,543,544,545,546,547,563],[97,144,565],[97,144,514,519,564],[97,144,514,565],[97,144,158,160,161,163,185,188,512,513,514,518,519,566,567],[97,144,575,576,578,579,580,582],[97,144,578,579,580,581,582,583],[97,144,575,578,579,580,582],[97,144,637,724],[97,144,637,723,724,725],[97,144,729],[97,144,726],[97,144,637,724,726],[97,144,637],[97,144,637,722,723,724,729],[97,144,637,721,723,726,729],[97,144,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735],[97,144,637,736],[97,144,737,738,739,740,741,742],[97,144,592,637],[97,144,592,637,736],[97,144,719],[97,144,592,720,743],[97,144,589,590,591],[97,144,585,586,587,588]],"fileInfos":[{"version":"c430d44666289dae81f30fa7b2edebf186ecc91a2d4c71266ea6ae76388792e1","affectsGlobalScope":true,"impliedFormat":1},{"version":"45b7ab580deca34ae9729e97c13cfd999df04416a79116c3bfb483804f85ded4","impliedFormat":1},{"version":"3facaf05f0c5fc569c5649dd359892c98a85557e3e0c847964caeb67076f4d75","impliedFormat":1},{"version":"e44bb8bbac7f10ecc786703fe0a6a4b952189f908707980ba8f3c8975a760962","impliedFormat":1},{"version":"5e1c4c362065a6b95ff952c0eab010f04dcd2c3494e813b493ecfd4fcb9fc0d8","impliedFormat":1},{"version":"68d73b4a11549f9c0b7d352d10e91e5dca8faa3322bfb77b661839c42b1ddec7","impliedFormat":1},{"version":"5efce4fc3c29ea84e8928f97adec086e3dc876365e0982cc8479a07954a3efd4","impliedFormat":1},{"version":"feecb1be483ed332fad555aff858affd90a48ab19ba7272ee084704eb7167569","impliedFormat":1},{"version":"ee7bad0c15b58988daa84371e0b89d313b762ab83cb5b31b8a2d1162e8eb41c2","impliedFormat":1},{"version":"27bdc30a0e32783366a5abeda841bc22757c1797de8681bbe81fbc735eeb1c10","impliedFormat":1},{"version":"8fd575e12870e9944c7e1d62e1f5a73fcf23dd8d3a321f2a2c74c20d022283fe","impliedFormat":1},{"version":"2ab096661c711e4a81cc464fa1e6feb929a54f5340b46b0a07ac6bbf857471f0","impliedFormat":1},{"version":"080941d9f9ff9307f7e27a83bcd888b7c8270716c39af943532438932ec1d0b9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2e80ee7a49e8ac312cc11b77f1475804bee36b3b2bc896bead8b6e1266befb43","affectsGlobalScope":true,"impliedFormat":1},{"version":"c57796738e7f83dbc4b8e65132f11a377649c00dd3eee333f672b8f0a6bea671","affectsGlobalScope":true,"impliedFormat":1},{"version":"dc2df20b1bcdc8c2d34af4926e2c3ab15ffe1160a63e58b7e09833f616efff44","affectsGlobalScope":true,"impliedFormat":1},{"version":"515d0b7b9bea2e31ea4ec968e9edd2c39d3eebf4a2d5cbd04e88639819ae3b71","affectsGlobalScope":true,"impliedFormat":1},{"version":"0559b1f683ac7505ae451f9a96ce4c3c92bdc71411651ca6ddb0e88baaaad6a3","affectsGlobalScope":true,"impliedFormat":1},{"version":"0dc1e7ceda9b8b9b455c3a2d67b0412feab00bd2f66656cd8850e8831b08b537","affectsGlobalScope":true,"impliedFormat":1},{"version":"ce691fb9e5c64efb9547083e4a34091bcbe5bdb41027e310ebba8f7d96a98671","affectsGlobalScope":true,"impliedFormat":1},{"version":"8d697a2a929a5fcb38b7a65594020fcef05ec1630804a33748829c5ff53640d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ff2a353abf8a80ee399af572debb8faab2d33ad38c4b4474cff7f26e7653b8d","affectsGlobalScope":true,"impliedFormat":1},{"version":"fb0f136d372979348d59b3f5020b4cdb81b5504192b1cacff5d1fbba29378aa1","affectsGlobalScope":true,"impliedFormat":1},{"version":"d15bea3d62cbbdb9797079416b8ac375ae99162a7fba5de2c6c505446486ac0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"68d18b664c9d32a7336a70235958b8997ebc1c3b8505f4f1ae2b7e7753b87618","affectsGlobalScope":true,"impliedFormat":1},{"version":"eb3d66c8327153d8fa7dd03f9c58d351107fe824c79e9b56b462935176cdf12a","affectsGlobalScope":true,"impliedFormat":1},{"version":"38f0219c9e23c915ef9790ab1d680440d95419ad264816fa15009a8851e79119","affectsGlobalScope":true,"impliedFormat":1},{"version":"69ab18c3b76cd9b1be3d188eaf8bba06112ebbe2f47f6c322b5105a6fbc45a2e","affectsGlobalScope":true,"impliedFormat":1},{"version":"a680117f487a4d2f30ea46f1b4b7f58bef1480456e18ba53ee85c2746eeca012","affectsGlobalScope":true,"impliedFormat":1},{"version":"2f11ff796926e0832f9ae148008138ad583bd181899ab7dd768a2666700b1893","affectsGlobalScope":true,"impliedFormat":1},{"version":"4de680d5bb41c17f7f68e0419412ca23c98d5749dcaaea1896172f06435891fc","affectsGlobalScope":true,"impliedFormat":1},{"version":"954296b30da6d508a104a3a0b5d96b76495c709785c1d11610908e63481ee667","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac9538681b19688c8eae65811b329d3744af679e0bdfa5d842d0e32524c73e1c","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a969edff4bd52585473d24995c5ef223f6652d6ef46193309b3921d65dd4376","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e9fbd7030c440b33d021da145d3232984c8bb7916f277e8ffd3dc2e3eae2bdb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811ec78f7fefcabbda4bfa93b3eb67d9ae166ef95f9bff989d964061cbf81a0c","affectsGlobalScope":true,"impliedFormat":1},{"version":"717937616a17072082152a2ef351cb51f98802fb4b2fdabd32399843875974ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"d7e7d9b7b50e5f22c915b525acc5a49a7a6584cf8f62d0569e557c5cfc4b2ac2","affectsGlobalScope":true,"impliedFormat":1},{"version":"71c37f4c9543f31dfced6c7840e068c5a5aacb7b89111a4364b1d5276b852557","affectsGlobalScope":true,"impliedFormat":1},{"version":"576711e016cf4f1804676043e6a0a5414252560eb57de9faceee34d79798c850","affectsGlobalScope":true,"impliedFormat":1},{"version":"89c1b1281ba7b8a96efc676b11b264de7a8374c5ea1e6617f11880a13fc56dc6","affectsGlobalScope":true,"impliedFormat":1},{"version":"74f7fa2d027d5b33eb0471c8e82a6c87216223181ec31247c357a3e8e2fddc5b","affectsGlobalScope":true,"impliedFormat":1},{"version":"d6d7ae4d1f1f3772e2a3cde568ed08991a8ae34a080ff1151af28b7f798e22ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"063600664504610fe3e99b717a1223f8b1900087fab0b4cad1496a114744f8df","affectsGlobalScope":true,"impliedFormat":1},{"version":"934019d7e3c81950f9a8426d093458b65d5aff2c7c1511233c0fd5b941e608ab","affectsGlobalScope":true,"impliedFormat":1},{"version":"52ada8e0b6e0482b728070b7639ee42e83a9b1c22d205992756fe020fd9f4a47","affectsGlobalScope":true,"impliedFormat":1},{"version":"3bdefe1bfd4d6dee0e26f928f93ccc128f1b64d5d501ff4a8cf3c6371200e5e6","affectsGlobalScope":true,"impliedFormat":1},{"version":"59fb2c069260b4ba00b5643b907ef5d5341b167e7d1dbf58dfd895658bda2867","affectsGlobalScope":true,"impliedFormat":1},{"version":"639e512c0dfc3fad96a84caad71b8834d66329a1f28dc95e3946c9b58176c73a","affectsGlobalScope":true,"impliedFormat":1},{"version":"368af93f74c9c932edd84c58883e736c9e3d53cec1fe24c0b0ff451f529ceab1","affectsGlobalScope":true,"impliedFormat":1},{"version":"af3dd424cf267428f30ccfc376f47a2c0114546b55c44d8c0f1d57d841e28d74","affectsGlobalScope":true,"impliedFormat":1},{"version":"995c005ab91a498455ea8dfb63aa9f83fa2ea793c3d8aa344be4a1678d06d399","affectsGlobalScope":true,"impliedFormat":1},{"version":"959d36cddf5e7d572a65045b876f2956c973a586da58e5d26cde519184fd9b8a","affectsGlobalScope":true,"impliedFormat":1},{"version":"965f36eae237dd74e6cca203a43e9ca801ce38824ead814728a2807b1910117d","affectsGlobalScope":true,"impliedFormat":1},{"version":"3925a6c820dcb1a06506c90b1577db1fdbf7705d65b62b99dce4be75c637e26b","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a3d63ef2b853447ec4f749d3f368ce642264246e02911fcb1590d8c161b8005","affectsGlobalScope":true,"impliedFormat":1},{"version":"8cdf8847677ac7d20486e54dd3fcf09eda95812ac8ace44b4418da1bbbab6eb8","affectsGlobalScope":true,"impliedFormat":1},{"version":"8444af78980e3b20b49324f4a16ba35024fef3ee069a0eb67616ea6ca821c47a","affectsGlobalScope":true,"impliedFormat":1},{"version":"3287d9d085fbd618c3971944b65b4be57859f5415f495b33a6adc994edd2f004","affectsGlobalScope":true,"impliedFormat":1},{"version":"b4b67b1a91182421f5df999988c690f14d813b9850b40acd06ed44691f6727ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"df83c2a6c73228b625b0beb6669c7ee2a09c914637e2d35170723ad49c0f5cd4","affectsGlobalScope":true,"impliedFormat":1},{"version":"436aaf437562f276ec2ddbee2f2cdedac7664c1e4c1d2c36839ddd582eeb3d0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e3c06ea092138bf9fa5e874a1fdbc9d54805d074bee1de31b99a11e2fec239d","affectsGlobalScope":true,"impliedFormat":1},{"version":"87dc0f382502f5bbce5129bdc0aea21e19a3abbc19259e0b43ae038a9fc4e326","affectsGlobalScope":true,"impliedFormat":1},{"version":"b1cb28af0c891c8c96b2d6b7be76bd394fddcfdb4709a20ba05a7c1605eea0f9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2fef54945a13095fdb9b84f705f2b5994597640c46afeb2ce78352fab4cb3279","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac77cb3e8c6d3565793eb90a8373ee8033146315a3dbead3bde8db5eaf5e5ec6","affectsGlobalScope":true,"impliedFormat":1},{"version":"56e4ed5aab5f5920980066a9409bfaf53e6d21d3f8d020c17e4de584d29600ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ece9f17b3866cc077099c73f4983bddbcb1dc7ddb943227f1ec070f529dedd1","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a6282c8827e4b9a95f4bf4f5c205673ada31b982f50572d27103df8ceb8013c","affectsGlobalScope":true,"impliedFormat":1},{"version":"1c9319a09485199c1f7b0498f2988d6d2249793ef67edda49d1e584746be9032","affectsGlobalScope":true,"impliedFormat":1},{"version":"e3a2a0cee0f03ffdde24d89660eba2685bfbdeae955a6c67e8c4c9fd28928eeb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811c71eee4aa0ac5f7adf713323a5c41b0cf6c4e17367a34fbce379e12bbf0a4","affectsGlobalScope":true,"impliedFormat":1},{"version":"51ad4c928303041605b4d7ae32e0c1ee387d43a24cd6f1ebf4a2699e1076d4fa","affectsGlobalScope":true,"impliedFormat":1},{"version":"60037901da1a425516449b9a20073aa03386cce92f7a1fd902d7602be3a7c2e9","affectsGlobalScope":true,"impliedFormat":1},{"version":"d4b1d2c51d058fc21ec2629fff7a76249dec2e36e12960ea056e3ef89174080f","affectsGlobalScope":true,"impliedFormat":1},{"version":"22adec94ef7047a6c9d1af3cb96be87a335908bf9ef386ae9fd50eeb37f44c47","affectsGlobalScope":true,"impliedFormat":1},{"version":"196cb558a13d4533a5163286f30b0509ce0210e4b316c56c38d4c0fd2fb38405","affectsGlobalScope":true,"impliedFormat":1},{"version":"73f78680d4c08509933daf80947902f6ff41b6230f94dd002ae372620adb0f60","affectsGlobalScope":true,"impliedFormat":1},{"version":"c5239f5c01bcfa9cd32f37c496cf19c61d69d37e48be9de612b541aac915805b","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e7f8264d0fb4c5339605a15daadb037bf238c10b654bb3eee14208f860a32ea","affectsGlobalScope":true,"impliedFormat":1},{"version":"782dec38049b92d4e85c1585fbea5474a219c6984a35b004963b00beb1aab538","affectsGlobalScope":true,"impliedFormat":1},{"version":"170d4db14678c68178ee8a3d5a990d5afb759ecb6ec44dbd885c50f6da6204f6","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac51dd7d31333793807a6abaa5ae168512b6131bd41d9c5b98477fc3b7800f9f","impliedFormat":1},{"version":"cf8db38686dfd74567ea692266fe44fbb32fa0e25fc0888ad6fc40e65873607e","impliedFormat":1},{"version":"acd8fd5090ac73902278889c38336ff3f48af6ba03aa665eb34a75e7ba1dccc4","impliedFormat":1},{"version":"d6258883868fb2680d2ca96bc8b1352cab69874581493e6d52680c5ffecdb6cc","impliedFormat":1},{"version":"1b61d259de5350f8b1e5db06290d31eaebebc6baafd5f79d314b5af9256d7153","impliedFormat":1},{"version":"f258e3960f324a956fc76a3d3d9e964fff2244ff5859dcc6ce5951e5413ca826","impliedFormat":1},{"version":"643f7232d07bf75e15bd8f658f664d6183a0efaca5eb84b48201c7671a266979","impliedFormat":1},{"version":"21da358700a3893281ce0c517a7a30cbd46be020d9f0c3f2834d0a8ad1f5fc75","impliedFormat":1},{"version":"70521b6ab0dcba37539e5303104f29b721bfb2940b2776da4cc818c07e1fefc1","affectsGlobalScope":true,"impliedFormat":1},{"version":"ab41ef1f2cdafb8df48be20cd969d875602483859dc194e9c97c8a576892c052","affectsGlobalScope":true,"impliedFormat":1},{"version":"d153a11543fd884b596587ccd97aebbeed950b26933ee000f94009f1ab142848","affectsGlobalScope":true,"impliedFormat":1},{"version":"21d819c173c0cf7cc3ce57c3276e77fd9a8a01d35a06ad87158781515c9a438a","impliedFormat":1},{"version":"98cffbf06d6bab333473c70a893770dbe990783904002c4f1a960447b4b53dca","affectsGlobalScope":true,"impliedFormat":1},{"version":"ba481bca06f37d3f2c137ce343c7d5937029b2468f8e26111f3c9d9963d6568d","affectsGlobalScope":true,"impliedFormat":1},{"version":"6d9ef24f9a22a88e3e9b3b3d8c40ab1ddb0853f1bfbd5c843c37800138437b61","affectsGlobalScope":true,"impliedFormat":1},{"version":"1db0b7dca579049ca4193d034d835f6bfe73096c73663e5ef9a0b5779939f3d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"9798340ffb0d067d69b1ae5b32faa17ab31b82466a3fc00d8f2f2df0c8554aaa","affectsGlobalScope":true,"impliedFormat":1},{"version":"f26b11d8d8e4b8028f1c7d618b22274c892e4b0ef5b3678a8ccbad85419aef43","affectsGlobalScope":true,"impliedFormat":1},{"version":"4967529644e391115ca5592184d4b63980569adf60ee685f968fd59ab1557188","impliedFormat":1},{"version":"5929864ce17fba74232584d90cb721a89b7ad277220627cc97054ba15a98ea8f","impliedFormat":1},{"version":"763fe0f42b3d79b440a9b6e51e9ba3f3f91352469c1e4b3b67bfa4ff6352f3f4","impliedFormat":1},{"version":"25c8056edf4314820382a5fdb4bb7816999acdcb929c8f75e3f39473b87e85bc","impliedFormat":1},{"version":"c464d66b20788266e5353b48dc4aa6bc0dc4a707276df1e7152ab0c9ae21fad8","impliedFormat":1},{"version":"78d0d27c130d35c60b5e5566c9f1e5be77caf39804636bc1a40133919a949f21","impliedFormat":1},{"version":"c6fd2c5a395f2432786c9cb8deb870b9b0e8ff7e22c029954fabdd692bff6195","impliedFormat":1},{"version":"1d6e127068ea8e104a912e42fc0a110e2aa5a66a356a917a163e8cf9a65e4a75","impliedFormat":1},{"version":"5ded6427296cdf3b9542de4471d2aa8d3983671d4cac0f4bf9c637208d1ced43","impliedFormat":1},{"version":"7f182617db458e98fc18dfb272d40aa2fff3a353c44a89b2c0ccb3937709bfb5","impliedFormat":1},{"version":"cadc8aced301244057c4e7e73fbcae534b0f5b12a37b150d80e5a45aa4bebcbd","impliedFormat":1},{"version":"385aab901643aa54e1c36f5ef3107913b10d1b5bb8cbcd933d4263b80a0d7f20","impliedFormat":1},{"version":"9670d44354bab9d9982eca21945686b5c24a3f893db73c0dae0fd74217a4c219","impliedFormat":1},{"version":"0b8a9268adaf4da35e7fa830c8981cfa22adbbe5b3f6f5ab91f6658899e657a7","impliedFormat":1},{"version":"11396ed8a44c02ab9798b7dca436009f866e8dae3c9c25e8c1fbc396880bf1bb","impliedFormat":1},{"version":"ba7bc87d01492633cb5a0e5da8a4a42a1c86270e7b3d2dea5d156828a84e4882","impliedFormat":1},{"version":"4893a895ea92c85345017a04ed427cbd6a1710453338df26881a6019432febdd","impliedFormat":1},{"version":"c21dc52e277bcfc75fac0436ccb75c204f9e1b3fa5e12729670910639f27343e","impliedFormat":1},{"version":"13f6f39e12b1518c6650bbb220c8985999020fe0f21d818e28f512b7771d00f9","impliedFormat":1},{"version":"9b5369969f6e7175740bf51223112ff209f94ba43ecd3bb09eefff9fd675624a","impliedFormat":1},{"version":"4fe9e626e7164748e8769bbf74b538e09607f07ed17c2f20af8d680ee49fc1da","impliedFormat":1},{"version":"24515859bc0b836719105bb6cc3d68255042a9f02a6022b3187948b204946bd2","impliedFormat":1},{"version":"ea0148f897b45a76544ae179784c95af1bd6721b8610af9ffa467a518a086a43","impliedFormat":1},{"version":"24c6a117721e606c9984335f71711877293a9651e44f59f3d21c1ea0856f9cc9","impliedFormat":1},{"version":"dd3273ead9fbde62a72949c97dbec2247ea08e0c6952e701a483d74ef92d6a17","impliedFormat":1},{"version":"405822be75ad3e4d162e07439bac80c6bcc6dbae1929e179cf467ec0b9ee4e2e","impliedFormat":1},{"version":"0db18c6e78ea846316c012478888f33c11ffadab9efd1cc8bcc12daded7a60b6","impliedFormat":1},{"version":"e61be3f894b41b7baa1fbd6a66893f2579bfad01d208b4ff61daef21493ef0a8","impliedFormat":1},{"version":"bd0532fd6556073727d28da0edfd1736417a3f9f394877b6d5ef6ad88fba1d1a","impliedFormat":1},{"version":"89167d696a849fce5ca508032aabfe901c0868f833a8625d5a9c6e861ef935d2","impliedFormat":1},{"version":"615ba88d0128ed16bf83ef8ccbb6aff05c3ee2db1cc0f89ab50a4939bfc1943f","impliedFormat":1},{"version":"a4d551dbf8746780194d550c88f26cf937caf8d56f102969a110cfaed4b06656","impliedFormat":1},{"version":"8bd86b8e8f6a6aa6c49b71e14c4ffe1211a0e97c80f08d2c8cc98838006e4b88","impliedFormat":1},{"version":"317e63deeb21ac07f3992f5b50cdca8338f10acd4fbb7257ebf56735bf52ab00","impliedFormat":1},{"version":"4732aec92b20fb28c5fe9ad99521fb59974289ed1e45aecb282616202184064f","impliedFormat":1},{"version":"2e85db9e6fd73cfa3d7f28e0ab6b55417ea18931423bd47b409a96e4a169e8e6","impliedFormat":1},{"version":"c46e079fe54c76f95c67fb89081b3e399da2c7d109e7dca8e4b58d83e332e605","impliedFormat":1},{"version":"bf67d53d168abc1298888693338cb82854bdb2e69ef83f8a0092093c2d562107","impliedFormat":1},{"version":"2cbe0621042e2a68c7cbce5dfed3906a1862a16a7d496010636cdbdb91341c0f","affectsGlobalScope":true,"impliedFormat":1},{"version":"e2677634fe27e87348825bb041651e22d50a613e2fdf6a4a3ade971d71bac37e","impliedFormat":1},{"version":"7394959e5a741b185456e1ef5d64599c36c60a323207450991e7a42e08911419","impliedFormat":1},{"version":"8c0bcd6c6b67b4b503c11e91a1fb91522ed585900eab2ab1f61bba7d7caa9d6f","impliedFormat":1},{"version":"8cd19276b6590b3ebbeeb030ac271871b9ed0afc3074ac88a94ed2449174b776","affectsGlobalScope":true,"impliedFormat":1},{"version":"696eb8d28f5949b87d894b26dc97318ef944c794a9a4e4f62360cd1d1958014b","impliedFormat":1},{"version":"3f8fa3061bd7402970b399300880d55257953ee6d3cd408722cb9ac20126460c","impliedFormat":1},{"version":"35ec8b6760fd7138bbf5809b84551e31028fb2ba7b6dc91d95d098bf212ca8b4","affectsGlobalScope":true,"impliedFormat":1},{"version":"5524481e56c48ff486f42926778c0a3cce1cc85dc46683b92b1271865bcf015a","impliedFormat":1},{"version":"68bd56c92c2bd7d2339457eb84d63e7de3bd56a69b25f3576e1568d21a162398","affectsGlobalScope":true,"impliedFormat":1},{"version":"3e93b123f7c2944969d291b35fed2af79a6e9e27fdd5faa99748a51c07c02d28","impliedFormat":1},{"version":"9d19808c8c291a9010a6c788e8532a2da70f811adb431c97520803e0ec649991","impliedFormat":1},{"version":"87aad3dd9752067dc875cfaa466fc44246451c0c560b820796bdd528e29bef40","impliedFormat":1},{"version":"4aacb0dd020eeaef65426153686cc639a78ec2885dc72ad220be1d25f1a439df","impliedFormat":1},{"version":"f0bd7e6d931657b59605c44112eaf8b980ba7f957a5051ed21cb93d978cf2f45","impliedFormat":1},{"version":"8db0ae9cb14d9955b14c214f34dae1b9ef2baee2fe4ce794a4cd3ac2531e3255","affectsGlobalScope":true,"impliedFormat":1},{"version":"15fc6f7512c86810273af28f224251a5a879e4261b4d4c7e532abfbfc3983134","impliedFormat":1},{"version":"58adba1a8ab2d10b54dc1dced4e41f4e7c9772cbbac40939c0dc8ce2cdb1d442","impliedFormat":1},{"version":"2fd4c143eff88dabb57701e6a40e02a4dbc36d5eb1362e7964d32028056a782b","impliedFormat":1},{"version":"714435130b9015fae551788df2a88038471a5a11eb471f27c4ede86552842bc9","impliedFormat":1},{"version":"855cd5f7eb396f5f1ab1bc0f8580339bff77b68a770f84c6b254e319bbfd1ac7","impliedFormat":1},{"version":"5650cf3dace09e7c25d384e3e6b818b938f68f4e8de96f52d9c5a1b3db068e86","impliedFormat":1},{"version":"1354ca5c38bd3fd3836a68e0f7c9f91f172582ba30ab15bb8c075891b91502b7","affectsGlobalScope":true,"impliedFormat":1},{"version":"27fdb0da0daf3b337c5530c5f266efe046a6ceb606e395b346974e4360c36419","impliedFormat":1},{"version":"2d2fcaab481b31a5882065c7951255703ddbe1c0e507af56ea42d79ac3911201","impliedFormat":1},{"version":"a192fe8ec33f75edbc8d8f3ed79f768dfae11ff5735e7fe52bfa69956e46d78d","impliedFormat":1},{"version":"ca867399f7db82df981d6915bcbb2d81131d7d1ef683bc782b59f71dda59bc85","affectsGlobalScope":true,"impliedFormat":1},{"version":"0e456fd5b101271183d99a9087875a282323e3a3ff0d7bcf1881537eaa8b8e63","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e043a1bc8fbf2a255bccf9bf27e0f1caf916c3b0518ea34aa72357c0afd42ec","impliedFormat":1},{"version":"b4f70ec656a11d570e1a9edce07d118cd58d9760239e2ece99306ee9dfe61d02","impliedFormat":1},{"version":"3bc2f1e2c95c04048212c569ed38e338873f6a8593930cf5a7ef24ffb38fc3b6","impliedFormat":1},{"version":"6e70e9570e98aae2b825b533aa6292b6abd542e8d9f6e9475e88e1d7ba17c866","impliedFormat":1},{"version":"f9d9d753d430ed050dc1bf2667a1bab711ccbb1c1507183d794cc195a5b085cc","impliedFormat":1},{"version":"9eece5e586312581ccd106d4853e861aaaa1a39f8e3ea672b8c3847eedd12f6e","impliedFormat":1},{"version":"47ab634529c5955b6ad793474ae188fce3e6163e3a3fb5edd7e0e48f14435333","impliedFormat":1},{"version":"37ba7b45141a45ce6e80e66f2a96c8a5ab1bcef0fc2d0f56bb58df96ec67e972","impliedFormat":1},{"version":"45650f47bfb376c8a8ed39d4bcda5902ab899a3150029684ee4c10676d9fbaee","impliedFormat":1},{"version":"0225ecb9ed86bdb7a2c7fd01f1556906902929377b44483dc4b83e03b3ef227d","affectsGlobalScope":true,"impliedFormat":1},{"version":"74cf591a0f63db318651e0e04cb55f8791385f86e987a67fd4d2eaab8191f730","impliedFormat":1},{"version":"5eab9b3dc9b34f185417342436ec3f106898da5f4801992d8ff38ab3aff346b5","impliedFormat":1},{"version":"12ed4559eba17cd977aa0db658d25c4047067444b51acfdcbf38470630642b23","affectsGlobalScope":true,"impliedFormat":1},{"version":"f3ffabc95802521e1e4bcba4c88d8615176dc6e09111d920c7a213bdda6e1d65","impliedFormat":1},{"version":"ddc734b4fae82a01d247e9e342d020976640b5e93b4e9b3a1e30e5518883a060","impliedFormat":1},{"version":"ae56f65caf3be91108707bd8dfbccc2a57a91feb5daabf7165a06a945545ed26","impliedFormat":1},{"version":"a136d5de521da20f31631a0a96bf712370779d1c05b7015d7019a9b2a0446ca9","impliedFormat":1},{"version":"c3b41e74b9a84b88b1dca61ec39eee25c0dbc8e7d519ba11bb070918cfacf656","affectsGlobalScope":true,"impliedFormat":1},{"version":"4737a9dc24d0e68b734e6cfbcea0c15a2cfafeb493485e27905f7856988c6b29","affectsGlobalScope":true,"impliedFormat":1},{"version":"36d8d3e7506b631c9582c251a2c0b8a28855af3f76719b12b534c6edf952748d","impliedFormat":1},{"version":"1ca69210cc42729e7ca97d3a9ad48f2e9cb0042bada4075b588ae5387debd318","impliedFormat":1},{"version":"f5ebe66baaf7c552cfa59d75f2bfba679f329204847db3cec385acda245e574e","impliedFormat":1},{"version":"ed59add13139f84da271cafd32e2171876b0a0af2f798d0c663e8eeb867732cf","affectsGlobalScope":true,"impliedFormat":1},{"version":"05db535df8bdc30d9116fe754a3473d1b6479afbc14ae8eb18b605c62677d518","impliedFormat":1},{"version":"b1810689b76fd473bd12cc9ee219f8e62f54a7d08019a235d07424afbf074d25","impliedFormat":1},{"version":"5fc51af013891a80ccda04f05b44cb564ff18b6eedb4e85b3dfecf340f1ccfe9","impliedFormat":1},{"version":"0f90d42ca7ec806d907cd9e5a60c19ca995d15be51d99474fcfa80b752ba1218","impliedFormat":1},{"version":"be1cc4d94ea60cbe567bc29ed479d42587bf1e6cba490f123d329976b0fe4ee5","impliedFormat":1},{"version":"42bc0e1a903408137c3df2b06dfd7e402cdab5bbfa5fcfb871b22ebfdb30bd0b","impliedFormat":1},{"version":"9894dafe342b976d251aac58e616ac6df8db91fb9d98934ff9dd103e9e82578f","impliedFormat":1},{"version":"413df52d4ea14472c2fa5bee62f7a40abd1eb49be0b9722ee01ee4e52e63beb2","impliedFormat":1},{"version":"db6d2d9daad8a6d83f281af12ce4355a20b9a3e71b82b9f57cddcca0a8964a96","impliedFormat":1},{"version":"446a50749b24d14deac6f8843e057a6355dd6437d1fac4f9e5ce4a5071f34bff","impliedFormat":1},{"version":"182e9fcbe08ac7c012e0a6e2b5798b4352470be29a64fdc114d23c2bab7d5106","impliedFormat":1},{"version":"5c9b31919ea1cb350a7ae5e71c9ced8f11723e4fa258a8cc8d16ae46edd623c7","impliedFormat":1},{"version":"4aa42ce8383b45823b3a1d3811c0fdd5f939f90254bc4874124393febbaf89f6","impliedFormat":1},{"version":"96ffa70b486207241c0fcedb5d9553684f7fa6746bc2b04c519e7ebf41a51205","impliedFormat":1},{"version":"5c24c66b3ba29ce9f2a79c719967e6e944131352a117a0bc43fa5b346b5562b3","impliedFormat":1},{"version":"a86f82d646a739041d6702101afa82dcb935c416dd93cbca7fd754fd0282ce1f","impliedFormat":1},{"version":"ad0d1d75d129b1c80f911be438d6b61bfa8703930a8ff2be2f0e1f8a91841c64","impliedFormat":1},{"version":"ce75b1aebb33d510ff28af960a9221410a3eaf7f18fc5f21f9404075fba77256","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"02436d7e9ead85e09a2f8e27d5f47d9464bced31738dec138ca735390815c9f0","impliedFormat":1},{"version":"f4625edcb57b37b84506e8b276eb59ca30d31f88c6656d29d4e90e3bc58e69df","impliedFormat":1},{"version":"78a2869ad0cbf3f9045dda08c0d4562b7e1b2bfe07b19e0db072f5c3c56e9584","impliedFormat":1},{"version":"f8d5ff8eafd37499f2b6a98659dd9b45a321de186b8db6b6142faed0fea3de77","impliedFormat":1},{"version":"c86fe861cf1b4c46a0fb7d74dffe596cf679a2e5e8b1456881313170f092e3fa","impliedFormat":1},{"version":"c685d9f68c70fe11ce527287526585a06ea13920bb6c18482ca84945a4e433a7","impliedFormat":1},{"version":"540cc83ab772a2c6bc509fe1354f314825b5dba3669efdfbe4693ecd3048e34f","impliedFormat":1},{"version":"121b0696021ab885c570bbeb331be8ad82c6efe2f3b93a6e63874901bebc13e3","impliedFormat":1},{"version":"4e01846df98d478a2a626ec3641524964b38acaac13945c2db198bf9f3df22ee","impliedFormat":1},{"version":"678d6d4c43e5728bf66e92fc2269da9fa709cb60510fed988a27161473c3853f","impliedFormat":1},{"version":"ffa495b17a5ef1d0399586b590bd281056cee6ce3583e34f39926f8dcc6ecdb5","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"aa14cee20aa0db79f8df101fc027d929aec10feb5b8a8da3b9af3895d05b7ba2","impliedFormat":1},{"version":"493c700ac3bd317177b2eb913805c87fe60d4e8af4fb39c41f04ba81fae7e170","impliedFormat":1},{"version":"aeb554d876c6b8c818da2e118d8b11e1e559adbe6bf606cc9a611c1b6c09f670","impliedFormat":1},{"version":"acf5a2ac47b59ca07afa9abbd2b31d001bf7448b041927befae2ea5b1951d9f9","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"d71291eff1e19d8762a908ba947e891af44749f3a2cbc5bd2ec4b72f72ea795f","impliedFormat":1},{"version":"c0480e03db4b816dff2682b347c95f2177699525c54e7e6f6aa8ded890b76be7","impliedFormat":1},{"version":"e2a37ac938c4bede5bb284b9d2d042da299528f1e61f6f57538f1bd37d760869","impliedFormat":1},{"version":"76def37aff8e3a051cf406e10340ffba0f28b6991c5d987474cc11137796e1eb","impliedFormat":1},{"version":"b620391fe8060cf9bedc176a4d01366e6574d7a71e0ac0ab344a4e76576fcbb8","impliedFormat":1},{"version":"3e7efde639c6a6c3edb9847b3f61e308bf7a69685b92f665048c45132f51c218","impliedFormat":1},{"version":"df45ca1176e6ac211eae7ddf51336dc075c5314bc5c253651bae639defd5eec5","impliedFormat":1},{"version":"106c6025f1d99fd468fd8bf6e5bda724e11e5905a4076c5d29790b6c3745e50c","impliedFormat":1},{"version":"ee8df1cb8d0faaca4013a1b442e99130769ce06f438d18d510fed95890067563","impliedFormat":1},{"version":"bfb7f8475428637bee12bdd31bd9968c1c8a1cc2c3e426c959e2f3a307f8936f","impliedFormat":1},{"version":"6f491d0108927478d3247bbbc489c78c2da7ef552fd5277f1ab6819986fdf0b1","impliedFormat":1},{"version":"0d8f2b8781c721170b87a6b662b3cb038fd1a721165ecca390352c818d425872","impliedFormat":1},{"version":"7cb0ee103671d1e201cd53dda12bc1cd0a35f1c63d6102720c6eeb322cb8e17e","impliedFormat":1},{"version":"15a234e5031b19c48a69ccc1607522d6e4b50f57d308ecb7fe863d44cd9f9eb3","impliedFormat":1},{"version":"148679c6d0f449210a96e7d2e562d589e56fcde87f843a92808b3ff103f1a774","impliedFormat":1},{"version":"6459054aabb306821a043e02b89d54da508e3a6966601a41e71c166e4ea1474f","impliedFormat":1},{"version":"2f9c89cbb29d362290531b48880a4024f258c6033aaeb7e59fbc62db26819650","impliedFormat":1},{"version":"bb37588926aba35c9283fe8d46ebf4e79ffe976343105f5c6d45f282793352b2","impliedFormat":1},{"version":"05c97cddbaf99978f83d96de2d8af86aded9332592f08ce4a284d72d0952c391","impliedFormat":1},{"version":"72179f9dd22a86deaad4cc3490eb0fe69ee084d503b686985965654013f1391b","impliedFormat":1},{"version":"2e6114a7dd6feeef85b2c80120fdbfb59a5529c0dcc5bfa8447b6996c97a69f5","impliedFormat":1},{"version":"7b6ff760c8a240b40dab6e4419b989f06a5b782f4710d2967e67c695ef3e93c4","impliedFormat":1},{"version":"c8f004e6036aa1c764ad4ec543cf89a5c1893a9535c80ef3f2b653e370de45e6","impliedFormat":1},{"version":"dd80b1e600d00f5c6a6ba23f455b84a7db121219e68f89f10552c54ba46e4dc9","impliedFormat":1},{"version":"b064c36f35de7387d71c599bfcf28875849a1dbc733e82bd26cae3d1cd060521","impliedFormat":1},{"version":"05c7280d72f3ed26f346cbe7cbbbb002fb7f15739197cbbee6ab3fd1a6cb9347","impliedFormat":1},{"version":"8de9fe97fa9e00ec00666fa77ab6e91b35d25af8ca75dabcb01e14ad3299b150","impliedFormat":1},{"version":"803cd2aaf1921c218916c2c7ee3fce653e852d767177eb51047ff15b5b253893","impliedFormat":1},{"version":"dba114fb6a32b355a9cfc26ca2276834d72fe0e94cd2c3494005547025015369","impliedFormat":1},{"version":"7ab12b2f1249187223d11a589f5789c75177a0b597b9eb7f8e2e42d045393347","impliedFormat":1},{"version":"ad37fb4be61c1035b68f532b7220f4e8236cf245381ce3b90ac15449ecfe7305","impliedFormat":1},{"version":"93436bd74c66baba229bfefe1314d122c01f0d4c1d9e35081a0c4f0470ac1a6c","impliedFormat":1},{"version":"f974e4a06953682a2c15d5bd5114c0284d5abf8bc0fe4da25cb9159427b70072","impliedFormat":1},{"version":"50256e9c31318487f3752b7ac12ff365c8949953e04568009c8705db802776fb","impliedFormat":1},{"version":"7d73b24e7bf31dfb8a931ca6c4245f6bb0814dfae17e4b60c9e194a631fe5f7b","impliedFormat":1},{"version":"d130c5f73768de51402351d5dc7d1b36eaec980ca697846e53156e4ea9911476","impliedFormat":1},{"version":"413586add0cfe7369b64979d4ec2ed56c3f771c0667fbde1bf1f10063ede0b08","impliedFormat":1},{"version":"06472528e998d152375ad3bd8ebcb69ff4694fd8d2effaf60a9d9f25a37a097a","impliedFormat":1},{"version":"50b5bc34ce6b12eccb76214b51aadfa56572aa6cc79c2b9455cdbb3d6c76af1d","impliedFormat":1},{"version":"b7e16ef7f646a50991119b205794ebfd3a4d8f8e0f314981ebbe991639023d0e","impliedFormat":1},{"version":"42c169fb8c2d42f4f668c624a9a11e719d5d07dacbebb63cbcf7ef365b0a75b3","impliedFormat":1},{"version":"a401617604fa1f6ce437b81689563dfdc377069e4c58465dbd8d16069aede0a5","impliedFormat":1},{"version":"6e9082e91370de5040e415cd9f24e595b490382e8c7402c4e938a8ce4bccc99f","impliedFormat":1},{"version":"8695dec09ad439b0ceef3776ea68a232e381135b516878f0901ed2ea114fd0fe","impliedFormat":1},{"version":"304b44b1e97dd4c94697c3313df89a578dca4930a104454c99863f1784a54357","impliedFormat":1},{"version":"d682336018141807fb602709e2d95a192828fcb8d5ba06dda3833a8ea98f69e3","impliedFormat":1},{"version":"6124e973eab8c52cabf3c07575204efc1784aca6b0a30c79eb85fe240a857efa","impliedFormat":1},{"version":"0d891735a21edc75df51f3eb995e18149e119d1ce22fd40db2b260c5960b914e","impliedFormat":1},{"version":"3b414b99a73171e1c4b7b7714e26b87d6c5cb03d200352da5342ab4088a54c85","impliedFormat":1},{"version":"4fbd3116e00ed3a6410499924b6403cc9367fdca303e34838129b328058ede40","impliedFormat":1},{"version":"b01bd582a6e41457bc56e6f0f9de4cb17f33f5f3843a7cf8210ac9c18472fb0f","impliedFormat":1},{"version":"0a437ae178f999b46b6153d79095b60c42c996bc0458c04955f1c996dc68b971","impliedFormat":1},{"version":"74b2a5e5197bd0f2e0077a1ea7c07455bbea67b87b0869d9786d55104006784f","impliedFormat":1},{"version":"4a7baeb6325920044f66c0f8e5e6f1f52e06e6d87588d837bdf44feb6f35c664","impliedFormat":1},{"version":"12d218a49dbe5655b911e6cc3c13b2c655e4c783471c3b0432137769c79e1b3c","impliedFormat":1},{"version":"7274fbffbd7c9589d8d0ffba68157237afd5cecff1e99881ea3399127e60572f","impliedFormat":1},{"version":"6b0fc04121360f752d196ba35b6567192f422d04a97b2840d7d85f8b79921c92","impliedFormat":1},{"version":"65a15fc47900787c0bd18b603afb98d33ede930bed1798fc984d5ebb78b26cf9","impliedFormat":1},{"version":"9d202701f6e0744adb6314d03d2eb8fc994798fc83d91b691b75b07626a69801","impliedFormat":1},{"version":"a365c4d3bed3be4e4e20793c999c51f5cd7e6792322f14650949d827fbcd170f","impliedFormat":1},{"version":"c5426dbfc1cf90532f66965a7aa8c1136a78d4d0f96d8180ecbfc11d7722f1a5","impliedFormat":1},{"version":"9c82171d836c47486074e4ca8e059735bf97b205e70b196535b5efd40cbe1bc5","impliedFormat":1},{"version":"f374cb24e93e7798c4d9e83ff872fa52d2cdb36306392b840a6ddf46cb925cb6","impliedFormat":1},{"version":"42b81043b00ff27c6bd955aea0f6e741545f2265978bf364b614702b72a027ab","impliedFormat":1},{"version":"de9d2df7663e64e3a91bf495f315a7577e23ba088f2949d5ce9ec96f44fba37d","impliedFormat":1},{"version":"c7af78a2ea7cb1cd009cfb5bdb48cd0b03dad3b54f6da7aab615c2e9e9d570c5","impliedFormat":1},{"version":"1ee45496b5f8bdee6f7abc233355898e5bf9bd51255db65f5ff7ede617ca0027","impliedFormat":1},{"version":"97e5ccc7bb88419005cbdf812243a5b3186cdef81b608540acabe1be163fc3e4","affectsGlobalScope":true,"impliedFormat":1},{"version":"3fbdd025f9d4d820414417eeb4107ffa0078d454a033b506e22d3a23bc3d9c41","affectsGlobalScope":true,"impliedFormat":1},{"version":"a8f8e6ab2fa07b45251f403548b78eaf2022f3c2254df3dc186cb2671fe4996d","affectsGlobalScope":true,"impliedFormat":1},{"version":"fa6c12a7c0f6b84d512f200690bfc74819e99efae69e4c95c4cd30f6884c526e","impliedFormat":1},{"version":"f1c32f9ce9c497da4dc215c3bc84b722ea02497d35f9134db3bb40a8d918b92b","impliedFormat":1},{"version":"b73c319af2cc3ef8f6421308a250f328836531ea3761823b4cabbd133047aefa","affectsGlobalScope":true,"impliedFormat":1},{"version":"e433b0337b8106909e7953015e8fa3f2d30797cea27141d1c5b135365bb975a6","impliedFormat":1},{"version":"9f9bb6755a8ce32d656ffa4763a8144aa4f274d6b69b59d7c32811031467216e","impliedFormat":1},{"version":"5c32bdfbd2d65e8fffbb9fbda04d7165e9181b08dad61154961852366deb7540","impliedFormat":1},{"version":"ddff7fc6edbdc5163a09e22bf8df7bef75f75369ebd7ecea95ba55c4386e2441","impliedFormat":1},{"version":"6b3453eebd474cc8acf6d759f1668e6ce7425a565e2996a20b644c72916ecf75","impliedFormat":1},{"version":"0c05e9842ec4f8b7bfebfd3ca61604bb8c914ba8da9b5337c4f25da427a005f2","impliedFormat":1},{"version":"89cd3444e389e42c56fd0d072afef31387e7f4107651afd2c03950f22dc36f77","impliedFormat":1},{"version":"7f2aa4d4989a82530aaac3f72b3dceca90e9c25bee0b1a327e8a08a1262435ad","impliedFormat":1},{"version":"e39a304f882598138a8022106cb8de332abbbb87f3fee71c5ca6b525c11c51fc","impliedFormat":1},{"version":"faed7a5153215dbd6ebe76dfdcc0af0cfe760f7362bed43284be544308b114cf","impliedFormat":1},{"version":"fcdf3e40e4a01b9a4b70931b8b51476b210c511924fcfe3f0dae19c4d52f1a54","impliedFormat":1},{"version":"345c4327b637d34a15aba4b7091eb068d6ab40a3dedaab9f00986253c9704e53","impliedFormat":1},{"version":"3a788c7fb7b1b1153d69a4d1d9e1d0dfbcf1127e703bdb02b6d12698e683d1fb","impliedFormat":1},{"version":"2e4f37ffe8862b14d8e24ae8763daaa8340c0df0b859d9a9733def0eee7562d9","impliedFormat":1},{"version":"d38530db0601215d6d767f280e3a3c54b2a83b709e8d9001acb6f61c67e965fc","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"4805f6161c2c8cefb8d3b8bd96a080c0fe8dbc9315f6ad2e53238f9a79e528a6","impliedFormat":1},{"version":"b83cb14474fa60c5f3ec660146b97d122f0735627f80d82dd03e8caa39b4388c","impliedFormat":1},{"version":"2b5b70d7782fe028487a80a1c214e67bd610532b9f978b78fa60f5b4a359f77e","impliedFormat":1},{"version":"7ee86fbb3754388e004de0ef9e6505485ddfb3be7640783d6d015711c03d302d","impliedFormat":1},{"version":"1a82deef4c1d39f6882f28d275cad4c01f907b9b39be9cbc472fcf2cf051e05b","impliedFormat":1},{"version":"162e071992b34bc36ca257d629547f93cb43728d6fe073ad18a237e4f7c52d7d","impliedFormat":1},{"version":"b73cbf0a72c8800cf8f96a9acfe94f3ad32ca71342a8908b8ae484d61113f647","impliedFormat":1},{"version":"bae6dd176832f6423966647382c0d7ba9e63f8c167522f09a982f086cd4e8b23","impliedFormat":1},{"version":"20865ac316b8893c1a0cc383ccfc1801443fbcc2a7255be166cf90d03fac88c9","impliedFormat":1},{"version":"c9958eb32126a3843deedda8c22fb97024aa5d6dd588b90af2d7f2bfac540f23","impliedFormat":1},{"version":"461d0ad8ae5f2ff981778af912ba71b37a8426a33301daa00f21c6ccb27f8156","impliedFormat":1},{"version":"e927c2c13c4eaf0a7f17e6022eee8519eb29ef42c4c13a31e81a611ab8c95577","impliedFormat":1},{"version":"fcafff163ca5e66d3b87126e756e1b6dfa8c526aa9cd2a2b0a9da837d81bbd72","impliedFormat":1},{"version":"70246ad95ad8a22bdfe806cb5d383a26c0c6e58e7207ab9c431f1cb175aca657","impliedFormat":1},{"version":"f00f3aa5d64ff46e600648b55a79dcd1333458f7a10da2ed594d9f0a44b76d0b","impliedFormat":1},{"version":"772d8d5eb158b6c92412c03228bd9902ccb1457d7a705b8129814a5d1a6308fc","impliedFormat":1},{"version":"802e797bcab5663b2c9f63f51bdf67eff7c41bc64c0fd65e6da3e7941359e2f7","impliedFormat":1},{"version":"8b4327413e5af38cd8cb97c59f48c3c866015d5d642f28518e3a891c469f240e","impliedFormat":1},{"version":"7e6ac205dcb9714f708354fd863bffa45cee90740706cc64b3b39b23ebb84744","impliedFormat":1},{"version":"61dc6e3ac78d64aa864eedd0a208b97b5887cc99c5ba65c03287bf57d83b1eb9","impliedFormat":1},{"version":"4b20fcf10a5413680e39f5666464859fc56b1003e7dfe2405ced82371ebd49b6","impliedFormat":1},{"version":"c06ef3b2569b1c1ad99fcd7fe5fba8d466e2619da5375dfa940a94e0feea899b","impliedFormat":1},{"version":"f7d628893c9fa52ba3ab01bcb5e79191636c4331ee5667ecc6373cbccff8ae12","impliedFormat":1},{"version":"1d879125d1ec570bf04bc1f362fdbe0cb538315c7ac4bcfcdf0c1e9670846aa6","impliedFormat":1},{"version":"8baa8dbdc393e3c6b26e8e31384b938756ce2effdc126648d43e58291ce9869b","impliedFormat":1},{"version":"933aee906d42ea2c53b6892192a8127745f2ec81a90695df4024308ba35a8ff4","impliedFormat":1},{"version":"d663134457d8d669ae0df34eabd57028bddc04fc444c4bc04bc5215afc91e1f4","impliedFormat":1},{"version":"985153f0deb9b4391110331a2f0c114019dbea90cba5ca68a4107700796e0d75","impliedFormat":1},{"version":"a3e3f0efcae272ab8ee3298e4e819f7d9dd9ff411101f45444877e77cfeca9a4","impliedFormat":1},{"version":"43e96a3d5d1411ab40ba2f61d6a3192e58177bcf3b133a80ad2a16591611726d","impliedFormat":1},{"version":"58659b06d33fa430bee1105b75cf876c0a35b2567207487c8578aec51ca2d977","impliedFormat":1},{"version":"71d9eb4c4e99456b78ae182fb20a5dfc20eb1667f091dbb9335b3c017dd1c783","impliedFormat":1},{"version":"cfa846a7b7847a1d973605fbb8c91f47f3a0f0643c18ac05c47077ebc72e71c7","impliedFormat":1},{"version":"30e6520444df1a004f46fdc8096f3fe06f7bbd93d09c53ada9dcdde59919ccca","impliedFormat":1},{"version":"6c800b281b9e89e69165fd11536195488de3ff53004e55905e6c0059a2d8591e","impliedFormat":1},{"version":"7d4254b4c6c67a29d5e7f65e67d72540480ac2cfb041ca484847f5ae70480b62","impliedFormat":1},{"version":"a58beefce74db00dbb60eb5a4bb0c6726fb94c7797c721f629142c0ae9c94306","impliedFormat":1},{"version":"41eeb453ccb75c5b2c3abef97adbbd741bd7e9112a2510e12f03f646dc9ad13d","impliedFormat":1},{"version":"502fa5863df08b806dbf33c54bee8c19f7e2ad466785c0fc35465d7c5ff80995","impliedFormat":1},{"version":"c91a2d08601a1547ffef326201be26db94356f38693bb18db622ae5e9b3d7c92","impliedFormat":1},{"version":"888cda0fa66d7f74e985a3f7b1af1f64b8ff03eb3d5e80d051c3cbdeb7f32ab7","impliedFormat":1},{"version":"60681e13f3545be5e9477acb752b741eae6eaf4cc01658a25ec05bff8b82a2ef","impliedFormat":1},{"version":"8b4b8ebc2d99ae651c5c4169ee8b24e2b0e02a3dfaef84e357d677b663c18fdf","impliedFormat":1},{"version":"a57b1802794433adec9ff3fed12aa79d671faed86c49b09e02e1ac41b4f1d33a","impliedFormat":1},{"version":"ad10d4f0517599cdeca7755b930f148804e3e0e5b5a3847adce0f1f71bbccd74","impliedFormat":1},{"version":"1042064ece5bb47d6aba91648fbe0635c17c600ebdf567588b4ca715602f0a9d","impliedFormat":1},{"version":"c49469a5349b3cc1965710b5b0f98ed6c028686aa8450bcb3796728873eb923e","impliedFormat":1},{"version":"4a889f2c763edb4d55cb624257272ac10d04a1cad2ed2948b10ed4a7fda2a428","impliedFormat":1},{"version":"7bb79aa2fead87d9d56294ef71e056487e848d7b550c9a367523ee5416c44cfa","impliedFormat":1},{"version":"d88ea80a6447d7391f52352ec97e56b52ebec934a4a4af6e2464cfd8b39c3ba8","impliedFormat":1},{"version":"55095860901097726220b6923e35a812afdd49242a1246d7b0942ee7eb34c6e4","impliedFormat":1},{"version":"96171c03c2e7f314d66d38acd581f9667439845865b7f85da8df598ff9617476","impliedFormat":1},{"version":"27ff4196654e6373c9af16b6165120e2dd2169f9ad6abb5c935af5abd8c7938c","impliedFormat":1},{"version":"bb8f2dbc03533abca2066ce4655c119bff353dd4514375beb93c08590c03e023","impliedFormat":1},{"version":"d193c8a86144b3a87b22bc1f5534b9c3e0f5a187873ec337c289a183973a58fe","impliedFormat":1},{"version":"1a6e6ba8a07b74e3ad237717c0299d453f9ceb795dbc2f697d1f2dd07cb782d2","impliedFormat":1},{"version":"58d70c38037fc0f949243388ff7ae20cf43321107152f14a9d36ca79311e0ada","impliedFormat":1},{"version":"f56bdc6884648806d34bc66d31cdb787c4718d04105ce2cd88535db214631f82","impliedFormat":1},{"version":"190da5eac6478d61ab9731ab2146fbc0164af2117a363013249b7e7992f1cccb","impliedFormat":1},{"version":"01479d9d5a5dda16d529b91811375187f61a06e74be294a35ecce77e0b9e8d6c","impliedFormat":1},{"version":"49f95e989b4632c6c2a578cc0078ee19a5831832d79cc59abecf5160ea71abad","impliedFormat":1},{"version":"9666533332f26e8995e4d6fe472bdeec9f15d405693723e6497bf94120c566c8","impliedFormat":1},{"version":"ce0df82a9ae6f914ba08409d4d883983cc08e6d59eb2df02d8e4d68309e7848b","impliedFormat":1},{"version":"796273b2edc72e78a04e86d7c58ae94d370ab93a0ddf40b1aa85a37a1c29ecd7","impliedFormat":1},{"version":"5df15a69187d737d6d8d066e189ae4f97e41f4d53712a46b2710ff9f8563ec9f","impliedFormat":1},{"version":"1a4dc28334a926d90ba6a2d811ba0ff6c22775fcc13679521f034c124269fd40","impliedFormat":1},{"version":"f05315ff85714f0b87cc0b54bcd3dde2716e5a6b99aedcc19cad02bf2403e08c","impliedFormat":1},{"version":"8a8c64dafaba11c806efa56f5c69f611276471bef80a1db1f71316ec4168acef","impliedFormat":1},{"version":"43ba4f2fa8c698f5c304d21a3ef596741e8e85a810b7c1f9b692653791d8d97a","impliedFormat":1},{"version":"5fad3b31fc17a5bc58095118a8b160f5260964787c52e7eb51e3d4fcf5d4a6f0","impliedFormat":1},{"version":"72105519d0390262cf0abe84cf41c926ade0ff475d35eb21307b2f94de985778","impliedFormat":1},{"version":"d0a4cac61fa080f2be5ebb68b82726be835689b35994ba0e22e3ed4d2bc45e3b","impliedFormat":1},{"version":"c857e0aae3f5f444abd791ec81206020fbcc1223e187316677e026d1c1d6fe08","impliedFormat":1},{"version":"ccf6dd45b708fb74ba9ed0f2478d4eb9195c9dfef0ff83a6092fa3cf2ff53b4f","impliedFormat":1},{"version":"2d7db1d73456e8c5075387d4240c29a2a900847f9c1bff106a2e490da8fbd457","impliedFormat":1},{"version":"2b15c805f48e4e970f8ec0b1915f22d13ca6212375e8987663e2ef5f0205e832","impliedFormat":1},{"version":"205a31b31beb7be73b8df18fcc43109cbc31f398950190a0967afc7a12cb478c","impliedFormat":1},{"version":"8fca3039857709484e5893c05c1f9126ab7451fa6c29e19bb8c2411a2e937345","impliedFormat":1},{"version":"35069c2c417bd7443ae7c7cafd1de02f665bf015479fec998985ffbbf500628c","impliedFormat":1},{"version":"dba6c7006e14a98ec82999c6f89fbbbfd1c642f41db148535f3b77b8018829b8","impliedFormat":1},{"version":"7f897b285f22a57a5c4dc14a27da2747c01084a542b4d90d33897216dceeea2e","impliedFormat":1},{"version":"7e0b7f91c5ab6e33f511efc640d36e6f933510b11be24f98836a20a2dc914c2d","impliedFormat":1},{"version":"045b752f44bf9bbdcaffd882424ab0e15cb8d11fa94e1448942e338c8ef19fba","impliedFormat":1},{"version":"2894c56cad581928bb37607810af011764a2f511f575d28c9f4af0f2ef02d1ab","impliedFormat":1},{"version":"0a72186f94215d020cb386f7dca81d7495ab6c17066eb07d0f44a5bf33c1b21a","impliedFormat":1},{"version":"d96b39301d0ded3f1a27b47759676a33a02f6f5049bfcbde81e533fd10f50dcb","impliedFormat":1},{"version":"2ded4f930d6abfaa0625cf55e58f565b7cbd4ab5b574dd2cb19f0a83a2f0be8b","impliedFormat":1},{"version":"0aedb02516baf3e66b2c1db9fef50666d6ed257edac0f866ea32f1aa05aa474f","impliedFormat":1},{"version":"ca0f4d9068d652bad47e326cf6ba424ac71ab866e44b24ddb6c2bd82d129586a","affectsGlobalScope":true,"impliedFormat":1},{"version":"04d36005fcbeac741ac50c421181f4e0316d57d148d37cc321a8ea285472462b","impliedFormat":1},{"version":"9e2739b32f741859263fdba0244c194ca8e96da49b430377930b8f721d77c000","impliedFormat":1},{"version":"56ccb49443bfb72e5952f7012f0de1a8679f9f75fc93a5c1ac0bafb28725fc5f","impliedFormat":1},{"version":"20fa37b636fdcc1746ea0738f733d0aed17890d1cd7cb1b2f37010222c23f13e","impliedFormat":1},{"version":"d90b9f1520366d713a73bd30c5a9eb0040d0fb6076aff370796bc776fd705943","impliedFormat":1},{"version":"bc03c3c352f689e38c0ddd50c39b1e65d59273991bfc8858a9e3c0ebb79c023b","impliedFormat":1},{"version":"19df3488557c2fc9b4d8f0bac0fd20fb59aa19dec67c81f93813951a81a867f8","affectsGlobalScope":true,"impliedFormat":1},{"version":"b25350193e103ae90423c5418ddb0ad1168dc9c393c9295ef34980b990030617","affectsGlobalScope":true,"impliedFormat":1},{"version":"bef86adb77316505c6b471da1d9b8c9e428867c2566270e8894d4d773a1c4dc2","impliedFormat":1},{"version":"a46dba563f70f32f9e45ae015f3de979225f668075d7a427f874e0f6db584991","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"2652448ac55a2010a1f71dd141f828b682298d39728f9871e1cdf8696ef443fd","impliedFormat":1},{"version":"02c4fc9e6bb27545fa021f6056e88ff5fdf10d9d9f1467f1d10536c6e749ac50","impliedFormat":1},{"version":"120599fd965257b1f4d0ff794bc696162832d9d8467224f4665f713a3119078b","impliedFormat":1},{"version":"5433f33b0a20300cca35d2f229a7fc20b0e8477c44be2affeb21cb464af60c76","impliedFormat":1},{"version":"db036c56f79186da50af66511d37d9fe77fa6793381927292d17f81f787bb195","impliedFormat":1},{"version":"bd4131091b773973ca5d2326c60b789ab1f5e02d8843b3587effe6e1ea7c9d86","impliedFormat":1},{"version":"c7f6485931085bf010fbaf46880a9b9ec1a285ad9dc8c695a9e936f5a48f34b4","impliedFormat":1},{"version":"14f6b927888a1112d662877a5966b05ac1bf7ed25d6c84386db4c23c95a5363b","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"622694a8522b46f6310c2a9b5d2530dde1e2854cb5829354e6d1ff8f371cf469","impliedFormat":1},{"version":"d24ff95760ea2dfcc7c57d0e269356984e7046b7e0b745c80fea71559f15bdd8","impliedFormat":1},{"version":"a9e6c0ff3f8186fccd05752cf75fc94e147c02645087ac6de5cc16403323d870","impliedFormat":1},{"version":"49c346823ba6d4b12278c12c977fb3a31c06b9ca719015978cb145eb86da1c61","impliedFormat":1},{"version":"bfac6e50eaa7e73bb66b7e052c38fdc8ccfc8dbde2777648642af33cf349f7f1","impliedFormat":1},{"version":"92f7c1a4da7fbfd67a2228d1687d5c2e1faa0ba865a94d3550a3941d7527a45d","impliedFormat":1},{"version":"f53b120213a9289d9a26f5af90c4c686dd71d91487a0aa5451a38366c70dc64b","impliedFormat":1},{"version":"83fe880c090afe485a5c02262c0b7cdd76a299a50c48d9bde02be8e908fb4ae6","impliedFormat":1},{"version":"13c1b657932e827a7ed510395d94fc8b743b9d053ab95b7cd829b2bc46fb06db","impliedFormat":1},{"version":"57d67b72e06059adc5e9454de26bbfe567d412b962a501d263c75c2db430f40e","impliedFormat":1},{"version":"6511e4503cf74c469c60aafd6589e4d14d5eb0a25f9bf043dcbecdf65f261972","impliedFormat":1},{"version":"078131f3a722a8ad3fc0b724cd3497176513cdcb41c80f96a3acbda2a143b58e","impliedFormat":1},{"version":"8c70ddc0c22d85e56011d49fddfaae3405eb53d47b59327b9dd589e82df672e7","impliedFormat":1},{"version":"a67b87d0281c97dfc1197ef28dfe397fc2c865ccd41f7e32b53f647184cc7307","impliedFormat":1},{"version":"771ffb773f1ddd562492a6b9aaca648192ac3f056f0e1d997678ff97dbb6bf9b","impliedFormat":1},{"version":"232f70c0cf2b432f3a6e56a8dc3417103eb162292a9fd376d51a3a9ea5fbbf6f","impliedFormat":1},{"version":"9e155d2255348d950b1f65643fb26c0f14f5109daf8bd9ee24a866ad0a743648","affectsGlobalScope":true,"impliedFormat":1},{"version":"0b103e9abfe82d14c0ad06a55d9f91d6747154ef7cacc73cf27ecad2bfb3afcf","impliedFormat":1},{"version":"7a883e9c84e720810f86ef4388f54938a65caa0f4d181a64e9255e847a7c9f51","impliedFormat":1},{"version":"a0ba218ac1baa3da0d5d9c1ec1a7c2f8676c284e6f5b920d6d049b13fa267377","impliedFormat":1},{"version":"8a0e762ceb20c7e72504feef83d709468a70af4abccb304f32d6b9bac1129b2c","impliedFormat":1},{"version":"d408d6f32de8d1aba2ff4a20f1aa6a6edd7d92c997f63b90f8ad3f9017cf5e46","impliedFormat":1},{"version":"9252d498a77517aab5d8d4b5eb9d71e4b225bbc7123df9713e08181de63180f6","impliedFormat":1},{"version":"221e915caef37c5cbaabd4946418f97dcc20591469e260732b31008321024dd8","impliedFormat":1},{"version":"35e6379c3f7cb27b111ad4c1aa69538fd8e788ab737b8ff7596a1b40e96f4f90","impliedFormat":1},{"version":"1fffe726740f9787f15b532e1dc870af3cd964dbe29e191e76121aa3dd8693f2","impliedFormat":1},{"version":"371bf6127c1d427836de95197155132501cb6b69ef8709176ce6e0b85d059264","impliedFormat":1},{"version":"2bafd700e617d3693d568e972d02b92224b514781f542f70d497a8fdf92d52a2","affectsGlobalScope":true,"impliedFormat":1},{"version":"5542d8a7ea13168cb573be0d1ba0d29460d59430fb12bb7bf4674efd5604e14c","impliedFormat":1},{"version":"af48e58339188d5737b608d41411a9c054685413d8ae88b8c1d0d9bfabdf6e7e","impliedFormat":1},{"version":"616775f16134fa9d01fc677ad3f76e68c051a056c22ab552c64cc281a9686790","impliedFormat":1},{"version":"65c24a8baa2cca1de069a0ba9fba82a173690f52d7e2d0f1f7542d59d5eb4db0","impliedFormat":1},{"version":"f9fe6af238339a0e5f7563acee3178f51db37f32a2e7c09f85273098cee7ec49","impliedFormat":1},{"version":"1de8c302fd35220d8f29dea378a4ae45199dc8ff83ca9923aca1400f2b28848a","impliedFormat":1},{"version":"77e71242e71ebf8528c5802993697878f0533db8f2299b4d36aa015bae08a79c","impliedFormat":1},{"version":"98a787be42bd92f8c2a37d7df5f13e5992da0d967fab794adbb7ee18370f9849","impliedFormat":1},{"version":"332248ee37cca52903572e66c11bef755ccc6e235835e63d3c3e60ddda3e9b93","impliedFormat":1},{"version":"94e8cc88ae2ef3d920bb3bdc369f48436db123aa2dc07f683309ad8c9968a1e1","impliedFormat":1},{"version":"4545c1a1ceca170d5d83452dd7c4994644c35cf676a671412601689d9a62da35","impliedFormat":1},{"version":"320f4091e33548b554d2214ce5fc31c96631b513dffa806e2e3a60766c8c49d9","impliedFormat":1},{"version":"a2d648d333cf67b9aeac5d81a1a379d563a8ffa91ddd61c6179f68de724260ff","impliedFormat":1},{"version":"d90d5f524de38889d1e1dbc2aeef00060d779f8688c02766ddb9ca195e4a713d","impliedFormat":1},{"version":"a3f41ed1b4f2fc3049394b945a68ae4fdefd49fa1739c32f149d32c0545d67f5","impliedFormat":1},{"version":"b0309e1eda99a9e76f87c18992d9c3689b0938266242835dd4611f2b69efe456","impliedFormat":1},{"version":"47699512e6d8bebf7be488182427189f999affe3addc1c87c882d36b7f2d0b0e","impliedFormat":1},{"version":"6ceb10ca57943be87ff9debe978f4ab73593c0c85ee802c051a93fc96aaf7a20","impliedFormat":1},{"version":"1de3ffe0cc28a9fe2ac761ece075826836b5a02f340b412510a59ba1d41a505a","impliedFormat":1},{"version":"e46d6cc08d243d8d0d83986f609d830991f00450fb234f5b2f861648c42dc0d8","impliedFormat":1},{"version":"1c0a98de1323051010ce5b958ad47bc1c007f7921973123c999300e2b7b0ecc0","impliedFormat":1},{"version":"ff863d17c6c659440f7c5c536e4db7762d8c2565547b2608f36b798a743606ca","impliedFormat":1},{"version":"5412ad0043cd60d1f1406fc12cb4fb987e9a734decbdd4db6f6acf71791e36fe","impliedFormat":1},{"version":"ad036a85efcd9e5b4f7dd5c1a7362c8478f9a3b6c3554654ca24a29aa850a9c5","impliedFormat":1},{"version":"fedebeae32c5cdd1a85b4e0504a01996e4a8adf3dfa72876920d3dd6e42978e7","impliedFormat":1},{"version":"b6c1f64158da02580f55e8a2728eda6805f79419aed46a930f43e68ad66a38fc","impliedFormat":1},{"version":"cdf21eee8007e339b1b9945abf4a7b44930b1d695cc528459e68a3adc39a622e","impliedFormat":1},{"version":"bc9ee0192f056b3d5527bcd78dc3f9e527a9ba2bdc0a2c296fbc9027147df4b2","impliedFormat":1},{"version":"330896c1a2b9693edd617be24fbf9e5895d6e18c7955d6c08f028f272b37314d","impliedFormat":1},{"version":"1d9c0a9a6df4e8f29dc84c25c5aa0bb1da5456ebede7a03e03df08bb8b27bae6","impliedFormat":1},{"version":"84380af21da938a567c65ef95aefb5354f676368ee1a1cbb4cae81604a4c7d17","impliedFormat":1},{"version":"1af3e1f2a5d1332e136f8b0b95c0e6c0a02aaabd5092b36b64f3042a03debf28","impliedFormat":1},{"version":"30d8da250766efa99490fc02801047c2c6d72dd0da1bba6581c7e80d1d8842a4","impliedFormat":1},{"version":"03566202f5553bd2d9de22dfab0c61aa163cabb64f0223c08431fb3fc8f70280","impliedFormat":1},{"version":"4c0a1233155afb94bd4d7518c75c84f98567cd5f13fc215d258de196cdb40d91","impliedFormat":1},{"version":"e7765aa8bcb74a38b3230d212b4547686eb9796621ffb4367a104451c3f9614f","impliedFormat":1},{"version":"1de80059b8078ea5749941c9f863aa970b4735bdbb003be4925c853a8b6b4450","impliedFormat":1},{"version":"1d079c37fa53e3c21ed3fa214a27507bda9991f2a41458705b19ed8c2b61173d","impliedFormat":1},{"version":"5bf5c7a44e779790d1eb54c234b668b15e34affa95e78eada73e5757f61ed76a","impliedFormat":1},{"version":"5835a6e0d7cd2738e56b671af0e561e7c1b4fb77751383672f4b009f4e161d70","impliedFormat":1},{"version":"5c634644d45a1b6bc7b05e71e05e52ec04f3d73d9ac85d5927f647a5f965181a","impliedFormat":1},{"version":"4b7f74b772140395e7af67c4841be1ab867c11b3b82a51b1aeb692822b76c872","impliedFormat":1},{"version":"27be6622e2922a1b412eb057faa854831b95db9db5035c3f6d4b677b902ab3b7","impliedFormat":1},{"version":"a68d4b3182e8d776cdede7ac9630c209a7bfbb59191f99a52479151816ef9f9e","impliedFormat":99},{"version":"39644b343e4e3d748344af8182111e3bbc594930fff0170256567e13bbdbebb0","impliedFormat":99},{"version":"ed7fd5160b47b0de3b1571c5c5578e8e7e3314e33ae0b8ea85a895774ee64749","impliedFormat":99},{"version":"63a7595a5015e65262557f883463f934904959da563b4f788306f699411e9bac","impliedFormat":1},{"version":"4ba137d6553965703b6b55fd2000b4e07ba365f8caeb0359162ad7247f9707a6","impliedFormat":1},{"version":"6de125ea94866c736c6d58d68eb15272cf7d1020a5b459fea1c660027eca9a90","affectsGlobalScope":true,"impliedFormat":1},{"version":"8fac4a15690b27612d8474fb2fc7cc00388df52d169791b78d1a3645d60b4c8b","affectsGlobalScope":true,"impliedFormat":1},{"version":"064ac1c2ac4b2867c2ceaa74bbdce0cb6a4c16e7c31a6497097159c18f74aa7c","impliedFormat":1},{"version":"3dc14e1ab45e497e5d5e4295271d54ff689aeae00b4277979fdd10fa563540ae","impliedFormat":1},{"version":"d3b315763d91265d6b0e7e7fa93cfdb8a80ce7cdd2d9f55ba0f37a22db00bdb8","impliedFormat":1},{"version":"b789bf89eb19c777ed1e956dbad0925ca795701552d22e68fd130a032008b9f9","impliedFormat":1},{"version":"fd4a6ec112da3e7ef2b70cc87fa638fb6f4260f8c541f6640bee299ac3f9f033","affectsGlobalScope":true},"083e23c4c5e7761db151134ea1ef7896120c86c5888cdc8a861f534f7e86d6fd",{"version":"a4abbf5d5ecd7367532921a52e2a2762a6f5f38c3e4ad6c25e6e90152c403804","impliedFormat":1},{"version":"151ff381ef9ff8da2da9b9663ebf657eac35c4c9a19183420c05728f31a6761d","impliedFormat":1},{"version":"f3d8c757e148ad968f0d98697987db363070abada5f503da3c06aefd9d4248c1","impliedFormat":1},{"version":"ac450542cbfd50a4d7bf0f3ec8aeedb9e95791ecc6f2b2b19367696bd303e8c6","impliedFormat":99},{"version":"8a190298d0ff502ad1c7294ba6b0abb3a290fc905b3a00603016a97c363a4c7a","impliedFormat":1},{"version":"5ba4a4a1f9fae0550de86889fb06cd997c8406795d85647cbcd992245625680c","impliedFormat":1},{"version":"1f68ab0e055994eb337b67aa87d2a15e0200951e9664959b3866ee6f6b11a0fe","impliedFormat":1},{"version":"be5de08f7e80755a34e3247ebd7fd29634afc6143ae1860bd0efe2b8da6e6980","impliedFormat":1},{"version":"84bcc7c6b06f4d643a55dc63b56be0c81d990f8d549b66ea615c553268774dc3","impliedFormat":1},{"version":"2d225e7bda2871c066a7079c88174340950fb604f624f2586d3ea27bb9e5f4ff","impliedFormat":1},{"version":"6a785f84e63234035e511817dd48ada756d984dd8f9344e56eb8b2bdcd8fd001","impliedFormat":1},{"version":"c1422d016f7df2ccd3594c06f2923199acd09898f2c42f50ea8159f1f856f618","impliedFormat":1},{"version":"2973b1b7857ca144251375b97f98474e9847a890331e27132d5a8b3aea9350a8","impliedFormat":1},{"version":"0eb6152d37c84d6119295493dfcc20c331c6fda1304a513d159cdaa599dcb78b","impliedFormat":1},{"version":"237df26f8c326ca00cd9d2deb40214a079749062156386b6d75bdcecc6988a6b","impliedFormat":1},{"version":"cd44995ee13d5d23df17a10213fed7b483fabfd5ea08f267ab52c07ce0b6b4da","impliedFormat":1},{"version":"58ce1486f851942bd2d3056b399079bc9cb978ec933fe9833ea417e33eab676e","impliedFormat":1},{"version":"7557d4d7f19f94341f4413575a3453ba7f6039c9591015bcf4282a8e75414043","impliedFormat":1},{"version":"a3b2cc16f3ce2d882eca44e1066f57a24751545f2a5e4a153d4de31b4cac9bb5","impliedFormat":1},{"version":"ac2b3b377d3068bfb6e1cb8889c99098f2c875955e2325315991882a74d92cc8","impliedFormat":1},{"version":"8deb39d89095469957f73bd194d11f01d9894b8c1f1e27fbf3f6e8122576b336","impliedFormat":1},{"version":"a38a9c41f433b608a0d37e645a31eecf7233ef3d3fffeb626988d3219f80e32f","impliedFormat":1},{"version":"8e1428dcba6a984489863935049893631170a37f9584c0479f06e1a5b1f04332","impliedFormat":1},{"version":"1fce9ecb87a2d3898941c60df617e52e50fb0c03c9b7b2ba8381972448327285","impliedFormat":1},{"version":"5ef0597b8238443908b2c4bf69149ed3894ac0ddd0515ac583d38c7595b151f1","impliedFormat":1},{"version":"ac52b775a80badff5f4ac329c5725a26bd5aaadd57afa7ad9e98b4844767312a","impliedFormat":1},{"version":"6ae5b4a63010c82bf2522b4ecfc29ffe6a8b0c5eea6b2b35120077e9ac54d7a1","impliedFormat":1},{"version":"dd7109c49f416f218915921d44f0f28975df78e04e437c62e1e1eb3be5e18a35","impliedFormat":1},{"version":"eee181112e420b345fc78422a6cc32385ede3d27e2eaf8b8c4ad8b2c29e3e52e","impliedFormat":1},{"version":"25fbe57c8ee3079e2201fe580578fab4f3a78881c98865b7c96233af00bf9624","impliedFormat":1},{"version":"62cc8477858487b4c4de7d7ae5e745a8ce0015c1592f398b63ee05d6e64ca295","impliedFormat":1},{"version":"cc2a9ec3cb10e4c0b8738b02c31798fad312d21ef20b6a2f5be1d077e9f5409d","impliedFormat":1},{"version":"4b4fadcda7d34034737598c07e2dca5d7e1e633cb3ba8dd4d2e6a7782b30b296","impliedFormat":1},{"version":"360fdc8829a51c5428636f1f83e7db36fef6c5a15ed4411b582d00a1c2bd6e97","impliedFormat":1},{"version":"1cf0d15e6ab1ecabbf329b906ae8543e6b8955133b7f6655f04d433e3a0597ab","impliedFormat":1},{"version":"7c9f98fe812643141502b30fb2b5ec56d16aaf94f98580276ae37b7924dd44a4","impliedFormat":1},{"version":"b3547893f24f59d0a644c52f55901b15a3fa1a115bc5ea9a582911469b9348b7","impliedFormat":1},{"version":"596e5b88b6ca8399076afcc22af6e6e0c4700c7cd1f420a78d637c3fb44a885e","impliedFormat":1},{"version":"adddf736e08132c7059ee572b128fdacb1c2650ace80d0f582e93d097ed4fbaf","impliedFormat":1},{"version":"d4cad9dc13e9c5348637170ddd5d95f7ed5fdfc856ddca40234fa55518bc99a6","impliedFormat":1},{"version":"d70675ba7ba7d02e52b7070a369957a70827e4b2bca2c1680c38a832e87b61fd","impliedFormat":1},{"version":"3be71f4ce8988a01e2f5368bdd58e1d60236baf511e4510ee9291c7b3729a27e","impliedFormat":1},{"version":"423d2ccc38e369a7527988d682fafc40267bcd6688a7473e59c5eea20a29b64f","impliedFormat":1},{"version":"2f9fde0868ed030277c678b435f63fcf03d27c04301299580a4017963cc04ce6","impliedFormat":1},{"version":"feeb73d48cc41c6dd23d17473521b0af877751504c30c18dc84267c8eeea429a","impliedFormat":1},{"version":"25f1159094dc0bf3a71313a74e0885426af21c5d6564a254004f2cadf9c5b052","impliedFormat":1},{"version":"cde493e09daad4bb29922fe633f760be9f0e8e2f39cdca999cce3b8690b5e13a","impliedFormat":1},{"version":"3d7f9eb12aface876f7b535cc89dcd416daf77f0b3573333f16ec0a70bcf902a","impliedFormat":1},{"version":"4304f640f7cb4724ea82441accb7c7607fa7207541182470d625adda99b2900b","impliedFormat":1},{"version":"e0205f04611bea8b5b82168065b8ef1476a8e96236201494eb8c785331c43118","impliedFormat":1},{"version":"62d26d8ba4fa15ab425c1b57a050ed76c5b0ecbffaa53f182110aa3a02405a07","impliedFormat":1},{"version":"9941cbf7ca695e95d588f5f1692ab040b078d44a95d231fa9a8f828186b7b77d","impliedFormat":1},{"version":"41b8775befd7ded7245a627e9f4de6110236688ce4c124d2d40c37bc1a3bfe05","impliedFormat":1},{"version":"9de8d92a60e62a15c05a8685b1de0ea00d55033834b0c5ab7898c582e2320578","impliedFormat":1},{"version":"a00b0ad2a2a3c3731e481652cf853c57d9f4593e91e8c219b0862bda334e5d81","impliedFormat":1},{"version":"ef7c69c87186bc3b3b45238a1a1bac4c55fa1c5d065f45d4e45ab695291d9d05","impliedFormat":1},{"version":"fe861c8d294b37169655c80ceeb84388a73a7052e2c5056fde94172bd32dbe4a","impliedFormat":1},"f17eaf3f3bb7c3bf15cdd9c41b0ce8694f7d23524bad2894e1f0afdb82fe2298","394224ec95213445c87c29c632335b259684e8fcfe8c3f2506f6a79e2e052165","f57e195fa847fd4001281d2ddaf69c9cc2c4073104dc95ef31706492a31dbb3b","87f81405c7a0561b64bfe1b0bd6f28951cd3ca25ca31e57a16d8396d1ee906c9","e95fa91290ce8011f567b83fba781f0ee5b512de4a1dc50cf43691baacbd2ede","e2b7b7d8e79c5b4dba748566b20b4309057499137abee590ccb33eeca566d658",{"version":"4d7d964609a07368d076ce943b07106c5ebee8138c307d3273ba1cf3a0c3c751","impliedFormat":1},{"version":"0e48c1354203ba2ca366b62a0f22fec9e10c251d9d6420c6d435da1d079e6126","impliedFormat":1},{"version":"0662a451f0584bb3026340c3661c3a89774182976cd373eca502a1d3b5c7b580","impliedFormat":1},{"version":"17f98ccbbe1795bda3446f87252e0d905e961410257a303b306cd16c1a83ed0e","impliedFormat":1},{"version":"7f279dbacf8ebd7213cec514e31ec2159426a025996b617963344f08111682f6","impliedFormat":1},{"version":"b8f34439ec229601a6f96c8f63038625cd555aff0ba92293ceb8ea1105f40d17","impliedFormat":1},{"version":"b09c433ed46538d0dc7e40f49a9bf532712221219761a0f389e60349c59b3932","impliedFormat":1},{"version":"d164bc5ab2c1542d09bef8794de77567ea08f44fe2233eee5299c3dbf1fb9a5f","impliedFormat":1},{"version":"0bb0e644293820a5cc705591150eb1b49ae6b2349636206079aa248333564267","impliedFormat":1},{"version":"4573a2b0737d8783ac493037f283e9599fdd080ada54675a8312436cea6bf5f7","impliedFormat":1},"78aed401fb55a66f4c2ccc3458e7f42269e6b937e1e38700f3862d6144eec62a","f7e2cfd7bffc1648f51ce26c5067c8230c8e5c8880d09e29b3d50069814ef720","9928430ecb765a788ec083583bf62e7fbb1ea912f08bfcb575c2106774907b30","48d77dcf89beeac2a8161847c41c7f6165deb396aa2e70b06ca1fd5dc5ffff04","e48974e995d9191e012ce1dcba48e199bcab7ca612917bdc81200379d175847b","1224a84930b9ba75452e703a352707842ec29ac944e4ed4551618ca8ddb87840","2f1192d5ab5ef755a0d5a91cb39fbb3113c9aa794be6aca87918332eb71c26c1","553f8cebed060e9c0c1f47772b0a39f5b562da311edbae0c57e402bf4f1b48fa","7617dcebb6e56229f98aa3414b4090ea973423fff55e42efa19da2479cdf1a2c","eefd59be7e56b3225b31770c41c1907695c96e4a0589acd73a7b1744ce6fc51f","d81449c74b982b5d23c13834de6ec2b5d360ab78f1a6c9c2028ff7c83d49c3ca","6d56790055884d9eb03a9acf69efbabecb9bec359db0cd3d71dd4d4023afa4f2","53e6b268ccffa17fcc1c37cec4a23e6733dc0345a542422f1d6a8f12685d3aa0","f67036d1e7fff2f9ba76f2c8b2a3a274fa159d86747e180bf6860ebc3133462e","cf1d7d8e7f4958b2a19b1092e33b2e0291ef1da50e0fd5f646a1768cd11cf1dc","56172207f8065016ad5f835ec9e4ca23cd2792d16e209272d8c49f2907217e7f","9f81ebbf8a7cf7bd3f23e683efda37289eb0ea32c6b8fc3fbd3805f5da271ba4","ccf00a9933667ac49ae3c8e100b841241cfdb03c402412395c5d4d197f5d9f9d","cd7a611ba75ac1773918a0ece1d93c869aa10b887ad119f9b0a96869785dd06f","4b710074d8b508cc5c23ad455adae4d8ed94f1aa3638f40f4041ba3183cea89e","d60e60b07b29c2e0f2b1aeacbf790dab80fc335d670693d0fbd6b8023d64bc97","00771fd6daa744a35bb9098cb21c1f7fbec881fa08a82dc7dcc1d265e824db13",{"version":"5136ada8a6ff5eb706bb93d47ee7908da70567ebe307c4407778bf110ff390cb","impliedFormat":99},{"version":"4e4a6e416bb145a0eaa5d16e34bb29f3245f7f99c1cb1379b92766513ee48644","impliedFormat":99},{"version":"36cb7b515b1f37c672b0bef9e2d7f79fb9691cee740cb4b76ee6b4636e95639c","impliedFormat":99},{"version":"3f11172cb639fe19b4208a62a3b80c2a3cdd9e4e5711dee78254bfe947c2ce2b","impliedFormat":99},{"version":"15eebd236c4b7863dcf188858e5e8e5026f9fa057ea3d2c398f8b6d599565b89","impliedFormat":99},{"version":"014bf90700068528413e7acc47e58b89806c4540d433b65758e0d5ee757e45e2","impliedFormat":99},{"version":"0989dc719f7bd59eeab06772bc7dd8a399bb447a862b679b39a470e289d206f0","impliedFormat":99},{"version":"b169719d4e98c9046342f5e716fcdc60e391d411a1c7f9d0f94afe762fcc75b6","impliedFormat":99},{"version":"41f9135d77d1261d54197b4bdbe810584bf795a16f9fc4e798a05851ca87ab22","impliedFormat":99},{"version":"b7c1c2e3dac22ea6fd67281cb278f9eb26522b3e90b98417fd0eae470cf42f1d","impliedFormat":99},{"version":"db5f67f306930c6fd94cfe2cee36029b3378cd79a8203d3a27d2453efbbabc34","impliedFormat":99},{"version":"2ff7af30d64bc08b57caa723496060025fed56d513e6b7b92026f26c652a98fc","impliedFormat":99},{"version":"8251617ef839ce4f370ccd89a4b7cfca0f2166ef771ef6965642c26c0470175a","impliedFormat":99},{"version":"0f3fa7383d3f2ebed173ff59c102b4a68d10acdff5db4a009b73429ddaa15768","impliedFormat":99},{"version":"17bfc7019aa3430425ca11eb854c95f4abd51d1f4b29a296588f9c74ff440b97","impliedFormat":99},{"version":"b131bc8849f40ebc6f281b3be08f5e44676a6d43e336a166c48c3ca6770868b2","impliedFormat":99},{"version":"08b1758d7e210efaaa3f627fbeac287242307fa96b4c1bfc210d9a2ae5809d5c","impliedFormat":99},{"version":"b6c3995be1adb84b6f81cbf9dfdecaa0da5cc71c5a61b5fc0e4a5a31765d8257","impliedFormat":1},{"version":"e04ecf1120bd45f71531297c3ce1007bcf9a0739b11a84fd3c2b97d6ac26a2a8","impliedFormat":99},{"version":"0c0d4c550d90c330a3129efed22ba8fda8f6151d4f2b2582edebac7582b5b74b","impliedFormat":1},{"version":"ac95c17ee580f44c263ee5ddf675f6cca96d634c337122c156eecfcbc2e8640c","impliedFormat":99},{"version":"3da723823982206178406b7c2b8570152c6347a047fa7e59fa46011d10ac26b6","impliedFormat":1},{"version":"6bfa4df9d648afd10ea7f3aa249a64923dc215521a0f21a9604f526a19b7f1ee","impliedFormat":99},{"version":"a2d38762bff48f42e0add267a50e28079328f416a080fafed61563ff0c17cb7c","impliedFormat":99},{"version":"787b9cab1fdae10ada8ba1fa8fea2c552faf2a3fb4b35e9af9570e758450b49a","impliedFormat":99},{"version":"a5bf486e2de5ca9d3ed6726c334d399c26d3f3b7c56915ce6e98bdb7575b6ac8","impliedFormat":99},{"version":"8084463349fe0711b0d13923bedea19025161582fd73602b6ace6944daeb657c","impliedFormat":99},{"version":"95dd2fa1a14df6e0e6347f2b67e02f516545df373fb2c694ef3ab2790206c338","impliedFormat":1},{"version":"6bc78ca431af68b902781d24cbf7c6ae662e6b1610e56ed6173f3a9384c50304","impliedFormat":1},{"version":"229a36ef9292d157cdf3cda751d2895493f70eb6c4f00052def2560b094b5712","impliedFormat":99},{"version":"1947248ae2322f74b45b753dc5775cdd804114a4d424a7b15df47a73bab93c31","affectsGlobalScope":true,"impliedFormat":99},"3d31a0cf13a628925997bbdc81b25592e96f455324150d9f5c461e4ff79d01a8",{"version":"d04f947114fa00a20ee3c3182bb2863c30869df93293cc673f200defadbd69d9","impliedFormat":1},{"version":"4c629a21fb1b4f2428660f662d5fef6282e359d369f9e5ec5fd6ac197c1906ee","impliedFormat":1},{"version":"785926dee839d0b3f5e479615d5653d77f6a9ef8aa4eea5bbdce2703c860b254","impliedFormat":1},{"version":"66d5c68894bb2975727cd550b53cd6f9d99f7cb77cb0cbecdd4af1c9332b01dd","impliedFormat":1},{"version":"6e11dadfa63ce6458411018a3eeb7c2ae7493fc7468376e444a8ea15dc6b97ff","impliedFormat":1},{"version":"a25e1d0a7361b34c12d07305c1ee1cb79ef14572e92d587464218d25edf29b73","impliedFormat":1},{"version":"0b9e703c7dc9f5e0f1c63e101511b4c845638f7c1afdae5edc80e9d90ef38de0","impliedFormat":1},{"version":"e8513b984f23efd94386fb32f48f930c0cbd0c00ea04161fff3df2af803ac281","impliedFormat":1},{"version":"d54138a919eb29e7d117513fbb342240270ef7345a5e01849f095875c8a46f3b","impliedFormat":1},{"version":"b7a70952da14874adf3b7aed92e240a17bcbe3e558b83875d53868903fe25367","impliedFormat":1},{"version":"4a6021d33a2f3e369d0ff3866574e47fd949cff5d3c4591dc9147b305e565320","impliedFormat":1},{"version":"b88aca5b1197120033578a1963532a021629f6df1a7fd0a624828de6bba82087","impliedFormat":1},{"version":"d8af4791cef715fbb799e47293367ed9045fe2a037b831dceac1951cc0ee1554","impliedFormat":1},{"version":"0a92ce54ba29ca43f0127da3edd8f67ffce687af5d3221e5385b12dc6753c9a7","impliedFormat":1},{"version":"720ad03a68416d8571ba8c21ee1a0ca432a9a770266a9f9557884c1de4e037a8","impliedFormat":1},{"version":"f1db9f59be9aea912d7b4b10138c46808a6ec838c9faccff98653bcd0a6b0a8f","impliedFormat":1},{"version":"0c31720bf7e7ba5ce5dd3c9284e41aa295ca86146b5568d54d3066b100bb54b7","impliedFormat":1},{"version":"79d279cc440261206f4a73c3dbe2859c40cfcf23416e41bf28a05f47a8086758","impliedFormat":1},{"version":"f1697769f0e584caeb11c7781f247258e962a862be2838fb495f66132d76bde3","impliedFormat":1},{"version":"4824639eac43eb635a96c20c2486ce45ab32dabcd84cd5dbace8e07b2101f838","impliedFormat":1},{"version":"65813320b1218a278877637c63e4a62828afcdfdca7f54b5de753c3242b14134","impliedFormat":1},{"version":"51059a1b7d9fc1fa69ce930c9fb53e03cfa441f8d44684fcb0c67cf98a2c0202","impliedFormat":1},{"version":"df05b73ee1e889e3f4b284bc0cc89c9b6bef983511ed1113d5cde5cb91785ffe","impliedFormat":1},{"version":"dc8ecc75c7f094f1660051174150c9b4ab19aac55faddb68230172d2e3ccceeb","impliedFormat":1},{"version":"05ae24237b11d287726a9aae142ac3bc2f2af5e5c6b4d23f1f92f85d4cb442fe","impliedFormat":1},{"version":"844eac82393ecfb3f72c447221806fb2338887cf5d16b57cc78da96c8335b4e7","impliedFormat":1},{"version":"339d040cebb3fb3c42df83cc8ff751a203eba5222609f74b026aaaab64418a76","impliedFormat":1},{"version":"70a29119482d358ab4f28d28ee2dcd05d6cbf8e678068855d016e10a9256ec12","impliedFormat":1},{"version":"869ac759ae8f304536d609082732cb025a08dcc38237fe619caf3fcdd41dde6f","impliedFormat":1},{"version":"0ea900fe6565f9133e06bce92e3e9a4b5a69234e83d40b7df2e1752b8d2b5002","impliedFormat":1},{"version":"e5408f95ca9ac5997c0fea772d68b1bf390e16c2a8cad62858553409f2b12412","impliedFormat":1},{"version":"3c1332a48695617fc5c8a1aead8f09758c2e73018bd139882283fb5a5b8536a6","impliedFormat":1},{"version":"9260b03453970e98ce9b1ad851275acd9c7d213c26c7d86bae096e8e9db4e62b","impliedFormat":1},{"version":"083838d2f5fea0c28f02ce67087101f43bd6e8697c51fd48029261653095080c","impliedFormat":1},{"version":"969132719f0f5822e669f6da7bd58ea0eb47f7899c1db854f8f06379f753b365","impliedFormat":1},{"version":"94ca5d43ff6f9dc8b1812b0770b761392e6eac1948d99d2da443dc63c32b2ec1","impliedFormat":1},{"version":"2cbc88cf54c50e74ee5642c12217e6fd5415e1b35232d5666d53418bae210b3b","impliedFormat":1},{"version":"ccb226557417c606f8b1bba85d178f4bcea3f8ae67b0e86292709a634a1d389d","impliedFormat":1},{"version":"5ea98f44cc9de1fe05d037afe4813f3dcd3a8c5de43bdd7db24624a364fad8e6","impliedFormat":1},{"version":"5260a62a7d326565c7b42293ed427e4186b9d43d6f160f50e134a18385970d02","impliedFormat":1},{"version":"0b3fc2d2d41ad187962c43cb38117d0aee0d3d515c8a6750aaea467da76b42aa","impliedFormat":1},{"version":"ed219f328224100dad91505388453a8c24a97367d1bc13dcec82c72ab13012b7","impliedFormat":1},{"version":"6847b17c96eb44634daa112849db0c9ade344fe23e6ced190b7eeb862beca9f4","impliedFormat":1},{"version":"d479a5128f27f63b58d57a61e062bd68fa43b684271449a73a4d3e3666a599a7","impliedFormat":1},{"version":"6f308b141358ac799edc3e83e887441852205dc1348310d30b62c69438b93ca0","impliedFormat":1},{"version":"1c4482a15724128c5c872d8c35a76fb91fc7930b775b319a95ebc9a9f85b7098","impliedFormat":1},{"version":"7e644cf788a6e3bc1aa6cbbb65ed765b1bb829a2a890ea78e42bd61e9d412808","impliedFormat":1},{"version":"772d3ff8968ea6b3055f7f9c7ed2a9b3cc3139b04fc7f06c2f2ee170023cf063","impliedFormat":1},{"version":"3a28603c99b39953a3906ac6851b6f73d11d53abb624f95a0fe6713028458281","impliedFormat":1},{"version":"880ccaf64fa33784e5ffc4afbaccfae04ddddf96e3bd46ec79bd251b5b7b9a00","impliedFormat":1},{"version":"c7ecf8648e842e97dc60aad6ffb1ef647d0b5fa222ac74c116889c5c884e3a28","impliedFormat":1},{"version":"5a69642c22ef709bf526d287167b073942a79ec416a17f2bfb91c4e44e36e5f6","impliedFormat":1},{"version":"4a8f45e6c2dd91e45b5694188fb27d5f78bc6d5e1afc69aa71bbc80f946b5c45","impliedFormat":1},{"version":"ac59ff395a183085217e7aa46aab4090640a8e1b3ac819d3e4c7aa42f2b273b1","impliedFormat":1},{"version":"a4bce168b2f51f84f475d01af271bfe383dcda073399da70eebe7347b510cf9d","impliedFormat":1},{"version":"9cd6da4d649d3fab5c3adb1208164b971e362d51d55e1246384f0cf6400b2778","impliedFormat":1},{"version":"83739e4e9b574d90cf0343c7a9ee7c32fa5f6cb06e76cbb42afe659d3f8c59c4","impliedFormat":1},{"version":"ae99c5d6e2db96dc5f9f1e0843aba7c8de669b26f920df49ca8d3940412a43f3","impliedFormat":1},{"version":"63ae2bb65d2e47100627836fa3673a7d6c0bc7b547150373b622e0e8357b2b5b","impliedFormat":1},{"version":"48673f5fcda9b0afa923d1385596cfff75940785885c4a2d2580c2eee288f83e","impliedFormat":1},{"version":"eb5723708e7d7c5a7d34a56d9c58ceccf3c9ce0d8b5b4088e56b101a43e6f148","impliedFormat":1},{"version":"be87bea5bc232d33526a2c4f04b524e831e8b7cc434a0a786825f88f4a69dbb5","impliedFormat":1},{"version":"a4113c98617d73881cb1e7025a4e5e779a33749cf4c190bbadbc58bc832f975f","impliedFormat":1},{"version":"0d6a94aa331e510295fae46a58f9d99d56e3090c59d7d27b185684bcaaea58ff","impliedFormat":1},{"version":"89c2924bac0d50a9f02c9a138fc6747a95686e8eabc5820dd746f04f906a71fc","impliedFormat":1},{"version":"d175d6c836d62d90569c295ce12b7aa4ded18edd8fde8c2e409ab21979fa7fd3","impliedFormat":1},{"version":"e1455de0584a640a7d12a0afdbef120c344c0b86963959dd5a9a4bf739c56a26","impliedFormat":1},{"version":"be06dd793d4e437bc8bd7e9f8c31e98b4f5c714e0593cb38a832b40e2fe6b0f5","impliedFormat":1},{"version":"e612a3f548e3ff327840673309b221d07a96f775b978da76919904ba3b159d93","impliedFormat":1},{"version":"7994b1a9afd831f839bce1c8a7d79031af30b644ea55da626d7a66ac81d40915","impliedFormat":1},"3db5793d7f6b45a4299e353ec576972ff20095c2e844f4d6a9b66a64b09974d5","394224ec95213445c87c29c632335b259684e8fcfe8c3f2506f6a79e2e052165","8867bda33c012f0a6cc62095a087592bd1e28bb9849f749b6a4c45d950c4f858","90e9105216e57d8a2b031b9433e20265e7f48b12f2e4ae02b680519ebcaec77e","ec389e9e99eaf4657d1d6a863f5554954dd486e0d2f3cd39877ecbaa04cbc778","55497a01cf99905a0e0facac638b8a611a94b1a72f689c79bd75ed639c3c0eab","689c7666d85e94b8265af4360eccd97975ee760b4ce7d5919686ff00b6c2e92b","db4b2a6231c7287be97021cb6ee62ae5a9035e4861aad1dcfd1c4746cc67a333","90e5ed2417f7737fd0636172cbd5e6666ad9f739b953990743251b8f7b7a4850","3833943f3d0e5bb35e7eab99717fd5fe21f32e27c7dcb06530c5a4a89895fc7a","a5ce6a3b079cff4f28f14194deb2bb872dda6cd29a2231d4f28ff9fa2e9f3ff8","2cb14a947390ad7b355700c11fafc5e4755ae6d6b6c26623480356a75cbeb74d","f573cbb1f3fb7395181815610ccc7cda7a9515f7e022d5c1d6be14ec97877f7b","54aa22b0c83dd747403b93c3f4dfd73c5487df0a5b53a8d42815b9a7b40a98ff","6837650d7591e57abf0241e8864c8281a71080896c49a1c59c1800a26ed7af7e","86cd742d8d69770ce9a938a3cef98981422c7c7369875cdc6ed12927a57fe7ae","beb305b8775d53d07e06689c8a7470b6b85a1abf1f2023b82df67c8acaef98a8","af1891996ea0c471e180cab52226eeab06fc7e834aac33d56e34a99c5ccd8f05","344ef19a330943ce5885c6399f5580e0bc63646574e687c52da1a4d89d9f6109","b67ec84dbee924247af4fc2e0bc72a7aa11a8c9d8b4401ce1afca0560b78f0e2","fcf572c5bc6adfbc1a04a16994c39fb22058187c546977e0b3c35874bf9bfd7d","dfe66f25c2789c727e6d0cadc984e340e67e23471340d34fa0c4923d4f0fc9f0","111570e1085fb46c88ece6a602fbfb0d3242acd7402c992570a4b63b3873c83a","b3639f2e7895c7cef734514cf68d8ed4f97f6c7861cdb85d20285c95e92b4cd4","9beeb14c598404f2ff78a1e06c3981477a3c7e78297ad5d8ca87906e84934089","3a430f1747e031d84aee01d5b0dbd3075bcf8577f471a585b646307a72d24d70","5fee43e3b94e4821cbde42028a6efe5729307490d0c51064599e8f0e6236b876","d7e168f9208662353b517ffa3e6438e7d89a6625d9afa487b9c06cbe4ead80d9","c385d572ce4455bfb82416d8c3acc3d425f1107f8a89f510d52ea9891fb5737b","f38546d83a5507aa1559850371a860d6fc349cdffe5b30b59f933c3a43130a4b","9b3189aa4d8fcf2072685e9987d333ec26bfdebaf3c4432e62b0a2b0ff9ba682","2d59adba2bafbf63c011b5a86e6b0f40a89059c681d96f5d1e08f6c09f5e7eae","efd29da5a497841663dd60aa22498811733c49e927bafdadc58dde0584b1d2bf","3f02a000cffe8acf7264df5fc79791cf061644bf4cfd98de77b2d1c071e6782f","6e4b6bb006bd96735be194d0557dfb397716764f72232e0995cd481c464375ad","90d515bf1c9941afa9267092b19ebc467a988f8205e8e0d5a418600cb1b68fb5","5f2c6831d50cbc3d980fbd5e8c8153d08e554bbd9d4c84dfc1d3cbbb7f6d5af8","8d7746d9bbb327ac9ad2c8ede47bf11702fff120359599cfe7603032ecf4cfbc","9fae08d9b43c40baf7ab1b3f6111ede33649b412f838ee6b474b9bcd04458fad","a10737c77e9f6fd00939bfe0fb0f65353fa406befa84e1506bbb57621f06e76f","96aeef9a1953cfcee212b9c0db91fc368e9681d017f3a8919a7414f8d3ce3159","d2c956b0738e5b6fddbcd0896c2df1078fb205006e836480f3fa3339991c99ef","fefb2583a8019f3d9ae32c8c78b2df4ccd51a334c4a6f5ffcc234e1028bcc2a5","9e43f21b9ed94b6b29d48a68315c8b8226660c33ab913c88bd621eb49ae2789d","5b54149f2ad1113b0663943e8707257357789999353fd390411b9765d21d7b49","9b9bcabc4760153990cb4a0e04f4bf6f9b43fa93d87ad8187394332317532787","1a28ee770f8fb152df27b6684a6e6307142fdfca0dee5e12b0f4894039a5f5f5","9d515e4d04a8be5a90a6e06d5df632561cbe6559ee9fe5c9cc9ecea04b8ebf63","0d3954157efa22446cdaa6d7a14e33d2df3539052ad3cf784a28cc06b03227eb","c3a69d7ce432d6d117073d3f002f015baf8a2c09a92de8264a3d823b85438bc5","c4cf7fcea370d83a1253297f2625858e175b7a8f8e6abf6bc3a560ef4e0f90fc","460317ea97ee6db44a0295b2c83bb3e1fd3465c055537fc84bf9ae795e717f1b","7e5a7cc09c3da4ad6865a9f3846263e76a141dd5986610e46b5e9b5122e7f2aa","d56565d3ad90adb0258f73a887858124649ba46c076ee0273239bf50acf15fdc","bfab9efab24eda2558900868a7254a0fe43fbf3df430c826e9bf96187fd11fbd","dc137dfdb574ddd3f9646d9dd54657d340662fc11e3ec03f74cb1f1fc1b29ced","cb16e059e78a5cea57d6c2830b193f525739bc0751d5900fece4e23143fa2a9a","d737dccb5c886be768b3913c23f5e1072be9d49969bbaa829196138824746229","021a37a73b834fe8f1c75246e4b3cb570b134dee6bc226ed1f3dee0f464f5526","af27ba8d6e31294ad3c5622492cb78b8eb2d2c2fb8e2f95882ccdf41c8ad2bda","b5a58b8667a09be35c5fdf1e9e2d4ea148d0aa60b66a424731746fe4475c493d","2545827b1d9dded458d47e98daf580978ce9eeaa0ad4079ea44069e385788ab5","b5de75bbef033c613b788ffb857a9ac92c45c6d12dcc1920eda1daf4e6ec7f75","480f74a82e4338db4338338197e96b1c1a559211111fb0095eb000590453837e","05740da4e1094aef52af60888aab44f1e6f139c1c9210e6cdb011b2911f82e19","14809ef67fd0754b15c93ffca28f709cba94d3f19f404d14dea54a9a2b8e7d7a","b89fa3e2d96b10e25dedf4e3f6360a44bc28c8fc476d0676c08ff7960e6f3579","7f42fbb3289094e35237cb1a91043e48d618cb7b19c98f28b5bc6a533b7294d5","ab9aaaa4cd41b4357e6d82a3ce177e063ce3351e2562364680e6dde69a91ff4e","57014fb6c48ec805a15818b64bb033e080a6a833a0104a6b8f419504b33e4504","c990003f2e97352160e15107b4fae24855bf2a536159f9827f6e492903941938","616b7b9a60871fdd8128c37ebca88727b8a12b1792ee0a3d88102e960df7c38f","023ca51e465e582ce86934cb4fb14ae0d18df6d0cc0575a669ffa6af56c91eec","52c8292af83bd9d1440f325aac9c23df6b2ba501a21f3803c1392160942a5c54","e97d290116d23b02583dbf9df3889ed08ddb407895520dd1e241173df7ba6270","0c35c94345a3dd03e8b7442af55da1b465b15adb138c42f7cae54228a1702b47","9f7678967384777a20101cfb28b43def3d01bf637840baaf91b7370fb05ba3ab","b99474599113316824788e9711d57937134a6a0be899ef57d17fc91e4e621f5e","3248f10f6c4fe546a6d8ae3d860c579fab3cb5632e64410cc471189dfaff971c","0888e1a1636e3105f950487f24671f39baa4da2d811a27befbde13a2b96456d2","197f77eaf01ff12e175b2bcabdf5dcb1c5e44872f06c5eef62dbf68445067df7","883211253562d8e864d3ee97c40d132c7a8f3bebadf49465f37dc4739f03688f","b863435cb6546f8e43829c39a7a728b71d4d53aeb0291f384459825eef748397","7b249117bf2c8494460c1408cc5b32f83bb144ef2dce0e3de3f18e1a7c85fc6d","2717d4bfd4e340b67c36779daf9ba822561fecf015c4d51cf7f3be83783b0bba",{"version":"fe93c474ab38ac02e30e3af073412b4f92b740152cf3a751fdaee8cbea982341","impliedFormat":1},{"version":"f5705d196b442afbdbd971b6e44bad96f4e32afb53cebfa2e5afe3140017bfc6","impliedFormat":1},{"version":"1e00b8bf9e3766c958218cd6144ffe08418286f89ff44ba5a2cc830c03dd22c7","impliedFormat":1},"f107d260b6cb6df27b7fd7f96b7f07c1366e37d8fd55c127aac909e065a01b11","6b8f2e10f226460cdb7c0417b527537cf42f8f2f9c1a335f388fcc99186199dd","b09ea0fd2769cbf7c8abd8643b97a1d35d6725affabd3df2fd9dd65b8c548dcd","cd12255483dc15b5e7a0bd7212c301605d33e540b223cdfdfca465955d4021bf","db3a44854f191b826a423ada89895666ab1a71460db6a63e28ee896b52948060","fa349d3a3c79ac3306a9526f409e7440c297272e8c160ff58868b166455e93ed","4ba3ec7b6cdc89110cc40d2c9e20b7c9a2514486755dab29556b30dd58a49873","3684fb599d6a403026074e4946eebe71c9e2747a0ec532332975fbd0a0be8727","5971f72908e4a3b09896429192d7851207e9e005788fdf25c449a7916a323afc","aa77dd66bffc05dad6ce1873e757e48d47de05c5fa3ffcfb56f6937293bf0d3a","e437366d363df69315ec9feb76283e4c4e737d4368ca479306eafa2602436a99","fe52e5cc55ef1db7bc656d4eb4024e0c115aeff808e64605b609c3f88f6c6900","67d7203695bba1f5bf27456744b60cbac9e0aafc5b5ca26dacc22f9d2a880ad4",{"version":"e4f29c3d083974006e922acc5fe89b78f90190c09e4310914574a5a2ebf952f1","impliedFormat":1},"1bce17c733184858df66a57eebce9355c995dc056f6f36ae6f1aaa300e61959c","f2c18f263a9de86af07ba6b4eef72533e7bce8813b534bbdf2bc1803511217ac","eb6d7e3b4a1b099560e31705205dd06d366b951d6fad0c2e6bf785f0573094bd","35030903a8d8f843b2709717b4c1f3d824153cd20bb0c6be0e2720cc82213f64","0639e5d3e4253244e44011ec778198d0b93e57490d366cf91f1648c8e1423939","b06d30a3ab369b371c9ce0fb870ccce4fe91ce5b24056d9e477a04148e03b221","3796838501df6c614ef7f0a85b1178d48d083aa3b4f105dfd76869c88644a99e","b33c39eddda6d939a70d3680cd096524d6a5d40b2afa4c05505279ce6b50f8c0","9922b7e82ef64042d4f3e28206e678943ce14767ac6dac312569529606827c8c","69ae6a6404002bb9b7576808bd3eb1f3939369929f715372650cd63eb4c32af3","968a5c90a654c08209438ba8c7ca716eb418acc71293484ea5eac52c67646508","f6c82a5a284f7e261c6262f8b6699bf8f143033d2d2a80bfa61b112a6e05029c","d60e60b07b29c2e0f2b1aeacbf790dab80fc335d670693d0fbd6b8023d64bc97","7ed79ac4919c16d28cf58e6460e72a741ea2a633f319dfc576c37b26bce39db4","33eb6c7783c51624df1320f8c2ce40e4f9b1eaf0938af5e34b8c5eeb44e234f3","440ce4560862fc7b6f0fba9add5c4cdf8f587d774649f85948bd08c0bace7567","7d80733af5a2ece2b8498b61b117e420645216dff26a78a21a36dfc64028c689","f686c9cce7ad4e87291286b709212ebc18b2d767bb52e3edcf802f38cb8022fd","7870ffbe1530940bfa727372c8daa7b227e1ce3871b1f1170a2cbb981d8d1f7b","8047e4dfca073ff625a3094a703675c76b9ad7fa1b17b96598b0ea5c9f1aee41","7d27c76803c1250fa5f9ac26beb0906b8406d71e405bedbfa015a34c4da3180a","9a192097067bab7f88ad78cbd818aeeda5e172d33b4a2ff229a0bd4906d8f418","51ddd33b1158060ccf391fde77b961a4fe692eeebc83d7a6d3bbb4982075e134","aab6baa2d7a8df0f457a35cf2595e90e0956ba1230fb9d1605a4e79dc9b58dc9","0639e5d3e4253244e44011ec778198d0b93e57490d366cf91f1648c8e1423939","8e16f0fd3d5f65f19db6e82fbc37b774aef8f6144946d92ab3e7159f952afe5f","9af99319b98d39c2e77b23cce22053818cde8ee99385555614af91ae525a405d","90a1abd8d926c15d206d725e6534d077c53ff51a038211053a0151e0b60cb901","f5771427afcdce722af633802d6f8d1a53389822fd32a38d3ec381018235f85a","e252ca8bb5051438d7054ecad2fb15fcd63a7d40ffe74e3533963b207e274c1a","ac28dba9bdc75c13ed87ef475e0c41ab6c489eaf3ec29e5e2037ae4955a98eb0","03c6e8e8f996a313511c9acacedd8966af1a6cc5bbeb9663898682194a4327d1","bf7b92b3ea098cb92b8ebf3fb0ba39704e8d6222f3a8db971c1b4f7cf6a8334f","676dc54ab41c3b588cf84b102eeaecef206334571ac36a1de275984ff4a87464","676dc54ab41c3b588cf84b102eeaecef206334571ac36a1de275984ff4a87464","12c8c44b11bfcb5acdc688f2edff4471c8a383fcbdd249a5f726f0d1c820baf8","fb501297f95190207f2b122103c1e01341885c62e81723db4a3e7de096d4d978","f2b0f47426ab4dced97bfb82cf55ed4c677f5966f6e91593764b3cf8a407f624","977de8e7b5401da441c1e5f34f2af8e4a626dc36d2ac1d0f81819d5f8616bc7d","d1986184a09a52db8228cb2bb2a61a8c05c9354e5b93cec8e2628d8579c892d7","6268b7b6d0ca79884a18fbfcbb5b3c9f0b830bfb79b79e8e769fc2565c2a097e",{"version":"511a5f4f77165dc1b73ceae1e28b4a8f78f3443d8e18a1fd43bfafd2b0133bbe","impliedFormat":1},{"version":"b6d03c9cfe2cf0ba4c673c209fcd7c46c815b2619fd2aad59fc4229aaef2ed43","impliedFormat":1},{"version":"95aba78013d782537cc5e23868e736bec5d377b918990e28ed56110e3ae8b958","impliedFormat":1},{"version":"670a76db379b27c8ff42f1ba927828a22862e2ab0b0908e38b671f0e912cc5ed","impliedFormat":1},{"version":"13b77ab19ef7aadd86a1e54f2f08ea23a6d74e102909e3c00d31f231ed040f62","impliedFormat":1},{"version":"069bebfee29864e3955378107e243508b163e77ab10de6a5ee03ae06939f0bb9","impliedFormat":1},{"version":"104c67f0da1bdf0d94865419247e20eded83ce7f9911a1aa75fc675c077ca66e","impliedFormat":1},{"version":"cc0d0b339f31ce0ab3b7a5b714d8e578ce698f1e13d7f8c60bfb766baeb1d35c","impliedFormat":1},{"version":"427fe2004642504828c1476d0af4270e6ad4db6de78c0b5da3e4c5ca95052a99","impliedFormat":1},{"version":"2eeffcee5c1661ddca53353929558037b8cf305ffb86a803512982f99bcab50d","impliedFormat":99},{"version":"9afb4cb864d297e4092a79ee2871b5d3143ea14153f62ef0bb04ede25f432030","affectsGlobalScope":true,"impliedFormat":99},{"version":"380b919bfa0516118edaf25b99e45f855e7bc3fd75ce4163a1cfe4a666388804","impliedFormat":1},{"version":"0d89e5c4ce6e3096e64504e1fa45a8ddccf488cb5fdc1980ea09db2a451f0b91","impliedFormat":1},{"version":"fcf79300e5257a23ed3bacaa6861d7c645139c6f7ece134d15e6669447e5e6db","impliedFormat":1},{"version":"187119ff4f9553676a884e296089e131e8cc01691c546273b1d0089c3533ce42","impliedFormat":1},{"version":"aa2c18a1b5a086bbcaae10a4efba409cc95ba7287d8cf8f2591b53704fea3dea","impliedFormat":1},{"version":"5a0b15210129310cee9fa6af9200714bb4b12af4a04d890e15f34dbea1cf1852","impliedFormat":1},{"version":"0244119dbcbcf34faf3ffdae72dab1e9bc2bc9efc3c477b2240ffa94af3bca56","impliedFormat":1},{"version":"00baffbe8a2f2e4875367479489b5d43b5fc1429ecb4a4cc98cfc3009095f52a","impliedFormat":1},{"version":"a873c50d3e47c21aa09fbe1e2023d9a44efb07cc0cb8c72f418bf301b0771fd3","impliedFormat":1},{"version":"7c14ccd2eaa82619fffc1bfa877eb68a012e9fb723d07ee98db451fadb618906","impliedFormat":1},{"version":"49c36529ee09ea9ce19525af5bb84985ea8e782cb7ee8c493d9e36d027a3d019","impliedFormat":1},{"version":"df996e25faa505f85aeb294d15ebe61b399cf1d1e49959cdfaf2cc0815c203f9","impliedFormat":1},{"version":"4f6a12044ee6f458db11964153830abbc499e73d065c51c329ec97407f4b13dd","impliedFormat":1},{"version":"1f164f3717c73c0386cbfdfa81478d1b1cc253ccafed09de2b4e95933e6cd1c1","impliedFormat":1},{"version":"70683130063cbf66881365f07cff86840b6fa0238c076970f89aa7a43d9c1341","affectsGlobalScope":true,"impliedFormat":1},{"version":"0dc6940ff35d845686a118ee7384713a84024d60ef26f25a2f87992ec7ddbd64","impliedFormat":1},{"version":"a4a39b5714adfcadd3bbea6698ca2e942606d833bde62ad5fb6ec55f5e438ff8","impliedFormat":1},{"version":"bbc1d029093135d7d9bfa4b38cbf8761db505026cc458b5e9c8b74f4000e5e75","impliedFormat":1},{"version":"d34aa8df2d0b18fb56b1d772ff9b3c7aea7256cf0d692f969be6e1d27b74d660","impliedFormat":1},{"version":"baac9896d29bcc55391d769e408ff400d61273d832dd500f21de766205255acb","impliedFormat":1},{"version":"2f5747b1508ccf83fad0c251ba1e5da2f5a30b78b09ffa1cfaf633045160afed","impliedFormat":1},{"version":"6823ccc7b5b77bbf898d878dbcad18aa45e0fa96bdd0abd0de98d514845d9ed9","affectsGlobalScope":true,"impliedFormat":1},{"version":"b71c603a539078a5e3a039b20f2b0a0d1708967530cf97dec8850a9ca45baa2b","impliedFormat":1},{"version":"168d88e14e0d81fe170e0dadd38ae9d217476c11435ea640ddb9b7382bdb6c1f","impliedFormat":1},{"version":"8e04cf0688e0d921111659c2b55851957017148fa7b977b02727477d155b3c47","impliedFormat":1},{"version":"afe73051ff6a03a9565cbd8ebb0e956ee3df5e913ad5c1ded64218aabfa3dcb5","impliedFormat":1},{"version":"035a5df183489c2e22f3cf59fc1ed2b043d27f357eecc0eb8d8e840059d44245","impliedFormat":1},{"version":"a4809f4d92317535e6b22b01019437030077a76fec1d93b9881c9ed4738fcc54","impliedFormat":1},{"version":"5f53fa0bd22096d2a78533f94e02c899143b8f0f9891a46965294ee8b91a9434","impliedFormat":1},{"version":"cdcc132f207d097d7d3aa75615ab9a2e71d6a478162dde8b67f88ea19f3e54de","impliedFormat":1},{"version":"0d14fa22c41fdc7277e6f71473b20ebc07f40f00e38875142335d5b63cdfc9d2","impliedFormat":1},{"version":"e1028394c1cf96d5d057ecc647e31e457b919092f882ed0c7092152b077fed9d","impliedFormat":1},{"version":"f315e1e65a1f80992f0509e84e4ae2df15ecd9ef73df975f7c98813b71e4c8da","impliedFormat":1},{"version":"5b9586e9b0b6322e5bfbd2c29bd3b8e21ab9d871f82346cb71020e3d84bae73e","impliedFormat":1},{"version":"3e70a7e67c2cb16f8cd49097360c0309fe9d1e3210ff9222e9dac1f8df9d4fb6","impliedFormat":1},{"version":"ab68d2a3e3e8767c3fba8f80de099a1cfc18c0de79e42cb02ae66e22dfe14a66","impliedFormat":1},{"version":"d96cc6598148bf1a98fb2e8dcf01c63a4b3558bdaec6ef35e087fd0562eb40ec","impliedFormat":1},{"version":"f8db4fea512ab759b2223b90ecbbe7dae919c02f8ce95ec03f7fb1cf757cfbeb","affectsGlobalScope":true,"impliedFormat":1},{"version":"96d14f21b7652903852eef49379d04dbda28c16ed36468f8c9fa08f7c14c9538","impliedFormat":1},{"version":"b0f9ef6423d6b29dde29fd60d83d215796b2c1b76bfca28ac374ae18702cfb8e","impliedFormat":1},{"version":"29f72ec1289ae3aeda78bf14b38086d3d803262ac13904b400422941a26a3636","affectsGlobalScope":true,"impliedFormat":1},{"version":"8baa5d0febc68db886c40bf341e5c90dc215a90cd64552e47e8184be6b7e3358","impliedFormat":1},{"version":"ab82804a14454734010dcdcd43f564ff7b0389bee4c5692eec76ff5b30d4cf66","impliedFormat":1},{"version":"e7bb49fac2aa46a13011b5eb5e4a8648f70a28aea1853fab2444dd4fcb4d4ec7","impliedFormat":1},{"version":"464e45d1a56dae066d7e1a2f32e55b8de4bfb072610c3483a4091d73c9924908","impliedFormat":1},{"version":"da318e126ac39362c899829547cc8ee24fa3e8328b52cdd27e34173cf19c7941","impliedFormat":1},{"version":"24bd01a91f187b22456c7171c07dbf44f3ad57ebd50735aab5c13fa23d7114b4","impliedFormat":1},{"version":"4738eefeaaba4d4288a08c1c226a76086095a4d5bcc7826d2564e7c29da47671","impliedFormat":1},{"version":"736097ddbb2903bef918bb3b5811ef1c9c5656f2a73bd39b22a91b9cc2525e50","impliedFormat":1},{"version":"dbec715e9e82df297e49e3ed0029f6151aa40517ebfd6fcdba277a8a2e1d3a1b","impliedFormat":1},{"version":"097f1f8ca02e8940cfdcca553279e281f726485fa6fb214b3c9f7084476f6bcc","impliedFormat":1},{"version":"8f75e211a2e83ff216eb66330790fb6412dcda2feb60c4f165c903cf375633ee","impliedFormat":1},{"version":"c3fb0d969970b37d91f0dbf493c014497fe457a2280ac42ae24567015963dbf7","impliedFormat":1},{"version":"a9155c6deffc2f6a69e69dc12f0950ba1b4db03b3d26ab7a523efc89149ce979","impliedFormat":1},{"version":"c99faf0d7cb755b0424a743ea0cbf195606bf6cd023b5d10082dba8d3714673c","impliedFormat":1},{"version":"21942c5a654cc18ffc2e1e063c8328aca3b127bbf259c4e97906d4696e3fa915","impliedFormat":1},{"version":"c6cdcd12d577032b84eed1de4d2de2ae343463701a25961b202cff93989439fb","impliedFormat":1},{"version":"3dc633586d48fcd04a4f8acdbf7631b8e4a334632f252d5707e04b299069721e","impliedFormat":1},{"version":"3322858f01c0349ee7968a5ce93a1ca0c154c4692aa8f1721dc5192a9191a168","impliedFormat":1},{"version":"6dde0a77adad4173a49e6de4edd6ef70f5598cbebb5c80d76c111943854636ca","impliedFormat":1},{"version":"09acacae732e3cc67a6415026cfae979ebe900905500147a629837b790a366b3","impliedFormat":1},{"version":"f7b622759e094a3c2e19640e0cb233b21810d2762b3e894ef7f415334125eb22","impliedFormat":1},{"version":"99236ea5c4c583082975823fd19bcce6a44963c5c894e20384bc72e7eccf9b03","impliedFormat":1},{"version":"f6688a02946a3f7490aa9e26d76d1c97a388e42e77388cbab010b69982c86e9e","impliedFormat":1},{"version":"9f642953aba68babd23de41de85d4e97f0c39ef074cb8ab8aa7d55237f62aff6","impliedFormat":1},{"version":"159d95163a0ed369175ae7838fa21a9e9e703de5fdb0f978721293dd403d9f4a","impliedFormat":1},{"version":"bae8d023ef6b23df7da26f51cea44321f95817c190342a36882e93b80d07a960","impliedFormat":1},{"version":"26a770cec4bd2e7dbba95c6e536390fffe83c6268b78974a93727903b515c4e7","impliedFormat":1}],"root":[510,511,[569,574],[593,606],638,[709,718],[745,793],[797,809],[811,851]],"options":{"allowJs":true,"allowSyntheticDefaultImports":true,"esModuleInterop":true,"jsx":4,"module":99,"skipLibCheck":true,"strict":true,"target":4},"referencedMap":[[850,1],[510,2],[851,3],[511,4],[569,5],[798,6],[800,7],[799,8],[797,9],[801,10],[804,11],[803,12],[805,13],[802,14],[807,15],[806,10],[808,16],[821,17],[826,18],[827,19],[843,20],[844,19],[832,21],[570,19],[833,22],[571,19],[828,23],[829,19],[838,19],[840,24],[831,25],[841,26],[823,19],[839,27],[825,28],[842,29],[836,30],[834,31],[835,32],[822,33],[837,34],[824,35],[830,36],[716,37],[819,33],[712,38],[811,19],[845,19],[714,19],[812,21],[710,19],[813,22],[711,19],[638,23],[713,33],[818,19],[809,39],[820,40],[605,19],[709,28],[816,41],[814,42],[815,43],[604,33],[817,44],[606,45],[715,46],[718,47],[572,33],[573,33],[717,48],[603,49],[602,50],[574,33],[594,19],[593,51],[595,52],[774,53],[775,54],[776,55],[777,56],[778,57],[779,58],[781,59],[780,60],[782,61],[792,62],[790,63],[789,64],[791,65],[788,66],[786,67],[785,68],[784,69],[787,70],[783,53],[770,71],[767,72],[769,73],[768,74],[772,75],[771,76],[773,77],[766,78],[763,79],[757,80],[762,81],[764,82],[761,83],[765,84],[756,85],[760,86],[758,87],[759,88],[600,19],[601,89],[599,51],[846,90],[847,91],[848,19],[748,19],[753,92],[752,92],[750,93],[751,94],[754,95],[746,96],[747,97],[755,98],[745,99],[749,100],[598,101],[597,102],[596,103],[849,19],[793,19],[854,104],[852,2],[636,105],[637,106],[608,107],[631,108],[627,109],[609,2],[632,110],[633,111],[607,2],[620,2],[611,112],[619,113],[612,112],[613,112],[614,112],[615,112],[618,112],[616,112],[617,112],[629,114],[625,115],[623,116],[621,2],[622,2],[630,117],[610,2],[515,118],[892,2],[895,119],[253,2],[683,120],[679,121],[666,2],[682,122],[675,123],[673,124],[672,124],[671,123],[668,124],[669,123],[677,125],[670,124],[667,123],[674,124],[680,126],[681,127],[676,128],[678,124],[894,2],[857,129],[853,104],[855,130],[856,104],[859,131],[877,132],[862,133],[858,134],[878,2],[860,2],[518,135],[880,136],[879,137],[513,2],[884,138],[887,139],[888,140],[885,2],[889,2],[890,141],[891,142],[900,143],[514,2],[901,2],[876,144],[864,145],[865,146],[863,147],[866,148],[867,149],[868,150],[869,151],[870,152],[871,153],[872,154],[873,155],[874,156],[875,157],[902,2],[903,2],[141,158],[142,158],[143,159],[97,160],[144,161],[145,162],[146,163],[92,2],[95,164],[93,2],[94,2],[147,165],[148,166],[149,167],[150,168],[151,169],[152,170],[153,170],[154,171],[155,172],[156,173],[157,174],[98,2],[96,2],[158,175],[159,176],[160,177],[192,178],[161,179],[162,180],[163,181],[164,182],[165,183],[166,184],[167,185],[168,186],[169,187],[170,188],[171,188],[172,189],[173,2],[174,190],[176,191],[175,192],[177,193],[178,194],[179,195],[180,196],[181,197],[182,198],[183,199],[184,200],[185,201],[186,202],[187,203],[188,204],[189,205],[99,2],[100,2],[101,2],[140,206],[190,207],[191,208],[882,2],[883,2],[196,209],[413,210],[197,211],[195,212],[415,213],[414,214],[193,215],[411,2],[194,216],[83,2],[85,217],[410,210],[270,210],[904,2],[881,218],[886,219],[905,2],[914,220],[906,2],[909,221],[912,222],[913,223],[907,224],[910,225],[908,226],[918,227],[916,228],[917,229],[915,230],[928,231],[919,2],[920,2],[921,2],[922,2],[923,2],[924,2],[925,2],[926,2],[927,2],[929,2],[930,232],[512,2],[861,2],[624,233],[628,234],[634,233],[635,235],[102,2],[893,2],[84,2],[517,236],[516,237],[899,238],[520,2],[650,239],[647,240],[648,241],[653,242],[651,243],[652,244],[704,245],[702,246],[703,247],[656,248],[654,249],[655,250],[707,251],[705,252],[706,253],[659,254],[657,255],[658,256],[662,257],[660,258],[661,259],[665,260],[663,261],[664,262],[686,263],[684,264],[685,265],[645,2],[701,266],[699,267],[700,268],[689,269],[687,270],[688,271],[692,272],[690,273],[691,274],[695,275],[693,276],[694,277],[698,278],[696,279],[697,280],[649,2],[708,281],[646,2],[911,282],[897,283],[898,284],[459,285],[464,1],[454,286],[217,287],[257,288],[439,289],[252,290],[234,2],[409,2],[215,2],[428,291],[283,292],[216,2],[337,293],[260,294],[261,295],[408,296],[425,297],[319,298],[433,299],[434,300],[432,301],[431,2],[429,302],[259,303],[218,304],[362,2],[363,305],[289,306],[219,307],[290,306],[285,306],[206,306],[255,308],[254,2],[438,309],[450,2],[242,2],[384,310],[385,311],[379,210],[486,2],[387,2],[388,33],[380,312],[491,313],[490,314],[485,2],[304,2],[424,315],[423,2],[484,316],[381,210],[313,317],[309,318],[314,319],[312,2],[311,320],[310,2],[487,2],[483,2],[489,321],[488,2],[308,318],[478,322],[481,323],[298,324],[297,325],[296,326],[494,210],[295,327],[277,2],[497,2],[795,328],[794,2],[500,2],[499,210],[501,329],[199,2],[435,330],[436,331],[437,332],[212,2],[245,2],[211,333],[198,2],[400,210],[204,334],[399,335],[398,336],[389,2],[390,2],[397,2],[392,2],[395,337],[391,2],[393,338],[396,339],[394,338],[214,2],[209,2],[210,306],[265,2],[271,340],[272,341],[269,342],[267,343],[268,344],[263,2],[406,33],[292,33],[458,345],[465,346],[469,347],[442,348],[441,2],[280,2],[502,349],[453,350],[382,351],[383,352],[377,353],[368,2],[405,354],[444,210],[369,355],[407,356],[402,357],[401,2],[403,2],[374,2],[361,358],[443,359],[446,360],[371,361],[375,362],[366,363],[420,364],[452,365],[323,366],[338,367],[207,368],[451,369],[203,370],[273,371],[264,2],[274,372],[350,373],[262,2],[349,374],[91,2],[343,375],[244,2],[364,376],[339,2],[208,2],[238,2],[347,377],[213,2],[275,378],[373,379],[440,380],[372,2],[346,2],[266,2],[352,381],[353,382],[430,2],[355,383],[357,384],[356,385],[247,2],[345,368],[359,386],[322,387],[344,388],[351,389],[222,2],[226,2],[225,2],[224,2],[229,2],[223,2],[232,2],[231,2],[228,2],[227,2],[230,2],[233,390],[221,2],[331,391],[330,2],[335,392],[332,393],[334,394],[336,392],[333,393],[243,395],[293,396],[449,397],[503,2],[473,398],[475,399],[370,400],[474,401],[447,359],[386,359],[220,2],[324,402],[239,403],[240,404],[241,405],[237,406],[419,406],[287,406],[325,407],[288,407],[236,408],[235,2],[329,409],[328,410],[327,411],[326,412],[448,413],[418,414],[417,415],[378,416],[412,417],[416,418],[427,419],[426,420],[422,421],[321,422],[318,423],[320,424],[317,425],[358,426],[348,2],[463,2],[360,427],[421,2],[276,428],[367,330],[365,429],[278,430],[281,431],[498,2],[279,432],[282,432],[461,2],[460,2],[462,2],[496,2],[284,433],[445,2],[315,434],[307,210],[258,2],[202,435],[291,2],[467,210],[201,2],[477,436],[306,210],[471,33],[305,437],[456,438],[303,436],[205,2],[479,439],[301,210],[302,210],[294,2],[200,2],[300,440],[299,441],[246,442],[376,187],[286,187],[354,2],[341,443],[340,2],[404,318],[316,210],[457,444],[86,210],[89,445],[90,446],[87,210],[88,2],[256,447],[251,448],[250,2],[249,449],[248,2],[455,450],[466,451],[468,452],[470,453],[796,454],[472,455],[476,456],[509,457],[480,457],[508,458],[482,459],[492,460],[493,461],[495,462],[504,463],[507,333],[506,2],[505,233],[896,464],[644,465],[643,465],[640,210],[641,210],[639,2],[642,466],[810,2],[342,467],[567,2],[81,2],[82,2],[13,2],[14,2],[16,2],[15,2],[2,2],[17,2],[18,2],[19,2],[20,2],[21,2],[22,2],[23,2],[24,2],[3,2],[25,2],[26,2],[4,2],[27,2],[31,2],[28,2],[29,2],[30,2],[32,2],[33,2],[34,2],[5,2],[35,2],[36,2],[37,2],[38,2],[6,2],[42,2],[39,2],[40,2],[41,2],[43,2],[7,2],[44,2],[49,2],[50,2],[45,2],[46,2],[47,2],[48,2],[8,2],[54,2],[51,2],[52,2],[53,2],[55,2],[9,2],[56,2],[57,2],[58,2],[60,2],[59,2],[61,2],[62,2],[10,2],[63,2],[64,2],[65,2],[11,2],[66,2],[67,2],[68,2],[69,2],[70,2],[1,2],[71,2],[72,2],[12,2],[76,2],[74,2],[79,2],[78,2],[73,2],[77,2],[75,2],[80,2],[118,468],[128,469],[117,468],[138,470],[109,471],[108,472],[137,233],[131,473],[136,474],[111,475],[125,476],[110,477],[134,478],[106,479],[105,233],[135,480],[107,481],[112,482],[113,2],[116,482],[103,2],[139,483],[129,484],[120,485],[121,486],[123,487],[119,488],[122,489],[132,233],[114,490],[115,491],[124,492],[104,493],[127,484],[126,482],[130,2],[133,494],[626,233],[564,495],[521,2],[523,496],[522,497],[527,498],[562,499],[559,500],[561,501],[524,500],[525,502],[529,502],[528,503],[526,504],[560,505],[558,500],[563,506],[556,2],[557,2],[530,507],[535,500],[537,500],[532,500],[533,507],[539,500],[540,508],[531,500],[536,500],[538,500],[534,500],[554,509],[553,500],[555,510],[549,500],[551,500],[550,500],[546,500],[552,511],[547,500],[548,512],[541,500],[542,500],[543,500],[544,500],[545,500],[566,513],[565,514],[519,515],[568,516],[577,517],[584,518],[581,519],[579,519],[582,519],[578,519],[583,519],[580,519],[576,519],[575,2],[725,520],[732,521],[735,522],[729,523],[734,520],[728,524],[733,525],[730,526],[731,527],[736,528],[726,525],[727,524],[724,525],[723,525],[722,525],[721,525],[741,529],[740,529],[743,530],[742,529],[739,531],[738,532],[737,532],[719,531],[720,533],[744,534],[590,2],[592,535],[585,2],[589,536],[588,2],[586,2],[587,2],[591,2]],"semanticDiagnosticsPerFile":[[571,[{"start":2631,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737}]],[595,[{"start":22,"length":27,"messageText":"Module './env' has already exported a member named 'MODULE_SPECS'. Consider explicitly re-exporting to resolve the ambiguity.","category":1,"code":2308}]],[711,[{"start":2911,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737}]],[713,[{"start":426,"length":3,"messageText":"Cannot find namespace 'JSX'.","category":1,"code":2503}]],[715,[{"start":5828,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737},{"start":6770,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737},{"start":6789,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737},{"start":6898,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737}]],[718,[{"start":37,"length":8,"messageText":"Cannot find module 'vitest' or its corresponding type declarations.","category":1,"code":2307},{"start":1400,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737},{"start":1428,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737}]],[749,[{"start":795,"length":8,"code":2339,"category":1,"messageText":"Property 'provider' does not exist on type 'Computer'."}]],[750,[{"start":2464,"length":7,"messageText":"'payment' is possibly 'null' or 'undefined'.","category":1,"code":18049},{"start":2472,"length":3,"code":2339,"category":1,"messageText":{"messageText":"Property '_id' does not exist on type 'string | number | bigint | boolean | symbol | JObject | JArray'.","category":1,"code":2339,"next":[{"messageText":"Property '_id' does not exist on type 'string'.","category":1,"code":2339}]}},{"start":2984,"length":7,"messageText":"'payment' is possibly 'null' or 'undefined'.","category":1,"code":18049},{"start":2992,"length":3,"code":2339,"category":1,"messageText":{"messageText":"Property '_id' does not exist on type 'string | number | bigint | boolean | symbol | JObject | JArray'.","category":1,"code":2339,"next":[{"messageText":"Property '_id' does not exist on type 'string'.","category":1,"code":2339}]}},{"start":3327,"length":22,"messageText":"'quizEncoded.effect.res' is possibly 'null' or 'undefined'.","category":1,"code":18049},{"start":3350,"length":3,"code":2339,"category":1,"messageText":{"messageText":"Property '_id' does not exist on type 'string | number | bigint | boolean | symbol | JObject | JArray'.","category":1,"code":2339,"next":[{"messageText":"Property '_id' does not exist on type 'string'.","category":1,"code":2339}]}},{"start":3388,"length":25,"messageText":"Spread types may only be created from object types.","category":1,"code":2698},{"start":3437,"length":7,"messageText":"'payment' is possibly 'null' or 'undefined'.","category":1,"code":18049},{"start":3445,"length":3,"code":2339,"category":1,"messageText":{"messageText":"Property '_id' does not exist on type 'string | number | bigint | boolean | symbol | JObject | JArray'.","category":1,"code":2339,"next":[{"messageText":"Property '_id' does not exist on type 'string'.","category":1,"code":2339}]}}]],[751,[{"start":1394,"length":21,"messageText":"Spread types may only be created from object types.","category":1,"code":2698}]],[752,[{"start":1214,"length":4,"messageText":"'quiz' is of type 'unknown'.","category":1,"code":18046},{"start":1282,"length":4,"messageText":"'quiz' is of type 'unknown'.","category":1,"code":18046},{"start":1322,"length":4,"messageText":"'quiz' is of type 'unknown'.","category":1,"code":18046},{"start":1610,"length":4,"messageText":"'quiz' is of type 'unknown'.","category":1,"code":18046},{"start":1699,"length":4,"messageText":"'quiz' is of type 'unknown'.","category":1,"code":18046},{"start":1926,"length":7,"messageText":"'payment' is of type 'unknown'.","category":1,"code":18046},{"start":2286,"length":4,"messageText":"'quiz' is of type 'unknown'.","category":1,"code":18046},{"start":2441,"length":21,"messageText":"Spread types may only be created from object types.","category":1,"code":2698}]],[774,[{"start":462,"length":8,"code":2339,"category":1,"messageText":"Property 'purchase' does not exist on type 'AccessClient'."},{"start":734,"length":11,"code":2339,"category":1,"messageText":"Property 'checkAccess' does not exist on type 'AccessClient'."},{"start":1051,"length":13,"code":2339,"category":1,"messageText":"Property 'listByStudent' does not exist on type 'AccessClient'."}]],[775,[{"start":779,"length":12,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'BrowserAccessClient' is not assignable to parameter of type 'AccessClient'.","category":1,"code":2345,"next":[{"messageText":"Type 'BrowserAccessClient' is missing the following properties from type 'AccessClient': accessHelper, saleHelper, deploy, mintAccess, and 5 more.","category":1,"code":2740}]}},{"start":808,"length":5,"code":2339,"category":1,"messageText":"Property 'price' does not exist on type 'Quiz'."},{"start":1618,"length":11,"code":2339,"category":1,"messageText":"Property 'description' does not exist on type 'Quiz'."},{"start":1799,"length":9,"code":2339,"category":1,"messageText":"Property 'questions' does not exist on type 'Quiz'."},{"start":2019,"length":17,"code":2339,"category":1,"messageText":"Property 'rewardPerQuestion' does not exist on type 'Quiz'."},{"start":2426,"length":5,"code":2339,"category":1,"messageText":"Property 'price' does not exist on type 'Quiz'."}]],[778,[{"start":1052,"length":6,"code":2339,"category":1,"messageText":"Property 'submit' does not exist on type 'AttemptClient'."},{"start":1852,"length":3,"code":2339,"category":1,"messageText":"Property 'get' does not exist on type 'AttemptClient'."},{"start":2229,"length":13,"code":2339,"category":1,"messageText":"Property 'listByStudent' does not exist on type 'AttemptClient'."}]],[779,[{"start":1068,"length":13,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'BrowserAttemptClient' is not assignable to parameter of type 'AttemptClient'.","category":1,"code":2345,"next":[{"messageText":"Type 'BrowserAttemptClient' is missing the following properties from type 'AttemptClient': attemptHelper, createAttempt, submitAnswerWithAccess","category":1,"code":2739}]}}]],[783,[{"start":474,"length":6,"code":2339,"category":1,"messageText":"Property 'create' does not exist on type 'PaymentClient'."},{"start":712,"length":8,"code":2339,"category":1,"messageText":"Property 'withdraw' does not exist on type 'PaymentClient'."},{"start":938,"length":10,"code":2339,"category":1,"messageText":"Property 'listByUser' does not exist on type 'PaymentClient'."}]],[784,[{"start":130,"length":16,"messageText":"Module '\"@/hooks\"' has no exported member 'usePaymentClient'.","category":1,"code":2305}]],[801,[{"start":706,"length":2,"messageText":"Expected 0 arguments, but got 1.","category":1,"code":2554}]],[803,[{"start":1037,"length":12,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'BrowserAccessClient' is not assignable to parameter of type 'AccessClient'.","category":1,"code":2345,"next":[{"messageText":"Type 'BrowserAccessClient' is missing the following properties from type 'AccessClient': accessHelper, saleHelper, deploy, mintAccess, and 5 more.","category":1,"code":2740}]}},{"start":3154,"length":11,"code":2339,"category":1,"messageText":"Property 'description' does not exist on type 'Quiz'."},{"start":3486,"length":9,"code":2339,"category":1,"messageText":"Property 'questions' does not exist on type 'Quiz'."},{"start":3782,"length":5,"code":2339,"category":1,"messageText":"Property 'price' does not exist on type 'Quiz'."},{"start":4072,"length":17,"code":2339,"category":1,"messageText":"Property 'rewardPerQuestion' does not exist on type 'Quiz'."},{"start":4395,"length":17,"code":2339,"category":1,"messageText":"Property 'rewardPerQuestion' does not exist on type 'Quiz'."},{"start":4420,"length":9,"code":2339,"category":1,"messageText":"Property 'questions' does not exist on type 'Quiz'."},{"start":5745,"length":9,"code":2339,"category":1,"messageText":"Property 'questions' does not exist on type 'Quiz'."},{"start":5760,"length":1,"messageText":"Parameter '_' implicitly has an 'any' type.","category":1,"code":7006},{"start":5763,"length":5,"messageText":"Parameter 'index' implicitly has an 'any' type.","category":1,"code":7006}]],[804,[{"start":1504,"length":11,"code":2741,"category":1,"messageText":"Property 'accessTokenId' is missing in type '{ quiz: Quiz; }' but required in type 'AttemptFormProps'.","relatedInformation":[{"file":"./src/features/attempts/components/attemptform.tsx","start":354,"length":13,"messageText":"'accessTokenId' is declared here.","category":3,"code":2728}],"canonicalHead":{"code":2322,"messageText":"Type '{ quiz: Quiz; }' is not assignable to type 'AttemptFormProps'."}}]],[805,[{"start":955,"length":13,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'BrowserAttemptClient' is not assignable to parameter of type 'AttemptClient'.","category":1,"code":2345,"next":[{"messageText":"Type 'BrowserAttemptClient' is missing the following properties from type 'AttemptClient': attemptHelper, createAttempt, submitAnswerWithAccess","category":1,"code":2739}]}}]],[816,[{"start":8705,"length":3,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'string | string[]' is not assignable to parameter of type 'string'.","category":1,"code":2345,"next":[{"messageText":"Type 'string[]' is not assignable to type 'string'.","category":1,"code":2322}]}},{"start":8735,"length":3,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'string | string[]' is not assignable to parameter of type 'string'.","category":1,"code":2345,"next":[{"messageText":"Type 'string[]' is not assignable to type 'string'.","category":1,"code":2322}]}},{"start":8765,"length":3,"code":2345,"category":1,"messageText":{"messageText":"Argument of type 'string | string[]' is not assignable to parameter of type 'string'.","category":1,"code":2345,"next":[{"messageText":"Type 'string[]' is not assignable to type 'string'.","category":1,"code":2322}]}},{"start":8983,"length":5,"code":2339,"category":1,"messageText":{"messageText":"Property 'split' does not exist on type 'string | string[]'.","category":1,"code":2339,"next":[{"messageText":"Property 'split' does not exist on type 'string[]'.","category":1,"code":2339}]}},{"start":9633,"length":5,"code":2339,"category":1,"messageText":{"messageText":"Property 'split' does not exist on type 'string | string[]'.","category":1,"code":2339,"next":[{"messageText":"Property 'split' does not exist on type 'string[]'.","category":1,"code":2339}]}}]],[817,[{"start":764,"length":2,"code":2322,"category":1,"messageText":{"messageText":"Type '{ children: string; key: string; to: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2322,"next":[{"messageText":"Property 'to' does not exist on type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2339}]}},{"start":1099,"length":11,"messageText":"Cannot find name 'useLocation'. Did you mean 'location'?","category":1,"code":2552,"canonicalHead":{"code":2304,"messageText":"Cannot find name 'useLocation'."},"relatedInformation":[{"start":1088,"length":8,"messageText":"'location' is declared here.","category":3,"code":2728}]},{"start":2957,"length":2,"code":2322,"category":1,"messageText":{"messageText":"Type '{ children: string; to: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2322,"next":[{"messageText":"Property 'to' does not exist on type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2339}]}},{"start":4769,"length":2,"code":2322,"category":1,"messageText":{"messageText":"Type '{ children: any; to: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2322,"next":[{"messageText":"Property 'to' does not exist on type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2339}]}},{"start":5070,"length":2,"code":2322,"category":1,"messageText":{"messageText":"Type '{ children: any[]; to: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2322,"next":[{"messageText":"Property 'to' does not exist on type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2339}]}},{"start":6489,"length":2,"code":2322,"category":1,"messageText":{"messageText":"Type '{ children: any[]; to: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2322,"next":[{"messageText":"Property 'to' does not exist on type 'IntrinsicAttributes & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> & LinkProps<...> & { ...; } & RefAttributes<...>'.","category":1,"code":2339}]}}]],[826,[{"start":12186,"length":11,"code":2322,"category":1,"messageText":{"messageText":"Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.","category":1,"code":2322,"next":[{"messageText":"Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.","category":1,"code":2322,"next":[{"messageText":"Type 'null' is not assignable to type 'HTMLInputElement'.","category":1,"code":2322}]}]},"relatedInformation":[{"start":9126,"length":11,"messageText":"The expected type comes from property 'urlInputRef' which is declared here on type 'IntrinsicAttributes & { urlInputRef: RefObject<HTMLInputElement>; }'","category":3,"code":6500}]}]],[830,[{"start":599,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737},{"start":1522,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737},{"start":1707,"length":2,"messageText":"BigInt literals are not available when targeting lower than ES2020.","category":1,"code":2737}]],[834,[{"start":3502,"length":6,"code":2339,"category":1,"messageText":"Property 'latest' does not exist on type 'Computer'."}]],[837,[{"start":1997,"length":3,"code":2339,"category":1,"messageText":"Property 'rpc' does not exist on type 'Computer'."}]],[846,[{"start":163,"length":23,"messageText":"Cannot find module '../contracts/modSpecs' or its corresponding type declarations.","category":1,"code":2307}]],[847,[{"start":181,"length":22,"messageText":"Cannot find module '../contracts/counter' or its corresponding type declarations.","category":1,"code":2307},{"start":251,"length":23,"messageText":"Cannot find module '../contracts/modSpecs' or its corresponding type declarations.","category":1,"code":2307}]],[848,[{"start":45,"length":25,"messageText":"Cannot find module '@/app/common-components' or its corresponding type declarations.","category":1,"code":2307}]],[849,[{"start":45,"length":25,"messageText":"Cannot find module '@/app/common-components' or its corresponding type declarations.","category":1,"code":2307}]]],"affectedFilesPendingEmit":[851,569,798,800,799,797,801,804,803,805,802,807,806,808,821,826,827,843,844,832,570,833,571,828,829,838,840,831,841,823,839,825,842,836,834,835,822,837,824,830,716,819,712,811,845,714,812,710,813,711,638,713,818,809,820,605,709,816,814,815,604,817,606,715,718,572,573,717,603,602,574,594,593,595,774,775,776,777,778,779,781,780,782,792,790,789,791,788,786,785,784,787,783,770,767,769,768,772,771,773,766,763,757,762,764,761,765,756,760,758,759,600,601,599,846,847,848,748,753,752,750,751,754,746,747,755,745,749,598,597,596,849,793],"version":"5.9.3"}
```

