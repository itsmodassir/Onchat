import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Modal, Dimensions } from 'react-native';
import { X, TrendingUp } from 'lucide-react-native';
import { gameApi } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FRUITS = [
  { id: 'apple', icon: '🍎', multiplier: 5 },
  { id: 'lemon', icon: '🍋', multiplier: 5 },
  { id: 'grapes', icon: '🍇', multiplier: 5 },
  { id: 'kiwi', icon: '🥝', multiplier: 45 },
  { id: 'orange', icon: '🍊', multiplier: 5 },
  { id: 'watermelon', icon: '🍉', multiplier: 25 },
  { id: 'cherry', icon: '🍒', multiplier: 15 },
  { id: 'strawberry', icon: '🍓', multiplier: 10 },
];

const LuckyGameOverlay = ({ visible, onClose, balance, onUpdateBalance }: any) => {
  const [selectedBet, setSelectedBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<any>(null);

  const handlePlay = async () => {
    if (spinning || balance < selectedBet) return;
    setSpinning(true);
    setHighlightIdx(null);
    setGameResult(null);

    try {
      const { data } = await gameApi.playGriddy(selectedBet);
      
      // Animation: Cycle through fruits
      let currentIdx = 0;
      const totalSteps = 24 + (data.result - 1); // 3 full loops + target
      const interval = 100;

      let stepsTaken = 0;
      const timer = setInterval(() => {
        setHighlightIdx(stepsTaken % 8);
        stepsTaken++;
        if (stepsTaken > totalSteps) {
          clearInterval(timer);
          setHighlightIdx(data.result - 1);
          setGameResult(data);
          setSpinning(false);
          onUpdateBalance(data.newBalance);
        }
      }, interval);

    } catch (error: any) {
      console.error(error);
      setSpinning(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.content}>
          <View style={styles.header}>
             <View style={styles.headerTitleRow}>
                <TrendingUp color="#F59E0B" size={20} />
                <Text style={styles.title}>LUCKY FRUIT</Text>
             </View>
             <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
               <X color="#FFF" size={20} />
             </TouchableOpacity>
          </View>

          <View style={styles.balanceBar}>
             <Text style={styles.balanceText}>Balance: 🪙 {balance.toLocaleString()}</Text>
          </View>

          <View style={styles.gridContainer}>
             <View style={styles.row}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={[styles.cell, highlightIdx === i && styles.activeCell]}>
                    <Text style={styles.fruit}>{FRUITS[i].icon}</Text>
                    <Text style={styles.mult}>{FRUITS[i].multiplier}x</Text>
                  </View>
                ))}
             </View>
             <View style={styles.row}>
                <View style={[styles.cell, highlightIdx === 7 && styles.activeCell]}>
                   <Text style={styles.fruit}>{FRUITS[7].icon}</Text>
                   <Text style={styles.mult}>{FRUITS[7].multiplier}x</Text>
                </View>
                <TouchableOpacity 
                   style={[styles.centerCell, spinning && styles.spinningCenter]} 
                   onPress={handlePlay}
                   disabled={spinning}
                >
                   <Text style={styles.goText}>{spinning ? '...' : 'GO'}</Text>
                </TouchableOpacity>
                <View style={[styles.cell, highlightIdx === 3 && styles.activeCell]}>
                   <Text style={styles.fruit}>{FRUITS[3].icon}</Text>
                   <Text style={styles.mult}>{FRUITS[3].multiplier}x</Text>
                </View>
             </View>
             <View style={styles.row}>
                {[6, 5, 4].map(i => (
                  <View key={i} style={[styles.cell, highlightIdx === i && styles.activeCell]}>
                    <Text style={styles.fruit}>{FRUITS[i].icon}</Text>
                    <Text style={styles.mult}>{FRUITS[i].multiplier}x</Text>
                  </View>
                ))}
             </View>
          </View>

          <View style={styles.resultZone}>
             {gameResult && (
                <Text style={[styles.resultText, gameResult.isWon ? styles.winText : styles.loseText]}>
                   {gameResult.isWon ? `WON 🪙 ${gameResult.wonAmount}` : 'LUCK NEXT TIME!'}
                </Text>
             )}
          </View>

          <View style={styles.betGroup}>
             {[1, 10, 100, 1000].map(amt => (
                <TouchableOpacity 
                   key={amt} 
                   style={[styles.betCard, selectedBet === amt && styles.betSelected]}
                   onPress={() => setSelectedBet(amt)}
                >
                   <Text style={styles.betValue}>🪙 {amt}</Text>
                </TouchableOpacity>
             ))}
          </View>

          <View style={styles.infoRow}>
             <Text style={styles.infoText}>Record your luck and win big boosters!</Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 5, borderRadius: 20 },
  balanceBar: { backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  balanceText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 16 },
  gridContainer: { backgroundColor: '#1E293B', padding: 15, borderRadius: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cell: { width: '30%', height: 90, backgroundColor: '#0f172a', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)' },
  activeCell: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  fruit: { fontSize: 32 },
  mult: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  centerCell: { width: '30%', height: 90, backgroundColor: '#fbbf24', borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  spinningCenter: { opacity: 0.7, backgroundColor: '#92400e' },
  goText: { color: '#FFF', fontWeight: '900', fontSize: 22 },
  resultZone: { height: 40, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  resultText: { fontSize: 20, fontWeight: 'bold' },
  winText: { color: '#4ade80' },
  loseText: { color: '#94a3b8' },
  betGroup: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  betCard: { flex: 1, marginHorizontal: 5, paddingVertical: 12, backgroundColor: '#334155', borderRadius: 15, alignItems: 'center' },
  betSelected: { backgroundColor: '#F59E0B' },
  betValue: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  infoRow: { marginTop: 20, alignItems: 'center' },
  infoText: { color: '#64748b', fontSize: 12 },
});

export default LuckyGameOverlay;
