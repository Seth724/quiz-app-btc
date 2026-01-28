"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleQuestions = exports.sharedStudent2 = exports.sharedStudent1 = exports.sharedTeacher2 = exports.sharedTeacher1 = exports.sharedStudent2Computer = exports.sharedStudent1Computer = exports.sharedTeacher2Computer = exports.sharedTeacher1Computer = void 0;
exports.setupSharedComputers = setupSharedComputers;
exports.createSharedEntities = createSharedEntities;
exports.teardownSharedComputers = teardownSharedComputers;
const lib_1 = require("@bitcoin-computer/lib");
const dotenv_1 = require("dotenv");
const teacher_js_1 = require("../src/teacher.js");
const student_js_1 = require("../src/student.js");
const mineblock_js_1 = require("../src/app/contracts/utils/mineblock.js");
// Load environment variables
(0, dotenv_1.config)();
// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC';
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest';
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031';
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0";
exports.sampleQuestions = [
    {
        text: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
    },
    {
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2
    }
];
async function setupSharedComputers() {
    console.log('🔧 Setting up shared computers...');
    // Create computers with different paths but reuse them across tests
    exports.sharedTeacher1Computer = new lib_1.Computer({
        chain,
        network,
        url,
        path: `${basePath}/0` // Teacher 1 path
    });
    exports.sharedTeacher2Computer = new lib_1.Computer({
        chain,
        network,
        url,
        path: `${basePath}/1` // Teacher 2 path
    });
    exports.sharedStudent1Computer = new lib_1.Computer({
        chain,
        network,
        url,
        path: `${basePath}/2` // Student 1 path
    });
    exports.sharedStudent2Computer = new lib_1.Computer({
        chain,
        network,
        url,
        path: `${basePath}/3` // Student 2 path
    });
    // Fund wallets for regtest
    if (network === 'regtest') {
        console.log('💰 Funding wallets for regtest...');
        await Promise.all([
            exports.sharedTeacher1Computer.faucet(1e8),
            exports.sharedTeacher2Computer.faucet(1e8),
            exports.sharedStudent1Computer.faucet(1e8),
            exports.sharedStudent2Computer.faucet(1e8)
        ]);
        console.log('✅ Wallets funded successfully');
    }
    console.log('✅ Shared computers set up successfully');
}
async function createSharedEntities() {
    console.log('👥 Creating shared entities...');
    // Create shared entities
    exports.sharedTeacher1 = await exports.sharedTeacher1Computer.new(teacher_js_1.Teacher, ['Professor Smith', exports.sharedTeacher1Computer.getPublicKey()]);
    console.log('✅ Teacher 1 created:', exports.sharedTeacher1.name, 'Public Key:', exports.sharedTeacher1.publicKey.slice(0, 10) + '...');
    // Mine block to avoid mempool conflicts
    if (network === 'regtest') {
        await mineblock_js_1.ContractUtils.mineBlockFromRPCClient(exports.sharedTeacher1Computer);
    }
    exports.sharedTeacher2 = await exports.sharedTeacher2Computer.new(teacher_js_1.Teacher, ['Professor Jones', exports.sharedTeacher2Computer.getPublicKey()]);
    console.log('✅ Teacher 2 created:', exports.sharedTeacher2.name, 'Public Key:', exports.sharedTeacher2.publicKey.slice(0, 10) + '...');
    // Mine block to avoid mempool conflicts
    if (network === 'regtest') {
        await mineblock_js_1.ContractUtils.mineBlockFromRPCClient(exports.sharedTeacher2Computer);
    }
    exports.sharedStudent1 = await exports.sharedStudent1Computer.new(student_js_1.Student, ['John Doe', exports.sharedStudent1Computer.getPublicKey()]);
    console.log('✅ Student 1 created:', exports.sharedStudent1.name, 'Public Key:', exports.sharedStudent1.publicKey.slice(0, 10) + '...');
    // Mine block to avoid mempool conflicts
    if (network === 'regtest') {
        await mineblock_js_1.ContractUtils.mineBlockFromRPCClient(exports.sharedStudent1Computer);
    }
    exports.sharedStudent2 = await exports.sharedStudent2Computer.new(student_js_1.Student, ['Jane Smith', exports.sharedStudent2Computer.getPublicKey()]);
    console.log('✅ Student 2 created:', exports.sharedStudent2.name, 'Public Key:', exports.sharedStudent2.publicKey.slice(0, 10) + '...');
    // Mine block to avoid mempool conflicts  
    if (network === 'regtest') {
        await mineblock_js_1.ContractUtils.mineBlockFromRPCClient(exports.sharedStudent2Computer);
    }
    console.log('✅ All shared entities created successfully');
}
async function teardownSharedComputers() {
    console.log('🧹 Tearing down shared computers (if needed)...');
    // Bitcoin Computer lib handles cleanup automatically
    console.log('✅ Teardown complete');
}
