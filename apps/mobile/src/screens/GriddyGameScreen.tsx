import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, Alert, Animated, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const GriddyGameScreen = ({ navigation }: any) => {
  const { user, setUser } = useAuthStore();
  const [betAmount, setBetAmount] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultCell, setResultCell] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState<number | null>(null);

  const grid = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handlePlay = async () => {
    if (user.coins < betAmount) {
      Alert.alert('Insufficient Coins', 'Recharge to keep playing!');
      return;
    }

    setIsSpinning(true);
    setResultCell(null);
    setMultiplier(null);

    try {
      const { data } = await api.post('/luck/griddy/play', { betAmount });
      
      // Simulate spinning effect
      setTimeout(() => {
        setIsSpinning(false);
        setResultCell(data.result);
        setMultiplier(data.multiplier);
        setUser({ ...user, coins: data.newBalance });
        
        if (data.isWon) {
          Alert.alert('WINNER!', `You won ${data.wonAmount} coins!`);
        }
      }, 1500);
    } catch (error: any) {
      setIsSpinning(false);
      Alert.alert('Error', error.response?.data?.error || 'Game failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Griddy Luck</Text>
        <View style={styles.coinBalance}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }} style={styles.coinIcon} />
          <Text style={styles.balanceText}>{user.coins}</Text>
        </View>
      </View>

      <View style={styles.gameContent}>
        <View style={styles.gridContainer}>
          {grid.map((cell) => (
            <View 
              key={cell} 
              style={[
                styles.cell, 
                resultCell === cell && (multiplier! > 0 ? styles.winCell : styles.loseCell)
              ]}
            >
              {isSpinning ? (
                <ActivityIndicator color="#FFD700" />
              ) : resultCell === cell ? (
                <Text style={styles.multiplierText}>{multiplier}x</Text>
              ) : (
                <Ionicons name="help-circle" size={40} color="#334155" />
              )}
            </View>
          ))}
        </View>

        <View style={styles.betSelection}>
          {[100, 500, 1000, 5000].map((amt) => (
            <TouchableOpacity 
              key={amt} 
              style={[styles.betBtn, betAmount === amt && styles.activeBetBtn]}
              onPress={() => setBetAmount(amt)}
            >
              <Text style={[styles.betBtnText, betAmount === amt && styles.activeBetBtnText]}>{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.playBtn, isSpinning && styles.disabledBtn]} 
          onPress={handlePlay}
          disabled={isSpinning}
        >
          <Text style={styles.playBtnText}>{isSpinning ? 'SPINNING...' : 'PLAY NOW'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ... Helper for ActivityIndicator if needed
const ActivityIndicator = ({ color }: { color: string }) => (
  <View style={styles.loader} />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1F' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  coinBalance: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1635', padding: 8, borderRadius: 20 },
  coinIcon: { width: 20, height: 20, marginRight: 6 },
  balanceText: { color: '#FFD700', fontWeight: 'bold' },
  gameContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  gridContainer: { width: width - 40, height: width - 40, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: (width - 80) / 3, height: (width - 80) / 3, backgroundColor: '#1A1635', borderRadius: 12, marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  winCell: { backgroundColor: '#FFD70020', borderColor: '#FFD700' },
  loseCell: { backgroundColor: '#EF444420', borderColor: '#EF4444' },
  multiplierText: { color: '#FFD700', fontSize: 24, fontWeight: 'bold' },
  betSelection: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 30 },
  betBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A1635', borderWidth: 1, borderColor: '#334155' },
  activeBetBtn: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  betBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  activeBetBtnText: { color: '#0D0B1F' },
  playBtn: { width: '100%', height: 60, backgroundColor: '#4DB6AC', borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  disabledBtn: { backgroundColor: '#334155' },
  playBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  loader: { width: 30, height: 30, borderRadius: 15, borderTopWidth: 3, borderTopColor: '#FFD700', borderRightWidth: 3, borderRightColor: 'transparent' }
});

export default GriddyGameScreen;
