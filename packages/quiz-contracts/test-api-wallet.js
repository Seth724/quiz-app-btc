import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Teacher } from './dist/src/teacher.js'

dotenv.config()

const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

console.log('Testing with useApi option:')

try {
  // Try without specifying chain/network to see if it auto-detects
  const computer = new Computer({ 
    url, 
    chain, 
    network, 
    path: `${basePath}/0`,
    // Try adding this option
    apiWallet: false
  })
  console.log('Computer instance created')
  console.log('Public Key:', computer.getPublicKey())
  
  console.log('\nFunding wallet...')
  await computer.faucet(1e8)
  console.log('Wallet funded')
  
  console.log('\nAttempting to create Teacher...')
  const teacher = await computer.new(Teacher, ['Test Teacher', computer.getPublicKey()])
  console.log('Teacher created:', teacher.name)
} catch (error) {
  console.error('\nError occurred:')
  console.error('Message:', error.message)
  if (error.message.includes('/v1/')) {
    console.error('\n⚠️  Still trying to use /v1/ endpoint')
  }
}
