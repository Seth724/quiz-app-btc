/**
 * Wallet Service - Handle wallet operations
 */

'use client'

import { Computer } from '@bitcoin-computer/lib'
import { createComputerFromStorage } from '@/services'
import type { Chain, Network } from '@quiz-app/shared'

export interface WalletInfo {
  publicKey: string
  address: string
  balance: bigint
}

type BalanceObj = {
  confirmed?: unknown
  unconfirmed?: unknown
  balance?: unknown
}

const toBigInt = (v: unknown): bigint => {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number') return BigInt(Math.trunc(v))
  if (typeof v === 'string') return BigInt(v)
  throw new Error(`Invalid bigint value: ${String(v)}`)
}

const normalizeBalance = (raw: unknown): bigint => {
  if (raw && typeof raw === 'object') {
    const b = raw as BalanceObj
    if (b.balance !== undefined) return toBigInt(b.balance)
  }
  return toBigInt(raw)
}

/**
 * Get wallet information from Computer
 */
export async function getWalletInfo(computer: Computer): Promise<WalletInfo> {
  const publicKey = computer.getPublicKey()
  const address = computer.getAddress()
  const rawBalance = await computer.getBalance()
  const balance = normalizeBalance(rawBalance)

  return {
    publicKey,
    address,
    balance,
  }
}

/**
 * Fund wallet (regtest only)
 */
export async function fundWallet(computer: Computer, amount: number = 1e8): Promise<void> {
  await computer.faucet(amount)
}

/**
 * Connect wallet with mnemonic
 */
export function connectWallet(mnemonic: string, chain: Chain, network: Network, url: string, path?: string) {
  if (typeof window === 'undefined') return

  localStorage.setItem('BIP_39_KEY', mnemonic)
  localStorage.setItem('CHAIN', chain)
  localStorage.setItem('NETWORK', network)
  localStorage.setItem('URL', url)
  if (path) {
    localStorage.setItem('PATH', path)
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('BIP_39_KEY')
  localStorage.removeItem('CHAIN')
  localStorage.removeItem('NETWORK')
  localStorage.removeItem('URL')
  localStorage.removeItem('PATH')
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('BIP_39_KEY')
}

/**
 * Get stored wallet config
 */
export function getStoredWalletConfig() {
  if (typeof window === 'undefined') return null

  return {
    mnemonic: localStorage.getItem('BIP_39_KEY'),
    chain: localStorage.getItem('CHAIN') as Chain,
    network: localStorage.getItem('NETWORK') as Network,
    url: localStorage.getItem('URL'),
    path: localStorage.getItem('PATH'),
  }
}

/**
 * Generate new mnemonic
 */
export function generateMnemonic(): string {
  const computer = new Computer()
  return computer.getMnemonic()
}
