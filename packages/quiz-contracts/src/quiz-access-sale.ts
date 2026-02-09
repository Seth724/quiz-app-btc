import { Contract } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'
import { Payment } from './payment.js'

/**
 * Sale-style atomic exchange:
 * - access (o) goes to buyer (owner of payment)
 * - payment (p) goes to seller (current owner of access)
 *
 * Return order matters: [p, o] => output0 is payment, output1 is access.
 */
export class QuizAccessSale extends Contract {
  static exec(o: QuizAccess, p: Payment) {
    const [seller] = o._owners
    const [buyer] = p._owners

    o.transfer(buyer)
    p.transfer(seller)

    return [p, o]
  }
}