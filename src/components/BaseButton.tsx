import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { dimensions, radius } from '../theme/tokens';

export interface BaseButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
  textStyle?: any;
}

export function BaseButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: BaseButtonProps) {
  const isDisabled = disabled || loading;

  const bgColors: Record<string, string> = {
    primary: colors.deepTeal,
    ghost: 'transparent',
    danger: colors.red,
  };

  const borderColors: Record<string, string> = {
    primary: colors.deepTeal,
    ghost: colors.border,
    danger: colors.red,
  };

  const textColors: Record<string, string> = {
    primary: '#fff',
    ghost: colors.deepTeal,
    danger: '#fff',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={8}
      accessibilityRole="button"
      style={[
        s.button,
        s[variant],
        isDisabled && s.disabled,
        style as ViewStyle,
      ] as ViewStyle[]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[s.primaryText, variant === 'ghost' && s.ghostText, variant === 'danger' && s.dangerText, isDisabled && s.disabledText, textStyle]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    height: dimensions.buttonHeight,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.deepTeal,
    borderColor: colors.deepTeal,
  },
  primaryText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  ghostText: {
    color: colors.deepTeal,
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  danger: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  dangerText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: 'rgba(255,255,255,0.5)',
  },
});
