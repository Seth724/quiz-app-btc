/**
 * Transaction Parser - Decode Bitcoin Computer transactions for UI display
 */

import type { Computer } from '@bitcoin-computer/lib'

export interface ParsedTransaction {
  txId: string
  inputs: ParsedInput[]
  outputs: ParsedOutput[]
  fee: number
  timestamp?: number
}

export interface ParsedInput {
  address: string
  value: number
  prevTxId: string
  prevIndex: number
}

export interface ParsedOutput {
  address: string
  value: number
  index: number
  isChange?: boolean
}

/**
 * Parse transaction data from Computer
 */
export async function parseTransaction(
  computer: Computer,
  txId: string
): Promise<ParsedTransaction | null> {
  try {
    // This is a simplified parser. Extend based on your needs
    const tx = await (computer as unknown as { provider: { blockchain: { tx: { fetch: (id: string) => Promise<Record<string, unknown> | null> } } } }).provider.blockchain.tx.fetch(txId)
    
    if (!tx) return null

    const vin = tx.vin as Array<{ addr?: string; value?: number; txid: string; vout: number }> | undefined
    const vout = tx.vout as Array<{ scriptPubKey?: { addresses?: string[] }; value?: number }> | undefined

    return {
      txId,
      inputs: vin?.map((input) => ({
        address: input.addr || 'Unknown',
        value: input.value || 0,
        prevTxId: input.txid,
        prevIndex: input.vout,
      })) || [],
      outputs: vout?.map((output, index: number) => ({
        address: output.scriptPubKey?.addresses?.[0] || 'Unknown',
        value: output.value || 0,
        index,
      })) || [],
      fee: 0, // Calculate from inputs/outputs if needed
      timestamp: tx.time as number | undefined,
    }
  } catch (error) {
    console.error('Failed to parse transaction:', error)
    return null
  }
}

/**
 * Get transaction URL for block explorer
 */
export function getExplorerUrl(
  txId: string,
  chain: string,
  network: string
): string {
  if (network === 'regtest' || network === 'testnet') {
    return `#` // No explorer for regtest
  }

  if (chain === 'BTC') {
    return `https://blockstream.info/tx/${txId}`
  }

  if (chain === 'LTC') {
    return `https://blockexplorer.one/litecoin/mainnet/tx/${txId}`
  }

  return '#'
}

/**
 * Format satoshis to readable amount
 */
export function formatSatoshis(satoshis: number | bigint, decimals: number = 8): string {
  const amount = Number(satoshis) / Math.pow(10, decimals)
  return amount.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * Parse smart object revision
 */
export function parseRevision(rev: string): { txId: string; index: number } | null {
  const parts = rev.split(':')
  if (parts.length !== 2) return null
  
  return {
    txId: parts[0],
    index: parseInt(parts[1], 10),
  }
}
