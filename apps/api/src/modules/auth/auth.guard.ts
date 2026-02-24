import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that requires a valid JWT Bearer token.
 * Usage: @UseGuards(JwtAuthGuard) on controller or route handler.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
