// import { expect } from 'chai'
// import { Computer } from '@bitcoin-computer/lib'
// import { config } from 'dotenv'
// import { TeacherHelper } from '../src/helpers/teacher-helper-new.js'
// import { StudentHelper } from '../src/helpers/student-helper-new.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'
// import { Question } from '../src/quiz.js'
// import { Payment } from '../src/payment.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'

// describe('Payment Transfer Test', function () {
//   let teacherComputer: Computer
//   let studentComputer: Computer
//   let teacherHelper: TeacherHelper
//   let studentHelper: StudentHelper
//   let paymentHelper: PaymentHelper

//   before(async function() {
//     this.timeout(60000) // 1 minute timeout
    
//     // Create computers for different users
//     teacherComputer = new Computer({ chain, network, url, path: "m/44'/0'/0'/0/0" })
//     studentComputer = new Computer({ chain, network, url, path: "m/44'/0'/0'/0/1" })
    
//     teacherHelper = new TeacherHelper(teacherComputer)
//     studentHelper = new StudentHelper(studentComputer)
//     paymentHelper = new PaymentHelper(teacherComputer)

//     // Fund wallets for regtest
//     if (network === 'regtest') {
//       await teacherComputer.faucet(1e8)
//       await studentComputer.faucet(1e8)
//     }
//   })

//   it('should transfer payment from teacher to student', async function() {
//     this.timeout(120000) // 2 minute timeout

//     console.log('\n💳 Testing payment transfer mechanism')

//     // Create a simple payment
//     console.log('📝 Teacher creating payment...')
//     const payment = await paymentHelper.createPayment(BigInt(5000))
//     expect(payment._satoshis).to.equal(BigInt(5000))
//     console.log(`✅ Payment created: ${payment._id} (${payment._satoshis} sats)`)
//     console.log(`💰 Initial owner: ${payment._owners[0]}`)

//     // Verify initial ownership
//     expect(payment._owners).to.include(teacherComputer.getPublicKey())

//     // Transfer payment to student
//     console.log('💸 Transferring payment to student...')
//     const studentPublicKey = studentComputer.getPublicKey()
//     console.log(`👤 Student public key: ${studentPublicKey}`)

//     try {
//       // Transfer payment directly
//       payment.transfer(studentPublicKey)
//       console.log('✅ Transfer completed')

//       // Mine blocks to confirm transfer
//       await paymentHelper.mineBlock()

//       // Get the updated payment to verify the transfer - IMPORTANT: sync from student's perspective
//       const studentPaymentHelper = new PaymentHelper(studentComputer)
//       const updatedPayment = await studentPaymentHelper.getPayment(payment._id)
//       console.log(`💰 Updated owner: ${updatedPayment._owners[0]}`)
      
//       // Verify ownership transfer
//       expect(updatedPayment._owners).to.include(studentPublicKey)
//       console.log('🎉 Payment ownership transfer successful!')

//     } catch (error) {
//       console.log('❌ Transfer failed:', (error as Error).message)
//       throw error
//     }
//   })
// })