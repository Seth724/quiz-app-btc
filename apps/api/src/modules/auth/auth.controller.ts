import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService, RequestUser } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { JwtAuthGuard } from './auth.guard';
import { Public, CurrentUser } from '../../common/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({ status: 201, description: 'User registered, token returned' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get new access + refresh token pair using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout – revoke refresh token(s) on the server' })
  @ApiResponse({ status: 200, description: 'Logged out, refresh token revoked' })
  async logout(
    @CurrentUser() user: RequestUser,
    @Body() body: { refreshToken?: string },
  ) {
    return this.authService.logout(user.userId, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect-wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a blockchain wallet (publicKey) to the authenticated user' })
  @ApiResponse({ status: 200, description: 'Wallet connected' })
  @ApiResponse({ status: 409, description: 'Public key already linked to another account' })
  async connectWallet(
    @CurrentUser() user: RequestUser,
    @Body() dto: ConnectWalletDto,
  ) {
    return this.authService.connectWallet(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.userId);
  }
}
