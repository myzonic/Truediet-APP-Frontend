import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { BookOpen, ChevronRight, HeartPulse, Leaf, Target } from 'lucide-react-native';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { loadProfile } from '../lib/profile';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

export default function NutritionProfileScreen({ navigation }: { navigation: any }) {
  const { data, updateData } = useOnboarding();
  const { user } = useAuth();
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user || data.goal) return;
      setHydrating(true);
      try {
        const res = await loadProfile();
        const p = res?.profile;
        if (active && p) {
          updateData({
            goal: p.goal || '',
            age: p.age || '',
            sex: p.sex || '',
            height: p.height || '',
            weight: p.weight || '',
            allergies: Array.isArray(p.allergies) ? p.allergies : [],
            dietaryPreferences: Array.isArray(p.dietaryPreferences) ? p.dietaryPreferences : [],
          });
        }
      } catch (e) {
        // Offline: keep whatever assessment data is already in context.
      } finally {
        if (active) setHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const Row = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={s.summary}>
      <Icon size={20} color={colors.green} />
      <View style={s.summaryBody}>
        <Text style={s.small}>{label}</Text>
        <Text style={s.value}>{value || 'Not selected'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.phone}>
        <Image source={require('../../assets/truediet-logo.png')} style={s.logo} />
        <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
          <Text style={s.eyebrow}>PERSONALIZED EDUCATION</Text>
          <Text style={s.title}>A clearer path starts here.</Text>
          <Text style={s.copy}>
            Your profile guides the education and practical tools True Diet highlights for you.
          </Text>
          {hydrating ? <Text style={s.small}>Loading your profile…</Text> : null}
          <Row icon={Target} label="Your focus" value={data.goal} />
          <Row icon={Leaf} label="Dietary preferences" value={data.dietaryPreferences.join(', ')} />
          <Row icon={HeartPulse} label="Allergy considerations" value={data.allergies.join(', ')} />
          <Text style={s.section}>Recommended to explore</Text>
          {[
            ['Understanding food labels', 'LabelReading'],
            ['Evidence behind nutrition claims', 'Myths'],
            ['Mindful eating tools', 'Tools'],
          ].map(([label, route]) => (
            <Pressable
              key={label}
              style={s.rec}
              onPress={() => navigation.getParent('Root')?.replace('Main', { screen: route })}
            >
              <BookOpen size={19} color={colors.teal} />
              <Text style={s.recText}>{label}</Text>
              <ChevronRight size={19} color={colors.teal} />
            </Pressable>
          ))}
          <View style={s.notice}>
            <Text style={s.noticeText}>
              True Diet provides education, not diagnosis or medical nutrition therapy.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.getParent('Root')?.replace('Main')}
            style={s.button}
          >
            <Text style={s.buttonText}>Go to Home</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paleBlue, alignItems: 'center' },
  phone: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, flex: 1, backgroundColor: '#fff' },
  logo: { width: 94, height: 40, alignSelf: 'center', marginTop: spacing.md, resizeMode: 'contain' },
  wrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.orange, textAlign: 'center' },
  title: { marginTop: spacing.sm, fontSize: 28, lineHeight: 34, fontWeight: '800', color: colors.teal, textAlign: 'center' },
  copy: { marginTop: spacing.md, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  summary: {
    marginTop: spacing.md,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryBody: { flex: 1, minWidth: 0 },
  small: { fontSize: 11, lineHeight: 16, fontWeight: '700', color: colors.muted },
  value: { marginTop: 3, fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.charcoal },
  section: { marginTop: spacing.xl, fontSize: 20, fontWeight: '800', color: colors.teal },
  rec: {
    marginTop: 10,
    padding: 15,
    borderRadius: 14,
    backgroundColor: colors.offWhite,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recText: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', color: colors.charcoal },
  notice: { marginTop: spacing.lg, padding: 14, borderRadius: 14, backgroundColor: colors.paleBlue },
  noticeText: { fontSize: 12, lineHeight: 18, color: colors.teal },
  button: {
    minHeight: 56,
    marginTop: spacing.xl,
    borderRadius: 14,
    backgroundColor: colors.deepBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
