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

export interface AutoRewardData {
  status: string;
  mnemonic?: string;
  paymentTxId?: string;
  error?: string;
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

  /** Get auto-reward data (teacher mnemonic + quiz info) for frontend blockchain processing */
  async getAutoRewardData(quizId: string, winnerPublicKey: string): Promise<AutoRewardData> {
    return api.post<AutoRewardData>('/attempts/auto-reward-data', { quizId, winnerPublicKey });
  },
};
