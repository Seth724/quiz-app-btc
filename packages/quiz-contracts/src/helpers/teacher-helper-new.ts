import { Computer } from '@bitcoin-computer/lib'
import { Teacher } from '../teacher.js'
import { QuizHelper } from './quiz-helper-fixed.js'
import { Question } from '../quiz.js'
import { MineBlocks } from '../utils/mineblock.js'

export class TeacherHelper {
  computer: Computer
  quizHelper: QuizHelper

  constructor(computer: Computer) {
    this.computer = computer
    this.quizHelper = new QuizHelper(computer)
  }

  async createTeacher(name: string, publicKey: string): Promise<Teacher> {
    const teacher = await this.computer.new(Teacher, [name, publicKey])
    await this.mineBlocks()
    return teacher
  }

  async getTeacher(teacherId: string): Promise<Teacher> {
    return await this.computer.sync(teacherId) as Teacher
  }

  async createQuiz(params: {
    title: string
    description: string
    questions: Question[]
    rewardPerCorrect: bigint
    teacher: Teacher
  }): Promise<{ quiz: any; paymentTxIds: string[] }> {
    console.log(`🎯 Teacher creating quiz: ${params.title}`)
    
    // Validate quiz parameters
    Teacher.validateQuizParams(params.questions, params.rewardPerCorrect)

    // Create quiz with payments
    const result = await this.quizHelper.createQuizWithPayments({
      title: params.title,
      description: params.description,
      questions: params.questions,
      rewardPerCorrect: params.rewardPerCorrect,
      teacherPublicKey: params.teacher.publicKey
    })

    // Add quiz to teacher's list - need to sync teacher first
    const updatedTeacher = await this.getTeacher(params.teacher._id)
    await updatedTeacher.addQuiz(result.quiz._id)

    // Mine blocks after updating teacher state
    await this.mineBlocks()

    console.log(`✅ Quiz created successfully: ${result.quiz._id}`)
    return result
  }

  async deactivateQuiz(teacher: Teacher, quizId: string) {
    const quiz = await this.quizHelper.getQuiz(quizId)

    // Only allow the teacher to deactivate their own quiz
    if (quiz.teacherPublicKey !== teacher.publicKey) {
      throw new Error('Only the quiz creator can deactivate this quiz')
    }

    await this.quizHelper.deactivateQuiz(quiz)
  }

  async getQuizCount(teacher: Teacher): Promise<number> {
    return await teacher.getQuizCount()
  }

  async validateQuizParams(questions: Question[], rewardPerCorrect: bigint): Promise<void> {
    Teacher.validateQuizParams(questions, rewardPerCorrect)
  }

  async mineBlocks() {
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
    await MineBlocks.mineBlockFromRPCClient(this.computer)
  }
}