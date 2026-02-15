import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizzesDto } from './dto/list-quizzes.dto';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListQuizzesDto) {
    const { isActive, teacherPubKey, skip, take, orderBy } = query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (teacherPubKey) where.teacherPubKey = teacherPubKey;

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip: skip || 0,
        take: take || 20,
        orderBy: orderBy ? { [orderBy]: 'desc' } : { createdAt: 'desc' },
        include: {
          teacher: {
            select: {
              publicKey: true,
              name: true,
            },
          },
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      data: quizzes,
      total,
      skip: skip || 0,
      take: take || 20,
    };
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            publicKey: true,
            name: true,
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async create(createQuizDto: CreateQuizDto) {
    const quiz = await this.prisma.quiz.create({
      data: {
        id: createQuizDto.id,
        title: createQuizDto.title,
        questionText: createQuizDto.questionText,
        options: createQuizDto.options,
        rewardAmount: BigInt(createQuizDto.rewardAmount),
        entryFee: BigInt(createQuizDto.entryFee),
        paymentTxId: createQuizDto.paymentTxId,
        teacherPubKey: createQuizDto.teacherPubKey,
        isActive: true,
      },
      include: {
        teacher: {
          select: {
            publicKey: true,
            name: true,
          },
        },
      },
    });

    return quiz;
  }

  async getQuizAttempts(quizId: string) {
    return this.prisma.attempt.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            publicKey: true,
            name: true,
          },
        },
      },
      orderBy: {
        attemptedAt: 'desc',
      },
    });
  }
}
