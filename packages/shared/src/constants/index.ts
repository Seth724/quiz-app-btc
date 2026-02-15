/**
 * Blockchain constants
 */
export const SATOSHIS_PER_BTC = 100_000_000n
export const MIN_DUST_AMOUNT = 546n

/**
 * Default blockchain configurations
 */
export const DEFAULT_REGTEST_CONFIG = {
  chain: 'LTC' as const,
  network: 'regtest' as const,
  url: 'http://localhost:1031'
}

export const DEFAULT_TESTNET_CONFIG = {
  chain: 'LTC' as const,
  network: 'testnet' as const,
  url: 'https://node.litecointest.net'
}

export const DEFAULT_MAINNET_CONFIG = {
  chain: 'LTC' as const,
  network: 'mainnet' as const,
  url: 'https://node.litecoin.org'
}

/**
 * Quiz constants
 */
export const MIN_QUIZ_REWARD = 1000n // 1000 satoshis
export const MIN_ENTRY_FEE = 100n // 100 satoshis
export const QUIZ_OPTIONS_COUNT = 4

/**
 * Access token constants
 */
export const DEFAULT_ACCESS_SYMBOL = 'QACC'
export const DEFAULT_ACCESS_AMOUNT = 1n
