import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { Teacher } from '../src/teacher.js'
import { Student } from '../src/student.js'
import { Quiz } from '../src/quiz.js'
import { QuizAttempt } from '../src/attempt.js'
import { Payment, Withdraw } from '../src/payment.js'
import { QuizAccess } from '../src/quiz-access.js'
import { QuizAccessSale } from '../src/quiz-access-sale.js'

config()

const {
  NEXT_PUBLIC_CHAIN: chain,
  NEXT_PUBLIC_NETWORK: network,
  NEXT_PUBLIC_URL: url,
  NEXT_PUBLIC_PATH: path,
  DEPLOYMENT_MNEMONIC: mnemonic
} = process.env

const computer = new Computer({ chain, network, url, path, mnemonic })

// Stronger polyfill for __name helper
const BC_PRELUDE = `
const __name = globalThis.__name || ((target, value) => target);
globalThis.__name = __name;
`

console.log('Deploying contracts with BC_PRELUDE...\n')
console.log(`Chain: ${chain}`)
console.log(`Network: ${network}`)
console.log(`Address: ${computer.getAddress()}`)

const { balance } = await computer.getBalance()
console.log(`Balance: ${balance} satoshis\n`)

if (balance < 50000n) {
  console.error('❌ Insufficient balance')
  process.exit(1)
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function deployWithDelay(name: string, code: string, delayMs: number = 3000) {
  console.log(`Deploying ${name}...`)
  try {
    const mod = await computer.deploy(code)
    console.log(`✅ ${name}: ${mod}`)
    await sleep(delayMs) // Wait between deployments
    return mod
  } catch (error: any) {
    console.error(`❌ ${name} failed:`, error.message)
    throw error
  }
}

const teacherMod = await deployWithDelay('Teacher', `${BC_PRELUDE}export ${Teacher}`, 5000)
const studentMod = await deployWithDelay('Student', `${BC_PRELUDE}export ${Student}`, 5000)
const quizMod = await deployWithDelay('Quiz', `${BC_PRELUDE}export ${Quiz}`, 5000)
const attemptMod = await deployWithDelay('QuizAttempt', `${BC_PRELUDE}export ${QuizAttempt}`, 5000)
const paymentMod = await deployWithDelay('Payment', `${BC_PRELUDE}export ${Payment}; export ${Withdraw}`, 5000)
const quizAccessMod = await deployWithDelay('QuizAccess', `${BC_PRELUDE}export ${QuizAccess}`, 5000)
const quizAccessSaleMod = await deployWithDelay('QuizAccessSale', `${BC_PRELUDE}export ${QuizAccessSale}`, 5000)

console.log('\n✅ All contracts deployed!\n')
console.log('-----------------')
console.log('COPY TO .env.local:')
console.log('-----------------\n')
console.log(`NEXT_PUBLIC_TEACHER_MOD_SPEC=${teacherMod}`)
console.log(`NEXT_PUBLIC_STUDENT_MOD_SPEC=${studentMod}`)
console.log(`NEXT_PUBLIC_QUIZ_MOD_SPEC=${quizMod}`)
console.log(`NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC=${attemptMod}`)
console.log(`NEXT_PUBLIC_PAYMENT_MOD_SPEC=${paymentMod}`)
console.log(`NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC=${quizAccessMod}`)
console.log(`NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC=${quizAccessSaleMod}`)
