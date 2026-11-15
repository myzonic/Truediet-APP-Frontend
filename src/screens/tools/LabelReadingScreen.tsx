import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

const steps = [
  ['Serving Size', 'Start by understanding the serving information so the rest of the label has context.'],
  ['Calories', 'Calories provide information about energy. The number is most useful when considered alongside your overall needs and eating pattern.'],
  ['Protein, Carbohydrates & Fat', 'These macronutrients play different roles in the body and should be understood as part of the whole food and overall diet.'],
  ['Fiber', 'Fiber is found in many plant foods and can contribute to digestive health and overall dietary quality.'],
  ['Added Sugars', 'Added sugars can be one piece of the overall nutrition picture. Avoid judging a food from one number alone.'],
  ['Sodium', 'Sodium content can be useful to understand in the context of your overall eating pattern and individual need.']
];

export default function LabelReadingScreen({navigation}: any) {
  const [step, setStep] = useState(0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Food Label Reader</Text>
          <Text style={s.headerSubtitle}>Understand nutrition labels step by step</Text>
        </View>

        <View style={s.stepsContainer}>
          {steps.map(([title, description], index) => (
            <View key={index} style={s.step}>
              <Text style={s.stepTitle}>{title}</Text>
              <Text style={s.stepDescription}>{description}</Text>
            </View>
          ))}
        </View>

        <Pressable style={s.button} onPress={() => navigation.goBack()}>
          <Text style={s.buttonText}>Done</Text>
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
  stepsContainer: {},
  step: { marginBottom: 24 },
  stepTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  stepDescription: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  }
});