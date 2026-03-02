import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated user from the request object.
 * The user is attached by the JWT strategy after token validation.
 *
 * @example
 * ```ts
 * @Get('profile')
 * getProfile(@CurrentUser() user: RequestUser) { ... }
 *
 * // Extract a specific field:
 * @Get('my-key')
 * getKey(@CurrentUser('publicKey') publicKey: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
