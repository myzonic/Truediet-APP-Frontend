import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api-client';

export interface Preferences {
  notifications: Record<string, boolean>;
  accessibility: Record<string, boolean>;
  consents: Record<string, boolean>;
}

const PREFERENCES_KEY = 'truediet.preferences.v1';

function emptyPreferences(): Preferences {
  return { notifications: {}, accessibility: {}, consents: {} };
}

async function readLocal(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return emptyPreferences();
    return {
      notifications: parsed.notifications || {},
      accessibility: parsed.accessibility || {},
      consents: parsed.consents || {},
    };
  } catch {
    return emptyPreferences();
  }
}

async function writeLocal(value: Preferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode / quota)
  }
}

export async function loadPreferences(): Promise<Preferences> {
  const local = await readLocal();
  try {
    const res = await apiFetch<{ preferences: Preferences }>('/api/preferences', { method: 'GET' });
    const remote = res?.preferences;
    if (!remote) return local;
    const merged: Preferences = {
      notifications: { ...local.notifications, ...remote.notifications },
      accessibility: { ...local.accessibility, ...remote.accessibility },
      consents: { ...local.consents, ...remote.consents },
    };
    await writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
}

export async function savePreferences(preferences: Partial<Preferences>): Promise<Preferences> {
  const local = await readLocal();
  const merged: Preferences = {
    notifications: { ...local.notifications, ...(preferences.notifications || {}) },
    accessibility: { ...local.accessibility, ...(preferences.accessibility || {}) },
    consents: { ...local.consents, ...(preferences.consents || {}) },
  };
  await writeLocal(merged);
  try {
    const res = await apiFetch<{ preferences: Preferences }>('/api/preferences', {
      method: 'PUT',
      body: preferences,
    });
    return res?.preferences ?? merged;
  } catch {
    return merged;
  }
}
