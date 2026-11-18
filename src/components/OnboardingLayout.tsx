import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { dimensions, radius, spacing } from '../theme/tokens';

export default function OnboardingLayout({
  step,
  title,
  subtitle,
  onBack,
  onContinue,
  continueDisabled,
  continueText = 'Continue',
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueText?: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.phone}>
        <View style={s.top}>
          <Pressable onPress={onBack} style={s.back} hitSlop={6}>
            <ArrowLeft size={21} color={colors.deepTeal} />
          </Pressable>
          <Image source={require('../../assets/truediet-logo.png')} style={s.brand} resizeMode="contain" />
          <View style={s.back} />
        </View>
        <View style={s.progress}>
          <View style={s.progressText}>
            <Text style={s.step}>ASSESSMENT · STEP {step}/4</Text>
            <Text style={s.step}>{step * 25}%</Text>
          </View>
          <View style={s.track}>
            <View style={[s.fill, { width: `${step * 25}%` }]} />
          </View>
        </View>
        <ScrollView style={{ width: '100%' }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
          <View style={s.options}>{children}</View>
        </ScrollView>
        <View style={s.footer}>
          <View style={s.trust}>
            <ShieldCheck size={15} color={colors.green} />
            <Text style={s.trustText}>Customized by Registered Dietitians</Text>
          </View>
          <Pressable
            disabled={continueDisabled}
            onPress={onContinue}
            style={({ pressed }) => [s.button, continueDisabled && s.disabled, pressed && !continueDisabled && s.pressed]}
          >
            <Text style={s.buttonText}>{continueText}</Text>
          </Pressable>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  kav: { flex: 1, width: '100%', alignItems: 'center' },
  phone: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, backgroundColor: colors.surface },
  top: { height: 54, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: dimensions.backButtonSize, height: dimensions.backButtonSize, alignItems: 'center', justifyContent: 'center' },
  brand: { width: 94, height: 38 },
  progress: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  progressText: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { fontFamily: typography.accent, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: colors.green },
  track: { marginTop: spacing.sm, height: 7, backgroundColor: '#E5EEEE', borderRadius: radius.sm, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.green, borderRadius: radius.sm },
  content: { width: '100%', padding: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: typography.display, fontSize: 30, lineHeight: 35, fontWeight: '700', color: colors.deepTeal },
  subtitle: { fontFamily: typography.ui, marginTop: spacing.sm, color: colors.textSecondary, fontSize: 15, lineHeight: 22, fontWeight: '400' },
  options: { marginTop: spacing.lg },
  footer: { padding: spacing.md, paddingTop: spacing.sm },
  trust: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  trustText: { fontFamily: typography.ui, fontSize: 12, fontWeight: '500', color: colors.deepTeal },
  button: { minHeight: dimensions.buttonHeight, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.deepTeal, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: typography.ui, color: '#fff', fontSize: 16, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.82 },
});
