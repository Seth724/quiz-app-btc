# Quiz App Web

Next.js 16 frontend for the Decentralized Quiz App built on Bitcoin Computer.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible. The VPS uses **Docker Compose** with **Nginx reverse proxy** and **HTTPS/SSL** for secure connections.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router, SSR & file-based routing |
| **TypeScript** | Type-safe development |
| **TailwindCSS v4** | Utility-first CSS framework |
| **Flowbite** | UI components built on Tailwind |
| **Zustand** | Lightweight state management |
| **Bitcoin Computer 0.26** | Blockchain abstraction layer for LTC/BTC |
| **React Icons** | Icon library |

---

## Architecture

This app follows a feature-based architecture:

```
src/
  app/                    # Next.js App Router pages & layouts
    layout.tsx            # Root layout with Navigation
    page.tsx              # Home page
    providers.tsx         # Context providers (Computer, Utils)
    globals.css           # Global styles

    teacher/              # Teacher dashboard
      page.tsx            # Teacher overview
      create/             # Create quiz form
      quizzes/            # Teacher's quiz list
      notifications/      # Access request notifications

    student/              # Student dashboard
      page.tsx            # Student overview
      quizzes/            # Browse available quizzes

    wallet/               # Wallet management
    leaderboard/          # Global rankings
    gallery/              # Quiz gallery view
    objects/              # Smart object viewer
    transactions/         # Transaction history
    profile/              # User profile

  common-components/      # Shared/reusable UI components
    bc/                   # Bitcoin Computer components
      Auth.tsx            # Login/logout
      Wallet.tsx          # Wallet management
      Gallery.tsx         # Smart object grid
      SmartObject.tsx     # Single smart object display
      Transaction.tsx     # Transaction details
      Modal.tsx           # Modal dialog
    common/               # Common utilities
    layout/               # Layout components
      Navbar.tsx          # Top navigation
      Drawer.tsx          # Side drawer
    Card.tsx              # Card component
    Button.tsx            # Button component
    AppLoader.tsx         # App loading state
    Err.tsx               # Error display
    SnackBar.tsx          # Toast notifications

  features/               # Feature modules (vertical slices)
    quizzes/              # Quiz components
    attempts/             # Quiz attempt components
    payments/             # Payment components
    leaderboard/          # Leaderboard components
    wallet/               # Wallet components
    access/               # Access request components
    index.ts              # Feature exports

  stores/                 # Zustand state management
    wallet.store.ts       # Wallet state (keys, balance)
    session.store.ts      # Session state (user, role)
    index.ts              # Store exports

  config/                 # Configuration
  hooks/                  # React hooks
  services/               # API clients
  lib/                    # Utilities
  types/                  # TypeScript types
```

---

## Features

### For Teachers
- 📝 Create and manage quizzes
- 💰 Set rewards and entry fees in satoshis
- 🔐 Control quiz access via access requests
- 📊 View quiz statistics
- 💸 Withdraw accumulated entry fees
- 🔔 Receive access request notifications

### For Students
- 🔍 Browse available quizzes
- 🎟️ Request access via atomic swaps
- ✍️ Take quizzes and earn crypto rewards
- 🏆 View global leaderboard
- 💵 Withdraw earned rewards
- 📊 View attempt history

### Wallet Features
- 🔑 Generate/import wallet keys
- 💰 View balance (on-chain)
- 📤 Deposit/withdraw cryptocurrency
- 📜 View transaction history
- 🔐 Secure key management (localStorage)

---

## Development

### Prerequisites

- Node.js 20+
- npm 10+
- Running API server (see `apps/api/README.md`)
- Bitcoin Computer instance (see root `README.md`)

### Installation

```bash
npm install
```

### Environment Setup

1. Copy environment template:
   ```bash
   cp .env.web.template .env.web
   ```

2. Configure environment variables:
   ```env
   # Blockchain Configuration
   NEXT_PUBLIC_URL=http://localhost:1031

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3002/api

   # Contract Module Specifications (after deployment)
   NEXT_PUBLIC_TEACHER_MOD_SPEC=<module-spec>
   NEXT_PUBLIC_STUDENT_MOD_SPEC=<module-spec>
   NEXT_PUBLIC_QUIZ_MOD_SPEC=<module-spec>
   NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=<module-spec>
   NEXT_PUBLIC_PAYMENT_MOD_SPEC=<module-spec>
   NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=<module-spec>
   NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=<module-spec>
   ```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## State Management

### Wallet Store (Zustand)

```typescript
// stores/wallet.store.ts
import { create } from 'zustand'

interface WalletState {
  publicKey: string | null
  privateKey: string | null
  balance: bigint
  isConnected: boolean
  connect: (keys: { publicKey: string; privateKey: string }) => void
  disconnect: () => void
  updateBalance: (balance: bigint) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  privateKey: null,
  balance: 0n,
  isConnected: false,
  connect: (keys) => set({ ...keys, isConnected: true }),
  disconnect: () => set({ publicKey: null, privateKey: null, isConnected: false }),
  updateBalance: (balance) => set({ balance }),
}))
```

### Session Store

```typescript
// stores/session.store.ts
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

Located in `src/common-components/bc/`:

- **Auth** - Login/logout with wallet connection
- **Wallet** - Deposit/manage cryptocurrency balance
- **Gallery** - Display grid of smart objects (quizzes)
- **SmartObject** - Display & interact with individual smart contracts
- **Transaction** - Display transaction details with BCN expression
- **Modal** - Reusable modal dialog

### Usage Example

```typescript
import { useWalletStore } from '@/stores'
import { Gallery } from '@/common-components/bc'

function QuizList() {
  const { publicKey, isConnected } = useWalletStore()
  const [quizzes, setQuizzes] = useState<string[]>([])

  useEffect(() => {
    if (isConnected) {
      fetchQuizzes().then(setQuizzes)
    }
  }, [isConnected])

  return (
    <div className="grid grid-cols-3 gap-4">
      {quizzes.map((quizId) => (
        <Gallery key={quizId} moduleIds={[quizId]} />
      ))}
    </div>
  )
}
```

---

## Blockchain Integration

### Using Smart Contracts

```typescript
import { Teacher } from '@quiz-app/contracts'
import { useComputer } from '@/common-components/bc'

function CreateQuizForm() {
  const computer = useComputer()
  const teacherModSpec = process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC

  const handleCreate = async (data: CreateQuizData) => {
    try {
      const teacher = new Teacher(computer, teacherModSpec)
      const quiz = await teacher.create({
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

### Access Request Flow

```typescript
import { QuizAccess } from '@quiz-app/contracts'

async function requestQuizAccess(quizId: string, entryFee: bigint) {
  const computer = useComputer()
  const accessModSpec = process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC
  
  const access = new QuizAccess(computer, accessModSpec)
  
  // Student requests access from teacher
  // Teacher approves via notifications page
  // Atomic swap completes the transaction
}
```

---

## Styling

### TailwindCSS v4 Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/common-components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}
```

### Global Styles

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
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
  font-family: var(--font-geist-sans), Arial, sans-serif;
}
```

---

## Pages Structure

### Teacher Pages

| Route | Description |
|-------|-------------|
| `/teacher` | Teacher dashboard with overview |
| `/teacher/create` | Create new quiz form |
| `/teacher/quizzes` | List of teacher's quizzes |
| `/teacher/notifications` | Access request notifications |

### Student Pages

| Route | Description |
|-------|-------------|
| `/student` | Student dashboard |
| `/student/quizzes` | Browse available quizzes |

### Other Pages

| Route | Description |
|-------|-------------|
| `/wallet` | Wallet management (deposit, withdraw, balance) |
| `/leaderboard` | Global student rankings |
| `/gallery` | Grid view of all quizzes |
| `/objects/:id` | Individual smart object viewer |
| `/transactions` | Transaction history |
| `/profile` | User profile & settings |

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Next.js dev) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_URL` | Bitcoin Computer URL | `http://localhost:1031` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3002/api` |
| `NEXT_PUBLIC_*_MOD_SPEC` | Deployed contract module specs | `<module-spec>` |

---

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t quiz-app-web .

# Run with Docker Compose
docker compose -f docker-compose.prod.yml up -d quiz-web
```

### Manual Deployment (VPS)

```bash
# Install dependencies
npm install --production

# Load environment variables (CRITICAL: NEXT_PUBLIC vars baked at build time)
set -a && source .env.web && set +a

# Build
npm run build

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
