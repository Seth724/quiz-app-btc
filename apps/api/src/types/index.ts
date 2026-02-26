/**
 * Shared API Types
 *
 * Common types used across multiple API modules.
 * Module-specific types should remain in their respective module DTOs.
 */

/** Standard paginated response shape */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

/** Supported user roles */
export type UserRole = 'TEACHER' | 'STUDENT';

/** Access request status values */
export type AccessRequestStatus = 'pending' | 'approved' | 'completed' | 'rejected';

/** API health check response */
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  database: string;
}
