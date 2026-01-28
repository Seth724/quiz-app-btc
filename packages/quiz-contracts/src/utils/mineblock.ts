import { Computer } from "@bitcoin-computer/lib";

export class ContractUtils {
  static async mineBlockFromRPCClient(computer: Computer) {
    try{
      console.log(`Mining block simulation - waiting for transaction confirmation`);
      // Just wait for transaction confirmation without mining
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    catch(error){
      console.log('Error in block mining simulation', error)
      // Fallback: just wait
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

}
