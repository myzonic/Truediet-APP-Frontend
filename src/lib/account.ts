import { apiFetch } from './api-client';

export async function exportAccountData(): Promise<any> {
  return apiFetch('/api/account/export', { method: 'GET' });
}

export async function deleteAccount(): Promise<void> {
  await apiFetch('/api/account', { method: 'DELETE' });
}
