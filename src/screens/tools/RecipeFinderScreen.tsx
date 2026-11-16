import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, ChevronRight, Heart, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Pill, PillGroup } from '../../components/Pill';
import { recipes as defaultRecipes, Recipe } from '../../lib/recipeContent';
import { loadRecipes } from '../../lib/contentLibrary';

export default function RecipeFinderScreen({ navigation }: any) {
  const [items, setItems] = useState<Recipe[]>(defaultRecipes);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let active = true;
    loadRecipes()
      .then((loaded) => {
        if (active && loaded.length) setItems(loaded);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    items.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const catMatch = selectedCategory === 'All' || r.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const qMatch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.whyItWorks.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.toLowerCase().includes(q));
      return catMatch && qMatch;
    });
  }, [items, search, selectedCategory]);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable style={s.back} onPress={() => navigation.goBack()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <Text style={s.eyebrow}>RECIPE FINDER</Text>
        <Text style={s.title}>Flexible meal ideas.</Text>
        <Text style={s.subtitle}>
          Search by title, ingredient, or meal category. Every recipe is a flexible template you can adapt to your preferences.
        </Text>

        <View style={s.searchBox}>
          <Search size={18} color={colors.muted} />
          <TextInput
            placeholder="Search recipes or ingredients…"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.muted}
            style={s.searchInput}
          />
        </View>

        <PillGroup style={{ marginTop: 14 }}>
          {categories.map((cat) => (
            <Pill
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </PillGroup>

        <View style={s.list}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No recipes matched your search. Try another ingredient or category.</Text>
            </View>
          ) : (
            filtered.map((r) => (
              <Pressable
                key={r.id}
                style={s.card}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: r.id, title: r.title })}
              >
                <View style={s.art}>
                  <Heart size={22} color={colors.green} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle}>{r.title}</Text>
                  <Text style={s.cardMeta}>{r.time} · {r.category}</Text>
                  <Text style={s.cardDesc} numberOfLines={2}>
                    {r.whyItWorks}
                  </Text>
                </View>
                <ChevronRight size={19} color={colors.muted} />
              </Pressable>
            ))
          )}
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
  subtitle: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 6 },
  searchBox: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginTop: 18 },
  searchInput: { flex: 1, fontFamily: 'Roboto', fontSize: 14, color: colors.text },
  list: { marginTop: 18, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, padding: 14 },
  art: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.softGreen, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: colors.text },
  cardMeta: { fontFamily: 'Roboto', fontSize: 11.5, fontWeight: '600', color: colors.green, marginTop: 3 },
  cardDesc: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 4 },
  empty: { padding: 24, borderRadius: 16, backgroundColor: colors.softBlue, alignItems: 'center' },
  emptyText: { fontFamily: 'Roboto', fontSize: 13, color: colors.deepTeal, textAlign: 'center' },
});
