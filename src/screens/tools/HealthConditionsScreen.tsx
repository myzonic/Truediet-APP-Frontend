import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Check, Info, Search, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { dimensions, radius, spacing } from '../../theme/tokens';
import { loadProfile, saveProfile } from '../../lib/profile';

interface ConditionEntry {
  id: string;
  name: string;
  description: string;
  nutritionNotes: string;
}

const CONDITION_LIBRARY: ConditionEntry[] = [
  { id: 'prediabetes', name: 'Prediabetes', description: 'Blood sugar levels higher than normal range', nutritionNotes: 'Focus on fiber-rich whole grains, legumes, non-starchy vegetables, and pairing carbohydrates with protein or healthy fats.' },
  { id: 'type1-diabetes', name: 'Type 1 Diabetes', description: 'Autoimmune condition requiring insulin coordination', nutritionNotes: 'Consistent carbohydrate awareness, meal timing coordination with insulin, and working closely with your care team.' },
  { id: 'type2-diabetes', name: 'Type 2 Diabetes', description: 'Metabolic condition involving insulin resistance', nutritionNotes: 'Balanced plates with steady carbohydrates, high fiber, lean proteins, and limiting sugar-sweetened beverages.' },
  { id: 'high-cholesterol', name: 'High Cholesterol', description: 'Elevated LDL or total blood cholesterol', nutritionNotes: 'Emphasize soluble fiber (oats, beans, fruit), unsaturated fats (olive oil, nuts, fish), and limit saturated fats.' },
  { id: 'high-blood-pressure', name: 'High Blood Pressure', description: 'Elevated blood pressure (hypertension)', nutritionNotes: 'DASH-style eating pattern rich in potassium, magnesium, fruits, vegetables, and mindful sodium reduction.' },
  { id: 'cardiovascular', name: 'Cardiovascular Health', description: 'Heart and blood vessel health support', nutritionNotes: 'Omega-3 rich fish, colorful plants, whole grains, legumes, and minimally processed foods.' },
  { id: 'pcos', name: 'PCOS', description: 'Polycystic Ovary Syndrome', nutritionNotes: 'Steady blood sugar pairing, anti-inflammatory whole foods, adequate protein, and non-restrictive consistency.' },
  { id: 'ibs', name: 'IBS', description: 'Irritable Bowel Syndrome', nutritionNotes: 'Identify personal triggers calmly, consider soluble fiber adjustments, regular meal pacing, and hydration.' },
  { id: 'gerd', name: 'GERD / Reflux', description: 'Gastroesophageal reflux', nutritionNotes: 'Smaller, unhurried meals, staying upright after eating, and noticing individual trigger foods.' },
  { id: 'celiac', name: 'Celiac Disease', description: 'Autoimmune reaction to gluten', nutritionNotes: 'Strict avoidance of wheat, barley, and rye; focus on naturally gluten-free grains like quinoa, rice, and certified oats.' },
  { id: 'fatty-liver', name: 'Fatty Liver (MASLD)', description: 'Fat accumulation in the liver', nutritionNotes: 'Mediterranean-style pattern with vegetables, legumes, fish, olive oil, and reduced added sugars.' },
  { id: 'kidney', name: 'Chronic Kidney Disease', description: 'Reduced kidney filtration over time', nutritionNotes: 'Individualized protein, sodium, potassium, and phosphorus guidance coordinated with a renal dietitian.' },
  { id: 'osteoporosis', name: 'Osteoporosis / Bone Health', description: 'Reduced bone mineral density', nutritionNotes: 'Adequate calcium, vitamin D, protein, and weight-bearing movement.' },
  { id: 'iron-deficiency', name: 'Iron Deficiency', description: 'Low iron stores or anemia risk', nutritionNotes: 'Pair iron-rich foods (lean meats, lentils, spinach) with vitamin C sources to support absorption.' },
];

const CONDITION_PREFIX = 'Condition: ';

export default function HealthConditionsScreen({ navigation }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [otherPrefs, setOtherPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((res) => {
        if (!active) return;
        const list: string[] = Array.isArray(res?.profile?.dietaryPreferences)
          ? res!.profile!.dietaryPreferences
          : [];
        const savedCondNames = list
          .filter((item) => item.startsWith(CONDITION_PREFIX))
          .map((item) => item.slice(CONDITION_PREFIX.length).toLowerCase());
        const keptPrefs = list.filter((item) => !item.startsWith(CONDITION_PREFIX));
        setOtherPrefs(keptPrefs);
        const matched = CONDITION_LIBRARY.filter((c) =>
          savedCondNames.includes(c.name.toLowerCase())
        ).map((c) => c.id);
        setSelectedIds(matched);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleCondition = (id: string) => {
    setStatusMsg('');
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setStatusMsg('');
    const condTags = CONDITION_LIBRARY.filter((c) => selectedIds.includes(c.id)).map(
      (c) => `${CONDITION_PREFIX}${c.name}`
    );
    try {
      await saveProfile({
        dietaryPreferences: [...otherPrefs, ...condTags],
      });
      setStatusMsg('Your health condition preferences have been saved to your profile.');
      Alert.alert('Saved', 'Your health condition guidance preferences have been saved.');
    } catch (e: any) {
      Alert.alert('Could not save', e?.message || 'Please sign in and try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredConditions = CONDITION_LIBRARY.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow="HEALTH CONDITIONS" title="Condition-aware nutrition." onBack={() => navigation.goBack()} />
        <Text style={s.subtitle}>
          Select any health conditions you want educational context for. Tap "Notes" on any item to read Registered Dietitian guidance.
        </Text>

        <View style={s.searchBox}>
          <Search size={18} color={colors.muted} />
          <TextInput
            placeholder="Search conditions…"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.muted}
            style={s.searchInput}
          />
        </View>

        {loading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={colors.deepTeal} />
          </View>
        ) : (
          <View style={s.list}>
            {filteredConditions.map((condition) => {
              const isSaved = selectedIds.includes(condition.id);
              return (
                <View key={condition.id} style={[s.card, isSaved && s.cardActive]}>
                  <Pressable style={s.cardMain} onPress={() => toggleCondition(condition.id)}>
                    <View style={[s.checkbox, isSaved && s.checkboxOn]}>
                      {isSaved ? <Check size={14} color="#fff" /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>{condition.name}</Text>
                      <Text style={s.cardSub}>{condition.description}</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={s.notesBtn}
                    onPress={() => Alert.alert(condition.name, condition.nutritionNotes)}
                  >
                    <Info size={14} color={colors.deepTeal} />
                    <Text style={s.notesBtnText}>Notes</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={s.disclaimer}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.disclaimerText}>
            Educational information only — never a substitute for individualized medical nutrition therapy or physician care.
          </Text>
        </View>

        {statusMsg ? <Text style={s.saved}>{statusMsg}</Text> : null}

        <Pressable style={[s.primary, saving && { opacity: 0.6 }]} disabled={saving} onPress={handleSave}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Save Selected Conditions</Text>}
        </Pressable>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  searchBox: { minHeight: dimensions.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 10, marginTop: spacing.lg },
  searchInput: { flex: 1, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  list: { marginTop: spacing.lg, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.cardPadding, gap: 10 },
  cardActive: { borderColor: colors.green, backgroundColor: colors.softGreen },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  checkboxOn: { backgroundColor: colors.green, borderColor: colors.green },
  cardTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 2 },
  notesBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.sm, backgroundColor: colors.softBlue },
  notesBtnText: { fontFamily: 'Roboto', fontSize: 12, fontWeight: '700', color: colors.deepTeal },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: colors.softBlue, borderRadius: radius.lg, padding: spacing.cardPadding, marginTop: spacing.xl, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
  saved: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.green, marginTop: spacing.sm, textAlign: 'center' },
  primary: { minHeight: dimensions.buttonHeight, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  primaryText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff', flexShrink: 1, textAlign: 'center' },
});
