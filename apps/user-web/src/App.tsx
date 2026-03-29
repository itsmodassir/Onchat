import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

const AppRoutes = Routes as any;
const AppRoute = Route as any;
const AppNavigate = Navigate as any;
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

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes>
          <AppRoute path="/" element={<HomeScreen />} />
          <AppRoute path="/login" element={<LoginScreen />} />
          <AppRoute path="/signup" element={<SignupScreen />} />
          <AppRoute path="/forgot-password" element={<ForgotPasswordScreen />} />
          <AppRoute path="/profile" element={<ProfileScreen />} />
          <AppRoute path="/wallet" element={<WalletScreen />} />
          <AppRoute path="/store" element={<StoreScreen />} />
          <AppRoute path="/griddy" element={<GriddyGameScreen />} />
          <AppRoute path="/daily-reward" element={<DailyRewardScreen />} />
          <AppRoute path="/leaderboard" element={<LeaderboardScreen />} />
          <AppRoute path="/family" element={<FamilyScreen />} />
          <AppRoute path="/creator" element={<CreatorDashboardScreen />} />
          <AppRoute path="/room/:id" element={<RoomScreen />} />
          <AppRoute path="/messages" element={<MessageScreen />} />
          <AppRoute path="/lucky-wheel" element={<LuckyWheelScreen />} />
          <AppRoute path="/settings" element={<SettingsScreen />} />
          <AppRoute path="/interests" element={<InterestsScreen />} />
          <AppRoute path="/storage" element={<StorageManagerScreen />} />
          <AppRoute path="/coin-seller" element={<CoinSellerPanel />} />
          <AppRoute path="*" element={<AppNavigate to="/" replace />} />
        </AppRoutes>
      </Layout>
    </Router>
  )
}

// Temporary placeholders removed - using real screens.
export default App
