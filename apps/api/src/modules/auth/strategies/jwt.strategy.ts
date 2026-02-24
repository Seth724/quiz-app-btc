import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'quiz-app-jwt-secret-change-in-production'),
    });
  }

  /**
   * Called automatically by Passport after the JWT is verified.
   * The return value is attached to `request.user`.
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      return { publicKey: payload.sub, name: payload.name, role: payload.role };
    }
    return {
      publicKey: user.publicKey,
      name: user.name,
      role: user.role,
    };
  }
}
