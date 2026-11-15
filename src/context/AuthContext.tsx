import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getSession, signOut, updateName } from '../lib/auth-service';

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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  /** True only once a real session has been confirmed by the server. */
  isAuthenticated: boolean;
  signOutUser: () => Promise<void>;
  refetchSession: () => Promise<void>;
  updateName: (name: string) => Promise<{ user: User | null }>;
}

/** How often returning to the app checks the session again. */
const FOREGROUND_REFRESH_MS = 5 * 60 * 1000;

/**
 * The last confirmed user, cached in SecureStore.
 *
 * Only used when the app opens with no network: the member keeps their
 * signed-in experience instead of being dropped back onto the welcome screen.
 * It holds no token - the session token stays in the store.
 */
const CACHED_USER_KEY = 'truediet.auth.user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Whether a session has ever been confirmed in this app run. Used to tell
  // "the server said you are signed out" apart from "the network is down".
  const everSignedIn = useRef(false);
  const lastCheck = useRef(0);

  const fetchSession = useCallback(async () => {
    try {
      const result = await getSession();
      if (result.user) {
        everSignedIn.current = true;
        setUser(result.user);
        setSession(result.session);
        // Store the user cache for offline fallback
        SecureStore.setItemAsync(CACHED_USER_KEY, JSON.stringify(result.user)).catch(() => undefined);
        // Fire-and-forget: registers this device for push on every signed-in
        // launch so members receive dietitian replies without visiting
        // Settings. Never blocks or fails the session itself.
        // ensurePushRegistered(); // TODO: re-enable when push logic is updated
      } else {
        // No valid session
        everSignedIn.current = false;
        setUser(null);
        setSession(null);
        await SecureStore.deleteItemAsync(CACHED_USER_KEY).catch(() => undefined);
      }
    } catch {
      // Network failure (offline, DNS, timeout): the stored session may still
      // be perfectly valid. Clearing it here would sign a member out for
      // walking into a lift. Fall back to the cached identity, if any, and
      // let the next refresh decide.
      try {
        const cached = await SecureStore.getItemAsync(CACHED_USER_KEY);
        if (cached) {
          everSignedIn.current = true;
          setUser(JSON.parse(cached) as User);
        } else if (!everSignedIn.current) {
          setUser(null);
          setSession(null);
        }
      } catch {
        if (!everSignedIn.current) {
          setUser(null);
          setSession(null);
        }
      }
    } finally {
      lastCheck.current = Date.now();
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Re-check when the member returns to the app after a while, so a session
  // revoked elsewhere (password reset, account deletion) is noticed.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state !== 'active') return;
      if (Date.now() - lastCheck.current < FOREGROUND_REFRESH_MS) return;
      fetchSession();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [fetchSession]);

  const signOutUser = async () => {
    try {
      await signOut();
    } catch {
      // Even if the server cannot be reached, the local session is cleared
      // below so the device does not stay signed in.
    } finally {
      everSignedIn.current = false;
      setUser(null);
      setSession(null);
      await SecureStore.deleteItemAsync(CACHED_USER_KEY).catch(() => undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: Boolean(user),
        signOutUser,
        refetchSession: fetchSession,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOutUser: async () => {},
  refetchSession: async () => {},
  updateName: async () => ({ user: null }),
});

export const useAuth = () => useContext(AuthContext);