import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { Home, User } from 'lucide-react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1E293B', borderTopWidth: 0, paddingBottom: 5 },
      tabBarActiveTintColor: '#818CF8',
      tabBarInactiveTintColor: '#475569',
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Home') return <Home size={size} color={color} />;
        if (route.name === 'Profile') return <User size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Room" component={RoomScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
