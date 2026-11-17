import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, ArrowRightLeft, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { dimensions, radius, spacing } from '../../theme/tokens';

interface SwapOption {
  name: string;
  reason: string;
  nutritionComparison: string;
  allergens: string;
}

interface OriginalFood {
  id: string;
  name: string;
  category: string;
  nutrition: string;
  swaps: SwapOption[];
}

const FOOD_SWAPS: OriginalFood[] = [
  {
    id: 'milk',
    name: 'Cow’s Milk (Whole)',
    category: 'Dairy',
    nutrition: '150 kcal · 8g protein · 12g carbs · 8g fat per cup',
    swaps: [
      { name: 'Unsweetened Soy Milk', reason: 'Dairy-free / Closest protein match', nutritionComparison: '80 kcal · 7g protein · 4g carbs · 4g fat', allergens: 'Soy' },
      { name: 'Fortified Oat Milk', reason: 'Creamy texture for coffee & oats', nutritionComparison: '120 kcal · 3g protein · 16g carbs · 5g fat', allergens: 'Gluten (unless certified GF)' },
      { name: 'Unsweetened Almond Milk', reason: 'Lighter calorie & lower carb option', nutritionComparison: '30 kcal · 1g protein · 1g carbs · 2.5g fat', allergens: 'Tree nuts' },
    ],
  },
  {
    id: 'bread',
    name: 'White Sandwich Bread',
    category: 'Grains',
    nutrition: '80 kcal · 3g protein · 15g carbs · 1g fiber per slice',
    swaps: [
      { name: 'Sprouted Whole Grain Bread', reason: 'Higher fiber & slower digestion', nutritionComparison: '80 kcal · 5g protein · 15g carbs · 3g fiber', allergens: 'Wheat / Gluten' },
      { name: 'Certified Gluten-Free Seeded Bread', reason: 'Celiac / gluten intolerance safe', nutritionComparison: '110 kcal · 3g protein · 18g carbs · 3g fiber', allergens: 'None (check label for eggs/seeds)' },
      { name: 'Corn Tortillas (2 small)', reason: 'Naturally gluten-free whole grain', nutritionComparison: '100 kcal · 2g protein · 21g carbs · 2.5g fiber', allergens: 'None' },
    ],
  },
  {
    id: 'rice',
    name: 'White Rice',
    category: 'Grains & Starches',
    nutrition: '205 kcal · 4g protein · 45g carbs · 0.6g fiber per cup',
    swaps: [
      { name: 'Quinoa (cooked)', reason: 'Complete plant protein & higher fiber', nutritionComparison: '222 kcal · 8g protein · 39g carbs · 5g fiber', allergens: 'None' },
      { name: 'Brown or Wild Rice', reason: 'Intact bran & micronutrients', nutritionComparison: '216 kcal · 5g protein · 45g carbs · 3.5g fiber', allergens: 'None' },
      { name: 'Half Rice + Half Cauliflower Rice', reason: 'Higher vegetable volume, familiar texture', nutritionComparison: '115 kcal · 3g protein · 25g carbs · 2g fiber', allergens: 'None' },
    ],
  },
  {
    id: 'sour-cream',
    name: 'Sour Cream / HeavyMayo',
    category: 'Condiments & Fats',
    nutrition: '60–90 kcal · 1g protein · 6–10g fat per 2 tbsp',
    swaps: [
      { name: 'Plain Greek Yogurt', reason: 'Higher protein, tangy swap for dips & toppings', nutritionComparison: '35 kcal · 5g protein · 1g fat per 2 tbsp', allergens: 'Dairy' },
      { name: 'Mashed Avocado', reason: 'Dairy-free, heart-healthy monounsaturated fat', nutritionComparison: '50 kcal · 0.6g protein · 4.5g unsaturated fat', allergens: 'None' },
    ],
  },
  {
    id: 'soy-sauce',
    name: 'Regular Soy Sauce',
    category: 'Condiments',
    nutrition: '10 kcal · ~900mg sodium per tbsp',
    swaps: [
      { name: 'Reduced-Sodium Tamari', reason: 'Gluten-free & lower sodium', nutritionComparison: '15 kcal · ~550mg sodium per tbsp', allergens: 'Soy' },
      { name: 'Coconut Aminos', reason: 'Soy-free & gluten-free savory seasoning', nutritionComparison: '15 kcal · ~270mg sodium per tbsp', allergens: 'None' },
    ],
  },
];

export default function FoodSubstitutionScreen({ navigation }: any) {
  const [selectedId, setSelectedId] = useState<string>(FOOD_SWAPS[0].id);
  const current = FOOD_SWAPS.find((f) => f.id === selectedId) || FOOD_SWAPS[0];

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer>
        <ScreenHeader eyebrow="FOOD SUBSTITUTION TOOL" title="Practical food swaps." onBack={() => navigation.goBack()} />
        <Text style={s.subtitle}>
          Explore allergy-safe, higher-fiber, or preference-friendly alternatives and compare their nutrition side by side.
        </Text>

        <Text style={s.label}>1. Choose a food to swap</Text>
        <PillGroup>
          {FOOD_SWAPS.map((item) => (
            <Pill
              key={item.id}
              label={item.name}
              selected={selectedId === item.id}
              onPress={() => setSelectedId(item.id)}
            />
          ))}
        </PillGroup>

        <View style={s.origCard}>
          <Text style={s.origCategory}>{current.category.toUpperCase()}</Text>
          <Text style={s.origName}>{current.name}</Text>
          <Text style={s.origNutrition}>{current.nutrition}</Text>
        </View>

        <Text style={s.label}>2. Recommended Alternatives</Text>
        <View style={s.list}>
          {current.swaps.map((swap) => (
            <View key={swap.name} style={s.swapCard}>
              <View style={s.swapHead}>
                <ArrowRightLeft size={18} color={colors.green} />
                <Text style={s.swapTitle}>{swap.name}</Text>
              </View>
              <Text style={s.swapReason}>{swap.reason}</Text>
              <Text style={s.swapMeta}>{swap.nutritionComparison}</Text>
              <Text style={s.swapAllergen}>Allergens: {swap.allergens}</Text>
            </View>
          ))}
        </View>

        <View style={s.disclaimer}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.disclaimerText}>
            Always check product ingredient labels when managing a diagnosed food allergy or celiac disease.
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
  label: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  origCard: { backgroundColor: colors.softBlue, borderRadius: radius.lg, padding: spacing.cardPadding, marginTop: spacing.md },
  origCategory: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: colors.deepTeal },
  origName: { fontFamily: 'Roboto', fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 4 },
  origNutrition: { fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  list: { gap: 10 },
  swapCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.cardPadding, gap: 4 },
  swapHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swapTitle: { fontFamily: 'Roboto', fontSize: 15.5, fontWeight: '700', color: colors.text },
  swapReason: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '600', color: colors.green, marginTop: 2 },
  swapMeta: { fontFamily: 'Roboto', fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  swapAllergen: { fontFamily: 'Roboto', fontSize: 11.5, color: colors.muted, marginTop: 2 },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: colors.softGreen, borderRadius: radius.lg, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
});
