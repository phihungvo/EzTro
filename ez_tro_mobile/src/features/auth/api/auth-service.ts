import { apiClient } from '@/services/http/api-client';

import type { AuthSession, LoginPayload } from '../types';

export function login(payload: LoginPayload) {
  return apiClient.post<AuthSession>('/auth/login', payload);
}

export function logout(token: string) {
  return apiClient.post<{ message: string }>('/auth/logout', { token });
}
