/**
 * Auto-Reward Service
 *
 * Processes quiz rewards server-side using stored teacher mnemonics.
 * When a student answers correctly, this service automatically:
 *   1. Adds the student to the quiz's attempted list (QuizHelper)
 *   2. Claims the reward for the winner (QuizHelper)
 *   3. Transfers the payment object to the winner (PaymentHelper)
 *
 * This eliminates the need for teachers to be online to process rewards.
 * Teachers only need to withdraw quiz access entry-fee payments to their wallet.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutoRewardService {
  private readonly logger = new Logger(AutoRewardService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Process reward for a correct quiz attempt.
   *
   * Uses the teacher's stored mnemonic to sign blockchain transactions
   * that transfer the quiz's payment to the winning student.
   */
  async processReward(quizId: string, winnerPublicKey: string): Promise<{
    status: string;
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

    // 3. Create Computer + helpers and process reward
    try {
      const chain = this.configService.get('BLOCKCHAIN_CHAIN', 'LTC');
      const network = this.configService.get('BLOCKCHAIN_NETWORK', 'regtest');
      const url = this.configService.get('BLOCKCHAIN_URL', 'http://localhost:1031');
      const quizMod = this.configService.get('NEXT_PUBLIC_QUIZ_MOD_SPEC', '');
      const paymentMod = this.configService.get('NEXT_PUBLIC_PAYMENT_MOD_SPEC', '');

      if (!quizMod || !paymentMod) {
        return { status: 'error', error: 'Module specs not configured on server' };
      }

      // Dynamic import to avoid ESM/CJS issues
      const { Computer } = await import('@bitcoin-computer/lib');
      const { QuizHelper, PaymentHelper } = await import('@quiz-app/contracts');

      const computer = new Computer({ mnemonic, chain, network, url });
      const quizHelper = new QuizHelper(computer, quizMod);
      const paymentHelper = new PaymentHelper(computer, paymentMod);

      this.logger.log(`Processing reward for quiz ${quizId}, winner: ${winnerPublicKey.substring(0, 8)}...`);

      // Step 1: Add student to attempted list
      try {
        await quizHelper.addAttemptedStudent(quizId, winnerPublicKey);
        this.logger.log(`Added student to attempted list: ${winnerPublicKey.substring(0, 8)}...`);
      } catch (err) {
        // May fail if already added — that's OK
        this.logger.warn(`addAttemptedStudent warning (may be duplicate): ${err instanceof Error ? err.message : String(err)}`);
      }

      // Step 2: Claim reward for the winner
      try {
        await quizHelper.claimReward(quizId, winnerPublicKey);
        this.logger.log(`Reward claimed for: ${winnerPublicKey.substring(0, 8)}...`);
      } catch (err) {
        this.logger.error(`claimReward failed: ${err instanceof Error ? err.message : String(err)}`);
        return { status: 'error', error: `claimReward failed: ${err instanceof Error ? err.message : String(err)}` };
      }

      // Step 3: Transfer payment to winner
      try {
        await paymentHelper.transferPaymentById(quiz.paymentTxId, winnerPublicKey);
        this.logger.log(`Payment transferred to: ${winnerPublicKey.substring(0, 8)}...`);
      } catch (err) {
        this.logger.error(`Payment transfer failed: ${err instanceof Error ? err.message : String(err)}`);
        return { status: 'error', error: `Payment transfer failed: ${err instanceof Error ? err.message : String(err)}` };
      }

      // 4. Update quiz in DB as claimed
      await this.prisma.quiz.update({
        where: { id: quizId },
        data: {
          isClaimed: true,
          claimedBy: winnerPublicKey,
        },
      });

      this.logger.log(`Quiz ${quizId} reward fully processed. Winner: ${winnerPublicKey.substring(0, 8)}...`);
      return { status: 'success' };
    } catch (err) {
      this.logger.error(`Auto-reward failed for quiz ${quizId}:`, err);
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error during auto-reward',
      };
    }
  }
}
