import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api-client';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLog {
  id: string;
  userId: string;
  mealType: MealType;
  description: string;
  notes: string | null;
  source: 'manual' | 'voice';
  loggedAt: string;
  createdAt: string;
}

export interface HungerCheckin {
  id: string;
  userId: string;
  mealLogId: string | null;
  hungerBefore: number | null;
  fullnessAfter: number | null;
  note: string | null;
  createdAt: string;
}

export interface Progress {
  today: { date: string; meals: number; checkins: number };
  week: { meals: number; checkins: number; days: { date: string; count: number }[] };
}

export interface AddMealInput {
  mealType: MealType;
  description: string;
  notes?: string;
  source?: 'manual' | 'voice';
}

export interface AddCheckinInput {
  hungerBefore?: number | null;
  fullnessAfter?: number | null;
  note?: string;
  mealLogId?: string;
}

const MEALS_KEY = 'truediet.meals.v1';
const CHECKINS_KEY = 'truediet.checkins.v1';

function isOfflineError(error: unknown): boolean {
  const message = String((error as any)?.message || '');
  return (
    error instanceof TypeError ||
    /failed to fetch|network request failed|load failed|networkerror/i.test(message)
  );
}

async function readLocal<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal<T>(key: string, items: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode / quota) — keep the in-memory result
  }
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function localId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildLocalProgress(meals: MealLog[], checkins: HungerCheckin[]): Progress {
  const now = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({ date: dayKey(d), count: 0 });
  }
  const index = new Map(days.map((d, i) => [d.date, i]));
  for (const meal of meals) {
    const i = index.get(dayKey(new Date(meal.loggedAt)));
    if (i !== undefined) days[i].count++;
  }
  for (const checkin of checkins) {
    const i = index.get(dayKey(new Date(checkin.createdAt)));
    if (i !== undefined) days[i].count++;
  }
  const todayKey = dayKey(now);
  const inWeek = (value: string) => index.has(dayKey(new Date(value)));
  return {
    today: {
      date: todayKey,
      meals: meals.filter((m) => dayKey(new Date(m.loggedAt)) === todayKey).length,
      checkins: checkins.filter((c) => dayKey(new Date(c.createdAt)) === todayKey).length,
    },
    week: {
      meals: meals.filter((m) => inWeek(m.loggedAt)).length,
      checkins: checkins.filter((c) => inWeek(c.createdAt)).length,
      days,
    },
  };
}

export async function loadMeals(date?: string): Promise<MealLog[]> {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await apiFetch<{ meals: MealLog[] }>(`/api/meals${query}`, { method: 'GET' });
    return res?.meals ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<MealLog>(MEALS_KEY);
    const target = date || dayKey(new Date());
    return items.filter((m) => dayKey(new Date(m.loggedAt)) === target);
  }
}

export async function addMeal(input: AddMealInput): Promise<MealLog | null> {
  try {
    const res = await apiFetch<{ meal: MealLog }>('/api/meals', { method: 'POST', body: input });
    return res?.meal ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const now = new Date().toISOString();
    const meal: MealLog = {
      id: localId(),
      userId: 'local',
      mealType: input.mealType,
      description: input.description,
      notes: input.notes ?? null,
      source: input.source ?? 'manual',
      loggedAt: now,
      createdAt: now,
    };
    const items = await readLocal<MealLog>(MEALS_KEY);
    items.unshift(meal);
    await writeLocal(MEALS_KEY, items);
    return meal;
  }
}

export async function removeMeal(id: string): Promise<void> {
  try {
    await apiFetch(`/api/meals/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<MealLog>(MEALS_KEY);
    await writeLocal(MEALS_KEY, items.filter((m) => m.id !== id));
  }
}

export async function loadCheckins(): Promise<HungerCheckin[]> {
  try {
    const res = await apiFetch<{ checkins: HungerCheckin[] }>('/api/hunger', { method: 'GET' });
    return res?.checkins ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    return readLocal<HungerCheckin>(CHECKINS_KEY);
  }
}

export async function addCheckin(input: AddCheckinInput): Promise<HungerCheckin | null> {
  try {
    const res = await apiFetch<{ checkin: HungerCheckin }>('/api/hunger', { method: 'POST', body: input });
    return res?.checkin ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const checkin: HungerCheckin = {
      id: localId(),
      userId: 'local',
      mealLogId: input.mealLogId ?? null,
      hungerBefore: input.hungerBefore ?? null,
      fullnessAfter: input.fullnessAfter ?? null,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
    };
    const items = await readLocal<HungerCheckin>(CHECKINS_KEY);
    items.unshift(checkin);
    await writeLocal(CHECKINS_KEY, items);
    return checkin;
  }
}

export async function loadProgress(): Promise<Progress | null> {
  try {
    const res = await apiFetch<Progress>('/api/progress', { method: 'GET' });
    return res ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const [meals, checkins] = await Promise.all([
      readLocal<MealLog>(MEALS_KEY),
      readLocal<HungerCheckin>(CHECKINS_KEY),
    ]);
    return buildLocalProgress(meals, checkins);
  }
}
