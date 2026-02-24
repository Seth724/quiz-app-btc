// Module specifications for deployed contracts
// These will be populated after running 'npm run deploy'

export const NEXT_PUBLIC_TEACHER_MOD_SPEC = process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC || ''
export const NEXT_PUBLIC_STUDENT_MOD_SPEC = process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC || ''
export const NEXT_PUBLIC_QUIZ_MOD_SPEC = process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC || ''
export const NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC = process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC || ''
export const NEXT_PUBLIC_PAYMENT_MOD_SPEC = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC || ''
export const NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC = process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC || ''
export const NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC = process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC || ''

// Validate that all module specifications are set
export function validateModSpecs(): boolean {
  return !!(
    NEXT_PUBLIC_TEACHER_MOD_SPEC &&
    NEXT_PUBLIC_STUDENT_MOD_SPEC &&
    NEXT_PUBLIC_QUIZ_MOD_SPEC &&
    NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC &&
    NEXT_PUBLIC_PAYMENT_MOD_SPEC &&
    NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC &&
    NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC
  )
}

// Get all module specifications as an object
export function getModSpecs() {
  return {
    teacher: NEXT_PUBLIC_TEACHER_MOD_SPEC,
    student: NEXT_PUBLIC_STUDENT_MOD_SPEC,
    quiz: NEXT_PUBLIC_QUIZ_MOD_SPEC,
    attempt: NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC,
    payment: NEXT_PUBLIC_PAYMENT_MOD_SPEC,
    quizAccess: NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC,
    quizAccessSale: NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC
  }
}