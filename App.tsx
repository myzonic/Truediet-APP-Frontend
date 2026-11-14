import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/ref';
import { configureNotifications } from './src/lib/notifications';
import { installWebAlert } from './src/lib/feedback';

installWebAlert();

export default function App() {
  const [loaded] = useFonts({
    Roboto: require('./assets/fonts/Roboto-Variable.ttf'),
    RobotoItalic: require('./assets/fonts/Roboto-Italic.ttf'),
  });
  useEffect(() => {
    configureNotifications();
  }, []);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
