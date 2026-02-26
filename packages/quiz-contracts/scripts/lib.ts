import { Computer } from '@bitcoin-computer/lib'
// Import from dist/ to use tsc-compiled classes (no esbuild __name decorations)
import { Teacher } from '../dist/teacher.js'
import { Student } from '../dist/student.js'
import { Quiz } from '../dist/quiz.js'
import { QuizAttempt } from '../dist/attempt.js'
import { Payment, Withdraw } from '../dist/payment.js'
import { QuizAccess } from '../dist/quiz-access.js'
import { QuizAccessSale } from '../dist/quiz-access-sale.js'

export async function deployQuizContracts(computer: Computer): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
  quizAccessMod: string
  quizAccessSaleMod: string
}> {
  // Deploy all contracts at once
  const teacherMod = await computer.deploy(`export ${Teacher}`)
  const studentMod = await computer.deploy(`export ${Student}`)
  const quizMod = await computer.deploy(`export ${Quiz}`)
  const attemptMod = await computer.deploy(`export ${QuizAttempt}`)
  const paymentMod = await computer.deploy(`export ${Payment}; export ${Withdraw}`)
  const quizAccessMod = await computer.deploy(`export ${QuizAccess}`)
  const quizAccessSaleMod = await computer.deploy(`export ${QuizAccessSale}`)

  return {
    teacherMod,
    studentMod,
    quizMod,
    attemptMod,
    paymentMod,
    quizAccessMod,
    quizAccessSaleMod
  }
}