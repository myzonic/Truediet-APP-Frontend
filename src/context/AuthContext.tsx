import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { ensurePushRegistered } from '../lib/notifications';

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
  signOutUser: () => Promise<void>;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOutUser: async () => {},
  refetchSession: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await (authClient as any).getSession({});
      if (res?.data) {
        setUser(res.data.user as User);
        setSession(res.data.session as Session);
        // Fire-and-forget: registers this device for push on every signed-in
        // launch so members receive dietitian replies without visiting
        // Settings. Never blocks or fails the session itself.
        ensurePushRegistered();
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const signOutUser = async () => {
    try {
      await (authClient as any).signOut({});
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOutUser,
        refetchSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
