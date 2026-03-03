import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

/**
 * Shape of the JWT access-token payload.
 */
export interface JwtPayload {
  sub: string; // User ID (MongoDB ObjectId)
  email: string;
  name: string;
  role: string;
  publicKey: string | null;
}

/**
 * Shape of the user object attached to request.user by the JWT strategy.
 */
export interface RequestUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  publicKey: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ──────────────────────────────────────────────
  //  Signup
  // ──────────────────────────────────────────────

  async signup(dto: SignupDto) {
    const { name, email, password, role } = dto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role ?? 'STUDENT',
      },
    });

    this.logger.log(`User registered: ${user.email} (${user.role})`);

    // Update leaderboard entry name if user has a publicKey
    if (user.publicKey) {
      await this.prisma.leaderboardEntry.updateMany({
        where: { publicKey: user.publicKey },
        data: { name },
      }).catch(() => {
        // Ignore if no leaderboard entry exists yet
      });
    }

    return this.generateAuthResponse(user);
  }

  // ──────────────────────────────────────────────
  //  Login
  // ──────────────────────────────────────────────

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Update leaderboard entry name if user has a publicKey
    if (user.publicKey) {
      await this.prisma.leaderboardEntry.updateMany({
        where: { publicKey: user.publicKey },
        data: { name: user.name },
      }).catch(() => {
        // Ignore if no leaderboard entry exists yet
      });
    }

    return this.generateAuthResponse(user);
  }

  // ──────────────────────────────────────────────
  //  Connect Wallet (link blockchain publicKey)
  // ──────────────────────────────────────────────

  async connectWallet(userId: string, dto: ConnectWalletDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { publicKey: dto.publicKey },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('This public key is already linked to another account');
    }

    const updateData: { publicKey: string; encryptedMnemonic?: string } = {
      publicKey: dto.publicKey,
    };

    if (dto.mnemonic) {
      updateData.encryptedMnemonic = Buffer.from(dto.mnemonic).toString('base64');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    this.logger.log(`Wallet connected for user ${user.email}: ${dto.publicKey.substring(0, 12)}...`);

    // Update leaderboard entry name if user has a name
    if (user.publicKey && user.name) {
      await this.prisma.leaderboardEntry.updateMany({
        where: { publicKey: user.publicKey },
        data: { name: user.name },
      }).catch(() => {
        // Ignore if no leaderboard entry exists yet
      });
    }

    return {
      publicKey: user.publicKey,
      message: 'Wallet connected successfully',
    };
  }

  // ──────────────────────────────────────────────
  //  Get Current User
  // ──────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        publicKey: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // ──────────────────────────────────────────────
  //  Logout (revoke refresh tokens)
  // ──────────────────────────────────────────────

  /**
   * Revoke a specific refresh token, or ALL tokens for the user.
   * If refreshToken is provided, only that token is deleted.
   * Otherwise, all refresh tokens for the user are wiped.
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Delete the specific refresh token (if it belongs to this user)
      const deleted = await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId },
      });
      this.logger.log(`Logout: revoked ${deleted.count} refresh token(s) for user ${userId}`);
    } else {
      // Nuclear option — revoke ALL refresh tokens for this user
      const deleted = await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
      this.logger.log(`Logout: revoked ALL ${deleted.count} refresh token(s) for user ${userId}`);
    }

    return { message: 'Logged out successfully' };
  }

  // ──────────────────────────────────────────────
  //  Validate JWT Payload (called by JwtStrategy)
  // ──────────────────────────────────────────────

  async validateUser(payload: JwtPayload): Promise<RequestUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      publicKey: user.publicKey,
    };
  }

  // ──────────────────────────────────────────────
  //  Refresh Tokens
  // ──────────────────────────────────────────────

  async refreshTokens(dto: RefreshTokenDto) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete the used refresh token (rotation — each token is single-use)
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    if (storedToken.expiryDate < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    this.logger.log(`Token refreshed for user ${storedToken.user.email}`);

    return this.generateAuthResponse(storedToken.user);
  }

  // ──────────────────────────────────────────────
  //  Private Helpers
  // ──────────────────────────────────────────────

  private async generateAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    publicKey: string | null;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      publicKey: user.publicKey,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        publicKey: user.publicKey,
      },
    };
  }

  /**
   * Create a UUID refresh token stored in the DB with a 7-day expiry.
   */
  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiryDate },
    });

    return token;
  }
}
