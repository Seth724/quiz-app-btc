import { Computer } from '@bitcoin-computer/lib'

/**
 * Utility class for common blockchain operations
 * Provides sync, mining, and waiting utilities used across tests and helpers
 */
export class BlockchainUtils {
  private computer: Computer
  private url: string
  private chain: string
  private network: string

  constructor(computer: Computer) {
    this.computer = computer
    // Extract connection details from computer config
    this.url = (computer as any).config?.url || process.env.BCN_URL || 'http://localhost:1031'
    this.chain = (computer as any).config?.chain || process.env.BCN_CHAIN || 'LTC'
    this.network = (computer as any).config?.network || process.env.BCN_NETWORK || 'regtest'
  }

  /**
   * Sleep for specified milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Mine blocks on regtest network
   */
  async mineBlocks(blocks: number = 1): Promise<void> {
    if (this.network !== 'regtest') {
      console.warn('mineBlocks only works on regtest network')
      return
    }

    try {
      const response = await fetch(`${this.url}/v1/${this.chain}/${this.network}/mine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      })

      if (!response.ok) {
        throw new Error(`Failed to mine blocks: ${response.statusText}`)
      }

      // Wait for blocks to be processed
      await BlockchainUtils.sleep(1000)
    } catch (error) {
      console.error('Error mining blocks:', error)
      throw error
    }
  }

  /**
   * Sync with latest state, mining if necessary
   * Tries to sync, and if it fails, mines a block and retries
   */
  async syncOrMine<T>(id: string, maxRetries: number = 3): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < maxRetries; i++) {
      try {
        return (await this.computer.sync(id)) as unknown as T
      } catch (error) {
        lastError = error as Error

        // If sync fails and we're on regtest, mine a block and retry
        if (this.network === 'regtest' && i < maxRetries - 1) {
          await this.mineBlocks(1)
          await BlockchainUtils.sleep(500)
        }
      }
    }

    throw lastError || new Error(`Failed to sync ${id} after ${maxRetries} retries`)
  }

  /**
   * Wait for transaction to be confirmed
   */
  async waitForConfirmation(txId: string, timeoutMs: number = 30000): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      try {
        const tx = await this.computer.sync(txId)
        if (tx) return
      } catch {
        // Transaction not yet available
      }

      await BlockchainUtils.sleep(1000)
    }

    throw new Error(`Transaction ${txId} not confirmed within ${timeoutMs}ms`)
  }

  /**
   * Get latest revision for an ID
   */
  async getLatestRev(id: string): Promise<string> {
    try {
      return await this.computer.getLatestRev(id)
    } catch {
      // If getLatestRev fails, return the ID itself
      return id
    }
  }

  /**
   * Sync to latest revision
   */
  async syncLatest<T>(id: string): Promise<T> {
    const rev = await this.getLatestRev(id)
    return (await this.computer.sync(rev)) as unknown as T
  }

  /**
   * Fund wallet on regtest
   */
  async fundWallet(amount: number): Promise<{ txId: string; vout: number }> {
    if (this.network !== 'regtest') {
      throw new Error('faucet only works on regtest network')
    }

    return await this.computer.faucet(amount)
  }

  /**
   * Get balance with retry logic
   */
  async getBalance(address?: string): Promise<{ balance: bigint; confirmed: bigint; unconfirmed: bigint }> {
    try {
      return await this.computer.getBalance(address)
    } catch (error) {
      // If balance query fails, try mining a block and retrying
      if (this.network === 'regtest') {
        await this.mineBlocks(1)
        await BlockchainUtils.sleep(500)
        return await this.computer.getBalance(address)
      }
      throw error
    }
  }
}

/**
 * Helper function to create BlockchainUtils instance
 */
export function createBlockchainUtils(computer: Computer): BlockchainUtils {
  return new BlockchainUtils(computer)
}
