import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ExploreInputScreen from '../screens/explore/ExploreInputScreen';
import ExploreResultScreen from '../screens/explore/ExploreResultScreen';
import TripInputScreen from '../screens/trip/TripInputScreen';
import TripResultScreen from '../screens/trip/TripResultScreen';
import CivicDashboardScreen from '../screens/civic/CivicDashboardScreen';
import CivicReportScreen from '../screens/civic/CivicReportScreen';
import CivicTrackScreen from '../screens/civic/CivicTrackScreen';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ExploreInput" 
          component={ExploreInputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ExploreResult" 
          component={ExploreResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TripInput" 
          component={TripInputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TripResult" 
          component={TripResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CivicDashboard" 
          component={CivicDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CivicReport" 
          component={CivicReportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CivicTrack" 
          component={CivicTrackScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
