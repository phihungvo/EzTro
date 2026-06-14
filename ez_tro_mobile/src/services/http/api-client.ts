import { env } from '@/config/env';
import type { ApiResponse } from '@/shared/types/api';

import { HttpError } from './http-error';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = Omit<RequestInit, 'body'> & {
  authToken?: string;
  body?: unknown;
  query?: QueryParams;
};

function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(`${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const { authToken, body, headers, query, ...fetchOptions } = options;
  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : 'Không thể kết nối đến máy chủ';
    throw new HttpError(message, response.status, payload);
  }

  if (payload && typeof payload === 'object' && 'result' in payload) {
    return (payload as ApiResponse<T>).result;
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, body, method: 'POST' }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, body, method: 'PUT' }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
