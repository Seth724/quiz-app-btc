import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { UpdateAccessRequestDto } from './dto/update-access-request.dto';
import type { Prisma } from '../../../generated/prisma';

@Injectable()
export class AccessRequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    quizId?: string;
    studentPublicKey?: string;
    teacherPublicKey?: string;
    status?: string;
  }) {
    const where: Prisma.AccessRequestWhereInput = {};
    if (filters?.quizId) where.quizId = filters.quizId;
    if (filters?.studentPublicKey) where.studentPublicKey = filters.studentPublicKey;
    if (filters?.teacherPublicKey) where.teacherPublicKey = filters.teacherPublicKey;
    if (filters?.status) where.status = filters.status;

    return this.prisma.accessRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.accessRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Access request ${id} not found`);
    }
    return request;
  }

  async create(dto: CreateAccessRequestDto) {
    // Check for existing pending request (prevent duplicates)
    const existing = await this.prisma.accessRequest.findFirst({
      where: {
        quizId: dto.quizId,
        studentPublicKey: dto.studentPublicKey,
        status: 'pending',
      },
    });
    if (existing) return existing;

    return this.prisma.accessRequest.create({
      data: {
        quizId: dto.quizId,
        quizTitle: dto.quizTitle,
        studentPublicKey: dto.studentPublicKey,
        teacherPublicKey: dto.teacherPublicKey,
        entryFee: dto.entryFee || '0',
      },
    });
  }

  async update(id: string, dto: UpdateAccessRequestDto) {
    const existing = await this.prisma.accessRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Access request ${id} not found`);
    }

    const data: Prisma.AccessRequestUpdateInput = {};
    if (dto.status) data.status = dto.status;
    if (dto.offerTxHex) data.offerTxHex = dto.offerTxHex;
    if (dto.accessTokenId) data.accessTokenId = dto.accessTokenId;
    if (dto.completedTxId) data.completedTxId = dto.completedTxId;

    return this.prisma.accessRequest.update({
      where: { id },
      data,
    });
  }
}
