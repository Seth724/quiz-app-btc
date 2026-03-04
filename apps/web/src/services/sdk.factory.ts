/**
 * SDK Factory - Creates SDK clients from wallet/config
 */

import { Computer } from '@bitcoin-computer/lib'
import type { Chain, Network } from '@/types'
import { CHAIN, NETWORK, BASE_URL } from '@/config/env'

export interface SDKFactoryConfig {
  chain: Chain
  network: Network
  url: string
  mnemonic?: string
  path?: string
}

export interface ComputerConfig {
  chain: Chain
  network: Network
  url: string
  mnemonic?: string
  path?: string
}

/**
 * Create Computer instance with config
 */
export function createComputerInstance(config: SDKFactoryConfig): Computer {
  const computerConfig: ComputerConfig = {
    chain: config.chain,
    network: config.network,
    url: config.url,
  }

  if (config.mnemonic) {
    computerConfig.mnemonic = config.mnemonic
  }

  if (config.path) {
    computerConfig.path = config.path
  }

  return new Computer(computerConfig)
}

/**
 * Create Computer from localStorage (for bc components).
 * Falls back to environment-configured defaults if localStorage values are missing.
 * Returns null if no mnemonic is available (wallet not connected).
 */
export function createComputerFromStorage(): Computer | null {
  if (typeof window === 'undefined') {
    return null
  }

  const mnemonic = localStorage.getItem('BIP_39_KEY')
  if (!mnemonic) {
    // No wallet connected yet — return null so callers can handle gracefully
    return null
  }

  const chain = (localStorage.getItem('CHAIN') as Chain | null) || CHAIN
  const network = (localStorage.getItem('NETWORK') as Network | null) || NETWORK
  const url = localStorage.getItem('URL') || BASE_URL
  const path = localStorage.getItem('PATH')

  const config: ComputerConfig = { chain, network, url, mnemonic }
  if (path) config.path = path

  return new Computer(config)
}