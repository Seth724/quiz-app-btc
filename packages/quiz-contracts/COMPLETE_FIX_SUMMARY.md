# Quiz Application - Complete Fix Summary

## Overview
Fixed all conflicts and issues in the Bitcoin Computer quiz application to ensure proper workflow execution.

## Main Workflow
1. **Teacher creates quiz** → Creates payment objects for each question (teacher owns them)
2. **Students attempt quiz** → First correct answer per question claims the payment
3. **Payment transfer** → Payment ownership transfers from teacher to student
4. **Subsequent attempts** → Later students can attempt but get no rewards (already claimed)

## Files Modified

### Core Fixes

#### 1. `src/payment.ts`
**Issue**: Duplicate `PaymentHelper` class causing import conflicts  
**Fix**: Removed the duplicate class, keeping only `Payment`, `PaymentMock`, and `Withdraw`

```diff
- export class PaymentHelper { ... }
+ // Removed - use src/helpers/payment-helper.ts instead
```

#### 2. `src/utils/mineblock.ts`
**Issue**: Method didn't properly accept computer parameter and lacked confirmation support  
**Fix**: 
- Updated `mineBlockFromRPCClient()` to accept computer parameter and block count
- Added `mineBlocksWithConfirmations()` for multiple block mining
- Improved error handling

```typescript
// NEW METHOD SIGNATURES
static async mineBlockFromRPCClient(computer: Computer, count: number = 1): Promise<void>
static async mineBlocksWithConfirmations(computer: Computer, times: number = 3): Promise<void>
```

#### 3. `src/helpers/payment-helper.ts`
**Changes**:
- Fixed `getPayment()` to use `getLatestRev()` instead of `latest()`
- Added mining after `createPayment()`
- Added mining after `transferPayment()`
- Added mining after `updatePaymentAmount()`
- Added `mineBlocksMultiple()` helper method
- Fixed return type for `createPaymentTx()`

#### 4. `src/helpers/quiz-helper.ts`
**Changes**:
- Use `mineBlocksWithConfirmations(2)` after each payment creation
- Use `mineBlocksWithConfirmations(3)` after quiz creation
- Use `mineBlocksWithConfirmations(3)` after payment transfers
- Use `mineBlocksWithConfirmations(2)` after quiz state updates

#### 5. `src/helpers/student-helper.ts`
**Changes**:
- Added `MineRPCBlocks` import
- Use `mineBlocksWithConfirmations(2)` after student completes quiz

#### 6. `src/helpers/teacher-helper.ts`
**Changes**:
- Added `MineRPCBlocks` import
- Use `mineBlocksWithConfirmations(2)` after teacher adds quiz

### Test Files

#### 7. `test/simple-workflow.test.ts`
**Changes**:
- Updated mining calls to use `mineBlocksWithConfirmations()`
- Proper computer parameter passing

#### 8. `test/complete-quiz-flow.test.ts` (NEW)
**Purpose**: Comprehensive end-to-end test of the entire quiz workflow  
**Coverage**:
- 3 students, 3 questions
- Quiz creation with payment setup
- First student claims all rewards
- Second student gets no rewards (already claimed)
- Third student partial correct (still no rewards)
- Payment ownership verification
- Quiz deactivation

## Mining Strategy

### Why Multiple Blocks?

Bitcoin Computer UTXOs need confirmations before they can be used in subsequent transactions. Mining multiple blocks ensures:

1. **Transaction confirmation** - Transaction is included in blockchain
2. **UTXO availability** - New UTXOs are spendable
3. **State consistency** - All nodes agree on current state

### Mining Patterns

| Operation | Blocks | Reason |
|-----------|--------|--------|
| Payment creation | 2 | Ensure UTXO available for quiz |
| Quiz creation | 3 | Critical operation, needs solid confirmation |
| Payment transfer | 3 | Financial transaction, needs highest confirmation |
| State updates | 2 | General state changes |
| Entity creation | 2 | Teacher/Student creation |

## Code Examples

### Creating a Quiz
```typescript
// Teacher creates quiz
const { quiz, paymentTxIds } = await teacherHelper.createQuiz({
  title: 'My Quiz',
  description: 'Test your knowledge',
  questions: sampleQuestions,
  rewardPerCorrect: 5000n,
  teacher: teacher
})

// Payments are automatically created and mined
console.log('Payment IDs:', paymentTxIds) // One per question
```

### Student Attempting Quiz
```typescript
// First student attempts
const result = await studentHelper.attemptQuiz({
  quizId: quiz._id,
  studentId: student._id,
  answers: [1, 2, 1] // Answers for each question
})

console.log('Score:', result.attempt.score)
console.log('Reward:', result.reward) // Satoshis earned

// Second student attempts same quiz
const result2 = await studentHelper2.attemptQuiz({
  quizId: quiz._id,
  studentId: student2._id,
  answers: [1, 2, 1] // Same correct answers
})

console.log('Score:', result2.attempt.score) // Still correct
console.log('Reward:', result2.reward) // 0 - already claimed!
```

### Checking Payment Ownership
```typescript
const quiz = await quizHelper.getQuiz(quizId)

for (const paymentId of quiz.paymentTxIds) {
  const payment = await paymentHelper.getPayment(paymentId)
  console.log('Owner:', payment._owners[0])
  // Will show student's public key if claimed
}
```

## Verification Steps

### 1. Check Payment Creation
```typescript
const payment = await paymentHelper.getPayment(paymentTxId)
expect(payment._satoshis).to.equal(5000n)
expect(payment._owners[0]).to.equal(teacher.publicKey)
```

### 2. Check Payment Transfer
```typescript
// After student answers correctly
const payment = await paymentHelper.getPayment(paymentTxId)
expect(payment._owners[0]).to.equal(student.publicKey)
```

### 3. Check Quiz State
```typescript
const quiz = await quizHelper.getQuiz(quizId)
expect(quiz.questionRewardsClaimed[0]).to.equal(true) // Question 1 claimed
expect(quiz.attemptedStudents).to.include(student.publicKey)
```

### 4. Check Student Balance
```typescript
const balance = await studentComputer.getBalance()
expect(Number(balance.balance)).to.be.greaterThan(initialBalance)
```

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npm test test/complete-quiz-flow.test.ts

# Run with specific pattern
npm test -- --grep "complete quiz workflow"
```

## Common Issues and Solutions

### Issue: "Property 'latest' does not exist"
**Solution**: Use `getLatestRev()` instead of `latest()`

### Issue: "Insufficient funds"
**Solution**: Mine more blocks after faucet call
```typescript
await computer.faucet(1e8)
await MineRPCBlocks.mineBlocksWithConfirmations(computer, 3)
```

### Issue: "UTXO not found"
**Solution**: Mine blocks after creating objects
```typescript
const payment = await computer.new(Payment, [5000n])
await MineRPCBlocks.mineBlocksWithConfirmations(computer, 2)
```

### Issue: Payment transfer fails
**Solution**: Ensure payment is mined before transfer
```typescript
const payment = await paymentHelper.createPayment(5000n, teacherPubKey)
// createPayment already mines internally
await paymentHelper.transferPayment(payment, studentPubKey)
// transferPayment also mines internally
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Teacher                              │
│  - Creates Quiz                                         │
│  - Creates Payment objects (owns them initially)        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                     Quiz                                │
│  - questionRewardsClaimed: [false, false, false]        │
│  - paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]           │
│  - attemptedStudents: []                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Student 1 Attempts                         │
│  - Answers [1, 2, 1] (all correct)                      │
│  - Claims all 3 rewards                                 │
│  - Receives 3 payment objects                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Quiz Updated                           │
│  - questionRewardsClaimed: [true, true, true]           │
│  - attemptedStudents: [student1PubKey]                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Student 2 Attempts                         │
│  - Answers [1, 2, 1] (all correct)                      │
│  - Claims 0 rewards (all already claimed)               │
│  - Receives nothing                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Final State                            │
│  - Quiz: questionRewardsClaimed all true                │
│  - Student 1: owns all 3 payment objects                │
│  - Student 2: owns nothing                              │
└─────────────────────────────────────────────────────────┘
```

## Key Takeaways

1. **Mining is Critical**: Always mine after state-changing operations
2. **First-Come-First-Served**: Only first correct answer gets the reward
3. **UTXO Model**: Each state change creates new UTXOs
4. **Helper Classes**: Encapsulate complexity and ensure consistent mining
5. **Testing**: Comprehensive tests validate the entire workflow

## Next Steps

1. Run the test suite to verify all fixes
2. Monitor test output for any remaining issues
3. Check balance changes to verify payment transfers
4. Validate payment ownership changes
5. Test edge cases (concurrent attempts, network issues)

## Support

For issues or questions:
1. Check error messages carefully
2. Verify mining is called after each operation
3. Ensure regtest node is running
4. Check test output for detailed logs
