import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { dimensions, radius, spacing } from '../../theme/tokens';
import { addMeal, MealType } from '../../lib/track';

interface FoodEntry {
  id: string;
  name: string;
  servings: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

const REFERENCE_FOODS: FoodEntry[] = [
  { id: '1', name: 'Chicken Breast (100g cooked)', servings: 1, calories: 165, protein: 31, carbohydrates: 0, fat: 3.6 },
  { id: '2', name: 'Brown Rice (1 cup cooked)', servings: 1, calories: 216, protein: 5, carbohydrates: 45, fat: 1.8 },
  { id: '3', name: 'Avocado (1/2 medium)', servings: 1, calories: 160, protein: 2, carbohydrates: 9, fat: 15 },
  { id: '4', name: 'Salmon (100g cooked)', servings: 1, calories: 206, protein: 22, carbohydrates: 0, fat: 12 },
  { id: '5', name: 'Egg (1 large)', servings: 1, calories: 78, protein: 6, carbohydrates: 0.6, fat: 5.3 },
  { id: '6', name: 'Almonds (28g handful)', servings: 1, calories: 164, protein: 6, carbohydrates: 6, fat: 14 },
  { id: '7', name: 'Greek Yogurt (1 cup)', servings: 1, calories: 146, protein: 20, carbohydrates: 8, fat: 4 },
  { id: '8', name: 'Oats (1 cup cooked)', servings: 1, calories: 158, protein: 6, carbohydrates: 27, fat: 3.2 },
  { id: '9', name: 'Whole Wheat Bread (1 slice)', servings: 1, calories: 81, protein: 4, carbohydrates: 14, fat: 1.1 },
  { id: '10', name: 'Banana (1 medium)', servings: 1, calories: 105, protein: 1.3, carbohydrates: 27, fat: 0.4 },
];

export default function NutrientCalculatorScreen({ navigation }: any) {
  const [selectedFoods, setSelectedFoods] = useState<FoodEntry[]>([]);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredDatabase = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return REFERENCE_FOODS;
    return REFERENCE_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  const addFood = (food: FoodEntry) => {
    setSelectedFoods((prev) => {
      const existing = prev.find((f) => f.id === food.id);
      if (existing) {
        return prev.map((f) => (f.id === food.id ? { ...f, servings: f.servings + 1 } : f));
      }
      return [...prev, { ...food, servings: 1 }];
    });
  };

  const removeFood = (id: string) => {
    setSelectedFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const addCustomFood = () => {
    const name = customName.trim();
    if (!name) return;
    const newEntry: FoodEntry = {
      id: `custom-${Date.now()}`,
      name,
      servings: 1,
      calories: Math.max(0, Number(customCalories) || 0),
      protein: Math.max(0, Number(customProtein) || 0),
      carbohydrates: Math.max(0, Number(customCarbs) || 0),
      fat: Math.max(0, Number(customFat) || 0),
    };
    setSelectedFoods((prev) => [...prev, newEntry]);
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  const totals = useMemo(() => {
    return selectedFoods.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories * f.servings,
        protein: acc.protein + f.protein * f.servings,
        carbs: acc.carbs + f.carbohydrates * f.servings,
        fat: acc.fat + f.fat * f.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedFoods]);

  const saveToDiary = async () => {
    if (!selectedFoods.length || saving) return;
    setSaving(true);
    try {
      const description = selectedFoods
        .map((f) => `${f.servings > 1 ? `${f.servings}x ` : ''}${f.name}`)
        .join(', ');
      const notes = `Estimated nutrition: ${Math.round(totals.calories)} kcal · ${totals.protein.toFixed(1)}g protein · ${totals.carbs.toFixed(1)}g carbs · ${totals.fat.toFixed(1)}g fat`;
      await addMeal({ mealType, description, notes, source: 'manual' });
      Alert.alert('Saved to Food Diary', 'Your calculated meal was saved to today’s Food Diary.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="NUTRIENT CALCULATOR" title="Estimate meal nutrients." onBack={() => navigation.goBack()} />
        <Text style={s.subtitle}>
          Combine reference foods to see how protein, carbohydrates, and fats work together, then optionally log the meal to your Food Diary.
        </Text>

        {/* Totals Summary */}
        <View style={s.totalsCard}>
          <Text style={s.totalsLabel}>MEAL ESTIMATE</Text>
          <View style={s.totalsGrid}>
            <View style={s.totalItem}>
              <Text style={s.totalVal}>{Math.round(totals.calories)}</Text>
              <Text style={s.totalKey}>kcal</Text>
            </View>
            <View style={s.totalItem}>
              <Text style={s.totalVal}>{totals.protein.toFixed(1)}g</Text>
              <Text style={s.totalKey}>Protein</Text>
            </View>
            <View style={s.totalItem}>
              <Text style={s.totalVal}>{totals.carbs.toFixed(1)}g</Text>
              <Text style={s.totalKey}>Carbs</Text>
            </View>
            <View style={s.totalItem}>
              <Text style={s.totalVal}>{totals.fat.toFixed(1)}g</Text>
              <Text style={s.totalKey}>Fat</Text>
            </View>
          </View>
        </View>

        {selectedFoods.length > 0 ? (
          <View style={s.selectedSection}>
            <Text style={s.section}>Selected Foods ({selectedFoods.length})</Text>
            {selectedFoods.map((f) => (
              <View key={f.id} style={s.selectedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.foodName}>
                    {f.name} {f.servings > 1 ? `× ${f.servings}` : ''}
                  </Text>
                  <Text style={s.foodMeta}>
                    {Math.round(f.calories * f.servings)} kcal · {(f.protein * f.servings).toFixed(1)}g P · {(f.carbohydrates * f.servings).toFixed(1)}g C · {(f.fat * f.servings).toFixed(1)}g F
                  </Text>
                </View>
                <Pressable onPress={() => removeFood(f.id)} hitSlop={8}>
                  <Trash2 size={17} color={colors.red} />
                </Pressable>
              </View>
            ))}

            <Text style={s.label}>Log as Meal Type</Text>
            <PillGroup>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                <Pill
                  key={t}
                  label={t.charAt(0).toUpperCase() + t.slice(1)}
                  selected={mealType === t}
                  onPress={() => setMealType(t)}
                />
              ))}
            </PillGroup>

            <Pressable style={s.primary} onPress={saveToDiary} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Save Meal to Food Diary</Text>}
            </Pressable>
          </View>
        ) : null}

        <Text style={s.section}>Reference Food Database</Text>
        <View style={s.searchBox}>
          <Search size={18} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reference foods…"
            placeholderTextColor={colors.muted}
            style={s.searchInput}
          />
        </View>
        <View style={s.dbList}>
          {filteredDatabase.map((item) => (
            <Pressable key={item.id} style={s.dbRow} onPress={() => addFood(item)}>
              <View style={{ flex: 1 }}>
                <Text style={s.foodName}>{item.name}</Text>
                <Text style={s.foodMeta}>
                  {item.calories} kcal · {item.protein}g P · {item.carbohydrates}g C · {item.fat}g F
                </Text>
              </View>
              <View style={s.plusBadge}>
                <Plus size={16} color={colors.deepTeal} />
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={s.section}>Add Custom Food Item</Text>
        <View style={s.customCard}>
          <TextInput
            value={customName}
            onChangeText={setCustomName}
            placeholder="Food name (e.g. Homemade lentil soup)"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
          <View style={s.customGrid}>
            <TextInput value={customCalories} onChangeText={setCustomCalories} keyboardType="numeric" placeholder="kcal" placeholderTextColor={colors.muted} style={[s.input, { flexBasis: '47%', flexGrow: 1, minWidth: 0 }]} />
            <TextInput value={customProtein} onChangeText={setCustomProtein} keyboardType="numeric" placeholder="Protein (g)" placeholderTextColor={colors.muted} style={[s.input, { flexBasis: '47%', flexGrow: 1, minWidth: 0 }]} />
            <TextInput value={customCarbs} onChangeText={setCustomCarbs} keyboardType="numeric" placeholder="Carbs (g)" placeholderTextColor={colors.muted} style={[s.input, { flexBasis: '47%', flexGrow: 1, minWidth: 0 }]} />
            <TextInput value={customFat} onChangeText={setCustomFat} keyboardType="numeric" placeholder="Fat (g)" placeholderTextColor={colors.muted} style={[s.input, { flexBasis: '47%', flexGrow: 1, minWidth: 0 }]} />
          </View>
          <Pressable style={s.secondaryBtn} onPress={addCustomFood}>
            <Text style={s.secondaryBtnText}>+ Add Custom Item</Text>
          </Pressable>
        </View>

        <View style={s.disclaimer}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.disclaimerText}>
            Educational estimate only — nutrient values in whole foods vary naturally by preparation and brand.
          </Text>
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  totalsCard: { backgroundColor: colors.softGreen, borderRadius: radius.xl, padding: spacing.cardPadding, marginTop: spacing.xl },
  totalsLabel: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.green },
  totalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  totalItem: { flexBasis: '47%', flexGrow: 1, minWidth: 0, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  totalVal: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.deepTeal },
  totalKey: { fontFamily: 'Roboto', fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  selectedSection: { marginTop: spacing.md },
  section: { fontFamily: 'Roboto', fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  label: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  foodName: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  foodMeta: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  searchBox: { height: dimensions.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  dbList: { marginTop: spacing.md, gap: 8 },
  dbRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, padding: 12 },
  plusBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  customCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.cardPadding, gap: 10 },
  customGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { minHeight: 44, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background, paddingHorizontal: 12, fontFamily: 'Roboto', fontSize: 13.5, color: colors.text },
  secondaryBtn: { minHeight: 44, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontFamily: 'Roboto', fontSize: 13.5, fontWeight: '700', color: colors.deepTeal },
  primary: { minHeight: dimensions.buttonHeight, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  primaryText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff', flexShrink: 1, textAlign: 'center' },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: colors.softBlue, borderRadius: radius.lg, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
});
