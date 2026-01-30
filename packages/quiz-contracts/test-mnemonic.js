import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Teacher } from './dist/src/teacher.js'

dotenv.config()

const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const mnemonic = process.env.DEPLOYMENT_MNEMONIC

console.log('Testing with mnemonic:')
console.log('Mnemonic:', mnemonic ? 'PROVIDED' : 'NOT PROVIDED')

try {
  const computer = new Computer({ 
    url, 
    chain, 
    network, 
    mnemonic,
    path: "m/44'/0'/0'/0/0"
  })
  console.log('Computer instance created with mnemonic')
  console.log('Public Key:', computer.getPublicKey())
  
  console.log('\nFunding wallet...')
  await computer.faucet(1e8)
  console.log('Wallet funded')
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('\nAttempting to create Teacher...')
  const teacher = await computer.new(Teacher, ['Test Teacher', computer.getPublicKey()])
  console.log('✅ Teacher created:', teacher.name)
  console.log('✅ Teacher ID:', teacher._id)
} catch (error) {
  console.error('\n❌ Error occurred:')
  console.error('Message:', error.message)
  if (error.message.includes('utxos')) {
    console.error('\n⚠️  Wallet/UTXO endpoint issue detected')
  }
}
