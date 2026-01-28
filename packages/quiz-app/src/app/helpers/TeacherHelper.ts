import { Computer } from '@bitcoin-computer/lib'
import { Teacher, Quiz, Question } from '@quiz-app/contracts'

export class TeacherHelper {
  computer: Computer

  constructor(computer: Computer) {
    this.computer = computer
  }

  /**
   * Create a new teacher
   */
  async createTeacher(name: string): Promise<string> {
    const publicKey = this.computer.getPublicKey()
    
    console.log('TeacherHelper - createTeacher - name:', name)
    console.log('TeacherHelper - createTeacher - publicKey:', publicKey)
    
    try {
      // Use deployed module spec for browser compatibility
      const teacherModSpec = process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC
      if (!teacherModSpec) {
        throw new Error('Teacher module spec not found. Please deploy contracts first.')
      }
      
      console.log('TeacherHelper - createTeacher - using module spec:', teacherModSpec)
      
      try {
        // Try to load the deployed module and extract the Teacher class
        const moduleExports = await this.computer.load(teacherModSpec)
        console.log('TeacherHelper - createTeacher - loaded module exports:', Object.keys(moduleExports))
        
        // The deployed module should export the Teacher class
        const TeacherClass = (moduleExports as any).Teacher || (moduleExports as any).default
        if (!TeacherClass) {
          throw new Error('Teacher class not found in deployed module')
        }
        
        const teacher = await this.computer.new(TeacherClass, [name, publicKey])
        console.log('TeacherHelper - createTeacher - teacher created:', teacher._id)
        
        // Store teacher ID in localStorage for this public key
        const teacherId = teacher._id
        localStorage.setItem(`teacher_${publicKey}`, teacherId)
        
        return teacherId
      } catch (moduleError) {
        console.warn('TeacherHelper - createTeacher - module loading failed, falling back to direct class:', moduleError)
        
        // Fallback to using the imported Teacher class directly
        const teacher = await this.computer.new(Teacher, [name, publicKey])
        console.log('TeacherHelper - createTeacher - teacher created with fallback:', teacher._id)
        
        // Store teacher ID in localStorage for this public key
        const teacherId = teacher._id
        localStorage.setItem(`teacher_${publicKey}`, teacherId)
        
        return teacherId
      }
    } catch (error) {
      console.error('TeacherHelper - createTeacher - error:', error)
      throw error
    }
  }

  /**
   * Find teacher by public key
   */
  async findTeacherByPublicKey(publicKey: string): Promise<Teacher | null> {
    try {
      // First check localStorage
      const teacherId = localStorage.getItem(`teacher_${publicKey}`)
      if (teacherId) {
        const teacher = await this.computer.sync(teacherId) as Teacher
        return teacher
      }

      // Fallback to querying blockchain
      const revs = await this.computer.query({ publicKey })
      
      for (const rev of revs) {
        try {
          const obj = await this.computer.sync(rev)
          // Check if this is a Teacher object
          if (obj && typeof obj === 'object' && 'name' in obj && 'publicKey' in obj && 'createdQuizzes' in obj) {
            const teacher = obj as Teacher
            if (teacher.publicKey === publicKey) {
              // Cache the teacher ID
              localStorage.setItem(`teacher_${publicKey}`, teacher._id)
              return teacher
            }
          }
        } catch (error) {
          // Skip objects that can't be synced or aren't teachers
          continue
        }
      }
      
      return null
    } catch (error) {
      console.error('Error finding teacher:', error)
      return null
    }
  }

  /**
   * Get teacher by ID
   */
  async getTeacher(teacherId: string): Promise<Teacher | null> {
    try {
      const teacher = await this.computer.sync(teacherId) as Teacher
      return teacher
    } catch (error) {
      console.error('Error getting teacher:', error)
      return null
    }
  }

  /**
   * Get latest teacher state
   */
  async getLatestTeacher(teacherId: string): Promise<Teacher | null> {
    try {
      const [latestRev] = await this.computer.query({ ids: [teacherId] })
      if (latestRev) {
        const teacher = await this.computer.sync(latestRev) as Teacher
        return teacher
      }
      return null
    } catch (error) {
      console.error('Error getting latest teacher:', error)
      return null
    }
  }

  /**
   * Get quizzes created by this teacher
   */
  async getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
    try {
      const teacher = await this.getLatestTeacher(teacherId)
      if (!teacher || !teacher.createdQuizzes.length) {
        return []
      }

      const quizzes: Quiz[] = []
      for (const quizId of teacher.createdQuizzes) {
        try {
          const [latestQuizRev] = await this.computer.query({ ids: [quizId] })
          if (latestQuizRev) {
            const quiz = await this.computer.sync(latestQuizRev) as Quiz
            quizzes.push(quiz)
          }
        } catch (error) {
          console.error(`Error loading quiz ${quizId}:`, error)
          // Continue with other quizzes
        }
      }

      return quizzes
    } catch (error) {
      console.error('Error getting teacher quizzes:', error)
      return []
    }
  }

  /**
   * Create a quiz for this teacher
   */
  async createQuiz(params: {
    teacherId: string
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    duration?: number
  }): Promise<{ quizId: string; updatedTeacherId: string }> {
    const { teacherId, title, description, questions, rewardPerCorrect, duration } = params

    // Validate quiz parameters
    Teacher.validateQuizParams(questions, rewardPerCorrect)

    // Get teacher's latest state
    const teacher = await this.getLatestTeacher(teacherId)
    if (!teacher) {
      throw new Error('Teacher not found')
    }

    // Create the quiz using deployed module
    const quizModSpec = process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC
    if (!quizModSpec) {
      throw new Error('Quiz module spec not found. Please deploy contracts first.')
    }
    
    // Load the deployed quiz module
    const quizModuleExports = await this.computer.load(quizModSpec)
    const QuizClass = (quizModuleExports as any).Quiz || (quizModuleExports as any).default
    if (!QuizClass) {
      throw new Error('Quiz class not found in deployed module')
    }
    
    const quiz = await this.computer.new(QuizClass, [{
      title,
      description,
      questions,
      rewardPerCorrect,
      teacherPublicKey: teacher.publicKey,
      duration
    }])

    // Add quiz to teacher's list
    await teacher.addQuiz(quiz._id)

    return {
      quizId: quiz._id,
      updatedTeacherId: teacher._id
    }
  }
}