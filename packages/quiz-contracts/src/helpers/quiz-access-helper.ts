import type { Computer } from '@bitcoin-computer/lib'
import { loadExportedClass } from './contract-loader.js'

export interface IQuizAccess {
  deploy(): Promise<string>
  mint(publicKey: string, quizId: string, amount: bigint, symbol: string): Promise<any>
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
  quizAccessMod: string

  constructor(computer: Computer, quizAccessMod: string) {
    this.computer = computer
    this.quizAccessMod = quizAccessMod
  }

  async deploy(): Promise<string> {
    const QuizAccess = await loadExportedClass<any>(this.computer, this.quizAccessMod, 'QuizAccess')
    const mod = await this.computer.deploy(`export ${QuizAccess}`)
    return mod
  }

  async mint(publicKey: string, quizId: string, amount: bigint = 1n, symbol: string = 'QACC'): Promise<any> {
    const QuizAccess = await loadExportedClass<any>(this.computer, this.quizAccessMod, 'QuizAccess')
    const token = await this.computer.new(QuizAccess, [publicKey, quizId, amount, symbol])
    return token
  }

  async createQuizAccess(quizId: string, amount: bigint = 1n): Promise<any> {
    return this.mint(this.computer.getPublicKey(), quizId, amount, 'QACC')
  }

  private isQuizAccess(x: unknown): x is any {
    if (!x || typeof x !== 'object') return false
    const o = x as MaybeQuizAccess
    return typeof o.quizId === 'string' && typeof o.amount === 'bigint' && Array.isArray(o._owners)
  }

  private async getBags(publicKey: string, quizId: string): Promise<any[]> {
    if (publicKey !== this.computer.getPublicKey()) {
      throw new Error('balanceOf/transfer require a QuizAccessHelper created with the same wallet as publicKey')
    }

    const revs: string[] = await this.computer.getUtxos()
    const objs: unknown[] = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))

    const bags = objs.filter((obj: unknown) => this.isQuizAccess(obj) && (obj as any).quizId === quizId) as any[]
    return bags
  }

  async balanceOf(publicKey: string, quizId: string): Promise<bigint> {
    const bags = await this.getBags(publicKey, quizId)
    return bags.reduce((sum: bigint, bag: any) => sum + bag.amount, 0n)
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
