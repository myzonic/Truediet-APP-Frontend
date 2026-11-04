import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api-client';

const STORAGE_KEY = 'truediet.activeAppointment';

export interface StoredAppointment {
  id?: string;
  slot: string;
  visitType: 'video' | 'phone';
  bookingId?: string | number;
  meetingUrl?: string;
  /** Video room id, needed to rejoin the video room in-app. */
  callId?: string;
  isoStart?: string;
  status?: string;
  savedAt: string;
}

export interface AppointmentInput {
  slot: string;
  visitType: 'video' | 'phone';
  bookingId?: string | number;
  meetingUrl?: string;
  callId?: string;
  isoStart?: string;
}

export async function saveAppointment(input: AppointmentInput): Promise<StoredAppointment> {
  // The appointment is stored on the server so it is available on any device
  // the member signs in from.
  const res = await apiFetch<{ appointment: any }>('/api/appointments', {
    method: 'POST',
    body: input,
  });

  const saved = res?.appointment ?? null;
  const appointment: StoredAppointment = {
    id: saved?.id,
    slot: input.slot,
    visitType: input.visitType,
    bookingId: input.bookingId ?? saved?.bookingId,
    meetingUrl: input.meetingUrl ?? saved?.meetingUrl,
    callId: input.callId ?? saved?.callId,
    isoStart: input.isoStart ?? saved?.isoStart,
    status: saved?.status,
    savedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointment));
  return appointment;
}

export async function cancelAppointment(id: string): Promise<void> {
  // Marks the row cancelled in PostgreSQL; /api/appointments/current then
  // stops returning it, so the app falls back to booking a new visit.
  await apiFetch<{ appointment: any }>(`/api/appointments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status: 'cancelled' },
  });
}

export async function loadAppointment(): Promise<StoredAppointment | null> {
  try {
    const res = await apiFetch<{ appointment: any }>('/api/appointments/current', { method: 'GET' });
    if (res?.appointment) {
      const appointment: StoredAppointment = {
        id: res.appointment.id,
        slot: res.appointment.slot,
        visitType: res.appointment.visitType === 'phone' ? 'phone' : 'video',
        bookingId: res.appointment.bookingId ?? undefined,
        meetingUrl: res.appointment.meetingUrl ?? undefined,
        callId: res.appointment.callId ?? undefined,
        isoStart: res.appointment.isoStart ?? undefined,
        status: res.appointment.status,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointment));
      return appointment;
    }
  } catch {
    // fall through to the local copy
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAppointment;
    return parsed && typeof parsed.slot === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export async function listAppointments(): Promise<StoredAppointment[]> {
  const res = await apiFetch<{ appointments: any[] }>('/api/appointments', { method: 'GET' });
  return (res?.appointments ?? []).map((row) => ({
    id: row.id,
    slot: row.slot,
    visitType: row.visitType === 'phone' ? 'phone' : 'video',
    bookingId: row.bookingId ?? undefined,
    meetingUrl: row.meetingUrl ?? undefined,
    callId: row.callId ?? undefined,
    isoStart: row.isoStart ?? undefined,
    status: row.status,
    savedAt: row.createdAt,
  }));
}

export async function clearAppointment(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
