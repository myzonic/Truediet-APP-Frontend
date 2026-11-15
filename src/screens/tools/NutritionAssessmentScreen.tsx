import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, TextInput, View, Text, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';
import { useFocusEffect } from '@react-navigation/native';

interface AssessmentAnswer {
  question: string;
  answer: string;
}

interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  questions: AssessmentAnswer[];
}

const SECTIONS: AssessmentSection[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Age, biological information, and basic demographics',
    questions: [
      { question: 'Age', answer: '' },
      { question: 'Biological sex', answer: '' },
      { question: 'Height', answer: '' },
      { question: 'Current weight', answer: '' },
      { question: 'Goal weight', answer: '' }
    ]
  },
  {
    id: 'goals',
    title: 'Nutrition Goals',
    description: 'Your primary nutrition goals',
    questions: [
      { question: 'Primary goal', answer: '' },
      { question: 'Secondary goals', answer: '' },
      { question: 'Target timeline', answer: '' }
    ]
  },
  {
    id: 'activity',
    title: 'Activity Level',
    description: 'Your daily activity and exercise patterns',
    questions: [
      { question: 'Sedentary (desk job, no exercise)', answer: '' },
      { question: 'Lightly active (light exercise 1-3 days/week)', answer: '' },
      { question: 'Moderately active (moderate exercise 3-5 days/week)', answer: '' },
      { question: 'Very active (hard exercise 6-7 days/week)', answer: '' },
      { question: 'Extra active (very hard exercise, physical job)', answer: '' }
    ]
  },
  {
    id: 'dietary',
    title: 'Dietary Preferences',
    description: 'Dietary patterns and preferences',
    questions: [
      { question: 'Omnivore (eats all foods)', answer: '' },
      { question: 'Vegetarian (no meat, eats dairy/eggs)', answer: '' },
      { question: 'Vegan (no animal products)', answer: '' },
      { question: 'Gluten-free', answer: '' },
      { question: 'Dairy-free', answer: '' }
    ]
  },
  {
    id: 'allergies',
    title: 'Food Allergies & Intolerances',
    description: 'List any food allergies or intolerances',
    questions: [
      { question: 'No known allergies', answer: '' },
      { question: 'List allergens (e.g., peanuts, shellfish, dairy)', answer: '' },
      { question: 'Severity level', answer: '' }
    ]
  },
  {
    id: 'conditions',
    title: 'Health Conditions',
    description: 'Any relevant health conditions',
    questions: [
      { question: 'No conditions', answer: '' },
      { question: 'List conditions', answer: '' },
      { question: 'Under medical care?', answer: '' }
    ]
  },
  {
    id: 'eating-habits',
    title: 'Eating Habits',
    description: 'Current eating patterns and mealtime routines',
    questions: [
      { question: 'Typical breakfast', answer: '' },
      { question: 'Typical lunch', answer: '' },
      { question: 'Typical dinner', answer: '' },
      { question: 'Snacking frequency', answer: '' },
      { question: 'Meal timing preferences', answer: '' }
    ]
  }
];

export default function NutritionAssessmentScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  useFocusEffect(
    () => () => {
      setLoading(false);
    }
  );

  const handleAnswerChange = (question: string, answer: string) => {
    // Store answer logic
  };

  const handleSave = () => {
    setCompleted(true);
    setLoading(true);
    setTimeout(
      () => {
        setLoading(false);
        navigation.goBack();
      },
      1500
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Nutrition Assessment</Text>
          <Text style={s.subtitle}>Personalized nutrition evaluation</Text>
          <ActivityIndicator size="large" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Assessment Complete</Text>
          <Text style={s.subtitle}>Thank you for completing the nutrition assessment.</Text>
          <Text style={s.body}>Your responses have been saved.</Text>
          <Pressable style={s.button} onPress={() => navigation.goBack()}>
            <Text style={s.buttonText}>Done</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = SECTIONS[currentSection];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Nutrition Assessment</Text>
          <Text style={s.headerSubtitle}>Personalized nutrition evaluation</Text>
        </View>

        <View style={s.progressBar}>
          {SECTIONS.map((_, i) => (
            <View key={i} style={s.progressDot} />
          ))}
        </View>

        <View style={s.sectionContainer}>
          <Text style={s.sectionTitle}>{current.title}</Text>
          <Text style={s.sectionDescription}>{current.description}</Text>
        </View>

        <View style={s.questionsContainer}>
          {current.questions.map((q) => (
            <View key={q.question} style={s.questionRow}>
              <Text style={s.questionText}>{q.question}</Text>
              <TextInput
                style={s.input}
                value={q.answer}
                onChangeText={(text) => handleAnswerChange(q.question, text)}
                placeholder="Enter your answer"
              />
            </View>
          ))}
        </View>

        {currentSection < SECTIONS.length - 1 ? (
          <Pressable style={s.nextButton} onPress={() => setCurrentSection(currentSection + 1)}>
            <Text style={s.nextButtonText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable style={s.saveButton} onPress={handleSave}>
            <Text style={s.saveButtonText}>Save Assessment</Text>
          </Pressable>
        )}

        <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
          <Text style={s.backButtonText}>Back</Text>
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
    color: colors.textSecondary,
    marginTop: 9
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
  progressBar: {
    height: 8,
    marginBottom: 16,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 2
  },
  sectionContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  sectionDescription: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20
  },
  questionsContainer: {
    marginBottom: 24
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  questionText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 15,
    color: colors.text
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
  nextButton: {
    marginBottom: 12,
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  nextButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  },
  saveButton: {
    backgroundColor: colors.deepTeal,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700'
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'flex-start',
    padding: 8
  },
  backButtonText: {
    color: colors.deepTeal,
    fontFamily: 'Roboto',
    fontSize: 14
  },
  body: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 14
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