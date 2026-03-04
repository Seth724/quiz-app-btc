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
export function getComputer(): Computer | null {
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
export function getTeacherHelper(computer?: Computer | null): TeacherHelper {
  if (!computer) throw new Error('Computer instance required')
  return new TeacherHelper(computer)
}

export function getStudentHelper(computer?: Computer | null): StudentHelper {
  if (!computer) throw new Error('Computer instance required')
  return new StudentHelper(computer)
}

export function getQuizHelper(computer?: Computer | null): QuizHelper {
  if (!computer) throw new Error('Computer instance required')
  return new QuizHelper(computer)
}

export function getAccessHelper(computer?: Computer | null): QuizAccessHelper {
  if (!computer) throw new Error('Computer instance required')
  return new QuizAccessHelper(computer, MODULE_SPECS.quizAccessMod)
}

export function getSaleHelper(computer?: Computer | null): QuizAccessSaleHelper {
  if (!computer) throw new Error('Computer instance required')
  return new QuizAccessSaleHelper(computer, MODULE_SPECS.quizAccessSaleMod)
}

export function getPaymentHelper(computer?: Computer | null): PaymentHelper {
  if (!computer) throw new Error('Computer instance required')
  return new PaymentHelper(computer, MODULE_SPECS.paymentMod)
}

export function getAttemptHelper(computer?: Computer | null): AttemptHelper {
  if (!computer) throw new Error('Computer instance required')
  return new AttemptHelper(computer)
}

/**
 * Get all helpers at once
 */
export function getAllHelpers(computer?: Computer | null) {
  if (!computer) throw new Error('Computer instance required')
  return {
    teacher: getTeacherHelper(computer),
    student: getStudentHelper(computer),
    quiz: getQuizHelper(computer),
    access: getAccessHelper(computer),
    sale: getSaleHelper(computer),
    payment: getPaymentHelper(computer),
    attempt: getAttemptHelper(computer),
  }
}
