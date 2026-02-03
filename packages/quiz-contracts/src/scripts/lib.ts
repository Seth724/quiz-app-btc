import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher.js'
import { Student } from '../student.js'
import { Quiz } from '../quiz.js'
import { QuizAttempt } from '../attempt.js'
import { Payment, Withdraw } from '../payment.js'

export async function deployQuizContracts(computer: Computer): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
}> {
  // Deploy all contracts at once
  const teacherMod = await computer.deploy(`export ${Teacher}`)
  const studentMod = await computer.deploy(`export ${Student}`)
  const quizMod = await computer.deploy(`export ${Quiz}`)
  const attemptMod = await computer.deploy(`export ${QuizAttempt}`)
  const paymentMod = await computer.deploy(`export ${Payment}; export ${Withdraw}`)

  return {
    teacherMod,
    studentMod,
    quizMod,
    attemptMod,
    paymentMod
  }
}