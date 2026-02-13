import { Contract } from '@bitcoin-computer/lib'

type Constructor<T> = new (...args: unknown[]) => T

/**
 * Fungible Quiz Access Token (UTXO bag model)
 *
 * - quizId: which quiz this access is for
 * - amount: number of attempts allowed (usually 1n)
 * - burn(1n): consumes one attempt
 */
export class QuizAccess extends Contract {
  quizId!: string
  amount!: bigint
  symbol!: string
  _owners!: string[]

  constructor(to: string, quizId: string, amount: bigint = 1n, symbol: string = 'QACC') {
    super({ _owners: [to], quizId, amount, symbol })
  }

  /**
   * Transfer ownership:
   * - transfer(to): sends whole bag
   * - transfer(to, amount): splits `amount` into a NEW bag owned by `to`
   */
  transfer(to: string, amount?: bigint): QuizAccess | undefined {
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return undefined
    }

    if (amount <= 0n) throw new Error('Amount must be positive')
    if (amount > this.amount) throw new Error('Insufficient access balance')

    this.amount -= amount
    const ctor = this.constructor as unknown as Constructor<this>
    return new ctor(to, this.quizId, amount, this.symbol) as unknown as QuizAccess
  }

  /**
   * Burn access units from this bag.
   * Default: burn all remaining units.
   */
  burn(amount: bigint = this.amount) {
    if (amount < 0n) throw new Error('Amount must be non-negative')
    if (amount > this.amount) throw new Error('Insufficient access balance')
    this.amount -= amount
  }

  /**
   * Merge other bags of the SAME quiz into this bag.
   */
  merge(tokens: QuizAccess[]) {
    let total = 0n
    tokens.forEach((t) => {
      if (t.quizId !== this.quizId) throw new Error('Cannot merge different quizzes')
      total += t.amount
      t.burn()
    })
    this.amount += total
  }
}