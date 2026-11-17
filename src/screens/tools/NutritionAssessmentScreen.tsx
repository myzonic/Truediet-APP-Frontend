import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { dimensions, radius, spacing } from '../../theme/tokens';
import { loadProfile, saveProfile } from '../../lib/profile';
import { useOnboarding } from '../../context/OnboardingContext';

const GOALS = [
  'Lose weight',
  'Maintain weight',
  'Gain weight',
  'Build muscle',
  'Improve overall health',
  'Manage a health condition',
  'Understand nutrition better',
];

const SEXES = ['Female', 'Male', 'Prefer not to say'];

const ACTIVITY_LEVELS = [
  'Sedentary (desk job, minimal planned exercise)',
  'Lightly active (light movement 1–3 days/week)',
  'Moderately active (exercise 3–5 days/week)',
  'Very active (intense exercise 6–7 days/week)',
];

const DIETARY_PATTERNS = [
  'Omnivore',
  'Mediterranean',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-free',
  'Dairy-free',
  'High-protein',
];

const COMMON_ALLERGIES = ['Dairy', 'Gluten / Wheat', 'Peanuts', 'Tree nuts', 'Eggs', 'Soy', 'Shellfish', 'Fish'];

export default function NutritionAssessmentScreen({ navigation }: any) {
  const { data, updateData } = useOnboarding();
  const [goal, setGoal] = useState(data.goal || '');
  const [sex, setSex] = useState(data.sex || '');
  const [age, setAge] = useState(data.age || '');
  const [height, setHeight] = useState(data.height || '');
  const [weight, setWeight] = useState(data.weight || '');
  const [activity, setActivity] = useState('');
  const [prefs, setPrefs] = useState<string[]>(data.dietaryPreferences || []);
  const [allergies, setAllergies] = useState<string[]>(data.allergies || []);
  const [customAllergy, setCustomAllergy] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((res) => {
        if (!active) return;
        const p = res?.profile;
        if (p) {
          if (p.goal) setGoal(p.goal);
          if (p.sex) setSex(p.sex);
          if (p.age) setAge(p.age);
          if (p.height) setHeight(p.height);
          if (p.weight) setWeight(p.weight);
          if (Array.isArray(p.dietaryPreferences)) setPrefs(p.dietaryPreferences);
          if (Array.isArray(p.allergies)) setAllergies(p.allergies);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleItem = (value: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const addCustomAllergy = () => {
    const t = customAllergy.trim();
    if (!t) return;
    if (!allergies.includes(t)) setAllergies([...allergies, t]);
    setCustomAllergy('');
  };

  const handleSave = async () => {
    if (saving) return;
    if (!goal) {
      setError('Please select a primary nutrition goal before saving.');
      return;
    }
    setSaving(true);
    setError('');
    const combinedPrefs = activity && !prefs.includes(activity) ? [...prefs, activity] : prefs;
    const payload = {
      goal,
      sex,
      age: age.trim(),
      height: height.trim(),
      weight: weight.trim(),
      allergies,
      dietaryPreferences: combinedPrefs,
      isAssessmentComplete: true,
    };
    updateData(payload);
    try {
      await saveProfile(payload);
      setCompleted(true);
    } catch (e: any) {
      setError(e?.message || 'Could not save your assessment to the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="NUTRITION ASSESSMENT" title="Personalized nutrition evaluation." onBack={() => navigation.goBack()} />
        <Text style={s.subtitle}>
          Review and update your goals, personal measurements, activity level, and dietary needs. Responses persist to your True Diet profile.
        </Text>

        {loading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={colors.deepTeal} />
          </View>
        ) : completed ? (
          <View style={s.doneCard}>
            <CheckCircle2 size={36} color={colors.green} />
            <Text style={s.doneTitle}>Assessment Saved</Text>
            <Text style={s.doneCopy}>
              Your personalized nutrition profile has been updated. Your Home dashboard and recommendations now reflect these answers.
            </Text>
            <Pressable style={s.primary} onPress={() => navigation.goBack()}>
              <Text style={s.primaryText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={s.section}>1. Primary Nutrition Goal</Text>
            <PillGroup>
              {GOALS.map((g) => (
                <Pill key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />
              ))}
            </PillGroup>

            <Text style={s.section}>2. Personal Information</Text>
            <PillGroup style={{ marginBottom: 12 }}>
              {SEXES.map((x) => (
                <Pill key={x} label={x} selected={sex === x} onPress={() => setSex(x)} />
              ))}
            </PillGroup>
            <View style={s.fieldRow}>
              <View style={s.fieldCol}>
                <Text style={s.label}>Age</Text>
                <TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="e.g. 34" placeholderTextColor={colors.muted} style={s.input} />
              </View>
              <View style={s.fieldCol}>
                <Text style={s.label}>Height</Text>
                <TextInput value={height} onChangeText={setHeight} placeholder="e.g. 168 cm" placeholderTextColor={colors.muted} style={s.input} />
              </View>
              <View style={s.fieldCol}>
                <Text style={s.label}>Current Weight</Text>
                <TextInput value={weight} onChangeText={setWeight} placeholder="e.g. 72 kg" placeholderTextColor={colors.muted} style={s.input} />
              </View>
            </View>

            <Text style={s.section}>3. Activity Level</Text>
            <PillGroup>
              {ACTIVITY_LEVELS.map((act) => (
                <Pill key={act} label={act} selected={activity === act} onPress={() => setActivity(act)} />
              ))}
            </PillGroup>

            <Text style={s.section}>4. Dietary Preferences</Text>
            <PillGroup>
              {DIETARY_PATTERNS.map((p) => (
                <Pill
                  key={p}
                  label={p}
                  selected={prefs.includes(p)}
                  onPress={() => toggleItem(p, prefs, setPrefs)}
                />
              ))}
            </PillGroup>

            <Text style={s.section}>5. Allergies & Intolerances</Text>
            <PillGroup>
              {COMMON_ALLERGIES.map((a) => (
                <Pill
                  key={a}
                  label={a}
                  selected={allergies.includes(a)}
                  onPress={() => toggleItem(a, allergies, setAllergies)}
                />
              ))}
            </PillGroup>
            <View style={s.customRow}>
              <TextInput
                value={customAllergy}
                onChangeText={setCustomAllergy}
                placeholder="Add another allergy or intolerance…"
                placeholderTextColor={colors.muted}
                onSubmitEditing={addCustomAllergy}
                style={[s.input, { flex: 1 }]}
              />
              <Pressable style={s.addBtn} onPress={addCustomAllergy}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
              </Pressable>
            </View>

            <View style={s.disclaimer}>
              <ShieldCheck size={18} color={colors.deepTeal} />
              <Text style={s.disclaimerText}>
                Educational disclaimer: This assessment tailors nutrition education and is not a medical diagnosis or clinical prescription.
              </Text>
            </View>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <Pressable style={[s.primary, saving && { opacity: 0.6 }]} disabled={saving} onPress={handleSave}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Save Nutrition Assessment</Text>}
            </Pressable>
          </>
        )}
      </ScreenContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  section: { fontFamily: 'Roboto', fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fieldCol: { flex: 1, minWidth: 96 },
  label: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  input: { height: dimensions.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 12, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  customRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md, alignItems: 'center' },
  addBtn: { height: dimensions.buttonHeightSmall, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: colors.softBlue, borderRadius: radius.lg, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
  error: { fontFamily: 'Roboto', fontSize: 13, color: colors.red, marginTop: spacing.sm },
  primary: { height: dimensions.buttonHeight, borderRadius: radius.lg, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, paddingHorizontal: 20 },
  primaryText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff' },
  doneCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.softGreen, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'center', gap: 10 },
  doneTitle: { fontFamily: 'Roboto', fontSize: 20, fontWeight: '700', color: colors.text },
  doneCopy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, textAlign: 'center' },
});
