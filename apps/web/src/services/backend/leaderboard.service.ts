/**
 * Leaderboard backend service
 */

import { api } from './api';

export interface LeaderboardEntry {
  publicKey: string;
  name: string | null;
  totalRewards: string;
  correctCount: number;
  totalAttempts: number;
  rank: number;
}

export const leaderboardService = {
  /** Get the top leaderboard entries */
  async getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
    const qs = limit ? `?limit=${limit}` : '';
    return api.get<LeaderboardEntry[]>(`/leaderboard${qs}`);
  },

  /** Get a specific user's rank and stats */
  async getUserRank(publicKey: string): Promise<LeaderboardEntry> {
    return api.get<LeaderboardEntry>(`/leaderboard/${publicKey}`);
  },
};
