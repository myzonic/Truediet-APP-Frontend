import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useResponsiveContentStyle } from '../../theme/responsive';

const steps: [string, string][] = [
  ['Serving Size', 'Start by understanding the serving information so the rest of the label has context.'],
  ['Calories', 'Calories provide information about energy. The number is most useful when considered alongside your overall needs and eating pattern.'],
  ['Protein, Carbohydrates & Fat', 'These macronutrients play different roles in the body and should be understood as part of the whole food and overall diet.'],
  ['Fiber', 'Fiber is found in many plant foods and can contribute to digestive health and overall dietary quality.'],
  ['Added Sugars', 'Added sugars can be one piece of the overall nutrition picture. Avoid judging a food from one number alone.'],
  ['Sodium', 'Sodium content can be useful to understand in the context of your overall eating pattern and individual needs.'],
  ['Ingredients', 'Ingredients are generally listed in descending order by weight. Use the list for context rather than as a simple good-or-bad test.'],
];

export default function LabelReadingScreen({ navigation }: any) {
  const [open, setOpen] = useState<number | null>(1);
  const contentStyle = useResponsiveContentStyle(s.content);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
        <Pressable
          style={s.back}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>LABEL READING</Text>
        <Text style={s.title}>Read the label with context.</Text>
        <Text style={s.subtitle}>
          Nutrition labels contain useful information, but no single number tells the whole story.
        </Text>

        <View style={s.mock}>
          <Text style={s.fact}>Nutrition Facts</Text>
          <View style={s.thick} />
          <Text style={s.mockText}>Serving size</Text>
          <View style={s.line} />
          <Text style={s.calories}>Calories</Text>
          <Text style={s.caloriesValue}>250</Text>
          <View style={s.thick} />
          {['Total Fat', 'Total Carbohydrate', 'Dietary Fiber', 'Added Sugars', 'Protein', 'Sodium'].map((x) => (
            <React.Fragment key={x}>
              <Text style={s.mockText}>{x}</Text>
              <View style={s.line} />
            </React.Fragment>
          ))}
        </View>

        <Text style={s.section}>7 things to look at</Text>
        {steps.map(([title, text], index) => {
          const number = index + 1;
          const expanded = open === number;
          return (
            <Pressable
              key={title}
              style={[s.step, expanded && s.stepOpen]}
              onPress={() => setOpen(expanded ? null : number)}
            >
              <View style={s.stepHeader}>
                <View style={s.num}>
                  <Text style={s.numText}>{number}</Text>
                </View>
                <Text style={s.stepTitle}>{title}</Text>
                {expanded ? (
                  <ChevronUp size={18} color={colors.deepTeal} />
                ) : (
                  <ChevronDown size={18} color={colors.muted} />
                )}
              </View>
              {expanded && <Text style={s.stepText}>{text}</Text>}
            </Pressable>
          );
        })}

        <View style={s.final}>
          <Text style={s.finalTitle}>Look at the bigger picture.</Text>
          <Text style={s.finalText}>
            A nutrition label is a tool for information — not a score that determines whether a food is “good” or “bad.”
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 48 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  eyebrow: { fontFamily: 'Roboto', color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontFamily: 'Roboto', fontSize: 28, lineHeight: 36, fontWeight: '700', color: colors.text, marginTop: 6 },
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  mock: { backgroundColor: '#fff', borderWidth: 2, borderColor: colors.text, padding: 16, marginTop: 22, borderRadius: 8 },
  fact: { fontFamily: 'Roboto', fontSize: 26, fontWeight: '900', color: colors.text },
  thick: { height: 6, backgroundColor: colors.text, marginVertical: 7 },
  line: { height: 1, backgroundColor: colors.text, marginVertical: 6 },
  mockText: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '600', color: colors.text },
  calories: { fontFamily: 'Roboto', fontSize: 14, fontWeight: '700', color: colors.text },
  caloriesValue: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '900', color: colors.text },
  section: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 26, marginBottom: 12 },
  step: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 9 },
  stepOpen: { borderColor: colors.green, backgroundColor: colors.softGreen },
  stepHeader: { flexDirection: 'row', alignItems: 'center' },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.deepTeal, justifyContent: 'center', alignItems: 'center' },
  numText: { fontFamily: 'Roboto', color: '#fff', fontWeight: '700', fontSize: 13 },
  stepTitle: { fontFamily: 'Roboto', flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.text, marginLeft: 12 },
  stepText: { fontFamily: 'Roboto', fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 10, marginLeft: 42 },
  final: { backgroundColor: colors.softBlue, borderRadius: 18, padding: 18, marginTop: 16 },
  finalTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text },
  finalText: { fontFamily: 'Roboto', fontSize: 12.5, lineHeight: 19, color: colors.textSecondary, marginTop: 5 },
});
