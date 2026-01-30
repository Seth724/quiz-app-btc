import { Computer } from '@bitcoin-computer/lib'

export class MineBlocks{
  static async mineBlockFromRPCClient(computer: Computer) {
    try {
      const newAddress = await computer.rpcCall('getnewaddress', 'mywallet legacy')
      console.log(`Mining block to address ${newAddress.result}`)
      await computer.rpcCall('generatetoaddress', `1 ${newAddress.result}`)
      console.log(`Block mined to address ${newAddress.result}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.log('Error generating block', error)
    }
  }


}