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

/**
 * Auth endpoints where a 401 is an EXPECTED outcome that the caller handles
 * locally (wrong password, no/expired session on launch, invalid reset token).
 * The global "session expired" handler must NOT fire for these, otherwise a
 * single failed login would sign the user out and reset navigation to the
 * welcome flow — which is exactly the opposite of what should happen.
 */
const AUTH_401_IS_LOCAL = new Set([
  '/api/auth/login',
  '/api/auth/session',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/verify-email/confirm',
]);

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
    if (response.status === 401 && !AUTH_401_IS_LOCAL.has(path)) {
      // A protected request was rejected: the session is gone (expired or
      // revoked elsewhere). Auth endpoints are excluded because their 401s
      // are expected and handled by the calling screen.
      try {
        unauthorizedHandler?.();
      } catch {
        // never let navigation errors mask the API error below
      }
    }
    const message =
      (data && (data.error || data.message)) || `Request failed with status ${response.status}`;
    // Attach the status so callers can tell a genuinely expired session (401)
    // from a transient network/server failure and keep credentials in the latter.
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}
