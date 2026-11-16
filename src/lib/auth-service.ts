import { apiFetch, ACCESS_TOKEN_KEY, SESSION_TOKEN_KEY_NAME, getStoredSessionToken } from './api-client';
import * as SecureStore from 'expo-secure-store';

const COOKIE_KEY = 'truediet.auth.cookie'; // legacy key, cleared on sign-in
const USER_KEY = 'truediet.auth.user';

// Types matching the existing AuthContext interface
interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Persists the credentials returned by the custom auth endpoints.
 *
 * Login/register return `{ token: <bearer JWT>, session.token: <opaque> }`;
 * GET /api/auth/session returns the refreshed JWT as `session.token`. The JWT
 * is what protected routes expect in `Authorization: Bearer`, so it goes under
 * ACCESS_TOKEN_KEY. The opaque value only identifies the server-side session
 * row for sign-out.
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
 * Calls the backend API and stores the session cookie and user data.
 */
export async function signIn(email: string, password: string) {
  const result = await apiFetch<{ user: User; session: Session; token?: string }>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });

  await persistTokens(result);

  // Store the user data
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

  return { user: result.user, session: result.session };
}

/**
 * Registers a new user with email and password.
 * Calls the backend API and stores the session cookie and user data.
 */
export async function signUp(name: string, email: string, password: string) {
  const result = await apiFetch<{ user: User; session: Session; token?: string }>('/api/auth/register', {
    method: 'POST',
    body: { name: name.trim(), email: email.trim().toLowerCase(), password },
  });

  await persistTokens(result);

  // Store the user data
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

  return { user: result.user, session: result.session };
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
 * Returns the new user and session data, or throws if the session is invalid.
 */
export async function refetchSession(): Promise<{ user: User | null; session: Session | null }> {
  try {
    const result = await apiFetch<{ user: User; session: Session }>('/api/auth/session', {
      method: 'GET',
    });

    // /api/auth/session returns a freshly minted bearer JWT as session.token.
    await persistTokens({ session: result.session });
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

    return { user: result.user, session: result.session };
  } catch {
    // Session invalid - clear local storage
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY_NAME);
    await SecureStore.deleteItemAsync(COOKIE_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    return { user: null, session: null };
  }
}

/**
 * Triggers a password reset request.
 * The backend sends a time-limited reset link via email.
 */
export async function requestPasswordReset(email: string) {
  return apiFetch<{ success: boolean }>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

/**
 * Resets the password using a time-limited token.
 * This should be called from the deep-link flow with a token from the email.
 */
export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ success: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  });
}

/**
 * Sends an email verification link.
 * The backend sends a verification email to the user.
 */
export async function sendVerificationEmail(email: string, callbackURL: string) {
  return apiFetch<{ success: boolean }>('/api/auth/verify-email', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), callbackURL },
  });
}

/**
 * Verifies an email using a token from the verification email.
 * Called from the deep-link flow.
 */
export async function verifyEmail(token: string) {
  return apiFetch<{ success: boolean }>('/api/auth/verify-email/confirm', {
    method: 'POST',
    body: { token },
  });
}

/**
 * Gets the current user session from secure storage and the backend.
 * Returns the user and session, or null if not authenticated.
 */
export async function getSession(): Promise<{ user: User | null; session: Session | null }> {
  // Try to get the stored bearer JWT (fall back to the legacy key so a session
  // created by an older build can still be refreshed once).
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
    // No stored token - try to clear any stale user data
    await SecureStore.deleteItemAsync(USER_KEY);
    return { user: null, session: null };
  }

  try {
    const result = await apiFetch<{ user: User; session: Session }>('/api/auth/session', {
      method: 'GET',
    });

    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));
    return { user: result.user, session: result.session };
  } catch {
    // Session invalid - clear local storage
    await SecureStore.deleteItemAsync(COOKIE_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    return { user: null, session: null };
  }
}

/**
 * Checks if there's a current authenticated session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getSession();
  return user !== null;
}

/**
 * Gets the current user data.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { user } = await getSession();
  return user;
}

/**
 * Updates the user's profile name.
 */
export async function updateName(name: string) {
  return apiFetch<{ user: User }>('/api/auth/profile', {
    method: 'PATCH',
    body: { name: name.trim() },
  });
}

export { User, Session };