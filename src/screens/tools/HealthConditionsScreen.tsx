import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, ScrollView, View, Text, Pressable, Alert, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

interface ConditionEntry {
  id: string;
  name: string;
  description: string;
  nutritionNotes: string;
  isSaved: boolean;
}

const initialConditionLibrary: ConditionEntry[] = [
  { id: 'prediabetes', name: 'Prediabetes', description: 'Blood sugar levels higher than normal but not yet diabetes', nutritionNotes: 'Focus on fiber, whole grains, weight management; avoid sugary drinks', isSaved: false },
  { id: 'type1-diabetes', name: 'Type 1 Diabetes', description: 'Autoimmune condition requiring insulin', nutritionNotes: 'Carbohydrate counting, consistent meal timing, work with dietitian', isSaved: false },
  { id: 'type2-diabetes', name: 'Type 2 Diabetes', description: 'Insulin resistance, lifestyle-influenced condition', nutritionNotes: 'Low glycemic foods, portion control, weight management, fiber-rich', isSaved: false },
  { id: 'high-cholesterol', name: 'High Cholesterol', description: 'Elevated LDL cholesterol levels', nutritionNotes: 'Reduce saturated fat, increase fiber, omega-3 fatty acids, plant sterols', isSaved: false },
  { id: 'high-blood-pressure', name: 'High Blood Pressure', description: 'Hypertension, elevated force of blood against artery walls', nutritionNotes: 'Reduce sodium, increase potassium, DASH diet pattern, limit processed foods', isSaved: false },
  { id: 'cardiovascular', name: 'Cardiovascular Health', description: 'Heart and blood vessel health maintenance', nutritionNotes: 'Omega-3s, fiber, antioxidants, limit sodium and saturated fat', isSaved: false },
  { id: 'pcos', name: 'PCOS', description: 'Polycystic Ovary Syndrome, hormonal condition', nutritionNotes: 'Balance blood sugar, reduce insulin resistance, anti-inflammatory foods, fiber', isSaved: false },
  { id: 'ibs', name: 'IBS', description: 'Irritable Bowel Syndrome, digestive disorder', nutritionNotes: 'Low FODMAP approach (temporary), identify triggers, fiber adjustment', isSaved: false },
  { id: 'gerd', name: 'GERD', description: 'Gastroesophageal reflux disease', nutritionNotes: 'Avoid trigger foods (spicy, acidic, fatty), smaller meals, avoid eating before bed', isSaved: false },
  { id: 'celiac', name: 'Celiac Disease', description: 'Autoimmune reaction to gluten', nutritionNotes: 'Strict gluten-free diet, avoid wheat barley rye, check labels', isSaved: false },
  { id: 'fatty-liver', name: 'Fatty Liver Disease', description: 'Fat accumulation in liver', nutritionNotes: 'Weight management if needed, reduce added sugar, increase fiber, coffee in moderation', isSaved: false },
  { id: 'kidney', name: 'Chronic Kidney Disease', description: 'Reduced kidney function over time', nutritionNotes: 'Protein moderation, sodium restriction, potassium monitoring, phosphate control', isSaved: false },
  { id: 'osteoporosis', name: 'Osteoporosis', description: 'Reduced bone density', nutritionNotes: 'Adequate calcium, vitamin D, protein, weight-bearing exercise, limit alcohol', isSaved: false },
  { id: 'iron-deficiency', name: 'Iron Deficiency', description: 'Low iron stores, anemia risk', nutritionNotes: 'Heme iron (red meat) or non-heme with vitamin C, avoid calcium with iron meals', isSaved: false }
];

export default function HealthConditionsScreen({navigation}: any) {
  const [conditions, setConditions] = useState<ConditionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useFocusEffect(
    () => () => {
      setTimeout(
        () => {
          setConditions(
            initialConditionLibrary.map((c) => ({ ...c, isSaved: Math.random() > 0.5 }))
          );
          setLoading(false);
        },
        500
      );
    }
  );

  const filteredConditions = initialConditionLibrary.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCondition = (id: string) => {
    setConditions(
      prev => prev.map(c => (c.id === id ? { ...c, isSaved: !c.isSaved } : c))
    );
  };

  const saveCondition = (condition: ConditionEntry) => {
    // TODO: Save to /api/health-conditions endpoint
    setTimeout(() => {
      toggleCondition(condition.id);
      setLoading(false);
    }, 1000);
  };

  const handleSave = () => {
    const marked = conditions.filter((c) => c.isSaved);
    marked.forEach(saveCondition);
    Alert.alert('Saved', 'Your health conditions have been saved.');
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <ActivityIndicator size="large" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Manage Health Conditions</Text>
          <Text style={s.headerSubtitle}>Nutrition guidance for your conditions</Text>
        </View>

        <View style={s.searchContainer}>
          <TextInput
            placeholder="Search conditions..."
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholderTextColor={colors.muted}
            style={s.input}
          />
        </View>

        <View style={s.listContainer}>
          {filteredConditions.map((condition) => (
            <View
              key={condition.id}
              style={[
                s.conditionItem,
                { borderColor: conditions.find((c) => c.id === condition.id)?.isSaved ? colors.green : colors.border }
              ]}
            >
              <View style={s.conditionRow}>
                <View style={s.conditionCheckboxContainer}>
                  <Pressable
                    style={[
                      s.conditionCheckbox,
                      { backgroundColor: conditions.find((c) => c.id === condition.id)?.isSaved ? colors.green : colors.surface }
                    ]}
                    onPress={() => toggleCondition(condition.id)}
                  >
                    <Text style={s.conditionCheckText}>✓</Text>
                  </Pressable>
                </View>
                <View style={s.conditionInfo}>
                  <Text style={s.conditionName}>{condition.name}</Text>
                  <Text style={s.conditionSubName}>{condition.description}</Text>
                </View>
                <Pressable style={s.conditionNotesButton} onPress={() => Alert.alert('Nutrition notes:', condition.nutritionNotes)}>
                  <Text style={s.notesText}>Notes</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {conditions.some((c) => c.isSaved) ? (
          <Pressable style={s.saveButton} onPress={handleSave}>
            <Text style={s.saveButtonText}>Save Conditions</Text>
          </Pressable>
        ) : (
          <Text style={s.emptyText}>Select conditions above to save</Text>
        )}
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
  searchContainer: {
    marginBottom: 16
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
  } as const,
  listContainer: {} as const,
  conditionItem: {
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface
  } as const,
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  } as const,
  conditionCheckboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  } as const,
  conditionCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8
  } as const,
  conditionCheckText: {
    color: colors.green,
    fontSize: 14
  } as const,
  conditionInfo: {} as const,
  conditionName: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  } as const,
  conditionSubName: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.textSecondary
  } as const,
  conditionNotesButton: {
    padding: 4
  } as const,
  notesText: {
    color: colors.muted,
    fontSize: 11
  } as const,
  emptyText: {
    marginVertical: 24,
    color: colors.textSecondary,
    textAlign: 'center'
  } as const,
  saveButton: {
    marginTop: 24,
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  } as const,
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  } as const
});