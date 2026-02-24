/**
 * Backend API base client
 *
 * Single place to change the backend URL.
 * All service files in this folder import { api } from './api'.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

/** Key used to persist the JWT in localStorage */
const TOKEN_KEY = 'quiz_app_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

/**
 * Lightweight fetch wrapper. Automatically:
 * - prepends BASE_URL
 * - sets Content-Type
 * - attaches Bearer token (if available)
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

/** HTTP helpers */
export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint),

  post: <T = any>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
