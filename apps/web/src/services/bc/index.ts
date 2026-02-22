/**
 * Browser-Safe SDK Factory - Creates clients using helpers from quiz-contracts
 */

import { Computer } from '@bitcoin-computer/lib'
import { HelperQuizClient } from './HelperQuizClient'
import { HelperTeacherClient } from './HelperTeacherClient'
import { HelperAttemptClient } from './HelperAttemptClient'
import { HelperAccessClient } from './HelperAccessClient'
import { HelperStudentClient } from './HelperStudentClient'
import type { ComputerConfig } from '@quiz-app/shared'

/**
 * Create Computer instance
 */
export function createBrowserComputer(config: ComputerConfig): Computer {
  return new Computer(config)
}

/**
 * Browser-safe client factory - Helper-based (RECOMMENDED)
 * Uses helpers from @quiz-app/contracts package
 */
export class HelperSDKFactory {
  constructor(private computer: Computer) {}

  createQuizClient(): HelperQuizClient {
    return new HelperQuizClient(this.computer)
  }

  createTeacherClient(): HelperTeacherClient {
    return new HelperTeacherClient(this.computer)
  }

  createAttemptClient(): HelperAttemptClient {
    return new HelperAttemptClient(this.computer)
  }

  createAccessClient(): HelperAccessClient {
    return new HelperAccessClient(this.computer)
  }

  createStudentClient(): HelperStudentClient {
    return new HelperStudentClient(this.computer)
  }
}



/**
 * Create helper-based factory (RECOMMENDED)
 */
export function createHelperSDK(computer: Computer): HelperSDKFactory {
  return new HelperSDKFactory(computer)
}

/**
 * Create browser-based factory (DEPRECATED)
 */

// Re-export helper-based clients (preferred)
export * from './HelperQuizClient'
export * from './HelperTeacherClient'
export * from './HelperAttemptClient'
export * from './HelperAccessClient'
export * from './HelperStudentClient'

