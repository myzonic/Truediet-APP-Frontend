import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api-client';

export interface ContentSummary {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle: string;
  category?: string;
  isPremium: boolean;
  durationMinutes?: number;
  publishedAt: string;
  route: string;
  savedAt?: string;
  // Non-premium content ships its body with the list (single fetch); premium
  // bodies are only returned by the gated detail endpoint.
  body?: string;
  mediaUrl?: string;
  listenUrl?: string;
  episodeNumber?: number;
  startsAt?: string;
}

export interface SaveMeta {
  title?: string;
  subtitle?: string;
  route?: string;
  type?: string;
}

const SAVED_KEY = 'truediet.saved.v1';

async function readSaved(): Promise<ContentSummary[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSaved(items: ContentSummary[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode / quota)
  }
}

export async function loadContent(type?: string, q?: string): Promise<ContentSummary[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (q) params.set('q', q);
  // The whole library is small enough to fetch in one request, and the app
  // expects every item to be available locally once it has loaded.
  params.set('limit', '100');
  const suffix = params.toString();
  const res = await apiFetch<{ items: ContentSummary[] }>(
    `/api/content${suffix ? `?${suffix}` : ''}`,
    { method: 'GET' }
  );
  return res?.items ?? [];
}

export async function loadSavedContent(): Promise<ContentSummary[]> {
  const local = await readSaved();
  try {
    const res = await apiFetch<{ items: ContentSummary[] }>('/api/saved', { method: 'GET' });
    const merged = new Map<string, ContentSummary>();
    for (const item of res?.items ?? []) merged.set(item.id, item);
    for (const item of local) if (!merged.has(item.id)) merged.set(item.id, item);
    return Array.from(merged.values()).sort((a, b) =>
      String(b.savedAt || b.publishedAt).localeCompare(String(a.savedAt || a.publishedAt))
    );
  } catch (error) {
    return local;
  }
}

export async function saveContent(contentId: string, meta?: SaveMeta): Promise<void> {
  const existing = await readSaved();
  if (!existing.some((item) => item.id === contentId)) {
    const now = new Date().toISOString();
    const item: ContentSummary = {
      id: contentId,
      slug: contentId,
      type: meta?.type || 'article',
      title: meta?.title || contentId,
      subtitle: meta?.subtitle || '',
      isPremium: false,
      publishedAt: now,
      route: meta?.route || 'Article',
      savedAt: now,
    };
    await writeSaved([item, ...existing]);
  }
  try {
    // The metadata is sent so the server can create the content row for
    // content that only ships inside the app bundle.
    await apiFetch('/api/saved', {
      method: 'POST',
      body: {
        contentId,
        title: meta?.title,
        subtitle: meta?.subtitle,
        type: meta?.type,
      },
    });
  } catch (error) {
    // The server is the source of truth for saved content. If the save did
    // not reach it, the caller has to know so it can report a real failure
    // instead of showing a false success.
    throw new Error(
      error instanceof Error ? error.message : 'Could not save this item to your account.'
    );
  }
}

export async function unsaveContent(contentId: string): Promise<void> {
  const existing = await readSaved();
  await writeSaved(existing.filter((item) => item.id !== contentId));
  try {
    await apiFetch(`/api/saved/${encodeURIComponent(contentId)}`, { method: 'DELETE' });
  } catch (error) {
    // Surface the failure so the screen can restore the row and tell the user.
    throw error instanceof Error ? error : new Error('Could not remove this item from your account.');
  }
}
