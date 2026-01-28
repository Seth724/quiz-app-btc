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
const teacher_js_1 = require("../src/teacher.js");
const quiz_js_1 = require("../src/quiz.js");
// Load environment variables
(0, dotenv_1.config)();
// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC';
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest';
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031';
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0";
const { expect } = chai;
chai.use(chai_match_pattern_1.default);
const _ = chai_match_pattern_1.default.getLodashModule();
describe('Teacher Contract', function () {
    let teacherComputer;
    let teacher;
    let sampleQuestions;
    beforeEach(async function () {
        this.timeout(30000); // Increase timeout for blockchain operations
        // Create computer for teacher
        teacherComputer = new lib_1.Computer({
            chain,
            network,
            url,
            path: `${basePath}/0` // Teacher path
        });
        // Fund wallet for regtest
        if (network === 'regtest') {
            await teacherComputer.faucet(1e8);
        }
        // Create teacher with computer
        teacher = await teacherComputer.new(teacher_js_1.Teacher, ['Professor Smith', teacherComputer.getPublicKey()]);
        sampleQuestions = [
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
    });
    it('should allow anyone to register as a teacher', async function () {
        console.log('🧪 Testing teacher registration...');
        console.log('Teacher name:', teacher.name);
        console.log('Teacher public key:', teacher.publicKey.slice(0, 10) + '...');
        console.log('Created quizzes count:', teacher.createdQuizzes.length);
        console.log('Registration time:', new Date(teacher.registeredAt).toISOString());
        expect(teacher.name).to.equal('Professor Smith');
        expect(teacher.publicKey).to.be.a('string');
        expect(teacher.createdQuizzes).to.be.an('array').that.is.empty;
        expect(teacher.registeredAt).to.be.a('number');
        console.log('✅ Teacher registration test passed');
    });
    it('should create a quiz with correct properties', async function () {
        console.log('🧪 Testing quiz creation...');
        // Validate parameters first
        teacher_js_1.Teacher.validateQuizParams(sampleQuestions, 1000n);
        console.log('✅ Quiz parameters validated');
        // Create quiz externally (proper Bitcoin Computer pattern)
        const quiz = await teacherComputer.new(quiz_js_1.Quiz, [{
                title: 'Math Quiz',
                description: 'Basic arithmetic',
                questions: sampleQuestions,
                rewardPerCorrect: 1000n,
                teacherPublicKey: teacher.publicKey
            }]);
        console.log('✅ Quiz created with ID:', quiz._id);
        // Link quiz to teacher and sync
        await teacher.addQuiz(quiz._id);
        console.log('✅ Quiz linked to teacher');
        // Re-sync teacher to get updated state
        await teacherComputer.sync(teacher._id);
        const updatedTeacher = teacher;
        console.log('✅ Teacher state synced');
        console.log('Quiz ID:', quiz._id);
        console.log('Teacher created quizzes:', updatedTeacher.createdQuizzes);
        console.log('Quiz count:', await updatedTeacher.getQuizCount());
        expect(quiz._id).to.be.a('string');
        expect(updatedTeacher.createdQuizzes).to.include(quiz._id);
        expect(await updatedTeacher.getQuizCount()).to.equal(1);
        console.log('✅ Quiz creation test passed');
    });
    it('should create quiz with duration', async function () {
        // Create quiz externally with duration
        const quiz = await teacherComputer.new(quiz_js_1.Quiz, [{
                title: 'Timed Quiz',
                description: 'Test with time limit',
                questions: sampleQuestions,
                rewardPerCorrect: 1000n,
                teacherPublicKey: teacher.publicKey,
                duration: 30
            }]);
        // Link quiz to teacher
        await teacher.addQuiz(quiz._id);
        expect(quiz.duration).to.equal(30);
    });
    it('should not allow quiz creation with empty questions', async function () {
        try {
            teacher_js_1.Teacher.validateQuizParams([], 1000n);
            expect.fail('Should have thrown an error');
        }
        catch (error) {
            expect(error.message).to.include('Quiz must have at least one question');
        }
    });
    it('should not allow quiz creation with zero reward', async function () {
        try {
            teacher_js_1.Teacher.validateQuizParams(sampleQuestions, 0n);
            expect.fail('Should have thrown an error');
        }
        catch (error) {
            expect(error.message).to.include('Reward must be greater than 0');
        }
    });
    it('should handle multiple quizzes for the same teacher', async function () {
        // Add delay to prevent mempool conflicts
        await new Promise(resolve => setTimeout(resolve, 500));
        const quiz1 = await teacherComputer.new(quiz_js_1.Quiz, [{
                title: 'Quiz 1',
                description: 'First quiz',
                questions: sampleQuestions,
                rewardPerCorrect: 500n,
                teacherPublicKey: teacher.publicKey
            }]);
        // Add delay between quiz creations
        await new Promise(resolve => setTimeout(resolve, 200));
        const quiz2 = await teacherComputer.new(quiz_js_1.Quiz, [{
                title: 'Quiz 2',
                description: 'Second quiz',
                questions: sampleQuestions,
                rewardPerCorrect: 1000n,
                teacherPublicKey: teacher.publicKey
            }]);
        await teacher.addQuiz(quiz1._id);
        await teacher.addQuiz(quiz2._id);
        await teacherComputer.sync(teacher._id);
        expect(await teacher.getQuizCount()).to.equal(2);
        expect(teacher.createdQuizzes).to.include.members([quiz1._id, quiz2._id]);
    });
    it('should validate negative reward amounts', async function () {
        try {
            teacher_js_1.Teacher.validateQuizParams(sampleQuestions, -100n);
            expect.fail('Should have thrown an error');
        }
        catch (error) {
            expect(error.message).to.include('Reward must be greater than 0');
        }
    });
    it('should handle teacher with empty name', async function () {
        const emptyNameTeacher = await teacherComputer.new(teacher_js_1.Teacher, ['', teacherComputer.getPublicKey()]);
        expect(emptyNameTeacher.name).to.equal('');
        expect(emptyNameTeacher.publicKey).to.be.a('string');
    });
    it('should track teacher registration time', async function () {
        const beforeTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        const newTeacher = await teacherComputer.new(teacher_js_1.Teacher, ['Time Test Teacher', teacherComputer.getPublicKey()]);
        const afterTime = Date.now();
        expect(newTeacher.registeredAt).to.be.within(beforeTime, afterTime);
    });
    it('should have unique public keys for different teachers', async function () {
        // Create second computer for different teacher
        const teacher2Computer = new lib_1.Computer({
            chain,
            network,
            url,
            path: `${basePath}/1`
        });
        if (network === 'regtest') {
            await teacher2Computer.faucet(1e8);
        }
        const teacher2 = await teacher2Computer.new(teacher_js_1.Teacher, ['Teacher 2', teacher2Computer.getPublicKey()]);
        expect(teacher.publicKey).to.not.equal(teacher2.publicKey);
        expect(teacher._id).to.not.equal(teacher2._id);
    });
});
