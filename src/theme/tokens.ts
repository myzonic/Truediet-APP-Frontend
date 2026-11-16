import { colors } from './colors';
import { CONTENT_MAX_WIDTH, TAB_BAR_MAX_WIDTH } from './layout';

/**
 * Consistent TrueDiet application design tokens (Part 4).
 *
 * Colors:
 * - Teal: #054B70
 * - Green: #64A826
 * - Light Green: #8DC63F
 * - Orange: #F7931E
 * - Yellow: #FFDD3C
 * - Red: #ED1C24
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
  pillMinHeight: 38,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  cardPadding: 16,
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

export { colors };
