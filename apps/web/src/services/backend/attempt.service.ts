/**
 * Attempt backend service
 */

import { api } from './api';

export interface AttemptResponse {
  id: string;
  quizId: string;
  studentPubKey: string;
  selectedAnswer: number;
  isCorrect: boolean;
  rewardEarned: string;
  attemptedAt: string;
  blockchainTxId: string | null;
  quiz?: { id: string; title: string; rewardAmount?: string };
  student?: { publicKey: string; name: string | null };
}

export interface CreateAttemptRequest {
  quizId: string;
  studentPubKey: string;
  selectedAnswer: number;
  isCorrect: boolean;
  rewardEarned: number;
  blockchainTxId?: string;
}

export const attemptService = {
  /** List attempts, optionally filtered by student */
  async list(studentPubKey?: string): Promise<AttemptResponse[]> {
    const qs = studentPubKey ? `?studentPubKey=${studentPubKey}` : '';
    return api.get<AttemptResponse[]>(`/attempts${qs}`);
  },

  /** Get a single attempt */
  async getById(id: string): Promise<AttemptResponse> {
    return api.get<AttemptResponse>(`/attempts/${id}`);
  },

  /** Record a new attempt */
  async create(data: CreateAttemptRequest): Promise<AttemptResponse> {
    return api.post<AttemptResponse>('/attempts', data);
  },
};
