/**
 * Helper to safely access module specifications
 */
export class ModuleHelper {
  static getTeacherModSpec(): string {
    const modSpec = process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC
    if (!modSpec) {
      throw new Error('Teacher module spec not found in environment. Please run deployment first.')
    }
    console.log('ModuleHelper - Teacher mod spec:', modSpec)
    return modSpec
  }

  static getStudentModSpec(): string {
    const modSpec = process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC
    if (!modSpec) {
      throw new Error('Student module spec not found in environment. Please run deployment first.')
    }
    console.log('ModuleHelper - Student mod spec:', modSpec)
    return modSpec
  }

  static getQuizModSpec(): string {
    const modSpec = process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC
    if (!modSpec) {
      throw new Error('Quiz module spec not found in environment. Please run deployment first.')
    }
    console.log('ModuleHelper - Quiz mod spec:', modSpec)
    return modSpec
  }

  static getQuizAttemptModSpec(): string {
    const modSpec = process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC
    if (!modSpec) {
      throw new Error('QuizAttempt module spec not found in environment. Please run deployment first.')
    }
    console.log('ModuleHelper - QuizAttempt mod spec:', modSpec)
    return modSpec
  }

  static getPaymentModSpec(): string {
    const modSpec = process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
    if (!modSpec) {
      throw new Error('Payment module spec not found in environment. Please run deployment first.')
    }
    console.log('ModuleHelper - Payment mod spec:', modSpec)
    return modSpec
  }

  static getAllModSpecs() {
    return {
      teacher: this.getTeacherModSpec(),
      student: this.getStudentModSpec(), 
      quiz: this.getQuizModSpec(),
      attempt: this.getQuizAttemptModSpec(),
      payment: this.getPaymentModSpec()
    }
  }
}