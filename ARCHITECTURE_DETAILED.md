# Quiz App - Architecture Documentation

## Overview

This is a blockchain-powered quiz application built with a monorepo structure using Turborepo. The app allows teachers to create quizzes and students to take them, with rewards paid in cryptocurrency.

## Architecture

The application follows a **vertical slice architecture** with clear separation of concerns:

```
apps/
├── web/                    # Next.js frontend (App Router)
│   ├── src/
│   │   ├── app/           # Routes (pages & layouts only)
│   │   ├── features/      # Vertical slices (wallet, quizzes, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # Cross-feature orchestration
│   │   ├── stores/        # Zustand state management
│   │   ├── hooks/         # App-wide hooks
│   │   ├── lib/           # Utilities
│   │   └── config/        # Configuration
│   └── ...
└── api/                   # NestJS backend
    └── src/
        ├── modules/       # Feature modules
        └── prisma/        # Database

packages/
├── quiz-contracts/        # Smart contracts
├── sdk/                   # SDK clients
└── shared/                # Shared types & utilities
```

## Key Features

### 1. **Features Folder (Vertical Slices)**

Each feature is self-contained with its own:
- **Components**: UI components specific to the feature
- **Services**: Business logic and API calls
- **Hooks**: React hooks for state management

#### Features:

- **wallet**: Wallet connection, balance display, and transactions
- **quizzes**: Quiz creation, listing, and management
- **access**: Quiz access purchase and verification
- **attempts**: Taking quizzes and viewing results
- **payments**: Payment management and withdrawals
- **leaderboard**: Rankings and achievements

### 2. **Services Layer**

Cross-cutting services that orchestrate between features:

- **sdk.factory.ts**: Creates SDK clients from wallet/config
- **api.client.ts**: Communicates with NestJS backend
- **tx/txParser.ts**: Decodes blockchain transactions

### 3. **Stores (Zustand)**

Persistent state management:

- **wallet.store.ts**: Wallet connection, balance, blockchain config
- **session.store.ts**: User role, session data

### 4. **Bitcoin Computer Components**

Pre-built components from `@bitcoin-computer/components` are wrapped in `/components/bc/`:

- Auth, Wallet, Transaction, SmartObject, etc.
- Integrated with our Zustand stores

## Data Flow

### Teacher Flow:
1. Connect wallet → `/wallet`
2. Navigate to teacher dashboard → `/teacher`
3. Create quiz → `/teacher/create`
4. Quiz is saved on-chain and synced to backend

### Student Flow:
1. Connect wallet → `/wallet`
2. Browse quizzes → `/student/quizzes`
3. Purchase access → Modal with AccessClient
4. Take quiz → `/student/quizzes/[id]/attempt`
5. View results → `/student/quizzes/[id]/result`
6. Receive reward in wallet

## Component Structure

### Example: Quiz Feature

```typescript
features/quizzes/
├── quizzes.service.ts      # Business logic
├── components/
│   ├── QuizCard.tsx        # Individual quiz display
│   ├── QuizGrid.tsx        # Grid of quizzes
│   ├── QuizForm.tsx        # Create/edit form
│   └── index.ts
├── hooks/
│   ├── useQuiz.ts          # Fetch single quiz
│   ├── useTeacherQuizzes.ts
│   └── index.ts
└── index.ts                # Re-exports
```

### Pages Use Features:

```typescript
// app/student/page.tsx
import { QuizGrid } from '@/features/quizzes'

export default function StudentPage() {
  const { quizzes } = useAllQuizzes()
  return <QuizGrid quizzes={quizzes} viewMode="student" />
}
```

## Service Integration

### SDK Integration

Services use SDK clients from `@quiz-app/sdk`:

```typescript
import { useQuizClient } from '@/hooks'

const quizClient = useQuizClient()
const quiz = await quizClient.create(...)
```

### API Integration

For cached/indexed data, use the API client:

```typescript
import { apiClient } from '@/services'

const quizzes = await apiClient.getQuizzes()
```

## State Management

### Wallet Store

```typescript
const { 
  isConnected, 
  publicKey, 
  chain, 
  network,
  connect,
  disconnect 
} = useWalletStore()
```

### Session Store

```typescript
const { 
  role, 
  userId, 
  setRole,
  setUser 
} = useSessionStore()
```

## Navigation

App uses a centralized navigation component:

```typescript
// components/layout/Navigation.tsx
- Shows current wallet connection
- Dynamic links based on user role
- Responsive mobile menu
```

## Styling

- **Tailwind CSS** for utility-first styling
- **Dark mode** support throughout
- Responsive design for mobile/tablet/desktop

## Best Practices

### 1. **Feature Independence**
Each feature should be as self-contained as possible. Avoid direct imports between features.

### 2. **Service Layer**
Use services for complex orchestration between features or external APIs.

### 3. **Type Safety**
All components and functions are fully typed with TypeScript.

### 4. **Error Handling**
All async operations include try-catch blocks with user-friendly error messages.

### 5. **Loading States**
Components show loading skeletons while data is being fetched.

## Development Workflow

1. **Create a new feature**:
   ```
   features/
   └── my-feature/
       ├── my-feature.service.ts
       ├── components/
       ├── hooks/
       └── index.ts
   ```

2. **Add components** specific to the feature

3. **Create hooks** for data fetching

4. **Export** from index.ts

5. **Use in pages**:
   ```typescript
   import { MyFeatureComponent } from '@/features/my-feature'
   ```

## Testing

(To be implemented)
- Unit tests for services
- Component tests with React Testing Library
- E2E tests with Playwright

## Deployment

(To be implemented)
- Frontend: Vercel/Netlify
- Backend: Railway/Fly.io
- Blockchain: Appropriate network (testnet/mainnet)

## Future Enhancements

- [ ] Real-time leaderboard updates
- [ ] Quiz categories and tags
- [ ] Student profiles and achievements
- [ ] Teacher analytics dashboard
- [ ] Payment batching for gas optimization
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Contributing

Follow the established architecture patterns:
1. Keep routes in `app/` minimal
2. Put logic in `features/`
3. Use services for cross-cutting concerns
4. Maintain type safety
5. Add tests for new features

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Bitcoin Computer Docs](https://docs.bitcoincomputer.io/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
