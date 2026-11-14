import React, { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import MainNavigator from './MainNavigator';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

/**
 * Chooses the entry point once per launch.
 *
 * A member with a stored session goes straight to the app; a first-time
 * visitor starts the assessment. The decision is captured after the session
 * check resolves and then frozen, so signing in during onboarding does not
 * yank the user out of the flow they are in the middle of.
 */
export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const initialRoute = useRef<'Onboarding' | 'Main' | null>(null);

  if (initialRoute.current === null && !isLoading) {
    initialRoute.current = user ? 'Main' : 'Onboarding';
  }

  if (initialRoute.current === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator color={colors.deepTeal} />
      </View>
    );
  }

  return (
    <Stack.Navigator id="Root" initialRouteName={initialRoute.current} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={AppNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}
