import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { deployQuizContracts } from './lib.js'


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
  mnemonic // Use fixed mnemonic for consistent deployment wallet
})

if (network === 'regtest') {
  console.log(' - Using regtest environment...')
  const address = computer.getAddress()
  console.log(` - Using address: ${address}`)
  console.log(' - Please ensure your regtest wallet is funded')
  console.log(' - You can fund it manually using: npm run fund')
}

const { balance } = await computer.getBalance()

console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Balance \x1b[2m${balance} satoshis\x1b[0m`)

// Check if we have sufficient balance for deployment
if (balance < 50000n) { // Need at least 50k satoshis for deployment

  console.error(`\n❌ Insufficient balance: ${balance} satoshis`)
  console.error(' - Need at least 50,000 satoshis for contract deployment')

  if (network === 'regtest') {
    console.log(' - Try funding the wallet again or check if the Bitcoin Computer node is running')
    console.log(' - Command: npm run node:up (to start the node)')
  } else {
    console.log(' - Please fund your wallet with sufficient Bitcoin/Litecoin')
    console.log(' - Address:', computer.getAddress())
  }

  rl.close()
  process.exit(1)
}

const answer = await rl.question('\nDo you want to deploy the quiz contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log(' - Aborting...')
  rl.close()
  process.exit(0)
}

const { teacherMod, studentMod, quizMod, attemptMod, paymentMod } = await deployQuizContracts(computer)
console.log(' \x1b[2m- Successfully deployed all quiz contracts\x1b[0m')

console.log(`
-----------------
ACTION REQUIRED
-----------------

Update the following rows in your .env file.

NEXT_PUBLIC_TEACHER_MOD_SPEC\x1b[2m=${teacherMod}\x1b[0m
NEXT_PUBLIC_STUDENT_MOD_SPEC\x1b[2m=${studentMod}\x1b[0m
NEXT_PUBLIC_QUIZ_MOD_SPEC\x1b[2m=${quizMod}\x1b[0m
NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC\x1b[2m=${attemptMod}\x1b[0m
NEXT_PUBLIC_PAYMENT_MOD_SPEC\x1b[2m=${paymentMod}\x1b[0m
`)

console.log("\nRun 'npm run dev' to start the application.\n")
rl.close()