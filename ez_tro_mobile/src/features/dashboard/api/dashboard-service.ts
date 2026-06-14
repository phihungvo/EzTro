import { apiClient } from '@/services/http/api-client';

import type { DashboardSummary } from '../types';

export function getTenantDashboardSummary(authToken?: string) {
  return apiClient.get<DashboardSummary>('/user/dashboard/summary', { authToken });
}
