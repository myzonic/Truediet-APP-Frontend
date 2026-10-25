import { authClient } from './auth-client';

const baseURL = process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:3000';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  let cookie = '';
  try {
    cookie = (await (authClient as any).getCookie?.()) || '';
  } catch {
    cookie = '';
  }

  const response = await fetch(`${baseURL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
