import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import {
  BookOpen,
  Brain,
  Calculator,
  Calendar,
  ChevronRight,
  Droplet,
  Headphones,
  Heart,
  Leaf,
  Mic,
  Play,
  Search,
  ShieldCheck,
  Utensils,
  Zap,
} from 'lucide-react-native';
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
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | null>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);

  const open = (route: string, params?: any) => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate(route, params);
    else navigation.navigate(route, params);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [loadedTopics, loadedLibrary] = await Promise.all([
          loadTopics(),
          loadLibrary('resource'),
        ]);
        if (active) {
          setTopics(loadedTopics.map((t) => ({ title: t.title, subtitle: t.subtitle })));
          setLibraryItems(loadedLibrary);
        }
      } catch {
        if (active) setLibraryItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = selectedCategory
    ? libraryItems.filter(
        (item) =>
          !item.category ||
          item.category.toLowerCase() === selectedCategory.key ||
          item.category.toLowerCase() === selectedCategory.title.toLowerCase()
      )
    : libraryItems;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%', alignItems: 'center' }}
      >
        <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={s.eyebrow}>LEARN</Text>
          <Text style={s.title}>Understand nutrition.</Text>
          <Text style={s.copy}>
            Clear, practical nutrition education built around evidence — not trends or food rules.
          </Text>

          <Pressable style={s.searchBar} onPress={() => open('SearchScreen')}>
            <Search size={19} color={colors.muted} />
            <Text style={s.searchText}>Search nutrition topics, articles & myths</Text>
          </Pressable>

          {/* Resources Hub Entry Point (preserves ResourceHub route without a 6th bottom tab) */}
          <Pressable style={s.resourcesHub} onPress={() => open('Resources')}>
            <View style={s.resourcesHubIcon}>
              <BookOpen size={22} color={colors.deepTeal} />
            </View>
            <View style={s.resourcesHubText}>
              <Text style={s.resourcesHubTitle}>Resources Hub</Text>
              <Text style={s.resourcesHubSub}>
                Meal plans, grocery lists, worksheets, checklists, templates & nutrition reference.
              </Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </Pressable>

          {/* Media & Live Learning Shortcuts */}
          <View style={s.mediaGrid}>
            <Pressable style={s.mediaTile} onPress={() => open('Blog')}>
              <BookOpen size={19} color={colors.deepTeal} />
              <Text style={s.mediaTileTitle}>Articles</Text>
            </Pressable>
            <Pressable style={s.mediaTile} onPress={() => open('Webinars')}>
              <Play size={19} color={colors.green} />
              <Text style={s.mediaTileTitle}>Webinars</Text>
            </Pressable>
            <Pressable style={s.mediaTile} onPress={() => open('RecordedClasses')}>
              <Play size={19} color={colors.orange} />
              <Text style={s.mediaTileTitle}>Classes</Text>
            </Pressable>
            <Pressable style={s.mediaTile} onPress={() => open('Podcast')}>
              <Headphones size={19} color={colors.deepTeal} />
              <Text style={s.mediaTileTitle}>Podcast</Text>
            </Pressable>
            <Pressable style={s.mediaTile} onPress={() => open('SavedContent')}>
              <Heart size={19} color={colors.green} />
              <Text style={s.mediaTileTitle}>Saved</Text>
            </Pressable>
            <Pressable style={s.mediaTile} onPress={() => open('MyResources')}>
              <Calendar size={19} color={colors.deepTeal} />
              <Text style={s.mediaTileTitle}>History</Text>
            </Pressable>
          </View>

          <Text style={s.sectionLabel}>Explore Topics</Text>
          {topics.map((topic) => (
            <Pressable
              key={topic.title}
              style={s.categoryRow}
              onPress={() => open('Topic', { category: topic.title, title: topic.title })}
            >
              <View style={s.categoryIcon}>
                <BookOpen size={21} color={colors.deepTeal} />
              </View>
              <View style={s.categoryText}>
                <Text style={s.categoryTitle}>{topic.title}</Text>
                <Text style={s.categorySub}>{topic.subtitle}</Text>
              </View>
              <ChevronRight size={19} color={colors.muted} />
            </Pressable>
          ))}

          <Pressable style={s.banner} onPress={() => open('Myths')}>
            <Text style={s.bannerEyebrow}>NUTRITION TRUTH · MYTHS & FACTS</Text>
            <Text style={s.bannerTitle}>Heard a nutrition claim you're not sure about?</Text>
            <Text style={s.bannerCopy}>
              Look beyond the headline and see what the evidence actually says.
            </Text>
            <Text style={s.bannerAction}>Explore nutrition myths →</Text>
          </Pressable>

          <Text style={s.sectionLabel}>Education Library</Text>
          <Text style={s.libraryIntro}>
            Browse our structured nutrition curriculum by focus area.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.deepTeal} style={{ marginTop: 18 }} />
          ) : (
            <>
              <View style={s.categoryGrid}>
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const active = selectedCategory?.key === category.key;
                  return (
                    <Pressable
                      key={category.key}
                      style={[s.categoryCard, active && s.categoryCardActive]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <View style={s.categoryCardIcon}>
                        <Icon size={19} color={colors.deepTeal} />
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
                    <Pressable
                      style={s.emptyState}
                      onPress={() => open('Topic', { category: selectedCategory.title, title: selectedCategory.title })}
                    >
                      <Text style={s.emptyTitle}>Explore {selectedCategory.title}</Text>
                      <Text style={s.emptyText}>
                        Tap to open articles and guidance on {selectedCategory.title.toLowerCase()}.
                      </Text>
                    </Pressable>
                  ) : (
                    filteredItems.map((item) => (
                      <Pressable
                        key={item.id}
                        style={s.itemCard}
                        onPress={() => open('ResourceDetail', { slug: item.slug, title: item.title })}
                      >
                        <View style={s.itemIcon}>
                          {item.slug?.includes('podcast') ? (
                            <Mic size={20} color={colors.green} />
                          ) : (
                            <BookOpen size={20} color={colors.deepTeal} />
                          )}
                        </View>
                        <View style={s.itemContent}>
                          <Text style={s.itemTitle}>{item.title}</Text>
                          <Text style={s.itemSub}>{item.subtitle}</Text>
                        </View>
                        <ChevronRight size={18} color={colors.muted} />
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
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  eyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
  copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 8 },
  searchBar: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 20,
  },
  searchText: { fontFamily: 'Roboto', fontSize: 14, color: colors.textSecondary, flex: 1, marginLeft: 10 },
  resourcesHub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
  },
  resourcesHubIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourcesHubText: { flex: 1, marginHorizontal: 12 },
  resourcesHubTitle: { fontFamily: 'Roboto', fontSize: 16, fontWeight: '700', color: colors.text },
  resourcesHubSub: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 2 },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  mediaTile: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 94,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mediaTileTitle: { fontFamily: 'Roboto', fontSize: 12.5, fontWeight: '700', color: colors.text },
  sectionLabel: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 26, marginBottom: 12 },
  categoryRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: { flex: 1, marginLeft: 12, marginRight: 8 },
  categoryTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  categorySub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  banner: { backgroundColor: colors.softGreen, padding: 20, borderRadius: 20, marginTop: 14, marginBottom: 6 },
  bannerEyebrow: { fontFamily: 'Roboto', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.green },
  bannerTitle: { fontFamily: 'Roboto', fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.text, marginTop: 8 },
  bannerCopy: { fontFamily: 'Roboto', fontSize: 13.5, lineHeight: 20, color: colors.textSecondary, marginTop: 6 },
  bannerAction: { fontFamily: 'Roboto', fontSize: 13, fontWeight: '700', color: colors.deepTeal, marginTop: 12 },
  libraryIntro: { fontFamily: 'Roboto', fontSize: 13.5, lineHeight: 20, color: colors.textSecondary, marginTop: 2 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  categoryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 136,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardActive: { borderColor: colors.deepTeal, backgroundColor: colors.softBlue },
  categoryCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardTitle: { flex: 1, fontFamily: 'Roboto', fontSize: 12.5, fontWeight: '700', color: colors.text },
  resultsSection: { marginTop: 20 },
  resultsTitle: { fontFamily: 'Roboto', fontSize: 18, fontWeight: '700', color: colors.text },
  resultsCount: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 3, marginBottom: 12 },
  itemCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  itemTitle: { fontFamily: 'Roboto', fontSize: 14.5, fontWeight: '700', color: colors.text },
  itemSub: { fontFamily: 'Roboto', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyState: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.deepTeal },
  emptyText: { fontFamily: 'Roboto', fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 5, textAlign: 'center' },
});
