import { Computer } from '@bitcoin-computer/lib'
import type { ComputerConfig } from '../types/index.js'

/**
 * Format satoshis to BTC string
 */
export function formatSatsToBTC(sats: bigint): string {
  const btc = Number(sats) / 100_000_000
  return btc.toFixed(8)
}

/**
 * Format satoshis to human-readable string
 */
export function formatSats(sats: bigint): string {
  return sats.toLocaleString() + ' sats'
}

/**
 * Truncate public key for display
 */
export function truncatePublicKey(pubKey: string, startChars = 10, endChars = 8): string {
  if (pubKey.length <= startChars + endChars) return pubKey
  return `${pubKey.slice(0, startChars)}...${pubKey.slice(-endChars)}`
}

/**
 * Truncate transaction ID for display
 */
export function truncateTxId(txId: string, startChars = 8, endChars = 8): string {
  if (txId.length <= startChars + endChars) return txId
  return `${txId.slice(0, startChars)}...${txId.slice(-endChars)}`
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

/**
 * Validate answer index
 */
export function isValidAnswerIndex(index: number, optionsCount = 4): boolean {
  return index >= 0 && index < optionsCount
}

/**
 * Create a Computer instance with the given configuration
 */
export function createComputer(config: ComputerConfig): Computer {
  const { chain, network, url, path, mnemonic } = config

  return new Computer({
    chain,
    network,
    url,
    path,
    mnemonic
  })
}

/**
 * Create a read-only Computer instance (for querying without wallet)
 */
export function createReadOnlyComputer(config: Pick<ComputerConfig, 'chain' | 'network' | 'url'>): Computer {
  return new Computer({
    chain: config.chain,
    network: config.network,
    url: config.url
  })
}
