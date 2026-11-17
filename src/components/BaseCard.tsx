import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

export interface BaseCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'green' | 'teal' | 'orange';
}

export function BaseCard({ children, style, variant = 'default' }: BaseCardProps) {
  const bgColors: Record<string, string> = {
    default: colors.surface,
    green: colors.softGreen,
    teal: colors.softBlue,
    orange: colors.softOrange,
  };
  const borderColors: Record<string, string> = {
    default: colors.border,
    green: colors.softGreen,
    teal: colors.softBlue,
    orange: colors.softOrange,
  };

  return (
    <View style={[s.card, variant && s[variant], style] as ViewStyle[]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
  },
  green: {
    backgroundColor: colors.softGreen,
    borderColor: colors.softGreen,
  },
  teal: {
    backgroundColor: colors.softBlue,
    borderColor: colors.softBlue,
  },
  orange: {
    backgroundColor: colors.softOrange,
    borderColor: colors.softOrange,
  },
});
