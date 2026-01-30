import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'

console.log('Testing connection with:')
console.log('URL:', url)
console.log('Chain:', chain)
console.log('Network:', network)

try {
  const computer = new Computer({ url, chain, network })
  console.log('\nComputer instance created')
  console.log('Public Key:', computer.getPublicKey())
  
  console.log('\nAttempting to call faucet...')
  const result = await computer.faucet(1e8)
  console.log('Faucet result:', result)
} catch (error) {
  console.error('\nError occurred:')
  console.error(error.message)
  console.error('\nFull error:', error)
}
