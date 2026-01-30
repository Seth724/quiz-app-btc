import { Contract } from '@bitcoin-computer/lib'

export class QuizAttempt extends Contract {
  quizId!: string
  studentPublicKey!: string
  answers!: number[]
  score!: number
  rewardEarned!: bigint
  isCompleted!: boolean
  questionRewardsClaimed!: boolean[] // Track which questions this student got right and claimed

  constructor(quizId: string, studentPublicKey: string) {
    super({
      quizId,
      studentPublicKey,
      answers: [],
      score: 0,
      rewardEarned: 0n,
      isCompleted: false,
      questionRewardsClaimed: [] // Initialize as empty, will be filled when submitting answers
    })
  }

  submitAnswers(answers: number[], correctAnswers: number[], rewardPerCorrect: bigint) {
    if (this.answers.length > 0) {
      throw new Error('Quiz already submitted')
    }

    // Validate answers length
    if (answers.length !== correctAnswers.length) {
      throw new Error('Invalid number of answers')
    }

    this.answers = answers

    // Grade immediately - inline to reduce complexity
    let correctCount = 0
    this.questionRewardsClaimed = new Array(answers.length).fill(false) // Initialize tracking

    for (let i = 0; i < correctAnswers.length; i++) {
      if (answers[i] === correctAnswers[i]) {
        correctCount++
        this.questionRewardsClaimed[i] = true // Mark this question as answered correctly
      }
    }

    this.score = correctCount
    this.rewardEarned = BigInt(correctCount) * rewardPerCorrect
    this.isCompleted = true
  }
}