import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

interface FoodEntry {
  id: string;
  name: string;
  servings: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

const mockFoodDatabase: FoodEntry[] = [
  { id: '1', name: 'Chicken Breast (100g)', servings: 1, calories: 165, protein: 31, carbohydrates: 0, fat: 3.6 },
  { id: '2', name: 'Brown Rice (100g)', servings: 1, calories: 112, protein: 2.6, carbohydrates: 23, fat: 0.9 },
  { id: '3', name: 'Avocado (100g)', servings: 1, calories: 160, protein: 2, carbohydrates: 9, fat: 15 },
  { id: '4', name: 'Salmon (100g)', servings: 1, calories: 206, protein: 22, carbohydrates: 0, fat: 12 },
  { id: '5', name: 'Egg (1 large)', servings: 1, calories: 78, protein: 6, carbohydrates: 0.6, fat: 5.3 },
  { id: '6', name: 'Almonds (28g)', servings: 1, calories: 164, protein: 6, carbohydrates: 6, fat: 14 }
];

interface CalculatorState {
  foods: FoodEntry[];
  selectedFoodId: string | null;
  customName: string;
  customServings: number;
  customCalories: number;
  customProtein: number;
  customCarbs: number;
  customFat: number;
}

export default function NutrientCalculatorScreen({navigation}: any) {
  const [state, setState] = useState<CalculatorState>({
    foods: [],
    selectedFoodId: null,
    customName: '',
    customServings: 1,
    customCalories: 0,
    customProtein: 0,
    customCarbs: 0,
    customFat: 0
  });

  const foods = useMemo(() => mockFoodDatabase, []);

  const addFood = (food: FoodEntry, servings: number) => {
    const existing = state.foods.find((f) => f.id === food.id);
    if (existing) {
      setState(prev => ({
        ...prev,
        foods: prev.foods.map((f) =>
          f.id === food.id ? { ...f, servings: f.servings + servings } : f
        )
      }));
    } else {
      setState(prev => ({
        ...prev,
        foods: [...prev.foods, { ...food, servings }]
      }));
    }
  };

  const removeFood = (id: string) => {
    setState(prev => ({
      ...prev,
      foods: prev.foods.filter((f) => f.id !== id)
    }));
  };

  const calculateTotals = () => {
    const totalCalories = state.foods.reduce((sum, f) => sum + f.calories * f.servings, 0);
    const totalProtein = state.foods.reduce((sum, f) => sum + f.protein * f.servings, 0);
    const totalCarbs = state.foods.reduce((sum, f) => sum + f.carbohydrates * f.servings, 0);
    const totalFat = state.foods.reduce((sum, f) => sum + f.fat * f.servings, 0);
    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  const handleAddCustom = () => {
    if (!state.customName.trim()) return;
    const newFood: FoodEntry = {
      id: 'custom-' + Date.now(),
      name: state.customName,
      servings: state.customServings,
      calories: state.customCalories,
      protein: state.customProtein,
      carbohydrates: state.customCarbs,
      fat: state.customFat
    };
    addFood(newFood, state.customServings);
    setState({
      ...state,
      customName: '',
      customServings: 1,
      customCalories: 0,
      customProtein: 0,
      customCarbs: 0,
      customFat: 0
    });
    Alert.alert('Added', 'Custom food has been added to your calculation.');
  };

  const foodList = state.foods.map((food) => (
    <View key={food.id} style={s.foodRow}>
      <Text style={s.foodName}>{food.name}</Text>
      <Text style={s.foodServings}>x {String(food.servings)}</Text>
      <Pressable style={s.removeButton} onPress={() => removeFood(food.id)}>
        <Text style={s.removeText}>Remove</Text>
      </Pressable>
    </View>
  ));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Nutrient Calculator</Text>
          <Text style={s.headerSubtitle}>Calculate nutrition for foods and meals</Text>
        </View>

        <View style={s.foodList}>
          {state.foods.length === 0 ? (
            <Text style={s.emptyText}>No foods added. Search the database below.</Text>
          ) : (
            <View>{foodList}</View>
          )}
        </View>

        <View style={s.calculatorSection}>
          <Text style={s.calculatorTitle}>Add Food</Text>

          <View style={s.foodSearch}>
            <TextInput
              placeholder="Search food database..."
              onChangeText={() => {}}
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <Pressable style={s.searchButton}>
              <Text style={s.searchButtonText}>Search</Text>
            </Pressable>
          </View>

          {state.selectedFoodId && (
            <View style={s.foodDetails}>
              <Text style={s.foodDetailTitle}>
                {foods.find((f) => f.id === state.selectedFoodId)?.name || 'Food'}
              </Text>
              <View>
                <Pressable style={s.servingButton}>
                  <Text style={s.servingText}>1 serving</Text>
                </Pressable>
              </View>
              <Pressable style={s.addButton} onPress={() => addFood(foods.find((f) => f.id === state.selectedFoodId)!, 1)}>
                <Text style={s.addButtonText}>Add to calculation</Text>
              </Pressable>
            </View>
          )}

          <View style={s.customInputSection}>
            <TextInput
              placeholder="Custom food name"
              value={state.customName}
              onChangeText={(text) => setState({ ...state, customName: text })}
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <TextInput
              placeholder="Servings"
              value={String(state.customServings)}
              onChangeText={(text) => setState({ ...state, customServings: Number(text) || 1 })}
              keyboardType="number-pad"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <View style={s.nutrientsRow}>
              <View>
                <Text style={s.nutrientLabel}>Calories</Text>
                <TextInput
                  value={String(state.customCalories)}
                  onChangeText={(text) => setState({ ...state, customCalories: Number(text) || 0 })}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.muted}
                  style={s.input}
                />
              </View>
              <View>
                <Text style={s.nutrientLabel}>Protein (g)</Text>
                <TextInput
                  value={String(state.customProtein)}
                  onChangeText={(text) => setState({ ...state, customProtein: Number(text) || 0 })}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.muted}
                  style={s.input}
                />
              </View>
              <View>
                <Text style={s.nutrientLabel}>Carbs (g)</Text>
                <TextInput
                  value={String(state.customCarbs)}
                  onChangeText={(text) => setState({ ...state, customCarbs: Number(text) || 0 })}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.muted}
                  style={s.input}
                />
              </View>
              <View>
                <Text style={s.nutrientLabel}>Fat (g)</Text>
                <TextInput
                  value={String(state.customFat)}
                  onChangeText={(text) => setState({ ...state, customFat: Number(text) || 0 })}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.muted}
                  style={s.input}
                />
              </View>
            </View>
          </View>

          <Pressable style={s.calculateButton} onPress={handleAddCustom}>
            <Text style={s.calculateButtonText}>Add Custom Food</Text>
          </Pressable>
        </View>

        <View style={s.totalsSection}>
          <Text style={s.totalsTitle}>Totals</Text>
          <View style={s.totalsGrid}>
            <View>
              <Text style={s.totalLabel}>Calories</Text>
              <Text style={s.totalValue}>{calculateTotals().totalCalories}</Text>
            </View>
            <View>
              <Text style={s.totalLabel}>Protein</Text>
              <Text style={s.totalValue}>{calculateTotals().totalProtein.toFixed(1)} g</Text>
            </View>
            <View>
              <Text style={s.totalLabel}>Carbs</Text>
              <Text style={s.totalValue}>{calculateTotals().totalCarbs.toFixed(1)} g</Text>
            </View>
            <View>
              <Text style={s.totalLabel}>Fat</Text>
              <Text style={s.totalValue}>{calculateTotals().totalFat.toFixed(1)} g</Text>
            </View>
          </View>
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
  foodList: {
    marginBottom: 24
  },
  emptyText: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center'
  },
  foodRow: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  foodName: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text
  },
  foodServings: {
    color: colors.textSecondary,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  removeButton: {
    padding: 4,
    marginLeft: 8
  },
  removeText: {
    color: colors.muted,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  calculatorSection: {
    marginBottom: 24
  },
  calculatorTitle: {
    fontFamily: 'Roboto',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16
  },
  foodSearch: {
    marginBottom: 12
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
    backgroundColor: colors.surface
  },
  searchButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: colors.deepTeal,
    borderRadius: 8
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 12
  },
  foodDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12
  },
  foodDetailTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  servingButton: {
    padding: 8,
    margin: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center'
  },
  servingText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  addButton: {
    marginTop: 12,
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 14
  },
  calculateButton: {
    marginTop: 20,
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  calculateButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  },
  customInputSection: {
    marginTop: 12
  },
  nutrientsRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  nutrientLabel: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.textSecondary,
    width: 80
  },
  totalsSection: {
    marginTop: 24
  },
  totalsTitle: {
    fontFamily: 'Roboto',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8
  },
  totalLabel: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.textSecondary
  },
  totalValue: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700',
    color: colors.deepTeal
  }
});