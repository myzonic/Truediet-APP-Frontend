import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';
import {
  Activity,
  BookOpen,
  Brain,
  Calculator,
  Calendar,
  ChevronRight,
  Droplet,
  Palette,
  Ruler,
  ScanLine,
  Search,
  ShieldCheck,
  Utensils,
} from 'lucide-react-native';

type Tool = {
  key: string;
  title: string;
  description: string;
  icon: any;
  route: string;
};

const tools: Tool[] = [
  { key: 'nutrition-assessment', title: 'Nutrition Assessment', description: 'Complete your personalized nutrition evaluation', icon: BookOpen, route: 'NutritionAssessment' },
  { key: 'health-conditions', title: 'Manage Health Conditions', description: 'Evidence-based nutrition guidance for health conditions', icon: ShieldCheck, route: 'HealthConditions' },
  { key: 'balanced-meal', title: 'Balanced Meal Builder', description: 'Build meals around variety and balance', icon: Utensils, route: 'BalancedMeal' },
  { key: 'food-label', title: 'Food Label Reader', description: 'Understand nutrition labels step by step', icon: ScanLine, route: 'LabelReading' },
  { key: 'hunger-fullness', title: 'Hunger & Fullness Scale', description: "Practice noticing your body's hunger and satiety signals", icon: Activity, route: 'HungerFullness' },
  { key: 'nutrition-myths', title: 'Nutrition Myth Checker', description: 'Explore common claims and what the evidence says', icon: Brain, route: 'Myths' },
  { key: 'recipe-finder', title: 'Recipes & Recipe Finder', description: 'Search and browse flexible, balanced recipes', icon: Search, route: 'RecipeFinder' },
  { key: 'meal-planner', title: 'Meal Planning & Grocery Tool', description: 'Plan weekly meals and generate shopping lists', icon: Calendar, route: 'MealPlanner' },
  { key: 'nutrient-calculator', title: 'Nutrient Calculator', description: 'Estimate macronutrients and calories for foods', icon: Calculator, route: 'NutrientCalculator' },
  { key: 'portion-guide', title: 'Portion Guide', description: 'Practical hand-based portion sizes and measurements', icon: Ruler, route: 'PortionGuide' },
  { key: 'hydration-calculator', title: 'Hydration Calculator', description: 'Calculate and save your daily fluid intake goal', icon: Droplet, route: 'HydrationCalculator' },
  { key: 'food-substitution', title: 'Food Substitution Tool', description: 'Find allergy-safe or preference-friendly food swaps', icon: Palette, route: 'FoodSubstitution' },
];

export default function ToolsScreen({ navigation }: any) {
  const open = (route: string) => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate(route);
    else navigation.navigate(route);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>TRUE DIET TOOLS</Text>
        <Text style={s.title}>Practical nutrition tools.</Text>
        <Text style={s.subtitle}>
          Turn nutrition education into practical everyday decisions. All calculators and guides are for educational use, not medical diagnosis.
        </Text>

        <View style={s.list}>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Pressable key={tool.key} style={s.tool} onPress={() => open(tool.route)}>
                <View style={s.icon}>
                  <Icon size={21} color={colors.deepTeal} />
                </View>
                <View style={s.toolContent}>
                  <Text style={s.toolTitle}>{tool.title}</Text>
                  <Text style={s.toolDescription}>{tool.description}</Text>
                </View>
                <ChevronRight size={19} color={colors.muted} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  eyebrow: {
    fontFamily: 'Roboto',
    color: colors.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 8,
  },
  list: {
    marginTop: 22,
    gap: 10,
  },
  tool: {
    minHeight: 84,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.softGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  toolTitle: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  toolDescription: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
