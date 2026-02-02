import { Contract } from '@bitcoin-computer/lib'

export class Student extends Contract {
  name!: string
  publicKey!: string
  attemptedQuizzes!: string[]
  claimedRewards!: bigint // Total amount of rewards claimed

  constructor(name: string, publicKey: string) {
    super({
      name,
      publicKey,
      attemptedQuizzes: [],
      claimedRewards: 0n
    })
  }

  // Add a quiz to attempted list
  addAttemptedQuiz(quizId: string) {
    if (!this.attemptedQuizzes.includes(quizId)) {
      this.attemptedQuizzes.push(quizId)
    }
  }

  // Add claimed reward amount
  addClaimedReward(amount: bigint) {
    this.claimedRewards += amount
  }

  // Check if student has attempted a specific quiz
  hasAttemptedQuiz(quizId: string): boolean {
    return this.attemptedQuizzes.includes(quizId)
  }

  getAttemptedQuizCount(): number {
    return this.attemptedQuizzes.length
  }

  getTotalRewards(): bigint {
    return this.claimedRewards
  }
}