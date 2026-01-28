"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = __importStar(require("chai"));
const chai_match_pattern_1 = __importDefault(require("chai-match-pattern"));
const lib_1 = require("@bitcoin-computer/lib");
const dotenv_1 = require("dotenv");
const student_js_1 = require("../src/student.js");
// Load environment variables
(0, dotenv_1.config)();
// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC';
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest';
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031';
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0";
const { expect } = chai;
chai.use(chai_match_pattern_1.default);
describe('Student Contract', function () {
    let student1Computer;
    let student2Computer;
    let student1;
    let student2;
    beforeEach(async function () {
        this.timeout(30000); // Increase timeout for blockchain operations
        // Create separate computers for different students
        student1Computer = new lib_1.Computer({
            chain,
            network,
            url,
            path: `${basePath}/1` // Student 1 path
        });
        student2Computer = new lib_1.Computer({
            chain,
            network,
            url,
            path: `${basePath}/2` // Student 2 path
        });
        // Fund wallets for regtest
        if (network === 'regtest') {
            await student1Computer.faucet(1e8);
            await student2Computer.faucet(1e8);
        }
        // Create students with their respective computers
        student1 = await student1Computer.new(student_js_1.Student, ['John Doe', student1Computer.getPublicKey()]);
        student2 = await student2Computer.new(student_js_1.Student, ['Jane Smith', student2Computer.getPublicKey()]);
    });
    it('should allow anyone to register as a student', async function () {
        console.log('\n🧪 Testing student registration...');
        // Sync to get latest state 
        await student1Computer.sync(student1._id);
        console.log('Student name:', student1.name);
        console.log('Student public key:', student1.publicKey.slice(0, 10) + '...');
        console.log('Completed quizzes:', await student1.completedQuizzes);
        console.log('Total earnings:', (await student1.totalEarnings).toString());
        console.log('Completed quiz count:', await student1.getCompletedQuizCount());
        expect(student1.name).to.equal('John Doe');
        expect(student1.publicKey).to.be.a('string');
        expect(await student1.completedQuizzes).to.be.an('array').that.is.empty;
        expect(await student1.totalEarnings).to.equal(0n);
        expect(await student1.getCompletedQuizCount()).to.equal(0);
        console.log('✅ Student registration test passed');
    });
    it('should have different public keys for different students', async function () {
        expect(student1.publicKey).not.to.equal(student2.publicKey);
    });
    it('should track quiz completion correctly', async function () {
        const quiz1Id = 'quiz_1_test_id';
        const quiz2Id = 'quiz_2_test_id';
        // Complete first quiz with reward
        await student1.completeQuiz(quiz1Id, 1000n);
        await student1Computer.sync(student1._id);
        expect(await student1.getCompletedQuizCount()).to.equal(1);
        expect(await student1.completedQuizzes).to.include(quiz1Id);
        expect(await student1.totalEarnings).to.equal(1000n);
        expect(await student1.hasCompletedQuiz(quiz1Id)).to.be.true;
        // Complete second quiz with higher reward
        await student1.completeQuiz(quiz2Id, 2000n);
        await student1Computer.sync(student1._id);
        expect(await student1.getCompletedQuizCount()).to.equal(2);
        expect(await student1.completedQuizzes).to.include.members([quiz1Id, quiz2Id]);
        expect(await student1.totalEarnings).to.equal(3000n);
        expect(await student1.hasCompletedQuiz(quiz2Id)).to.be.true;
    });
    it('should handle zero reward quiz completion', async function () {
        const quizId = 'zero_reward_quiz';
        await student1.completeQuiz(quizId, 0n);
        await student1Computer.sync(student1._id);
        expect(await student1.getCompletedQuizCount()).to.equal(1);
        expect(await student1.totalEarnings).to.equal(0n);
        expect(await student1.hasCompletedQuiz(quizId)).to.be.true;
    });
    it('should handle large earnings amounts', async function () {
        const largeAmount = 999999999999999n; // Very large amount
        await student1.completeQuiz('large_reward_quiz', largeAmount);
        await student1Computer.sync(student1._id);
        expect(await student1.totalEarnings).to.equal(largeAmount);
    });
    it('should handle multiple quiz completions in sequence', async function () {
        const quizzes = [
            { id: 'quiz_1', reward: 100n },
            { id: 'quiz_2', reward: 200n },
            { id: 'quiz_3', reward: 300n },
            { id: 'quiz_4', reward: 400n }
        ];
        let expectedTotal = 0n;
        for (const quiz of quizzes) {
            await student1.completeQuiz(quiz.id, quiz.reward);
            expectedTotal += quiz.reward;
        }
        await student1Computer.sync(student1._id);
        expect(await student1.getCompletedQuizCount()).to.equal(4);
        expect(await student1.totalEarnings).to.equal(expectedTotal);
        for (const quiz of quizzes) {
            expect(await student1.hasCompletedQuiz(quiz.id)).to.be.true;
        }
    });
    it('should handle student with empty name', async function () {
        const emptyNameStudent = await student1Computer.new(student_js_1.Student, ['', student1Computer.getPublicKey()]);
        expect(await emptyNameStudent.name).to.equal('');
        expect(await emptyNameStudent.publicKey).to.be.a('string');
        expect(await emptyNameStudent.getCompletedQuizCount()).to.equal(0);
    });
    it('should track registration time correctly', async function () {
        const beforeTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 10));
        const newStudent = await student2Computer.new(student_js_1.Student, ['Time Test Student', student2Computer.getPublicKey()]);
        const afterTime = Date.now();
        expect(newStudent.registeredAt).to.be.within(beforeTime, afterTime);
    });
    it('should return false for non-completed quizzes', async function () {
        expect(await student1.hasCompletedQuiz('non_existent_quiz')).to.be.false;
        expect(await student1.hasCompletedQuiz('')).to.be.false;
        expect(await student1.hasCompletedQuiz('random_string')).to.be.false;
    });
    it('should handle duplicate quiz ID checking correctly', async function () {
        const duplicateQuizId = 'duplicate_test_quiz';
        // Complete quiz once
        await student1.completeQuiz(duplicateQuizId, 500n);
        expect(await student1.hasCompletedQuiz(duplicateQuizId)).to.be.true;
        // Complete same quiz again (this should be allowed at Student level)
        await student1.completeQuiz(duplicateQuizId, 500n);
        // Should have both entries
        const completions = (await student1.completedQuizzes).filter(id => id === duplicateQuizId);
        expect(completions.length).to.equal(2);
        expect(await student1.totalEarnings).to.equal(1000n);
    });
});
