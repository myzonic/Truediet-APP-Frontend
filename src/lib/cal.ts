export interface CalConfig {
  configured: boolean;
  eventTypeId?: string | number;
  username?: string;
}

export interface CalSlot {
  time: string;
}

export interface CalBookingResult {
  id?: string | number;
  uid?: string;
  title?: string;
  startTime: string;
  endTime?: string;
  status?: string;
  meetingUrl?: string;
  metadata?: any;
}

export async function getCalConfig(): Promise<CalConfig> {
  const { apiFetch } = await import('./api-client');
  return apiFetch<CalConfig>('/api/cal/config', { method: 'GET' });
}

export async function getCalAvailableSlots(dateFrom: string, dateTo: string, eventTypeId?: string | number): Promise<{ slots: Record<string, CalSlot[]> }> {
  const { apiFetch } = await import('./api-client');
  const params = new URLSearchParams({ dateFrom, dateTo });
  if (eventTypeId) {
    params.set('eventTypeId', String(eventTypeId));
  }
  return apiFetch<{ slots: Record<string, CalSlot[]> }>(`/api/cal/slots?${params.toString()}`, { method: 'GET' });
}

export async function createCalBooking(payload: {
  eventTypeId: string | number;
  start: string;
  name?: string;
  email?: string;
  notes?: string;
  timeZone?: string;
}): Promise<CalBookingResult> {
  const { apiFetch } = await import('./api-client');
  return apiFetch<CalBookingResult>('/api/cal/bookings', {
    method: 'POST',
    body: payload,
  });
}
