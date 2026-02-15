/**
 * Blockchain configuration types
 */
export type Chain = 'LTC' | 'BTC' | 'DOGE'
export type Network = 'mainnet' | 'testnet' | 'regtest'

export interface BlockchainConfig {
  chain: Chain
  network: Network
  url: string
}

/**
 * Computer configuration (extends BlockchainConfig)
 */
export interface ComputerConfig extends BlockchainConfig {
  path?: string
  mnemonic?: string
}

/**
 * Module specifications for deployed contracts
 */
export interface ModuleSpecs {
  teacherMod: string
  studentMod: string
  quizMod: string
  attemptMod: string
  paymentMod: string
  quizAccessMod?: string
  quizAccessSaleMod?: string
}
