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

export interface WeightEntry {
  id: string;
  userId: string;
  weight: string;
  recordedAt: string;
  createdAt: string;
}

/** Lightweight progress summary – used by the bottom-nav Track screen */
export interface Progress {
  today: { date: string; meals: number; checkins: number };
  week: { meals: number; checkins: number; days: { date: string; count: number }[] };
}

/** Full daily progress with nutrition, water and weight */
export interface DailyProgress {
  date: string;
  meals: MealLog[];
  checkins: HungerCheckin[];
  nutrition: { calories: number; protein: number; carbohydrates: number; fat: number } | null;
  water: { dailyGoalMl: number; totalMl: number; remainingMl: number } | null;
  weight: WeightEntry | null;
}

/** Quick-add water amounts in ml */
export enum QuickWaterAmount {
  Small = 250,
  Medium = 500,
  Large = 750,
  ExtraLarge = 1000,
}

/** Helper: check if an error is an offline / network error */
function isOfflineError(error: unknown): boolean {
  const message = String((error as Error)?.message || '');
  return (
    error instanceof TypeError ||
    /failed to fetch|network request failed|load failed|network error/i.test(message)
  );
}

/** Helper: read array from AsyncStorage */
function readLocal<T>(key: string): Promise<T[]> {
  return AsyncStorage.getItem(key).then(function (raw) {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  });
}

/** Helper: read single value from AsyncStorage (returns first element or undefined) */
function readLocalSingle<T>(key: string): Promise<T | undefined> {
  return AsyncStorage.getItem(key).then(function (raw) {
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  });
}

/** Helper: write array to AsyncStorage */
function writeLocal<T>(key: string, items: T[]): Promise<void> {
  return AsyncStorage.setItem(key, JSON.stringify(items));
}

/** Helper: create a date key YYYY-MM-DD from a Date */
function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Helper: generate a local ID */
function localId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Helper: go back N days from today */
function weekStartFromNow(date: Date, N: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - N);
  return d;
}

/**
 * Read meals for a specific date (defaults to today).
 * Calls GET /api/meals?date=YYYY-MM-DD first, falls back to AsyncStorage.
 */
export async function loadMeals(date?: string): Promise<MealLog[]> {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await apiFetch<{ meals: MealLog[] }>(`/api/meals${query}`, { method: 'GET' });
    return res?.meals ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<MealLog>('truediet.meals.v1');
    const target = date || dayKey(new Date());
    return items.filter(function (m): m is MealLog { return dayKey(new Date(m.loggedAt)) === target; });
  }
}

/**
 * Add a new meal log entry.
 * Calls POST /api/meals, falls back to local AsyncStorage.
 */
export async function addMeal(input: {
  mealType: MealType;
  description: string;
  notes?: string;
  source?: 'manual' | 'voice';
}): Promise<MealLog | null> {
  try {
    const res = await apiFetch<{ meal: MealLog }>('/api/meals', {
      method: 'POST',
      body: input,
    });
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
    const items = await readLocal<MealLog>('truediet.meals.v1');
    items.unshift(meal);
    await writeLocal('truediet.meals.v1', items);
    return meal;
  }
}

/**
 * Remove a meal entry by ID.
 * Calls DELETE /api/meals/:id, falls back to AsyncStorage.
 */
export async function removeMeal(id: string): Promise<void> {
  try {
    await apiFetch(`/api/meals/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<MealLog>('truediet.meals.v1');
    await writeLocal('truediet.meals.v1', items.filter(function (m): m is MealLog { return m.id !== id; }));
  }
}

/**
 * Update an existing meal entry by ID.
 * Calls PATCH /api/meals/:id, falls back to AsyncStorage.
 */
export async function updateMeal(
  id: string,
  patch: { mealType?: MealType; description?: string; notes?: string }
): Promise<MealLog | null> {
  try {
    const res = await apiFetch<{ meal: MealLog }>(`/api/meals/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: patch,
    });
    return res?.meal ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<MealLog>('truediet.meals.v1');
    const updated = items.map(function (m): MealLog {
      if (m.id !== id) return m;
      return {
        ...m,
        mealType: patch.mealType ?? m.mealType,
        description: patch.description ?? m.description,
        notes: patch.notes !== undefined ? patch.notes || null : m.notes,
      };
    });
    await writeLocal('truediet.meals.v1', updated);
    return updated.find((m) => m.id === id) ?? null;
  }
}

/**
 * Read all hunger check-ins.
 * Calls GET /api/hunger, falls back to AsyncStorage.
 */
export async function loadCheckins(): Promise<HungerCheckin[]> {
  try {
    const res = await apiFetch<{ checkins: HungerCheckin[] }>('/api/hunger', { method: 'GET' });
    return res?.checkins ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    return readLocal<HungerCheckin>('truediet.checkins.v1');
  }
}

/**
 * Add a hunger / fullness check-in.
 * Calls POST /api/hunger, falls back to AsyncStorage.
 */
export async function addCheckin(input: {
  hungerBefore?: number | null;
  fullnessAfter?: number | null;
  note?: string;
  mealLogId?: string;
}): Promise<HungerCheckin | null> {
  try {
    const res = await apiFetch<{ checkin: HungerCheckin }>('/api/hunger', {
      method: 'POST',
      body: input,
    });
    return res?.checkin ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const now = new Date().toISOString();
    const checkin: HungerCheckin = {
      id: localId(),
      userId: 'local',
      mealLogId: input.mealLogId ?? null,
      hungerBefore: input.hungerBefore ?? null,
      fullnessAfter: input.fullnessAfter ?? null,
      note: input.note ?? null,
      createdAt: now,
    };
    const items = await readLocal<HungerCheckin>('truediet.checkins.v1');
    items.unshift(checkin);
    await writeLocal('truediet.checkins.v1', items);
    return checkin;
  }
}

/**
 * Read all weight entries.
 * Calls GET /api/weight, falls back to AsyncStorage.
 */
export async function loadWeights(): Promise<WeightEntry[]> {
  try {
    const res = await apiFetch<{ entries: WeightEntry[] }>('/api/weight', { method: 'GET' });
    return res?.entries ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    return readLocal<WeightEntry>('truediet.weights.v1');
  }
}

/**
 * Add a weight entry.
 * Calls POST /api/weight, falls back to AsyncStorage.
 */
export async function addWeight(weight: string): Promise<WeightEntry | null> {
  try {
    const res = await apiFetch<{ entry: WeightEntry }>('/api/weight', {
      method: 'POST',
      body: { weight },
    });
    return res?.entry ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const now = new Date().toISOString();
    const entry: WeightEntry = {
      id: localId(),
      userId: 'local',
      weight,
      recordedAt: now,
      createdAt: now,
    };
    const items = await readLocal<WeightEntry>('truediet.weights.v1');
    items.unshift(entry);
    await writeLocal('truediet.weights.v1', items);
    return entry;
  }
}

/**
 * Remove a weight entry by ID.
 * Calls DELETE /api/weight/:id, falls back to AsyncStorage.
 */
export async function removeWeight(id: string): Promise<void> {
  try {
    await apiFetch(`/api/weight/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<WeightEntry>('truediet.weights.v1');
    await writeLocal('truediet.weights.v1', items.filter(function (w): w is WeightEntry { return w.id !== id; }));
  }
}

/**
 * Read progress summary (last 7 days).
 * Calls GET /api/progress, falls back to local build.
 */
export async function loadProgress(): Promise<Progress | null> {
  try {
    const res = await apiFetch<Progress>('/api/progress', { method: 'GET' });
    return res ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const meals = await readLocal<MealLog>('truediet.meals.v1');
    const checkins = await readLocal<HungerCheckin>('truediet.checkins.v1');
    return buildLocalProgress(meals, checkins);
  }
}

/** Build a local Progress from stored meals and check-ins */
function buildLocalProgress(meals: MealLog[], checkins: HungerCheckin[]): Progress | null {
  const now = new Date();
  const todayKey = dayKey(now);
  const inWeek = function (c: HungerCheckin): boolean {
    const k = dayKey(new Date(c.createdAt));
    return k === todayKey;
  };
  const todayMeals = meals.filter(function (m): m is MealLog { return dayKey(new Date(m.loggedAt)) === todayKey; });
  const todayCheckins = checkins.filter(inWeek).length;
  const allWeekMeals = meals.length;
  const allWeekCheckins = checkins.length;

  if (allWeekMeals === 0 && allWeekCheckins === 0) return null;

  const weekDays: { date: string; count: number }[] = [];
  const weekStart = weekStartFromNow(now, 6);
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() - i + 1);
    const k = dayKey(d);
    const count = meals.filter(function (m): m is MealLog { return dayKey(new Date(m.loggedAt)) === k; }).length +
      checkins.filter(inWeek).length;
    weekDays.unshift({ date: k, count });
  }

  return {
    today: {
      date: todayKey,
      meals: todayMeals.length,
      checkins: todayCheckins,
    },
    week: {
      meals: allWeekMeals,
      checkins: allWeekCheckins,
      days: weekDays,
    },
  };
}

/** Get daily progress with nutrition, water, and weight */
export async function loadDailyProgress(date?: string): Promise<DailyProgress> {
  const meals = await loadMeals(date);
  const progress = await loadProgress();
  const water = await loadWaterSummary();
  const weight = await loadLatestWeight();

  const todayKey = dayKey(new Date());
  const todayMeals = meals.filter(function (m): m is MealLog { return dayKey(new Date(m.loggedAt)) === todayKey; });

  // Calculate simple nutrition totals (zeros locally; backend provides real values)
  const nutrition = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

  const todayCheckins = progress?.today?.checkins ?? 0;
  const weekCheckins = progress?.week?.checkins ?? 0;

  return {
    date: date || todayKey,
    meals: todayMeals,
    checkins: [] as HungerCheckin[],
    nutrition,
    water,
    weight,
  };
}

/** Water summary from backend or local storage */
export async function loadWaterSummary(): Promise<{ dailyGoalMl: number; totalMl: number; remainingMl: number }> {
  try {
    const res = await apiFetch<{ dailyGoalMl: number; totalMl: number }>('/api/water-summary', {
      method: 'GET',
    });
    const goal = res?.dailyGoalMl ?? 2000;
    const total = res?.totalMl ?? 0;
    return { dailyGoalMl: goal, totalMl: total, remainingMl: goal - total };
  } catch {
    const goalVal = await readLocalSingle<number>('truediet.water_goal_ml');
    const totalVal = await readLocalSingle<number>('truediet.water.v1');
    const goal = goalVal ?? 2000;
    const total = totalVal !== undefined && totalVal !== null ? Number(totalVal) : 0;
    return { dailyGoalMl: goal, totalMl: total, remainingMl: goal - total };
  }
}

/** Load the latest weight entry */
async function loadLatestWeight(): Promise<WeightEntry | null> {
  try {
    const entries = await loadWeights();
    if (!entries.length) return null;
    return entries[0];
  } catch {
    return null;
  }
}

/** Add a water entry */
export async function addWater(amountMl: number): Promise<WeightEntry | null> {
  try {
    const res = await apiFetch<{ entry: WeightEntry }>('/api/water', {
      method: 'POST',
      body: { amountMl },
    });
    return res?.entry ?? null;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const now = new Date().toISOString();
    const entry: WeightEntry = {
      id: localId(),
      userId: 'local',
      weight: String(amountMl),
      recordedAt: now,
      createdAt: now,
    };
    const items = await readLocal<WeightEntry>('truediet.weights.v1');
    items.unshift(entry);
    await writeLocal('truediet.weights.v1', items);
    return entry;
  }
}

/** Edit a water entry */
export async function editWaterEntry(id: string, amountMl: number): Promise<void> {
  try {
    await apiFetch(`/api/water/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { amountMl },
    });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<WeightEntry>('truediet.weights.v1');
    const found = items.find(function (w): w is WeightEntry { return w.id === id; });
    if (found) {
      found.weight = String(amountMl);
    }
    await writeLocal('truediet.weights.v1', items);
  }
}

/** Delete a water entry */
export async function deleteWaterEntry(id: string): Promise<void> {
  try {
    await apiFetch(`/api/water/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<WeightEntry>('truediet.weights.v1');
    await writeLocal('truediet.weights.v1', items.filter(function (w): w is WeightEntry { return w.id !== id; }));
  }
}

/** Load voice transcriptions */
export async function loadVoiceTranscriptions(): Promise<{ id: string; text: string; status: string }[]> {
  try {
    const res = await apiFetch<{ transcriptions: { id: string; text: string; status: string }[] }>('/api/voice-transcriptions', {
      method: 'GET',
    });
    return res?.transcriptions ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocalSingle<{ id: string; text: string; status: string }>('truediet.voice.v1');
    return items ? [items] : [];
  }
}

/** Remove a voice transcription */
export async function removeVoiceTranscription(id: string): Promise<void> {
  try {
    await apiFetch(`/api/voice-transcriptions/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal<{ id: string; status: string }>('truediet.voice.v1');
    await writeLocal('truediet.voice.v1', items.filter(function (t): t is { id: string; status: string } { return t.id !== id; }));
  }
}

/** Load tracking settings from backend */
export async function loadTrackingSettings(): Promise<{ waterGoalMl: number; weightGoal: string | null }> {
  try {
    const res = await apiFetch<{ waterGoalMl: number; weightGoal: string | null }>('/api/tracking-settings', { method: 'GET' });
    return res;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const goalVal = await readLocalSingle<number>('truediet.water_goal_ml');
    const weightVal = await readLocalSingle<string>('truediet.weight_goal');
    return { waterGoalMl: goalVal ?? 2000, weightGoal: weightVal ?? null };
  }
}

/** Save tracking settings to backend and local storage */
export async function saveTrackingSettings(settings: { waterGoalMl: number; weightGoal: string | null }): Promise<void> {
  try {
    await apiFetch('/api/tracking-settings', {
      method: 'POST',
      body: settings,
    });
    await writeLocal('truediet.water_goal_ml', [settings.waterGoalMl]);
    if (settings.weightGoal) {
      await writeLocal('truediet.weight_goal', [settings.weightGoal]);
    }
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    await writeLocal('truediet.water_goal_ml', [settings.waterGoalMl]);
    if (settings.weightGoal) {
      await writeLocal('truediet.weight_goal', [settings.weightGoal]);
    }
  }
}

export default {
  loadMeals,
  addMeal,
  removeMeal,
  loadCheckins,
  addCheckin,
  loadWeights,
  addWeight,
  removeWeight,
  loadProgress,
  loadDailyProgress,
  loadWaterSummary,
  addWater,
  editWaterEntry,
  deleteWaterEntry,
  loadVoiceTranscriptions,
  removeVoiceTranscription,
  loadTrackingSettings,
  saveTrackingSettings,
};