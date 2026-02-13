// import { Computer } from '@bitcoin-computer/lib'


// export class MineBlocks{
//   static async mineBlockFromRPCClient(computer: Computer) {
//     try {
//       const newAddress = await computer.rpcCall('getnewaddress', 'mywallet legacy')
//       console.log(`Mining block to address ${newAddress.result}`)
//       await computer.rpcCall('generatetoaddress', `1 ${newAddress.result}`)
//       console.log(`Block mined to address ${newAddress.result}`)
//       await new Promise((resolve) => setTimeout(resolve, 2000))
//     } catch (error) {
//       console.log('Error generating block', error)
//     }
//   }


// }



type BcnRpcEnvelope = {
  result: {
    result: unknown
    error: unknown
    id: number
  }
}

async function bcnRpc(url: string, chain: string, network: string, method: string, params: string = '') {
  const endpoint = `${url}/v1/${chain}/${network}/rpc`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  })

  const json = (await res.json()) as BcnRpcEnvelope
  if (!res.ok || json.result.error) {
    throw new Error(`RPC ${method} failed: ${JSON.stringify(json.result.error ?? json)}`)
  }
  return json.result.result
}

export class MineBlocks {
  /**
   * Mines blocks to a node-wallet address (NOT your Computer wallet),
   * so it confirms txs without creating immature coinbase UTXOs in your test wallet.
   */
  static async mine(url: string, chain: string, network: string, blocks: number = 1) {
    const addr = (await bcnRpc(url, chain, network, 'getnewaddress', 'mining legacy')) as string
    await bcnRpc(url, chain, network, 'generatetoaddress', `${blocks} ${addr}`)
    await new Promise((r) => setTimeout(r, 300))
  }
}