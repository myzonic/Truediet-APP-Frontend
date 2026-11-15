import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';
import { colors } from '../../theme/colors';

export default function BalancedMealScreen({navigation}: any) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Balanced Meal Builder</Text>
          <Text style={s.headerSubtitle}>Build meals around variety and balance</Text>
        </View>
        <Text style={s.body}>Balanced Meal Builder screen</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24
  },
  headerTitle: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  headerSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.textSecondary
  },
  body: {
    color: colors.textSecondary,
    marginVertical: 24,
    textAlign: 'center'
  }
});