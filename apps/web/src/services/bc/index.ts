/**
 * Browser-Safe SDK Factory - Creates clients using mod specs
 */

import { Computer } from '@bitcoin-computer/lib'
import { BrowserQuizClient } from './BrowserQuizClient'
import { BrowserTeacherClient } from './BrowserTeacherClient'
import { BrowserAttemptClient } from './BrowserAttemptClient'
import { BrowserAccessClient } from './BrowserAccessClient'
import type { ComputerConfig } from '@quiz-app/shared'

/**
 * Create Computer instance
 */
export function createBrowserComputer(config: ComputerConfig): Computer {
  return new Computer(config)
}

/**
 * Browser-safe client factory
 */
export class BrowserSDKFactory {
  constructor(private computer: Computer) {}

  createQuizClient(): BrowserQuizClient {
    return new BrowserQuizClient(this.computer)
  }

  createTeacherClient(): BrowserTeacherClient {
    return new BrowserTeacherClient(this.computer)
  }

  createAttemptClient(): BrowserAttemptClient {
    return new BrowserAttemptClient(this.computer)
  }

  createAccessClient(): BrowserAccessClient {
    return new BrowserAccessClient(this.computer)
  }

  // Add other clients as needed
  // createPaymentClient() ...
}

/**
 * Create factory from computer instance
 */
export function createBrowserSDK(computer: Computer): BrowserSDKFactory {
  return new BrowserSDKFactory(computer)
}

export * from './BrowserQuizClient'
export * from './BrowserTeacherClient'
export * from './BrowserAttemptClient'
export * from './BrowserAccessClient'