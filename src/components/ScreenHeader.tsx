import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { dimensions, radius, spacing } from '../theme/tokens';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  eyebrow?: string;
  actionText?: string;
  onAction?: () => void;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  eyebrow,
  actionText,
  onAction,
}: ScreenHeaderProps) {
  return (
    <View style={s.container}>
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
        <Text style={s.title}>{title}</Text>
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
  },
  headerContent: {
    flex: 1,
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
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 4,
  },
  action: {
    marginTop: -4,
  },
  actionText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.deepTeal,
  },
});
