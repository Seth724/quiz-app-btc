import { Contract } from '@bitcoin-computer/lib'

type Constructor<T> = {
  new (to: string, quizId: string, amount: bigint, symbol: string): T
}

/**
 * Fungible Quiz Access Token (UTXO bag model)
 *
 * - quizId: which quiz this access is for
 * - amount: how many "access units" this bag holds (usually 1n)
 * - burn(1n): consume one access unit (used when attempting the quiz)
 *
 * This replaces the old "NFT-like" access token + used flag.
 */
export class QuizAccess extends Contract {
  quizId!: string
  amount!: bigint
  symbol!: string
  _owners!: string[]

  constructor(to: string, quizId: string, amount: bigint = 1n, symbol = 'QACC') {
    super({ _owners: [to], quizId, amount, symbol })
  }

  /**
   * Transfer ownership.
   * - If amount is undefined: transfer the whole bag to `to`.
   * - If amount is provided: split `amount` into a NEW bag owned by `to`.
   */
  transfer(to: string, amount?: bigint): QuizAccess | undefined {
    if (typeof amount === 'undefined') {
      // Send entire bag
      this._owners = [to]
      return undefined
    }

    if (amount <= 0n) throw new Error('Amount must be positive')

    if (this.amount >= amount) {
      // Split into a new bag
      this.amount -= amount
      const ctor = this.constructor as Constructor<this>
      return new ctor(to, this.quizId, amount, this.symbol) as unknown as QuizAccess
    }

    throw new Error('Insufficient access balance')
  }

  /**
   * Burn access units in this bag.
   * Default: burn everything (amount -> 0).
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