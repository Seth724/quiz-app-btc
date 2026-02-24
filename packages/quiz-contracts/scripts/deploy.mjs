import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

// Import from pre-compiled dist (no esbuild __name decorations)
import { Teacher } from '../dist/teacher.js'
import { Student } from '../dist/student.js'
import { Quiz } from '../dist/quiz.js'
import { QuizAttempt } from '../dist/attempt.js'
import { Payment, Withdraw } from '../dist/payment.js'
import { QuizAccess } from '../dist/quiz-access.js'
import { QuizAccessSale } from '../dist/quiz-access-sale.js'

config()

const {
  NEXT_PUBLIC_CHAIN: chain,
  NEXT_PUBLIC_NETWORK: network,
  NEXT_PUBLIC_URL: url,
  NEXT_PUBLIC_PATH: path,
  DEPLOYMENT_MNEMONIC: mnemonic
} = process.env

const rl = createInterface({ input, output })

if (!network || !chain || !url) {
  throw new Error('Please set NEXT_PUBLIC_CHAIN, NEXT_PUBLIC_NETWORK, and NEXT_PUBLIC_URL in the .env file')
}

const computer = new Computer({
  chain,
  network,
  url,
  path,
  mnemonic
})

if (network === 'regtest') {
  console.log(' - Using regtest environment...')
  const address = computer.getAddress()
  console.log(` - Using address: ${address}`)
  console.log(' - Please ensure your regtest wallet is funded')
}

await computer.faucet(1e8)
const { balance } = await computer.getBalance()

console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Balance \x1b[2m${balance} satoshis\x1b[0m`)

if (balance < 50000n) {
  console.error(`\n❌ Insufficient balance: ${balance} satoshis`)
  console.error(' - Need at least 50,000 satoshis for contract deployment')
  rl.close()
  process.exit(1)
}

const answer = await rl.question('\nDo you want to deploy the quiz contracts? \x1b[2m(y/n)\x1b[0m ')
if (answer === 'n') {
  console.log(' - Aborting...')
  rl.close()
  process.exit(0)
}

console.log('\n📦 Deploying contracts...\n')

// Deploy all contracts
const teacherMod = await computer.deploy(`export ${Teacher}`)
console.log(' ✓ Teacher module deployed')

const studentMod = await computer.deploy(`export ${Student}`)
console.log(' ✓ Student module deployed')

const quizMod = await computer.deploy(`export ${Quiz}`)
console.log(' ✓ Quiz module deployed')

const attemptMod = await computer.deploy(`export ${QuizAttempt}`)
console.log(' ✓ QuizAttempt module deployed')

const paymentMod = await computer.deploy(`export ${Payment}; export ${Withdraw}`)
console.log(' ✓ Payment module deployed')

const quizAccessMod = await computer.deploy(`export ${QuizAccess}`)
console.log(' ✓ QuizAccess module deployed')

const quizAccessSaleMod = await computer.deploy(`export ${QuizAccessSale}`)
console.log(' ✓ QuizAccessSale module deployed')

console.log('\n \x1b[32m✓ Successfully deployed all quiz contracts\x1b[0m')

console.log(`
-----------------
ACTION REQUIRED
-----------------

Update the following rows in your .env files (both packages/quiz-contracts/.env and apps/web/.env):

NEXT_PUBLIC_TEACHER_MOD=${teacherMod}
NEXT_PUBLIC_STUDENT_MOD=${studentMod}
NEXT_PUBLIC_QUIZ_MOD=${quizMod}
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD=${attemptMod}
NEXT_PUBLIC_PAYMENT_MOD=${paymentMod}
NEXT_PUBLIC_QUIZ_ACCESS_MOD=${quizAccessMod}
NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD=${quizAccessSaleMod}
`)

console.log("Run 'npm run dev' in apps/web to start the application.\n")
rl.close()
