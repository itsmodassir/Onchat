import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { gameApi } from '../utils/api';

const TABS = ['COINS', 'LEVEL', 'ROOMS_HOSTED'] as const;
const TAB_LABELS = { COINS: '💰 Coins', LEVEL: '⬆️ Level', ROOMS_HOSTED: '🎙️ Rooms' };

const CROWN_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const CROWN_ICONS = ['🥇', '🥈', '🥉'];

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const { token, user: me } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('COINS');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await gameApi.getLeaderboard(token || '', activeTab);
      setData(res.data);
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, activeTab]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]));

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  const renderPodium = () => (
    <View style={styles.podium}>
      {/* 2nd Place */}
      {top3[1] && (
        <View style={[styles.podiumItem, { marginTop: 30 }]}>
          <Text style={styles.crownIcon}>{CROWN_ICONS[1]}</Text>
          <Image
            source={{ uri: top3[1].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].id}` }}
            style={[styles.podiumAvatar, { borderColor: CROWN_COLORS[1] }]}
          />
          <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name}</Text>
          <View style={[styles.podiumValueBg, { backgroundColor: CROWN_COLORS[1] + '30' }]}>
            <Text style={[styles.podiumValue, { color: CROWN_COLORS[1] }]}>{top3[1].value?.toLocaleString()}</Text>
          </View>
        </View>
      )}
      {/* 1st Place */}
      {top3[0] && (
        <View style={styles.podiumItem}>
          <Text style={[styles.crownIcon, { fontSize: 32 }]}>{CROWN_ICONS[0]}</Text>
          <Image
            source={{ uri: top3[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].id}` }}
            style={[styles.podiumAvatar, { width: 80, height: 80, borderRadius: 40, borderColor: CROWN_COLORS[0] }]}
          />
          <Text style={[styles.podiumName, { fontSize: 16, fontWeight: 'bold' }]} numberOfLines={1}>{top3[0].name}</Text>
          <View style={[styles.podiumValueBg, { backgroundColor: CROWN_COLORS[0] + '30' }]}>
            <Text style={[styles.podiumValue, { color: CROWN_COLORS[0], fontSize: 16 }]}>{top3[0].value?.toLocaleString()}</Text>
          </View>
        </View>
      )}
      {/* 3rd Place */}
      {top3[2] && (
        <View style={[styles.podiumItem, { marginTop: 50 }]}>
          <Text style={styles.crownIcon}>{CROWN_ICONS[2]}</Text>
          <Image
            source={{ uri: top3[2].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].id}` }}
            style={[styles.podiumAvatar, { borderColor: CROWN_COLORS[2] }]}
          />
          <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name}</Text>
          <View style={[styles.podiumValueBg, { backgroundColor: CROWN_COLORS[2] + '30' }]}>
            <Text style={[styles.podiumValue, { color: CROWN_COLORS[2] }]}>{top3[2].value?.toLocaleString()}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderRow = ({ item }: { item: any }) => {
    const isMe = item.id === me?.id;
    return (
      <View style={[styles.row, isMe && styles.myRow]}>
        <Text style={styles.rankNum}>#{item.rank}</Text>
        <Image
          source={{ uri: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}` }}
          style={styles.rowAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowName, isMe && { color: '#00C1BB' }]}>{item.name}{isMe ? ' (You)' : ''}</Text>
          <Text style={styles.rowSub}>Lv. {item.level}</Text>
        </View>
        <Text style={styles.rowValue}>{item.value?.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.activeTab]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
              {TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00C1BB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          ListHeaderComponent={renderPodium}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }} tintColor="#00C1BB" />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#00C1BB' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20, marginHorizontal: 4 },
  activeTab: { backgroundColor: '#00C1BB20', borderWidth: 1, borderColor: '#00C1BB' },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#00C1BB' },

  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingTop: 20, paddingBottom: 10, paddingHorizontal: 20 },
  podiumItem: { flex: 1, alignItems: 'center', marginHorizontal: 6 },
  crownIcon: { fontSize: 24, marginBottom: 4 },
  podiumAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, backgroundColor: '#1e293b' },
  podiumName: { color: '#f8fafc', fontSize: 12, marginTop: 6, textAlign: 'center' },
  podiumValueBg: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  podiumValue: { fontSize: 13, fontWeight: 'bold' },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  myRow: { backgroundColor: '#00C1BB10' },
  rankNum: { color: '#64748b', width: 32, fontSize: 14, fontWeight: 'bold' },
  rowAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 12 },
  rowName: { color: '#f8fafc', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#64748b', fontSize: 12 },
  rowValue: { color: '#00C1BB', fontSize: 16, fontWeight: 'bold' },
});

export default LeaderboardScreen;
