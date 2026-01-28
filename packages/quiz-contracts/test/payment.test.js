"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// test/payment.test.ts
const chai_1 = require("chai");
const lib_1 = require("@bitcoin-computer/lib");
const dotenv_1 = __importDefault(require("dotenv"));
const payment_js_1 = require("../src/payment.js");
const path_1 = __importDefault(require("path"));
const envPaths = [
    path_1.default.resolve(process.cwd(), './.env'),
    path_1.default.resolve(process.cwd(), './packages/node/.env'),
    '../node/.env',
];
for (const envPath of envPaths) {
    dotenv_1.default.config({ path: envPath });
}
const url = process.env.BCN_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:1031';
const chain = process.env.BCN_CHAIN || process.env.NEXT_PUBLIC_CHAIN || 'LTC';
const network = process.env.BCN_NETWORK || process.env.NEXT_PUBLIC_NETWORK || 'regtest';
describe('Payment', () => {
    let alice;
    let bob;
    let paymentHelper;
    let paymentTxId;
    before('Before', async function () {
        this.timeout(60000);
        alice = new lib_1.Computer({ url, chain, network });
        bob = new lib_1.Computer({ url, chain, network });
        if (network === 'regtest') {
            await alice.faucet(4e8);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await bob.faucet(1e8);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        paymentHelper = new payment_js_1.PaymentHelper(alice);
    });
    describe('Alice creates payment', () => {
        it('Alice deploys the payment contract', async function () {
            this.timeout(60000);
            const mod = await paymentHelper.deploy();
            (0, chai_1.expect)(mod).to.be.a('string');
            (0, chai_1.expect)(mod).to.match(/^[a-f0-9]{64}:[0-9]+$/);
            console.log(`✅ Payment contract deployed: ${mod}`);
        });
        it('Alice creates a payment transaction and broadcasts it', async function () {
            this.timeout(60000);
            const { tx: paymentTx } = await paymentHelper.createPaymentTx(BigInt(2e8));
            paymentTxId = await alice.broadcast(paymentTx);
            console.log(`✅ Payment created: ${paymentTxId}`);
            // Wait for confirmation
            await new Promise(resolve => setTimeout(resolve, 2000));
            const payment = await paymentHelper.getPayment(paymentTxId);
            (0, chai_1.expect)(payment._satoshis).to.equal(BigInt(2e8));
            (0, chai_1.expect)(payment._owners).to.include(alice.getPublicKey());
            console.log(`✅ Payment verified: ${payment._satoshis} satoshis`);
        });
    });
});
