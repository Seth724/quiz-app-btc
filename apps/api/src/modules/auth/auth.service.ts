import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { randomBytes } from 'crypto';

export interface JwtPayload {
  sub: string; // publicKey
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login / register: find or create a user by name (+ optional publicKey),
   * then return a signed JWT.
   */
  async login(dto: LoginDto) {
    const role = dto.role ?? 'STUDENT';
    let user: any;

    if (dto.publicKey) {
      // Try to find by publicKey first
      user = await this.prisma.user.findUnique({ where: { publicKey: dto.publicKey } });

      if (user) {
        // Update name if it changed
        if (user.name !== dto.name) {
          user = await this.prisma.user.update({
            where: { publicKey: dto.publicKey },
            data: { name: dto.name },
          });
        }
      } else {
        // Create new user with provided publicKey
        user = await this.prisma.user.create({
          data: { publicKey: dto.publicKey, name: dto.name, role },
        });
      }
    } else {
      // No publicKey provided — try to find by name, or create with a random key
      user = await this.prisma.user.findFirst({ where: { name: dto.name } });

      if (!user) {
        const generatedKey = randomBytes(16).toString('hex');
        user = await this.prisma.user.create({
          data: { publicKey: generatedKey, name: dto.name, role },
        });
      }
    }

    const payload: JwtPayload = {
      sub: user.publicKey,
      name: user.name ?? dto.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        publicKey: user.publicKey,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Validate a JWT payload and return the associated user record.
   */
  async validateUser(payload: JwtPayload) {
    return this.prisma.user.findUnique({ where: { publicKey: payload.sub } });
  }
}
