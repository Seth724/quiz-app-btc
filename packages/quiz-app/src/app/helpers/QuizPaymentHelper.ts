// import { Computer } from '@bitcoin-computer/lib'

// export class QuizPaymentHelper {
//   computer: Computer

//   constructor(computer: Computer) {
//     this.computer = computer
//   }

//   /**
//    * Create a payment for quiz rewards
//    */
//   async createQuizPayment(amount: bigint): Promise<string> {
//     const paymentModSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
//     if (!paymentModSpec) {
//       throw new Error('Payment module spec not found. Please deploy contracts first.')
//     }
    
//     // Load the deployed module and extract the Payment class
//     const moduleExports = await this.computer.load(paymentModSpec)
//     const PaymentClass = (moduleExports as any).Payment || (moduleExports as any).default
//     if (!PaymentClass) {
//       throw new Error('Payment class not found in deployed module')
//     }
    
//     const payment = await this.computer.new(PaymentClass, [amount])
//     return payment._id
//   }

//   /**
//    * Transfer payment to student
//    */
//   async transferPaymentToStudent(paymentId: string, studentPublicKey: string): Promise<void> {
//     const payment = await this.computer.sync(paymentId)
//     await payment.transfer(studentPublicKey)
//   }

//   /**
//    * Get payment details
//    */
//   async getPaymentDetails(paymentId: string) {
//     return await this.computer.sync(paymentId)
//   }

//   /**
//    * Create and transfer payment in one step
//    */
//   async createAndTransferPayment(amount: bigint, recipientPublicKey: string): Promise<string> {
//     const paymentModSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
//     if (!paymentModSpec) {
//       throw new Error('Payment module spec not found. Please deploy contracts first.')
//     }
    
//     // Load the deployed module and extract the Payment class
//     const moduleExports = await this.computer.load(paymentModSpec)
//     const PaymentClass = (moduleExports as any).Payment || (moduleExports as any).default
//     if (!PaymentClass) {
//       throw new Error('Payment class not found in deployed module')
//     }
    
//     // Create payment with the reward amount
//     const payment = await this.computer.new(PaymentClass, [amount])
    
//     // Wait for payment creation confirmation
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     // Transfer ownership to recipient
//     await payment.transfer(recipientPublicKey)
    
//     return payment._id
//   }

//   /**
//    * Check payment ownership
//    */
//   async isPaymentOwnedBy(paymentId: string, publicKey: string): Promise<boolean> {
//     try {
//       const payment = await this.computer.sync(paymentId)
//       return payment._owners.includes(publicKey)
//     } catch (error) {
//       console.error('Error checking payment ownership:', error)
//       return false
//     }
//   }

//   /**
//    * Get payment balance
//    */
//   async getPaymentAmount(paymentId: string): Promise<bigint> {
//     try {
//       const payment = await this.computer.sync(paymentId)
//       return payment._satoshis
//     } catch (error) {
//       console.error('Error getting payment amount:', error)
//       return 0n
//     }
//   }

//   /**
//    * List payments owned by a public key
//    */
//   async getPaymentsOwnedBy(publicKey: string): Promise<any[]> {
//     try {
//       const revs = await this.computer.query({ publicKey })
//       const payments: any[] = []
      
//       for (const rev of revs) {
//         try {
//           const obj = await this.computer.sync(rev)
//           // Check if this is a Payment object
//           if (obj && typeof obj === 'object' && '_satoshis' in obj && '_owners' in obj) {
//             payments.push(obj)
//           }
//         } catch (error) {
//           // Skip objects that can't be synced or aren't payments
//           continue
//         }
//       }
      
//       return payments
//     } catch (error) {
//       console.error('Error getting owned payments:', error)
//       return []
//     }
//   }
// }