# @quiz-app/sdk

Clean SDK wrapper around quiz-contracts for use in frontend and backend.

## Purpose

This package provides a simple, typed API for interacting with Quiz App contracts without exposing blockchain complexity to UI layers.

## Structure

```
src/
  computer/
    createComputer.ts     # Factory for Computer instances
    types.ts              # Chain/Network config types
  clients/
    quizClient.ts         # Quiz operations
    accessClient.ts       # Access token operations
    paymentClient.ts      # Payment operations
    attemptClient.ts      # Quiz attempt operations
  index.ts                # Public exports
```

## Usage

```typescript
import { createComputer, QuizClient } from '@quiz-app/sdk'

const computer = createComputer(config)
const quizClient = new QuizClient(computer)

const quiz = await quizClient.getQuiz(quizId)
```
