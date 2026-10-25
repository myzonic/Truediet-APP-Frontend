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
      isAssessmentComplete: Boolean(data.goal),
    },
  });
  return res?.profile ?? null;
}

export async function loadProfile(): Promise<{ user: any; profile: ProfileRecord | null }> {
  return apiFetch<{ user: any; profile: ProfileRecord | null }>('/api/profile', {
    method: 'GET',
  });
}
