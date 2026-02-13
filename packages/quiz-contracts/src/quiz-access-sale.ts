import { Contract } from '@bitcoin-computer/lib'
import { QuizAccess } from './quiz-access.js'
import { Payment } from './payment.js'

export class QuizAccessSale extends Contract {
  static exec(o: QuizAccess, p: Payment) {
    const [seller] = o._owners
    const [buyer] = p._owners

    o.transfer(buyer)
    p.transfer(seller)

    return [p, o]
  }
}