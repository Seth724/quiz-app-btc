import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { QuizAccessHelper, QuizAccess, QuizAccessSwapHelper, Payment} from '../src/index.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

describe('Quiz Access Swap', () => {
  let quizAccessA: any
  let paymentB: any
  const teacher = new Computer({ url, chain, network })
  const student = new Computer({ url, chain, network })

  before('Before', async () => {
    await teacher.faucet(1e8)
    await student.faucet(1e8)
  })

  describe('Example from docs', () => {
    it('Should work', async () => {
      // Teacher creates helper objects
      const quizAccessHelperA = new QuizAccessHelper(teacher)
      const swapHelperA = new QuizAccessSwapHelper(teacher)

      // Teacher deploys the smart contracts
      await quizAccessHelperA.deploy()
      await swapHelperA.deploy()

      // Teacher creates a quiz access object
      quizAccessA = await quizAccessHelperA.createQuizAccess('quiz123', student.getPublicKey())

      // Student creates helper objects from the module specifiers
      //const paymentHelperB = new PaymentHelper(student)
      const swapHelperB = new QuizAccessSwapHelper(student, swapHelperA.mod)

      // Student creates a payment to pay for Teacher's quiz access
      paymentB = await student.new(Payment, [10000n]) // 10000 sats entry fee

      // Student creates a swap transaction
      const { tx } = await swapHelperB.createSwapTx(quizAccessA, paymentB)

      // Teacher checks the swap transaction
      await swapHelperA.checkSwapTx(tx, student.getPublicKey(), teacher.getPublicKey())

      // Teacher signs and broadcasts the transaction to execute the swap
      await teacher.sign(tx)
      await teacher.broadcast(tx)

      // Student reads the updated state from the blockchain
      const {
        env: { quizAccess, payment },
      } = (await student.sync(tx.getId())) as { env: { quizAccess: any; payment: any } }
      expect(quizAccess._owners).deep.eq([student.getPublicKey()])
      expect(payment._owners).deep.eq([teacher.getPublicKey()])
    })
  })

  describe('Creating quiz access and payment to be swapped', () => {
    it('Teacher creates a quiz access', async () => {
      quizAccessA = await teacher.new(QuizAccess, ['quiz456', student.getPublicKey()])
      expect(quizAccessA._owners).deep.eq([teacher.getPublicKey()])
    })

    it('Student creates a payment', async () => {
      paymentB = await student.new(Payment, [5000n])
      expect(paymentB._owners).deep.eq([student.getPublicKey()])
    })
  })

  describe('Executing a swap', async () => {
    let tx: any
    let txId: string
    let swapHelper: QuizAccessSwapHelper

    before('Before creating an offer', async () => {
      swapHelper = new QuizAccessSwapHelper(teacher)
    })

    it('Teacher deploys a swap contract', async () => {
      await swapHelper.deploy()
    })

    it('Teacher builds, funds, and signs a swap transaction', async () => {
      ;({ tx } = await swapHelper.createSwapTx(quizAccessA, paymentB))
    })

    it('Student checks the swap transaction', async () => {
      await swapHelper.checkSwapTx(tx, student.getPublicKey(), teacher.getPublicKey())
    })

    it('Student signs the swap transaction', async () => {
      await student.sign(tx)
    })

    it('Student broadcasts the swap transaction', async () => {
      txId = await student.broadcast(tx)
      expect(txId).not.undefined
    })

    it('quizAccess is now owned by Student', async () => {
      const { env } = (await student.sync(txId)) as { env: { quizAccess: any; payment: any } }
      const quizAccessSwapped = env.quizAccess
      expect(quizAccessSwapped._owners).deep.eq([student.getPublicKey()])
    })

    it('payment is now owned by Teacher', async () => {
      const { env } = (await teacher.sync(txId)) as { env: { quizAccess: any; payment: any } }
      const paymentSwapped = env.payment
      expect(paymentSwapped._owners).deep.eq([teacher.getPublicKey()])
    })
  })
})