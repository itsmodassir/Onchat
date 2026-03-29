import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  SafeAreaView
} from 'react-native';
import { ChevronLeft, Coins, Sparkles, Shirt, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const LuckyWheelScreen = () => {
  const navigation = useNavigation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStake, setSelectedStake] = useState(100);
  const spinValue = new Animated.Value(0);

  const stakes = [10, 100, 1000];

  const prizes = [
    { name: '10 Coins', Icon: Coins },
    { name: '50 Coins', Icon: Coins },
    { name: '100 Coins', Icon: Coins },
    { name: '500 Coins', Icon: Sparkles },
    { name: 'Headwear', Icon: Shirt },
    { name: 'Try Again', Icon: RefreshCw },
  ];

  const spin = async () => {
    if (isSpinning) return;
    try {
      const response = await api.post('/shop/spin', { stake: selectedStake });
      const win = response.data.prize;
      setIsSpinning(true);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        setIsSpinning(false);
        spinValue.setValue(0);
        alert('Congratulations! You won ' + win.name);
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Insufficient coins');
    }
  };

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lucky Wheel</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Try Your Luck!</Text>
        <Text style={styles.subtitle}>Spin the wheel to win exclusive prizes</Text>

        <View style={styles.stakeContainer}>
          {stakes.map((s) => (
            <TouchableOpacity 
              key={s} 
              style={[styles.stakeBtn, selectedStake === s && styles.selectedStakeBtn]} 
              onPress={() => setSelectedStake(s)}
            >
              <Text style={[styles.stakeText, selectedStake === s && styles.selectedStakeText]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.wheelContainer}>
          <Animated.View style={[styles.wheel, { transform: [{ rotate: spinAnimation }] }]}>
            {prizes.map((p, i) => (
              <View key={i} style={[styles.sector, { transform: [{ rotate: `${i * 60}deg` }] }]}>
                <p.Icon size={24} color="#FFF" />
              </View>
            ))}
          </Animated.View>
          <View style={styles.pointer} />
        </View>

        <TouchableOpacity 
          style={[styles.spinButton, isSpinning && styles.disabledButton]} 
          onPress={spin}
          disabled={isSpinning}
        >
          <Text style={styles.spinButtonText}>{isSpinning ? 'Spinning...' : `SPIN (${selectedStake} Coins)`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#999', marginBottom: 40 },
  stakeContainer: { flexDirection: 'row', marginBottom: 30, gap: 15 },
  stakeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#334155' },
  selectedStakeBtn: { borderColor: '#FFD700', backgroundColor: '#FFD70020' },
  stakeText: { color: '#94A3B8', fontWeight: 'bold' },
  selectedStakeText: { color: '#FFD700' },
  wheelContainer: { width: width * 0.8, height: width * 0.8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  wheel: { width: '100%', height: '100%', borderRadius: width * 0.4, borderWidth: 8, borderColor: '#FFD700', backgroundColor: '#16213e', overflow: 'hidden' },
  sector: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', paddingTop: 20 },
  pointer: { position: 'absolute', top: -10, width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 30, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FFD700', transform: [{ rotate: '180deg' }], zIndex: 10 },
  spinButton: { marginTop: 50, backgroundColor: '#e94560', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, elevation: 5 },
  disabledButton: { opacity: 0.6 },
  spinButtonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
});

export default LuckyWheelScreen;
