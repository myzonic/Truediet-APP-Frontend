import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_AUTH_URL ||
  // A release build must never fall back to a developer machine. `.env` is
  // gitignored, so the localhost fallback is only safe in development.
  (__DEV__ ? 'http://localhost:3000' : 'https://api.true-diet.com');

const baseURL = API_BASE_URL;

// The backend authenticates protected routes with the bearer JWT returned by
// POST /api/auth/login|register (`token`) and refreshed by GET /api/auth/session
// (`session.token`). The opaque session row token (`session.token` from login)
// is kept separately so sign-out can delete the server-side session.
export const ACCESS_TOKEN_KEY = 'truediet.auth.token';
const SESSION_TOKEN_KEY = 'truediet.auth.session';

const getStoredAccessToken = async (): Promise<string> => {
  try {
    return (await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)) || '';
  } catch {
    return '';
  }
};

export const getStoredSessionToken = async (): Promise<string> => {
  try {
    return (await SecureStore.getItemAsync(SESSION_TOKEN_KEY)) || '';
  } catch {
    return '';
  }
};

export const SESSION_TOKEN_KEY_NAME = SESSION_TOKEN_KEY;

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
  const accessToken = await getStoredAccessToken();

  const response = await fetch(`${baseURL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
