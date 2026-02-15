# @quiz-app/shared

Shared types, constants, and utilities used across Quiz App packages.

## Purpose

This package contains:
- Common TypeScript types and interfaces
- Shared constants
- Validation schemas
- Utility functions

## Structure

```
src/
  types/
    quiz.types.ts
    user.types.ts
    payment.types.ts
  constants/
    config.ts
    blockchain.ts
  utils/
    format.ts
    validation.ts
  index.ts
```

## Usage

```typescript
import { QuizStatus, SATOSHIS_PER_BTC } from '@quiz-app/shared'
```
