import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict access to specific user roles.
 *
 * @example
 * ```ts
 * @Roles('TEACHER')
 * @Get('dashboard')
 * getTeacherDashboard() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
