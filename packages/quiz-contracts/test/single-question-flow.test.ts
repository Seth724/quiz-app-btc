// import { expect } from 'chai'
// import { Computer } from '@bitcoin-computer/lib'
// import { TeacherHelper } from '../src/helpers/teacher-helper.js'
// import { StudentHelper } from '../src/helpers/student-helper.js'
// import { PaymentHelper } from '../src/helpers/payment-helper.js'
// import { config } from 'dotenv'

// // Load environment variables
// config()

// // Get configuration from environment with proper defaults for Bitcoin Computer
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'  // Valid: 'LTC', 'BTC', 'DOGE', 'PEPE'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest' // Valid: 'mainnet', 'testnet', 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031' // Use remote node as fallback
// const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/1'/0'/0" // LTC derivation path

// describe('Single Question Quiz First-Come-First-Served Flow', function () {
//   this.timeout(300000) // 5 minute timeout

//   let teacherComputer: Computer
//   let student1Computer: Computer
//   let student2Computer: Computer

//   let teacherHelper: TeacherHelper
//   let student1Helper: StudentHelper
//   let student2Helper: StudentHelper
//   let paymentHelper: PaymentHelper

//   // Test objects
//   let teacher: any
//   let student1: any
//   let student2: any
//   let quiz: any
//   let paymentTxId: string

//   before(async function () {
//     console.log('\n🚀 Setting up test environment...')
//     console.log(`Chain: ${chain}, Network: ${network}`)
//     console.log(`Node URL: ${url}`)

//     // Initialize computer instances with proper Bitcoin Computer configuration
//     teacherComputer = new Computer({
//       chain: chain,
//       network: network,
//       url: url,
//       path: `${basePath}/0` // Teacher path
//     })

//     student1Computer = new Computer({
//       chain: chain,
//       network: network,
//       url: url,
//       path: `${basePath}/1` // Student 1 path
//     })

//     student2Computer = new Computer({
//       chain: chain,
//       network: network,
//       url: url,
//       path: `${basePath}/2` // Student 2 path
//     })

//     // Initialize helpers
//     teacherHelper = new TeacherHelper(teacherComputer)
//     student1Helper = new StudentHelper(student1Computer)
//     student2Helper = new StudentHelper(student2Computer)
//     paymentHelper = new PaymentHelper(teacherComputer)

//     // Fund wallets on regtest (only works on regtest)
//     if (network === 'regtest') {
//       console.log('💰 Funding wallets on regtest...')
//       try {
//         await teacherComputer.faucet(1e8) // 1 LTC
//         await student1Computer.faucet(1e8) // 1 LTC
//         await student2Computer.faucet(1e8) // 1 LTC
//         console.log('✅ Wallets funded successfully')

//         // Add some delay to avoid potential conflicts
//         await new Promise(resolve => setTimeout(resolve, 5000))
//       } catch (error) {
//         console.log(`⚠️ Warning: Faucet failed (${(error as any).message}), continuing with existing funds`)
//       }
//     }

//     // Deploy payment contract with retry logic
//     try {
//       await paymentHelper.deploy()
//       console.log('✅ Payment helper deployed')

//       // Add substantial delay after deployment to prevent mempool conflicts
//       console.log('⏳ Waiting to prevent mempool conflicts...')
//         await new Promise(resolve => setTimeout(resolve, 5000))
//     } catch (error) {
//       console.log(`⚠️ Payment helper deployment failed: ${(error as any).message}`)
//       // Continue without deployment - we'll handle this in the tests

//       // Add delay even after failed deployment
//       await new Promise(resolve => setTimeout(resolve, 2000))
//     }

//     console.log('✅ Test environment ready')
//   })

//   describe('Initial Setup', function () {
//     it('should create teacher and students', async function () {
//       console.log('👨‍🏫 Creating teacher...')
      
//       // Add initial delay before teacher creation
//       console.log('⏳ Waiting before teacher creation...')
//       await new Promise(resolve => setTimeout(resolve, 2000))
      
//       // Retry mechanism for teacher creation
//       let retries = 3
//       let teacherCreated = false
      
//       while (retries > 0 && !teacherCreated) {
//         try {
//           teacher = await teacherHelper.createTeacher('Prof. Smith', teacherComputer.getPublicKey())
//           console.log(`Teacher created: ${teacher._id}`)
//           expect(teacher).to.exist
//           expect(teacher._id).to.be.a('string')
//           teacherCreated = true
//         } catch (error) {
//           retries--
//           console.error(`Teacher creation attempt failed: ${(error as any).message}`)
//           if (retries > 0) {
//             console.log(`⏳ Retrying teacher creation in 5 seconds... (${retries} retries left)`)
//             await new Promise(resolve => setTimeout(resolve, 5000))
//           } else {
//             throw error
//           }
//         }
//       }
      
//       if (teacherCreated) {
//         // Add delay after teacher creation
//         console.log('⏳ Waiting after teacher creation...')
//         await new Promise(resolve => setTimeout(resolve, 3000))
//       console.log('👨‍🎓 Creating students...')
//       try {
//         student1 = await student1Helper.createStudent('Alice', student1Computer.getPublicKey())
//         console.log(`Student 1 (Alice) created: ${student1._id}`)
//         expect(student1).to.exist
//         expect(student1._id).to.be.a('string')

//         // Add delay between student creations
//         console.log('⏳ Waiting between student creations...')
//         await new Promise(resolve => setTimeout(resolve, 3000))
//       } catch (error) {
//         console.error('Student 1 creation failed:', (error as any).message)
//         throw error
//       }

//       try {
//         student2 = await student2Helper.createStudent('Bob', student2Computer.getPublicKey())
//         console.log(`Student 2 (Bob) created: ${student2._id}`)
//         expect(student2).to.exist
//         expect(student2._id).to.be.a('string')

//         // Add delay after final student creation
//         console.log('⏳ Waiting after student creation...')
//         await new Promise(resolve => setTimeout(resolve, 3000))
//       } catch (error) {
//         console.error('Student 2 creation failed:', (error as any).message)
//         throw error
//       }
//     }
  

//     it('should verify teacher can create single question quiz', async function () {
//       console.log('\n📝 Creating single question quiz...')

//       // Ensure teacher exists
//       if (!teacher || !teacher._id) {
//         throw new Error('Teacher must be created before creating quiz')
//       }

//       // Add delay before quiz creation to prevent mempool conflicts
//       console.log('⏳ Waiting before quiz creation...')
//       await new Promise(resolve => setTimeout(resolve, 5000))

//       const quizParams = {
//         title: 'Math Quiz #1',
//         questionText: 'What is 2 + 3?',
//         options: ['4', '5', '6', '7'],
//         correctAnswer: 1, // '5' is at index 1
//         rewardAmount: 1000n,
//         teacher
//       }

//       try {
//         const result = await teacherHelper.createQuiz(quizParams)
//         quiz = result.quiz
//         paymentTxId = result.paymentTxId

//         console.log(`Quiz created: ${quiz._id}`)
//         console.log(`Payment created: ${paymentTxId}`)

//         // Verify quiz properties
//         expect(quiz).to.exist
//         expect(quiz._id).to.be.a('string')
//         expect(quiz.title).to.equal('Math Quiz #1')
//         expect(quiz.questionText).to.equal('What is 2 + 3?')
//         expect(quiz.options).to.deep.equal(['4', '5', '6', '7'])
//         expect(quiz.correctAnswer).to.equal(1)
//         expect(quiz.rewardAmount).to.equal(1000n)
//         expect(quiz.isActive).to.equal(true)
//         expect(quiz.isClaimed).to.equal(false)
//         expect(quiz.claimedBy).to.equal('')
//         expect(quiz.attemptedStudents).to.deep.equal([])

//         // Verify payment exists
//         expect(paymentTxId).to.be.a('string')
//         console.log('✅ Quiz and payment verified successfully')

//         // Add delay after quiz creation to prevent mempool conflicts in subsequent tests
//         console.log('⏳ Waiting after quiz creation...')
//         await new Promise(resolve => setTimeout(resolve, 5000))
//       } catch (error) {
//         console.error('Quiz creation failed:', (error as any).message)
//         throw error
//       }
//     })
//   })

//   describe('Quiz Attempts - First Come First Served', function () {
//     it('should allow Student 1 (Alice) to attempt quiz with correct answer', async function () {
//       console.log('\n🏃‍♀️ Alice attempts quiz first...')

//       // Add delay before first quiz attempt
//       console.log('⏳ Waiting before quiz attempt...')
//       await new Promise(resolve => setTimeout(resolve, 5000))

//       try {
//         // Validate required objects exist
//         if (!quiz || !quiz._id) {
//           throw new Error('Quiz object is undefined or missing _id')
//         }
//         if (!student1 || !student1._id) {
//           throw new Error('Student1 object is undefined or missing _id')
//         }

//         console.log(`Attempting quiz with ID: ${quiz._id} for student: ${student1._id}`)

//         const result = await student1Helper.attemptQuiz({
//           quizId: quiz._id,
//           studentId: student1._id,
//           selectedAnswer: 1 // Correct answer
//         })

//         console.log(`Result: ${JSON.stringify(result, null, 2)}`)

//         expect(result.isCorrect).to.equal(true)
//         expect(result.rewardClaimed).to.equal(1000n)
//         expect(result.paymentTransferred).to.equal(true)

//         // Verify quiz state is updated
//         const updatedQuiz = await student1Helper.getQuiz(quiz._id)
//         expect(updatedQuiz.isClaimed).to.equal(true)
//         expect(updatedQuiz.claimedBy).to.equal(student1Computer.getPublicKey())
//         expect(updatedQuiz.attemptedStudents).to.include(student1Computer.getPublicKey())

//         // Verify payment ownership transferred to Alice
//         const isAliceOwned = await paymentHelper.isPaymentOwnedBy(paymentTxId, student1Computer.getPublicKey())
//         expect(isAliceOwned).to.equal(true)

//         // Verify Alice's total rewards
//         const aliceTotalRewards = await student1Helper.getStudentTotalRewards(student1._id)
//         expect(aliceTotalRewards).to.equal(1000n)

//         console.log('✅ Student 1 quiz attempt test completed successfully')

//         // Add delay after Student 1 attempt to prevent mempool conflicts
//         console.log('⏳ Waiting after Student 1 attempt...')
//         await new Promise(resolve => setTimeout(resolve, 5000))
//       } catch (error) {
//         console.error('❌ Student 1 quiz attempt test failed:', error)
//         console.error('Quiz object:', quiz)
//         console.error('Student1 object:', student1)
//         throw error
//       }
//     })

//     it('should allow Student 2 (Bob) to attempt quiz with correct answer but receive no reward (already claimed)', async function () {
//       console.log('\n🏃‍♂️ Bob attempts quiz second (too late)...')

//       // Add delay before Bob's attempt
//       console.log('⏳ Waiting before Bob\'s attempt...')
//       await new Promise(resolve => setTimeout(resolve, 5000))

//       try {
//         // Validate required objects exist
//         if (!quiz || !quiz._id) {
//           throw new Error('Quiz object is undefined or missing _id')
//         }
//         if (!student2 || !student2._id) {
//           throw new Error('Student2 object is undefined or missing _id')
//         }

//         console.log(`Attempting quiz with ID: ${quiz._id} for student: ${student2._id}`)

//         const result = await student2Helper.attemptQuiz({
//           quizId: quiz._id,
//           studentId: student2._id,
//           selectedAnswer: 1 // Also correct answer, but too late
//         })

//         console.log(`Result: ${JSON.stringify(result, null, 2)}`)

//         expect(result.isCorrect).to.equal(true)
//         expect(result.rewardClaimed).to.equal(0n) // No reward because already claimed
//         expect(result.paymentTransferred).to.equal(false)

//         // Verify quiz state remains with Alice as claimer
//         const updatedQuiz = await student2Helper.getQuiz(quiz._id)
//         expect(updatedQuiz.isClaimed).to.equal(true)
//         expect(updatedQuiz.claimedBy).to.equal(student1Computer.getPublicKey()) // Still Alice
//         expect(updatedQuiz.attemptedStudents).to.include(student2Computer.getPublicKey())

//         // Verify payment still belongs to Alice
//         const isAliceOwned = await paymentHelper.isPaymentOwnedBy(paymentTxId, student1Computer.getPublicKey())
//         const isBobOwned = await paymentHelper.isPaymentOwnedBy(paymentTxId, student2Computer.getPublicKey())
//         expect(isAliceOwned).to.equal(true)
//         expect(isBobOwned).to.equal(false)

//         // Verify Bob's total rewards remain 0
//         const bobTotalRewards = await student2Helper.getStudentTotalRewards(student2._id)
//         expect(bobTotalRewards).to.equal(0n)

//         console.log('✅ Student 2 quiz attempt test completed successfully')
//       } catch (error) {
//         console.error('❌ Student 2 quiz attempt test failed:', error)
//         console.error('Quiz object:', quiz)
//         console.error('Student2 object:', student2)
//         throw error
//       }
//     })

//     it('should prevent students from attempting the same quiz twice', async function () {
//       console.log('\n🚫 Testing duplicate attempt prevention...')

//       try {
//         // Validate required objects exist
//         if (!quiz || !quiz._id) {
//           throw new Error('Quiz object is undefined or missing _id')
//         }
//         if (!student1 || !student1._id) {
//           throw new Error('Student1 object is undefined or missing _id')
//         }

//         await student1Helper.attemptQuiz({
//           quizId: quiz._id,
//           studentId: student1._id,
//           selectedAnswer: 2 // Different answer this time
//         })
//         expect.fail('Should have thrown an error for duplicate attempt')
//       } catch (error) {
//         if ((error as any).message?.includes('Should have thrown an error')) {
//           throw error // Re-throw test failure
//         }
//         expect((error as any).message).to.include('already attempted this quiz')
//         console.log(`✅ Correctly prevented duplicate attempt: ${(error as any).message}`)
//       }
//     })

//     it('should reject invalid answer indices', async function () {
//       console.log('\n🚫 Testing invalid answer validation...')

//       try {
//         // Validate required objects exist
//         if (!teacher || !teacher._id) {
//           throw new Error('Teacher object is undefined or missing _id')
//         }
//         if (!student1 || !student1._id) {
//           throw new Error('Student1 object is undefined or missing _id')
//         }

//         // Create a new quiz for this test
//         const newQuizResult = await teacherHelper.createQuiz({
//           title: 'Math Quiz #2',
//           questionText: 'What is 5 - 3?',
//           options: ['1', '2', '3', '4'],
//           correctAnswer: 1,
//           rewardAmount: 500n,
//           teacher
//         })

//         if (!newQuizResult?.quiz?._id) {
//           throw new Error('Failed to create new quiz or quiz missing _id')
//         }

//         try {
//           await student1Helper.attemptQuiz({
//             quizId: newQuizResult.quiz._id,
//             studentId: student1._id,
//             selectedAnswer: 4 // Invalid - only 0-3 allowed
//           })
//           expect.fail('Should have thrown an error for invalid answer index')
//         } catch (error) {
//           if ((error as any).message?.includes('Should have thrown an error')) {
//             throw error // Re-throw test failure
//           }
//           expect((error as any).message).to.include('Selected answer must be between 0-3')
//           console.log(`✅ Correctly rejected invalid answer: ${(error as any).message}`)
//         }

//         console.log('✅ Invalid answer validation test completed successfully')
//       } catch (error) {
//         console.error('❌ Invalid answer validation test failed:', error)
//         console.error('Teacher object:', teacher)
//         console.error('Student1 object:', student1)
//         throw error
//       }
//     })
//   })

//   describe('Quiz Creation Validation', function () {
//     it('should validate quiz must have exactly 4 options', async function () {
//       console.log('\n🚫 Testing quiz validation - wrong number of options...')

//       try {
//         // Validate required objects exist
//         if (!teacher || !teacher._id) {
//           throw new Error('Teacher object is undefined or missing _id')
//         }

//         try {
//           await teacherHelper.createQuiz({
//             title: 'Invalid Quiz',
//             questionText: 'What is 1 + 1?',
//             options: ['1', '2'], // Only 2 options, should be 4
//             correctAnswer: 1,
//             rewardAmount: 100n,
//             teacher
//           })
//           expect.fail('Should have thrown an error for wrong number of options')
//         } catch (error) {
//           if ((error as any).message?.includes('Should have thrown an error')) {
//             throw error // Re-throw test failure
//           }
//           expect((error as any).message).to.include('Quiz must have exactly 4 options')
//           console.log(`✅ Correctly rejected quiz with wrong option count: ${(error as any).message}`)
//         }

//         console.log('✅ Quiz option validation test completed successfully')
//       } catch (error) {
//         console.error('❌ Quiz option validation test failed:', error)
//         console.error('Teacher object:', teacher)
//         throw error
//       }
//     })

//     it('should validate correct answer index is within range', async function () {
//       console.log('\n🚫 Testing quiz validation - invalid correct answer...')

//       try {
//         // Validate required objects exist
//         if (!teacher || !teacher._id) {
//           throw new Error('Teacher object is undefined or missing _id')
//         }

//         try {
//           await teacherHelper.createQuiz({
//             title: 'Invalid Quiz',
//             questionText: 'What is 1 + 1?',
//             options: ['1', '2', '3', '4'],
//             correctAnswer: 4, // Invalid - should be 0-3
//             rewardAmount: 100n,
//             teacher
//           })
//           expect.fail('Should have thrown an error for invalid correct answer index')
//         } catch (error) {
//           if ((error as any).message?.includes('Should have thrown an error')) {
//             throw error // Re-throw test failure
//           }
//           expect((error as any).message).to.include('Correct answer must be between 0 and 3')
//           console.log(`✅ Correctly rejected quiz with invalid correct answer: ${(error as any).message}`)
//         }

//         console.log('✅ Correct answer validation test completed successfully')
//       } catch (error) {
//         console.error('❌ Correct answer validation test failed:', error)
//         console.error('Teacher object:', teacher)
//         throw error
//       }
//     })
//   })

//   describe('Leaderboard and Statistics', function () {
//     it('should create multiple quizzes and track total rewards correctly', async function () {
//       console.log('\n📊 Testing leaderboard functionality...')

//       try {
//         // Validate required objects exist
//         if (!teacher || !teacher._id) {
//           throw new Error('Teacher object is undefined or missing _id')
//         }
//         if (!student1 || !student1._id) {
//           throw new Error('Student1 object is undefined or missing _id')
//         }
//         if (!student2 || !student2._id) {
//           throw new Error('Student2 object is undefined or missing _id')
//         }

//         // Create Quiz #3 - Alice gets it
//         const quiz3Result = await teacherHelper.createQuiz({
//           title: 'Geography Quiz',
//           questionText: 'What is the capital of France?',
//           options: ['London', 'Berlin', 'Paris', 'Madrid'],
//           correctAnswer: 2,
//           rewardAmount: 1500n,
//           teacher
//         })

//         if (!quiz3Result?.quiz?._id) {
//           throw new Error('Failed to create Quiz #3 or quiz missing _id')
//         }

//         await student1Helper.attemptQuiz({
//           quizId: quiz3Result.quiz._id,
//           studentId: student1._id,
//           selectedAnswer: 2 // Correct
//         })

//         // Create Quiz #4 - Bob gets it this time
//         const quiz4Result = await teacherHelper.createQuiz({
//           title: 'Science Quiz',
//           questionText: 'What is H2O?',
//           options: ['Oxygen', 'Water', 'Hydrogen', 'Carbon'],
//           correctAnswer: 1,
//           rewardAmount: 2000n,
//           teacher
//         })

//         if (!quiz4Result?.quiz?._id) {
//           throw new Error('Failed to create Quiz #4 or quiz missing _id')
//         }

//         await student2Helper.attemptQuiz({
//           quizId: quiz4Result.quiz._id,
//           studentId: student2._id,
//           selectedAnswer: 1 // Correct
//         })

//         // Alice tries but is too late
//         await student1Helper.attemptQuiz({
//           quizId: quiz4Result.quiz._id,
//           studentId: student1._id,
//           selectedAnswer: 1 // Correct but late
//         })

//         // Check final totals
//         const aliceTotal = await student1Helper.getStudentTotalRewards(student1._id)
//         const bobTotal = await student2Helper.getStudentTotalRewards(student2._id)

//         console.log(`Alice total rewards: ${aliceTotal} sats`)
//         console.log(`Bob total rewards: ${bobTotal} sats`)

//         expect(aliceTotal).to.equal(2500n) // Quiz 1 (1000) + Quiz 3 (1500)
//         expect(bobTotal).to.equal(2000n) // Quiz 4 (2000)

//         console.log('✅ Leaderboard functionality test completed successfully')
//       } catch (error) {
//         console.error('❌ Leaderboard functionality test failed:', error)
//         console.error('Teacher object:', teacher)
//         console.error('Student1 object:', student1)
//         console.error('Student2 object:', student2)
//         throw error
//       }
//     })
//   })

//   after(async function () {
//     console.log('\n🏁 Test completed successfully!')
//     console.log('Summary:')
//     console.log('✅ Single question quiz architecture working')
//     console.log('✅ First-come-first-served payment transfer working')
//     console.log('✅ Payment ownership validation working')
//     console.log('✅ Quiz attempt tracking working')
//     console.log('✅ Leaderboard calculation working')
//     console.log('✅ Input validation working')
//   })
// })
