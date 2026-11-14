import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookOpen, ChartNoAxesColumn, CircleUser, House, Library } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import LearnScreen from '../screens/learn/LearnScreen';
import { ResourcesHubScreen } from '../screens/resources/ResourceScreens';
import { ProfileHubScreen } from '../screens/profile/ProfileScreens';
import TrackScreen from '../screens/track/TrackScreen';
import { colors } from '../theme/colors';
import { TAB_BAR_MAX_WIDTH } from '../theme/layout';

const Tab = createBottomTabNavigator<MainTabParamList>();
const icons = { Home: House, Learn: BookOpen, Track: ChartNoAxesColumn, Resources: Library, Profile: CircleUser };

export default function MainTabNavigator() {
  // The tab bar must grow by the device's bottom inset (home indicator on
  // iPhone, gesture bar on Android) instead of a fixed 60pt height.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.deepTeal,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 0,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          width: '100%',
          maxWidth: TAB_BAR_MAX_WIDTH,
          alignSelf: 'center',
        },
        tabBarItemStyle: { flex: 1, minWidth: 0, justifyContent: 'center', alignItems: 'center' },
        tabBarIconStyle: { marginTop: 0 },
        tabBarIcon: ({ color, focused }) => {
          const Icon = icons[route.name as keyof typeof icons];
          return <Icon color={color} size={focused ? 26 : 23} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Track" component={TrackScreen} />
      <Tab.Screen name="Resources" component={ResourcesHubScreen} />
      <Tab.Screen name="Profile" component={ProfileHubScreen} />
    </Tab.Navigator>
  );
}
