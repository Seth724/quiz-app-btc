# Quiz App Web

Next.js 15 frontend for the Decentralized Quiz App built on Bitcoin Computer.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible. The VPS uses **Nginx reverse proxy** with **HTTPS/SSL** for secure connections.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router, SSR & file-based routing |
| **TypeScript** | Type-safe development |
| **TailwindCSS** | Utility-first CSS framework |
| **Zustand** | Lightweight state management |
| **Bitcoin Computer** | Blockchain abstraction layer for LTC/BTC |
| **React Query** | Data fetching & caching |
| **Radix UI** | Accessible UI components |

---

## Architecture

This app follows a clean, feature-based architecture:

```
src/
  app/                    # Next.js App Router pages & layouts
    layout.tsx            # Root layout with providers
    page.tsx              # Home page
    providers.tsx         # Context providers (Wallet, Session)
    teacher/              # Teacher dashboard & quiz management
    student/              # Student dashboard & quiz browsing
    wallet/               # Wallet management & withdrawals
    leaderboard/          # Global rankings

  components/             # Shared/reusable UI components
    ui/                   # Base UI components (Button, Input, Card)
    layout/               # Layout components (Header, Footer, Sidebar)
    bc/                   # Bitcoin Computer components

  features/               # Feature modules (vertical slices)
    auth/                 # Authentication components & logic
    quizzes/              # Quiz-related components
    attempts/             # Quiz attempt components
    payments/             # Payment & withdrawal components
    leaderboard/          # Leaderboard components

  services/               # Business logic & API clients
    api.service.ts        # REST API client
    blockchain.service.ts # Blockchain operations

  stores/                 # Zustand state management
    wallet.store.ts       # Wallet state (keys, balance, connection)
    session.store.ts      # Session state (user, role, navigation)
    ui.store.ts           # UI state (modals, themes)

  config/                 # Configuration & environment
    index.ts              # Config exports
    env.config.ts         # Environment variable validation

  lib/                    # Utilities & helpers
    utils.ts              # General utilities
    formatters.ts         # Data formatters
    validators.ts         # Validation functions

  hooks/                  # Shared React hooks
    useTeacherClient.ts   # Teacher blockchain client
    useStudentClient.ts   # Student blockchain client
    useQuizClient.ts      # Quiz blockchain client
    useWallet.ts          # Wallet management hook
```

---

## Features

### For Teachers
- 📝 Create and manage quizzes
- 💰 Set rewards and entry fees in satoshis
- 🔐 Control quiz access with NFT-like tokens
- 📊 Monitor student progress & analytics
- 💸 Withdraw accumulated entry fees
- 📈 View quiz performance metrics

### For Students
- 🔍 Browse available quizzes with filters
- 🎟️ Purchase access tokens via atomic swaps
- ✍️ Take quizzes and earn crypto rewards
- 🏆 Compete on global leaderboard
- 💵 Withdraw earned rewards to wallet
- 📊 Track personal statistics

### Wallet Features
- 🔑 Generate/import wallet keys
- 💰 View balance (on-chain & off-chain)
- 📤 Deposit/withdraw cryptocurrency
- 📜 View transaction history
- 🔐 Secure key management (localStorage encryption)

---

## Development

### Prerequisites

- Node.js 18+
- npm 10+
- Running API server (see `apps/api/README.md`)
- Bitcoin Computer instance (see root `README.md`)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

1. Copy environment template:
   ```bash
   cp .env.web.template .env.local
   ```

2. Configure environment variables:
   ```env
   # Blockchain Configuration
   NEXT_PUBLIC_CHAIN=LTC
   NEXT_PUBLIC_NETWORK=regtest
   NEXT_PUBLIC_URL=http://localhost:1031

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:4000

   # Contract Module Specifications (after deployment)
   NEXT_PUBLIC_TEACHER_MOD=<module-id>
   NEXT_PUBLIC_STUDENT_MOD=<module-id>
   NEXT_PUBLIC_QUIZ_MOD=<module-id>
   NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=<module-id>
   NEXT_PUBLIC_PAYMENT_MOD=<module-id>
   NEXT_PUBLIC_QUIZ_ACCESS_MOD=<module-id>
   NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=<module-id>
   ```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
# Check for lint errors
npm run lint

# Fix lint errors automatically
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

---

## Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   ├── teacher/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Teacher dashboard
│   │   │   ├── create-quiz/
│   │   │   │   └── page.tsx          # Create quiz form
│   │   │   ├── my-quizzes/
│   │   │   │   └── page.tsx          # Teacher's quizzes list
│   │   │   ├── quiz/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Quiz detail & edit
│   │   │   └── withdrawals/
│   │   │       └── page.tsx          # Withdraw entry fees
│   │   ├── student/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Student dashboard
│   │   │   ├── browse/
│   │   │   │   └── page.tsx          # Browse quizzes
│   │   │   ├── quiz/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Quiz detail & attempt
│   │   │   │       └── take/
│   │   │   │           └── page.tsx  # Take quiz interface
│   │   │   └── my-attempts/
│   │   │       └── page.tsx          # Attempt history
│   │   ├── wallet/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Wallet management
│   │   ├── leaderboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Global rankings
│   │   └── api/                      # API routes (if needed)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   └── bc/
│   │       ├── Auth.tsx
│   │       ├── Wallet.tsx
│   │       └── SmartObject.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── stores/
│   │   ├── quizzes/
│   │   │   ├── components/
│   │   │   │   ├── QuizCard.tsx
│   │   │   │   ├── QuizForm.tsx
│   │   │   │   ├── QuizList.tsx
│   │   │   │   └── QuizStatus.tsx
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   ├── attempts/
│   │   │   ├── components/
│   │   │   │   ├── AttemptForm.tsx
│   │   │   │   ├── AttemptResult.tsx
│   │   │   │   └── AttemptHistory.tsx
│   │   │   └── hooks/
│   │   ├── payments/
│   │   │   ├── components/
│   │   │   │   ├── PaymentModal.tsx
│   │   │   │   ├── WithdrawalForm.tsx
│   │   │   │   └── TransactionList.tsx
│   │   │   └── hooks/
│   │   └── leaderboard/
│   │       ├── components/
│   │       │   ├── LeaderboardTable.tsx
│   │       │   └── RankCard.tsx
│   │       └── hooks/
│   │
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── blockchain.service.ts
│   │   └── wallet.service.ts
│   │
│   ├── stores/
│   │   ├── wallet.store.ts
│   │   ├── session.store.ts
│   │   └── ui.store.ts
│   │
│   ├── config/
│   │   ├── index.ts
│   │   ├── env.config.ts
│   │   └── blockchain.config.ts
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   └── hooks/
│       ├── useTeacherClient.ts
│       ├── useStudentClient.ts
│       ├── useQuizClient.ts
│       ├── useWallet.ts
│       └── useDebounce.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── next.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## State Management

### Wallet Store (Zustand)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  publicKey: string | null
  privateKey: string | null
  balance: bigint
  isConnected: boolean
  connect: (keys: { publicKey: string; privateKey: string }) => void
  disconnect: () => void
  updateBalance: (balance: bigint) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      publicKey: null,
      privateKey: null,
      balance: 0n,
      isConnected: false,
      connect: (keys) => set({ ...keys, isConnected: true }),
      disconnect: () => set({ publicKey: null, privateKey: null, isConnected: false }),
      updateBalance: (balance) => set({ balance }),
    }),
    { name: 'wallet-storage' }
  )
)
```

### Session Store

```typescript
interface SessionState {
  user: User | null
  role: 'TEACHER' | 'STUDENT' | null
  setUser: (user: User) => void
  clearSession: () => void
}
```

---

## Key Components

### Bitcoin Computer Components

Located in `src/components/bc/`:

- **Auth** - Login/logout with wallet
- **Wallet** - Deposit/manage cryptocurrency
- **SmartObject** - Display & interact with smart contracts
- **Transaction** - Display transaction details

### Usage Example

```typescript
import { useWallet } from '@/hooks'
import { QuizCard } from '@/features/quizzes/components'

function QuizList() {
  const { publicKey, isConnected } = useWallet()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    if (isConnected) {
      fetchQuizzes().then(setQuizzes)
    }
  }, [isConnected])

  return (
    <div className="grid grid-cols-3 gap-4">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  )
}
```

---

## Blockchain Integration

### Using SDK Clients

```typescript
import { useTeacherClient } from '@/hooks'

function CreateQuizForm() {
  const teacherClient = useTeacherClient()

  const handleCreate = async (data: CreateQuizData) => {
    try {
      const quiz = await teacherClient.createQuiz({
        title: data.title,
        questionText: data.questionText,
        options: data.options,
        correctAnswer: data.correctAnswer,
        rewardAmount: BigInt(data.rewardAmount),
        entryFee: BigInt(data.entryFee),
      })
      console.log('Quiz created:', quiz)
    } catch (error) {
      console.error('Failed to create quiz:', error)
    }
  }
}
```

### Atomic Swap for Access Token Purchase

```typescript
import { useAccessClient } from '@/hooks'

function PurchaseTokenButton({ quizId, price }: { quizId: string; price: number }) {
  const accessClient = useAccessClient()
  const { publicKey } = useWallet()

  const handlePurchase = async () => {
    const result = await accessClient.purchaseAccess({
      quizId,
      buyer: publicKey!,
      price: BigInt(price),
    })
    console.log('Token purchased:', result)
  }

  return <Button onClick={handlePurchase}>Purchase Access</Button>
}
```

---

## Styling

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

### Custom CSS Variables

```css
/* src/app/globals.css */
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run type-check` | Run TypeScript type checking |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CHAIN` | Blockchain chain | `LTC`, `BTC` |
| `NEXT_PUBLIC_NETWORK` | Network type | `regtest`, `testnet`, `mainnet` |
| `NEXT_PUBLIC_URL` | Bitcoin Computer URL | `http://localhost:1031` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` |
| `NEXT_PUBLIC_*_MOD` | Deployed contract module IDs | `<module-id>` |

---

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t quiz-app-web .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d web
```

### Manual Deployment (VPS)

```bash
# Install dependencies
npm install --production

# Build
npm run build

# Set environment variables
export NEXT_PUBLIC_CHAIN=LTC
export NEXT_PUBLIC_NETWORK=mainnet
export NEXT_PUBLIC_URL=https://bcn.your-domain.com
export NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Start with PM2 or similar
pm2 start npm --name "quiz-app-web" -- start
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name quizapp.sethna.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSL configuration (via Certbot)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/quizapp.sethna.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quizapp.sethna.me/privkey.pem;
}
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the root README.md for more information

---

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
