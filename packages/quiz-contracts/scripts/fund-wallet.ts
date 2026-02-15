import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'

config()

const {
  NEXT_PUBLIC_CHAIN: chain,
  NEXT_PUBLIC_NETWORK: network,
  NEXT_PUBLIC_URL: url,
  NEXT_PUBLIC_PATH: path,
  DEPLOYMENT_MNEMONIC: mnemonic
} = process.env

if (!network || !chain || !url) {
  throw new Error('Please set NEXT_PUBLIC_CHAIN, NEXT_PUBLIC_NETWORK, and NEXT_PUBLIC_URL in the .env file')
}

const computer = new Computer({
  chain,
  network,
  url,
  path,
  mnemonic // Use fixed mnemonic for consistent deployment wallet
})

async function fundWallet() {
  console.log('Funding wallet...')
  console.log(`Chain: ${chain}`)
  console.log(`Network: ${network}`)
  console.log(`URL: ${url}`)
  console.log(`Address: ${computer.getAddress()}`)

  try {
    // Fund the wallet with 1,000,000 satoshis (10,000,000 might be needed for deployment)
    const amount = 10000000 // 100,000,000 would be 1 LTC
    console.log(`Funding with ${amount} satoshis...`)
    
    // Faucet only works on regtest/testnet
    if (network === 'regtest' || network === 'testnet') {
      const receipt = await computer.faucet(amount)
      console.log('Funding successful!')
      console.log('Transaction ID:', receipt)
    } else {
      console.log('Faucet only available on regtest/testnet networks.')
      console.log('For mainnet, please send funds to:', computer.getAddress())
    }

    const { balance } = await computer.getBalance()
    console.log(`New balance: ${balance} satoshis`)
  } catch (error) {
    console.error('Error funding wallet:', error)
    throw error
  }
}

fundWallet().catch(console.error)