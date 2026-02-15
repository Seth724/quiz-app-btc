import { Computer } from '@bitcoin-computer/lib'
import type { ComputerConfig } from '@quiz-app/shared'

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
