// import { Computer } from '@bitcoin-computer/lib'
// import { config } from 'dotenv'
// import { Teacher } from '../src/teacher.js'
// import { Student } from '../src/student.js'
// import { Quiz } from '../src/quiz.js'
// import { QuizAttempt } from '../src/attempt.js'
// import { ContractUtils } from '../src/utils/mineblock.js'
// import type { Question } from '../src/quiz.js'

// // Load environment variables
// config()

// // Get configuration from environment
// const chain = process.env.NEXT_PUBLIC_CHAIN || 'LTC'
// const network = process.env.NEXT_PUBLIC_NETWORK || 'regtest'
// const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:1031'
// const basePath = process.env.NEXT_PUBLIC_PATH || "m/44'/0'/0'/0"

// // Shared computers to prevent "too many clients" error
// export let sharedTeacher1Computer: Computer
// export let sharedTeacher2Computer: Computer
// export let sharedStudent1Computer: Computer
// export let sharedStudent2Computer: Computer

// // Shared entities
// export let sharedTeacher1: Teacher
// export let sharedTeacher2: Teacher
// export let sharedStudent1: Student
// export let sharedStudent2: Student

// export const sampleQuestions: Question[] = [
//   {
//     text: 'What is 2+2?',
//     options: ['3', '4', '5', '6'],
//     correctAnswer: 1
//   },
//   {
//     text: 'What is the capital of France?',
//     options: ['London', 'Berlin', 'Paris', 'Madrid'],
//     correctAnswer: 2
//   }
// ]

// export async function setupSharedComputers() {
//   console.log('🔧 Setting up shared computers...')

//   // Create computers with different paths but reuse them across tests
//   sharedTeacher1Computer = new Computer({
//     chain,
//     network,
//     url,
//     path: `${basePath}/0` // Teacher 1 path
//   })

//   sharedTeacher2Computer = new Computer({
//     chain,
//     network,
//     url,
//     path: `${basePath}/1` // Teacher 2 path
//   })

//   sharedStudent1Computer = new Computer({
//     chain,
//     network,
//     url,
//     path: `${basePath}/2` // Student 1 path
//   })

//   sharedStudent2Computer = new Computer({
//     chain,
//     network,
//     url,
//     path: `${basePath}/3` // Student 2 path
//   })

//   // Fund wallets for regtest
//   if (network === 'regtest') {
//     console.log('💰 Funding wallets for regtest...')
//     await Promise.all([
//       sharedTeacher1Computer.faucet(2e8),
//       sharedTeacher2Computer.faucet(2e8),
//       sharedStudent1Computer.faucet(1e8),
//       sharedStudent2Computer.faucet(1e8)
//     ])
//     console.log('✅ Wallets funded successfully')
//   }

//   console.log('✅ Shared computers set up successfully')
// }

// export async function createSharedEntities() {
//   console.log('👥 Creating shared entities...')

//   // Create shared entities
//   sharedTeacher1 = await sharedTeacher1Computer.new(Teacher, ['Professor Smith', sharedTeacher1Computer.getPublicKey()]) as Teacher
//   console.log('✅ Teacher 1 created:', sharedTeacher1.name, 'Public Key:', sharedTeacher1.publicKey.slice(0, 10) + '...')

//   // Mine block to avoid mempool conflicts
//   if (network === 'regtest') {
//     await ContractUtils.mineBlockFromRPCClient(sharedTeacher1Computer)
//   }

//   sharedTeacher2 = await sharedTeacher2Computer.new(Teacher, ['Professor Jones', sharedTeacher2Computer.getPublicKey()]) as Teacher
//   console.log('✅ Teacher 2 created:', sharedTeacher2.name, 'Public Key:', sharedTeacher2.publicKey.slice(0, 10) + '...')

//   // Mine block to avoid mempool conflicts
//   if (network === 'regtest') {
//     await ContractUtils.mineBlockFromRPCClient(sharedTeacher2Computer)
//   }

//   sharedStudent1 = await sharedStudent1Computer.new(Student, ['John Doe', sharedStudent1Computer.getPublicKey()]) as Student
//   console.log('✅ Student 1 created:', sharedStudent1.name, 'Public Key:', sharedStudent1.publicKey.slice(0, 10) + '...')

//   // Mine block to avoid mempool conflicts
//   if (network === 'regtest') {
//     await ContractUtils.mineBlockFromRPCClient(sharedStudent1Computer)
//   }

//   sharedStudent2 = await sharedStudent2Computer.new(Student, ['Jane Smith', sharedStudent2Computer.getPublicKey()]) as Student
//   console.log('✅ Student 2 created:', sharedStudent2.name, 'Public Key:', sharedStudent2.publicKey.slice(0, 10) + '...')

//   // Mine block to avoid mempool conflicts
//   if (network === 'regtest') {
//     await ContractUtils.mineBlockFromRPCClient(sharedStudent2Computer)
//   }

//   console.log('✅ All shared entities created successfully')
// }

// export async function teardownSharedComputers() {
//   console.log('🧹 Tearing down shared computers (if needed)...')
//   // Bitcoin Computer lib handles cleanup automatically
//   console.log('✅ Teardown complete')
// }