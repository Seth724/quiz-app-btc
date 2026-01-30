# Quiz Application Test Workflow Documentation

## Overview
This document explains the comprehensive test workflow implemented in the `comprehensive-flow-new.test.ts` file, which demonstrates the complete lifecycle of a quiz application using Bitcoin Computer smart contracts.

## Test Setup

### Environment Configuration
- **Chain**: LTC (Litecoin) - configurable via NEXT_PUBLIC_CHAIN
- **Network**: Regtest - configurable via NEXT_PUBLIC_NETWORK  
- **URL**: http://localhost:1031 - configurable via NEXT_PUBLIC_URL
- **Wallet Path**: m/44'/0'/0'/0 - configurable via NEXT_PUBLIC_PATH

### Participant Setup
The test creates three separate participants with isolated Bitcoin Computer instances:

1. **Teacher Computer** - Path: `/100`
   - Creates quizzes and deploys payment modules
   - Funds quiz rewards

2. **Student 1 Computer** - Path: `/101` 
   - Attempts quizzes and earns rewards
   - Competes for question rewards

3. **Student 2 Computer** - Path: `/102`
   - Attempts quizzes and earns rewards
   - Competes for question rewards

### Initial Funding
- Teacher receives 2 BTC (2e8 satoshis)
- Each student receives 1 BTC (1e8 satoshis)
- Faucet funding occurs in regtest mode

## Core Components

### 1. Teacher Contract
```typescript
class Teacher extends Contract {
  name: string
  publicKey: string
  createdQuizzes: string[]
  registeredAt: number
}
```

### 2. Student Contract  
```typescript
class Student extends Contract {
  name: string
  publicKey: string
  completedQuizzes: string[]
  totalEarnings: bigint
  registeredAt: number
}
```

### 3. Quiz Contract
```typescript
class Quiz extends Contract {
  title: string
  description: string
  questionTexts: string[]
  questionOptions: string[][]
  correctAnswers: number[]
  rewardPerCorrect: bigint
  totalReward: bigint
  teacherPublicKey: string
  isActive: boolean
  createdAt: number
  attemptedStudents: string[]
  attempts: string[]
  paymentTxIds: string[]           // Array of payment IDs for each question
  questionRewardsClaimed: boolean[] // Track which questions have been claimed
}
```

### 4. Payment Contract
```typescript
class Payment extends Contract {
  _satoshis: bigint    // Amount in satoshis
  _owners: string[]   // Current owners of the payment
}
```

### 5. QuizAttempt Contract
```typescript
class QuizAttempt extends Contract {
  quizId: string
  studentPublicKey: string
  answers: number[]
  score: number
  rewardEarned: bigint
  isCompleted: boolean
  questionRewardsClaimed: boolean[]
}
```

## Main Test Workflow

### Step 1: Quiz Creation with Individual Payments
```typescript
const { quiz, paymentTxIds } = await quizHelper.createQuizWithPayments({
  title: 'Mathematics Competition',
  description: 'First correct answer wins!',
  questions: sampleQuestions,      // 2 sample questions
  rewardPerCorrect: 1000n,         // 1000 satoshis per correct answer
  teacherPublicKey: teacher.publicKey,
  duration: 30,
  teacher: teacher
})
```

**Process:**
1. Creates 2 individual Payment contracts (one for each question)
2. Each payment holds 1000 satoshis
3. Links payment IDs to quiz's `paymentTxIds` array
4. Initializes `questionRewardsClaimed` as `[false, false]`

### Step 2: Student 1 Attempts Quiz
```typescript
const student1Result = await student1Helper.completeQuizWithPayment({
  quiz: quiz,
  student: student1,
  answers: [1, 0]  // Q1 correct, Q2 wrong
})
```

**Process:**
1. Student 1 submits answers `[1, 0]` (first correct, second wrong)
2. System grades: score = 1, rewardEarned = 1000n
3. For Q1 (correct answer):
   - Calls `quiz.claimQuestionReward(0, student1.publicKey)`
   - Marks `questionRewardsClaimed[0] = true`
   - Transfers payment[0] (1000 satoshis) to student1
4. For Q2 (wrong answer):
   - No reward claimed
5. Adds student1 to quiz's `attemptedStudents` array

**Result:**
- Student 1: score 1, reward 1000 satoshis, owns payment for Q1
- Quiz: `questionRewardsClaimed = [true, false]`

### Step 3: Student 2 Attempts Quiz
```typescript
const student2Result = await student2Helper.completeQuizWithPayment({
  quiz: quiz,
  student: student2,
  answers: [1, 2]  // Both correct
})
```

**Process:**
1. Student 2 submits answers `[1, 2]` (both correct)
2. System grades: score = 2, but reward calculation differs due to competition
3. For Q1 (correct answer):
   - Calls `quiz.claimQuestionReward(0, student2.publicKey)`
   - Returns `false` (already claimed by student1)
   - No payment transfer occurs
4. For Q2 (correct answer):
   - Calls `quiz.claimQuestionReward(1, student2.publicKey)`  
   - Returns `true` (not yet claimed)
   - Marks `questionRewardsClaimed[1] = true`
   - Transfers payment[1] (1000 satoshis) to student2

**Result:**
- Student 2: score 2, reward 1000 satoshis, owns payment for Q2 only
- Quiz: `questionRewardsClaimed = [true, true]`

### Step 4: Verification and Restrictions
- Verifies both students are in `quiz.attemptedStudents`
- Verifies question rewards are properly marked as claimed
- Verifies student 1 cannot attempt quiz again (one-attempt restriction)
- Confirms payment ownership transfers worked correctly

## Payment Distribution Logic

### "First-Correct-Answer-Wins" Model
- Each question has its own payment contract
- Only the first student to answer correctly gets that question's reward
- Subsequent correct answers on the same question earn no reward
- Students can still achieve high scores but earn fewer rewards in competitive scenarios

### Ownership Transfer Process
1. Teacher initially owns all payment contracts
2. When a student claims a reward:
   - Payment contract's `_owners` array updates to student's public key
   - Student gains control of the satoshis in that payment
3. Payment remains with student permanently

## Key Features Tested

### 1. Quiz Creation
- Proper initialization of all quiz properties
- Correct payment contract creation for each question
- Accurate reward calculations

### 2. Competitive Rewards
- Multiple students competing for same rewards
- First-come-first-served reward claiming
- Accurate reward distribution based on timing

### 3. Attempt Restrictions
- One attempt per student per quiz
- Prevention of duplicate attempts
- Proper tracking of attempted students

### 4. Payment Handling
- Secure payment creation and ownership
- Safe transfer of funds to students
- Prevention of double-spending

### 5. State Management
- Accurate tracking of claimed rewards
- Proper quiz state maintenance
- Consistent student records

## Error Handling

### Attempt Validation
- Checks if student has already attempted quiz
- Throws error if duplicate attempt detected
- Maintains integrity of one-attempt rule

### Reward Claiming
- Validates question index bounds
- Prevents claiming already-claimed rewards
- Ensures only correct answers can claim rewards

## Conclusion

This comprehensive test workflow validates a sophisticated quiz system where:
- Teachers can create incentivized quizzes with cryptocurrency rewards
- Students compete for rewards on a first-come-first-served basis
- Blockchain technology ensures secure, transparent reward distribution
- Smart contracts handle complex business logic automatically
- Payment ownership transfers are secure and immutable

The system demonstrates advanced Bitcoin Computer capabilities for creating decentralized applications with financial incentives.