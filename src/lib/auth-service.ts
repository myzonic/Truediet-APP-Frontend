import { apiFetch } from './api-client';
import * as SecureStore from 'expo-secure-store';

const COOKIE_KEY = 'truediet.auth.cookie';
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
 * Logs in a user with email and password.
 * Calls the backend API and stores the session cookie and user data.
 */
export async function signIn(email: string, password: string) {
  const result = await apiFetch<{ user: User; session: Session }>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });

  // Store the session cookie for subsequent API calls
  if (result.session?.token) {
    await SecureStore.setItemAsync(COOKIE_KEY, result.session.token);
  }

  // Store the user data
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

  return { user: result.user, session: result.session };
}

/**
 * Registers a new user with email and password.
 * Calls the backend API and stores the session cookie and user data.
 */
export async function signUp(name: string, email: string, password: string) {
  const result = await apiFetch<{ user: User; session: Session }>('/api/auth/register', {
    method: 'POST',
    body: { name: name.trim(), email: email.trim().toLowerCase(), password },
  });

  // Store the session cookie for subsequent API calls
  if (result.session?.token) {
    await SecureStore.setItemAsync(COOKIE_KEY, result.session.token);
  }

  // Store the user data
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

  return { user: result.user, session: result.session };
}

/**
 * Logs out the current user.
 * Clears the session cookie and user data from secure storage.
 */
export async function signOut() {
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

    // Store the updated cookie and user
    if (result.session?.token) {
      await SecureStore.setItemAsync(COOKIE_KEY, result.session.token);
    }
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
  // Try to get the stored cookie
  let token = '';
  try {
    token = await SecureStore.getItemAsync(COOKIE_KEY);
  } catch {
    token = '';
  }

  if (!token) {
    // No stored cookie - try to clear any stale user data
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