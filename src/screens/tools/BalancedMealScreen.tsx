import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { addMeal, MealType } from '../../lib/track';

const groups: [string, string, string][] = [
  ['protein', 'Protein', 'Eggs, fish, chicken, beans, lentils'],
  ['carbs', 'Carbohydrates', 'Rice, potatoes, oats, whole grains'],
  ['vegetables', 'Vegetables', 'Choose from a variety of colors'],
  ['fruit', 'Fruit', 'Fresh, frozen or other practical options'],
  ['fat', 'Fats', 'Avocado, nuts, seeds, oils'],
];

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

// Default to the meal that best matches the current time, but let the member
// change it: the saved log should say what they actually ate.
function defaultMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export default function BalancedMealScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string[]>([]);
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const save = async () => {
    if (!selected.length || saving) return;
    setSaving(true);
    setError('');
    const labels = groups.filter(([id]) => selected.includes(id)).map(([, title]) => title);
    try {
      await addMeal({
        mealType,
        description: `Balanced meal: ${labels.join(', ')}`,
        source: 'manual',
      });
      Alert.alert('Meal saved', `Your meal was added to today's log.`);
      navigation.goBack();
    } catch (e: any) {
      // The save is only real once the server confirms it, so report the
      // actual failure rather than claiming success.
      setError(e?.message || 'Could not save your meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Pressable style={s.back} onPress={() => navigation.goBack()} hitSlop={6}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>BALANCED MEAL BUILDER</Text>
        <Text style={s.title}>Build your meal.</Text>
        <Text style={s.subtitle}>
          Think about variety and balance rather than trying to make every plate perfect.
        </Text>

        <Text style={s.label}>Which meal is this?</Text>
        <View style={s.mealRow}>
          {MEALS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[s.mealChip, mealType === key && s.mealChipActive]}
              onPress={() => setMealType(key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: mealType === key }}
            >
              <Text style={[s.mealChipText, mealType === key && s.mealChipTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>Food groups</Text>
        <View style={s.groups}>
          {groups.map(([id, title, examples]) => {
            const active = selected.includes(id);
            return (
              <Pressable
                key={id}
                style={[s.group, active && s.groupActive]}
                onPress={() => toggle(id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
              >
                <View style={[s.checkbox, active && s.checkboxActive]}>
                  {active && <Check size={15} color="#fff" />}
                </View>
                <View style={s.groupContent}>
                  <Text style={s.groupTitle}>{title}</Text>
                  <Text style={s.examples}>{examples}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.summary}>
          <Text style={s.summaryLabel}>YOUR MEAL</Text>
          <Text style={s.summaryTitle}>
            {selected.length} of {groups.length} food groups added
          </Text>
          <View style={s.progress}>
            <View style={[s.progressFill, { width: `${(selected.length / groups.length) * 100}%` }]} />
          </View>
        </View>

        <View style={s.message}>
          <Text style={s.messageTitle}>No perfect plate</Text>
          <Text style={s.messageText}>
            This tool is a prompt, not a rule. Add what feels realistic and save the meal to your log.
          </Text>
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Pressable
          style={[s.primary, (!selected.length || saving) && s.disabled]}
          disabled={!selected.length || saving}
          onPress={save}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Save This Meal</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  content: { width: '100%', maxWidth: 412, paddingHorizontal: 24, paddingBottom: 45 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 25 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, letterSpacing: 1.4, fontWeight: '700', color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 30, fontWeight: '700', color: colors.text, marginTop: 8 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 8 },
  label: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 10 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mealChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  mealChipActive: { backgroundColor: colors.deepTeal, borderColor: colors.deepTeal },
  mealChipText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '600', color: colors.text },
  mealChipTextActive: { color: '#fff' },
  groups: { marginTop: 4 },
  group: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  groupActive: { borderColor: colors.green, backgroundColor: colors.softGreen },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: colors.green, borderColor: colors.green },
  groupContent: { flex: 1, marginLeft: 13 },
  groupTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  examples: { fontFamily: 'Roboto', fontSize: 11, lineHeight: 17, color: colors.textSecondary, marginTop: 3 },
  summary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 19, padding: 19, marginTop: 15 },
  summaryLabel: { fontFamily: 'Roboto', fontSize: 9, letterSpacing: 1.1, fontWeight: '700', color: colors.green },
  summaryTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 5 },
  progress: { height: 8, borderRadius: 10, backgroundColor: '#E6EBE6', overflow: 'hidden', marginTop: 14 },
  progressFill: { height: '100%', backgroundColor: colors.green },
  message: { backgroundColor: colors.softGreen, borderRadius: 19, padding: 19, marginTop: 17 },
  messageTitle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text },
  messageText: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 19, color: colors.textSecondary, marginTop: 6 },
  error: { fontFamily: 'Roboto', fontSize: 13, color: '#B91C1C', marginTop: 16 },
  primary: { height: 56, borderRadius: 17, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  primaryText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.45 },
});
