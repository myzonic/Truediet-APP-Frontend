import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, FlatList, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

interface MealPlanDay {
  id: string;
  date: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
}

interface RecipeItem {
  id: string;
  title: string;
  prepTime: string;
}

const mockRecipes: RecipeItem[] = [
  { id: '1', title: 'Greek Yogurt Parfait', prepTime: '5 min' },
  { id: '2', title: 'Quinoa Salad', prepTime: '15 min' },
  { id: '3', title: 'Baked Salmon', prepTime: '10 min' },
  { id: '4', title: 'Green Smoothie', prepTime: '5 min' },
  { id: '5', title: 'Chickpea Curry', prepTime: '10 min' },
  { id: '6', title: 'Grilled Chicken Bowl', prepTime: '10 min' }
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MealPlannerScreen({navigation}: any) {
  const [plans, setPlans] = useState<Map<string, MealPlanDay>>(new Map());
  const [newPlanDate, setNewPlanDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');

  const filteredRecipes = useMemo(() => {
    if (search.trim() === '') return mockRecipes;
    return mockRecipes.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const generateShoppingList = () => {
    const list: string[] = [];
    plans.forEach(() => {
      // In a real implementation, would extract ingredients from the selected recipes
    });
    return list;
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Meal Planner</Text>
          <Text style={s.headerSubtitle}>Plan your meals and generate shopping lists</Text>
        </View>

        <View style={s.datePicker}>
          <Text style={s.dateLabel}>Select day:</Text>
          <FlatList
            data={daysOfWeek}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  s.dateButton,
                  newPlanDate === item ? s.dateButtonActive : s.dateButtonInactive
                ]}
                onPress={() => setNewPlanDate(item)}
              >
                <Text style={s.dateText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        <View style={s.recipeSelector}>
          <Text style={s.recipeLabel}>Select recipe:</Text>
          <TextInput
            placeholder="Search recipes..."
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholderTextColor={colors.muted}
            style={s.input}
          />
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={s.recipeButton}
                onPress={() => {
                  const date = newPlanDate;
                  const existing = plans.get(date);
                  if (existing) {
                    setPlans(new Map(plans).set(date, { ...existing, breakfast: item.title }));
                  }
                }}
              >
                <Text style={s.recipeButtonText}>{item.title}</Text>
              </Pressable>
            )}
          />
        </View>

        <View style={s.planView}>
          <Text style={s.planTitle}>Meal Plan for {newPlanDate}</Text>
          {plans.get(newPlanDate) ? (
            <View>
              <Text style={s.mealText}>Breakfast: {plans.get(newPlanDate)?.breakfast || 'Not set'}</Text>
              <Text style={s.mealText}>Lunch: {plans.get(newPlanDate)?.lunch || 'Not set'}</Text>
              <Text style={s.mealText}>Dinner: {plans.get(newPlanDate)?.dinner || 'Not set'}</Text>
              <Text style={s.mealText}>Snacks: {plans.get(newPlanDate)?.snacks || 'Not set'}</Text>
            </View>
          ) : (
            <Text style={s.noPlanText}>No meal plan for this day yet.</Text>
          )}
        </View>

        <View style={s.shoppingContainer}>
          <Text style={s.shoppingLabel}>Shopping List:</Text>
          {generateShoppingList().length > 0 ? (
            <FlatList
              data={generateShoppingList()}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable style={s.shoppingItem}>
                  <Text>{item}</Text>
                </Pressable>
              )}
            />) : (
            <Text style={s.noShoppingText}>No items. Add meals to generate a list.</Text>
          )}
        </View>
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
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24
  },
  headerTitle: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  headerSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary
  },
  datePicker: {
    marginBottom: 24
  },
  dateLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.surface
  },
  dateButtonInactive: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.surface
  },
  dateButtonActive: {
    padding: 8,
    borderColor: colors.deepTeal,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.deepTeal
  },
  dateText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  recipeSelector: {
    marginBottom: 24
  },
  recipeLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  input: {
    fontFamily: 'Roboto',
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: colors.surface,
    marginBottom: 8
  },
  recipeButton: {
    padding: 8,
    marginBottom: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8
  },
  recipeButtonText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 13
  },
  planView: {
    marginBottom: 24
  },
  planTitle: {
    fontFamily: 'Roboto',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  mealText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    color: colors.text,
    marginTop: 4,
    marginBottom: 0
  },
  noPlanText: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center'
  },
  shoppingContainer: {
    marginTop: 24
  },
  shoppingLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  shoppingItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4
  },
  noShoppingText: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center'
  }
});