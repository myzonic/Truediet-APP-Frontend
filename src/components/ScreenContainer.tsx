import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../theme/layout';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

export interface ScreenContainerProps {
  children: React.ReactNode;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
}: ScreenContainerProps) {
  return (
    <ScrollView
      style={{ width: '100%', ...style }}
      contentContainerStyle={[
        s.content,
        { maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
      {children}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
});
