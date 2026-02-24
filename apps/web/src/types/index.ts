/**
 * Local type definitions — replaces @quiz-app/shared types
 */

// Blockchain config types
export type Chain = 'LTC' | 'BTC' | 'DOGE'
export type Network = 'mainnet' | 'testnet' | 'regtest'

export interface ComputerConfig {
  chain: Chain
  network: Network
  url: string
  path?: string
  mnemonic?: string
}

// Quiz data passed when creating a quiz
export interface QuizData {
  title: string
  questionText: string
  options: string[]
  correctAnswer: number
  rewardAmount: bigint
  entryFee: bigint
  paymentTxId: string
}

// Utility functions (previously from @quiz-app/shared)
export function formatSatsToBTC(sats: bigint): string {
  const btc = Number(sats) / 100_000_000
  return btc.toFixed(8)
}

export function formatSats(sats: bigint): string {
  return sats.toLocaleString() + ' sats'
}

export function truncatePublicKey(pubKey: string, startChars = 10, endChars = 8): string {
  if (pubKey.length <= startChars + endChars) return pubKey
  return `${pubKey.slice(0, startChars)}...${pubKey.slice(-endChars)}`
}

export function truncateTxId(txId: string, startChars = 8, endChars = 8): string {
  if (txId.length <= startChars + endChars) return txId
  return `${txId.slice(0, startChars)}...${txId.slice(-endChars)}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export function isValidAnswerIndex(index: number, optionsCount = 4): boolean {
  return index >= 0 && index < optionsCount
}
