/**
 * Auth service – signup / login / logout / refresh / connect wallet / token management
 */

import { api, setTokens, clearTokens } from './api';

// ── Request / Response Types ──────────────────────────

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'TEACHER' | 'STUDENT';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  publicKey: string | null;
}

export interface ConnectWalletRequest {
  publicKey: string;
  mnemonic?: string;
}

// ── Service ───────────────────────────────────────────

export const authService = {
  /**
   * Register a new user. Stores tokens automatically.
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/signup', data);
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  /**
   * Login with email and password. Stores tokens automatically.
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  /**
   * Logout: revoke the refresh token on the server, then clear local tokens.
   * Best-effort — if the API call fails (e.g. token already expired), local
   * state is still cleared so the user is logged out from the browser.
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('quiz_app_refresh_token')
        : null;
      await api.post('/auth/logout', { refreshToken: refreshToken || undefined });
    } catch {
      // Server unreachable or token already invalid — that's fine
    } finally {
      clearTokens();
    }
  },

  /**
   * Get the currently authenticated user profile from the API.
   */
  async me(): Promise<AuthUser> {
    return api.get<AuthUser>('/auth/me');
  },

  /**
   * Link a blockchain wallet (publicKey) to the authenticated user.
   * Optionally stores mnemonic on server for teachers (auto-approve).
   */
  async connectWallet(data: ConnectWalletRequest): Promise<{ publicKey: string; message: string }> {
    return api.post<{ publicKey: string; message: string }>('/auth/connect-wallet', data);
  },
};
