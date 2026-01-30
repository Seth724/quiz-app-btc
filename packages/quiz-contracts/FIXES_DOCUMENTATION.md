# Quiz Contracts - Fixed Implementation

## Summary of Fixes

This document outlines the fixes applied to resolve conflicts and improve the quiz application workflow.

## Issues Fixed

### 1. **Duplicate PaymentHelper Class**
- **Problem**: `payment.ts` and `payment-helper.ts` both defined a `PaymentHelper` class, causing import conflicts
- **Solution**: Removed the duplicate from `payment.ts`, keeping only the dedicated helper in `payment-helper.ts`
- **Files Modified**: `src/payment.ts`

### 2. **Mining Block Method Signature**
- **Problem**: `MineRPCBlocks.mineBlockFromRPCClient()` was called without the required `computer` parameter
- **Solution**: 
  - Updated method to properly accept `computer` parameter
  - Added `mineBlocksWithConfirmations()` method for mining multiple blocks in succession
  - All calls now properly pass the computer instance
- **Files Modified**: 
  - `src/utils/mineblock.ts`
  - All helper files (`payment-helper.ts`, `quiz-helper.ts`, `student-helper.ts`, `teacher-helper.ts`)
  - Test files

### 3. **Mining Strategy for Confirmations**
- **Problem**: Single block mining wasn't providing enough confirmations for complex transactions
- **Solution**: 
  - Implemented `mineBlocksWithConfirmations()` to mine 2-3 blocks in succession
  - Used after critical operations:
    - Payment creation (2 blocks)
    - Payment transfer (3 blocks)
    - Quiz creation (3 blocks)
    - Student/teacher entity creation (2 blocks)
- **Benefit**: Proper confirmation ensures UTXOs are available for subsequent transactions

### 4. **Helper Method Consistency**
- **Problem**: Inconsistent mining calls across helper files
- **Solution**: Standardized all helper methods to:
  - Always await mining operations
  - Mine after state-changing operations
  - Use appropriate confirmation counts based on operation criticality

## Architecture Overview

### Payment Flow
```
Teacher Creates Quiz
    ↓
For Each Question:
    1. Create Payment (5000 sats)
    2. Payment owned by Teacher
    3. Mine 2 blocks
    ↓
Quiz Created with Payment IDs
    ↓
Mine 3 blocks
```

### Student Attempt Flow
```
Student Attempts Quiz
    ↓
For Each Correct Answer:
    1. Check if reward claimed
    2. If not claimed:
        a. Claim reward in quiz state
        b. Transfer payment to student
        c. Mine 3 blocks
    3. If already claimed:
        - Skip transfer (student gets nothing)
    ↓
Update student's completed quizzes
    ↓
Mine 2 blocks
```

## Key Concepts

### First-Come-First-Served Rewards
- Each question has ONE payment object
- First student to answer correctly gets the payment
- Subsequent students who answer correctly get:
  - ✓ Credit for correct answer (score)
  - ✗ No payment (already claimed)

### Payment Ownership Transfer
```typescript
// Initial state (after quiz creation)
Payment {
  _id: "abc123:0",
  _satoshis: 5000n,
  _owners: [teacherPublicKey]
}

// After student answers correctly
Payment {
  _id: "abc123:0",
  _satoshis: 5000n,
  _owners: [studentPublicKey]  // Ownership transferred!
}
```

### Quiz State Tracking
```typescript
Quiz {
  questionRewardsClaimed: [false, false, false]  // Initially unclaimed
  attemptedStudents: []                          // No attempts yet
  paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]     // Payment references
}

// After student 1 answers all correctly
Quiz {
  questionRewardsClaimed: [true, true, true]     // All claimed
  attemptedStudents: [student1PubKey]
  paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]
}

// After student 2 attempts
Quiz {
  questionRewardsClaimed: [true, true, true]     // Still all claimed
  attemptedStudents: [student1PubKey, student2PubKey]
  paymentTxIds: ["tx1:0", "tx2:0", "tx3:0"]
}
```

## Test Files

### `simple-workflow.test.ts`
- Basic workflow tests
- 2 students, 2 questions
- Tests first-come-first-served mechanism

### `complete-quiz-flow.test.ts` (NEW)
- Comprehensive end-to-end test
- 3 students, 3 questions
- Tests:
  - Quiz creation with payments
  - First student gets all rewards
  - Second student gets no rewards (all claimed)
  - Third student gets no rewards (partial correct + all claimed)
  - Payment ownership verification
  - Quiz deactivation

## Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "complete quiz workflow"

# Run with verbose output
npm test -- --reporter spec
```

## Helper Classes

### PaymentHelper
- `createPayment()` - Create and mine
- `transferPayment()` - Transfer and mine
- `getPayment()` - Retrieve payment object
- `mineBlock()` - Mine single block
- `mineBlocksMultiple()` - Mine multiple blocks

### QuizHelper
- `createQuizWithPayments()` - Create quiz with individual payments
- `processQuizRewards()` - Handle reward claiming and transfers
- `getQuiz()` - Retrieve quiz object
- `addStudentToAttempted()` - Mark student as attempted
- `deactivateQuiz()` - Deactivate quiz

### StudentHelper
- `createStudent()` - Create student entity
- `attemptQuiz()` - Complete quiz attempt flow
- `canAttemptQuiz()` - Check eligibility

### TeacherHelper
- `createTeacher()` - Create teacher entity
- `createQuiz()` - Create quiz with payments
- `deactivateQuiz()` - Deactivate quiz

## Important Notes

### Mining Best Practices
1. **Always await**: `await MineRPCBlocks.mineBlocksWithConfirmations(computer, 2)`
2. **Use multiple blocks**: For critical operations (payments, transfers)
3. **Order matters**: Mine after each state change, not at the end

### UTXO Management
- Each state change creates a new UTXO
- Old UTXO is spent
- Mining confirms the transaction
- Without mining, subsequent operations may fail

### Error Handling
- All helper methods throw on failure
- Test timeouts set to 180000ms (3 minutes) for complex operations
- Network issues handled with retries in mining

## Debugging Tips

### If payments aren't transferring:
1. Check mining is called after transfer
2. Verify payment ownership before transfer
3. Ensure quiz state shows reward not claimed

### If tests timeout:
1. Increase timeout in test
2. Check network connectivity
3. Verify regtest node is running

### If balance doesn't update:
1. Mine more blocks for confirmation
2. Wait for block propagation (2000ms delay)
3. Check transaction was broadcast

## Next Steps

1. Run the complete test suite
2. Monitor payment ownership changes
3. Verify balance changes match expected rewards
4. Test edge cases (concurrent attempts, network failures)
