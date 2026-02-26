/**
 * Auto-Access Service
 *
 * Creates access tokens server-side using stored teacher mnemonics.
 * This eliminates the need for teachers to be online to approve access requests.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutoAccessService {
  private readonly logger = new Logger(AutoAccessService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Store a teacher's mnemonic (base64 encoded) for auto-approve functionality.
   */
  async storeMnemonic(publicKey: string, mnemonic: string): Promise<boolean> {
    const encoded = Buffer.from(mnemonic).toString('base64');
    await this.prisma.user.update({
      where: { publicKey },
      data: { encryptedMnemonic: encoded },
    });
    this.logger.log(`Stored mnemonic for teacher: ${publicKey.substring(0, 8)}...`);
    return true;
  }

  /**
   * Check if a teacher has a stored mnemonic for auto-approve.
   */
  async hasMnemonic(publicKey: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { publicKey },
      select: { encryptedMnemonic: true },
    });
    return !!user?.encryptedMnemonic;
  }

  /**
   * Auto-approve an access request by creating access tokens server-side.
   * Uses the teacher's stored mnemonic to create a Computer instance,
   * mint a QuizAccess token, and create a partially-signed offer tx.
   */
  async autoApprove(accessRequestId: string): Promise<{
    status: string;
    offerTxHex?: string;
    accessTokenId?: string;
    error?: string;
  }> {
    // 1. Load the access request
    const request = await this.prisma.accessRequest.findUnique({
      where: { id: accessRequestId },
    });
    if (!request) {
      return { status: 'error', error: 'Access request not found' };
    }
    if (request.status !== 'pending') {
      return { status: 'error', error: `Request already ${request.status}` };
    }

    // 2. Load the teacher's mnemonic
    const teacher = await this.prisma.user.findUnique({
      where: { publicKey: request.teacherPublicKey },
      select: { encryptedMnemonic: true },
    });
    if (!teacher?.encryptedMnemonic) {
      return { status: 'error', error: 'Teacher has no stored mnemonic for auto-approve' };
    }

    const mnemonic = Buffer.from(teacher.encryptedMnemonic, 'base64').toString('utf-8');

    // 3. Create Computer + helpers and mint access token
    try {
      const chain = this.configService.get('BLOCKCHAIN_CHAIN', 'LTC');
      const network = this.configService.get('BLOCKCHAIN_NETWORK', 'regtest');
      const url = this.configService.get('BLOCKCHAIN_URL', 'http://localhost:1031');
      const quizAccessMod = this.configService.get('NEXT_PUBLIC_QUIZ_ACCESS_MOD_SPEC', '');
      const quizAccessSaleMod = this.configService.get('NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD_SPEC', '');

      if (!quizAccessMod || !quizAccessSaleMod) {
        return { status: 'error', error: 'Module specs not configured on server' };
      }

      // Dynamic import to avoid issues with ESM/CJS
      const { Computer } = await import('@bitcoin-computer/lib');
      const { QuizAccessHelper, QuizAccessSaleHelper, PaymentMock } = await import('@quiz-app/contracts');

      const computer = new Computer({ mnemonic, chain, network, url });
      const accessHelper = new QuizAccessHelper(computer, quizAccessMod);
      const saleHelper = new QuizAccessSaleHelper(computer, quizAccessSaleMod);

      this.logger.log(`Auto-approving request ${accessRequestId} for quiz ${request.quizId}`);

      // Step a: Mint a 1-unit QuizAccess token
      const accessToken = await accessHelper.createQuizAccess(request.quizId, BigInt(1));
      this.logger.log(`Minted QuizAccess: ${accessToken._id}`);

      // Step b: Create a partially-signed offer tx
      const entryFee = BigInt(request.entryFee || '0');
      const mock = new PaymentMock(entryFee);
      const offerEncoded = await saleHelper.createOfferTx(accessToken, mock);
      const offerTxHex = offerEncoded.tx.toHex();

      // 4. Update the access request with the offer
      await this.prisma.accessRequest.update({
        where: { id: accessRequestId },
        data: {
          status: 'approved',
          offerTxHex,
          accessTokenId: accessToken._id,
        },
      });

      this.logger.log(`Auto-approved request ${accessRequestId}, offerTxHex length: ${offerTxHex.length}`);

      return {
        status: 'approved',
        offerTxHex,
        accessTokenId: accessToken._id,
      };
    } catch (err) {
      this.logger.error(`Auto-approve failed for ${accessRequestId}:`, err);
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error during auto-approve',
      };
    }
  }
}
