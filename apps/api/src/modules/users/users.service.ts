import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async update(publicKey: string, updateUserDto: UpdateUserDto) {
    // Upsert: create the user if they don't exist yet
    return this.prisma.user.upsert({
      where: { publicKey },
      update: {
        ...(updateUserDto.name !== undefined && { name: updateUserDto.name }),
        ...(updateUserDto.role !== undefined && { role: updateUserDto.role }),
      },
      create: {
        publicKey,
        name: updateUserDto.name || null,
        role: updateUserDto.role || 'STUDENT',
      },
    });
  }

  async storeMnemonic(publicKey: string, mnemonic: string) {
    const encoded = Buffer.from(mnemonic).toString('base64');
    // Upsert: create the user if they don't exist yet
    await this.prisma.user.upsert({
      where: { publicKey },
      update: { encryptedMnemonic: encoded },
      create: {
        publicKey,
        role: 'TEACHER',
        encryptedMnemonic: encoded,
      },
    });
    return { success: true };
  }

  async hasMnemonic(publicKey: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { publicKey },
      select: { encryptedMnemonic: true },
    });
    return !!user?.encryptedMnemonic;
  }

  async getStats(publicKey: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicKey },
    });

    if (!user) {
      // Return default empty stats for unregistered users
      return {
        publicKey,
        role: 'STUDENT',
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: 0,
        totalRewards: '0',
      };
    }

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

      // Calculate earnings from approved/completed access requests (entry fees collected)
      const paidRequests = await this.prisma.accessRequest.findMany({
        where: {
          teacherPublicKey: publicKey,
          status: { in: ['approved', 'completed'] },
        },
      });
      const totalEarnings = paidRequests.reduce(
        (sum, r) => sum + BigInt(r.entryFee || '0'),
        0n,
      );

      return {
        publicKey,
        role: user.role,
        totalQuizzes: quizzes.length,
        activeQuizzes,
        totalAttempts,
        totalEarnings,
      };
    }
  }
}
