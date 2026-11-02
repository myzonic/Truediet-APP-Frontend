import { apiFetch } from './api-client';

export interface Registration {
  id: string;
  title: string;
  slug: string;
  kind: 'webinar' | 'class';
  registeredAt: string;
}

export async function listRegistrations(): Promise<Registration[]> {
  const res = await apiFetch<{ registrations: Registration[] }>('/api/registrations', { method: 'GET' });
  return res?.registrations ?? [];
}

export async function registerForSession(input: {
  title: string;
  slug: string;
  kind?: 'webinar' | 'class';
}): Promise<Registration | null> {
  const res = await apiFetch<{ registration: Registration | null }>('/api/registrations', {
    method: 'POST',
    body: input,
  });
  return res?.registration ?? null;
}

export async function unregisterFromSession(slug: string): Promise<void> {
  await apiFetch(`/api/registrations/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}
