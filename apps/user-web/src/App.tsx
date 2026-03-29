import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { WalletScreen } from './screens/WalletScreen'
import { StoreScreen } from './screens/StoreScreen'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/wallet" element={<WalletScreen />} />
          <Route path="/store" element={<StoreScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

// Temporary placeholders removed - using real screens.
export default App
