/**
 * ResourceHub interactive member tools.
 *
 * Each screen talks to /api/resource/* through src/lib/resourceHub.ts. Rows
 * are per-user data, so every screen shows its own loading/error state and a
 * sign-in hint when the API answers 401 (apiFetch already clears the session
 * in that case).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, CalendarDays, Check, ChevronRight, FileText, ListChecks, Plus, ShoppingCart, Sparkles, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import {
  MealPlanSummary, MealPlanDetail as MealPlanDetailType, GroceryListSummary, GroceryListDetail as GroceryListDetailType,
  WorksheetSummary, WorksheetDetail as WorksheetDetailType, ChecklistSummary, ChecklistDetail as ChecklistDetailType,
  ResourceTemplate, ResourceProgressItem,
  listMealPlans, createMealPlan, getMealPlan, deleteMealPlan, saveMealPlanEntry, removeMealPlanEntry,
  generateGroceryListFromPlan,
  listGroceryLists, createGroceryList, getGroceryList, deleteGroceryList, addGroceryItem, updateGroceryItem,
  removeGroceryItem, clearCheckedGroceryItems,
  listWorksheets, getWorksheet, saveWorksheetAnswers,
  listChecklists, getChecklist, toggleChecklistItem,
  listTemplates, listProgress, completeResource,
} from '../../lib/resourceHub';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Shell({ navigation, children, title }: { navigation: any; children: React.ReactNode; title: string }) {
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={6}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>RESOURCE HUB</Text>
        <Text style={s.title}>{title}</Text>
        {children}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Status({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.deepTeal} /></View>;
  if (error) return <Text style={s.error}>{error}</Text>;
  return null;
}

function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : 'Something went wrong.';
  if (/unauthorized|401/i.test(message)) return 'Please sign in to use this feature.';
  return message;
}

function Empty({ text }: { text: string }) {
  return <View style={s.empty}><Text style={s.emptyText}>{text}</Text></View>;
}

// ================================================================ Meal plans

export function MealPlansScreen({ navigation }: { navigation: any }) {
  const [plans, setPlans] = useState<MealPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setPlans(await listMealPlans()); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const create = async () => {
    const planName = name.trim();
    if (!planName || creating) return;
    setCreating(true);
    try {
      const plan = await createMealPlan(planName);
      setName('');
      navigation.navigate('MealPlanDetail', { id: plan.id });
    } catch (e) { Alert.alert('Could not create plan', friendlyError(e)); }
    finally { setCreating(false); }
  };

  return (
    <Shell navigation={navigation} title="My Meal Plans">
      <Text style={s.copy}>Plan a week of balanced meals and turn it into a grocery list in one tap.</Text>
      <View style={s.addRow}>
        <TextInput value={name} onChangeText={setName} placeholder="New plan name (e.g. Week of Nov 17)" placeholderTextColor={colors.muted} style={s.inputGrow} onSubmitEditing={create} />
        <Pressable style={[s.addBtn, creating && { opacity: 0.6 }]} onPress={create} disabled={creating || !name.trim()}>
          {creating ? <ActivityIndicator color="#fff" /> : <Plus size={18} color="#fff" />}
        </Pressable>
      </View>
      <Status loading={loading} error={error} />
      {!loading && !error && plans.length === 0 && <Empty text="No plans yet. Create your first weekly plan." />}
      {plans.map((p) => (
        <Pressable key={p.id} style={s.card} onPress={() => navigation.navigate('MealPlanDetail', { id: p.id })}>
          <View style={s.cardIcon}><CalendarDays size={20} color={colors.deepTeal} /></View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{p.name}</Text>
            <Text style={s.cardSub}>{p.entryCount} meals planned - {p.durationDays}-day plan</Text>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
      ))}
    </Shell>
  );
}

export function MealPlanDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const id: string = route?.params?.id;
  const [plan, setPlan] = useState<MealPlanDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slot, setSlot] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [titleText, setTitleText] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [savingSlot, setSavingSlot] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setPlan(await getMealPlan(id)); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const entryFor = (dayIndex: number, mealType: string) => plan?.entries.find((en) => en.dayIndex === dayIndex && en.mealType === mealType);

  const openSlot = (dayIndex: number, mealType: string) => {
    const existing = entryFor(dayIndex, mealType);
    setSlot({ dayIndex, mealType });
    setTitleText(existing?.title ?? '');
    setItemsText(existing?.items.join(', ') ?? '');
  };

  const saveSlot = async () => {
    if (!slot || !titleText.trim()) return;
    setSavingSlot(true);
    try {
      await saveMealPlanEntry(id, {
        dayIndex: slot.dayIndex,
        mealType: slot.mealType,
        title: titleText.trim(),
        items: itemsText.split(',').map((x) => x.trim()).filter(Boolean),
      });
      setSlot(null);
      await load();
    } catch (e) { Alert.alert('Could not save meal', friendlyError(e)); }
    finally { setSavingSlot(false); }
  };

  const clearSlot = async (entryId: string) => {
    Alert.alert('Remove meal', 'Remove this meal from the plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { try { await removeMealPlanEntry(id, entryId); await load(); } catch (e) { Alert.alert('Could not remove', friendlyError(e)); } } },
    ]);
  };

  const makeGroceryList = async () => {
    try {
      const list = await generateGroceryListFromPlan(id);
      navigation.navigate('GroceryListDetail', { id: list.id });
    } catch (e) { Alert.alert('Grocery list', friendlyError(e)); }
  };

  const remove = () => {
    Alert.alert('Delete plan', 'Delete this meal plan and all its meals?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteMealPlan(id); navigation.goBack(); } catch (e) { Alert.alert('Could not delete', friendlyError(e)); } } },
    ]);
  };

  return (
    <Shell navigation={navigation} title={plan?.name ?? 'Meal Plan'}>
      <Status loading={loading} error={error} />
      {!loading && plan && (
        <>
          <View style={s.rowActions}>
            <Pressable style={s.secondary} onPress={makeGroceryList}><ShoppingCart size={16} color={colors.deepTeal} /><Text style={s.secondaryText}>Make Grocery List</Text></Pressable>
            <Pressable style={s.danger} onPress={remove}><Trash2 size={16} color={colors.red} /><Text style={s.dangerText}>Delete Plan</Text></Pressable>
          </View>
          {slot && (
            <View style={s.editPanel}>
              <Text style={s.label}>{slot.mealType} - day {slot.dayIndex + 1}</Text>
              <Text style={s.label}>Meal</Text>
              <TextInput value={titleText} onChangeText={setTitleText} placeholder="e.g. Oats, yogurt and berries" placeholderTextColor={colors.muted} style={s.input} />
              <Text style={s.label}>Ingredients (comma separated - feeds the grocery list)</Text>
              <TextInput value={itemsText} onChangeText={setItemsText} placeholder="e.g. oats, greek yogurt, berries" placeholderTextColor={colors.muted} style={s.input} multiline />
              <Pressable style={[s.primary, (!titleText.trim() || savingSlot) && s.primaryDisabled]} disabled={!titleText.trim() || savingSlot} onPress={saveSlot}>
                {savingSlot ? <ActivityIndicator color="#fff" /> : <><Check size={18} color="#fff" /><Text style={s.primaryText}>Save Meal</Text></>}
              </Pressable>
              <Pressable style={s.textButton} onPress={() => setSlot(null)}><Text style={s.textButtonText}>Cancel</Text></Pressable>
            </View>
          )}
          {Array.from({ length: plan.durationDays }).map((_, dayIndex) => (
            <View key={dayIndex} style={s.dayBlock}>
              <Text style={s.dayTitle}>Day {dayIndex + 1}{dayIndex < 7 ? ` - ${DAY_LABELS[dayIndex]}` : ''}</Text>
              {MEAL_TYPES.map((mealType) => {
                const entry = entryFor(dayIndex, mealType);
                return (
                  <View key={mealType} style={s.slotRow}>
                    <Pressable style={s.slotMain} onPress={() => openSlot(dayIndex, mealType)}>
                      <Text style={s.slotType}>{mealType}</Text>
                      <Text style={entry ? s.slotTitle : s.slotEmpty}>{entry ? entry.title : 'Add a meal'}</Text>
                      {entry && entry.items.length > 0 && <Text style={s.slotItems}>{entry.items.join(' - ')}</Text>}
                    </Pressable>
                    {entry ? <Pressable onPress={() => clearSlot(entry.id)} hitSlop={8} accessibilityLabel="Remove meal"><Trash2 size={16} color={colors.muted} /></Pressable> : null}
                  </View>
                );
              })}
            </View>
          ))}
        </>
      )}
    </Shell>
  );
}

// =============================================================== Grocery lists

export function GroceryListsScreen({ navigation }: { navigation: any }) {
  const [lists, setLists] = useState<GroceryListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setLists(await listGroceryLists()); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const create = async () => {
    if (!name.trim()) return;
    try {
      const list = await createGroceryList(name.trim());
      setName('');
      navigation.navigate('GroceryListDetail', { id: list.id });
    } catch (e) { Alert.alert('Could not create list', friendlyError(e)); }
  };

  return (
    <Shell navigation={navigation} title="Grocery Lists">
      <Text style={s.copy}>Build lists by hand or straight from a meal plan. Check items off as you shop.</Text>
      <View style={s.addRow}>
        <TextInput value={name} onChangeText={setName} placeholder="New list name (e.g. This week)" placeholderTextColor={colors.muted} style={s.inputGrow} />
        <Pressable style={s.addBtn} onPress={create} disabled={!name.trim()}><Plus size={18} color="#fff" /></Pressable>
      </View>
      <Status loading={loading} error={error} />
      {!loading && !error && lists.length === 0 && <Empty text="No grocery lists yet." />}
      {lists.map((l) => (
        <Pressable key={l.id} style={s.card} onPress={() => navigation.navigate('GroceryListDetail', { id: l.id })}>
          <View style={s.cardIcon}><ShoppingCart size={20} color={colors.deepTeal} /></View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{l.name}</Text>
            <Text style={s.cardSub}>{l.purchasedCount}/{l.itemCount} picked up</Text>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
      ))}
    </Shell>
  );
}

export function GroceryListDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const id: string = route?.params?.id;
  const [list, setList] = useState<GroceryListDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itemName, setItemName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setList(await getGroceryList(id)); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const addItem = async () => {
    const name = itemName.trim();
    if (!name) return;
    setBusy(true);
    try { await addGroceryItem(id, { name }); setItemName(''); await load(); }
    catch (e) { Alert.alert('Could not add item', friendlyError(e)); }
    finally { setBusy(false); }
  };

  const toggle = async (itemId: string, purchased: boolean) => {
    setBusy(true);
    try { await updateGroceryItem(id, itemId, { purchased }); setList((prev) => prev ? { ...prev, items: prev.items.map((it) => it.id === itemId ? { ...it, purchased } : it) } : prev); }
    catch (e) { Alert.alert('Could not update', friendlyError(e)); }
    finally { setBusy(false); }
  };

  const removeItem = (itemId: string) => {
    Alert.alert('Remove item', 'Remove this item from the list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { try { await removeGroceryItem(id, itemId); await load(); } catch (e) { Alert.alert('Could not remove', friendlyError(e)); } } },
    ]);
  };

  const clearChecked = async () => {
    try { await clearCheckedGroceryItems(id); await load(); }
    catch (e) { Alert.alert('Could not clear', friendlyError(e)); }
  };

  const purchased = list?.items.filter((i) => i.purchased).length ?? 0;

  return (
    <Shell navigation={navigation} title={list?.name ?? 'Grocery List'}>
      <Status loading={loading} error={error} />
      {!loading && list && (
        <>
          <Text style={s.copy}>{purchased} of {list.items.length} items checked off</Text>
          <View style={s.addRow}>
            <TextInput value={itemName} onChangeText={setItemName} placeholder="Add an item (e.g. 1kg chicken breast)" placeholderTextColor={colors.muted} style={s.inputGrow} onSubmitEditing={addItem} />
            <Pressable style={s.addBtn} onPress={addItem} disabled={busy || !itemName.trim()}><Plus size={18} color="#fff" /></Pressable>
          </View>
          {list.items.length === 0 && <Empty text="Nothing here yet - add items above or generate from a meal plan." />}
          {list.items.map((item) => (
            <View key={item.id} style={s.checkRow}>
              <Pressable style={[s.checkbox, item.purchased && s.checkboxOn]} onPress={() => toggle(item.id, !item.purchased)} accessibilityRole="checkbox" accessibilityState={{ checked: item.purchased }}>
                {item.purchased ? <Check size={14} color="#fff" /> : null}
              </Pressable>
              <Text style={[s.checkLabel, item.purchased && s.checkLabelDone]}>{item.name}</Text>
              <Pressable onPress={() => removeItem(item.id)} hitSlop={8} accessibilityLabel={`Remove ${item.name}`}><Trash2 size={16} color={colors.muted} /></Pressable>
            </View>
          ))}
          {purchased > 0 && (
            <Pressable style={s.textButton} onPress={clearChecked}><Text style={s.textButtonText}>Clear checked items</Text></Pressable>
          )}
          <Pressable style={s.dangerWide} onPress={() => Alert.alert('Delete list', 'Delete this whole list?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteGroceryList(id); navigation.goBack(); } catch (e) { Alert.alert('Could not delete', friendlyError(e)); } } },
          ])}><Trash2 size={16} color={colors.red} /><Text style={s.dangerText}>Delete list</Text></Pressable>
        </>
      )}
    </Shell>
  );
}

// ================================================================= Worksheets

export function WorksheetsScreen({ navigation }: { navigation: any }) {
  const [sheets, setSheets] = useState<WorksheetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setSheets(await listWorksheets()); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <Shell navigation={navigation} title="Worksheets">
      <Text style={s.copy}>Short guided exercises you can fill in right here - five to ten minutes each.</Text>
      <Status loading={loading} error={error} />
      {!loading && !error && sheets.length === 0 && <Empty text="No worksheets are published yet." />}
      {sheets.map((w) => (
        <Pressable key={w.slug} style={s.card} onPress={() => navigation.navigate('WorksheetDetail', { slug: w.slug })}>
          <View style={s.cardIcon}><FileText size={20} color={colors.deepTeal} /></View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{w.title}</Text>
            <Text style={s.cardSub}>{w.description}</Text>
            {w.completed ? <Text style={s.badgeDone}>Completed</Text> : w.started ? <Text style={s.badgeDraft}>In progress</Text> : null}
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
      ))}
    </Shell>
  );
}

export function WorksheetDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const slug: string = route?.params?.slug;
  const [sheet, setSheet] = useState<WorksheetDetailType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<'draft' | 'complete' | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getWorksheet(slug)
      .then((w) => { if (active) { setSheet(w); setAnswers(w.answers ?? {}); } })
      .catch((e) => { if (active) setError(friendlyError(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const save = async (completed: boolean) => {
    setSaving(completed ? 'complete' : 'draft');
    try {
      await saveWorksheetAnswers(slug, answers, completed);
      if (completed) navigation.goBack();
      else Alert.alert('Saved', 'Your answers are saved. Come back any time.');
    } catch (e) { Alert.alert('Could not save', friendlyError(e)); }
    finally { setSaving(null); }
  };

  return (
    <Shell navigation={navigation} title={sheet?.title ?? 'Worksheet'}>
      <Status loading={loading} error={error} />
      {!loading && sheet && (
        <>
          {sheet.intro ? <Text style={s.copy}>{sheet.intro}</Text> : null}
          {sheet.instructions ? <View style={s.notice}><Text style={s.noticeText}>{sheet.instructions}</Text></View> : null}
          {sheet.fields.map((field) => (
            <View key={field.key} style={s.fieldBlock}>
              <Text style={s.label}>{field.label}</Text>
              {field.type === 'select' && field.options?.length ? (
                <View style={s.chips}>
                  {field.options.map((option) => (
                    <Pressable key={option} style={[s.chip, answers[field.key] === option && s.chipOn]} onPress={() => setAnswers((prev) => ({ ...prev, [field.key]: option }))}>
                      <Text style={[s.chipText, answers[field.key] === option && s.chipTextOn]}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <TextInput
                  value={answers[field.key] ?? ''}
                  onChangeText={(text) => setAnswers((prev) => ({ ...prev, [field.key]: text }))}
                  placeholder={field.placeholder ?? ''}
                  placeholderTextColor={colors.muted}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  multiline={field.type === 'textarea'}
                  style={[s.input, field.type === 'textarea' && s.inputArea]}
                />
              )}
            </View>
          ))}
          <Pressable style={s.primary} disabled={saving !== null} onPress={() => save(true)}>
            {saving === 'complete' ? <ActivityIndicator color="#fff" /> : <><Check size={18} color="#fff" /><Text style={s.primaryText}>{sheet.completed ? 'Update & Mark Complete' : 'Mark Complete'}</Text></>}
          </Pressable>
          <Pressable style={s.textButton} disabled={saving !== null} onPress={() => save(false)}>
            <Text style={s.textButtonText}>{saving === 'draft' ? 'Saving...' : 'Save draft'}</Text>
          </Pressable>
        </>
      )}
    </Shell>
  );
}

// ================================================================ Checklists

export function ChecklistsScreen({ navigation }: { navigation: any }) {
  const [items, setItems] = useState<ChecklistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await listChecklists()); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <Shell navigation={navigation} title="Checklists">
      <Text style={s.copy}>Quick repeating routines - your ticks are saved per checklist and reset-ready.</Text>
      <Status loading={loading} error={error} />
      {!loading && !error && items.length === 0 && <Empty text="No checklists are published yet." />}
      {items.map((cl) => {
        const pct = cl.total ? Math.round((cl.checkedCount / cl.total) * 100) : 0;
        return (
          <Pressable key={cl.slug} style={s.card} onPress={() => navigation.navigate('ChecklistDetail', { slug: cl.slug })}>
            <View style={s.cardIcon}><ListChecks size={20} color={colors.deepTeal} /></View>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>{cl.title}</Text>
              <Text style={s.cardSub}>{cl.checkedCount}/{cl.total} done</Text>
              <View style={s.progressTrack}><View style={[s.progressFill, { width: `${pct}%` }]} /></View>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        );
      })}
    </Shell>
  );
}

export function ChecklistDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const slug: string = route?.params?.slug;
  const [cl, setCl] = useState<ChecklistDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setCl(await getChecklist(slug)); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, [slug]);
  useEffect(() => { void load(); }, [load]);

  const toggle = async (key: string) => {
    const next = !cl?.checked[key];
    setBusyKey(key);
    try {
      const checked = await toggleChecklistItem(slug, key, next);
      setCl((prev) => (prev ? { ...prev, checked } : prev));
    } catch (e) { Alert.alert('Could not update', friendlyError(e)); }
    finally { setBusyKey(''); }
  };

  const reset = () => {
    Alert.alert('Reset checklist', 'Un-tick every item for a fresh round?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        try {
          for (const item of cl?.items ?? []) { if (cl?.checked[item.key]) await toggleChecklistItem(slug, item.key, false); }
          await load();
        } catch (e) { Alert.alert('Could not reset', friendlyError(e)); }
      } },
    ]);
  };

  return (
    <Shell navigation={navigation} title={cl?.title ?? 'Checklist'}>
      <Status loading={loading} error={error} />
      {!loading && cl && (
        <>
          {cl.description ? <Text style={s.copy}>{cl.description}</Text> : null}
          {cl.items.map((item) => {
            const isChecked = Boolean(cl.checked[item.key]);
            return (
              <Pressable key={item.key} style={s.checkRow} onPress={() => toggle(item.key)} disabled={busyKey === item.key}>
                <View style={[s.checkbox, isChecked && s.checkboxOn]}>{isChecked ? <Check size={14} color="#fff" /> : null}</View>
                <Text style={[s.checkLabel, isChecked && s.checkLabelDone]}>{item.label}</Text>
              </Pressable>
            );
          })}
          <Pressable style={s.textButton} onPress={reset}><Text style={s.textButtonText}>Start over</Text></Pressable>
        </>
      )}
    </Shell>
  );
}

// ================================================================== Templates

export function TemplatesScreen({ navigation }: { navigation: any }) {
  const [templates, setTemplates] = useState<ResourceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setTemplates(await listTemplates()); } catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const useAction = (value?: string) => {
    if (value === 'meal-planner') navigation.navigate('MealPlans');
    else if (value === 'grocery-list') navigation.navigate('GroceryLists');
    else if (value === 'reference-plate') navigation.navigate('NutritionReference');
  };

  return (
    <Shell navigation={navigation} title="Templates">
      <Text style={s.copy}>Ready-made structures you can use in the app or print and stick on the fridge.</Text>
      <Status loading={loading} error={error} />
      {!loading && !error && templates.length === 0 && <Empty text="No templates are published yet." />}
      {templates.map((t) => (
        <View key={t.slug} style={s.cardStatic}>
          <Text style={s.label}>{t.category.toUpperCase()}</Text>
          <Text style={s.cardTitle}>{t.title}</Text>
          <Text style={s.cardSub}>{t.description}</Text>
          {t.fields.filter((f) => f.type === 'static').map((f) => (
            <View key={f.key} style={s.specRow}><Text style={s.specLabel}>{f.label}</Text><Text style={s.specValue}>{f.value}</Text></View>
          ))}
          {t.fields.filter((f) => f.type === 'action').map((f) => (
            <Pressable key={f.key} style={s.secondaryWide} onPress={() => useAction(f.value)}>
              <Sparkles size={16} color={colors.deepTeal} /><Text style={s.secondaryText}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </Shell>
  );
}

// ============================================================== My resources

export function MyResourcesScreen({ navigation }: { navigation: any }) {
  const [progress, setProgress] = useState<ResourceProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const res = await listProgress(); setProgress(res.items); }
    catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const continueItems = progress.filter((p) => !p.completed);
  const completedItems = progress.filter((p) => p.completed);

  const finish = async (slug: string) => {
    try { await completeResource(slug); await load(); }
    catch (e) { Alert.alert('Could not update', friendlyError(e)); }
  };

  return (
    <Shell navigation={navigation} title="My Resources">
      <Text style={s.copy}>Everything you are working through, in one place.</Text>

      <View style={s.toolGrid}>
        <Pressable style={s.toolTile} onPress={() => navigation.navigate('MealPlans')}><CalendarDays size={22} color={colors.deepTeal} /><Text style={s.toolTileText}>Meal Plans</Text></Pressable>
        <Pressable style={s.toolTile} onPress={() => navigation.navigate('GroceryLists')}><ShoppingCart size={22} color={colors.deepTeal} /><Text style={s.toolTileText}>Grocery Lists</Text></Pressable>
        <Pressable style={s.toolTile} onPress={() => navigation.navigate('Worksheets')}><FileText size={22} color={colors.deepTeal} /><Text style={s.toolTileText}>Worksheets</Text></Pressable>
        <Pressable style={s.toolTile} onPress={() => navigation.navigate('Checklists')}><ListChecks size={22} color={colors.deepTeal} /><Text style={s.toolTileText}>Checklists</Text></Pressable>
        <Pressable style={s.toolTile} onPress={() => navigation.navigate('ResourceTemplates')}><Sparkles size={22} color={colors.deepTeal} /><Text style={s.toolTileText}>Templates</Text></Pressable>
        <Pressable style={s.toolTile} onPress={() => navigation.navigate('SavedContent')}><ChevronRight size={22} color={colors.deepTeal} /><Text style={s.toolTileText}>Saved</Text></Pressable>
      </View>

      <Status loading={loading} error={error} />

      {!loading && !error && (
        <>
          <Text style={s.sectionTitle}>Continue where you left off</Text>
          {continueItems.length === 0 && <Empty text="Open a guide or resource and it will show up here." />}
          {continueItems.map((p) => (
            <View key={p.slug} style={s.checkRow}>
              <Pressable style={s.slotMain} onPress={() => navigation.navigate('ResourceDetail', { slug: p.slug })}>
                <Text style={s.cardTitle}>{p.title}</Text>
                <Text style={s.cardSub}>{p.progress}% explored</Text>
              </Pressable>
              <Pressable onPress={() => finish(p.slug)} hitSlop={8} accessibilityLabel={`Mark ${p.title} complete`}><Check size={18} color={colors.green} /></Pressable>
            </View>
          ))}

          {completedItems.length > 0 && (<><Text style={s.sectionTitle}>Completed</Text>{completedItems.map((p) => (
            <Pressable key={p.slug} style={s.card} onPress={() => navigation.navigate('ResourceDetail', { slug: p.slug })}>
              <View style={s.cardBody}><Text style={s.cardTitle}>{p.title}</Text><Text style={s.badgeDone}>Completed</Text></View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          ))}</>
          )}
        </>
      )}
    </Shell>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  kav: { flex: 1, width: '100%' },
  content: { padding: 20, paddingBottom: 48, maxWidth: CONTENT_MAX_WIDTH, width: '100%', alignSelf: 'center' },
  back: { alignSelf: 'flex-start', padding: 4, marginLeft: -4, marginBottom: 8 },
  eyebrow: { color: colors.muted, fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 4 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  copy: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 14 },
  centered: { paddingVertical: 24, alignItems: 'center' },
  error: { color: colors.red, fontSize: 13, marginVertical: 10 },
  empty: { backgroundColor: colors.softGreen, borderRadius: 12, padding: 16, marginVertical: 8 },
  emptyText: { color: colors.deepTeal, fontSize: 13 },
  primary: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.deepTeal, borderRadius: 12, paddingVertical: 13, marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  primaryDisabled: { opacity: 0.55 },
  secondary: { flexDirection: 'row', gap: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.deepTeal, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 },
  secondaryText: { color: colors.deepTeal, fontWeight: '700', fontSize: 13 },
  secondaryWide: { alignSelf: 'stretch', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.deepTeal, borderRadius: 10, paddingVertical: 10, marginTop: 10 },
  danger: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dangerWide: { alignSelf: 'flex-start', flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 18 },
  dangerText: { color: colors.red, fontWeight: '700', fontSize: 13 },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, gap: 14, alignItems: 'center', marginVertical: 10 },
  textButton: { alignSelf: 'center', paddingVertical: 10, marginTop: 6 },
  textButtonText: { color: colors.deepTeal, fontWeight: '700', fontSize: 13 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginTop: 10 },
  cardStatic: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginTop: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  cardSub: { color: colors.textSecondary, fontSize: 12.5 },
  badgeDone: { color: colors.green, fontWeight: '700', fontSize: 11.5, marginTop: 2 },
  badgeDraft: { color: colors.orange, fontWeight: '700', fontSize: 11.5, marginTop: 2 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 14, backgroundColor: colors.surface },
  inputArea: { minHeight: 72, textAlignVertical: 'top' },
  inputGrow: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 14 },
  addRow: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  addBtn: { width: 42, borderRadius: 10, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center' },
  dayBlock: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 14 },
  dayTitle: { color: colors.text, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  slotMain: { flex: 1, gap: 2 },
  slotType: { color: colors.muted, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8 },
  slotTitle: { color: colors.text, fontWeight: '600', fontSize: 14 },
  slotEmpty: { color: colors.deepTeal, fontSize: 13.5, fontWeight: '600' },
  slotItems: { color: colors.textSecondary, fontSize: 12 },
  editPanel: { borderWidth: 1, borderColor: colors.deepTeal, borderRadius: 14, padding: 14, marginTop: 16, gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.deepTeal },
  checkLabel: { flex: 1, color: colors.text, fontSize: 14 },
  checkLabelDone: { color: colors.muted, textDecorationLine: 'line-through' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { backgroundColor: colors.deepTeal, borderColor: colors.deepTeal },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  fieldBlock: { marginBottom: 14 },
  notice: { backgroundColor: colors.softOrange, borderRadius: 10, padding: 12, marginBottom: 14 },
  noticeText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.border, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: colors.green },
  specRow: { marginTop: 8 },
  specLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  specValue: { color: colors.text, fontSize: 13, marginTop: 2 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 12 },
  toolTile: { flexBasis: '30%', flexGrow: 1, minWidth: 96, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8 },
  toolTileText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  sectionTitle: { color: colors.text, fontWeight: '800', fontSize: 17, marginTop: 20, marginBottom: 2 },
});
