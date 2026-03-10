# Bitcoin Computer Components

Reusable React components for building smart contract-driven applications with Bitcoin Computer.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

---

## Overview

This package contains pre-built React components that simplify building decentralized applications (dApps) on Bitcoin Computer. These components handle common blockchain interactions like wallet connection, smart object display, and transaction viewing.

## Components

### Auth

Login and logout functionality with wallet connection.

**File:** `Auth.tsx`

```typescript
import { Auth } from '@/common-components/bc'

function Header() {
  return <Auth />
}
```

**Features:**
- Generate new wallet or import existing
- Display connected public key
- Handle login/logout state

---

### Wallet

Deposit, manage, and display cryptocurrency balance.

**File:** `Wallet.tsx`

```typescript
import { Wallet } from '@/common-components/bc'

function Dashboard() {
  return <Wallet />
}
```

**Features:**
- Display balance (LTC/BTC)
- Deposit address display
- Withdraw functionality
- Transaction history

---

### Gallery

Displays a grid of smart objects (quizzes, tokens, etc.).

**File:** `Gallery.tsx`

```typescript
import { Gallery } from '@/common-components/bc'

function QuizList({ quizIds }: { quizIds: string[] }) {
  return <Gallery moduleIds={quizIds} />
}
```

**Features:**
- Grid layout of smart objects
- Click to view details
- Automatic data fetching

---

### SmartObject

Displays a smart object and provides forms for its methods.

**File:** `SmartObject.tsx`

```typescript
import { SmartObject } from '@/common-components/bc'

function QuizDetail({ moduleId }: { moduleId: string }) {
  return <SmartObject moduleId={moduleId} />
}
```

**Features:**
- Display smart object properties
- Interactive method forms
- Real-time state updates

---

### SmartObjectFunction

Renders a single method form for a smart object.

**File:** `SmartObjectFunction.tsx`

```typescript
import { SmartObjectFunction } from '@/common-components/bc'

function CreateQuizButton() {
  return (
    <SmartObjectFunction
      moduleId={teacherModSpec}
      functionName="create"
      buttonText="Create Quiz"
    />
  )
}
```

---

### Transaction

Displays a transaction including its Bitcoin Computer expression.

**File:** `Transaction.tsx`

```typescript
import { Transaction } from '@/common-components/bc'

function TransactionHistory({ txId }: { txId: string }) {
  return <Transaction txId={txId} />
}
```

**Features:**
- Transaction details
- BCN expression display
- Input/output breakdown

---

### Modal

Reusable modal dialog component.

**File:** `Modal.tsx`

```typescript
import { Modal } from '@/common-components/bc'

function ConfirmDialog({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Confirm Action</h2>
      <p>Are you sure?</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onClose}>No</button>
    </Modal>
  )
}
```

---

### Drawer

Side drawer component for navigation.

**File:** `Drawer.tsx`

```typescript
import { Drawer } from '@/common-components/bc'

function MobileNav() {
  return <Drawer isOpen={isOpen} onClose={setIsOpen} />
}
```

---

### Additional UI Components

| Component | File | Purpose |
|-----------|------|---------|
| **Button** | `Button.tsx` | Styled button component |
| **Card** | `Card.tsx` | Card container |
| **AppLoader** | `AppLoader.tsx` | App loading state |
| **Loader** | `Loader.tsx` | Generic loader |
| **Err** | `Err.tsx` | Error display |
| **Error404** | `Error404.tsx` | 404 page |
| **SnackBar** | `SnackBar.tsx` | Toast notifications |
| **Missing** | `Missing.tsx` | Missing state |

---

## Layout Components

### Navbar

Top navigation bar.

**File:** `layout/Navbar.tsx`

```typescript
import { Navigation } from '@/common-components/layout'

function App() {
  return (
    <>
      <Navigation />
      <main>{children}</main>
    </>
  )
}
```

---

## Usage in Quiz App

### App Layout

```typescript
// apps/web/src/app/layout.tsx
import { Navigation } from '@/common-components/layout'
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Quiz Gallery

```typescript
// apps/web/src/app/gallery/page.tsx
import { Gallery } from '@/common-components/bc'

export default function GalleryPage() {
  const [quizIds, setQuizIds] = useState<string[]>([])

  return (
    <div className="container mx-auto p-4">
      <h1>Quiz Gallery</h1>
      <Gallery moduleIds={quizIds} />
    </div>
  )
}
```

### Wallet Page

```typescript
// apps/web/src/app/wallet/page.tsx
import { Wallet } from '@/common-components/bc'

export default function WalletPage() {
  return (
    <div className="container mx-auto p-4">
      <h1>Wallet</h1>
      <Wallet />
    </div>
  )
}
```

### Transaction History

```typescript
// apps/web/src/app/transactions/page.tsx
import { Transaction } from '@/common-components/bc'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<string[]>([])

  return (
    <div className="container mx-auto p-4">
      <h1>Transactions</h1>
      {transactions.map((txId) => (
        <Transaction key={txId} txId={txId} />
      ))}
    </div>
  )
}
```

---

## Context Providers

### ComputerContext

Provides Bitcoin Computer instance to all components.

**File:** `ComputerContext.tsx`

```typescript
// apps/web/src/app/providers.tsx
'use client'

import { ComputerProvider } from '@/common-components/bc'

export function Providers({ children }) {
  return (
    <ComputerProvider>
      {children}
    </ComputerProvider>
  )
}
```

### UtilsContext

Provides utility functions.

**File:** `UtilsContext.tsx`

```typescript
import { useContext } from 'react'
import { UtilsContext } from '@/common-components/bc'

function MyComponent() {
  const { formatSats, shortenAddress } = useContext(UtilsContext)

  return <div>{formatSats(10000n)}</div>
}
```

---

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Dependencies

- `react` >= 19.0.0
- `next` >= 16.0.10
- `@bitcoin-computer/lib` - Bitcoin Computer SDK
- `zustand` - State management
- `flowbite` - UI components

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Examples

See the Quiz App for complete usage examples:
- [Quiz App Repository](https://github.com/Seth724/quiz-app-btc)
- [Live Demo](https://quizapp.sethna.me/)

---

## License

This software is licensed under the MIT License. See the [LICENSE](../../../LICENSE) file.
