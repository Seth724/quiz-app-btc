import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(limit: number = 100) {
    const entries = await this.prisma.leaderboardEntry.findMany({
      take: limit,
      orderBy: [
        { totalRewards: 'desc' },
        { correctCount: 'desc' },
      ],
    });

    // Assign ranks
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getUserRank(publicKey: string) {
    const entry = await this.prisma.leaderboardEntry.findUnique({
      where: { publicKey },
    });

    if (!entry) {
      return {
        publicKey,
        rank: null,
        totalRewards: 0n,
        correctCount: 0,
        totalAttempts: 0,
      };
    }

    // Calculate rank
    const higherRanked = await this.prisma.leaderboardEntry.count({
      where: {
        OR: [
          { totalRewards: { gt: entry.totalRewards } },
          {
            totalRewards: entry.totalRewards,
            correctCount: { gt: entry.correctCount },
          },
        ],
      },
    });

    return {
      ...entry,
      rank: higherRanked + 1,
    };
  }
}
