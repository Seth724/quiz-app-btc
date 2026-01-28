import { Computer } from '@bitcoin-computer/lib'
import { Student, Quiz } from '@quiz-app/contracts'

export class StudentHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  /**
   * Create a new student
   */
  async createStudent(name: string): Promise<string> {
    const publicKey = this.computer.getPublicKey()
    
    // Use deployed module spec for browser compatibility
    const studentModSpec = process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC
    if (!studentModSpec) {
      throw new Error('Student module spec not found. Please deploy contracts first.')
    }
    
    // Load the deployed module and extract the Student class
    const moduleExports = await this.computer.load(studentModSpec)
    const StudentClass = (moduleExports as any).Student || (moduleExports as any).default
    if (!StudentClass) {
      throw new Error('Student class not found in deployed module')
    }
    
    const student = await this.computer.new(StudentClass, [name, publicKey])
    
    // Store student ID in localStorage for this public key
    const studentId = student._id
    localStorage.setItem(`student_${publicKey}`, studentId)
    
    return studentId
  }

  /**
   * Find student by public key
   */
  async findStudentByPublicKey(publicKey: string): Promise<Student | null> {
    try {
      // First check localStorage
      const studentId = localStorage.getItem(`student_${publicKey}`)
      if (studentId) {
        const student = await this.computer.sync(studentId) as Student
        return student
      }

      // Fallback to querying blockchain
      const revs = await this.computer.query({ publicKey })
      
      for (const rev of revs) {
        try {
          const obj = await this.computer.sync(rev)
          // Check if this is a Student object
          if (obj && typeof obj === 'object' && 'name' in obj && 'publicKey' in obj && 'completedQuizzes' in obj) {
            const student = obj as Student
            if (student.publicKey === publicKey) {
              // Cache the student ID
              localStorage.setItem(`student_${publicKey}`, student._id)
              return student
            }
          }
        } catch (error) {
          // Skip objects that can't be synced or aren't students
          continue
        }
      }
      
      return null
    } catch (error) {
      console.error('Error finding student:', error)
      return null
    }
  }

  /**
   * Get student by ID
   */
  async getStudent(studentId: string): Promise<Student | null> {
    try {
      const student = await this.computer.sync(studentId) as Student
      return student
    } catch (error) {
      console.error('Error getting student:', error)
      return null
    }
  }

  /**
   * Get latest student state
   */
  async getLatestStudent(studentId: string): Promise<Student | null> {
    try {
      const [latestRev] = await this.computer.query({ ids: [studentId] })
      if (latestRev) {
        const student = await this.computer.sync(latestRev) as Student
        return student
      }
      return null
    } catch (error) {
      console.error('Error getting latest student:', error)
      return null
    }
  }

  /**
   * Get quizzes completed by this student
   */
  async getCompletedQuizzes(studentId: string): Promise<Quiz[]> {
    try {
      const student = await this.getLatestStudent(studentId)
      if (!student || !student.completedQuizzes.length) {
        return []
      }

      const quizzes: Quiz[] = []
      for (const quizId of student.completedQuizzes) {
        try {
          const [latestQuizRev] = await this.computer.query({ ids: [quizId] })
          if (latestQuizRev) {
            const quiz = await this.computer.sync(latestQuizRev) as Quiz
            quizzes.push(quiz)
          }
        } catch (error) {
          console.error(`Error loading completed quiz ${quizId}:`, error)
          // Continue with other quizzes
        }
      }

      return quizzes
    } catch (error) {
      console.error('Error getting completed quizzes:', error)
      return []
    }
  }
}