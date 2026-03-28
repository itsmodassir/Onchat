import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';
import { Wallet, LogOut, ChevronRight, History, Award, Share2 } from 'lucide-react-native';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, token, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await authApi.me(token);
      setUser(data);
    } catch (error) {
      console.error('Refresh user failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleAddCoins = () => {
    Alert.alert('Top Up', 'Payment gateway integration (Razorpay/Stripe) coming soon!');
  };

  const handleShareReferral = () => {
    Alert.alert('Referral', `Share your code: ONCHAT-${user?.id?.substring(0, 5) || 'USER'} to earn 50 Coins!`);
  };

  const menuItems = [
    { id: '1', title: 'Transaction History', icon: <History size={20} color="#94A3B8" /> },
    { id: '2', title: 'My Badges', icon: <Award size={20} color="#94A3B8" /> },
    { id: '3', title: 'Invite Friends', icon: <Share2 size={20} color="#94A3B8" />, onPress: handleShareReferral },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <View style={styles.walletInfo}>
            <Wallet size={24} color="#F59E0B" />
            <Text style={styles.walletLabel}>My Wallet</Text>
          </View>
          <Text style={styles.coinBalance}>{user?.coins || 0} Coins</Text>
        </View>
        <TouchableOpacity style={styles.topUpBtn} onPress={handleAddCoins}>
          <Text style={styles.topUpText}>Top Up Coins</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuLeft}>
              {item.icon}
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <ChevronRight size={20} color="#475569" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  profileCard: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  userEmail: { fontSize: 14, color: '#94A3B8', marginTop: 5 },
  walletCard: { backgroundColor: '#1E293B', margin: 20, borderRadius: 20, padding: 25 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  walletInfo: { flexDirection: 'row', alignItems: 'center' },
  walletLabel: { color: '#F8FAFC', fontSize: 18, fontWeight: '600', marginLeft: 10 },
  coinBalance: { color: '#F59E0B', fontSize: 24, fontWeight: 'bold' },
  topUpBtn: { backgroundColor: '#F59E0B20', borderWidth: 1, borderColor: '#F59E0B', borderRadius: 12, padding: 15, alignItems: 'center' },
  topUpText: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold' },
  menuContainer: { marginHorizontal: 20, marginTop: 10 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { color: '#CBD5E1', fontSize: 16, marginLeft: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: 30, padding: 15 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600', marginLeft: 10 },
});

export default ProfileScreen;
