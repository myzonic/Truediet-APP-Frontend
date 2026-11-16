import { apiFetch, ACCESS_TOKEN_KEY, SESSION_TOKEN_KEY_NAME, getStoredSessionToken, API_BASE_URL } from './api-client';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const COOKIE_KEY = 'truediet.auth.cookie'; // legacy key, cleared on sign-in
const USER_KEY = 'truediet.auth.user';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Persists the credentials returned by the custom auth endpoints.
 */
async function persistTokens(result: { token?: string; session?: { token?: string } }) {
  const jwt = result.token || result.session?.token;
  if (jwt) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, jwt);
  if (result.token && result.session?.token) {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY_NAME, result.session.token);
  }
  await SecureStore.deleteItemAsync(COOKIE_KEY);
}

/**
 * Logs in a user with email and password.
 */
export async function signIn(email: string, password: string) {
  const result = await apiFetch<{ user: User; session: Session; token?: string }>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });

  await persistTokens(result);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

  return { user: result.user, session: result.session };
}

/**
 * Registers a new user with email and password.
 */
export async function signUp(name: string, email: string, password: string) {
  const result = await apiFetch<{ user: User; session: Session; token?: string; verificationEmailSent?: boolean }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: { name: name.trim(), email: email.trim().toLowerCase(), password },
    }
  );

  await persistTokens(result);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

  return {
    user: result.user,
    session: result.session,
    verificationEmailSent: Boolean(result.verificationEmailSent),
  };
}

/**
 * Direct Google OAuth sign-in using the custom backend `/api/auth/google/start`
 * and `/api/auth/google/callback` flow (no Better Auth).
 */
export async function signInWithGoogle(): Promise<{ user: User | null; session: Session | null; cancelled?: boolean }> {
  const redirectUri = Linking.createURL('auth-callback');
  const startUrl = `${API_BASE_URL}/api/auth/google/start?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const res = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);
  if (res.type !== 'success' || !res.url) {
    return { user: null, session: null, cancelled: true };
  }

  const parsed = Linking.parse(res.url);
  const qp = (parsed.queryParams || {}) as Record<string, string | undefined>;
  if (qp.error) {
    throw new Error(String(qp.error));
  }

  const token = qp.token ? String(qp.token) : '';
  const sessionToken = qp.sessionToken ? String(qp.sessionToken) : '';
  if (!token) {
    throw new Error('Google sign-in did not return a session token.');
  }

  await persistTokens({ token, session: { token: sessionToken || token } });
  return refetchSession();
}

/**
 * Logs out the current user.
 * Deletes the server-side session row (best effort) and clears local tokens.
 */
export async function signOut() {
  const sessionToken = await getStoredSessionToken();
  try {
    await apiFetch('/api/auth/logout', { method: 'POST', body: { token: sessionToken } });
  } catch {
    // local cleanup must happen even if the network call fails
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY_NAME);
  await SecureStore.deleteItemAsync(COOKIE_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Refreshes the session by calling the backend.
 */
export async function refetchSession(): Promise<{ user: User | null; session: Session | null }> {
  try {
    const result = await apiFetch<{ user: User; session: Session }>('/api/auth/session', {
      method: 'GET',
    });

    await persistTokens({ session: result.session });
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

    return { user: result.user, session: result.session };
  } catch {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY_NAME);
    await SecureStore.deleteItemAsync(COOKIE_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    return { user: null, session: null };
  }
}

/**
 * Triggers a password reset request.
 */
export async function requestPasswordReset(email: string) {
  return apiFetch<{ success: boolean; status?: boolean; resetToken?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

/**
 * Resets the password using a time-limited token.
 */
export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ success: boolean; status?: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    body: { token: token.trim(), newPassword },
  });
}

/**
 * Sends or resends an email verification link.
 */
export async function sendVerificationEmail(email: string, callbackURL = '/verify-email') {
  return apiFetch<{ success: boolean; status?: boolean; alreadyVerified?: boolean }>('/api/auth/verify-email', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), callbackURL },
  });
}

/**
 * Verifies an email using a token from the verification email.
 */
export async function verifyEmail(token: string) {
  return apiFetch<{ success: boolean; status?: boolean; alreadyVerified?: boolean }>('/api/auth/verify-email/confirm', {
    method: 'POST',
    body: { token: token.trim() },
  });
}

/**
 * Gets the current user session from secure storage and the backend.
 */
export async function getSession(): Promise<{ user: User | null; session: Session | null }> {
  let token = '';
  try {
    token =
      (await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)) ||
      (await SecureStore.getItemAsync(COOKIE_KEY)) ||
      '';
  } catch {
    token = '';
  }

  if (!token) {
    await SecureStore.deleteItemAsync(USER_KEY);
    return { user: null, session: null };
  }

  try {
    const result = await apiFetch<{ user: User; session: Session }>('/api/auth/session', {
      method: 'GET',
    });

    await persistTokens({ session: result.session });
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));
    return { user: result.user, session: result.session };
  } catch {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY_NAME);
    await SecureStore.deleteItemAsync(COOKIE_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    return { user: null, session: null };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getSession();
  return user !== null;
}

export async function getCurrentUser(): Promise<User | null> {
  const { user } = await getSession();
  return user;
}

export async function updateName(name: string) {
  const res = await apiFetch<{ user: User }>('/api/auth/profile', {
    method: 'PATCH',
    body: { name: name.trim() },
  });
  if (res?.user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.user));
  }
  return res;
}
