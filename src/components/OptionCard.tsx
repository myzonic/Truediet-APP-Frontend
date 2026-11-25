import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { dimensions, radius, spacing } from '../theme/tokens';

export default function OptionCard({ label, selected, onPress, multiple = false }: { label: string; selected: boolean; onPress: () => void; multiple?: boolean }) {
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text numberOfLines={2} style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
      <View style={[styles.circle, selected && styles.selectedCircle]}>
        {selected && <Check size={15} color="#fff" strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selected: {
    borderColor: colors.deepTeal,
    backgroundColor: colors.softBlue,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  selectedLabel: {
    color: colors.deepTeal,
    fontWeight: '700',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
});
