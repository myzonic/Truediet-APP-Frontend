import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:3000';

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
