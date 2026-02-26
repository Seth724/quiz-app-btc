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
  totalEarnings?: number;
}

export interface CreateUserRequest {
  publicKey: string;
  name?: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
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

  /** Update user profile */
  async update(publicKey: string, data: UpdateUserRequest): Promise<UserProfile> {
    return api.patch<UserProfile>(`/users/${publicKey}`, data);
  },

  /** Store teacher mnemonic for auto-approve */
  async storeMnemonic(publicKey: string, mnemonic: string): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>(`/users/${publicKey}/mnemonic`, { mnemonic });
  },

  /** Check if teacher has stored mnemonic */
  async hasMnemonic(publicKey: string): Promise<boolean> {
    const res = await api.get<{ hasMnemonic: boolean }>(`/users/${publicKey}/has-mnemonic`);
    return res.hasMnemonic;
  },

  /** Get user statistics */
  async getStats(publicKey: string): Promise<UserStats> {
    return api.get<UserStats>(`/users/${publicKey}/stats`);
  },
};
