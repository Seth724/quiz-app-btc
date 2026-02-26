/**
 * Quiz backend service – CRUD operations against NestJS API
 */

import { api } from './api';

export interface QuizResponse {
  id: string;
  title: string;
  questionText: string;
  options: string[];
  correctAnswer?: number;
  rewardAmount: string; // BigInt serialised as string
  entryFee: string;
  isActive: boolean;
  isClaimed: boolean;
  claimedBy: string | null;
  paymentTxId: string;
  teacherPubKey: string;
  createdAt: string;
  updatedAt: string;
  teacher?: { publicKey: string; name: string | null };
  _count?: { attempts: number };
}

export interface QuizListResponse {
  data: QuizResponse[];
  total: number;
  skip: number;
  take: number;
}

export interface CreateQuizRequest {
  id: string; // blockchain txId
  title: string;
  description?: string;
  questionText: string;
  options: string[];
  correctAnswer?: number;
  rewardAmount: number;
  entryFee: number;
  paymentTxId: string;
  teacherPubKey: string;
}

export const quizService = {
  /** List quizzes with optional filters */
  async list(params?: {
    isActive?: boolean;
    teacherPubKey?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }): Promise<QuizListResponse> {
    const search = new URLSearchParams();
    if (params?.isActive !== undefined) search.set('isActive', String(params.isActive));
    if (params?.teacherPubKey) search.set('teacherPubKey', params.teacherPubKey);
    if (params?.skip !== undefined) search.set('skip', String(params.skip));
    if (params?.take !== undefined) search.set('take', String(params.take));
    if (params?.orderBy) search.set('orderBy', params.orderBy);

    const qs = search.toString();
    return api.get<QuizListResponse>(`/quizzes${qs ? `?${qs}` : ''}`);
  },

  /** Get a single quiz by ID */
  async getById(id: string): Promise<QuizResponse> {
    return api.get<QuizResponse>(`/quizzes/${id}`);
  },

  /** Save a quiz to the database (after blockchain creation) */
  async create(data: CreateQuizRequest): Promise<QuizResponse> {
    return api.post<QuizResponse>('/quizzes', data);
  },

  /** Get all attempts for a quiz */
  async getAttempts(quizId: string) {
    return api.get(`/quizzes/${quizId}/attempts`);
  },

  /** Update quiz status (claimed, active, etc.) */
  async update(id: string, data: { isClaimed?: boolean; claimedBy?: string; isActive?: boolean }): Promise<QuizResponse> {
    return api.patch<QuizResponse>(`/quizzes/${id}`, data);
  },
};
