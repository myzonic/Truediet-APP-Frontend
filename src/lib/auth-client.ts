import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL =
  process.env.EXPO_PUBLIC_AUTH_URL ||
  // A release build must never fall back to a developer machine. `.env` is
  // gitignored, so the localhost fallback is only safe in development.
  (__DEV__ ? 'http://localhost:3000' : 'https://api.true-diet.com');

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'truediet',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
