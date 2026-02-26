/**
 * Application constants
 */

// Wallet
export const DEFAULT_WALLET_PATH = "m/44'/2'/0'/0/0"

// UI
export const TRUNCATE_PUBLIC_KEY_CHARS = 10
export const TRUNCATE_TX_ID_CHARS = 8

// Quiz
export const MIN_QUIZ_OPTIONS = 2
export const MAX_QUIZ_OPTIONS = 4
export const QUIZ_TITLE_MAX_LENGTH = 100
export const QUIZ_QUESTION_MAX_LENGTH = 500

// Delays (for blockchain sync)
export const SYNC_DELAY_MS = 1500
export const POLL_INTERVAL_MS = 3000

// Local storage keys
export const STORAGE_KEYS = {
  WALLET: 'quiz-app-wallet',
  SESSION: 'quiz-app-session',
  THEME: 'quiz-app-theme'
} as const


// MODULE_SPECS is exported from env.ts - do not duplicate here