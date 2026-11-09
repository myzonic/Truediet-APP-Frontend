import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import { MainStackParamList } from './types';
import MythsScreen from '../screens/learn/MythsScreen';
import MythDetailScreen from '../screens/learn/MythDetailScreen';
import TopicScreen from '../screens/learn/TopicScreen';
import ArticleScreen from '../screens/learn/ArticleScreen';
import SearchScreen from '../screens/learn/SearchScreen';
import MealLogScreen from '../screens/track/MealLogScreen';
import HungerFullnessScreen from '../screens/track/HungerFullnessScreen';
import ProgressPatternsScreen from '../screens/track/ProgressPatternsScreen';
import ToolsScreen from '../screens/tools/ToolsScreen';
import BalancedMealScreen from '../screens/tools/BalancedMealScreen';
import LabelReadingScreen from '../screens/tools/LabelReadingScreen';
import { DietitianScreen, RecipeDetailScreen, RecipesScreen, TelehealthScreen, VoiceFoodLogScreen } from '../screens/core/CoreFeatureScreens';
import { ExtendedScreen } from '../screens/extended/ExtendedScreens';
import { BlogScreen, PodcastDetailScreen, PodcastScreen, RecordedClassesScreen, ResourceDetailScreen, ResourcesHubScreen, WebinarDetailScreen, WebinarsScreen } from '../screens/resources/ResourceScreens';
import { AppointmentDetailScreen, CheckoutScreen, FreePremiumScreen, LegalScreen, NotificationsScreen, SupportScreen, WebinarConfirmationScreen } from '../screens/utility/UtilityScreens';
import { MaureenProfileScreen, NutritionProfileSettingsScreen, PackageDetailScreen, PackagesScreen, PrivacyScreen, ProfileHubScreen, SavedContentScreen, SettingsScreen, SubscriptionScreen } from '../screens/profile/ProfileScreens';

const Stack=createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator(){
  return (
    <Stack.Navigator id="MainStack" screenOptions={{headerShown:false}}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator}/>
      <Stack.Screen name="Myths" component={MythsScreen}/>
      <Stack.Screen name="MythDetail" component={MythDetailScreen}/>
      <Stack.Screen name="Topic" component={TopicScreen}/>
      <Stack.Screen name="Article" component={ArticleScreen}/>
      <Stack.Screen name="Recipes" component={RecipesScreen}/>
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen}/>
      <Stack.Screen name="MealLog" component={MealLogScreen}/>
      <Stack.Screen name="VoiceFoodLog" component={VoiceFoodLogScreen}/>
      <Stack.Screen name="HungerFullness" component={HungerFullnessScreen}/>
      <Stack.Screen name="ProgressPatterns" component={ProgressPatternsScreen}/>
      <Stack.Screen name="Dietitian" component={DietitianScreen}/>
      <Stack.Screen name="Telehealth" component={TelehealthScreen}/>
      <Stack.Screen name="Tools" component={ToolsScreen}/>
      <Stack.Screen name="BalancedMeal" component={BalancedMealScreen}/>
      <Stack.Screen name="LabelReading" component={LabelReadingScreen}/>
      <Stack.Screen name="MaureenProfile" component={MaureenProfileScreen}/>
      <Stack.Screen name="Resources" component={ResourcesHubScreen}/>
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen}/>
      <Stack.Screen name="Blog" component={BlogScreen}/>
      <Stack.Screen name="Webinars" component={WebinarsScreen}/>
      <Stack.Screen name="WebinarDetail" component={WebinarDetailScreen}/>
      <Stack.Screen name="RecordedClasses" component={RecordedClassesScreen}/>
      <Stack.Screen name="Podcast" component={PodcastScreen}/>
      <Stack.Screen name="PodcastDetail" component={PodcastDetailScreen}/>
      <Stack.Screen name="Packages" component={PackagesScreen}/>
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen}/>
      <Stack.Screen name="FreePremium" component={FreePremiumScreen}/>
      <Stack.Screen name="SavedContent" component={SavedContentScreen}/>
      <Stack.Screen name="Notifications" component={NotificationsScreen}/>
      <Stack.Screen name="Profile" component={ProfileHubScreen}/>
      <Stack.Screen name="NutritionProfileSettings" component={NutritionProfileSettingsScreen}/>
      <Stack.Screen name="Settings" component={SettingsScreen}/>
      <Stack.Screen name="Privacy" component={PrivacyScreen}/>
      <Stack.Screen name="Login" component={ExtendedScreen}/>
      <Stack.Screen name="CreateAccount" component={ExtendedScreen}/>
      <Stack.Screen name="ForgotPassword" component={ExtendedScreen}/>
      <Stack.Screen name="ResetConfirmation" component={ExtendedScreen}/>
      <Stack.Screen name="SearchScreen" component={SearchScreen}/>
      <Stack.Screen name="Support" component={SupportScreen}/>
      <Stack.Screen name="Subscription" component={SubscriptionScreen}/>
      <Stack.Screen name="Checkout" component={CheckoutScreen}/>
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen}/>
      <Stack.Screen name="WebinarConfirmation" component={WebinarConfirmationScreen}/>
      <Stack.Screen name="Legal" component={LegalScreen}/>
    </Stack.Navigator>
  );
}
