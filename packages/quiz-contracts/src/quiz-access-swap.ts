import { Contract, Transaction } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'
import { Payment } from './payment.js'

export class QuizAccessSwap extends Contract {
  static exec(
    quizAccess: QuizAccess,
    payment: Payment
  ) {
    // EXECUTE SWAP: Transfer ownership
    const [ownerAccess] = quizAccess._owners  // Currently teacher owns the access right
    const [ownerPayment] = payment._owners   // Currently student owns the payment
    
    quizAccess.transfer(ownerPayment)  // Quiz access → student (right to attempt quiz)
    payment.transfer(ownerAccess)      // Payment → teacher (entry fee)
  }
}

export class QuizAccessSwapHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${QuizAccessSwap}`)
    return this.mod
  }

  async createSwapTx(quizAccess: QuizAccess, payment: Payment): Promise<{ tx: Transaction; effect: { res: any; env: any } }> {
    return this.computer.encode({
      exp: `QuizAccessSwap.exec(quizAccess, payment)`,
      env: { 
        quizAccess: quizAccess._rev, 
        payment: payment._rev
      },
      mod: this.mod,
    })
  }

  async checkSwapTx(tx: Transaction, expectedQuizAccessOwner: string, expectedPaymentOwner: string) {
    const { exp, env, mod } = await this.computer.decode(tx)
    if (exp !== 'QuizAccessSwap.exec(quizAccess, payment)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    const {
      effect: { res: r, env: e },
    } = await this.computer.encode({ exp, env, mod })

    if (r !== undefined) throw new Error('Unexpected result')
    if (Object.keys(e).toString() !== 'quizAccess,payment') throw new Error('Unexpected environment')

    const { quizAccess, payment } = e

    // Check that after the swap, the access right goes to the expected owner and payment goes to the expected owner
    if ((quizAccess as any)._owners.toString() !== expectedQuizAccessOwner) throw new Error('Quiz access should go to expected owner')
    if ((payment as any)._owners.toString() !== expectedPaymentOwner) throw new Error('Payment should go to expected owner')

    return e
  }
}