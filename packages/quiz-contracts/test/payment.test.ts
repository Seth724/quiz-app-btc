// test/payment.test.ts
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Payment, PaymentHelper } from '../src/payment.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './.env'),
  path.resolve(process.cwd(), './packages/node/.env'),
  '../node/.env',
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const chain = process.env.BCN_CHAIN || process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.BCN_NETWORK || process.env.NEXT_PUBLIC_NETWORK || 'regtest'

describe('Payment', () => {
  let alice: Computer
  let bob: Computer
  let paymentHelper: PaymentHelper
  let paymentTxId: string

  before('Before', async function () {
    this.timeout(60000)
    
    alice = new Computer({ url, chain, network })
    bob = new Computer({ url, chain, network })
    
    if (network === 'regtest') {
      await alice.faucet(4e8)
      await new Promise(resolve => setTimeout(resolve, 2000))
      await bob.faucet(1e8)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    paymentHelper = new PaymentHelper(alice)
  })

  describe('Alice creates payment', () => {
    it('Alice deploys the payment contract', async function () {
      this.timeout(60000)
      
      const mod = await paymentHelper.deploy()
      expect(mod).to.be.a('string')
      expect(mod).to.match(/^[a-f0-9]{64}:[0-9]+$/)
      console.log(`✅ Payment contract deployed: ${mod}`)
    })

    it('Alice creates a payment transaction and broadcasts it', async function () {
      this.timeout(60000)
      
      const { tx: paymentTx } = await paymentHelper.createPaymentTx(BigInt(2e8))
      paymentTxId = await alice.broadcast(paymentTx)
      
      console.log(`✅ Payment created: ${paymentTxId}`)
      
      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const payment: Payment = await paymentHelper.getPayment(paymentTxId)
      expect(payment._satoshis).to.equal(BigInt(2e8))
      expect(payment._owners).to.include(alice.getPublicKey())
      console.log(`✅ Payment verified: ${payment._satoshis} satoshis`)
    })

    
    
  })
})
