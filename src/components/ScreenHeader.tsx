import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { dimensions, radius, spacing } from '../theme/tokens';
import { useLayoutMetrics } from '../theme/responsive';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  eyebrow?: string;
  actionText?: string;
  onAction?: () => void;
  /**
   * 'hero' is the large screen title (default). 'section' is a compact
   * section heading used for in-page sections such as "Daily Summary".
   */
  size?: 'hero' | 'section';
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  eyebrow,
  actionText,
  onAction,
  size = 'hero',
}: ScreenHeaderProps) {
  const { isCompact, isTablet } = useLayoutMetrics();
  const heroSize = isCompact ? 24 : isTablet ? 30 : 28;
  const heroLine = isCompact ? 31 : isTablet ? 38 : 36;

  return (
    <View style={[s.container, size === 'section' && s.containerSection]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={s.back}
        >
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={s.headerContent}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text
          style={[
            s.title,
            { fontSize: heroSize, lineHeight: heroLine },
            size === 'section' && s.titleSection,
          ]}
        >
          {title}
        </Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionText && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={s.action}>
          <Text style={s.actionText}>{actionText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
    width: '100%',
  },
  containerSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  back: {
    width: dimensions.backButtonSize,
    height: dimensions.backButtonSize,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
    flexShrink: 0,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  eyebrow: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
    color: colors.green,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Roboto',
    fontWeight: '700' as const,
    color: colors.text,
    flexShrink: 1,
  },
  titleSection: {
    fontSize: 18,
    lineHeight: 24,
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 4,
    flexShrink: 1,
  },
  action: {
    marginTop: 2,
    flexShrink: 0,
    maxWidth: '42%',
  },
  actionText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.deepTeal,
    textAlign: 'right',
  },
});
