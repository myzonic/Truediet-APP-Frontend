import { apiFetch } from './api-client';

export interface Plan {
  id: string;
  code: string;
  name: string;
  interval: string;
  priceCents: number | null;
  currency: string | null;
  features: string[];
}

export interface SubscriptionState {
  subscription: {
    status: string;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string | null;
    planId?: string | null;
  };
  entitlements: string[];
  paymentsConfigured: boolean;
}

export async function loadPlans(): Promise<{ plans: Plan[]; paymentsConfigured: boolean }> {
  return apiFetch('/api/plans', { method: 'GET' });
}

export async function loadSubscription(): Promise<SubscriptionState> {
  return apiFetch('/api/subscription', { method: 'GET' });
}

export async function startCheckout(planId: string): Promise<{ url?: string }> {
  return apiFetch('/api/subscription/checkout', { method: 'POST', body: { planId } });
}
