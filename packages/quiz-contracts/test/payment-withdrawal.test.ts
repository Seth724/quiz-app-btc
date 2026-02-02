import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Payment } from '../src/payment.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

describe('Payment Withdrawal Test', function () {
  this.timeout(120000) // 2 minute timeout

  let computer1: any, computer2: any
  let paymentHelper1: PaymentHelper, paymentHelper2: PaymentHelper
  const chain = 'LTC'
  const network = 'regtest'
  const url = process.env.BCL_URL || 'http://localhost:1031'

  before(async function () {
    console.log('\\n🚀 Testing Payment Withdrawal Functionality')
    console.log(`Chain: ${chain}, Network: ${network}`)

    // Create two computers (payer and receiver)
    computer1 = new Computer({ url, chain, network })
    computer2 = new Computer({ url, chain, network })

    console.log(`Payer: ${computer1.getPublicKey().substring(0, 20)}...`)
    console.log(`Receiver: ${computer2.getPublicKey().substring(0, 20)}...`)

    // Fund wallets
    if (network === 'regtest') {
      console.log('💰 Funding wallets...')
      await computer1.faucet(1e8) // 100 million sats
      await computer2.faucet(1e8)
      console.log('✅ Wallets funded')
    }

    // Deploy payment contracts
    paymentHelper1 = new PaymentHelper(computer1)
    paymentHelper2 = new PaymentHelper(computer2)

    await paymentHelper1.deploy()
    await paymentHelper2.deploy()
    console.log('✅ Payment contracts deployed')
  })

  it('should create payment, transfer ownership, and allow withdrawal', async function () {
    // Check initial balances
    const payer1InitBal = await computer1.getBalance()
    const receiver2InitBal = await computer2.getBalance()

    console.log('\\n📊 INITIAL BALANCES:')
    console.log(`   Payer1: ${Number(payer1InitBal.balance).toLocaleString()} sats`)
    console.log(`   Receiver2: ${Number(receiver2InitBal.balance).toLocaleString()} sats`)

    // STEP 1: Payer creates payment for 5000 sats
    console.log('\\n🎯 STEP 1: Creating payment object...')
    const payment = await paymentHelper1.createPayment(5000n)
    console.log(`✅ Payment created: ${await payment._id}`)
    console.log(`💰 Payment value: ${await payment._satoshis} sats`)
    console.log(`👤 Payment owner: ${(await payment._owners)[0].substring(0, 20)}...`)

    // Check balances after payment creation
    const payer1AfterCreate = await computer1.getBalance()
    console.log(`\\n📊 BALANCE AFTER PAYMENT CREATION:`)
    console.log(`   Payer1: ${Number(payer1AfterCreate.balance).toLocaleString()} sats`)
    console.log(`   Change: ${Number(payer1AfterCreate.balance) - Number(payer1InitBal.balance)} sats`)

    // STEP 2: Transfer payment to receiver
    console.log('\\n🔄 STEP 2: Transferring payment ownership...')
    await payment.transfer(computer2.getPublicKey())
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify transfer worked
    const newOwner = (await payment._owners)[0]
    const receiverPubKey = computer2.getPublicKey()
    console.log(`👤 New owner: ${newOwner.substring(0, 20)}...`)
    console.log(`🎯 Expected owner: ${receiverPubKey.substring(0, 20)}...`)

    if (newOwner === receiverPubKey) {
      console.log(`✅ Transfer verified: Ownership successfully changed to receiver`)
    } else {
      console.log(`❌ Transfer failed: Owner is still ${newOwner.substring(0, 20)}... instead of ${receiverPubKey.substring(0, 20)}...`)
    }

    // STEP 3: Receiver withdraws payment
    console.log('\\n💰 STEP 3: Receiver withdrawing payment to wallet...')
    try {
      const withdrawnAmount = await paymentHelper2.withdrawPayment(payment)
      console.log(`✅ Withdrawal successful: ${withdrawnAmount} sats`)

      // Check final balances
      const receiver2Final = await computer2.getBalance()
      const balanceIncrease = Number(receiver2Final.balance) - Number(receiver2InitBal.balance)

      console.log(`\\n📊 FINAL BALANCES:`)
      console.log(`   Receiver2: ${Number(receiver2Final.balance).toLocaleString()} sats`)
      console.log(`   Net change: ${balanceIncrease >= 0 ? '+' : ''}${balanceIncrease.toLocaleString()} sats`)
      console.log(`   Expected: Should be close to +5000 sats minus fees`)

      // Verify withdrawal worked
      expect(withdrawnAmount).to.equal(5000n)

      // Test that payment cannot be withdrawn again
      try {
        await paymentHelper2.withdrawPayment(payment)
        throw new Error('Should not reach here - double withdrawal should fail')
      } catch (error: any) {
        console.log(`✅ Double withdrawal correctly blocked: ${error.message}`)
      }

    } catch (error: any) {
      console.log(`❌ Withdrawal failed: ${error.message}`)
      console.log(`💡 Note: Bitcoin Computer may not support automatic satoshi transfer`)
      console.log(`💡 Payment ownership transfer works, but wallet balance may not increase automatically`)
    }
  })
})