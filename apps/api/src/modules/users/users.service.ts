import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(publicKey: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicKey },
      include: {
        _count: {
          select: {
            quizzesCreated: true,
            attempts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with public key ${publicKey} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        publicKey: createUserDto.publicKey,
        name: createUserDto.name,
        role: createUserDto.role,
      },
    });
  }

  async getStats(publicKey: string) {
    const user = await this.findOne(publicKey);

    if (user.role === 'STUDENT') {
      const attempts = await this.prisma.attempt.findMany({
        where: { studentPubKey: publicKey },
      });

      const correctAttempts = attempts.filter((a) => a.isCorrect).length;
      const totalRewards = attempts.reduce(
        (sum, a) => sum + a.rewardEarned,
        0n,
      );

      return {
        publicKey,
        role: user.role,
        totalAttempts: attempts.length,
        correctAttempts,
        successRate: attempts.length > 0 ? correctAttempts / attempts.length : 0,
        totalRewards,
      };
    } else {
      // Teacher stats
      const quizzes = await this.prisma.quiz.findMany({
        where: { teacherPubKey: publicKey },
        include: {
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      });

      const totalAttempts = quizzes.reduce((sum, q) => sum + q._count.attempts, 0);
      const activeQuizzes = quizzes.filter((q) => q.isActive).length;

      return {
        publicKey,
        role: user.role,
        totalQuizzes: quizzes.length,
        activeQuizzes,
        totalAttempts,
      };
    }
  }
}
