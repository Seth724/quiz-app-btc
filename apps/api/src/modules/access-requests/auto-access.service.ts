/**
 * Auto-Access Service
 *
 * Provides data needed for auto-approval of access requests.
 * The actual blockchain operations (minting QuizAccess tokens,
 * creating offer transactions) are performed client-side in the
 * web app (services/bc/BrowserAccessClient).
 *
 * This service handles only database operations:
 *   - Checking if a teacher has a stored mnemonic
 *   - Returning the mnemonic + request data for frontend processing
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutoAccessService {
  private readonly logger = new Logger(AutoAccessService.name);

  constructor(private prisma: PrismaService) {}

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
   * Get auto-approve data for an access request.
   * Returns the teacher's mnemonic and request details needed
   * for the frontend to perform blockchain operations.
   */
  async getAutoApproveData(accessRequestId: string): Promise<{
    status: string;
    mnemonic?: string;
    quizId?: string;
    entryFee?: string;
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

    this.logger.log(`Returning auto-approve data for request ${accessRequestId}`);

    return {
      status: 'available',
      mnemonic,
      quizId: request.quizId,
      entryFee: request.entryFee || '0',
    };
  }
}