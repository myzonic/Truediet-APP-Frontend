import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Mic, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { addMeal, MealType } from '../../lib/track';

const mealTypes: Record<string, MealType> = {
  Breakfast: 'breakfast',
  Lunch: 'lunch',
  Dinner: 'dinner',
  Snack: 'snack',
};
const meals = Object.keys(mealTypes);
const UNITS = ['serving', 'cup', 'slice', 'piece', 'bowl', 'grams (g)', 'oz', 'tbsp'];

const QUICK_FOODS: Array<{ name: string; unit: string; info: string }> = [
  { name: 'Boiled Eggs', unit: 'piece', info: '78 kcal · 6g protein per egg' },
  { name: 'Whole Wheat Toast', unit: 'slice', info: '81 kcal · 4g protein per slice' },
  { name: 'Greek Yogurt', unit: 'cup', info: '146 kcal · 20g protein per cup' },
  { name: 'Oatmeal (cooked)', unit: 'cup', info: '158 kcal · 6g protein per cup' },
  { name: 'Grilled Chicken Breast', unit: 'serving', info: '165 kcal · 31g protein (100g)' },
  { name: 'Baked Salmon', unit: 'serving', info: '206 kcal · 22g protein (100g)' },
  { name: 'Brown Rice (cooked)', unit: 'cup', info: '216 kcal · 5g protein per cup' },
  { name: 'Avocado', unit: 'piece', info: '160 kcal · healthy monounsaturated fat' },
  { name: 'Mixed Berries', unit: 'cup', info: '70 kcal · rich in fiber & antioxidants' },
  { name: 'Almonds', unit: 'serving', info: '164 kcal · 6g protein (28g handful)' },
];

export default function MealLogScreen({ navigation, route }: any) {
  const initialMealKey = route?.params?.mealType
    ? Object.keys(mealTypes).find((k) => mealTypes[k] === route.params.mealType) || 'Breakfast'
    : 'Breakfast';
  const [meal, setMeal] = useState(initialMealKey);
  const [food, setFood] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('serving');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSave = food.trim().length > 0 && !saving;

  const filteredQuick = searchQuery.trim()
    ? QUICK_FOODS.filter((f) => f.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : QUICK_FOODS.slice(0, 5);

  const pickQuickFood = (item: { name: string; unit: string; info: string }) => {
    setFood((prev) => (prev ? `${prev}, ${item.name}` : item.name));
    setUnit(item.unit);
    if (!notes) setNotes(item.info);
  };

  const save = async () => {
    const raw = food.trim();
    if (!raw || saving) return;
    setSaving(true);
    setError('');
    const qtyPrefix = quantity.trim() && quantity.trim() !== '1' ? `${quantity.trim()} ${unit} — ` : '';
    const description = `${qtyPrefix}${raw}`;
    try {
      await addMeal({
        mealType: mealTypes[meal],
        description,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Meal saved', `${meal} has been added to today's Food Diary.`);
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message || 'Could not save your meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <Text style={s.eyebrow}>FOOD DIARY · ADD FOOD</Text>
          <Text style={s.title}>What did you eat?</Text>
          <Text style={s.subtitle}>Record what you ate with serving details, or search common whole foods below.</Text>

          <Pressable style={s.voiceShortcut} onPress={() => navigation.navigate('VoiceFoodLog')}>
            <Mic size={18} color={colors.deepTeal} />
            <Text style={s.voiceShortcutText}>Prefer to speak? Use Groq Voice Food Log →</Text>
          </Pressable>

          <Text style={s.label}>Meal Type</Text>
          <PillGroup>
            {meals.map((item) => (
              <Pill key={item} label={item} selected={item === meal} onPress={() => setMeal(item)} />
            ))}
          </PillGroup>

          <Text style={s.label}>Food Search (Quick Add)</Text>
          <View style={s.searchBox}>
            <Search size={17} color={colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods (e.g. eggs, toast, salmon, oats)…"
              placeholderTextColor={colors.muted}
              style={s.searchInput}
            />
          </View>
          <PillGroup style={{ marginTop: 8 }}>
            {filteredQuick.map((item) => (
              <Pill key={item.name} label={`+ ${item.name}`} tone="green" onPress={() => pickQuickFood(item)} />
            ))}
          </PillGroup>

          <Text style={s.label}>Food / Meal Description</Text>
          <TextInput
            value={food}
            onChangeText={setFood}
            multiline
            placeholder="Example: 2 boiled eggs, whole grain toast and fruit"
            placeholderTextColor={colors.muted}
            style={s.area}
          />

          <View style={s.servingRow}>
            <View style={{ width: 96 }}>
              <Text style={s.labelSmall}>Quantity</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="1"
                placeholderTextColor={colors.muted}
                style={s.smallInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.labelSmall}>Serving Unit</Text>
              <PillGroup>
                {UNITS.map((u) => (
                  <Pill key={u} label={u} selected={unit === u} onPress={() => setUnit(u)} />
                ))}
              </PillGroup>
            </View>
          </View>

          <Text style={s.label}>Notes / Nutritional Context</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Anything you noticed about hunger, energy, or preparation?"
            placeholderTextColor={colors.muted}
            style={s.notes}
          />

          <Pressable style={s.checkin} onPress={() => navigation.navigate('HungerFullness')}>
            <Text style={s.checkinTitle}>Add Hunger & Fullness Check-In</Text>
            <Text style={s.small}>Optional — notice how you felt before and after eating.</Text>
          </Pressable>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Pressable style={[s.save, !canSave && s.saveDisabled]} disabled={!canSave} onPress={save}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveText}>Save to Food Diary</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 20 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  voiceShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.softBlue,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 14,
  },
  voiceShortcutText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal, flex: 1 },
  label: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 18 },
  labelSmall: { fontFamily: 'Roboto', fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  searchBox: {
    minHeight: 46,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: 'Roboto', fontSize: 13.5, color: colors.text },
  area: { minHeight: 90, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, textAlignVertical: 'top', fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  servingRow: { flexDirection: 'row', gap: 12, marginTop: 14, alignItems: 'flex-start' },
  smallInput: { minHeight: 42, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 12, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  small: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginTop: 3 },
  notes: { minHeight: 76, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 14, textAlignVertical: 'top', fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  checkin: { backgroundColor: colors.softGreen, borderRadius: 16, padding: 16, marginTop: 18 },
  checkinTitle: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  error: { fontFamily: 'Roboto', fontSize: 13, color: colors.red, marginTop: 14 },
  save: { minHeight: 54, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  saveDisabled: { opacity: 0.5 },
  saveText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
});
