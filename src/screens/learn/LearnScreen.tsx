import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { BookOpen, Brain, Calculator, Calendar, ChevronRight, Droplet, Heart, Leaf, Mic, Music, Search, ShieldCheck, Utensils, Zap } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { loadTopics, loadLibrary, LibraryItem } from '../../lib/contentLibrary';

interface LibraryCategory {
  key: string;
  title: string;
  description: string;
  icon: any;
}

const CATEGORIES: LibraryCategory[] = [
  { key: 'nutrition-fundamentals', title: 'Nutrition Fundamentals', description: 'Build a strong foundation', icon: BookOpen },
  { key: 'macronutrients', title: 'Macronutrients', description: 'Protein, carbs, and fats', icon: Utensils },
  { key: 'vitamins-minerals', title: 'Vitamins & Minerals', description: 'Essential micronutrients', icon: Brain },
  { key: 'healthy-eating', title: 'Healthy Eating', description: 'Everyday nutrition guidance', icon: Leaf },
  { key: 'weight-management', title: 'Weight Management', description: 'Sustainable approaches', icon: Calculator },
  { key: 'digestive-health', title: 'Digestive Health', description: 'Gut health and nutrition', icon: ShieldCheck },
  { key: 'heart-health', title: 'Heart Health', description: 'Cardiovascular nutrition', icon: Heart },
  { key: 'blood-sugar-diabetes', title: 'Blood Sugar & Diabetes', description: 'Glucose management education', icon: Droplet },
  { key: 'food-allergies', title: 'Food Allergies & Intolerances', description: 'Managing food reactions', icon: ShieldCheck },
  { key: 'sports-nutrition', title: 'Sports Nutrition', description: 'Fuel for active lifestyles', icon: Zap },
  { key: 'mindful-eating', title: 'Mindful Eating', description: 'Build a healthy relationship with food', icon: Brain },
  { key: 'meal-planning', title: 'Meal Planning', description: 'Plan and prepare with confidence', icon: Calendar },
  { key: 'food-science-myths', title: 'Food Science & Myths', description: 'Evidence over trends', icon: BookOpen },
];

export default function LearnScreen({ navigation }: any) {
  const [topics, setTopics] = useState<{ title: string; subtitle: string }[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const loadedTopics = await loadTopics();
        if (active) setTopics(loadedTopics.map((t) => ({ title: t.title, subtitle: t.subtitle })));

        const loadedLibrary = await loadLibrary('resource');
        if (active) setLibraryItems(loadedLibrary);
        if (active) setSelectedCategory(CATEGORIES[0]);
      } catch {
        if (active) setLibraryItems([]);
      }
      if (active) setLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  const filteredItems = selectedCategory
    ? libraryItems.filter((item) => item.category === selectedCategory.key)
    : [];

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%', alignItems: 'center' }}
      >
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={s.eyebrow}>LEARN</Text>
          <Text style={s.title}>Understand nutrition.</Text>
          <Text style={s.copy}>Clear, practical nutrition education built around evidence — not trends or food rules.</Text>

          <Pressable style={s.searchBar} onPress={() => navigation.getParent()?.navigate('SearchScreen')}>
            <Search size={19} color={colors.muted} />
            <Text style={s.searchText}>Search nutrition topics</Text>
          </Pressable>

          <Pressable style={s.resourcesHub} onPress={() => navigation.getParent()?.navigate('Resources')}>
            <View style={s.resourcesHubIcon}>
              <BookOpen size={22} color={colors.deepTeal} />
            </View>
            <View style={s.resourcesHubText}>
              <Text style={s.resourcesHubTitle}>Resources Hub</Text>
              <Text style={s.resourcesHubSub}>Explore trusted resources to support your nutrition journey.</Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </Pressable>

          <Text style={s.sectionLabel}>Explore Topics</Text>
          {topics.map((topic) => (
            <Pressable
              key={topic.title}
              style={s.categoryRow}
              onPress={() => navigation.getParent()?.navigate('Topic', { category: topic.title, title: topic.title })}
            >
              <View style={s.categoryIcon}>
                <BookOpen size={21} color={colors.deepTeal} />
              </View>
              <View style={s.categoryText}>
                <Text style={s.categoryTitle}>{topic.title}</Text>
                <Text style={s.categorySub}>{topic.subtitle}</Text>
              </View>
            </Pressable>
          ))}

          <Pressable style={s.banner} onPress={() => navigation.getParent()?.navigate('Myths')}>
            <Text style={s.bannerEyebrow}>MYTHS &amp; FACTS</Text>
            <Text style={s.bannerTitle}>Heard a nutrition claim you're not sure about?</Text>
            <Text style={s.bannerCopy}>Look beyond the headline and see what the evidence actually says.</Text>
            <Text style={s.bannerAction}>Explore nutrition myths →</Text>
          </Pressable>

          <Text style={s.sectionLabel}>Library</Text>
          <Text style={s.libraryIntro}>Your trusted space for evidence-based nutrition education.</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.deepTeal} />
          ) : (
            <>
              <View style={s.categoryGrid}>
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Pressable
                      key={category.key}
                      style={[
                        s.categoryCard,
                        selectedCategory?.key === category.key && s.categoryCardActive,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <View style={s.categoryCardIcon}>
                        <Icon size={20} color={colors.deepTeal} />
                      </View>
                      <Text style={s.categoryCardTitle}>{category.title}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedCategory ? (
                <View style={s.resultsSection}>
                  <Text style={s.resultsTitle}>{selectedCategory.title}</Text>
                  <Text style={s.resultsCount}>
                    {filteredItems.length} {filteredItems.length === 1 ? 'resource' : 'resources'}
                  </Text>
                  {filteredItems.length === 0 ? (
                    <View style={s.emptyState}>
                      <Text style={s.emptyTitle}>No resources in this category yet</Text>
                      <Text style={s.emptyText}>New educational content is added regularly.</Text>
                    </View>
                  ) : (
                    filteredItems.map((item) => (
                      <Pressable
                        key={item.id}
                        style={s.itemCard}
                        onPress={() => navigation.navigate('Article', { articleId: item.id, title: item.title })}
                      >
                        <View style={s.itemIcon}>
                          {item.slug?.includes('article') ? (
                            <BookOpen size={20} color={colors.deepTeal} />
                          ) : item.slug?.includes('guide') ? (
                            <Calculator size={20} color={colors.orange} />
                          ) : item.slug?.includes('video') ? (
                            <Music size={20} color={colors.green} />
                          ) : item.slug?.includes('podcast') ? (
                            <Mic size={20} color={colors.green} />
                          ) : (
                            <ShieldCheck size={20} color={colors.deepTeal} />
                          )}
                        </View>
                        <View style={s.itemContent}>
                          <Text style={s.itemTitle}>{item.title}</Text>
                          <Text style={s.itemSub}>{item.subtitle}</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, padding: 24, paddingTop: 18, paddingBottom: 36, backgroundColor: colors.background },
  eyebrow: { fontFamily: 'Roboto', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 30, fontWeight: '700', color: colors.text, marginTop: 8 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 9 },
  searchBar: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24 },
  searchText: { fontFamily: 'Roboto', fontSize: 14, color: colors.textSecondary, flex: 1, marginLeft: 10 },
  resourcesHub: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 20, padding: 16, marginTop: 18 },
  resourcesHubIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  resourcesHubText: { flex: 1, marginHorizontal: 14 },
  resourcesHubTitle: { fontFamily: 'Roboto', fontSize: 17, fontWeight: '700', color: colors.text },
  resourcesHubSub: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginTop: 3 },
  sectionLabel: { fontFamily: 'Roboto', fontSize: 19, fontWeight: '700', color: colors.text, marginTop: 28, marginBottom: 14 },
  categoryRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 10 },
  categoryIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  categoryText: { flex: 1, marginLeft: 14 },
  categoryTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  categorySub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  banner: { backgroundColor: colors.softGreen, padding: 22, borderRadius: 22, marginTop: 16, marginBottom: 8 },
  bannerEyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  bannerTitle: { fontFamily: 'Roboto', fontSize: 20, lineHeight: 27, fontWeight: '700', color: colors.text, marginTop: 9 },
  bannerCopy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 8 },
  bannerAction: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal, marginTop: 15 },
  libraryIntro: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  categoryCard: { width: '30%', minWidth: 90, paddingVertical: 14, paddingHorizontal: 8, backgroundColor: colors.surface, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  categoryCardActive: { borderColor: colors.deepTeal, backgroundColor: colors.softBlue },
  categoryCardIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryCardTitle: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', color: colors.text, textAlign: 'center' },
  resultsSection: { marginTop: 24 },
  resultsTitle: { fontFamily: 'Roboto', fontSize: 20, fontWeight: '700', color: colors.text },
  resultsCount: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 14 },
  itemCard: { minHeight: 72, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 10 },
  itemIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1, marginLeft: 14 },
  itemTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  itemSub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  emptyState: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 22, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text },
  emptyText: { fontFamily: 'Roboto', fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 7 },
});