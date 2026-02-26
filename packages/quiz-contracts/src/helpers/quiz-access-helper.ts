import { Computer } from '@bitcoin-computer/lib'
import { QuizAccess } from '../quiz-access.js'

export interface IQuizAccess {
  deploy(): Promise<string>
  mint(publicKey: string, quizId: string, amount: bigint, symbol: string): Promise<QuizAccess>
  balanceOf(publicKey: string, quizId: string): Promise<bigint>
  transfer(to: string, amount: bigint, quizId: string): Promise<void>
}

type MaybeQuizAccess = {
  quizId?: unknown
  amount?: unknown
  _owners?: unknown
}

export class QuizAccessHelper implements IQuizAccess {
  computer: Computer
  mod?: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${QuizAccess}`)
    return this.mod
  }

  async mint(publicKey: string, quizId: string, amount: bigint = 1n, symbol: string = 'QACC') {
  if (!this.mod) throw new Error('QuizAccessHelper not deployed')

  const exp = `new QuizAccess("${publicKey}", "${quizId}", ${amount}n, "${symbol}")`
  const encoded = await this.computer.encode({ exp, mod: this.mod })
  await this.computer.broadcast(encoded.tx)

  const res = encoded?.effect?.res as { _id?: string } | string | undefined
  const resId: string | undefined =
    (typeof res === 'object' && res !== null ? res._id : undefined) ??
    (typeof res === 'string' ? res : undefined)
  if (!resId) throw new Error('Mint failed: could not extract result ID')

  return (await this.computer.sync(resId)) as unknown as QuizAccess
}

  async createQuizAccess(quizId: string, amount: bigint = 1n): Promise<QuizAccess> {
    return this.mint(this.computer.getPublicKey(), quizId, amount, 'QACC')
  }

  private isQuizAccess(x: unknown): x is QuizAccess {
    if (!x || typeof x !== 'object') return false
    const o = x as MaybeQuizAccess
    return typeof o.quizId === 'string' && typeof o.amount === 'bigint' && Array.isArray(o._owners)
  }

  private async getBags(publicKey: string, quizId: string): Promise<QuizAccess[]> {
    // With getUtxos() we can only see this Computer's wallet UTXOs.
    // So enforce that caller matches this wallet.
    if (publicKey !== this.computer.getPublicKey()) {
      throw new Error('balanceOf/transfer require a QuizAccessHelper created with the same wallet as publicKey')
    }

    const revs: string[] = await this.computer.getUtxos()
    const objs: unknown[] = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))

    const bags = objs.filter((obj: unknown) => this.isQuizAccess(obj) && obj.quizId === quizId) as QuizAccess[]
    return bags
  }

  async balanceOf(publicKey: string, quizId: string): Promise<bigint> {
    const bags = await this.getBags(publicKey, quizId)
    return bags.reduce((sum: bigint, bag: QuizAccess) => sum + bag.amount, 0n)
  }

  async transfer(to: string, amount: bigint, quizId: string): Promise<void> {
    const owner = this.computer.getPublicKey()
    const bags = await this.getBags(owner, quizId)

    let remaining = amount
    while (remaining > 0n && bags.length > 0) {
      const bag = bags.shift()
      if (!bag) break
      const available = remaining < bag.amount ? remaining : bag.amount
      bag.transfer(to, available)
      remaining -= available
    }

    if (remaining > 0n) throw new Error('Could not send entire amount')
  }
}