import { Payment, Withdraw } from '../payment.js'

export class PaymentHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Payment}; export ${Withdraw}`)
    return this.mod
  }

  async createPaymentTx(satoshis: bigint) {
    const exp = `new Payment(${satoshis}n)`
    return this.computer.encode({
      exp,
      mod: this.mod,
    })
  }

  async createPayment(satoshis: bigint): Promise<Payment> {
    const payment = await this.computer.new(Payment, [satoshis])
    // Add delay to avoid mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 1500))
    return payment
  }

  async getPayment(paymentTxId: string): Promise<Payment> {
    const rev = await this.computer.latest(`${paymentTxId}:0`)
    const syncedPayment: Payment = await this.computer.sync(rev)
    return syncedPayment
  }

  // Transfer payment ownership to another public key
  async transferPayment(payment: Payment, toPublicKey: string): Promise<void> {
    await payment.transfer(toPublicKey)
    // Add delay to ensure blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Transfer payment by payment ID
  async transferPaymentById(paymentTxId: string, toPublicKey: string): Promise<void> {
    const payment = await this.getPayment(paymentTxId)
    await this.transferPayment(payment, toPublicKey)
  }

  // Verify if payment is owned by a specific public key
  async isPaymentOwnedBy(paymentTxId: string, publicKey: string): Promise<boolean> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners.includes(publicKey)
  }

  // Get current owners of a payment
  async getPaymentOwners(paymentTxId: string): Promise<string[]> {
    const payment = await this.getPayment(paymentTxId)
    return payment._owners
  }

  // Get the satoshi amount of a payment
  async getPaymentAmount(paymentTxId: string): Promise<bigint> {
    const payment = await this.getPayment(paymentTxId)
    return payment._satoshis
  }

  // Withdraw/claim the satoshis from a payment object to the owner's wallet using Withdraw contract
  async withdrawPayment(payment: Payment){
    // Get the original amount before withdrawal
    
    // console.log(`💰 Original payment amount: ${originalAmount} sats`)

    // // Create a transaction that executes the Withdraw contract
    // // This consumes the payment UTXO and creates a new one with minimum dust
    // // The difference in satoshis should be sent to the owner's wallet as change
    // const encoded = await this.computer.encode({
    //   exp: `${Withdraw} Withdraw.exec([payment])`,
    //   env: { payment: payment._rev }
    // });

    // // Broadcast the transaction to the blockchain
    // await this.computer.broadcast(encoded.tx);

    // // Calculate the amount that was actually withdrawn (transferred to owner's wallet)
    // // This is the original amount minus the minimum dust that remains in the payment object
    // const withdrawnAmount = originalAmount - 546n
    // console.log(`Payment cash out: ${withdrawnAmount} sats released to owner's wallet`)

    // // Add delay to avoid mempool conflicts
    // await new Promise(resolve => setTimeout(resolve, 2000))

    // return withdrawnAmount

    console.log(payment)

    console.log(`💰 Withdrawing payment of ${await payment._satoshis} sats to owner's wallet...`)
    await payment.withdraw()
  
    console.log("successfully withdrawn")
  }

  // Withdraw payment by payment ID
  async withdrawPaymentById(paymentTxId: string){
    const payment = await this.getPayment(paymentTxId)
    await this.withdrawPayment(payment)
  }

  // Send reward directly from teacher's wallet to student's wallet
  async sendRewardToStudent(amount: bigint, studentAddress: string): Promise<string> {
    try {
      console.log(`💰 Sending reward of ${amount} sats to ${studentAddress}`)

      // Use Bitcoin Computer's send method to transfer satoshis directly
      const txId = await this.computer.send(amount, studentAddress)

      // Add delay to avoid mempool conflicts
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log(`✅ Reward sent successfully: ${txId}`)
      return txId
    } catch (error) {
      console.error(`❌ Reward transfer failed:`, error)
      throw error
    }
  }

  // Direct transfer of satoshis to winner's wallet (bypassing Payment objects) - for compatibility
  async transferRewardDirectly(amount: bigint, recipientAddress: string): Promise<string> {
    return await this.sendRewardToStudent(amount, recipientAddress);
  }
}