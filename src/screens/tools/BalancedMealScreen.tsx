import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { addMeal, MealType } from '../../lib/track';

const groups: [string, string, string][] = [
  ['protein', 'Protein', 'Eggs, fish, chicken, beans, lentils, tofu'],
  ['carbs', 'Carbohydrates', 'Rice, potatoes, oats, whole grains, whole wheat bread'],
  ['vegetables', 'Vegetables', 'Choose from a variety of colors and textures'],
  ['fruit', 'Fruit', 'Fresh, frozen, or other practical options'],
  ['fat', 'Healthy Fats', 'Avocado, nuts, seeds, olive oil'],
];

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

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
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

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
      Alert.alert('Meal saved', `Your meal was added to today's Food Diary.`);
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message || 'Could not save your meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Pressable style={s.back} onPress={() => navigation.goBack()} hitSlop={6}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>BALANCED MEAL BUILDER</Text>
        <Text style={s.title}>Build your meal.</Text>
        <Text style={s.subtitle}>
          Think about variety and balance rather than trying to make every plate perfect.
        </Text>

        <Text style={s.label}>Which meal is this?</Text>
        <PillGroup>
          {MEALS.map(({ key, label }) => (
            <Pill key={key} label={label} selected={mealType === key} onPress={() => setMealType(key)} />
          ))}
        </PillGroup>

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
            This tool is an educational prompt, not a rigid rule. Add what feels realistic and save the meal to your log.
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
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 48 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, letterSpacing: 1.4, fontWeight: '700', color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  label: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 22, marginBottom: 10 },
  groups: { marginTop: 4 },
  group: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  groupActive: { borderColor: colors.green, backgroundColor: colors.softGreen },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: colors.green, borderColor: colors.green },
  groupContent: { flex: 1, marginLeft: 13 },
  groupTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  examples: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 3 },
  summary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, marginTop: 14 },
  summaryLabel: { fontFamily: 'Roboto', fontSize: 10, letterSpacing: 1.1, fontWeight: '700', color: colors.green },
  summaryTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 5 },
  progress: { height: 8, borderRadius: 10, backgroundColor: '#E6EBE6', overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: colors.green },
  message: { backgroundColor: colors.softGreen, borderRadius: 18, padding: 18, marginTop: 16 },
  messageTitle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: '700', color: colors.text },
  messageText: { fontFamily: 'Roboto', fontSize: 12.5, lineHeight: 19, color: colors.textSecondary, marginTop: 5 },
  error: { fontFamily: 'Roboto', fontSize: 13, color: '#B91C1C', marginTop: 14 },
  primary: { height: 54, borderRadius: 16, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  primaryText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.45 },
});
