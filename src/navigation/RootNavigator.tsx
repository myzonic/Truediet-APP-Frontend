import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import MainNavigator from './MainNavigator';
const Stack=createNativeStackNavigator();
export default function RootNavigator(){return <Stack.Navigator id="Root" screenOptions={{headerShown:false}}><Stack.Screen name="Onboarding" component={AppNavigator}/><Stack.Screen name="Main" component={MainNavigator}/></Stack.Navigator>}
