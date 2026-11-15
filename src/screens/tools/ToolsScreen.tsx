import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import { BookOpen, Calculator, Calendar, Droplet, Heart, Mic, Palette, Ruler, Search, ShieldCheck, Utensils, Zap } from 'lucide-react-native';

type Tool = {
  key: string;
  title: string;
  description: string;
  icon: any;
  route: string;
};

const tools = [
  { key: 'nutrition-assessment', title: 'Nutrition Assessment', description: 'Complete personalized nutrition evaluation', icon: BookOpen, route: 'NutritionAssessment' },
  { key: 'health-conditions', title: 'Manage Health Conditions', description: 'Nutrition guidance for health conditions', icon: ShieldCheck, route: 'HealthConditions' },
  { key: 'balanced-meal', title: 'Balanced Meal Builder', description: 'Build meals around variety and balance', icon: Utensils, route: 'BalancedMeal' },
  { key: 'food-label', title: 'Food Label Reader', description: 'Understand nutrition labels step by step', icon: BookOpen, route: 'LabelReading' },
  { key: 'hunger-fullness', title: 'Hunger & Fullness Scale', description: 'Practice noticing your body\'s signals', icon: Zap, route: 'HungerFullness' },
  { key: 'nutrition-myths', title: 'Nutrition Myth Checker', description: 'Explore common claims and their context', icon: BookOpen, route: 'Myths' },
  { key: 'recipe-finder', title: 'Recipe Finder', description: 'Search and browse recipes', icon: Search, route: 'RecipeFinder' },
  { key: 'meal-planner', title: 'Meal Planner', description: 'Plan meals and generate shopping lists', icon: Calendar, route: 'MealPlanner' },
  { key: 'nutrient-calculator', title: 'Nutrient Calculator', description: 'Calculate nutrition for foods and meals', icon: Calculator, route: 'NutrientCalculator' },
  { key: 'portion-guide', title: 'Portion Guide', description: 'Hand-based portion sizes and measurements', icon: Ruler, route: 'PortionGuide' },
  { key: 'hydration-calculator', title: 'Hydration Calculator', description: 'Calculate daily water needs', icon: Droplet, route: 'HydrationCalculator' },
  { key: 'food-substitution', title: 'Food Substitution Tool', description: 'Find alternatives and compare nutrition', icon: Palette, route: 'FoodSubstitution' },
];

export default function ToolsScreen({navigation}: any) {
  useFocusEffect(
    () => () => {}
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>TRUE DIET TOOLS</Text>
        <Text style={s.title}>Practical nutrition tools.</Text>
        <Text style={s.subtitle}>Turn nutrition education into practical everyday decisions.</Text>

        {tools.map((tool) => (
          <Pressable
            key={tool.key}
            style={s.tool}
            onPress={() => navigation.navigate(tool.route)}
          >
            <View style={s.icon}>
              <tool.icon size={21} color={colors.deepTeal} />
            </View>
            <View style={s.toolContent}>
              <Text style={s.toolTitle}>{tool.title}</Text>
              <Text style={s.toolDescription}>{tool.description}</Text>
            </View>
            <svg color={colors.muted} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M7 10l5 5 5-5M7 6H5v2h2v4h2v-4h2V6z" />
            </svg>
          </Pressable>
        ))}

        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
          <svg color={colors.text} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  eyebrow: {
    fontFamily: 'Roboto',
    color: colors.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 8
  },
  tool: {
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.softGreen,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toolContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8
  },
  toolTitle: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  toolDescription: {
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 4
  },
  back: {
    padding: 8
  }
});