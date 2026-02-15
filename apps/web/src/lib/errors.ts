/**
 * Custom error classes for Quiz App
 */

export class QuizAppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuizAppError'
  }
}

export class WalletError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'WalletError'
  }
}

export class ContractError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'ContractError'
  }
}

export class ValidationError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends QuizAppError {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}
