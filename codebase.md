# Codebase Documentation

This file contains high-level documentation about the QuizApp architecture. For actual implementation code, refer to the source files in the `apps/web/src/` directory.

## Project Structure

```
QuizApp/
├── apps/
│   ├── web/              # Next.js frontend application
│   │   └── src/
│   │       ├── app/      # Next.js app router pages
│   │       ├── common-components/  # Shared UI components
│   │       ├── config/   # Configuration and constants
│   │       ├── features/ # Feature-specific code (quizzes, attempts, etc.)
│   │       ├── hooks/    # React hooks
│   │       ├── lib/      # Utility libraries
│   │       ├── services/ # Service layer (blockchain, backend API)
│   │       ├── stores/   # State management (Zustand)
│   │       └── types/    # TypeScript type definitions
│   └── api/              # NestJS backend API
└── packages/
    └── quiz-contracts/   # Smart contracts for blockchain
```

## Architecture Overview

The QuizApp uses a hybrid architecture combining blockchain operations with traditional database queries:

### Two Data Flows

#### Flow 1: Blockchain Operations (via SDK)
**Frontend → SDK → Contracts → Blockchain**

Used for:
- Creating quizzes
- Purchasing access tokens
- Submitting quiz attempts
- Withdrawing payments

Implementation: `apps/web/src/services/bc/`

#### Flow 2: Fast Queries (via API)
**Frontend → API → Database**

Used for:
- Listing quizzes with filters
- Viewing leaderboard
- Getting user stats
- Searching quizzes

Implementation: `apps/web/src/services/backend/`

## Service Layer

### Blockchain Services (`apps/web/src/services/bc/`)

- **BrowserQuizClient.ts** - Quiz operations on blockchain
- **BrowserTeacherClient.ts** - Teacher-specific operations
- **BrowserAttemptClient.ts** - Quiz attempt operations
- **BrowserAccessClient.ts** - Access token operations

### Backend API Services (`apps/web/src/services/backend/`)

- **api.ts** - Base HTTP client with JWT handling
- **auth.service.ts** - Authentication operations
- **quiz.service.ts** - Quiz CRUD operations
- **attempt.service.ts** - Attempt recording
- **leaderboard.service.ts** - Leaderboard queries
- **user.service.ts** - User management

### Contract Helpers (`apps/web/src/services/contracts/`)

- **contractsService.ts** - Quiz contract helpers from `@quiz-app/contracts`

## Configuration

### Environment Variables

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_CHAIN=LTC
NEXT_PUBLIC_NETWORK=regtest
NEXT_PUBLIC_URL=http://localhost:1031
```

## Key Design Decisions

### 1. DB-First for Reads, Blockchain for Writes

- **Reads**: Try database first (fast), fallback to blockchain (slow)
- **Writes**: Write to blockchain first, then sync to database
- **Rationale**: Blockchain is the source of truth, database provides speed

### 2. Authentication Flow

1. User connects wallet (generates/imports mnemonic)
2. User signs up/logs in to get JWT tokens
3. Wallet public key is linked to user account
4. JWT tokens stored in localStorage
5. Auto-refresh on 401 responses

Implementation: `apps/web/src/services/backend/auth.service.ts`

### 3. State Management

- **Wallet state**: Zustand with persistence (`apps/web/src/stores/wallet.store.ts`)
- **Session state**: Zustand with persistence (`apps/web/src/stores/session.store.ts`)
- **UI state**: React local state

## Feature Modules

Each feature in `apps/web/src/features/` contains:
- `*.service.ts` - Business logic
- `components/` - React components
- `hooks/` - Feature-specific hooks

Features:
- **access/** - Access token management
- **attempts/** - Quiz attempts
- **leaderboard/** - Leaderboard display
- **payments/** - Payment/withdrawal handling
- **quizzes/** - Quiz management
- **wallet/** - Wallet connection

## Testing

### Unit Tests
Located in `packages/quiz-contracts/test/`

### Running Tests
```bash
npm run test:compile:mocha    # Compile contracts
npm run test:mocha:all        # Run all tests
```

## Deployment Considerations

1. **Build contracts first**: `npm run build:contracts`
2. **Build web app**: `npm run build:web`
3. **Environment variables**: Ensure all `NEXT_PUBLIC_*` vars are set
4. **CORS**: Backend must allow frontend origin

## Performance Tips

1. Cache API responses for frequently accessed data
2. Use pagination for large lists
3. Debounce search queries
4. Use blockchain for truth, API for speed
5. Implement optimistic updates where appropriate

## Security Considerations

1. Never expose mnemonics in logs
2. Validate all user inputs
3. Use HTTPS in production
4. Implement rate limiting on API
5. Sanitize blockchain data before display
