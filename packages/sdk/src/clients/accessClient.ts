import { Computer } from '@bitcoin-computer/lib'
import { QuizAccessHelper, QuizAccessSaleHelper } from '@quiz-app/contracts'
import type { QuizAccessData, SaleOfferData } from '@quiz-app/shared'

/**
 * AccessClient - Clean interface for quiz access token operations
 */
export class AccessClient {
  private computer: Computer
  private accessHelper: QuizAccessHelper
  private saleHelper: QuizAccessSaleHelper

  constructor(computer: Computer, accessMod?: string, saleMod?: string) {
    this.computer = computer
    this.accessHelper = new QuizAccessHelper(computer, accessMod)
    this.saleHelper = new QuizAccessSaleHelper(computer, saleMod)
  }

  /**
   * Deploy access and sale modules
   */
  async deploy() {
    const accessMod = await this.accessHelper.deploy()
    const saleMod = await this.saleHelper.deploy()
    return { accessMod, saleMod }
  }

  /**
   * Mint access tokens
   */
  async mintAccess(
    publicKey: string,
    quizId: string,
    amount: bigint = 1n,
    symbol: string = 'QACC'
  ) {
    return await this.accessHelper.mint(publicKey, quizId, amount, symbol)
  }

  /**
   * Create an access token for a quiz
   */
  async createQuizAccess(quizId: string, amount: bigint = 1n) {
    return await this.accessHelper.createQuizAccess(quizId, amount)
  }

  /**
   * Get access token balance for a public key and quiz
   */
  async getBalance(publicKey: string, quizId: string): Promise<bigint> {
    return await this.accessHelper.balanceOf(publicKey, quizId)
  }

  /**
   * Transfer access tokens
   */
  async transfer(to: string, amount: bigint, quizId: string) {
    return await this.accessHelper.transfer(to, amount, quizId)
  }

  /**
   * Create a sale offer transaction
   */
  async createOfferTx(accessToken: any, paymentMock: any) {
    return await this.saleHelper.createOfferTx(accessToken, paymentMock)
  }

  /**
   * Check and verify an offer transaction
   */
  async checkOfferTx(tx: any): Promise<bigint> {
    return await this.saleHelper.checkOfferTx(tx)
  }

  /**
   * Finalize an offer transaction (static method)
   */
  static finalizeOfferTx(tx: any, payment: any, scriptPubKey: any) {
    return QuizAccessSaleHelper.finalizeOfferTx(tx, payment, scriptPubKey)
  }
}
