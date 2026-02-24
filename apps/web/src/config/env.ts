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
  attemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || process.env.NEXT_PUBLIC_ATTEMPT_MOD || '',
  paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || process.env.NEXT_PUBLIC_PAYMENT_MOD || '',
  quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD || '',
  quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC || process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD || ''
}

// Force log all environment variables for debugging
console.log('🔧 ALL NEXT_PUBLIC env vars:', {
  NEXT_PUBLIC_TEACHER_MOD_SPEC: process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC,
  NEXT_PUBLIC_STUDENT_MOD_SPEC: process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC,
  NEXT_PUBLIC_QUIZ_MOD_SPEC: process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC,
  NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC,
  NEXT_PUBLIC_PAYMENT_MOD_SPEC: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC,
  NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC,
  NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC
})

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

// Check if module specs are configured
export function hasModuleSpecs(): boolean {
  // Debug: Log what we actually have
  console.log('🔍 Debug MODULE_SPECS:', MODULE_SPECS)
  console.log('🔍 Debug env vars:', {
    teacherMod: process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC,
    studentMod: process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC,
    quizMod: process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC,
    attemptMod: process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC,
    paymentMod: process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC,
    quizAccessMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC,
    quizAccessSaleMod: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC
  })
  
  const hasSpecs = Object.values(MODULE_SPECS).every(mod => mod !== '')
  console.log('🔍 hasModuleSpecs result:', hasSpecs)
  
  if (!hasSpecs) {
    console.info('🔧 Development Mode: Module specs not deployed, using mock implementations')
  } else {
    console.info('✅ Production Mode: Using deployed blockchain contracts')
  }
  return hasSpecs
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
