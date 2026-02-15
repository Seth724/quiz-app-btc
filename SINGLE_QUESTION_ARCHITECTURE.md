# Single Question Quiz Architecture

## Overview

This document explains the **single-question quiz architecture** implemented in the QuizApp. Each quiz contains **exactly ONE question** with **4 options**, and students compete to be the **first to answer correctly** and claim the full reward.

## Core Concepts

### 1. Quiz Structure
- **One Quiz = One Question**
- Each quiz has exactly 4 options (enforced by contracts)
- One correct answer (index 0-3)
- One Payment object with reward pool
- First correct answer wins the entire reward

### 2. Winner-Takes-All Model
```
Quiz Created → Students Buy Access → Students Attempt
    ↓               ↓                        ↓
Payment Object  QuizAccess Tokens      Burn 1 Token/Attempt
    ↓                                        ↓
First Correct Answer → Payment Transferred → Winner Withdraws
```

### 3. Flow Diagram
```
Teacher: Create Quiz + Payment Object (reward pool)
    ↓
Teacher: Create QuizAccessSale for students to buy access
    ↓
Student: Buy QuizAccess token (pay entry fee)
    ↓
Student: Attempt quiz (submits ONE answer, burns 1 access token)
    ↓
If Correct (First Winner):
    - Payment object transferred to student
    - Quiz marked as claimed
    - Student can withdraw satoshis
    ↓
If Incorrect:
    - No reward
    - Cannot retry (access burned)
```

## Contract Details

### Quiz Contract (`quiz.ts`)
```typescript
class Quiz {
  questionText!: string      // ONE question
  options!: string[]         // Exactly 4 options
  correctAnswer!: number     // Index 0-3
  paymentTxId!: string       // Reference to Payment object
  isClaimed!: boolean        // Has reward been claimed?
  claimedBy!: string         // Winner's public key
  attemptedStudents!: string[] // Who attempted
  isActive!: boolean         // Can be attempted?
}
```

### QuizAttempt Contract (`attempt.ts`)
```typescript
class QuizAttempt {
  quizId!: string
  studentPublicKey!: string
  selectedAnswer!: number    // Single answer (0-3)
  isCorrect!: boolean        // Win or lose
  rewardEarned!: bigint      // Full reward if correct, 0 if incorrect
  submittedAt!: number
  
  // Burns 1 QuizAccess token on submission
  async submitAnswer(
    access: QuizAccess,
    selectedAnswer: number,
    correctAnswer: number,
    rewardAmount: bigint
  ): Promise<void>
}
```

### Payment Contract (`payment.ts`)
```typescript
class Payment {
  amount!: bigint           // Satoshis
  createdBy!: string        // Teacher
  ownerId!: string          // Current owner
  
  transfer(to: string): Payment  // Transfer to winner
  async withdraw(): Promise<void> // Convert to satoshis
}
```

### QuizAccess Contract (`quiz-access.ts`)
```typescript
class QuizAccess {
  balance!: number          // Fungible token amount
  quizId!: string
  
  burn(amount: number): void     // Burn on attempt
  transfer(to: string, amount: number): QuizAccess
  merge(tokens: QuizAccess[]): QuizAccess
}
```

## UI Components Updated

### 1. QuizForm.tsx (`features/quizzes/components/`)
**BEFORE:** Multiple questions with Add/Remove buttons
```tsx
questions: [
  { question: '', options: ['', '', '', ''], correctAnswer: 0 },
  { question: '', options: ['', '', '', ''], correctAnswer: 0 },
  // ... more questions
]
```

**AFTER:** Single question form
```tsx
questionText: string        // ONE question text
options: [string, string, string, string]  // Exactly 4
correctAnswer: number       // 0-3
```

**UI Changes:**
- Removed "Add Question" button
- Removed question navigation (Previous/Next)
- Single question input field
- Exactly 4 option inputs
- Radio buttons to select correct answer
- Info text: "Each quiz contains exactly ONE question with 4 options"

### 2. QuizCard.tsx (`features/quizzes/components/`)
**BEFORE:** Showed question count
```tsx
<span>{quiz.questions.length} questions</span>
```

**AFTER:** Shows single question with status
```tsx
<span>4 options</span>
<span>{quiz.attemptCount || 0} attempts</span>
{quiz.isClaimed && <Badge>Claimed</Badge>}
{quiz.isActive && !quiz.isClaimed && <Badge>Available</Badge>}
```

### 3. AttemptForm.tsx (`features/attempts/components/`)
**BEFORE:** Question navigation with progress bar
```tsx
<ProgressBar current={currentQuestion} total={questions.length} />
<Question {...questions[currentQuestion]} />
<Button onClick={handleNext}>Next</Button>
<Button onClick={handlePrevious}>Previous</Button>
```

**AFTER:** Single question with immediate submit
```tsx
<InfoBanner>
  Winner takes all! First correct answer wins full reward.
</InfoBanner>
<Question text={quiz.questionText} options={quiz.options} />
<Button onClick={handleSubmit}>Submit Answer</Button>
<Warning>
  Once submitted, you cannot change your answer.
  Your QuizAccess token will be consumed.
</Warning>
```

**UI Changes:**
- No question navigation
- No progress bar
- Show all 4 options at once
- Single Submit button
- Clear warning about token burning
- Display full reward amount

### 4. ResultPanel.tsx (`features/attempts/components/`)
**BEFORE:** Score percentage, multiple question review
```tsx
Score: {percentage}%
You got {correctCount} out of {total} correct
Reward: {score * rewardPerQuestion}
```

**AFTER:** Correct/Incorrect with full reward
```tsx
{isCorrect ? "🎉 Correct!" : "😔 Incorrect"}
Reward Earned: {attempt.rewardEarned} satoshis
{hasReward && <WithdrawButton />}

Question Review:
- Your answer: {options[selectedAnswer]}
- Correct answer: {options[correctAnswer]}
```

**UI Changes:**
- Simple correct/incorrect display (no percentage)
- Full reward or zero (no partial rewards)
- Withdraw button if won
- Single question review (not list)
- Winner status display

## Service Layer Updates

### quizzes.service.ts
```typescript
// NEW interfaces
export interface Quiz {
  questionText: string       // Changed from questions: Question[]
  options: string[]          // Always length 4
  correctAnswer: number      // 0-3
  rewardAmount: bigint       // Full reward
  isClaimed: boolean         // Winner status
  claimedBy: string          // Winner's public key
}

export interface CreateQuizParams {
  title: string
  description?: string
  questionText: string       // Single question
  options: string[]          // Must be exactly 4
  correctAnswer: number      // 0-3
  rewardAmount: number       // In satoshis
  entryFee: number           // In satoshis
}

// NEW validation
export async function createQuiz(params) {
  if (params.options.length !== 4) {
    throw new Error('Must have exactly 4 options')
  }
  if (params.correctAnswer < 0 || params.correctAnswer > 3) {
    throw new Error('Correct answer must be 0-3')
  }
  // Create Payment → Create Quiz → Create QuizAccessSale
}

// NEW functions
export async function deactivateQuiz(quizClient, quizId)
export async function canAttemptQuiz(quizClient, quizId, studentPubKey)
```

### attempts.service.ts
```typescript
// NEW interfaces
export interface Attempt {
  quizId: string
  studentPublicKey: string
  selectedAnswer: number     // Changed from answers: number[]
  isCorrect: boolean         // Changed from score: number
  rewardEarned: bigint       // Full reward or 0
  submittedAt: number
}

export interface SubmitAttemptParams {
  quizId: string
  selectedAnswer: number     // Single answer (0-3)
  accessTokenId: string      // QuizAccess token to burn
}

// NEW submit logic
export async function submitAttempt(params) {
  // Burn access token
  // Submit single answer
  // If correct: transfer Payment
  // Return attempt with isCorrect and rewardEarned
}

// REMOVED functions
// - calculateScore() - no longer needed
// - getQuestionMatches() - single question only
```

## Key Differences Summary

| Aspect | OLD (Multi-Question) | NEW (Single Question) |
|--------|---------------------|----------------------|
| Questions per Quiz | Many (array) | ONE (string) |
| Options per Question | 2-6 (variable) | Exactly 4 (enforced) |
| Scoring | Percentage (0-100%) | Boolean (correct/incorrect) |
| Reward Distribution | Per question | Winner-takes-all |
| Attempts | Can review multiple | Single answer submission |
| UI Navigation | Previous/Next buttons | No navigation needed |
| Progress Display | Progress bar | Not applicable |
| Result Display | Score percentage | Win/Lose + Reward |
| Partial Rewards | Yes (per question) | No (full or nothing) |
| Access Control | One token = full quiz | One token = one attempt |

## Implementation Notes

### Validation Rules
1. **Quiz Creation:**
   - Must have exactly 4 options
   - Correct answer must be 0-3
   - All options must be non-empty
   - Reward amount must be > 0
   - Entry fee must be ≥ 0

2. **Quiz Attempt:**
   - Student must own valid QuizAccess token
   - Quiz must be active (`isActive === true`)
   - Quiz must not be claimed (`isClaimed === false`)
   - Student cannot have attempted before
   - Selected answer must be 0-3

3. **Reward Claiming:**
   - Only first correct answer wins
   - Payment object transferred to winner
   - Quiz marked as claimed immediately
   - No further attempts allowed once claimed

### State Management
- **Quiz State:** active → (claimed/deactivated)
- **Attempt State:** pending → submitted → (won/lost)
- **Payment State:** created → transferred → withdrawn
- **Access Token State:** purchased → burned (on attempt)

### UI States
1. **Quiz Not Attempted:**
   - Show quiz details
   - Display entry fee
   - Show "Buy Access" button
   - Display question text and options

2. **Access Purchased:**
   - Show "Attempt Quiz" button
   - Display warning about token burn
   - Show current reward amount

3. **Quiz Attempted:**
   - Show result (correct/incorrect)
   - Display reward earned
   - Show correct answer if wrong
   - Show "Withdraw" button if won

4. **Quiz Claimed:**
   - Show "Already Claimed" badge
   - Display winner's address
   - Disable attempt button
   - Show question for reference

## Testing Scenarios

### Happy Path
1. Teacher creates quiz with 1 question, 4 options, 10,000 sat reward
2. Student buys QuizAccess for 1,000 sat
3. Student views quiz (sees single question)
4. Student selects correct option and submits
5. System burns access token
6. System transfers Payment to student
7. Student withdraws 10,000 sat
8. Quiz marked as claimed

### Edge Cases
1. **Second Student Attempts (After Winner):**
   - Quiz already claimed
   - Attempt button disabled
   - Shows "Already Claimed" message

2. **Student Answers Incorrectly:**
   - Access token burned (cannot retry)
   - No Payment transferred
   - Shows correct answer
   - Reward = 0

3. **Multiple Students Race:**
   - First correct submission wins
   - Blockchain ensures atomic claiming
   - Losers see "Already Claimed"

## Migration from Old Code

If you have existing multi-question quiz data:

```typescript
// OLD format
const oldQuiz = {
  questions: [
    { question: "Q1?", options: ["A", "B", "C", "D"], correctAnswer: 0 },
    { question: "Q2?", options: ["A", "B", "C", "D"], correctAnswer: 1 },
  ],
  rewardPerQuestion: 1000
}

// NEW format (split into 2 quizzes)
const newQuiz1 = {
  questionText: "Q1?",
  options: ["A", "B", "C", "D"],
  correctAnswer: 0,
  rewardAmount: 1000
}

const newQuiz2 = {
  questionText: "Q2?",
  options: ["A", "B", "C", "D"],
  correctAnswer: 1,
  rewardAmount: 1000
}
```

## FAQ

**Q: Why one question per quiz?**
A: This matches the smart contract architecture and creates a competitive, engaging experience where students race to be first.

**Q: Can I add multiple questions later?**
A: No, the contract enforces single-question structure. To have multiple questions, create multiple quizzes.

**Q: What if no one answers correctly?**
A: The reward remains locked in the Payment object. The teacher can deactivate the quiz and potentially recover funds (check contract implementation).

**Q: Can a student retry after wrong answer?**
A: No, the QuizAccess token is burned on submission. They would need to buy a new access token if the quiz is still active and unclaimed.

**Q: What happens to entry fees?**
A: Entry fees are collected by the teacher through QuizAccessSale atomic swaps.

---

## Contract References
- Quiz: `packages/quiz-contracts/src/quiz.ts`
- Attempt: `packages/quiz-contracts/src/attempt.ts`
- Payment: `packages/quiz-contracts/src/payment.ts`
- QuizAccess: `packages/quiz-contracts/src/quiz-access.ts`
- QuizAccessSale: `packages/quiz-contracts/src/quiz-access-sale.ts`

## Updated Files
- `apps/web/src/features/quizzes/quizzes.service.ts`
- `apps/web/src/features/quizzes/components/QuizForm.tsx`
- `apps/web/src/features/quizzes/components/QuizCard.tsx`
- `apps/web/src/features/attempts/attempts.service.ts`
- `apps/web/src/features/attempts/components/AttemptForm.tsx`
- `apps/web/src/features/attempts/components/ResultPanel.tsx`
