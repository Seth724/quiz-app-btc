/**
 * User backend service
 */

import { api } from './api';

export interface UserProfile {
  publicKey: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count?: { quizzesCreated: number; attempts: number };
}

export interface UserStats {
  publicKey: string;
  role: string;
  // Student stats
  totalAttempts?: number;
  correctAttempts?: number;
  successRate?: number;
  totalRewards?: string;
  // Teacher stats
  totalQuizzes?: number;
  activeQuizzes?: number;
}

export interface CreateUserRequest {
  publicKey: string;
  name?: string;
  role: 'TEACHER' | 'STUDENT';
}

export const userService = {
  /** Get user profile by public key */
  async getProfile(publicKey: string): Promise<UserProfile> {
    return api.get<UserProfile>(`/users/${publicKey}`);
  },

  /** Create a new user */
  async create(data: CreateUserRequest): Promise<UserProfile> {
    return api.post<UserProfile>('/users', data);
  },

  /** Get user statistics */
  async getStats(publicKey: string): Promise<UserStats> {
    return api.get<UserStats>(`/users/${publicKey}/stats`);
  },
};
