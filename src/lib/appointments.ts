import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'truediet.activeAppointment';

export interface StoredAppointment {
  slot: string;
  visitType: 'video' | 'phone';
  bookingId?: string | number;
  meetingUrl?: string;
  /** Stream call id, needed to rejoin the video room in-app. */
  callId?: string;
  isoStart?: string;
  savedAt: string;
}

export async function saveAppointment(appointment: Omit<StoredAppointment, 'savedAt'>): Promise<void> {
  const payload: StoredAppointment = { ...appointment, savedAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function loadAppointment(): Promise<StoredAppointment | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAppointment;
    return parsed && typeof parsed.slot === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearAppointment(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
