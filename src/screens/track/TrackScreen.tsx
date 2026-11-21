import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { useFocusEffect } from '@react-navigation/native';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Edit3,
  Mic,
  Plus,
  Sun,
  Trash2,
  TrendingUp,
  Utensils,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { dimensions, radius, spacing } from '../../theme/tokens';
import { useLayoutMetrics } from '../../theme/responsive';
import {
  addWater,
  loadMeals,
  loadProgress,
  loadWaterSummary,
  MealLog,
  MealType,
  Progress,
  removeMeal,
  updateMeal,
} from '../../lib/track';

const order: [MealType, string][] = [
  ['breakfast', 'Breakfast'],
  ['lunch', 'Lunch'],
  ['dinner', 'Dinner'],
  ['snack', 'Snack'],
];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function TrackScreen({ navigation }: any) {
  const [dayOffset, setDayOffset] = useState(0);
  const { gridItemWidth, gutter } = useLayoutMetrics();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [water, setWater] = useState<{ dailyGoalMl: number; totalMl: number }>({
    dailyGoalMl: 2000,
    totalMl: 0,
  });
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editType, setEditType] = useState<MealType>('breakfast');
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const selectedDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  })();
  const selectedKey = formatDateKey(selectedDate);
  const isToday = dayOffset === 0;

  const refresh = useCallback(async () => {
    // allSettled so one failed call does not hide the others, and so a failure
    // can be reported instead of silently rendering empty stats.
    const [p, m, w] = await Promise.allSettled([
      loadProgress(),
      loadMeals(selectedKey),
      loadWaterSummary(),
    ]);
    setProgress(p.status === 'fulfilled' ? p.value : null);
    setMeals(m.status === 'fulfilled' ? m.value : []);
    setWater(
      w.status === 'fulfilled'
        ? { dailyGoalMl: w.value.dailyGoalMl, totalMl: w.value.totalMl }
        : { dailyGoalMl: 2000, totalMl: 0 }
    );
    setLoadFailed([p, m, w].some((r) => r.status === 'rejected'));
  }, [selectedKey]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const rows = order.map(([type, label]) => {
    const count = meals.filter((m) => m.mealType === type).length;
    const logged = count > 0;
    return [
      type,
      label,
      logged ? `Logged${count > 1 ? ` (${count})` : ''}` : 'Not logged yet',
      logged,
    ] as [MealType, string, string, boolean];
  });

  const todayProgress = progress?.today;
  const stats: [string, string][] = [
    [String(isToday ? todayProgress?.meals ?? meals.length : meals.length), 'Meals'],
    [String(todayProgress?.checkins ?? 0), 'Check-ins'],
    [String(water.totalMl) + ' ml', 'Water today'],
    [String(progress?.week.meals ?? 0), 'Meals / wk'],
  ];

  const confirmRemove = (m: MealLog) => {
    Alert.alert('Remove meal', 'Delete this meal entry?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMeal(m.id);
            await refresh();
          } catch {
            Alert.alert('Could not delete', 'Please try again.');
          }
        },
      },
    ]);
  };

  const startEdit = (m: MealLog) => {
    setEditingMeal(m);
    setEditDesc(m.description);
    setEditNotes(m.notes || '');
    setEditType(m.mealType);
  };

  const saveEdit = async () => {
    if (!editingMeal || !editDesc.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await updateMeal(editingMeal.id, {
        mealType: editType,
        description: editDesc.trim(),
        notes: editNotes.trim(),
      });
      setEditingMeal(null);
      await refresh();
    } catch (e: any) {
      Alert.alert('Could not update meal', e?.message || 'Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const quickWater = async (ml: number) => {
    try {
      await addWater(ml);
      await refresh();
    } catch (e: any) {
      Alert.alert('Could not log water', e?.message || 'Please try again.');
    }
  };

  const waterPct = Math.min(100, Math.round((water.totalMl / Math.max(1, water.dailyGoalMl)) * 100));

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer>
        <ScreenHeader eyebrow="TRACK & FOOD DIARY" title="Your day at a glance." />
        <Text style={s.subtitle}>
          Notice patterns in your eating, hydration, hunger, and energy without turning nutrition into a numbers game.
        </Text>
        {loadFailed ? (
          <Text style={s.loadError}>
            Some of your tracking data could not be loaded. Switch to another day and back to try again.
          </Text>
        ) : null}

        {/* Day selector for Meal History */}
        <View style={s.dateRow}>
          <Pressable style={s.dayNavBtn} onPress={() => setDayOffset((d) => d - 1)} hitSlop={8} accessibilityLabel="Previous day">
            <ChevronLeft size={20} color={colors.deepTeal} />
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1, minWidth: 0, paddingHorizontal: 8 }}>
            <Text style={s.today} numberOfLines={1}>
              {isToday
                ? 'Today'
                : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={s.small} numberOfLines={1}>{selectedKey} · Food Diary</Text>
          </View>
          <Pressable
            style={[s.dayNavBtn, isToday && { opacity: 0.35 }]}
            disabled={isToday}
            onPress={() => setDayOffset((d) => Math.min(0, d + 1))}
            hitSlop={8}
            accessibilityLabel="Next day"
          >
            <ChevronRight size={20} color={colors.deepTeal} />
          </Pressable>
        </View>

        <View style={[s.grid, { gap: gutter }]}>
          {stats.map(([value, label]) => (
            <View key={label} style={[s.stat, { width: gridItemWidth(2) }]}>
              <Text style={s.statValue} numberOfLines={2}>{value}</Text>
              <Text style={s.small}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={s.primaryRow}>
          <Pressable style={[s.primary, { flex: 1 }]} onPress={() => navigation.navigate('MealLog')}>
            <Plus size={19} color="#fff" />
            <Text style={s.primaryText}>Log a Meal</Text>
          </Pressable>
          <Pressable
            style={[s.primary, { flex: 1, backgroundColor: colors.green }]}
            onPress={() => navigation.navigate('VoiceFoodLog')}
          >
            <Mic size={19} color="#fff" />
            <Text style={s.primaryText}>Voice Log</Text>
          </Pressable>
        </View>

        {/* Water Tracking */}
        <Text style={s.section}>Hydration Tracking</Text>
        <View style={s.waterCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Droplet size={20} color={colors.deepTeal} />
              <Text style={s.rowTitle}>
                {water.totalMl} / {water.dailyGoalMl} ml
              </Text>
            </View>
            <Text style={s.small}>{waterPct}% of daily goal</Text>
          </View>
          <View style={s.waterBarTrack}>
            <View style={[s.waterBarFill, { width: `${waterPct}%` }]} />
          </View>
          <PillGroup style={{ marginTop: 12 }}>
            {[250, 500, 750].map((ml) => (
              <Pill key={ml} label={`+ ${ml} ml`} tone="teal" onPress={() => quickWater(ml)} />
            ))}
          </PillGroup>
        </View>

        <Text style={s.section}>Daily Meal Pattern</Text>
        <View style={s.timeline}>
          {rows.map(([type, meal, detail, done]) => (
            <Pressable
              style={s.row}
              key={type}
              onPress={() => navigation.navigate('MealLog', { mealType: type })}
            >
              <View style={[s.status, done && s.statusDone]}>
                <Utensils size={16} color={done ? '#fff' : colors.muted} />
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTitle}>{meal}</Text>
                <Text style={s.small}>{detail}</Text>
              </View>
              {done ? <Text style={s.tick}>✓</Text> : <Plus size={16} color={colors.deepTeal} />}
            </Pressable>
          ))}
        </View>

        {meals.length > 0 ? (
          <>
            <Text style={s.section}>Food Diary Entries ({meals.length})</Text>
            <View style={s.timeline}>
              {meals.map((m) => {
                const label = order.find((o) => o[0] === m.mealType)?.[1] || m.mealType;
                const when = new Date(m.loggedAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                });
                return (
                  <View style={s.row} key={m.id}>
                    <View style={s.status}>
                      <Utensils size={16} color={colors.deepTeal} />
                    </View>
                    <View style={s.rowText}>
                      <Text style={s.rowTitle}>
                        {label} · {when} {m.source === 'voice' ? '🎙' : ''}
                      </Text>
                      <Text style={s.small}>{m.description}</Text>
                      {m.notes ? <Text style={[s.small, { color: colors.green }]}>{m.notes}</Text> : null}
                    </View>
                    <Pressable onPress={() => startEdit(m)} hitSlop={8} style={{ marginRight: 10 }} accessibilityLabel="Edit meal">
                      <Edit3 size={17} color={colors.deepTeal} />
                    </Pressable>
                    <Pressable onPress={() => confirmRemove(m)} hitSlop={8} accessibilityLabel="Delete meal">
                      <Trash2 size={17} color={colors.red} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        {editingMeal ? (
          <View style={s.editCard}>
            <Text style={s.rowTitle}>Edit Food Entry</Text>
            <PillGroup style={{ marginVertical: 8 }}>
              {order.map(([type, label]) => (
                <Pill
                  key={type}
                  label={label}
                  selected={editType === type}
                  onPress={() => setEditType(type)}
                />
              ))}
            </PillGroup>
            <TextInput
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
              placeholder="Food description"
              style={s.editInput}
            />
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Serving size / notes (optional)"
              style={[s.editInput, { minHeight: 44, marginTop: 8 }]}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable style={[s.primary, { flex: 1, marginTop: 0, minHeight: 46 }]} onPress={saveEdit} disabled={savingEdit}>
                <Text style={s.primaryText}>{savingEdit ? 'Saving…' : 'Save Changes'}</Text>
              </Pressable>
              <Pressable
                style={[s.cancelBtn, { minHeight: 46 }]}
                onPress={() => setEditingMeal(null)}
              >
                <Text style={{ fontFamily: 'Roboto', fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Text style={s.section}>Check-Ins & Reports</Text>
        <Action
          icon={Mic}
          title="Voice Food Log"
          text="Speak naturally to log a meal with automatic food parsing."
          onPress={() => navigation.navigate('VoiceFoodLog')}
        />
        <Action
          icon={Activity}
          title="Hunger & Fullness Check-In"
          text="Notice how your body feels before or after eating."
          onPress={() => navigation.navigate('HungerFullness')}
        />
        <Action
          icon={TrendingUp}
          title="Progress, Weight & Weekly Patterns"
          text="Review your weekly charts, weight log, and check-in history."
          onPress={() => navigation.navigate('ProgressPatterns')}
        />
      </ScreenContainer>
    </SafeAreaView>
  );
}

function Action({
  icon: Icon,
  title,
  text,
  onPress,
}: {
  icon: any;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.action} onPress={onPress}>
      <View style={s.actionIcon}>
        <Icon size={22} color={colors.deepTeal} />
      </View>
      <View style={s.actionCopy}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.small}>{text}</Text>
      </View>
      <ChevronRight size={19} color={colors.muted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 8 },
  loadError: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.red, marginTop: 10 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.softBlue,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dayNavBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text },
  small: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg },
  stat: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
  },
  statValue: { fontFamily: 'Roboto', fontSize: 21, fontWeight: '700', color: colors.deepTeal },
  primaryRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  primary: {
    minHeight: dimensions.buttonHeight,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.deepTeal,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  primaryText: { fontFamily: 'Roboto', color: '#fff', fontSize: 14.5, fontWeight: '700', marginLeft: 8 },
  section: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  waterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
  },
  waterBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.softBlue,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  waterBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.deepTeal,
  },
  timeline: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.cardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 66,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  status: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDone: { backgroundColor: colors.green },
  rowText: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowTitle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  tick: { fontFamily: 'Roboto', color: colors.green, fontSize: 16, fontWeight: '700' },
  editCard: {
    marginTop: spacing.md,
    padding: spacing.cardPadding,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.deepTeal,
    backgroundColor: colors.surface,
  },
  editInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    minHeight: dimensions.buttonHeightSmall,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCopy: { flex: 1, marginHorizontal: 12 },
});
