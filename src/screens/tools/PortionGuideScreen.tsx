import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Hand, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const portionData = [
  {
    key: 'protein',
    title: 'Protein Portions',
    cue: 'Palm of your hand',
    items: [
      { name: 'Poultry, Fish, or Lean Meat', description: '1 palm-sized portion', measurement: 'approx. 3–4 oz (85–115 g) cooked' },
      { name: 'Tofu, Tempeh, or Beans', description: '1 fist-sized portion', measurement: 'approx. 1/2 to 3/4 cup (125 g)' },
      { name: 'Eggs or Greek Yogurt', description: '2 eggs or 1 cupped hand', measurement: 'approx. 3/4 cup yogurt' },
    ],
  },
  {
    key: 'vegetables',
    title: 'Non-Starchy Vegetables',
    cue: '1–2 fists',
    items: [
      { name: 'Leafy Greens', description: '2 open handfuls', measurement: 'approx. 1–2 cups raw' },
      { name: 'Cooked Broccoli, Peppers, Carrots', description: '1 fist-sized portion', measurement: 'approx. 1 cup cooked' },
    ],
  },
  {
    key: 'grains',
    title: 'Grains & Starches',
    cue: '1 cupped hand',
    items: [
      { name: 'Cooked Rice, Quinoa, or Pasta', description: '1 cupped hand', measurement: 'approx. 1/2 to 3/4 cup cooked' },
      { name: 'Potatoes or Sweet Potatoes', description: '1 fist-sized portion', measurement: 'approx. 1 medium potato' },
      { name: 'Whole Grain Bread', description: '1 flat palm', measurement: '1–2 standard slices' },
    ],
  },
  {
    key: 'fruits',
    title: 'Fruit Portions',
    cue: '1 fist or cupped hand',
    items: [
      { name: 'Whole Fresh Fruit (Apple, Orange)', description: '1 fist / tennis ball', measurement: '1 medium piece' },
      { name: 'Berries or Cut Fruit', description: '1 cupped hand', measurement: 'approx. 1/2 to 1 cup' },
    ],
  },
  {
    key: 'fats',
    title: 'Healthy Fats',
    cue: '1 thumb',
    items: [
      { name: 'Olive Oil, Butter, or Nut Butter', description: '1 thumb tip to full thumb', measurement: 'approx. 1 tsp to 1 tbsp (5–15 ml)' },
      { name: 'Nuts or Seeds', description: '1 small cupped palm', measurement: 'approx. 1/4 cup (28 g)' },
      { name: 'Avocado', description: '2–3 thumb-sized slices', measurement: 'approx. 1/4 to 1/2 medium avocado' },
    ],
  },
];

export default function PortionGuideScreen({ navigation }: any) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Pressable style={s.back} onPress={() => navigation.goBack()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <Text style={s.eyebrow}>PORTION GUIDE</Text>
        <Text style={s.title}>Hand-based portion sizes.</Text>
        <Text style={s.subtitle}>
          Your hand is a portable, proportional guide that scales with your body — no scales or measuring cups required.
        </Text>

        {portionData.map((section) => (
          <View key={section.key} style={s.card}>
            <View style={s.cardHead}>
              <View style={s.iconWrap}>
                <Hand size={18} color={colors.deepTeal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{section.title}</Text>
                <Text style={s.cardCue}>Hand cue: {section.cue}</Text>
              </View>
            </View>
            {section.items.map((item) => (
              <View key={item.name} style={s.itemRow}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemDesc}>
                  {item.description} · {item.measurement}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={s.disclaimer}>
          <ShieldCheck size={18} color={colors.deepTeal} />
          <Text style={s.disclaimerText}>
            Portion guides are starting points, not strict limits. Adjust portions based on your hunger, fullness, and activity level.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 18 },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6, marginBottom: 12 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, padding: 16, marginTop: 12, gap: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text },
  cardCue: { fontFamily: 'Roboto', fontSize: 12, fontWeight: '600', color: colors.deepTeal, marginTop: 2 },
  itemRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8 },
  itemName: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  itemDesc: { fontFamily: 'Roboto', fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: colors.softBlue, borderRadius: 16, padding: 14, marginTop: 20, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.deepTeal },
});
