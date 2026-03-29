import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { Home, MessageCircle, User } from 'lucide-react-native';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MessageScreen from '../screens/MessageScreen';
import WalletScreen from '../screens/WalletScreen';
import StoreScreen from '../screens/StoreScreen';
import FamilyScreen from '../screens/FamilyScreen';
import LuckyWheelScreen from '../screens/LuckyWheelScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import DailyRewardScreen from '../screens/DailyRewardScreen';
import CreatorDashboardScreen from '../screens/CreatorDashboardScreen';
import InterestsScreen from '../screens/InterestsScreen';
import GriddyGameScreen from '../screens/GriddyGameScreen';
import CoinSellerPanel from '../screens/CoinSellerPanel';
import StorageManagerScreen from '../screens/StorageManagerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1E293B', borderTopWidth: 0, paddingBottom: 5, height: 60 },
      tabBarActiveTintColor: '#00C1BB',
      tabBarInactiveTintColor: '#475569',
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Room') return <Home size={size} color={color} />;
        if (route.name === 'Message') return <MessageCircle size={size} color={color} />;
        if (route.name === 'Me') return <User size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Room" component={HomeScreen} />
    <Tab.Screen name="Message" component={MessageScreen} />
    <Tab.Screen name="Me" component={ProfileScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { token, isHydrated } = useAuthStore();

  // Initialize push notifications hook
  usePushNotifications();

  // Wait for AsyncStorage to hydrate before routing — prevents false logout flash
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00C1BB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="LiveRoom" component={RoomScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Store" component={StoreScreen} />
            <Stack.Screen name="Family" component={FamilyScreen} />
            <Stack.Screen name="LuckyWheel" component={LuckyWheelScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="DailyReward" component={DailyRewardScreen} />
            <Stack.Screen name="CreatorDashboard" component={CreatorDashboardScreen} />
            <Stack.Screen name="Interests" component={InterestsScreen} />
            <Stack.Screen name="GriddyGame" component={GriddyGameScreen} />
            <Stack.Screen name="CoinSeller" component={CoinSellerPanel} />
            <Stack.Screen name="StorageManager" component={StorageManagerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
