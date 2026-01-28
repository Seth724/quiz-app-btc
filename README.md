# Quiz App Monorepo

A decentralized quiz application built on Bitcoin Computer, featuring a complete frontend and smart contract infrastructure.

## Overview

This monorepo contains:
- **Frontend** (`packages/quiz-app`) - Next.js application for teachers and students
- **Contracts** (`packages/quiz-contracts`) - Smart contracts and business logic

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in both packages:
   ```bash
   cp packages/quiz-app/.env.example packages/quiz-app/.env.local
   cp packages/quiz-contracts/.env.example packages/quiz-contracts/.env
   ```

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

### Testing

Run all tests:
```bash
npm test
```

Run only contract tests:
```bash
npm run test --workspace=@quiz-app/contracts
```

### Building

Build all packages:
```bash
npm run build
```

### Deployment

Deploy contracts:
```bash
npm run deploy
```

## Architecture

### Frontend (`@quiz-app/frontend`)
- Built with Next.js 14+ and React 19
- Tailwind CSS for styling
- Bitcoin Computer integration for wallet and transactions
- Teacher and student interfaces

### Contracts (`@quiz-app/contracts`)
- TypeScript smart contracts
- Comprehensive test suite
- Payment processing
- Quiz and attempt management

## Features

### For Teachers
- Create and manage quizzes
- Set pricing and access controls
- Monitor student progress
- Receive payments

### For Students
- Browse available quizzes
- Pay for quiz access
- Take quizzes with real-time feedback
- View results and progress

## Folder Structure

```
QuizApp/
├── packages/
│   ├── quiz-app/          # Frontend Next.js application
│   │   ├── src/app/       # App router pages and components
│   │   ├── public/        # Static assets
│   │   └── ...
│   └── quiz-contracts/    # Smart contracts and tests
│       ├── src/           # Contract source code
│       ├── test/          # Test files
│       ├── scripts/       # Deployment scripts
│       └── ...
├── package.json           # Root package configuration
├── turbo.json            # Turborepo configuration
└── tsconfig.json         # TypeScript configuration
```

## Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build all packages
- `npm test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run deploy` - Deploy contracts
- `npm run clean` - Clean node_modules

## License

This project is licensed under the MIT License.