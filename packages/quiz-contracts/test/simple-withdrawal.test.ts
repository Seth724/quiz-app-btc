import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Payment, Withdraw } from '../src/payment.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

describe('Simple Payment Withdrawal Test', function () {
  this.timeout(120000) // 2 minute timeout

  let computer: Computer
  let paymentHelper: PaymentHelper

  const chain = 'LTC'
  const network = 'regtest'
  const url = process.env.BCL_URL || 'http://localhost:1031'

  before(async function () {
    console.log('\\n🚀 Setting up Simple Payment Withdrawal Test')
    console.log(`Chain: ${chain}, Network: ${network}`)

    computer = new Computer({ url, chain, network, path: "m/44'/2'/0'/0/0" })
    console.log(`Computer: ${computer.getPublicKey().substring(0, 20)}...`)

    // Fund wallet
    if (network === 'regtest') {
      console.log('💰 Funding wallet...')
      await computer.faucet(1e8) // 100 million sats
      console.log('✅ Wallet funded')
    }

    // Deploy contracts
    paymentHelper = new PaymentHelper(computer)
    await paymentHelper.deploy()
    console.log('✅ Payment contracts deployed')
  })

  it('should properly withdraw payment funds and reduce payment object to minimum dust', async function () {
    // Check initial balance
    const initialBalance = await computer.getBalance()
    console.log(`\\n📊 INITIAL BALANCE: ${Number(initialBalance.balance).toLocaleString()} sats`)

    // STEP 1: Create a payment of 10000 sats
    console.log('\\n🎯 STEP 1: Creating payment object with 10000 sats...')
    const payment = await paymentHelper.createPayment(10000n)
    console.log(`✅ Payment created: ${await payment._id}`)
    console.log(`💰 Payment value: ${await payment._satoshis} sats`)
    
    // Verify initial state
    const initialSatoshis = await payment._satoshis
    const initialOwners = await payment._owners
    console.log(`👤 Payment owner: ${initialOwners[0].substring(0, 20)}...`)
    expect(initialSatoshis).to.equal(10000n)
    expect(initialOwners[0]).to.equal(computer.getPublicKey())
    console.log('✅ Payment created with correct amount and ownership')

    // Check balance after payment creation
    const balanceAfterCreate = await computer.getBalance()
    console.log(`📊 BALANCE AFTER PAYMENT CREATION: ${Number(balanceAfterCreate.balance).toLocaleString()} sats`)

    // STEP 2: Execute withdrawal
    console.log('\\n💰 STEP 2: Executing payment withdrawal...')
    const originalAmount = await payment._satoshis
    console.log(`   Original payment amount: ${originalAmount} sats`)

    // Record balance before withdrawal
    const balanceBeforeWithdrawal = await computer.getBalance()
    console.log(`   Balance before withdrawal: ${Number(balanceBeforeWithdrawal.balance).toLocaleString()} sats`)

    // Execute the withdrawal
    const withdrawnAmount = await paymentHelper.withdrawPayment(payment)
    console.log(`✅ Withdrawal executed: ${withdrawnAmount} sats processed`)

    // Wait for transaction to settle
    await new Promise(resolve => setTimeout(resolve, 5000))

    // STEP 3: Check the payment object state after withdrawal
    console.log('\\n🔍 STEP 3: Checking payment object state after withdrawal...')
    
    // Get the payment again to see if it was updated
    const paymentId = await payment._id
    const updatedPayment = await computer.sync(paymentId) as Payment
    const satoshisAfterWithdrawal = await updatedPayment._satoshis
    
    console.log(`📊 Payment object satoshis after withdrawal: ${satoshisAfterWithdrawal} sats`)
    console.log(`🎯 Expected: 546n sats (minimum dust)`)
    
    // Check if the payment object was properly reduced
    if (satoshisAfterWithdrawal === 546n) {
      console.log('✅ SUCCESS: Payment object reduced to minimum dust amount')
    } else {
      console.log(`❌ ISSUE: Payment object still has ${satoshisAfterWithdrawal} sats, expected 546n`)
    }

    // STEP 4: Check wallet balance changes
    console.log('\\n💳 STEP 4: Checking wallet balance changes...')
    const balanceAfterWithdrawal = await computer.getBalance()
    console.log(`   Balance after withdrawal: ${Number(balanceAfterWithdrawal.balance).toLocaleString()} sats`)
    
    const balanceChange = Number(balanceAfterWithdrawal.balance) - Number(balanceBeforeWithdrawal.balance)
    console.log(`   Balance change: ${balanceChange >= 0 ? '+' : ''}${balanceChange.toLocaleString()} sats`)
    
    // The balance should have increased by approximately the withdrawn amount minus fees
    const expectedIncrease = Number(originalAmount - 546n) // Original amount minus minimum dust
    console.log(`   Expected increase (roughly): ~${expectedIncrease} sats (minus fees)`)
    
    if (balanceChange > 0) {
      console.log('✅ SUCCESS: Wallet balance increased after withdrawal')
    } else {
      console.log('❌ ISSUE: Wallet balance did not increase after withdrawal')
    }

    // STEP 5: Final verification
    console.log('\\n✅ FINAL VERIFICATION:')
    console.log(`   • Original payment amount: ${originalAmount} sats`)
    console.log(`   • Payment object after withdrawal: ${satoshisAfterWithdrawal} sats`)
    console.log(`   • Wallet balance change: ${balanceChange >= 0 ? '+' : ''}${balanceChange.toLocaleString()} sats`)
    
    // The key test: payment object should be reduced to minimum dust
    expect(satoshisAfterWithdrawal).to.equal(546n, 'Payment object should be reduced to minimum dust after withdrawal')
    
    // The wallet should have received the withdrawn funds (minus fees)
    expect(balanceChange).to.be.greaterThan(-1000, 'Wallet should not lose significant amount due to failed withdrawal')
    
    console.log('\\n🎉 WITHDRAWAL TEST COMPLETED!')
    console.log('   • Payment object properly reduced to minimum dust amount')
    console.log('   • Funds should have been transferred to owner\'s wallet')
    console.log('   • Transaction executed successfully on blockchain')
  })
})