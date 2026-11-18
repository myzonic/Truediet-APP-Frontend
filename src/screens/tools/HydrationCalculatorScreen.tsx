import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Droplet, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { dimensions, radius, spacing } from '../../theme/tokens';
import { addWater, loadTrackingSettings, loadWaterSummary, saveTrackingSettings } from '../../lib/track';

const ACTIVITY_LEVELS: Array<{ key: 'sedentary' | 'light' | 'moderate' | 'very'; label: string; factor: number }> = [
  { key: 'sedentary', label: 'Sedentary', factor: 32 },
  { key: 'light', label: 'Lightly Active', factor: 36 },
  { key: 'moderate', label: 'Moderately Active', factor: 40 },
  { key: 'very', label: 'Very Active', factor: 45 },
];

const CLIMATES: Array<{ key: 'normal' | 'hot' | 'humid'; label: string; multiplier: number }> = [
  { key: 'normal', label: 'Temperate / Normal', multiplier: 1.0 },
  { key: 'humid', label: 'Warm & Humid', multiplier: 1.1 },
  { key: 'hot', label: 'Hot Climate', multiplier: 1.2 },
];

export default function HydrationCalculatorScreen({ navigation }: any) {
  const [weightKg, setWeightKg] = useState('70');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'very'>('moderate');
  const [climate, setClimate] = useState<'normal' | 'hot' | 'humid'>('normal');
  const [todayTotalMl, setTodayTotalMl] = useState(0);
  const [savedGoalMl, setSavedGoalMl] = useState(2000);
  const [savingGoal, setSavingGoal] = useState(false);
  const [loggingWater, setLoggingWater] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([loadWaterSummary().catch(() => null), loadTrackingSettings().catch(() => null)]).then(
      ([w, settings]) => {
        if (!active) return;
        if (w) {
          setTodayTotalMl(w.totalMl);
          setSavedGoalMl(w.dailyGoalMl);
        }
        if (settings?.waterGoalMl) {
          setSavedGoalMl(settings.waterGoalMl);
        }
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const actFactor = ACTIVITY_LEVELS.find((a) => a.key === activity)?.factor || 35;
  const climMult = CLIMATES.find((c) => c.key === climate)?.multiplier || 1;
  const parsedWeight = Math.min(250, Math.max(30, Number(weightKg) || 70));
  const estimatedGoalMl = Math.round((parsedWeight * actFactor * climMult) / 50) * 50;
  const glasses = (estimatedGoalMl / 250).toFixed(1);

  const handleSaveGoal = async () => {
    if (savingGoal) return;
    setSavingGoal(true);
    try {
      await saveTrackingSettings({ waterGoalMl: estimatedGoalMl, weightGoal: null });
      setSavedGoalMl(estimatedGoalMl);
      Alert.alert('Hydration Goal Saved', `Your daily hydration target is now set to ${estimatedGoalMl} ml.`);
    } catch (e: any) {
      Alert.alert('Could not save goal', e?.message || 'Please try again.');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleLogIntake = async (ml: number) => {
    if (loggingWater) return;
    setLoggingWater(true);
    try {
      await addWater(ml);
      const summary = await loadWaterSummary();
      setTodayTotalMl(summary.totalMl);
      Alert.alert('Water Logged', `Added ${ml} ml to today’s hydration total (${summary.totalMl} ml).`);
    } catch (e: any) {
      Alert.alert('Could not log water', e?.message || 'Please try again.');
    } finally {
      setLoggingWater(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="HYDRATION CALCULATOR" title="Estimate your fluid needs." onBack={() => navigation.goBack()} />
        <Text style={s.subtitle}>
          Calculate a practical daily fluid target based on your body weight, movement, and environment, then save it to your Track dashboard.
        </Text>

        <Text style={s.label}>Body Weight (kg)</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="70"
          placeholderTextColor={colors.muted}
          style={s.input}
        />

        <Text style={s.label}>Activity Level</Text>
        <PillGroup>
          {ACTIVITY_LEVELS.map((a) => (
            <Pill key={a.key} label={a.label} selected={activity === a.key} onPress={() => setActivity(a.key)} />
          ))}
        </PillGroup>

        <Text style={s.label}>Climate / Environment</Text>
        <PillGroup>
          {CLIMATES.map((c) => (
            <Pill key={c.key} label={c.label} selected={climate === c.key} onPress={() => setClimate(c.key)} />
          ))}
        </PillGroup>

        <View style={s.resultCard}>
          <Droplet size={26} color={colors.deepTeal} />
          <Text style={s.resultVal}>{estimatedGoalMl} ml / day</Text>
          <Text style={s.resultSub}>
            Approx. {glasses} glasses (250 ml each) · Current saved goal: {savedGoalMl} ml
          </Text>
          <Pressable style={s.primary} onPress={handleSaveGoal} disabled={savingGoal}>
            {savingGoal ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Save as My Daily Water Goal</Text>}
          </Pressable>
        </View>

        <Text style={s.section}>Quick Log Today’s Water ({todayTotalMl} ml logged)</Text>
        <PillGroup>
          {[250, 500, 750].map((ml) => (
            <Pill key={ml} label={`+ Log ${ml} ml`} tone="teal" onPress={() => handleLogIntake(ml)} />
          ))}
        </PillGroup>

        <View style={s.disclaimer}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.disclaimerText}>
            Educational estimate: fluid from water, tea, milk, soups, and water-rich fruits and vegetables all contribute to daily hydration. Certain medical conditions require physician-guided fluid limits.
          </Text>
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  label: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { height: dimensions.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: 'Roboto', fontSize: 15, color: colors.text },
  resultCard: { backgroundColor: colors.softGreen, borderRadius: radius.xl, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'center', gap: 6 },
  resultVal: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '800', color: colors.deepTeal },
  resultSub: { fontFamily: 'Roboto', fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  primary: { minHeight: dimensions.buttonHeight, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: spacing.sm, width: '100%' },
  primaryText: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: '#fff', flexShrink: 1, textAlign: 'center' },
  section: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: colors.softBlue, borderRadius: radius.lg, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
});
