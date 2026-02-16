/**
 * Contracts Service - Manages Computer instance and SDK clients
 */

import { Computer } from '@bitcoin-computer/lib'
import {
  TeacherClient,
  StudentClient,
  QuizClient,
  AccessClient,
  PaymentClient,
  AttemptClient
} from '@quiz-app/sdk'
import { MODULE_SPECS } from '@/config'
import { createComputerFromStorage } from '../sdk.factory'

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
 * Get SDK clients
 */
export function getTeacherClient(computer?: Computer): TeacherClient {
  return new TeacherClient(computer || getComputer())
}

export function getStudentClient(computer?: Computer): StudentClient {
  return new StudentClient(computer || getComputer())
}

export function getQuizClient(computer?: Computer): QuizClient {
  return new QuizClient(computer || getComputer())
}

export function getAccessClient(computer?: Computer): AccessClient {
  const comp = computer || getComputer()
  return new AccessClient(comp, MODULE_SPECS.quizAccessMod, MODULE_SPECS.quizAccessSaleMod)
}

export function getPaymentClient(computer?: Computer): PaymentClient {
  const comp = computer || getComputer()
  return new PaymentClient(comp, MODULE_SPECS.paymentMod)
}

export function getAttemptClient(computer?: Computer): AttemptClient {
  return new AttemptClient(computer || getComputer())
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
    payment: getPaymentClient(comp),
    attempt: getAttemptClient(comp)
  }
}
