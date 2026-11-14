import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { Apple, BookOpen, Brain, ChevronRight, FlaskConical, Scale, Search, Tag } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { loadTopics } from '../../lib/contentLibrary';

const ICONS: Record<string, any> = {
  'Nutrition Basics': BookOpen,
  'Calories & Energy Balance': Scale,
  Macronutrients: Apple,
  'Food Labels': Tag,
  'Myths & Misinformation': Brain,
  'Peptides & Supplements': FlaskConical,
};

export default function LearnScreen({ navigation }: any) {
  const [topics, setTopics] = useState<{ title: string; subtitle: string }[]>([]);

  useEffect(() => {
    let active = true;
    loadTopics()
      .then((loaded) => {
        if (active) setTopics(loaded.map((t) => ({ title: t.title, subtitle: t.subtitle })));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>LEARN</Text>
        <Text style={s.title}>Understand nutrition.</Text>
        <Text style={s.copy}>
          Clear, practical nutrition education built around evidence - not trends or food rules.
        </Text>
        <Pressable style={s.search} onPress={() => navigation.getParent()?.navigate('SearchScreen')}>
          <Search size={19} color={colors.muted} />
          <Text style={s.input}>Search nutrition topics</Text>
        </Pressable>
        <Text style={s.section}>Explore Topics</Text>
        {topics.map((topic) => {
          const Icon = ICONS[topic.title] || BookOpen;
          return (
            <Pressable
              key={topic.title}
              style={s.category}
              onPress={() => navigation.getParent()?.navigate('Topic', { category: topic.title, title: topic.title })}
            >
              <View style={s.icon}>
                <Icon size={21} color={colors.deepTeal} />
              </View>
              <View style={s.categoryText}>
                <Text style={s.categoryTitle}>{topic.title}</Text>
                <Text style={s.categorySub}>{topic.subtitle}</Text>
              </View>
              <ChevronRight size={19} color={colors.muted} />
            </Pressable>
          );
        })}
        <Pressable style={s.banner} onPress={() => navigation.getParent()?.navigate('Myths')}>
          <Text style={s.eyebrow}>MYTHS & FACTS</Text>
          <Text style={s.bannerTitle}>Heard a nutrition claim you're not sure about?</Text>
          <Text style={s.copy}>Look beyond the headline and see what the evidence actually says.</Text>
          <Text style={s.action}>Explore nutrition myths →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' },
  content: { width: '100%', maxWidth:CONTENT_MAX_WIDTH, padding: 24, paddingTop: 18, paddingBottom: 36, backgroundColor: colors.background },
  eyebrow: { fontFamily: 'Roboto', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 30, fontWeight: '700', color: colors.text, marginTop: 8 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 9 },
  search: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24 },
  input: { fontFamily: 'Roboto', fontSize: 14, color: colors.text, flex: 1, marginLeft: 10 },
  section: { fontFamily: 'Roboto', fontSize: 19, fontWeight: '700', color: colors.text, marginTop: 28, marginBottom: 14 },
  category: { minHeight: 76, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  categoryText: { flex: 1, marginLeft: 14 },
  categoryTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  categorySub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  banner: { backgroundColor: colors.softGreen, padding: 22, borderRadius: 22, marginTop: 10 },
  bannerTitle: { fontFamily: 'Roboto', fontSize: 20, lineHeight: 27, fontWeight: '700', color: colors.text, marginTop: 9 },
  action: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal, marginTop: 15 },
});
