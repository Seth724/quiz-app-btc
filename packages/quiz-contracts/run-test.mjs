#!/usr/bin/env node
/**
 * Test Runner Script
 * 
 * This script helps run specific tests with proper configuration
 * 
 * Usage:
 *   node run-test.js simple          # Run simple workflow test
 *   node run-test.js complete        # Run complete workflow test
 *   node run-test.js all             # Run all tests
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const testMap = {
  simple: 'test/simple-workflow.test.ts',
  complete: 'test/complete-quiz-flow.test.ts',
  all: 'test/**/*.test.ts'
}

const testName = process.argv[2] || 'all'
const testFile = testMap[testName]

if (!testFile) {
  console.error(`Unknown test: ${testName}`)
  console.log('Available tests:', Object.keys(testMap).join(', '))
  process.exit(1)
}

console.log(`\n${'='.repeat(60)}`)
console.log(`Running: ${testName} test`)
console.log(`File: ${testFile}`)
console.log('='.repeat(60))
console.log()

const npmTest = spawn('npm', ['test', '--', testFile], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
})

npmTest.on('close', (code) => {
  console.log()
  console.log('='.repeat(60))
  if (code === 0) {
    console.log('✓ Tests passed!')
  } else {
    console.log('✗ Tests failed with code:', code)
  }
  console.log('='.repeat(60))
  console.log()
  process.exit(code)
})
