import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Image, Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronRight, Crown, Gem, ClipboardList, Coins, Heart as HeartIcon,
  CircleUser, ShoppingBag, Briefcase, Headphones, Flame,
  Settings, LogOut, Users, UserPlus, Trophy, HardDrive,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, token, setUser } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [cpStatus, setCpStatus] = useState<any>(null);
  const [agencyStats, setAgencyStats] = useState<any>(null);

  // Re-fetch live user data every time profile tab is focused
  useFocusEffect(
    useCallback(() => {
      const fetchLiveProfile = async () => {
        if (!token) return;
        try {
          const [userRes, cpRes, agencyRes] = await Promise.all([
            authApi.me(),
            api.get('/cp/status'),
            api.get('/agency/stats')
          ]);
          setUser(userRes.data);
          setCpStatus(cpRes.data);
          setAgencyStats(agencyRes.data);
        } catch (error) {
          console.error('Failed to sync live profile:', error);
        }
      };
      fetchLiveProfile();
    }, [token, setUser])
  );

  const followers = user?._count?.followers ?? 0;
  const following = user?._count?.following ?? 0;
  const rooms = user?._count?.rooms ?? 0;

  const statsList = [
    { title: 'Followers', count: followers, onPress: () => {} },
    { title: 'Level', count: user?.level || 1, onPress: () => {} },
    { title: 'Following', count: following, onPress: () => {} },
    { title: 'Rooms', count: rooms, onPress: () => {} },
  ];

  const menuItems: {
    id: string; title: string; icon: React.ReactNode; bgColor: string;
    badge?: boolean; extra?: string; onPress?: () => void;
  }[] = [
    { id: '1', title: 'Daily Reward', icon: <Flame size={22} color="#FF6B00" />, bgColor: '#FF6B0020', onPress: () => navigation.navigate('DailyReward') },
    { id: '2', title: 'Leaderboard', icon: <Crown size={22} color="#FFD700" />, bgColor: '#FFD70020', onPress: () => navigation.navigate('Leaderboard') },
    { id: '3', title: 'Earn Coins', icon: <Coins size={22} color="#3B82F6" />, bgColor: '#3B82F620', onPress: () => navigation.navigate('Wallet') },
    { 
      id: '4', 
      title: 'Super CP Zone', 
      icon: <HeartIcon size={22} color="#EC4899" />, 
      bgColor: '#EC489920', 
      extra: cpStatus ? `Lv. ${cpStatus.level}` : 'Find Partner',
      badge: !cpStatus 
    },
    { id: '5', title: 'My Bag', icon: <ShoppingBag size={22} color="#F59E0B" />, bgColor: '#F59E0B20', onPress: () => navigation.navigate('Store') },
    { 
      id: '6', 
      title: 'Host Center', 
      icon: <Briefcase size={22} color="#EF4444" />, 
      bgColor: '#EF444420', 
      extra: agencyStats?.name || 'make money', 
      onPress: () => navigation.navigate('CreatorDashboard') 
    },
    { id: '7', title: 'Griddy Luck', icon: <Trophy size={22} color="#4DB6AC" />, bgColor: '#4DB6AC20', onPress: () => navigation.navigate('GriddyGame') },
    { id: '10', title: 'Lucky Wheel', icon: <Flame size={22} color="#F97316" />, bgColor: '#F9731620', onPress: () => navigation.navigate('LuckyWheel') },
    { id: '11', title: 'My Interests', icon: <HeartIcon size={22} color="#8B5CF6" />, bgColor: '#8B5CF620', onPress: () => navigation.navigate('Interests') },
    { id: '13', title: 'Virtual Storage', icon: <HardDrive size={22} color="#00C1BB" />, bgColor: '#00C1BB20', onPress: () => navigation.navigate('StorageManager') },
    { id: '12', title: 'Settings', icon: <Settings size={22} color="#F43F5E" />, bgColor: '#F43F5E20', onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <TouchableOpacity
            onPress={() => {
              Alert.prompt(
                'Update Avatar',
                'Enter new avatar image URL:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Update',
                    onPress: async (url: string | undefined) => {
                      if (!url) return;
                      try {
                        const { data } = await authApi.updateProfile({ avatar: url });
                        setUser(data);
                      } catch {
                        Alert.alert('Error', 'Failed to update avatar');
                      }
                    },
                  },
                ],
                'plain-text',
                user?.avatar
              );
            }}
          >
            <Image
              source={{ uri: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}` }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() =>
                  Alert.prompt(
                    'Update Name',
                    'Enter new name:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Update',
                        onPress: async (name: string | undefined) => {
                          if (!name) return;
                          try {
                            const { data } = await authApi.updateProfile({ name: name });
                            setUser(data);
                          } catch {
                            Alert.alert('Error', 'Failed to update name');
                          }
                        },
                      },
                    ],
                    'plain-text',
                    user?.name
                  )
                }
              >
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
              </TouchableOpacity>
              {user?.isReseller && (
                <View style={styles.resellerBadge}>
                  <Text style={styles.resellerText}>Reseller</Text>
                </View>
              )}
            </View>
            <Text style={styles.userId}>ID: {user?.shortId || user?.id?.substring(0, 8)}</Text>
            {user?.bio ? <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text> : null}
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Live Stats Row */}
        <View style={styles.statsContainer}>
          {statsList.map((stat, idx) => (
            <TouchableOpacity key={idx} style={styles.statItem} onPress={stat.onPress}>
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coin balance strip */}
        <View style={styles.balanceStrip}>
          <Coins size={16} color="#F59E0B" />
          <Text style={styles.balanceText}>{user?.coins ?? 0} Coins</Text>
          <View style={styles.separator} />
          <Gem size={16} color="#2dd4bf" />
          <Text style={styles.balanceText}>{Number(user?.diamonds ?? 0).toFixed(1)} Diamonds</Text>
        </View>

        {/* Status Cards (live data) */}
        <View style={styles.statusCardsRow}>
          <View style={[styles.statusCard, { backgroundColor: '#451a03' }]}>
            <View style={styles.cardHeader}>
              <Crown size={16} color="#fbbf24" />
              <Text style={styles.cardTitle}>Aristocracy</Text>
            </View>
            {user?.aristocracyLevel > 0 ? (
              <Text style={styles.cardValue}>Lv. {user.aristocracyLevel}</Text>
            ) : (
              <TouchableOpacity style={styles.buyNow} onPress={() => navigation.navigate('Store')}>
                <Text style={styles.buyNowText}>Buy Now {'>'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.statusCard, { backgroundColor: '#134e4a' }]}>
            <View style={styles.cardHeader}>
              <Gem size={16} color="#2dd4bf" />
              <Text style={styles.cardTitle}>SVIP</Text>
            </View>
            {user?.svipLevel > 0 ? (
              <Text style={styles.cardValue}>SVIP Lv. {user.svipLevel}</Text>
            ) : (
              <Text style={styles.cardInfo}>471,700 points needed for SVIP 1</Text>
            )}
          </View>
        </View>

        {/* Family banner */}
        {user?.family && (
          <TouchableOpacity style={styles.familyBanner} onPress={() => navigation.navigate('Family')}>
            <Users size={18} color="#00C1BB" style={{ marginRight: 8 }} />
            <Text style={styles.familyText}>Family: <Text style={{ color: '#00C1BB', fontWeight: 'bold' }}>{user.family.name}</Text></Text>
            <ChevronRight size={16} color="#64748b" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
                {item.icon}
              </View>
              <Text style={styles.menuLabel}>{item.title}</Text>
              <View style={styles.menuRight}>
                {item.extra && <Text style={styles.extraText}>{item.extra}</Text>}
                {item.badge && <View style={styles.dotBadge} />}
                <ChevronRight size={18} color="#475569" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#00C1BB' },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  userId: { fontSize: 13, color: '#64748B', marginTop: 2 },
  userBio: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  resellerBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  resellerText: { color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  logoutBtn: { padding: 10 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  statItem: { alignItems: 'center' },
  statCount: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  statTitle: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  balanceStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1e293b', marginTop: 10 },
  balanceText: { color: '#f8fafc', fontSize: 14, marginLeft: 6, marginRight: 12 },
  separator: { width: 1, height: 16, backgroundColor: '#334155', marginRight: 12 },

  statusCardsRow: { flexDirection: 'row', padding: 15, justifyContent: 'space-between' },
  statusCard: { flex: 0.48, borderRadius: 12, padding: 15, height: 90, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  cardValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  buyNow: {},
  buyNowText: { color: '#fbbf24', fontSize: 12, fontWeight: '600' },
  cardInfo: { color: '#94f3e4', fontSize: 10, lineHeight: 14 },

  familyBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10, backgroundColor: '#FFF', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  familyText: { fontSize: 14, color: '#334155' },

  menuList: { backgroundColor: '#FFF', marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, marginLeft: 15, fontSize: 16, color: '#334155', fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  extraText: { color: '#94A3B8', fontSize: 14, marginRight: 10 },
  dotBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 10 },
});

export default ProfileScreen;
