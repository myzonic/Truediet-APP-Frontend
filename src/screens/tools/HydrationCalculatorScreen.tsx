import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

const climateOptions = ['Normal', 'Hot', 'Humid'];

interface HydrationRecord {
  id: string;
  date: string;
  amountMl: number;
  notes: string;
}

interface CalculatorState {
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very';
  climate: 'normal' | 'hot' | 'humid';
  customGoal: number | null;
  records: HydrationRecord[];
}

const activityMultipliers = {
  sedentary: 35,
  light: 45,
  moderate: 55,
  very: 70
};

const climateMultipliers = {
  normal: 1,
  hot: 1.2,
  humid: 1.1
}

export default function HydrationCalculatorScreen({navigation}: any) {
  const [state, setState] = useState<CalculatorState>({
    weightKg: 70,
    activityLevel: 'moderate',
    climate: 'normal',
    customGoal: null,
    records: []
  });

  const calculateDailyGoal = () => {
    const base = state.weightKg * activityMultipliers[state.activityLevel];
    const climateFactor = climateMultipliers[state.climate];
    const goal = Math.round(base * climateFactor);
    setState(prev => ({ ...prev, customGoal: goal }));
    return goal;
  };

  const addRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = { id: Date.now().toString(), date: today, amountMl: calculateDailyGoal(), notes: 'Today' };
    setState(prev => ({
      ...prev,
      records: [todayRecord, ...prev.records.filter((r) => r.date !== today)]
    }));
    Alert.alert('Recorded', 'Hydration goal recorded for today.');
  };

  const renderedRecords = state.records.length > 0 ? (
    <FlatList
      data={state.records.slice(0, 7)}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={s.historyItem}>
          <Text style={s.historyDate}>{item.date}</Text>
          <Text style={s.historyAmount}>{String(item.amountMl)} ml</Text>
          <Text style={s.historyNotes}>{item.notes}</Text>
        </View>
      )}
    />
  ) : (
    <Text style={s.noHistoryText}>No records yet. Tap "Record" above.</Text>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Hydration Calculator</Text>
          <Text style={s.headerSubtitle}>Calculate daily water needs</Text>
        </View>

        <View style={s.calculatorInputs}>
          <View style={s.inputGroup}>
            <Text style={s.label}>Weight (kg)</Text>
            <TextInput
              keyboardType="number-pad"
              value={String(state.weightKg)}
              onChangeText={(text) => setState({ ...state, weightKg: Number(text) || 70 })}
              placeholderTextColor={colors.muted}
              style={s.input}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Activity Level</Text>
            {[ 'Sedentary', 'Light', 'Moderate', 'Very' ].map((activity: string) => (
              <Pressable
                key={activity}
                style={[
                  s.activityButton,
                  state.activityLevel === activity.toLowerCase() ? s.activityButtonActive : s.activityButtonInactive
                ]}
                onPress={() => setState({ ...state, activityLevel: activity.toLowerCase() as 'sedentary' | 'light' | 'moderate' | 'very' })}
              >
                <Text style={s.activityText}>{activity}</Text>
              </Pressable>
            ))}
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Climate</Text>
            {climateOptions.map((option: string) => (
              <Pressable
                key={option}
                style={[
                  s.climateButton,
                  state.climate === option.toLowerCase() ? s.climateButtonActive : s.climateButtonInactive
                ]}
                onPress={() => setState({ ...state, climate: option.toLowerCase() as 'normal' | 'hot' | 'humid' })}
              >
                <Text style={s.climateText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.resultSection}>
          <Text style={s.resultTitle}>Daily Goal: {state.customGoal || 'Calculate above'} ml</Text>
          <Text style={s.resultSub}>
            {(state.customGoal / 250).toFixed(1)} x 250 ml glasses
          </Text>
        </View>

        <View style={s.historySection}>
          <Text style={s.historyTitle}>History</Text>
          {renderedRecords}
        </View>

        <Pressable style={s.recordButton} onPress={addRecord}>
          <Text style={s.recordButtonText}>Record Intake</Text>
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
  calculatorInputs: {
    marginBottom: 24
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6
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
  activityButton: {
    padding: 8,
    margin: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface
  },
  activityButtonActive: {
    padding: 8,
    borderColor: colors.deepTeal,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.deepTeal
  },
  activityButtonInactive: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface
  },
  activityText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  climateButton: {
    padding: 8,
    margin: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface
  },
  climateButtonActive: {
    padding: 8,
    borderColor: colors.deepTeal,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.deepTeal
  },
  climateButtonInactive: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface
  },
  climateText: {
    color: colors.text,
    fontFamily: 'Roboto',
    fontSize: 12
  },
  resultSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center'
  },
  resultTitle: {
    fontFamily: 'Roboto',
    fontSize: 22,
    fontWeight: '700',
    color: colors.deepTeal
  },
  resultSub: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4
  },
  historySection: {
    marginTop: 24
  },
  historyTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  noHistoryText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24
  },
  historyItem: {
    padding: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  historyDate: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.muted,
    marginRight: 8
  },
  historyAmount: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text
  },
  historyNotes: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1
  },
  recordButton: {
    marginTop: 24,
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  recordButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  }
});