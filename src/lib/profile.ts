import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api-client';
import { OnboardingData } from '../context/OnboardingContext';

export interface ProfileRecord {
  id?: string;
  userId?: string;
  displayName?: string | null;
  age?: string | null;
  sex?: string | null;
  height?: string | null;
  weight?: string | null;
  goal?: string | null;
  allergies?: string[] | null;
  dietaryPreferences?: string[] | null;
  isAssessmentComplete?: boolean;
}

// A local copy keeps the assessment answers on the device so a failed write
// to the server does not lose them.
const PROFILE_KEY = 'truediet.profile.v1';

async function writeLocal(profile: ProfileRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable - the server copy is still written
  }
}

export async function readLocalProfile(): Promise<ProfileRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ProfileRecord) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(data: OnboardingData): Promise<ProfileRecord | null> {
  const res = await apiFetch<{ profile: ProfileRecord }>('/api/profile', {
    method: 'POST',
    body: {
      goal: data.goal || undefined,
      age: data.age || undefined,
      sex: data.sex || undefined,
      height: data.height || undefined,
      weight: data.weight || undefined,
      allergies: data.allergies,
      dietaryPreferences: data.dietaryPreferences,
      // Omitted entirely when there is no assessment in this session, so a
      // returning member's completed assessment is never reset to false by a
      // plain sign-in. The server keeps the stored value for undefined.
      isAssessmentComplete: data.goal ? true : undefined,
    },
  });

  const profile = res?.profile ?? null;
  if (profile) {
    await writeLocal(profile);
  }
  return profile;
}

export async function loadProfile(): Promise<{ user: any; profile: ProfileRecord | null }> {
  const res = await apiFetch<{ user: any; profile: ProfileRecord | null }>('/api/profile', {
    method: 'GET',
  });
  if (res?.profile) {
    await writeLocal(res.profile);
  }
  return res;
}
