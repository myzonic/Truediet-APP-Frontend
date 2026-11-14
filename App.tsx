import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/ref';
import { configureNotifications, resolveNotificationTarget } from './src/lib/notifications';
import { installWebAlert } from './src/lib/feedback';

installWebAlert();

/** Screens that mean "not signed in yet"; a tap must not push past them. */
const ONBOARDING_ROUTES = new Set([
  'Welcome',
  'Goal',
  'PersonalDetails',
  'Allergies',
  'DietaryPreferences',
  'BuildingProfile',
  'AccountSetup',
  'NutritionProfile',
]);

function navigateToNotification(data: Record<string, any> | null | undefined) {
  const target = resolveNotificationTarget(data);
  if (!target) return;
  if (!navigationRef.isReady()) return;

  // A member who is signed out (or still onboarding) lands on the welcome
  // flow; tapping a deep link must not skip authentication.
  const current = navigationRef.getCurrentRoute()?.name;
  if (!current || ONBOARDING_ROUTES.has(current)) return;

  try {
    // The route table is not statically typed here (deep links carry dynamic
    // screen names), so the call is made through the untyped navigation form.
    (navigationRef as any).navigate(target.screen, target.params ?? {});
  } catch {
    // Destination may no longer exist (content removed); stay where we are.
  }
}

export default function App() {
  const [loaded] = useFonts({
    Roboto: require('./assets/fonts/Roboto-Variable.ttf'),
    RobotoItalic: require('./assets/fonts/Roboto-Italic.ttf'),
  });

  useEffect(() => {
    configureNotifications();
    if (Platform.OS === 'web') return;

    // Taps while the app is running (foreground or background).
    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateToNotification(
        response.notification.request.content.data as Record<string, any>
      );
    });

    // Taps that launched the app from a terminated state.
    let coldStart: Notifications.Subscription | undefined;
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        // Give the navigator a moment to mount before routing.
        const timer = setTimeout(() => {
          navigateToNotification(
            response.notification.request.content.data as Record<string, any>
          );
        }, 1200);
        coldStart = { remove: () => clearTimeout(timer) } as Notifications.Subscription;
      })
      .catch(() => undefined);

    return () => {
      tapSub.remove();
      coldStart?.remove();
    };
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
