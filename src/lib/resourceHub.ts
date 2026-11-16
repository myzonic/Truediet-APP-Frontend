/**
 * ResourceHub member-data APIs.
 *
 * Thin typed wrappers over /api/resource/* for the interactive features:
 * meal plans, grocery lists, worksheets, checklists, templates and the
 * "continue where you left off" progress trail. All of these require the
 * bearer JWT, which apiFetch attaches automatically; when the session has
 * expired apiFetch also fires the unauthorized handler.
 */
import { apiFetch } from './api-client';

// ---------------------------------------------------------------- meal plans

export interface MealPlanSummary {
  id: string;
  name: string;
  startDate?: string;
  durationDays: number;
  notes?: string;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanEntry {
  id: string;
  dayIndex: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  description?: string;
  items: string[];
  notes?: string;
}

export interface MealPlanDetail extends Omit<MealPlanSummary, 'entryCount'> {
  entries: MealPlanEntry[];
}

export const listMealPlans = () =>
  apiFetch<{ items: MealPlanSummary[] }>('/api/resource/meal-plans').then((r) => r.items);

export const createMealPlan = (name: string, durationDays = 7) =>
  apiFetch<{ item: MealPlanDetail }>('/api/resource/meal-plans', {
    method: 'POST',
    body: { name, durationDays },
  }).then((r) => r.item);

export const getMealPlan = (id: string) =>
  apiFetch<{ item: MealPlanDetail }>(`/api/resource/meal-plans/${encodeURIComponent(id)}`).then((r) => r.item);

export const deleteMealPlan = (id: string) =>
  apiFetch(`/api/resource/meal-plans/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const saveMealPlanEntry = (
  planId: string,
  entry: { dayIndex: number; mealType: string; title: string; items?: string[]; description?: string }
) =>
  apiFetch<{ item: MealPlanEntry }>(`/api/resource/meal-plans/${encodeURIComponent(planId)}/entries`, {
    method: 'PUT',
    body: entry,
  }).then((r) => r.item);

export const removeMealPlanEntry = (planId: string, entryId: string) =>
  apiFetch(`/api/resource/meal-plans/${encodeURIComponent(planId)}/entries/${encodeURIComponent(entryId)}`, {
    method: 'DELETE',
  });

export const generateGroceryListFromPlan = (planId: string) =>
  apiFetch<{ item: GroceryListDetail }>(`/api/resource/meal-plans/${encodeURIComponent(planId)}/grocery-list`, {
    method: 'POST',
  }).then((r) => r.item);

// -------------------------------------------------------------- grocery lists

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  notes?: string;
  purchased: boolean;
  sortOrder: number;
}

export interface GroceryListSummary {
  id: string;
  name: string;
  notes?: string;
  itemCount: number;
  purchasedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryListDetail {
  id: string;
  name: string;
  notes?: string;
  items: GroceryItem[];
}

export const listGroceryLists = () =>
  apiFetch<{ items: GroceryListSummary[] }>('/api/resource/grocery-lists').then((r) => r.items);

export const createGroceryList = (name: string, items?: string[]) =>
  apiFetch<{ item: GroceryListDetail }>('/api/resource/grocery-lists', {
    method: 'POST',
    body: { name, items },
  }).then((r) => r.item);

export const getGroceryList = (id: string) =>
  apiFetch<{ item: GroceryListDetail }>(`/api/resource/grocery-lists/${encodeURIComponent(id)}`).then((r) => r.item);

export const deleteGroceryList = (id: string) =>
  apiFetch(`/api/resource/grocery-lists/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const addGroceryItem = (
  listId: string,
  item: { name: string; category?: string; quantity?: string; unit?: string }
) =>
  apiFetch<{ item: GroceryItem }>(`/api/resource/grocery-lists/${encodeURIComponent(listId)}/items`, {
    method: 'POST',
    body: item,
  }).then((r) => r.item);

export const updateGroceryItem = (
  listId: string,
  itemId: string,
  patch: { purchased?: boolean; quantity?: string; category?: string }
) =>
  apiFetch<{ item: GroceryItem }>(
    `/api/resource/grocery-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
    { method: 'PATCH', body: patch }
  ).then((r) => r.item);

export const removeGroceryItem = (listId: string, itemId: string) =>
  apiFetch(`/api/resource/grocery-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });

export const clearCheckedGroceryItems = (listId: string) =>
  apiFetch(`/api/resource/grocery-lists/${encodeURIComponent(listId)}/clear-checked`, { method: 'POST' });

// ---------------------------------------------------------------- worksheets

export interface WorksheetField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
}

export interface WorksheetSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  completed: boolean;
  started: boolean;
}

export interface WorksheetDetail extends Omit<WorksheetSummary, 'completed' | 'started'> {
  intro: string;
  instructions: string;
  fields: WorksheetField[];
  answers: Record<string, string>;
  completed: boolean;
}

export const listWorksheets = () =>
  apiFetch<{ items: WorksheetSummary[] }>('/api/resource/worksheets').then((r) => r.items);

export const getWorksheet = (slug: string) =>
  apiFetch<{ item: WorksheetDetail }>(`/api/resource/worksheets/${encodeURIComponent(slug)}`).then((r) => r.item);

export const saveWorksheetAnswers = (slug: string, answers: Record<string, string>, completed: boolean) =>
  apiFetch(`/api/resource/worksheets/${encodeURIComponent(slug)}/answers`, {
    method: 'PUT',
    body: { answers, completed },
  });

// ---------------------------------------------------------------- checklists

export interface ChecklistItemDef {
  key: string;
  label: string;
}

export interface ChecklistSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  items: ChecklistItemDef[];
  checkedCount: number;
  total: number;
}

export interface ChecklistDetail extends Omit<ChecklistSummary, 'checkedCount'> {
  checked: Record<string, boolean>;
}

export const listChecklists = () =>
  apiFetch<{ items: ChecklistSummary[] }>('/api/resource/checklists').then((r) => r.items);

export const getChecklist = (slug: string) =>
  apiFetch<{ item: ChecklistDetail }>(`/api/resource/checklists/${encodeURIComponent(slug)}`).then((r) => r.item);

export const toggleChecklistItem = (slug: string, key: string, checked: boolean) =>
  apiFetch<{ checked: Record<string, boolean> }>(`/api/resource/checklists/${encodeURIComponent(slug)}/toggle`, {
    method: 'POST',
    body: { key, checked },
  }).then((r) => r.checked);

// ---------------------------------------------------------------- templates

export interface TemplateField {
  key: string;
  label: string;
  type: string;
  value?: string;
  options?: string[];
}

export interface ResourceTemplate {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  fields: TemplateField[];
}

export const listTemplates = () =>
  apiFetch<{ items: ResourceTemplate[] }>('/api/resource/templates').then((r) => r.items);

// ----------------------------------------------------------------- progress

export interface ResourceProgressItem {
  slug: string;
  title: string;
  type: string;
  progress: number;
  completed: boolean;
  lastViewedAt: string;
}

export const listProgress = () =>
  apiFetch<{ items: ResourceProgressItem[]; continue: ResourceProgressItem[]; completed: ResourceProgressItem[] }>(
    '/api/resource/progress'
  );

/** Best effort: opening a resource bumps its "continue where you left off" entry. */
export async function recordResourceView(slug: string): Promise<void> {
  try {
    await apiFetch(`/api/resource/progress/${encodeURIComponent(slug)}`, { method: 'POST' });
  } catch {
    // anonymous member or offline - never block reading a resource
  }
}

/** Best effort: mark a resource finished from its detail screen. */
export async function completeResource(slug: string): Promise<void> {
  await apiFetch(`/api/resource/progress/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: { progress: 100 },
  });
}
