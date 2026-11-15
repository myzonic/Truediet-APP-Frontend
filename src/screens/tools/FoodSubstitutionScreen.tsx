import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  allergens: string;
}

const originalFoods: FoodItem[] = [
  { id: '1', name: 'Whole Milk', category: 'Dairy', calories: 150, protein: 8, carbohydrates: 12, fat: 8, allergens: 'None' },
  { id: '2', name: 'Almond Milk', category: 'Dairy', calories: 30, protein: 1, carbohydrates: 1, fat: 2.5, allergens: 'None' },
  { id: '3', name: 'White Bread', category: 'Grains', calories: 80, protein: 3, carbohydrates: 13, fat: 1, allergens: 'Gluten' },
  { id: '4', name: 'Whole Wheat Bread', category: 'Grains', calories: 100, protein: 4, carbohydrates: 15, fat: 1, allergens: 'Gluten' },
  { id: '5', name: 'Soy Sauce', category: 'Condiment', calories: 10, protein: 1, carbohydrates: 1, fat: 0, allergens: 'Soy' },
  { id: '6', name: 'Tamari', category: 'Condiment', calories: 15, protein: 2, carbohydrates: 0, fat: 0, allergens: 'Soy' }
];

const substitutionReasons = ['Allergy', 'Intolerance', 'Dietary preference', 'Availability', 'Budget', 'Nutritional preference', 'Taste'];

const alternatives: Record<string, FoodItem[]> = {
  'Whole Milk': [
    { id: 'a1', name: 'Almond Milk', category: 'Dairy', calories: 30, protein: 1, carbohydrates: 1, fat: 2.5, allergens: 'None' },
    { id: 'a2', name: 'Soy Milk', category: 'Dairy', calories: 80, protein: 7, carbohydrates: 4, fat: 4, allergens: 'Soy' },
    { id: 'a3', name: 'Oat Milk', category: 'Dairy', calories: 120, protein: 3, carbohydrates: 16, fat: 5, allergens: 'None' }
  ],
  'White Bread': [
    { id: 'b1', name: 'Gluten-Free Bread', category: 'Grains', calories: 110, protein: 2, carbohydrates: 22, fat: 2, allergens: 'None' },
    { id: 'b2', name: 'Lettuce Wraps', category: 'Vegetables', calories: 15, protein: 1, carbohydrates: 3, fat: 0, allergens: 'None' },
    { id: 'b3', name: 'Corn Tortillas', category: 'Grains', calories: 95, protein: 3, carbohydrates: 20, fat: 1, allergens: 'Gluten' }
  ]
};

export default function FoodSubstitutionScreen({navigation}: any) {
  const [originalFood, setOriginalFood] = useState<FoodItem | null>(null);
  const [reason, setReason] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [filteredAlternatives, setFilteredAlternatives] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState('');

  const handleSelectOriginal = (food: FoodItem) => {
    setOriginalFood(food);
    setReason('');
    setShowAlternatives(false);
  };

  const handleSelectReason = (r: string) => {
    setReason(r);
    if (r !== '' && r !== 'Select reason') {
      setShowAlternatives(true);
      const orig = originalFoods.find((f) => f.id === originalFood?.id);
      if (orig) {
        const subs = alternatives[orig.name] || [];
        setFilteredAlternatives(subs.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase())
        ));
      }
    } else {
      setShowAlternatives(false);
      setFilteredAlternatives([]);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (originalFood) {
      const orig = originalFoods.find((f) => f.id === originalFood.id);
      if (orig) {
        setFilteredAlternatives(alternatives[orig.name]?.filter((s) =>
          s.name.toLowerCase().includes(text.toLowerCase())
        ) || []);
      } else {
        setFilteredAlternatives([]);
      }
    }
  };

  const addToSubstitutions = () => {
    if (!originalFood || !reason) return;
    Alert.alert(
      'Substitution Added',
      'Added ' + originalFood.name + ' alternative selection for: ' + reason
    );
    setOriginalFood(null);
    setReason('');
    setShowAlternatives(false);
    setSearch('');
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Food Substitution Tool</Text>
          <Text style={s.headerSubtitle}>Find alternatives and compare nutrition</Text>
        </View>

        <View style={s.formSection}>
          <Text style={s.formLabel}>Original Food</Text>
          {originalFood ? (
            <View style={s.foodDisplay}>
              <Text style={s.foodName}>{originalFood.name}</Text>
              <Text style={s.foodDetails}>
                Calories: {String(originalFood.calories)} | Protein: {String(originalFood.protein)}g | Carbs: {String(originalFood.carbohydrates)}g | Fat: {String(originalFood.fat)}g
              </Text>
              <Text style={s.foodAllergens}>Allergens: {originalFood.allergens}</Text>
            </View>
          ) : (
            <Text style={s.noSelection}>Select an original food above</Text>
          )}

          <View style={s.reasonSelector}>
            <Text style={s.reasonLabel}>Reason for substitution:</Text>
            <FlatList
              data={substitutionReasons}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    s.reasonButton,
                    reason === item ? s.reasonButtonActive : s.reasonButtonInactive
                  ]}
                  onPress={() => handleSelectReason(item)}
                >
                  <Text style={s.reasonText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>

        {originalFood && reason && showAlternatives ? (
          <View style={s.alternativesSection}>
            <Text style={s.alternativesTitle}>Suggested Alternatives</Text>
            <Text style={s.alternativesSub}>
              {originalFood.name} alternatives for: {reason}
            </Text>
            <TextInput
              placeholder="Search alternatives..."
              value={search}
              onChangeText={handleSearchChange}
              placeholderTextColor={colors.muted}
              style={s.searchInput}
            />
            <FlatList
              data={filteredAlternatives}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={s.alternativeItem}
                  onPress={() => {
                    Alert.alert(
                      'Substitution Selected',
                      'Selected: ' + item.name + '\n' +
                        originalFood.name + ' -> ' + item.name + '\n' +
                        'Calories: ' + String(originalFood.calories) + ' -> ' + String(item.calories) + '\n' +
                        'Protein: ' + String(originalFood.protein) + 'g -> ' + String(item.protein) + 'g'
                    );
                    addToSubstitutions();
                  }}
                >
                  <View style={s.alternativeInfo}>
                    <Text style={s.alternativeName}>{item.name}</Text>
                    <Text style={s.alternativeCalories}>
                      {String(item.calories)} cal · {String(item.protein)}g protein · {String(item.carbohydrates)}g carbs · {String(item.fat)}g fat
                    </Text>
                  </View>
                  <Text style={s.alternativeCheck}>✓</Text>
                </Pressable>
              )}
            />
            {filteredAlternatives.length === 0 && (
              <Text style={s.noAlternatives}>No alternatives found.</Text>
            )}
          </View>
        ) : (
          <Text style={s.noSubstitutionText}>
            Select an original food and reason to see alternatives
          </Text>
        )}

        <View style={s.actionSection}>
          <Pressable style={s.addButton} onPress={addToSubstitutions}>
            <Text style={s.addButtonText}>Add to Substitutions</Text>
          </Pressable>
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
  formSection: {
    marginBottom: 24
  },
  foodDisplay: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16
  },
  foodName: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  foodDetails: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4
  },
  foodAllergens: {
    fontFamily: 'Roboto',
    fontSize: 11,
    color: colors.muted,
    marginTop: 2
  },
  formLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  reasonSelector: {
    marginBottom: 24
  },
  reasonLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  reasonButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
    minHeight: 32
  },
  reasonButtonInactive: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
    minHeight: 32
  },
  reasonButtonActive: {
    padding: 8,
    borderColor: colors.deepTeal,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.deepTeal,
    minHeight: 32
  },
  reasonText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 13
  },
  noSelection: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center'
  },
  alternativesSection: {
    marginBottom: 24
  },
  alternativesTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  alternativesSub: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12
  },
  searchInput: {
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
  alternativeItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  alternativeInfo: {},
  alternativeName: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text
  },
  alternativeCalories: {
    fontFamily: 'Roboto',
    fontSize: 11,
    color: colors.textSecondary
  },
  alternativeCheck: {
    color: colors.deepTeal,
    fontSize: 14
  },
  noAlternatives: {
    color: colors.textSecondary,
    marginVertical: 8,
    textAlign: 'center'
  },
  noSubstitutionText: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center'
  },
  actionSection: {
    marginTop: 24,
    alignItems: 'center'
  },
  addButton: {
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  }
});