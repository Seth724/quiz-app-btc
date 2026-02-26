/**
 * Contracts Service - Manages Computer instance and quiz-contracts helpers
 */

import { Computer } from '@bitcoin-computer/lib'
import {
  TeacherHelper,
  StudentHelper,
  QuizHelper,
  QuizAccessHelper,
  QuizAccessSaleHelper,
  PaymentHelper,
  AttemptHelper,
} from '@quiz-app/contracts'
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
export function createNewComputer(config: Record<string, unknown>): Computer {
  return new Computer(config)
}

/**
 * Reset Computer instance
 */
export function resetComputer(): void {
  // No singleton to reset since we're using storage-based computer
}

/**
 * Get quiz-contracts helpers
 */
export function getTeacherHelper(computer?: Computer): TeacherHelper {
  return new TeacherHelper(computer || getComputer())
}

export function getStudentHelper(computer?: Computer): StudentHelper {
  return new StudentHelper(computer || getComputer())
}

export function getQuizHelper(computer?: Computer): QuizHelper {
  return new QuizHelper(computer || getComputer())
}

export function getAccessHelper(computer?: Computer): QuizAccessHelper {
  const comp = computer || getComputer()
  return new QuizAccessHelper(comp, MODULE_SPECS.quizAccessMod)
}

export function getSaleHelper(computer?: Computer): QuizAccessSaleHelper {
  const comp = computer || getComputer()
  return new QuizAccessSaleHelper(comp, MODULE_SPECS.quizAccessSaleMod)
}

export function getPaymentHelper(computer?: Computer): PaymentHelper {
  const comp = computer || getComputer()
  return new PaymentHelper(comp, MODULE_SPECS.paymentMod)
}

export function getAttemptHelper(computer?: Computer): AttemptHelper {
  return new AttemptHelper(computer || getComputer())
}

/**
 * Get all helpers at once
 */
export function getAllHelpers(computer?: Computer) {
  const comp = computer || getComputer()
  return {
    teacher: getTeacherHelper(comp),
    student: getStudentHelper(comp),
    quiz: getQuizHelper(comp),
    access: getAccessHelper(comp),
    sale: getSaleHelper(comp),
    payment: getPaymentHelper(comp),
    attempt: getAttemptHelper(comp),
  }
}
