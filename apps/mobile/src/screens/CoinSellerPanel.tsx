import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, History, Coins, User as UserIcon } from 'lucide-react-native';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const CoinSellerPanel = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [targetShortId, setTargetShortId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/reseller/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch reseller stats', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTransfer = async () => {
    if (!targetShortId || !amount) {
      Alert.alert('Error', 'Please enter target ID and amount');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Are you sure you want to transfer ${amount} coins to ${targetShortId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          onPress: async () => {
            setLoading(true);
            try {
              await api.post('/reseller/transfer', {
                targetShortId,
                amount: parseInt(amount)
              });
              Alert.alert('Success', 'Coins transferred successfully');
              setTargetShortId('');
              setAmount('');
              fetchStats();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Transfer failed');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderTransaction = ({ item }: any) => (
    <View style={styles.transactionCard}>
      <View style={styles.txInfo}>
        <Text style={styles.txNotes}>{item.notes}</Text>
        <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <Text style={[styles.txAmount, item.amount < 0 ? styles.negative : styles.positive]}>
        {item.amount > 0 ? `+${item.amount}` : item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coin Seller Panel</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Selling Balance</Text>
        <View style={styles.balanceRow}>
          <Coins color="#F59E0B" size={32} />
          <Text style={styles.balanceValue}>{stats?.coins?.toLocaleString() || '0'}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Transfer Coins</Text>
        <View style={styles.inputGroup}>
          <UserIcon color="#94A3B8" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Target User ID (Short ID)"
            placeholderTextColor="#64748B"
            value={targetShortId}
            onChangeText={setTargetShortId}
          />
        </View>
        <View style={styles.inputGroup}>
          <Coins color="#94A3B8" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Amount to Transfer"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
        <TouchableOpacity 
          style={[styles.transferBtn, loading && styles.disabledBtn]} 
          onPress={handleTransfer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Send color="#FFF" size={20} />
              <Text style={styles.transferBtnText}>Confirm Transfer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <History color="#94A3B8" size={20} />
          <Text style={styles.historyTitle}>Recent Transfers</Text>
        </View>
        <FlatList
          data={stats?.transactions || []}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recent transactions</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E293B',
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  balanceCard: {
    margin: 20,
    padding: 25,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  balanceLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 10 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginLeft: 12 },
  formCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  transferBtn: {
    backgroundColor: '#818CF8',
    flexDirection: 'row',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: { opacity: 0.6 },
  transferBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  historyContainer: { flex: 1, marginTop: 25 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  historyTitle: { color: '#94A3B8', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  txInfo: { flex: 1 },
  txNotes: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  txDate: { color: '#64748B', fontSize: 12, marginTop: 4 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  positive: { color: '#22C55E' },
  negative: { color: '#EF4444' },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40 },
});

export default CoinSellerPanel;
