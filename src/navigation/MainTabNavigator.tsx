import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, BookOpen, ChartNoAxesColumn, TrendingUp, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import LearnScreen from '../screens/learn/LearnScreen';
import TrackScreen from '../screens/track/TrackScreen';
import ToolsScreen from '../screens/tools/ToolsScreen';
import { ProfileHubScreen } from '../screens/profile/ProfileScreens';
import { colors } from '../theme/colors';
import { TAB_BAR_MAX_WIDTH } from '../theme/layout';

const Tab = createBottomTabNavigator<MainTabParamList>();
const icons = {
  Home: Activity,
  Track: TrendingUp,
  Tools: ChartNoAxesColumn,
  Learn: BookOpen,
  Profile: User,
};

export default function MainTabNavigator() {
  // The tab bar grows by the device's bottom inset (home indicator on iPhone,
  // gesture bar on Android) and keeps equal-width columns for the 5 tabs.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.deepTeal,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(6, insets.bottom),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          width: '100%',
          maxWidth: TAB_BAR_MAX_WIDTH,
          alignSelf: 'center',
        },
        tabBarItemStyle: {
          flex: 1,
          minWidth: 0,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontFamily: 'Roboto',
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: { marginTop: 0 },
        tabBarIcon: ({ color, focused }) => {
          const Icon = icons[route.name as keyof typeof icons];
          return <Icon color={color} size={focused ? 24 : 22} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Track" component={TrackScreen} options={{ tabBarLabel: 'Track' }} />
      <Tab.Screen name="Tools" component={ToolsScreen} options={{ tabBarLabel: 'Tools' }} />
      <Tab.Screen name="Learn" component={LearnScreen} options={{ tabBarLabel: 'Learn' }} />
      <Tab.Screen name="Profile" component={ProfileHubScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
