import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useLayoutMetrics } from '../theme/responsive';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

export interface ScreenContainerProps {
  children: React.ReactNode;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  /** Stretch the content to at least the full screen height (for footers). */
  fill?: boolean;
}

export function ScreenContainer({
  children,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
  fill = false,
}: ScreenContainerProps) {
  const { contentWidth, horizontalPadding } = useLayoutMetrics();

  return (
    <ScrollView
      style={[s.scroll, style]}
      contentContainerStyle={[
        s.content,
        {
          width: '100%',
          maxWidth: contentWidth,
          alignSelf: 'center',
          paddingHorizontal: horizontalPadding,
        },
        fill && s.fill,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="never"
      bounces
    >
      {children}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    width: '100%',
    flex: 1,
  },
  content: {
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
    flexGrow: 0,
  },
  fill: {
    flexGrow: 1,
  },
});
