import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiFetch } from './api-client';

/**
 * Push notifications.
 *
 * Design rules:
 *  - permission is requested once, from a screen that explains why
 *  - a denied permission never blocks the app and is never re-prompted
 *  - a token is only called "registered" after the backend accepts it
 *  - signing out removes the device so the next member on a shared phone
 *    cannot receive the previous member's notifications
 */

const PUSH_TOKEN_KEY = 'truediet.push-token.v2';
const DEVICE_ID_KEY = 'truediet.device-id.v1';

export interface StoredPushToken {
  token: string;
  platform: string;
  projectId?: string;
  deviceId?: string;
  savedAt: string;
}

export interface PushResult {
  token?: string;
  error?: string;
  needsProjectId?: boolean;
  /** True when the member refused at the OS level; do not ask again. */
  permissionDenied?: boolean;
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

/** Stable per-install id, used to retire old tokens for the same device. */
export async function getDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const generated = `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  } catch {
    return 'unknown-device';
  }
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

/**
 * Creates the Android channels the backend targets.
 *
 * Channel ids must match CATEGORY_CHANNEL in server/src/lib/push.ts. Importance
 * is fixed per channel after creation, which is why they are created with the
 * final settings rather than updated later.
 */
export function configureNotifications(): void {
  if (!isPushSupported()) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {
    // handler can only be configured in a native build
  }

  if (Platform.OS !== 'android') return;
  const channels: Array<[string, string, Notifications.AndroidImportance]> = [
    ['messages', 'Dietitian messages', Notifications.AndroidImportance.MAX],
    ['appointments', 'Appointment reminders', Notifications.AndroidImportance.HIGH],
    ['content', 'New content', Notifications.AndroidImportance.DEFAULT],
    ['tracking', 'Tracking reminders', Notifications.AndroidImportance.DEFAULT],
    ['security', 'Account security', Notifications.AndroidImportance.MAX],
    ['default', 'True Diet', Notifications.AndroidImportance.DEFAULT],
  ];
  for (const [id, name, importance] of channels) {
    Notifications.setNotificationChannelAsync(id, {
      name,
      importance,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#64A826',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    }).catch(() => undefined);
  }
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getPermissionState(): Promise<PermissionState> {
  if (!isPushSupported()) return 'denied';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'undetermined') return 'undetermined';
    return 'denied';
  } catch {
    return 'undetermined';
  }
}

/**
 * Asks the OS for permission and registers the device when granted.
 *
 * Call this only from a screen that has already explained the benefit. Asking
 * again after a denial is not possible on iOS anyway (the OS ignores it), so
 * the caller should point the member at Settings instead.
 */
export async function requestPushPermissionAndRegister(): Promise<PushResult> {
  if (!isPushSupported()) {
    return { error: 'Push notifications are available in the iOS and Android app.' };
  }
  if (!Device.isDevice) {
    return { error: 'Push notifications need a physical device.' };
  }

  configureNotifications();

  const current = await getPermissionState();
  if (current === 'denied') {
    return {
      permissionDenied: true,
      error:
        'Notifications are turned off for True Diet in your device settings. You can enable them there at any time.',
    };
  }
  if (current === 'undetermined') {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== 'granted') {
      return {
        permissionDenied: true,
        error: 'No problem - you can turn notifications on later in Settings.',
      };
    }
  }

  return registerDevice();
}

/**
 * Registers the current device without prompting.
 *
 * Used on every sign-in: if the member already granted permission their token
 * is refreshed quietly, otherwise nothing happens.
 */
export async function ensurePushRegistered(): Promise<void> {
  if (!isPushSupported() || !Device.isDevice) return;
  if (!getProjectId()) return;
  try {
    configureNotifications();
    if ((await getPermissionState()) !== 'granted') return;
    await registerDevice();
  } catch {
    // Never let a push problem affect the session.
  }
}

async function registerDevice(): Promise<PushResult> {
  try {
    const projectId = getProjectId();
    if (!projectId) {
      return { needsProjectId: true, error: 'Push is not configured for this build.' };
    }

    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = result.data;
    const deviceId = await getDeviceId();

    // The backend must accept the token before the device believes it is
    // subscribed - otherwise Settings would claim success while the server
    // knows nothing about this phone.
    await apiFetch('/api/push-tokens', {
      method: 'POST',
      body: { token, platform: Platform.OS, deviceId },
    });

    await writeStoredPushToken({
      token,
      platform: Platform.OS,
      projectId,
      deviceId,
      savedAt: new Date().toISOString(),
    });
    return { token };
  } catch (error: any) {
    return { error: error?.message || 'Could not register for push notifications.' };
  }
}

/** Called on sign-out: the device stops receiving this member's notifications. */
export async function unregisterDevice(): Promise<void> {
  const stored = await readStoredPushToken();
  const deviceId = await getDeviceId();
  try {
    if (stored?.token) {
      await apiFetch(`/api/push-tokens/${encodeURIComponent(stored.token)}`, { method: 'DELETE' });
    } else {
      await apiFetch('/api/push-tokens/sign-out', { method: 'POST', body: { deviceId } });
    }
  } catch {
    // Offline sign-out still clears the local copy below; the token is
    // cleaned up the next time it is registered to another account (the
    // backend refuses cross-account reuse).
  }
  await writeStoredPushToken(null);
}

/** Backwards-compatible alias used by older call sites. */
export async function disablePushNotifications(): Promise<void> {
  await unregisterDevice();
}

/** Where a tapped notification should take the member. */
export interface NotificationTarget {
  screen: string;
  params?: Record<string, unknown>;
}

export function resolveNotificationTarget(
  data: Record<string, any> | null | undefined
): NotificationTarget | null {
  if (!data) return null;
  if (typeof data.screen === 'string' && data.screen) {
    return { screen: data.screen, params: data.params };
  }
  switch (data.type) {
    case 'message':
      return { screen: 'MessageDetail', params: data.threadId ? { threadId: data.threadId } : undefined };
    case 'appointment':
      return { screen: 'AppointmentDetail', params: data.appointmentId ? { appointmentId: data.appointmentId } : undefined };
    case 'content':
      return data.slug ? { screen: 'Article', params: { articleId: data.slug, title: data.title } } : null;
    default:
      return null;
  }
}
