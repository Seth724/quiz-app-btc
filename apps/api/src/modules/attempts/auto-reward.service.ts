/**
 * Auto-Reward Service
 *
 * Provides data needed for auto-processing quiz rewards.
 * The actual blockchain operations (adding attempted students,
 * claiming rewards, transferring payments) are performed client-side
 * in the web app (services/bc/BrowserQuizClient).
 *
 * This service handles only database operations:
 *   - Checking quiz status and teacher mnemonic availability
 *   - Returning the mnemonic + quiz data for frontend processing
 *   - Marking quizzes as claimed after frontend completes reward processing
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutoRewardService {
  private readonly logger = new Logger(AutoRewardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get auto-reward data for a quiz.
   * Returns the teacher's mnemonic and quiz details needed
   * for the frontend to perform blockchain reward operations.
   */
  async getAutoRewardData(quizId: string, winnerPublicKey: string): Promise<{
    status: string;
    mnemonic?: string;
    paymentTxId?: string;
    error?: string;
  }> {
    // 1. Load quiz from DB to get teacher info and payment ID
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });
    if (!quiz) {
      return { status: 'error', error: 'Quiz not found' };
    }
    if (quiz.isClaimed) {
      this.logger.log(`Quiz ${quizId} already claimed by ${quiz.claimedBy}`);
      return { status: 'already_claimed' };
    }

    // 2. Load the teacher's stored mnemonic
    const teacher = await this.prisma.user.findUnique({
      where: { publicKey: quiz.teacherPubKey },
      select: { encryptedMnemonic: true },
    });
    if (!teacher?.encryptedMnemonic) {
      return { status: 'error', error: 'Teacher has no stored mnemonic for auto-reward' };
    }

    const mnemonic = Buffer.from(teacher.encryptedMnemonic, 'base64').toString('utf-8');

    this.logger.log(`Returning auto-reward data for quiz ${quizId}, winner: ${winnerPublicKey.substring(0, 8)}...`);

    return {
      status: 'available',
      mnemonic,
      paymentTxId: quiz.paymentTxId,
    };
  }

  /**
   * Mark a quiz as claimed in the database.
   * Called by the frontend after blockchain reward processing is complete.
   */
  async markQuizClaimed(quizId: string, winnerPublicKey: string): Promise<void> {
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        isClaimed: true,
        claimedBy: winnerPublicKey,
      },
    });
    this.logger.log(`Quiz ${quizId} marked as claimed. Winner: ${winnerPublicKey.substring(0, 8)}...`);
  }
}