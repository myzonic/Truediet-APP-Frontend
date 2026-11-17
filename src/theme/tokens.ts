import { colors } from './colors';
import { CONTENT_MAX_WIDTH, TAB_BAR_MAX_WIDTH } from './layout';

/**
 * Consistent TrueDiet application design tokens.
 *
 * Single source of truth for spacing, border radius, component dimensions,
 * typography, and breakpoints. All screens should use these tokens instead of
 * hardcoded values to keep the UI consistent across phone sizes.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screenHorizontal: 20,
  screenBottom: 48,
  cardPadding: 16,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const dimensions = {
  inputHeight: 48,
  buttonHeight: 54,
  buttonHeightSmall: 46,
  pillMinHeight: 38,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  cardPadding: 16,
  backButtonSize: 42,
  contentMaxWidth: CONTENT_MAX_WIDTH,
  tabBarMaxWidth: TAB_BAR_MAX_WIDTH,
} as const;

export const breakpoints = {
  smallPhone: 360,
  mediumPhone: 390,
  largePhone: 430,
  tablet: 768,
} as const;

export const typography = {
  fontHeading: 'Roboto',
  fontBody: 'Roboto',
  eyebrow: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
    color: colors.green,
  },
  h1: {
    fontFamily: 'Roboto',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    color: colors.text,
  },
  h2: {
    fontFamily: 'Roboto',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  h3: {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  body: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
} as const;

/**
 * Consistent component style presets.
 */
export const components = {
  screenContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.lg,
  } as const,
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: dimensions.cardPadding,
  } as const,
  input: {
    height: dimensions.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
  } as const,
  button: {
    height: dimensions.buttonHeight,
    borderRadius: radius.lg,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  buttonText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  } as const,
  section: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 26,
    marginBottom: 12,
  } as const,
  label: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  } as const,
  eyebrow: typography.eyebrow,
  title: typography.h1,
  subtitle: typography.body,
} as const;

export { colors };
