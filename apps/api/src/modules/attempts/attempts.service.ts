import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { AutoRewardService } from './auto-reward.service';

@Injectable()
export class AttemptsService {
  private readonly logger = new Logger(AttemptsService.name);

  constructor(
    private prisma: PrismaService,
    private autoRewardService: AutoRewardService,
  ) {}

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
    // Ensure student user exists (upsert)
    await this.prisma.user.upsert({
      where: { publicKey: createAttemptDto.studentPubKey },
      update: {},
      create: {
        publicKey: createAttemptDto.studentPubKey,
        role: 'STUDENT',
      },
    });

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

    // Auto-process reward if answer is correct
    if (createAttemptDto.isCorrect) {
      // Fire-and-forget: don't block the API response
      this.autoRewardService
        .processReward(createAttemptDto.quizId, createAttemptDto.studentPubKey)
        .then(result => {
          if (result.status === 'success') {
            this.logger.log(`Auto-reward processed for quiz ${createAttemptDto.quizId}`);
          } else if (result.status === 'already_claimed') {
            this.logger.log(`Quiz ${createAttemptDto.quizId} already claimed`);
          } else {
            this.logger.warn(`Auto-reward issue for quiz ${createAttemptDto.quizId}: ${result.error}`);
          }
        })
        .catch(err => {
          this.logger.error(`Auto-reward failed for quiz ${createAttemptDto.quizId}:`, err);
        });
    }

    return attempt;
  }

  private async updateLeaderboard(
    publicKey: string,
    isCorrect: boolean,
    rewardEarned: bigint,
  ) {
    // Look up user name for leaderboard display
    const user = await this.prisma.user.findUnique({ where: { publicKey } });
    const name = user?.name || null;

    const entry = await this.prisma.leaderboardEntry.findUnique({
      where: { publicKey },
    });

    if (entry) {
      await this.prisma.leaderboardEntry.update({
        where: { publicKey },
        data: {
          name,
          totalRewards: entry.totalRewards + rewardEarned,
          correctCount: isCorrect ? entry.correctCount + 1 : entry.correctCount,
          totalAttempts: entry.totalAttempts + 1,
        },
      });
    } else {
      await this.prisma.leaderboardEntry.create({
        data: {
          publicKey,
          name,
          totalRewards: rewardEarned,
          correctCount: isCorrect ? 1 : 0,
          totalAttempts: 1,
        },
      });
    }
  }
}
