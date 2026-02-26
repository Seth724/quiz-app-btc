/**
 * App Service — Root service for health checks & diagnostics
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  /** Health check: verify API and database connectivity */
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
  }> {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }
}
