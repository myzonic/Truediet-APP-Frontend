import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { dimensions, radius, spacing } from '../theme/tokens';

/**
 * Reusable Pill / Chip component (Part 3).
 *
 * Rules:
 * - Height based on content and design tokens (minHeight 38, no fixed clipping height)
 * - Appropriate horizontal padding
 * - Consistent border radius
 * - Text never clipped; labels wrap or adapt
 * - No fixed widths that cause overflow
 * - Supports selected, unselected, removable, and disabled states
 * - Accessible touch targets
 */
export interface PillProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  tone?: 'default' | 'teal' | 'green' | 'orange' | 'danger';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Pill({
  label,
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  tone = 'default',
  icon,
  style,
  textStyle,
}: PillProps) {
  const containerStyles: ViewStyle[] = [
    s.pill,
    tone === 'green' && s.pillGreen,
    tone === 'teal' && s.pillTeal,
    tone === 'orange' && s.pillOrange,
    tone === 'danger' && s.pillDanger,
    selected && s.pillSelected,
    disabled && s.pillDisabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const labelStyles: TextStyle[] = [
    s.pillText,
    tone === 'green' && s.pillTextGreen,
    tone === 'teal' && s.pillTextTeal,
    tone === 'orange' && s.pillTextOrange,
    tone === 'danger' && s.pillTextDanger,
    selected && s.pillTextSelected,
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  const content = (
    <>
      {icon ? <View style={s.iconWrap}>{icon}</View> : null}
      <Text style={labelStyles}>{label}</Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          disabled={disabled}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          style={s.removeBtn}
        >
          <X size={14} color={selected ? '#FFFFFF' : colors.deepTeal} />
        </Pressable>
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={containerStyles}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        ...containerStyles,
        pressed && !disabled && s.pillPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

/**
 * Flexible PillGroup container that wraps pills cleanly across any phone width.
 */
export function PillGroup({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.group, style]}>{children}</View>;
}

/**
 * Responsive 2-column or 3-column grid row that prevents unequal columns and overflow.
 */
export function ResponsiveGrid({
  children,
  columns = 2,
  style,
}: {
  children: React.ReactNode;
  columns?: 2 | 3;
  style?: ViewStyle;
}) {
  return (
    <View style={[s.grid, columns === 3 && s.gridThree, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    minHeight: dimensions.pillMinHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  pillGreen: {
    backgroundColor: colors.softGreen,
    borderColor: colors.softGreen,
  },
  pillTeal: {
    backgroundColor: colors.softBlue,
    borderColor: colors.softBlue,
  },
  pillOrange: {
    backgroundColor: colors.softOrange,
    borderColor: colors.softOrange,
  },
  pillDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  pillSelected: {
    backgroundColor: colors.deepTeal,
    borderColor: colors.deepTeal,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillPressed: {
    opacity: 0.85,
  },
  pillText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  pillTextGreen: {
    color: colors.green,
    fontWeight: '700',
  },
  pillTextTeal: {
    color: colors.deepTeal,
    fontWeight: '700',
  },
  pillTextOrange: {
    color: colors.orange,
    fontWeight: '700',
  },
  pillTextDanger: {
    color: colors.red,
    fontWeight: '700',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  iconWrap: {
    marginRight: 6,
  },
  removeBtn: {
    marginLeft: 8,
    padding: 2,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    width: '100%',
  },
  gridThree: {
    gap: spacing.sm,
  },
});
