import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { QuizAttempt } from '../src/attempt.js'
import { Payment, Withdraw } from '../src/payment.js'
import { QuizAccess } from '../src/quiz-access.js'
import { QuizAccessSale } from '../src/quiz-access-sale.js'

// Stronger polyfill for __name helper that survives different scopes and SES sandbox
// This prevents "__name is not a function" errors in the browser
const BC_PRELUDE = `
const __name = globalThis.__name || ((target, value) => target);
globalThis.__name = __name;
`

export async function deployQuizContracts(computer: Computer): Promise<{
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
  quizAccessMod: string
  quizAccessSaleMod: string
}> {
  // Deploy all contracts with __name polyfill to prevent SES errors
  const teacherMod = await computer.deploy(`${BC_PRELUDE}export ${Teacher}`)
  const studentMod = await computer.deploy(`${BC_PRELUDE}export ${Student}`)
  const quizMod = await computer.deploy(`${BC_PRELUDE}export ${Quiz}`)
  const attemptMod = await computer.deploy(`${BC_PRELUDE}export ${QuizAttempt}`)
  const paymentMod = await computer.deploy(`${BC_PRELUDE}export ${Payment}; export ${Withdraw}`)
  const quizAccessMod = await computer.deploy(`${BC_PRELUDE}export ${QuizAccess}`)
  const quizAccessSaleMod = await computer.deploy(`${BC_PRELUDE}export ${QuizAccessSale}`)

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