/**
 * Access Request backend service — CRUD against NestJS API
 */

import { api } from './api';

export interface AccessRequestData {
  id: string;
  quizId: string;
  quizTitle: string | null;
  studentPublicKey: string;
  teacherPublicKey: string;
  entryFee: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  offerTxHex?: string;
  accessTokenId?: string;
  completedTxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoApproveData {
  status: string;
  mnemonic?: string;
  quizId?: string;
  entryFee?: string;
  error?: string;
}

export const accessRequestService = {
  /** List access requests with optional filters */
  async list(filters?: {
    quizId?: string;
    studentPublicKey?: string;
    teacherPublicKey?: string;
    status?: string;
  }): Promise<AccessRequestData[]> {
    const search = new URLSearchParams();
    if (filters?.quizId) search.set('quizId', filters.quizId);
    if (filters?.studentPublicKey) search.set('studentPublicKey', filters.studentPublicKey);
    if (filters?.teacherPublicKey) search.set('teacherPublicKey', filters.teacherPublicKey);
    if (filters?.status) search.set('status', filters.status);
    const qs = search.toString();
    return api.get<AccessRequestData[]>(`/access-requests${qs ? `?${qs}` : ''}`);
  },

  /** Get a single access request */
  async getById(id: string): Promise<AccessRequestData> {
    return api.get<AccessRequestData>(`/access-requests/${id}`);
  },

  /** Create a new access request */
  async create(data: {
    quizId: string;
    quizTitle?: string;
    studentPublicKey: string;
    teacherPublicKey: string;
    entryFee?: string;
  }): Promise<AccessRequestData> {
    return api.post<AccessRequestData>('/access-requests', data);
  },

  /** Update an access request (approve, complete, reject) */
  async update(
    id: string,
    data: {
      status?: string;
      offerTxHex?: string;
      accessTokenId?: string;
      completedTxId?: string;
    },
  ): Promise<AccessRequestData> {
    return api.patch<AccessRequestData>(`/access-requests/${id}`, data);
  },

  /** Get auto-approve data (teacher mnemonic + request info) for frontend blockchain processing */
  async getAutoApproveData(id: string): Promise<AutoApproveData> {
    return api.post<AutoApproveData>(`/access-requests/${id}/auto-approve`);
  },
};
