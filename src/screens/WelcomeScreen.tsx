import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { BookOpen, ChartNoAxesColumnIncreasing, ShieldCheck, UserRoundCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { dimensions, radius, spacing } from '../theme/tokens';
import { ScreenContainer } from '../components/ScreenContainer';
import { useLayoutMetrics } from '../theme/responsive';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const { columnsFor, gridItemWidth, gutter, height } = useLayoutMetrics();
  const compactHeight = height <= 640;
  // Two tidy columns on normal phones, one on very narrow devices. A fixed
  // percentage made long labels wrap unevenly at 320pt.
  const columns = columnsFor(2, 132);
  const itemWidth = gridItemWidth(columns);

  const Feature = ({ icon: Icon, text, color }: { icon: any; text: string; color: string }) => (
    <View style={[s.feature, compactHeight && s.featureCompact, { width: itemWidth }]}>
      <Icon size={compactHeight ? 17 : 19} color={color} />
      <Text style={[s.featureText, compactHeight && s.featureTextCompact]}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScreenContainer fill contentContainerStyle={compactHeight ? s.contentCompact : undefined}>
        <View style={s.wrap}>
          <View style={[s.trust, compactHeight && s.trustCompact]}>
            <ShieldCheck size={13} color={colors.green} />
            <Text style={s.trustText}>Evidence-Based · Private by Design</Text>
          </View>
          <View style={[s.badge, compactHeight && s.badgeCompact]}>
            <View style={s.dot} />
            <Text style={s.badgeText}>CLINICAL DIETETICS STANDARD</Text>
          </View>
          <View style={[s.main, compactHeight && s.mainCompact]}>
            <Image
              source={require('../../assets/truediet-logo.png')}
              style={[s.logo, compactHeight && s.logoCompact]}
              accessible
              accessibilityLabel="TrueDiet logo"
            />
            <Text style={[s.title, compactHeight && s.titleCompact]}>
              Real Nutrition.{'\n'}
              Real Science.{'\n'}
              <Text style={s.orange}>Real Results.</Text>
            </Text>
            <Text style={[s.copy, compactHeight && s.copyCompact]}>
              Cut through nutrition confusion with evidence-based guidance, practical tools, and personalized support from a Registered Dietitian.
            </Text>
            <View style={[s.line, compactHeight && s.lineCompact]}>
              <View style={s.green} />
              <View style={s.orangeLine} />
            </View>
            <View style={[s.grid, compactHeight && s.gridCompact, { columnGap: gutter }]}>
              <Feature icon={ShieldCheck} text="Trusted Guidance" color={colors.green} />
              <Feature icon={BookOpen} text="Expert Education" color={colors.deepTeal} />
              <Feature icon={ChartNoAxesColumnIncreasing} text="Track & Improve" color={colors.green} />
              <Feature icon={UserRoundCheck} text="Personalized Support" color={colors.orange} />
            </View>
          </View>
          <View style={[s.actions, compactHeight && s.actionsCompact]}>
            <Pressable
              onPress={() => navigation.navigate('Goal')}
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              style={({ pressed }) => [s.start, compactHeight && s.startCompact, pressed && s.pressed]}
            >
              <Text style={s.startText}>Get Started</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('AccountSetup', { mode: 'signin' })}
              accessibilityRole="button"
              accessibilityLabel="I Already Have an Account"
              hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
              style={[s.loginPressable, compactHeight && s.loginPressableCompact]}
            >
              <Text style={[s.login, compactHeight && s.loginCompact]}>I Already Have an Account</Text>
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
    flexGrow: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    minHeight: dimensions.inputHeight,
    paddingVertical: 10,
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
    minHeight: 22,
    paddingLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontFamily: typography.ui,
    flexShrink: 1,
    marginLeft: spacing.sm,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#31445B',
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  start: {
    minHeight: dimensions.buttonHeight,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    flexShrink: 1,
    textAlign: 'center',
  },
  login: {
    fontFamily: typography.uiItalic,
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.green,
    fontSize: 14,
    fontWeight: '500',
  },
  // Invisible padding only: the visible text position and footer spacing stay
  // exactly where they were, but the whole row is a 44pt touch target.
  loginPressable: { minHeight: 44, marginBottom: -15 },
  // Compact-height phones only. These values keep the approved hierarchy and
  // copy intact while making both actions reachable on the initial screen.
  contentCompact: { paddingBottom: spacing.md },
  trustCompact: { marginTop: spacing.sm },
  badgeCompact: { marginTop: 6, minHeight: 40 },
  mainCompact: { marginTop: spacing.sm },
  logoCompact: { width: 100, height: 66 },
  titleCompact: { marginTop: 6, fontSize: 28, lineHeight: 31 },
  copyCompact: { marginTop: spacing.sm, fontSize: 14, lineHeight: 22 },
  lineCompact: { marginTop: spacing.sm },
  gridCompact: { marginTop: spacing.sm },
  featureCompact: { minHeight: 18, paddingLeft: 2 },
  featureTextCompact: { marginLeft: 5, fontSize: 12, lineHeight: 16 },
  actionsCompact: { paddingBottom: spacing.md },
  startCompact: { minHeight: dimensions.buttonHeightSmall, paddingVertical: 8 },
  loginCompact: { marginTop: spacing.sm },
  loginPressableCompact: { marginBottom: -19 },
  pressed: {
    opacity: 0.85,
  },
});
