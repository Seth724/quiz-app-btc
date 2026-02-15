/**
 * User role types
 */
export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student'
}

/**
 * Teacher data
 */
export interface TeacherData {
  name: string
  publicKey: string
  quizzes: string[]
}

/**
 * Student data
 */
export interface StudentData {
  name: string
  publicKey: string
  attemptedQuizzes: string[]
  claimedRewards: bigint
}
