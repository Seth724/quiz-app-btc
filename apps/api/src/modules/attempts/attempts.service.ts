import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  async findAll(studentPubKey?: string) {
    const where = studentPubKey ? { studentPubKey } : {};

    return this.prisma.attempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            rewardAmount: true,
          },
        },
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

  async findOne(id: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
      include: {
        quiz: true,
        student: {
          select: {
            publicKey: true,
            name: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${id} not found`);
    }

    return attempt;
  }

  async create(createAttemptDto: CreateAttemptDto) {
    const attempt = await this.prisma.attempt.create({
      data: {
        quizId: createAttemptDto.quizId,
        studentPubKey: createAttemptDto.studentPubKey,
        selectedAnswer: createAttemptDto.selectedAnswer,
        isCorrect: createAttemptDto.isCorrect,
        rewardEarned: BigInt(createAttemptDto.rewardEarned),
        blockchainTxId: createAttemptDto.blockchainTxId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
        student: {
          select: {
            publicKey: true,
            name: true,
          },
        },
      },
    });

    // Update leaderboard
    await this.updateLeaderboard(
      createAttemptDto.studentPubKey,
      createAttemptDto.isCorrect,
      BigInt(createAttemptDto.rewardEarned),
    );

    return attempt;
  }

  private async updateLeaderboard(
    publicKey: string,
    isCorrect: boolean,
    rewardEarned: bigint,
  ) {
    const entry = await this.prisma.leaderboardEntry.findUnique({
      where: { publicKey },
    });

    if (entry) {
      await this.prisma.leaderboardEntry.update({
        where: { publicKey },
        data: {
          totalRewards: entry.totalRewards + rewardEarned,
          correctCount: isCorrect ? entry.correctCount + 1 : entry.correctCount,
          totalAttempts: entry.totalAttempts + 1,
        },
      });
    } else {
      await this.prisma.leaderboardEntry.create({
        data: {
          publicKey,
          totalRewards: rewardEarned,
          correctCount: isCorrect ? 1 : 0,
          totalAttempts: 1,
        },
      });
    }
  }
}
