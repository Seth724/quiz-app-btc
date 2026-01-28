#!/usr/bin/env node

import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

config()

const {
  NEXT_PUBLIC_CHAIN: chain = 'LTC',
  NEXT_PUBLIC_NETWORK: network = 'regtest',
  NEXT_PUBLIC_URL: url = 'http://localhost:1031',
  NEXT_PUBLIC_PATH: path = "m/44'/0'/0'/0",
  DEPLOYMENT_MNEMONIC: mnemonic
} = process.env

const rl = createInterface({ input, output })

async function fundWallet() {
  try {
    const computer = new Computer({ chain, network, url, path, mnemonic })
    
    console.log(`
🪙 Bitcoin Computer Wallet Funder
================================
Chain: ${chain}
Network: ${network}
URL: ${url}
Address: ${computer.getAddress()}
`)

    if (network !== 'regtest') {
      console.log('⚠️  This tool only works on regtest network')
      console.log('For testnet/mainnet, please fund your wallet manually')
      rl.close()
      return
    }

    const { balance: currentBalance } = await computer.getBalance()
    console.log(`Current balance: ${currentBalance} satoshis`)

    const amount = await rl.question('\nHow much to fund? (satoshis, default 200000000): ')
    const fundAmount = amount && !isNaN(parseInt(amount)) ? parseInt(amount) : 200000000 // 2 BTC default

    console.log(`\n💰 Funding wallet with ${fundAmount} satoshis...`)
    
    await computer.faucet(fundAmount)
    
    // Wait for funding confirmation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const { balance: newBalance } = await computer.getBalance()
    console.log(`✅ Funding successful!`)
    console.log(`New balance: ${newBalance} satoshis`)
    
    rl.close()
  } catch (error: any) {
    console.error('❌ Error funding wallet:', error.message)
    console.error('\nPossible solutions:')
    console.error('1. Make sure Bitcoin Computer node is running')
    console.error('2. Check your .env configuration')
    console.error('3. Verify network connectivity to the node')
    rl.close()
    process.exit(1)
  }
}

fundWallet()