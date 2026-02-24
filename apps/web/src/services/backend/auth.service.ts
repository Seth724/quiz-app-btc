/**
 * Auth service – login / logout / token management
 */

import { api, setToken, clearToken } from './api';

export interface LoginRequest {
  name: string;
  publicKey?: string;
  role?: 'TEACHER' | 'STUDENT';
}

export interface LoginResponse {
  access_token: string;
  user: {
    publicKey: string;
    name: string;
    role: string;
  };
}

export interface AuthUser {
  publicKey: string;
  name: string;
  role: string;
}

export const authService = {
  /**
   * Login or register. Stores the JWT token automatically.
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', data);
    setToken(res.access_token);
    return res;
  },

  /** Remove the stored token (client-side only). */
  logout() {
    clearToken();
  },

  /** Get the currently authenticated user profile from the API. */
  async me(): Promise<AuthUser> {
    return api.get<AuthUser>('/auth/me');
  },
};
