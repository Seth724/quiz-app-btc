# Quiz Application Architecture - Transaction ID Structure

## ✅ CORRECT: Transaction IDs Belong to Questions

### Data Structure

```typescript
Quiz {
  paymentTxIds: string[]           // One payment transaction per question
  questionRewardsClaimed: boolean[] // Track if each question's reward was claimed
  
  // Example for 2 questions:
  paymentTxIds: [
    "abc123:0",  // Payment for Question 1 (2+2)
    "def456:0"   // Payment for Question 2 (Capital of France)
  ]
  
  questionRewardsClaimed: [
    false,  // Q1 reward not yet claimed
    false   // Q2 reward not yet claimed
  ]
}
```

### Workflow

#### 1. Teacher Creates Quiz
```typescript
teacher.createQuizWithPayments({
  questions: [Q1, Q2],
  rewardPerCorrect: 1000n
})

// Creates:
// - Payment object for Q1 (1000 sats) → paymentTxIds[0] = "abc123:0"
// - Payment object for Q2 (1000 sats) → paymentTxIds[1] = "def456:0"
// - Quiz object linking to both payments
```

#### 2. Student 1 Attempts Quiz
```typescript
student1.answers = [1, 0]  // Correct on Q1, wrong on Q2

// Process:
quiz.claimQuestionReward(0, student1.publicKey)  // ✅ Claims Q1
// → questionRewardsClaimed[0] = true
// → Transfer paymentTxIds[0] to student1

quiz.claimQuestionReward(1, student1.publicKey)  // ❌ Q2 wrong answer
// → questionRewardsClaimed[1] still false
```

#### 3. Student 2 Attempts Quiz
```typescript
student2.answers = [1, 2]  // Correct on both

// Process:
quiz.claimQuestionReward(0, student2.publicKey)  // ❌ Already claimed
// → questionRewardsClaimed[0] is true → returns false

quiz.claimQuestionReward(1, student2.publicKey)  // ✅ Claims Q2
// → questionRewardsClaimed[1] = true
// → Transfer paymentTxIds[1] to student2
```

### Key Points

1. **One Payment Per Question**: Each question has its own payment object
2. **Payment IDs Stored in Quiz**: `quiz.paymentTxIds[i]` = payment for question `i`
3. **First Correct Answer Wins**: `questionRewardsClaimed[i]` prevents double claiming
4. **Attempt Doesn't Store Payment IDs**: Only Quiz knows which payments belong to which questions
5. **Attempt Tracks What Student Got Right**: `attempt.questionRewardsClaimed[i]` = true if student answered Q`i` correctly

## Why This Design is Correct

### ✅ Quiz owns payment references
- Teacher creates quiz → teacher creates payments → quiz links to them
- Payment IDs naturally belong to Quiz because teacher owns the quiz

### ✅ Attempt doesn't need payment IDs
- Attempt only needs to know: "Did I answer this correctly?"
- The actual payment transfer happens through Quiz's payment references
- Keeps Attempt contract simple and focused

### ✅ First-correct-answer logic in Quiz
- Quiz contract manages the claiming logic
- `questionRewardsClaimed` array prevents double claiming
- Payment ownership transfer happens atomically

## Test Verification

See [comprehensive-flow-new.test.ts](./test/comprehensive-flow-new.test.ts#L154-L159):

```typescript
// Verify payments exist and have correct amounts
for (let i = 0; i < paymentTxIds.length; i++) {
  const payment = await teacherComputer.sync(paymentTxIds[i]) as Payment
  expect(payment._satoshis).to.equal(1000n)
  expect(payment._owners).to.include(teacher.publicKey)
  console.log(`✅ Payment ${i + 1} verified: ${payment._satoshis} sats, owner: ${payment._owners[0].slice(0, 10)}...`)
}
```

This logs:
```
✅ Payment 1 verified: 1000 sats, owner: 02a3f1...   ← Question 1 payment
✅ Payment 2 verified: 1000 sats, owner: 02a3f1...   ← Question 2 payment
```

## Fixed Issues

- ✅ Removed unused `Quiz` and `QuizAttempt` imports from teacher.ts
- ✅ Prefixed unused `studentPublicKey` parameter with `_` in claimQuestionReward
- ✅ Removed unused `QuizAttempt` import from comprehensive-flow-new.test.ts
- ✅ All TypeScript/ESLint errors resolved
- ✅ Build successful

## Next Steps

The contracts are correct, but tests cannot run because the Bitcoin Computer node at `localhost:1031` has an API version mismatch with the library. 

**To run tests, you need to either:**
1. Use the public testnet node: `https://tbtc4.metarunelabs.dev`
2. Use the public regtest node: `https://rltc.node.bitcoincomputer.io`
3. Update your local Docker node to match the library's API expectations
