import { apiFetch } from './api-client';

export interface StreamConfigResponse {
  configured: boolean;
  apiKey?: string;
  appId?: string;
}

export interface StreamCallResponse {
  callId: string;
  callType: string;
  callMode: 'video' | 'phone';
  token: string;
  userId: string;
  dietitianUserId: string;
  apiKey?: string;
}

export interface StreamTokenResponse {
  token: string;
  userId: string;
  apiKey?: string;
}

export async function getStreamConfig(): Promise<StreamConfigResponse> {
  return apiFetch<StreamConfigResponse>('/api/stream/config', { method: 'GET' });
}

/**
 * Creates (or re-joins) a call and returns a fresh user token.
 * Passing an existing `callId` is idempotent, so a patient can rejoin the
 * same room later using the id stored with the appointment.
 */
export async function createStreamCall(params?: {
  callId?: string;
  callType?: string;
  callMode?: 'video' | 'phone';
}): Promise<StreamCallResponse> {
  return apiFetch<StreamCallResponse>('/api/stream/call', {
    method: 'POST',
    body: params || {},
  });
}

export async function getStreamToken(): Promise<StreamTokenResponse> {
  return apiFetch<StreamTokenResponse>('/api/stream/token', { method: 'POST', body: {} });
}
