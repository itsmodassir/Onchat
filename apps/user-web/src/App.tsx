import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import { Layout } from './components/Layout'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { WalletScreen } from './screens/WalletScreen'
import { StoreScreen } from './screens/StoreScreen'
import { GriddyGameScreen } from './screens/GriddyGameScreen'
import { DailyRewardScreen } from './screens/DailyRewardScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'
import { FamilyScreen } from './screens/FamilyScreen'
import { CreatorDashboardScreen } from './screens/CreatorDashboardScreen'
import { RoomScreen } from './screens/RoomScreen'
import { SignupScreen } from './screens/SignupScreen'
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen'
import { LuckyWheelScreen } from './screens/LuckyWheelScreen'
import { MessageScreen } from './screens/MessageScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { InterestsScreen } from './screens/InterestsScreen'
import { StorageManagerScreen } from './screens/StorageManagerScreen'
import { CoinSellerPanel } from './screens/CoinSellerPanel'

const AppRoutes = Routes as any;
const AppRoute = Route as any;
const AppNavigate = Navigate as any;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore(state => state.token);
  if (!token) return <AppNavigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore(state => state.token);
  if (token) return <AppNavigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes>
          {/* Public Routes */}
          <AppRoute path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
          <AppRoute path="/signup" element={<PublicRoute><SignupScreen /></PublicRoute>} />
          <AppRoute path="/forgot-password" element={<PublicRoute><ForgotPasswordScreen /></PublicRoute>} />

          {/* Protected Dashboard Routes */}
          <AppRoute path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <AppRoute path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <AppRoute path="/profile/:userId" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <AppRoute path="/wallet" element={<ProtectedRoute><WalletScreen /></ProtectedRoute>} />
          <AppRoute path="/store" element={<ProtectedRoute><StoreScreen /></ProtectedRoute>} />
          <AppRoute path="/griddy" element={<ProtectedRoute><GriddyGameScreen /></ProtectedRoute>} />
          <AppRoute path="/daily-reward" element={<ProtectedRoute><DailyRewardScreen /></ProtectedRoute>} />
          <AppRoute path="/leaderboard" element={<ProtectedRoute><LeaderboardScreen /></ProtectedRoute>} />
          <AppRoute path="/family" element={<ProtectedRoute><FamilyScreen /></ProtectedRoute>} />
          <AppRoute path="/creator" element={<ProtectedRoute><CreatorDashboardScreen /></ProtectedRoute>} />
          <AppRoute path="/room/:id" element={<ProtectedRoute><RoomScreen /></ProtectedRoute>} />
          <AppRoute path="/messages" element={<ProtectedRoute><MessageScreen /></ProtectedRoute>} />
          <AppRoute path="/lucky-wheel" element={<ProtectedRoute><LuckyWheelScreen /></ProtectedRoute>} />
          <AppRoute path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <AppRoute path="/interests" element={<ProtectedRoute><InterestsScreen /></ProtectedRoute>} />
          <AppRoute path="/storage" element={<ProtectedRoute><StorageManagerScreen /></ProtectedRoute>} />
          <AppRoute path="/coin-seller" element={<ProtectedRoute><CoinSellerPanel /></ProtectedRoute>} />

          {/* Fallback */}
          <AppRoute path="*" element={<AppNavigate to="/" replace />} />
        </AppRoutes>
      </Layout>
    </Router>
  )
}

export default App
