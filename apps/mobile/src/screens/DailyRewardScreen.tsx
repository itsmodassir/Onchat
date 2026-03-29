import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { gameApi } from '../utils/api';

const REWARD_SCHEDULE = [
  { day: 1, coins: 50, diamonds: 0, icon: '🪙' },
  { day: 2, coins: 100, diamonds: 0, icon: '🪙' },
  { day: 3, coins: 150, diamonds: 1, icon: '💎' },
  { day: 4, coins: 200, diamonds: 0, icon: '🪙' },
  { day: 5, coins: 250, diamonds: 2, icon: '💎' },
  { day: 6, coins: 300, diamonds: 0, icon: '🪙' },
  { day: 7, coins: 500, diamonds: 5, icon: '🎁' },
];

const DailyRewardScreen = () => {
  const navigation = useNavigation();
  const { token, setUser } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await gameApi.getDailyReward(token || '');
      setStatus(res.data);
    } catch (e) {
      console.error('Daily reward status error:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchStatus();
  }, [fetchStatus]));

  const claimReward = async () => {
    if (claiming || status?.claimed) return;
    setClaiming(true);
    try {
      const res = await gameApi.claimDailyReward(token || '');
      const { reward, streak } = res.data;
      setStatus((prev: any) => ({ ...prev, claimed: true, streak }));
      Alert.alert(
        '🎉 Reward Claimed!',
        `You got ${reward.coins} coins${reward.diamonds > 0 ? ` + ${reward.diamonds} 💎 diamonds` : ''}!\n\nStreak: ${streak} days 🔥`
      );
    } catch (error: any) {
      Alert.alert('Oops', error.response?.data?.error || 'Already claimed today!');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00C1BB" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const currentDay = status?.nextRewardDay ?? 0;
  const streak = status?.streak ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎁 Daily Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Streak Banner */}
        <View style={styles.streakBanner}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View>
            <Text style={styles.streakCount}>{streak} Day Streak</Text>
            <Text style={styles.streakSub}>
              {streak >= 7 ? 'Max streak! Keep going!' : `${7 - streak} days to weekly bonus`}
            </Text>
          </View>
        </View>

        {/* 7-day Calendar Grid */}
        <View style={styles.grid}>
          {REWARD_SCHEDULE.map((item, idx) => {
            const dayIndex = idx; // 0-based
            const isPast = dayIndex < (streak % 7) && status?.claimed;
            const isCurrent = dayIndex === currentDay;
            const isFuture = dayIndex > currentDay;

            return (
              <View
                key={item.day}
                style={[
                  styles.dayCard,
                  isPast && styles.dayCardPast,
                  isCurrent && styles.dayCardCurrent,
                  isFuture && styles.dayCardFuture,
                ]}
              >
                {isPast && (
                  <View style={styles.checkOverlay}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  </View>
                )}
                <Text style={styles.dayIcon}>{item.icon}</Text>
                <Text style={styles.dayLabel}>Day {item.day}</Text>
                <Text style={styles.dayCoins}>{item.coins}🪙</Text>
                {item.diamonds > 0 && (
                  <Text style={styles.dayDiamonds}>+{item.diamonds}💎</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Claim Button */}
        <TouchableOpacity
          style={[styles.claimBtn, (status?.claimed || claiming) && styles.claimedBtn]}
          onPress={claimReward}
          disabled={status?.claimed || claiming}
        >
          {claiming ? (
            <ActivityIndicator color="#fff" />
          ) : status?.claimed ? (
            <Text style={styles.claimBtnText}>✅ Claimed — Come back tomorrow!</Text>
          ) : (
            <Text style={styles.claimBtnText}>🎁 Claim Day {currentDay + 1} Reward</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>Log in daily to maintain your streak and earn bigger rewards!</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#00C1BB' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },

  streakBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b',
    borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FF6B0030',
  },
  streakIcon: { fontSize: 40, marginRight: 16 },
  streakCount: { color: '#f8fafc', fontSize: 22, fontWeight: 'bold' },
  streakSub: { color: '#64748b', fontSize: 13, marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  dayCard: {
    width: '30%', backgroundColor: '#1e293b', borderRadius: 14,
    padding: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155',
  },
  dayCardPast: { borderColor: '#22c55e30', backgroundColor: '#052e1620' },
  dayCardCurrent: { borderColor: '#00C1BB', borderWidth: 2, backgroundColor: '#00C1BB10' },
  dayCardFuture: { opacity: 0.5 },
  checkOverlay: { position: 'absolute', top: 6, right: 6 },
  dayIcon: { fontSize: 24, marginBottom: 4 },
  dayLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  dayCoins: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  dayDiamonds: { color: '#818cf8', fontSize: 11, marginTop: 1 },

  claimBtn: {
    backgroundColor: '#00C1BB', borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginBottom: 16,
  },
  claimedBtn: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  claimBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  hint: { color: '#475569', textAlign: 'center', fontSize: 12, lineHeight: 18 },
});

export default DailyRewardScreen;
