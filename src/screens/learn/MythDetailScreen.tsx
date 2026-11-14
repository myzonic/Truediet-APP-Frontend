import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { findMyth, myths, Myth } from '../../lib/mythContent';
import { loadMyths } from '../../lib/contentLibrary';
import { saveContent } from '../../lib/content';

const Section = ({ title, children }: { title: string; children: string }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    <Text style={s.sectionText}>{children}</Text>
  </View>
);

export default function MythDetailScreen({ navigation, route }: any) {
  const params = route.params || {};
  const [myth, setMyth] = useState<Myth | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const fallback = () => {
      const byId = params.mythId ? myths.find((m) => m.id === params.mythId) : undefined;
      return byId || findMyth(params.claim || params.mythId);
    };
    loadMyths()
      .then((list) => {
        if (!active) return;
        const match =
          list.find((m) => m.id === params.mythId) ||
          list.find((m) => m.claim === params.claim);
        setMyth(match || fallback());
      })
      .catch(() => {
        if (active) setMyth(fallback());
      });
    return () => {
      active = false;
    };
  }, [params.mythId, params.claim]);

  const claim = params.claim || myth?.claim || '';

  const onSave = async () => {
    if (saving || !myth) return;
    setSaving(true);
    try {
      await saveContent(`myth-${myth.id}`,{title:claim,subtitle:'Nutrition claim',route:'MythDetail',type:'myth'});
      Alert.alert('Saved', 'This claim was added to your saved content.');
    } catch (e: any) {
      Alert.alert('Could not save', e?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };
  if (!myth) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loading}>
          <ActivityIndicator color={colors.deepTeal} />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Pressable style={s.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={s.eyebrow}>NUTRITION CLAIM</Text>
        <Text style={s.claim}>“{claim}”</Text>
        <View style={s.context}>
          <Text style={s.contextLabel}>CONTEXT MATTERS</Text>
          <Text style={s.contextText}>{myth.short}</Text>
        </View>
        <Section title="What’s Actually True?">{myth.whatIsTrue}</Section>
        <Section title="Why Does This Claim Spread?">{myth.whyItSpreads}</Section>
        <Section title="What Does the Evidence Say?">{myth.evidence}</Section>
        <View style={s.picture}>
          <Text style={s.pictureLabel}>LOOK AT THE BIGGER PICTURE</Text>
          <Text style={s.pictureText}>{myth.takeaway}</Text>
        </View>
        <Pressable style={s.save} onPress={onSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Bookmark size={18} color="#fff" />
              <Text style={s.saveText}>Save for Later</Text>
            </>
          )}
        </Pressable>
        <Text style={s.disclaimer}>
          True Diet content is general nutrition education and is not medical advice. Discuss individual needs with a qualified professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.softBlue, alignItems: 'center' }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { width: '100%', maxWidth:CONTENT_MAX_WIDTH, padding: 24, paddingBottom: 50, backgroundColor: colors.background }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 27 }, eyebrow: { fontFamily: 'Roboto', color: colors.orange, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 }, claim: { fontFamily: 'Roboto', fontSize: 30, lineHeight: 40, fontWeight: '700', color: colors.text, marginTop: 9 }, context: { backgroundColor: colors.softOrange, borderRadius: 20, padding: 20, marginTop: 25 }, contextLabel: { fontFamily: 'Roboto', color: colors.orange, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 }, contextText: { fontFamily: 'Roboto', color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 8 }, section: { marginTop: 30 }, sectionTitle: { fontFamily: 'Roboto', fontSize: 21, fontWeight: '700', color: colors.text, marginBottom: 9 }, sectionText: { fontFamily: 'Roboto', fontSize: 15, lineHeight: 25, color: colors.textSecondary }, picture: { backgroundColor: colors.softGreen, borderRadius: 20, padding: 21, marginTop: 30 }, pictureLabel: { fontFamily: 'Roboto', color: colors.green, fontSize: 10, letterSpacing: 1.2, fontWeight: '700' }, pictureText: { fontFamily: 'Roboto', fontSize: 19, lineHeight: 27, color: colors.text, fontWeight: '700', marginTop: 8 }, save: { height: 56, borderRadius: 17, backgroundColor: colors.deepTeal, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30 }, saveText: { fontFamily: 'Roboto', fontSize: 15, fontWeight: '700', color: '#fff', marginLeft: 8 }, disclaimer: { fontFamily: 'Roboto', fontSize: 10, lineHeight: 16, color: colors.muted, marginTop: 18 } });
