/**
 * Contracts Service - Manages Computer instance and Helper clients
 */

import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS } from '@/config'
import { createComputerFromStorage } from '../sdk.factory'
import {
  HelperTeacherClient,
  HelperStudentClient,
  HelperQuizClient,
  HelperAccessClient,
  HelperAttemptClient,
} from '@/services/bc'

/**
 * Get Computer instance from storage (same as wallet)
 */
export function getComputer(): Computer {
  return createComputerFromStorage()
}

/**
 * Create a new Computer instance (useful for multi-wallet scenarios)
 */
export function createNewComputer(config: any): Computer {
  return new Computer(config)
}

/**
 * Reset Computer instance
 */
export function resetComputer(): void {
  // No singleton to reset since we're using storage-based computer
}

/**
 * Get Helper clients
 */
export function getTeacherClient(computer?: Computer): HelperTeacherClient {
  return new HelperTeacherClient(computer || getComputer())
}

export function getStudentClient(computer?: Computer): HelperStudentClient {
  return new HelperStudentClient(computer || getComputer())
}

export function getQuizClient(computer?: Computer): HelperQuizClient {
  return new HelperQuizClient(computer || getComputer())
}

export function getAccessClient(computer?: Computer): HelperAccessClient {
  return new HelperAccessClient(computer || getComputer())
}

export function getAttemptClient(computer?: Computer): HelperAttemptClient {
  return new HelperAttemptClient(computer || getComputer())
}

/**
 * Get all clients at once
 */
export function getAllClients(computer?: Computer) {
  const comp = computer || getComputer()
  return {
    teacher: getTeacherClient(comp),
    student: getStudentClient(comp),
    quiz: getQuizClient(comp),
    access: getAccessClient(comp),
    attempt: getAttemptClient(comp)
  }
}
