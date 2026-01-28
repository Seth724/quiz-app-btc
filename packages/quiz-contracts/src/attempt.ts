import { Contract } from '@bitcoin-computer/lib'

export class QuizAttempt extends Contract {
  quizId!: string
  studentPublicKey!: string
  answers!: number[]
  score!: number
  rewardEarned!: bigint
  isCompleted!: boolean
  
  constructor(quizId: string, studentPublicKey: string) {
    super({
      quizId,
      studentPublicKey,
      answers: [],
      score: 0,
      rewardEarned: 0n,
      isCompleted: false
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
    for (let i = 0; i < correctAnswers.length; i++) {
      if (answers[i] === correctAnswers[i]) {
        correctCount++
      }
    }
    
    this.score = correctCount
    this.rewardEarned = BigInt(correctCount) * rewardPerCorrect
    this.isCompleted = true
  }
}