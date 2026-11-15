import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_AUTH_URL ||
  // A release build must never fall back to a developer machine. `.env` is
  // gitignored, so the localhost fallback is only safe in development.
  (__DEV__ ? 'http://localhost:3000' : 'https://api.true-diet.com');

const baseURL = API_BASE_URL;

// The opaque session token issued by POST /api/auth/login (and returned by
// /api/auth/session) lives in Expo SecureStore. The custom backend validates it
// through the bearer JWT on authenticated routes.
const SESSION_TOKEN_KEY = 'truediet.auth.cookie';

const getStoredSessionToken = async (): Promise<string> => {
  try {
    return (await SecureStore.getItemAsync(SESSION_TOKEN_KEY)) || '';
  } catch {
    return '';
  }
};

/**
 * Called when the server rejects a request with 401.
 *
 * AuthContext registers a handler that clears the session and returns to the
 * welcome screen, so an expired session does not leave the member staring at
 * screens that can no longer load anything.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const cookie = await getStoredSessionToken();

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
    if (response.status === 401) {
      // The session is gone (expired or revoked elsewhere).
      try {
        unauthorizedHandler?.();
      } catch {
        // never let navigation errors mask the API error below
      }
    }
    const message =
      (data && (data.error || data.message)) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
