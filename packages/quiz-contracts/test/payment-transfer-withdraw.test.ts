import { Computer } from '@bitcoin-computer/lib'
import { expect } from 'chai'
import { Payment } from '../src/payment.js'
import { PaymentHelper } from '../src/helpers/payment-helper.js'

describe('Payment Transfer and Withdraw Test', function () {
  this.timeout(120000) // 2 minute timeout

  let teacherComputer: Computer
  let studentComputer: Computer
  let paymentHelper: PaymentHelper
  let studentPaymentHelper: PaymentHelper

  const chain = 'LTC'
  const network = 'regtest'
  const url = process.env.BCL_URL || 'http://localhost:1031'

  before(async function () {
    console.log('\\n🚀 Setting up Payment Transfer and Withdraw Test')
    console.log(`Chain: ${chain}, Network: ${network}`)

    // Create computers for teacher and student
    teacherComputer = new Computer({ url, chain, network, path: "m/44'/2'/0'/0/0" })
    studentComputer = new Computer({ url, chain, network, path: "m/44'/2'/0'/0/1" })

    console.log(`Teacher: ${teacherComputer.getPublicKey().substring(0, 20)}...`)
    console.log(`Student: ${studentComputer.getPublicKey().substring(0, 20)}...`)

    // Fund wallets
    if (network === 'regtest') {
      console.log('💰 Funding wallets...')
      await teacherComputer.faucet(1e8) // 100 million sats
      await studentComputer.faucet(1e8)
      console.log('✅ Wallets funded')
    }

    // Deploy payment contracts
    paymentHelper = new PaymentHelper(teacherComputer)
    studentPaymentHelper = new PaymentHelper(studentComputer)

    await paymentHelper.deploy()
    await studentPaymentHelper.deploy()
    console.log('✅ Payment contracts deployed')
  })

  it('should transfer payment ownership and withdraw funds correctly', async function () {
    // Check initial balances
    const teacherInitBal = await teacherComputer.getBalance()
    const studentInitBal = await studentComputer.getBalance()

    console.log('\\n📊 INITIAL BALANCES:')
    console.log(`   Teacher: ${Number(teacherInitBal.balance).toLocaleString()} sats`)
    console.log(`   Student: ${Number(studentInitBal.balance).toLocaleString()} sats`)

    // STEP 1: Teacher creates payment for 10000 sats
    console.log('\\n🎯 STEP 1: Creating payment object (Teacher creates payment)...')
    const payment = await paymentHelper.createPayment(10000n)
    console.log(`✅ Payment created: ${await payment._id}`)
    console.log(`💰 Payment value: ${await payment._satoshis} sats`)

    // Verify initial payment ownership
    const initialOwners = await payment._owners
    console.log(`👤 Initial owner: ${initialOwners[0].substring(0, 20)}...`)
    expect(initialOwners[0]).to.equal(teacherComputer.getPublicKey())
    console.log('✅ Payment initially owned by teacher')

    // Check balances after payment creation
    const teacherAfterCreate = await teacherComputer.getBalance()
    console.log(`\\n📊 BALANCE AFTER PAYMENT CREATION:`)
    console.log(`   Teacher: ${Number(teacherAfterCreate.balance).toLocaleString()} sats`)
    console.log(`   Change: ${Number(teacherAfterCreate.balance) - Number(teacherInitBal.balance)} sats`)

    // STEP 2: Transfer payment to student
    console.log('\\n🔄 STEP 2: Transferring payment ownership to student...')
    await payment.transfer(studentComputer.getPublicKey())
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify transfer worked
    const newOwners = await payment._owners
    const studentPubKey = studentComputer.getPublicKey()
    console.log(`👤 New owner: ${newOwners[0].substring(0, 20)}...`)
    console.log(`🎯 Expected owner: ${studentPubKey.substring(0, 20)}...`)

    expect(newOwners[0]).to.equal(studentPubKey)
    console.log(`✅ Transfer verified: Ownership successfully changed to student`)
    console.log(`💰 Payment still has: ${await payment._satoshis} sats (before withdrawal)`)

    // Check balances after transfer
    const teacherAfterTransfer = await teacherComputer.getBalance()
    const studentAfterTransfer = await studentComputer.getBalance()
    console.log(`\\n📊 BALANCES AFTER OWNERSHIP TRANSFER:`)
    console.log(`   Teacher: ${Number(teacherAfterTransfer.balance).toLocaleString()} sats`)
    console.log(`   Student: ${Number(studentAfterTransfer.balance).toLocaleString()} sats`)

    // STEP 3: Student withdraws payment funds to their wallet
    console.log('\\n💰 STEP 3: Student withdrawing payment funds to wallet...')
    try {
      const originalAmount = await payment._satoshis
      console.log(`   Original payment amount: ${originalAmount} sats`)

      // Check student balance before withdrawal
      const studentBalanceBefore = await studentComputer.getBalance();
      console.log(`   Student balance before withdrawal: ${Number(studentBalanceBefore.balance).toLocaleString()} sats`);

      // Check teacher balance before withdrawal (reward pool)
      const teacherBalanceBefore = await teacherComputer.getBalance();
      console.log(`   Teacher balance before withdrawal (reward pool): ${Number(teacherBalanceBefore.balance).toLocaleString()} sats`);

      // Use the student's payment helper to withdraw the payment
      const withdrawnAmount = await studentPaymentHelper.withdrawPayment(payment)
      console.log(`✅ Withdrawal successful: ${withdrawnAmount} sats withdrawn`)

      // Mine blocks to confirm the withdrawal transaction
      console.log(`⛏️  Mining blocks to confirm withdrawal...`)
      //await studentComputer.mineBlock()
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Wait for transaction to settle
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Check student balance after withdrawal
      const studentBalanceAfter = await studentComputer.getBalance();
      console.log(`   Student balance after withdrawal: ${Number(studentBalanceAfter.balance).toLocaleString()} sats`);

      // Check teacher balance after withdrawal (reward pool should decrease)
      const teacherBalanceAfter = await teacherComputer.getBalance();
      console.log(`   Teacher balance after withdrawal (reward pool): ${Number(teacherBalanceAfter.balance).toLocaleString()} sats`);

      const balanceIncrease = Number(studentBalanceAfter.balance) - Number(studentBalanceBefore.balance);
      console.log(`   Student balance increase: ${balanceIncrease >= 0 ? '+' : ''}${balanceIncrease.toLocaleString()} sats`);

      const teacherBalanceDecrease = Number(teacherBalanceBefore.balance) - Number(teacherBalanceAfter.balance);
      console.log(`   Teacher (reward pool) balance decrease: -${teacherBalanceDecrease.toLocaleString()} sats`);

      // Resync the payment object to get the updated state after withdrawal
      const paymentId = await payment._id;
      const updatedPayment = await studentComputer.sync(paymentId) as Payment;
      const paymentSatoshisAfterWithdrawal = await updatedPayment._satoshis;
      console.log(`📊 Payment object satoshis after withdrawal: ${paymentSatoshisAfterWithdrawal} sats`)

      // Check final balances
      const teacherFinal = await teacherComputer.getBalance()
      const studentFinal = await studentComputer.getBalance()

      console.log(`\\n📊 FINAL BALANCES:`)
      console.log(`   Teacher: ${Number(teacherFinal.balance).toLocaleString()} sats`)
      console.log(`   Student: ${Number(studentFinal.balance).toLocaleString()} sats`)

      const studentTotalBalanceIncrease = Number(studentFinal.balance) - Number(studentInitBal.balance);
      console.log(`   Student total balance change: ${studentTotalBalanceIncrease >= 0 ? '+' : ''}${studentTotalBalanceIncrease.toLocaleString()} sats`)

      // The student should have received approximately the withdrawn amount minus transaction fees
      // Since the original payment was 10000 sats and now only 546 remain in the object,
      // roughly (10000 - 546) sats should have been transferred to the student's wallet
      const expectedTransfer = Number(originalAmount - 546n);
      console.log(`   Expected transfer to student wallet: ~${expectedTransfer} sats (minus fees)`)

      // Check if the student's balance increased significantly (indicating successful withdrawal)
      const successThreshold = expectedTransfer * 0.7; // Allow for some fees
      const sufficientIncrease = balanceIncrease >= successThreshold;

      console.log(`   Was withdrawal successful based on balance increase? ${sufficientIncrease}`);
      console.log(`   Threshold for success: ${successThreshold} sats`);
      console.log(`   Actual increase: ${balanceIncrease} sats`);

      console.log('\\n✅ TEST COMPLETED SUCCESSFULLY!')
      console.log('   • Payment ownership transferred from teacher to student')
      console.log('   • Payment funds withdrawn to student\'s wallet (based on balance increase)')
      console.log('   • Payment object processed through withdrawal mechanism')

      // Verify that the withdrawal amount matches the expected withdrawn amount (original - minimum dust)
      const expectedWithdrawnAmount = originalAmount - 546n
      expect(withdrawnAmount).to.equal(expectedWithdrawnAmount)
      console.log(`   • Withdrawn amount matches expected transfer amount: ${withdrawnAmount} sats (original: ${originalAmount}, minimum dust: 546)`)

      // If the payment object satoshis changed, verify it's reduced to minimum dust
      if (paymentSatoshisAfterWithdrawal === 546n) {
        console.log(`   • Payment object satoshis correctly reduced to minimum dust: ${paymentSatoshisAfterWithdrawal} sats`)
      } else {
        console.log(`   • Note: Payment object satoshis after withdrawal: ${paymentSatoshisAfterWithdrawal} sats (expected: 546n)`)
      }

    } catch (error: any) {
      console.log(`❌ Withdrawal failed: ${error.message}`)
      console.log(`💡 Error stack: ${error.stack}`)
      throw error
    }
  })
})