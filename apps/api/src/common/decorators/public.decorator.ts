import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as publicly accessible (no JWT required).
 * Use on routes that should be accessible without authentication
 * when the JwtAuthGuard is applied globally.
 *
 * @example
 * ```ts
 * @Public()
 * @Post('login')
 * login() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
