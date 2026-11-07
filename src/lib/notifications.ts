import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiFetch } from './api-client';

const PUSH_TOKEN_KEY = 'truediet.push-token.v1';

export interface StoredPushToken {
  token: string;
  platform: string;
  projectId?: string;
  savedAt: string;
}

export interface PushResult {
  token?: string;
  error?: string;
  needsProjectId?: boolean;
}

export function isPushSupported(): boolean {
  return Platform.OS !== 'web';
}

export function getProjectId(): string | undefined {
  const extra: any = Constants.expoConfig?.extra || {};
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    extra?.eas?.projectId ||
    (Constants as any).easConfig?.projectId ||
    undefined
  );
}

export async function readStoredPushToken(): Promise<StoredPushToken | null> {
  try {
    const raw = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredPushToken) : null;
  } catch {
    return null;
  }
}

async function writeStoredPushToken(value: StoredPushToken | null): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(PUSH_TOKEN_KEY, JSON.stringify(value));
    else await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  } catch {
    // storage unavailable (private mode / quota)
  }
}

export function configureNotifications(): void {
  if (!isPushSupported()) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // handler can only be configured in a native build
  }
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'True Diet',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0B3B36',
    }).catch(() => undefined);
  }
}

export async function enablePushNotifications(): Promise<PushResult> {
  if (!isPushSupported()) {
    return {
      error: 'Push notifications are available in the iOS and Android app. This web preview cannot register for push.',
    };
  }
  if (!Device.isDevice) {
    return { error: 'Push notifications require a physical device or a development build.' };
  }

  configureNotifications();

  try {
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') {
      return { error: 'Notification permission was not granted. You can enable it in your device settings.' };
    }

    const projectId = getProjectId();
    if (!projectId) {
      return {
        needsProjectId: true,
        error:
          'Add your EAS project ID first: run "npx eas init" or set EXPO_PUBLIC_EAS_PROJECT_ID, then rebuild the app.',
      };
    }

    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = result.data;

    // The backend has to accept the token before it can be called registered.
    // Registering first and reporting failure later would leave the device
    // believing it is subscribed while the server knows nothing about it.
    await apiFetch('/api/push-tokens', {
      method: 'POST',
      body: { token, platform: Platform.OS },
    });

    const stored: StoredPushToken = {
      token,
      platform: Platform.OS,
      projectId,
      savedAt: new Date().toISOString(),
    };
    await writeStoredPushToken(stored);

    return { token };
  } catch (error: any) {
    return { error: error?.message || 'Could not register for push notifications.' };
  }
}

/**
 * Called after every successful session load (app start + sign-in). Registers
 * the device for push without blocking auth: prompts only the first time
 * (permission still undetermined), stays silent when granted or denied, and
 * never throws - a push failure must not affect being signed in.
 */
export async function ensurePushRegistered(): Promise<void> {
  if (!isPushSupported() || !Device.isDevice) return;
  const projectId = getProjectId();
  if (!projectId) return;
  try {
    configureNotifications();
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status === 'undetermined') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = result.data;
    await apiFetch('/api/push-tokens', {
      method: 'POST',
      body: { token, platform: Platform.OS },
    });
    await writeStoredPushToken({
      token,
      platform: Platform.OS,
      projectId,
      savedAt: new Date().toISOString(),
    });
  } catch {
    // token minting needs a dev build; Settings shows the manual path
  }
}

export async function disablePushNotifications(): Promise<void> {
  const stored = await readStoredPushToken();
  if (!stored?.token) {
    await writeStoredPushToken(null);
    return;
  }
  await apiFetch(`/api/push-tokens/${encodeURIComponent(stored.token)}`, { method: 'DELETE' });
  await writeStoredPushToken(null);
}
