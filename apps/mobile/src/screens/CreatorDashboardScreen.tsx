import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { monetizationApi } from '../utils/api';
import { ChevronLeft, Wallet, CreditCard, History, TrendingUp, DollarSign } from 'lucide-react-native';

const CreatorDashboardScreen = ({ navigation }: any) => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');

  const fetchStats = async () => {
    try {
      const { data } = await monetizationApi.getCreatorStats();
      setStats(data);
    } catch (error) {
      console.error('Fetch stats failed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !paymentMethod || !paymentDetails) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    if (amount > stats?.currentDiamonds) {
      Alert.alert('Error', 'Insufficient diamonds');
      return;
    }

    try {
      await monetizationApi.requestWithdrawal({
        amount,
        method: paymentMethod,
        details: paymentDetails
      });
      Alert.alert('Success', 'Withdrawal request submitted!');
      setWithdrawAmount('');
      setPaymentMethod('');
      setPaymentDetails('');
      fetchStats();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C1BB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator Center</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#00C1BB" />}
      >
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
            <View style={styles.mainStat}>
                <Text style={styles.statLabel}>Current Balance</Text>
                <View style={styles.diamondRow}>
                    <Text style={styles.diamondValue}>{stats?.currentDiamonds?.toFixed(1) || '0.0'}</Text>
                    <Text style={styles.diamondLabel}> Diamonds</Text>
                </View>
                <Text style={styles.approxValue}>≈ ${(stats?.currentDiamonds / 100).toFixed(2)} USD</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <TrendingUp size={20} color="#00C1BB" />
                    <Text style={styles.gridLabel}>Lifetime</Text>
                    <Text style={styles.gridValue}>{stats?.lifetimeEarnings?.toFixed(0)}</Text>
                </View>
                <View style={styles.gridItem}>
                    <DollarSign size={20} color="#F59E0B" />
                    <Text style={styles.gridLabel}>Pending</Text>
                    <Text style={styles.gridValue}>{stats?.pendingDiamonds?.toFixed(0)}</Text>
                </View>
            </View>
        </View>

        {/* Withdrawal Form */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Withdraw Funds</Text>
            <View style={styles.card}>
                <View style={styles.inputContainer}>
                    <Wallet size={20} color="#94A3B8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount to withdraw"
                        placeholderTextColor="#64748B"
                        keyboardType="numeric"
                        value={withdrawAmount}
                        onChangeText={setWithdrawAmount}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <CreditCard size={20} color="#94A3B8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Payment Method (e.g. Bank/PayPal)"
                        placeholderTextColor="#64748B"
                        value={paymentMethod}
                        onChangeText={setPaymentMethod}
                    />
                </View>

                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Payment Details (Account Number / Email)"
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={3}
                    value={paymentDetails}
                    onChangeText={setPaymentDetails}
                />

                <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
                    <Text style={styles.withdrawBtnText}>Submit Request</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Withdrawal Rules</Text>
            <Text style={styles.infoText}>• Minimum withdrawal: 100 Diamonds</Text>
            <Text style={styles.infoText}>• Conversion rate: 100 Diamonds = $1.00 USD</Text>
            <Text style={styles.infoText}>• Processing time: 3-5 business days</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  statsContainer: { marginBottom: 30 },
  mainStat: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155'
  },
  statLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 10 },
  diamondRow: { flexDirection: 'row', alignItems: 'baseline' },
  diamondValue: { color: '#00C1BB', fontSize: 40, fontWeight: 'bold' },
  diamondLabel: { color: '#00C1BB', fontSize: 16 },
  approxValue: { color: '#64748B', fontSize: 14, marginTop: 5 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  gridLabel: { color: '#94A3B8', fontSize: 12, marginTop: 5 },
  gridValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55
  },
  input: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 10 },
  textArea: {
      backgroundColor: '#0F172A',
      borderRadius: 12,
      padding: 15,
      height: 80,
      textAlignVertical: 'top',
      marginBottom: 20,
      marginLeft: 0
  },
  withdrawBtn: {
    backgroundColor: '#00C1BB',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center'
  },
  withdrawBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  infoCard: {
      backgroundColor: '#1E293B50',
      borderRadius: 16,
      padding: 15,
      borderWidth: 1,
      borderColor: '#33415550'
  },
  infoTitle: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  infoText: { color: '#64748B', fontSize: 13, marginBottom: 5 },
});

export default CreatorDashboardScreen;
