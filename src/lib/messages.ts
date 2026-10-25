import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api-client';

export interface DietitianMessage {
  id: string;
  threadId: string;
  authorType: 'user' | 'dietitian';
  body: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  userId: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
}

const MESSAGES_KEY = 'truediet.messages.v1';
const LOCAL_THREAD_ID = 'local-thread';

function isOfflineError(error: unknown): boolean {
  const message = String((error as any)?.message || '');
  return (
    error instanceof TypeError ||
    /failed to fetch|network request failed|load failed|networkerror/i.test(message)
  );
}

async function readLocal(): Promise<DietitianMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(MESSAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: DietitianMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode / quota)
  }
}

function localThread(messages: DietitianMessage[]): MessageThread {
  const last = messages[0]?.createdAt || new Date().toISOString();
  return {
    id: LOCAL_THREAD_ID,
    userId: 'local',
    status: 'local',
    lastMessageAt: last,
    createdAt: messages[messages.length - 1]?.createdAt || last,
  };
}

export async function sendMessage(body: string, threadId?: string): Promise<DietitianMessage> {
  try {
    const res = await apiFetch<{ message: DietitianMessage }>('/api/messages', {
      method: 'POST',
      body: { body, threadId },
    });
    return res.message;
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const message: DietitianMessage = {
      id: `local-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      threadId: threadId || LOCAL_THREAD_ID,
      authorType: 'user',
      body,
      createdAt: new Date().toISOString(),
    };
    const items = await readLocal();
    items.unshift(message);
    await writeLocal(items);
    return message;
  }
}

export async function loadThreads(): Promise<MessageThread[]> {
  try {
    const res = await apiFetch<{ threads: MessageThread[] }>('/api/messages/threads', { method: 'GET' });
    return res?.threads ?? [];
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal();
    return items.length ? [localThread(items)] : [];
  }
}

export async function loadThread(id: string): Promise<{ thread: MessageThread; messages: DietitianMessage[] }> {
  try {
    return await apiFetch(`/api/messages/threads/${id}`, { method: 'GET' });
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    const items = await readLocal();
    const messages = items.filter((m) => m.threadId === id || id === LOCAL_THREAD_ID).slice().reverse();
    return { thread: localThread(items), messages };
  }
}
