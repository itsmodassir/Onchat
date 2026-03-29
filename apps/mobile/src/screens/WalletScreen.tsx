import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, FileText, MessageCircle, ChevronRight } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

const WalletScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Wallet'); 
  const [wallet, setWallet] = useState({ coins: 0, diamonds: 0, crystals: 0 });
  const [loading, setLoading] = useState(false);

  const handleRecharge = async (amount: number) => {
    try {
      setLoading(true);
      const { data: order } = await api.post('/payments/razorpay/order', { amount });

      const options = {
        description: `Recharge ${amount} Coins`,
        image: 'https://onchat.fun/logo.png',
        currency: 'INR',
        key: 'rzp_test_fallback', 
        amount: order.amount,
        name: 'Onchat',
        order_id: order.id,
        prefill: {
          email: user?.email || '',
          name: user?.name || ''
        },
        theme: { color: '#818CF8' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        await api.post('/payments/razorpay/verify', {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        });
        Alert.alert('Success', 'Recharge successful!');
        fetchWallet();
      }).catch((error: any) => {
        console.error('Razorpay Error:', error);
        Alert.alert('Payment Failed', error.description || 'Reason unknown');
      });

    } catch (error: any) {
      console.error('Recharge Initiation Failed:', error.message);
      Alert.alert('Error', 'Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [])
  );

  const fetchWallet = async () => {
    try {
      const response = await api.get('/shop/wallet');
      setWallet(response.data);
    } catch (error) {
      console.error('Fetch wallet error:', error);
    }
  };

  const renderWalletTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.card}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }} 
          style={styles.currencyIconLarge} 
        />
        <Text style={styles.balanceText}>{wallet.coins}</Text>
      </View>

      <View style={styles.rechargeList}>
        {[
          { coins: 900, bonus: 160, price: '$0.99' },
          { coins: 4500, bonus: 910, price: '$4.99' },
          { coins: 9100, bonus: 1910, price: '$9.99' },
          { coins: 18200, bonus: 4000, price: '$19.99' },
          { coins: 45400, bonus: 10500, price: '$49.99' },
          { coins: 90900, bonus: 21500, price: '$99.99' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.rechargeItem} onPress={() => handleRecharge(item.coins)}>
            <View style={styles.coinInfo}>
               <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }} style={styles.coinIconSmall} />
               <View>
                 <Text style={styles.coinAmount}>{item.coins}</Text>
                 <Text style={styles.bonusText}>+{item.bonus}</Text>
               </View>
            </View>
            <Text style={styles.priceText}>{item.price}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.contactUs}>
         <MessageCircle size={20} color="#666" />
         <Text style={styles.contactText}>Contact Us</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDiamondsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: '#FF80AB' }]}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1258/1258925.png' }} 
          style={styles.currencyIconLarge} 
        />
        <Text style={styles.balanceText}>{wallet.diamonds.toFixed(1)}</Text>
      </View>
      <Text style={styles.infoText}>Get diamonds by receiving gifts</Text>
      
      <TouchableOpacity style={styles.exchangeButton}>
        <Text style={styles.exchangeText}>Exchange Coins</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCrystalsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: '#4DB6AC' }]}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2312/2312739.png' }} 
          style={styles.currencyIconLarge} 
        />
        <Text style={styles.balanceText}>{wallet.crystals}</Text>
      </View>
      
      <TouchableOpacity style={styles.listItem}>
        <Text style={styles.listText}>Earn more crystals</Text>
        <ChevronRight size={20} color="#999" />
      </TouchableOpacity>
    </View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.tabs}>
          {['Wallet', 'Diamonds', 'Crystals'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity>
          <FileText size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {activeTab === 'Wallet' && renderWalletTab()}
      {activeTab === 'Diamonds' && renderDiamondsTab()}
      {activeTab === 'Crystals' && renderCrystalsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1E1E1E' },
  tabs: { flexDirection: 'row', flex: 1, justifyContent: 'center' },
  tab: { paddingHorizontal: 12, paddingVertical: 4 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#FFD700' },
  tabText: { color: '#999', fontSize: 16, fontWeight: '600' },
  activeTabText: { color: '#FFF' },
  tabContent: { flex: 1, padding: 16 },
  card: { width: '100%', height: 180, backgroundColor: '#FBC02D', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  currencyIconLarge: { width: 60, height: 60, marginBottom: 8 },
  balanceText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  rechargeList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  rechargeItem: { width: (width - 48) / 3, backgroundColor: '#1E1E1E', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  coinInfo: { alignItems: 'center', marginBottom: 8 },
  coinIconSmall: { width: 32, height: 32, marginBottom: 4 },
  coinAmount: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  bonusText: { color: '#999', fontSize: 10, textAlign: 'center' },
  priceText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  contactUs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 10 },
  contactText: { color: '#999', marginLeft: 8 },
  infoText: { color: '#999', textAlign: 'center', marginTop: 20 },
  exchangeButton: { marginTop: 40, borderWidth: 1, borderColor: '#4DB6AC', borderRadius: 25, paddingVertical: 12, alignItems: 'center' },
  exchangeText: { color: '#4DB6AC', fontSize: 18, fontWeight: '500' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  listText: { color: '#FFF', fontSize: 16 },
});

export default WalletScreen;
