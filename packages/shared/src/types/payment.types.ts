/**
 * Payment-related types
 */
export interface PaymentData {
  id: string
  satoshis: bigint
  owners: string[]
}

export interface WithdrawResult {
  withdrawnAmount: bigint
  txId: string
}

/**
 * Quiz access token types
 */
export interface QuizAccessData {
  quizId: string
  amount: bigint
  symbol: string
  owners: string[]
}

/**
 * Sale offer types
 */
export interface SaleOfferData {
  quizId: string
  price: bigint
  offerTx: string
}
