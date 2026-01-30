import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { Teacher } from '../src/teacher.js'
import { Quiz } from '../src/quiz.js'
import type { Question } from '../src/quiz.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"


const { expect } = chai
chai.use(chaiMatchPattern)

describe('Teacher Contract', function () {
  let teacherComputer: Computer
  let teacher: Teacher
  let sampleQuestions: Question[]

  beforeEach(async function () {
    this.timeout(30000) // Increase timeout for blockchain operations

    // Create computer for teacher
    teacherComputer = new Computer({ 
      chain, 
      network, 
      url,
      path: `${basePath}/0` // Teacher path
    })
    
    // Fund wallet for regtest
    if (network === 'regtest') {
      await teacherComputer.faucet(1e8)
    }
    
    // Create teacher with computer
    teacher = await teacherComputer.new(Teacher, ['Professor Smith', teacherComputer.getPublicKey()])
    
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
    ]
  })

  it('should allow anyone to register as a teacher', async function () {
    console.log('🧪 Testing teacher registration...')
    console.log('Teacher name:', teacher.name)
    console.log('Teacher public key:', teacher.publicKey.slice(0, 10) + '...')
    console.log('Created quizzes count:', teacher.createdQuizzes.length)
    console.log('Registration time:', new Date(teacher.registeredAt).toISOString())
    
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    expect(teacher.name).to.equal('Professor Smith')
    expect(teacher.publicKey).to.be.a('string')
    expect(teacher.createdQuizzes).to.be.an('array').that.is.empty
    expect(teacher.registeredAt).to.be.a('number')
    /* eslint-enable @typescript-eslint/no-unused-expressions */
    console.log('✅ Teacher registration test passed')
  })

  it('should create a quiz with correct properties', async function () {
    console.log('🧪 Testing quiz creation...')
    
    // Validate parameters first
    Teacher.validateQuizParams(sampleQuestions, 1000n)
    console.log('✅ Quiz parameters validated')
    
    // Create quiz externally (proper Bitcoin Computer pattern)
    const quiz = await teacherComputer.new(Quiz, [{
      title: 'Math Quiz',
      description: 'Basic arithmetic',
      questions: sampleQuestions,
      rewardPerCorrect: 1000n,
      teacherPublicKey: teacher.publicKey
    }])
    console.log('✅ Quiz created with ID:', quiz._id)
    
    // Link quiz to teacher and sync
    await teacher.addQuiz(quiz._id)
    console.log('✅ Quiz linked to teacher')
    
    // Re-sync teacher to get updated state
    await teacherComputer.sync(teacher._id)
    const updatedTeacher = teacher
    console.log('✅ Teacher state synced')
    
    console.log('Quiz ID:', quiz._id)
    console.log('Teacher created quizzes:', updatedTeacher.createdQuizzes)
    console.log('Quiz count:', await updatedTeacher.getQuizCount())
    
    expect(quiz._id).to.be.a('string')
    expect(updatedTeacher.createdQuizzes).to.include(quiz._id)
    expect(await updatedTeacher.getQuizCount()).to.equal(1)
    console.log('✅ Quiz creation test passed')
  })

  it('should create quiz with duration', async function () {
    // Create quiz externally with duration
    const quiz = await teacherComputer.new(Quiz, [{
      title: 'Timed Quiz',
      description: 'Test with time limit',
      questions: sampleQuestions,
      rewardPerCorrect: 1000n,
      teacherPublicKey: teacher.publicKey,
      duration: 30
    }])
    
    // Link quiz to teacher
    await teacher.addQuiz(quiz._id)
    
    expect(quiz.duration).to.equal(30)
  })

  it('should not allow quiz creation with empty questions', async function () {
    try {
      Teacher.validateQuizParams([], 1000n)
      expect.fail('Should have thrown an error')
    } catch (error: unknown) {
      expect((error as Error).message).to.include('Quiz must have at least one question')
    }
  })

  it('should not allow quiz creation with zero reward', async function () {
    try {
      Teacher.validateQuizParams(sampleQuestions, 0n)
      expect.fail('Should have thrown an error')
    } catch (error: unknown) {
      expect((error as Error).message).to.include('Reward must be greater than 0')
    }
  })

  it('should handle multiple quizzes for the same teacher', async function () {
    // Add delay to prevent mempool conflicts
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const quiz1 = await teacherComputer.new(Quiz, [{
      title: 'Quiz 1',
      description: 'First quiz',
      questions: sampleQuestions,
      rewardPerCorrect: 500n,
      teacherPublicKey: teacher.publicKey
    }])

    // Add delay between quiz creations
    await new Promise(resolve => setTimeout(resolve, 200))

    const quiz2 = await teacherComputer.new(Quiz, [{
      title: 'Quiz 2', 
      description: 'Second quiz',
      questions: sampleQuestions,
      rewardPerCorrect: 1000n,
      teacherPublicKey: teacher.publicKey
    }])

    await teacher.addQuiz(quiz1._id)
    await teacher.addQuiz(quiz2._id)
    await teacherComputer.sync(teacher._id)

    expect(await teacher.getQuizCount()).to.equal(2)
    expect(teacher.createdQuizzes).to.include.members([quiz1._id, quiz2._id])
  })

  it('should validate negative reward amounts', async function () {
    try {
      Teacher.validateQuizParams(sampleQuestions, -100n)
      expect.fail('Should have thrown an error')
    } catch (error: unknown) {
      expect((error as Error).message).to.include('Reward must be greater than 0')
    }
  })

  it('should handle teacher with empty name', async function () {
    const emptyNameTeacher = await teacherComputer.new(Teacher, ['', teacherComputer.getPublicKey()])
    expect(emptyNameTeacher.name).to.equal('')
    expect(emptyNameTeacher.publicKey).to.be.a('string')
  })

  it('should track teacher registration time', async function () {
    const beforeTime = Date.now()
    await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
    
    const newTeacher = await teacherComputer.new(Teacher, ['Time Test Teacher', teacherComputer.getPublicKey()])
    
    const afterTime = Date.now()
    expect(newTeacher.registeredAt).to.be.within(beforeTime, afterTime)
  })

  it('should have unique public keys for different teachers', async function () {
    // Create second computer for different teacher
    const teacher2Computer = new Computer({ 
      chain, 
      network, 
      url,
      path: `${basePath}/1`
    })
    
    if (network === 'regtest') {
      await teacher2Computer.faucet(1e8)
    }
    
    const teacher2 = await teacher2Computer.new(Teacher, ['Teacher 2', teacher2Computer.getPublicKey()])
    
    expect(teacher.publicKey).to.not.equal(teacher2.publicKey)
    expect(teacher._id).to.not.equal(teacher2._id)
  })
})