import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionCard from '../components/OptionCard';
import { useOnboarding } from '../context/OnboardingContext';
import { AppNavigation } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { dimensions, radius, spacing } from '../theme/tokens';

export default function PersonalDetailsScreen({ navigation }: { navigation: AppNavigation }) {
  const { data, updateData } = useOnboarding();
  const [ageRejected, setAgeRejected] = useState(false);
  const ageFormatValid = /^\d+$/.test(data.age.trim());
  const showAgeError = ageRejected || (data.age.trim().length > 0 && !ageFormatValid);
  const valid = !!(ageFormatValid && data.sex && data.height.trim() && data.weight.trim());

  const handleAgeChange = (age: string) => {
    if (/^\d*$/.test(age)) {
      setAgeRejected(false);
      updateData({ age });
    } else {
      setAgeRejected(true);
    }
  };

  return (
    <OnboardingLayout
      step={2}
      title="Tell us a little about you"
      subtitle="These details help make your nutrition guidance more relevant."
      onBack={() => navigation.goBack()}
      continueDisabled={!valid}
      onContinue={() => navigation.navigate('Allergies')}
    >
      <Text style={s.label}>Age</Text>
      <TextInput
        accessibilityLabel="Age"
        value={data.age}
        onChangeText={handleAgeChange}
        keyboardType="number-pad"
        placeholder="Enter your age"
        style={[s.input, showAgeError && s.inputError]}
      />
      {showAgeError && (
        <Text accessibilityRole="alert" style={s.error}>
          Age must contain numbers only.
        </Text>
      )}
      <Text style={s.label}>Sex</Text>
      {['Female', 'Male', 'Prefer not to say'].map(x => (
        <OptionCard key={x} label={x} selected={data.sex === x} onPress={() => updateData({ sex: x })} />
      ))}
      <View style={s.row}>
        <View style={s.col}>
          <Text style={s.label}>Height</Text>
          <TextInput accessibilityLabel="Height" value={data.height} onChangeText={height => updateData({ height })} placeholder={"e.g. 5'7\""} style={s.input} />
        </View>
        <View style={s.col}>
          <Text style={s.label}>Weight</Text>
          <TextInput accessibilityLabel="Weight" value={data.weight} onChangeText={weight => updateData({ weight })} keyboardType="decimal-pad" placeholder="e.g. 150 lb" style={s.input} />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.teal,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: dimensions.inputHeight,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.charcoal,
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.red,
  },
  error: {
    marginBottom: spacing.sm,
    color: colors.red,
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
  },
});
