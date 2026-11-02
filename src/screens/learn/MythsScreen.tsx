import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { searchMyths } from '../../lib/mythContent';
import { loadMyths } from '../../lib/contentLibrary';
import { Myth } from '../../lib/mythContent';

export default function MythsScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Myth[] | null>(null);

  useEffect(() => {
    let active = true;
    loadMyths()
      .then((loaded) => {
        if (active) setItems(loaded);
      })
      .catch(() => {
        if (active) setItems(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const source = items ?? searchMyths('');
    const term = query.trim().toLowerCase();
    if (!term) return source;
    return source.filter(
      (m) =>
        m.claim.toLowerCase().includes(term) ||
        m.short.toLowerCase().includes(term) ||
        m.label.toLowerCase().includes(term)
    );
  }, [items, query]);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Pressable style={s.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>MYTHS & MISINFORMATION</Text>
        <Text style={s.title}>Nutrition claims deserve context.</Text>
        <Text style={s.copy}>
          Explore common food and nutrition claims and understand what the evidence actually tells us.
        </Text>
        <View style={s.search}>
          <Search size={19} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={s.input}
            placeholder="Search a nutrition claim"
            placeholderTextColor={colors.muted}
          />
        </View>
        <Text style={s.section}>{query.trim() ? 'Results' : 'Common Claims'}</Text>
        {results.length === 0 ? (
          <Text style={s.empty}>No claims match “{query.trim()}”. Try another word.</Text>
        ) : (
          results.map((m) => (
            <Pressable
              key={m.id}
              style={s.card}
              onPress={() => navigation.navigate('MythDetail', { mythId: m.id, claim: m.claim })}
            >
              <Text style={s.label}>{m.label}</Text>
              <View style={s.claimRow}>
                <Text style={s.claim}>“{m.claim}”</Text>
                <ChevronRight size={19} color={colors.muted} />
              </View>
              <Text style={s.read}>Read the evidence</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' }, content: { width: '100%', maxWidth: 412, padding: 24, paddingBottom: 40, backgroundColor: colors.background }, back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 25 }, eyebrow: { fontFamily: 'Roboto', color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 }, title: { fontFamily: 'Roboto', fontSize: 30, lineHeight: 38, fontWeight: '700', color: colors.text, marginTop: 8 }, copy: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 9 }, search: { height: 52, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 24 }, input: { flex: 1, marginLeft: 10, fontFamily: 'Roboto', fontSize: 14, color: colors.text }, section: { fontFamily: 'Roboto', fontSize: 19, fontWeight: '700', color: colors.text, marginTop: 28, marginBottom: 14 }, empty: { fontFamily: 'Roboto', fontSize: 13, lineHeight: 20, color: colors.textSecondary }, card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 12 }, label: { fontFamily: 'Roboto', color: colors.orange, fontSize: 9, letterSpacing: 1.1, fontWeight: '700' }, claimRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9 }, claim: { fontFamily: 'Roboto', flex: 1, paddingRight: 15, fontSize: 17, lineHeight: 24, fontWeight: '700', color: colors.text }, read: { fontFamily: 'Roboto', color: colors.deepTeal, fontSize: 12, fontWeight: '700', marginTop: 13 } });
