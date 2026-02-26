/**
 * Client-side environment configuration
 * Only NEXT_PUBLIC_ variables are available here
 */

import type { Chain, Network } from '@/types'

// Blockchain configuration
export const CHAIN = (process.env.NEXT_PUBLIC_CHAIN || 'LTC') as Chain
export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'regtest') as Network
export const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'

// Derive API endpoints from BASE_URL if needed
export const RPC_ENDPOINT = `${BASE_URL}/rpc`
export const WS_ENDPOINT = BASE_URL.replace('http', 'ws')

// Module specifications (deployed contract modules)
export const MODULE_SPECS = {
  teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC || process.env.NEXT_PUBLIC_TEACHER_MOD || '',
  studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC || process.env.NEXT_PUBLIC_STUDENT_MOD || '',
  quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_MOD || '',
  attemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || ''
}



// Blockchain config object
export const BLOCKCHAIN_CONFIG = {
  chain: CHAIN,
  network: NETWORK,
  url: BASE_URL
} as const

// Validate required environment variables
export function validateClientEnv(): { valid: boolean; missing: string[] } {
  const required = ['NEXT_PUBLIC_CHAIN', 'NEXT_PUBLIC_NETWORK', 'NEXT_PUBLIC_URL']
  const missing = required.filter(key => !process.env[key])
  
  return {
    valid: missing.length === 0,
    missing
  }
}

// Check if module specs are configured (cached result to avoid repeated logging)
let _hasSpecsCached: boolean | null = null
export function hasModuleSpecs(): boolean {
  if (_hasSpecsCached !== null) return _hasSpecsCached
  _hasSpecsCached = Object.values(MODULE_SPECS).every(mod => mod !== '')
  return _hasSpecsCached
}

// Get Computer configuration
export function getComputerConfig(path?: string, mnemonic?: string) {
  return {
    chain: CHAIN,
    network: NETWORK,
    url: BASE_URL,
    path,
    mnemonic
  }
}
