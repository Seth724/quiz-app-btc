/**
 * SDK Factory - Creates SDK clients from wallet/config
 */

import { Computer } from '@bitcoin-computer/lib'
import { createComputer } from '@quiz-app/sdk'
import type { ComputerConfig, Chain, Network } from '@quiz-app/shared'

export interface SDKFactoryConfig {
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

  return createComputer(computerConfig)
}

/**
 * Create Computer from localStorage (for bc components)
 */
export function createComputerFromStorage(): Computer {
  const mnemonic = typeof window !== 'undefined' ? localStorage.getItem('BIP_39_KEY') : null
  const chain = typeof window !== 'undefined' ? (localStorage.getItem('CHAIN') as Chain) : 'LTC'
  const network = typeof window !== 'undefined' ? (localStorage.getItem('NETWORK') as Network) : 'regtest'
  const url = typeof window !== 'undefined' ? localStorage.getItem('URL') : 'http://localhost:1031'
  const path = typeof window !== 'undefined' ? localStorage.getItem('PATH') : undefined

  const config: any = { chain, network, url }
  if (mnemonic) config.mnemonic = mnemonic
  if (path) config.path = path

  return new Computer(config)
}
