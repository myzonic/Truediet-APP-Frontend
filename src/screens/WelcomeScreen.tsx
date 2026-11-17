import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { BookOpen, ChartNoAxesColumnIncreasing, ShieldCheck, UserRoundCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { dimensions, radius, spacing } from '../theme/tokens';
import { ScreenContainer } from '../components/ScreenContainer';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const Feature = ({ icon: Icon, text, color, shifted = false }: { icon: any; text: string; color: string; shifted?: boolean }) => (
    <View style={[s.feature, shifted && s.featureShifted]}>
      <Icon size={19} color={color} />
      <Text style={s.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer>
        <View style={s.wrap}>
          <View style={s.trust}>
            <ShieldCheck size={13} color={colors.green} />
            <Text style={s.trustText}>Evidence-Based · Private by Design</Text>
          </View>
          <View style={s.badge}>
            <View style={s.dot} />
            <Text style={s.badgeText}>CLINICAL DIETETICS STANDARD</Text>
          </View>
          <View style={s.main}>
            <Image source={require('../../assets/truediet-logo.png')} style={s.logo} />
            <Text style={s.title}>
              Real Nutrition.{'\n'}
              Real Science.{'\n'}
              <Text style={s.orange}>Real Results.</Text>
            </Text>
            <Text style={s.copy}>
              Cut through nutrition confusion with{'\n'}
              evidence-based guidance, practical tools,{'\n'}
              and personalized support from a Registered{'\n'}
              Dietitian.
            </Text>
            <View style={s.line}>
              <View style={s.green} />
              <View style={s.orangeLine} />
            </View>
            <View style={s.grid}>
              <Feature shifted icon={ShieldCheck} text="Trusted Guidance" color={colors.green} />
              <Feature icon={BookOpen} text="Expert Education" color={colors.deepTeal} />
              <Feature shifted icon={ChartNoAxesColumnIncreasing} text="Track & Improve" color={colors.green} />
              <Feature icon={UserRoundCheck} text="Personalized Support" color={colors.orange} />
            </View>
          </View>
          <View style={s.actions}>
            <Pressable
              onPress={() => navigation.navigate('Goal')}
              style={({ pressed }) => [s.start, pressed && s.pressed]}
            >
              <Text style={s.startText}>Get Started</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('AccountSetup', { mode: 'signin' })} hitSlop={10}>
              <Text style={s.login}>I Already Have an Account</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  wrap: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    maxHeight: 915,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  trust: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  trustText: {
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '500',
    color: colors.green,
  },
  badge: {
    marginTop: spacing.md,
    height: dimensions.inputHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softBlue,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
  badgeText: {
    fontFamily: typography.accent,
    fontSize: 10,
    fontWeight: '700',
    color: colors.deepTeal,
  },
  main: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logo: { width: 112, height: 78, resizeMode: 'contain' },
  title: {
    fontFamily: typography.display,
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.deepTeal,
  },
  orange: {
    color: colors.orange,
  },
  copy: {
    fontFamily: typography.ui,
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: 14.5,
    lineHeight: 27,
    fontWeight: '400',
    color: colors.charcoal,
  },
  line: {
    marginTop: spacing.lg,
    width: 40,
    height: 2,
    flexDirection: 'row',
  },
  green: {
    flex: 1,
    backgroundColor: colors.green,
  },
  orangeLine: {
    flex: 1,
    backgroundColor: colors.orange,
  },
  grid: {
    marginTop: spacing.lg,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  feature: {
    width: '47.8%',
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureShifted: {
    paddingLeft: spacing.sm,
  },
  featureText: {
    fontFamily: typography.ui,
    flex: 1,
    flexShrink: 1,
    marginLeft: spacing.sm,
    fontSize: 12.5,
    color: '#31445B',
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  start: {
    height: dimensions.buttonHeight,
    borderRadius: radius.lg,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    fontFamily: typography.ui,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  login: {
    fontFamily: typography.uiItalic,
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.green,
    fontSize: 14,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.85,
  },
});
