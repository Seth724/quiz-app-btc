<div align="center">
  <h1>Bitcoin Computer Components</h1>
  <p>
    A component library for smart contract driven applications
    <br />
    <a href="http://bitcoincomputer.io/">website</a> · <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

---

## Overview

This package contains reusable React components built on top of the Bitcoin Computer SDK. These components simplify building decentralized applications (dApps) by providing pre-built UI elements for common blockchain interactions.

## Installation

```bash
npm install @bitcoin-computer/components
```

## Components

### Auth

Login and logout functionality with wallet connection.

```typescript
import { Auth } from '@/common-components/bc'

function MyApp() {
  return <Auth onLogin={(keys) => console.log('Logged in:', keys)} />
}
```

**Props:**
- `onLogin` - Callback when user logs in (receives keys)
- `onLogout` - Callback when user logs out
- `className` - Custom CSS class

---

### Wallet

Deposit, manage, and display cryptocurrency balance.

```typescript
import { Wallet } from '@/common-components/bc'

function Dashboard() {
  return <Wallet publicKey={publicKey} />
}
```

**Props:**
- `publicKey` - User's public key
- `onDeposit` - Callback when deposit occurs
- `onWithdraw` - Callback when withdrawal occurs
- `showBalance` - Toggle balance visibility

---

### Gallery

Displays a grid of smart objects (quizzes, tokens, etc.).

```typescript
import { Gallery } from '@/common-components/bc'

function QuizGallery() {
  return <Gallery moduleIds={quizModuleIds} />
}
```

**Props:**
- `moduleIds` - Array of module IDs to display
- `gridCols` - Number of columns (default: 3)
- `onSelect` - Callback when item is selected

---

### SmartObject

Displays a smart object and provides a form for each of its methods.

```typescript
import { SmartObject } from '@/common-components/bc'

function QuizDetail({ moduleId }) {
  return <SmartObject moduleId={moduleId} />
}
```

**Props:**
- `moduleId` - The module ID to display
- `showMethods` - Toggle method forms visibility
- `onMethodCall` - Callback when method is called

---

### Transaction

Displays a transaction including its Bitcoin Computer expression.

```typescript
import { Transaction } from '@/common-components/bc'

function TransactionHistory() {
  return <Transaction txId={transactionId} />
}
```

**Props:**
- `txId` - Transaction ID to display
- `showDetails` - Toggle detailed view
- `showExpression` - Toggle Bitcoin Computer expression

---

### Modal

Reusable modal window component.

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

**Props:**
- `isOpen` - Control modal visibility
- `onClose` - Callback when modal is closed
- `title` - Modal title
- `children` - Modal content

---

## Usage in Quiz App

These components are used throughout the Quiz App for blockchain interactions:

```typescript
// src/app/layout.tsx
import { Auth, Wallet } from '@/common-components/bc'

function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header>
          <Auth />
          <Wallet showBalance />
        </Header>
        {children}
      </body>
    </html>
  )
}

// src/features/quizzes/components/QuizList.tsx
import { Gallery } from '@/common-components/bc'

function QuizList({ quizIds }) {
  return <Gallery moduleIds={quizIds} gridCols={4} />
}

// src/features/quizzes/components/QuizDetail.tsx
import { SmartObject, Transaction } from '@/common-components/bc'

function QuizDetail({ moduleId, txId }) {
  return (
    <div>
      <SmartObject moduleId={moduleId} />
      <Transaction txId={txId} showDetails />
    </div>
  )
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

### Type Check

```bash
npm run types
```

---

## Dependencies

- `react` >= 18.0.0
- `@bitcoin-computer/core` - Bitcoin Computer SDK
- `zustand` - State management (optional)

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

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

> **Note:** This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.

---

## Contributing

Contributions are welcome! Please see the main repository for contribution guidelines.
