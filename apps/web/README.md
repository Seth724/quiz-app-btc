# Quiz App Web

Next.js frontend for the Quiz App built on Bitcoin Computer.

## Architecture

This app follows a clean, feature-based architecture:

```
src/
  app/                    # Next.js App Router pages
  components/             # Shared/reusable UI components
  features/               # Feature modules (vertical slices)
  services/               # Business logic & API clients
  stores/                 # Zustand state management
  config/                 # Configuration & environment
  lib/                    # Utilities & helpers
  hooks/                  # Shared React hooks
```

## Features

- Teacher quiz creation and management
- Student quiz browsing and attempts
- Access token purchase flow (atomic swap)
- Payment withdrawals
- Leaderboard

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local` file:

```env
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
```
