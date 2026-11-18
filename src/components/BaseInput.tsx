import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/tokens';

export interface BaseInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export function BaseInput({ label, error, style, containerStyle, ...props }: BaseInputProps) {
  return (
    <View style={[s.container, containerStyle] as ViewStyle[]}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput
        {...props}
        style={[s.input, style]}
        placeholderTextColor={colors.muted}
      />
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.text,
  },
  error: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
});
