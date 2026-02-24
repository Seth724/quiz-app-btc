/**
 * Utility functions for the Quiz App
 */

// Re-export utilities from local types
export {
  formatSatsToBTC,
  formatSats,
  truncatePublicKey,
  truncateTxId,
  formatTimestamp,
  isValidAnswerIndex
} from '@/types'

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * Format error message
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
