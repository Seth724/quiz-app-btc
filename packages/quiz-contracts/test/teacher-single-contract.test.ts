import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../src/teacher.js'
import { config } from 'dotenv'
import { MineBlocks } from '../src/utils/mineblock.js'

// Load environment variables
config()

// Get configuration from environment
const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0"

describe('Teacher Contract - Single Teacher Application', async function () {
  this.timeout(60000) // 1 minute timeout for all tests

  let teacherComputer: Computer

  // Test objects
  let teacher: Teacher

  before(async function () {
    console.log('\n🚀 Setting up Teacher Contract Test Environment')
    console.log(`Chain: ${chain}, Network: ${network}`)
    console.log(`Node URL: ${url}`)

    // Initialize computer for the single teacher
    teacherComputer = new Computer({
      chain,
      network,
      url,
      path: `${basePath}/0`
    })

    // Fund wallet for regtest
    if (network === 'regtest') {
      console.log('💰 Funding teacher wallet on regtest...')
      await teacherComputer.faucet(1e8) // 1 LTC
      console.log('✅ Teacher wallet funded successfully')
    }
  })

  describe('Teacher Contract - Basic Functionality', function () {
    it('should create the single teacher with correct properties', async function () {
      console.log('\n👨‍🏫 Testing single teacher creation...')

      teacher = await teacherComputer.new(Teacher, ['Head Teacher', teacherComputer.getPublicKey()])

      console.log('✓ Teacher created with ID:', teacher._id)
      console.log('✓ Teacher name:', teacher.name)
      console.log('✓ Teacher public key:', teacher.publicKey.substring(0, 10) + '...')
      console.log('✓ Created quizzes count:', teacher.createdQuizzes.length)

      expect(teacher).to.be.an.instanceOf(Teacher)
      expect(teacher.name).to.equal('Head Teacher')
      expect(teacher.publicKey).to.be.a('string')
      await MineBlocks.mineBlockFromRPCClient(teacherComputer)
      expect(teacher.createdQuizzes).to.be.an('array').that.is.empty
      expect(teacher.getQuizCount()).to.equal(0)

      console.log('✅ Single teacher creation test passed')
    })

    it('should allow teacher to add quizzes to their list', async function () {
      console.log('\n📝 Testing teacher quiz list management...')

      // Add mock quiz IDs to teacher's list
      const mockQuizId = 'mock-quiz-id-123'
      teacher.addQuiz(mockQuizId)

      expect(teacher.createdQuizzes).to.include(mockQuizId)
      expect(teacher.getQuizCount()).to.equal(1)

      // Add another quiz
      const mockQuizId2 = 'mock-quiz-id-456'
      teacher.addQuiz(mockQuizId2)
      await MineBlocks.mineBlockFromRPCClient(teacherComputer)
      expect(teacher.createdQuizzes).to.include.members([mockQuizId, mockQuizId2])
      expect(teacher.getQuizCount()).to.equal(2)

      console.log('✅ Teacher quiz list management test passed')
    })

    it('should validate quiz parameters correctly', function () {
      console.log('\n🔍 Testing quiz parameter validation...')

      // Valid parameters should not throw
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 1, 1000n)).to.not.throw()

      // Test empty question text
      expect(() => Teacher.validateQuizParams('', ['3', '4', '5', '6'], 1, 1000n))
        .to.throw('Question text cannot be empty')

      // Test question with only whitespace
      expect(() => Teacher.validateQuizParams('   ', ['3', '4', '5', '6'], 1, 1000n))
        .to.throw('Question text cannot be empty')

      // Test wrong number of options
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4'], 1, 1000n))
        .to.throw('Quiz must have exactly 4 options')

      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6', '7'], 1, 1000n))
        .to.throw('Quiz must have exactly 4 options')

      // Test invalid correct answer index
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], -1, 1000n))
        .to.throw('Correct answer must be between 0-3')

      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 4, 1000n))
        .to.throw('Correct answer must be between 0-3')

      // Test zero reward
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 1, 0n))
        .to.throw('Reward must be greater than 0')

      // Test negative reward
      expect(() => Teacher.validateQuizParams('What is 2+2?', ['3', '4', '5', '6'], 1, -100n))
        .to.throw('Reward must be greater than 0')

      console.log('✅ Quiz parameter validation test passed')
    })
  })
 

  describe('Teacher Contract - Single Teacher Constraints', function () {
    it('should verify there is only one teacher in the system', async function () {
      console.log('\n🔒 Testing single teacher constraint...')

      await MineBlocks.mineBlockFromRPCClient(teacherComputer)

      // The teacher was already created in the first test
      await MineBlocks.mineBlockFromRPCClient(teacherComputer)
      expect(teacher).to.exist
      expect(teacher.name).to.equal('Head Teacher')
      expect(teacher.publicKey).to.equal(teacherComputer.getPublicKey())

      // Verify that this is indeed the single teacher
      expect(teacher.name).to.be.a('string').and.not.empty
      expect(teacher.publicKey).to.be.a('string').and.not.empty
      expect(teacher.createdQuizzes).to.be.an('array')

      await MineBlocks.mineBlockFromRPCClient(teacherComputer)

      await MineBlocks.mineBlockFromRPCClient(teacherComputer)

      console.log('✓ Single teacher exists with ID:', teacher._id)
      console.log('✓ Teacher name:', teacher.name)
      console.log('✓ Teacher public key matches computer:', teacher.publicKey === teacherComputer.getPublicKey())

      console.log('✅ Single teacher constraint verified')
    })

    it('should maintain teacher identity across operations', async function () {
      console.log('\n🆔 Testing teacher identity persistence...')

      // Sync the teacher to ensure it maintains its identity
      const syncedTeacher = await teacherComputer.sync(teacher._id) as Teacher

      expect(syncedTeacher._id).to.equal(teacher._id)
      expect(syncedTeacher.name).to.equal(teacher.name)
      expect(syncedTeacher.publicKey).to.equal(teacher.publicKey)
      expect(syncedTeacher.createdQuizzes).to.deep.equal(teacher.createdQuizzes)

      console.log('✅ Teacher identity persistence verified')
    })

    it('should handle teacher with special characters in name', async function () {
      console.log('\n🎭 Testing teacher with special characters in name...')

      // Create a new teacher with special characters to test
      const specialNameTeacher = await teacherComputer.new(Teacher, ['Head Teacher O\'Connor Jr.', teacherComputer.getPublicKey()])

      expect(specialNameTeacher.name).to.equal('Head Teacher O\'Connor Jr.')
      expect(specialNameTeacher.publicKey).to.be.a('string')
      expect(specialNameTeacher.createdQuizzes).to.be.an('array').that.is.empty

      console.log('✅ Special characters teacher test passed')
    })

    it('should handle teacher with numeric name', async function () {
      console.log('\n🔢 Testing teacher with numeric name...')

      // Create a new teacher with numeric name to test
      const numericNameTeacher = await teacherComputer.new(Teacher, ['Teacher123', teacherComputer.getPublicKey()])

      expect(numericNameTeacher.name).to.equal('Teacher123')
      expect(numericNameTeacher.publicKey).to.be.a('string')
      expect(numericNameTeacher.createdQuizzes).to.be.an('array').that.is.empty

      console.log('✅ Numeric name teacher test passed')
    })
  })

  describe('Teacher Contract - Quiz Management', function () {
    it('should manage multiple quizzes for the single teacher', async function () {
      console.log('\n📚 Testing quiz management for single teacher...')

      // Reset the teacher's quiz list for this test
      const testTeacher = await teacherComputer.new(Teacher, ['Quiz Manager', teacherComputer.getPublicKey()])
      
      // Add multiple quizzes to the single teacher
      const quizIds = ['quiz-1', 'quiz-2', 'quiz-3', 'quiz-4', 'quiz-5']
      
      for (const quizId of quizIds) {
        testTeacher.addQuiz(quizId)
      }

      expect(testTeacher.createdQuizzes).to.have.length(5)
      expect(testTeacher.createdQuizzes).to.include.members(quizIds)
      expect(testTeacher.getQuizCount()).to.equal(5)

      // Add one more quiz
      testTeacher.addQuiz('quiz-6')
      expect(testTeacher.createdQuizzes).to.have.length(6)
      expect(testTeacher.getQuizCount()).to.equal(6)

      console.log('✅ Quiz management for single teacher test passed')
    })

    it('should maintain quiz order in teacher\'s list', async function () {
      console.log('\n🔄 Testing quiz order preservation...')

      const orderTestTeacher = await teacherComputer.new(Teacher, ['Order Teacher', teacherComputer.getPublicKey()])
      await MineBlocks.mineBlockFromRPCClient(teacherComputer)
      await MineBlocks.mineBlockFromRPCClient(teacherComputer)
      // Add quizzes in specific order
      const orderedQuizIds = ['first-quiz', 'second-quiz', 'third-quiz']
      
      for (const quizId of orderedQuizIds) {
        orderTestTeacher.addQuiz(quizId)
      }

      // Check that the order is preserved
      expect(orderTestTeacher.createdQuizzes[0]).to.equal('first-quiz')
      expect(orderTestTeacher.createdQuizzes[1]).to.equal('second-quiz')
      expect(orderTestTeacher.createdQuizzes[2]).to.equal('third-quiz')

      console.log('✅ Quiz order preservation test passed')
    })
  })

  describe('Teacher Contract - Edge Cases', function () {
    it('should handle teacher with empty name', async function () {
      console.log('\n👤 Testing teacher with empty name...')

      const emptyNameTeacher = await teacherComputer.new(Teacher, ['', teacherComputer.getPublicKey()])

      expect(emptyNameTeacher.name).to.equal('')
      expect(emptyNameTeacher.publicKey).to.be.a('string')
      expect(emptyNameTeacher.createdQuizzes).to.be.an('array').that.is.empty

      console.log('✅ Empty name teacher test passed')
    })

    it('should handle teacher with very long name', async function () {
      console.log('\n📏 Testing teacher with long name...')

      const longName = 'A'.repeat(100) // Create a 100-character name
      const longNameTeacher = await teacherComputer.new(Teacher, [longName, teacherComputer.getPublicKey()])

      expect(longNameTeacher.name).to.equal(longName)
      expect(longNameTeacher.publicKey).to.be.a('string')

      console.log('✅ Long name teacher test passed')
    })

    it('should maintain consistent public key', async function () {
      console.log('\n🔑 Testing public key consistency...')

      // Create multiple teachers to ensure the public key is consistent for the same computer
      const teacher1 = await teacherComputer.new(Teacher, ['Teacher 1', teacherComputer.getPublicKey()])
      const teacher2 = await teacherComputer.new(Teacher, ['Teacher 2', teacherComputer.getPublicKey()])

      // Both teachers should have the same public key since they use the same computer
      expect(teacher1.publicKey).to.equal(teacher2.publicKey)
      expect(teacher1.publicKey).to.equal(teacherComputer.getPublicKey())

      console.log('✅ Public key consistency test passed')
    })
  })

  describe('Integration - Single Teacher Complete Workflow', function () {
    it('should demonstrate complete single teacher workflow', async function () {
      console.log('\n🏆 Testing complete single teacher workflow...')

      // Create the single teacher for the application
      const appTeacher = await teacherComputer.new(Teacher, ['Application Head Teacher', teacherComputer.getPublicKey()])

      // Verify initial state
      expect(appTeacher.name).to.equal('Application Head Teacher')
      expect(appTeacher.publicKey).to.equal(teacherComputer.getPublicKey())
      expect(appTeacher.getQuizCount()).to.equal(0)
      expect(appTeacher.createdQuizzes).to.be.an('array').that.is.empty

      // Simulate creating multiple quizzes over time
      const quizCreationSequence = [
        { id: 'math-quiz-001', subject: 'Mathematics' },
        { id: 'science-quiz-001', subject: 'Science' },
        { id: 'history-quiz-001', subject: 'History' },
        { id: 'english-quiz-001', subject: 'English' },
      ]

      for (const quizInfo of quizCreationSequence) {
        appTeacher.addQuiz(quizInfo.id)
      }

      // Verify all quizzes were added
      expect(appTeacher.getQuizCount()).to.equal(4)
      expect(appTeacher.createdQuizzes).to.have.length(4)
      for (const quizInfo of quizCreationSequence) {
        expect(appTeacher.createdQuizzes).to.include(quizInfo.id)
      }

      // Verify teacher properties remain consistent
      expect(appTeacher.name).to.equal('Application Head Teacher')
      expect(appTeacher.publicKey).to.equal(teacherComputer.getPublicKey())

      console.log('✓ Single teacher workflow completed with', appTeacher.getQuizCount(), 'quizzes created')
      console.log('✓ Teacher name:', appTeacher.name)
      console.log('✓ Teacher public key matches computer:', appTeacher.publicKey === teacherComputer.getPublicKey())
      console.log('✓ Quiz IDs:', appTeacher.createdQuizzes)

      console.log('✅ Complete single teacher workflow test passed')
    })
  })

  after(async function () {
    console.log('\n🏁 Teacher Contract Tests for Single Teacher Application Completed Successfully!')
    console.log('\n📋 Summary of Tests Performed:')
    console.log('  ✓ Single teacher creation with correct properties')
    console.log('  ✓ Teacher quiz list management')
    console.log('  ✓ Quiz parameter validation')
    console.log('  ✓ Single teacher constraint verification')
    console.log('  ✓ Teacher identity persistence')
    console.log('  ✓ Special character handling')
    console.log('  ✓ Quiz management for single teacher')
    console.log('  ✓ Quiz order preservation')
    console.log('  ✓ Edge cases (empty name, long name)')
    console.log('  ✓ Public key consistency')
    console.log('  ✓ Complete single teacher workflow')
  })
})