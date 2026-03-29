import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { ChevronLeft, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const StoreScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('HeadWear');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      let category = activeTab.toUpperCase();
      if (category === 'MOUNTS') category = 'MOUNT';
      if (category === 'CHAT BUBBLE') category = 'BUBBLE';

      const response = await api.get('/shop/store', {
        params: { category }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Fetch items error:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      {activeTab === 'Mounts' || activeTab === 'HeadWear' ? (
        <View style={styles.tryLabel}>
          <Text style={styles.tryText}>Try</Text>
        </View>
      ) : null}
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.priceContainer}>
        <Image 
          source={{ uri: item.currency === 'COIN' ? 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' : 'https://cdn-icons-png.flaticon.com/512/2312/2312739.png' }} 
          style={styles.currencyIcon} 
        />
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => buyItem(item.id)}
      >
        <Text style={styles.buyText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );

  const buyItem = async (itemId: string) => {
    try {
      await api.post('/shop/store/buy', { itemId });
      alert('Purchase successful!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Purchase failed');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Store</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.userPreview}>
        <TouchableOpacity style={styles.bagShortcut} onPress={() => (navigation as any).navigate('Wallet')}>
           <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2950/2950334.png' }} style={styles.bagSmallIcon} />
           <Text style={styles.bagShortcutText}>Bag</Text>
        </TouchableOpacity>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' }} 
          style={styles.avatar} 
        />
      </View>

      <View style={styles.tabs}>
        {['HeadWear', 'Mounts', 'Chat Bubble', 'Float'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found in this category.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.coinBalance}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }} style={styles.currencyIcon} />
          <Text style={styles.balanceText}>{user.coins || 0}</Text>
        </View>
        <View style={styles.footerButtons}>
           <TouchableOpacity style={[styles.footerBtn, styles.sendBtnLayout]}>
             <Text style={styles.footerButtonText}>Send</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.footerBtn, styles.buyBtnLayout]}>
             <Text style={styles.footerButtonText}>Buy</Text>
           </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0821' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  userPreview: { height: 180, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1438', marginHorizontal: 16, borderRadius: 16, marginTop: 8, overflow: 'hidden' },
  bagShortcut: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  bagSmallIcon: { width: 14, height: 14, marginRight: 4 },
  bagShortcutText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#FFF' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#252525' },
  tab: { marginRight: 25, paddingVertical: 10 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#8E24AA' },
  tabText: { color: '#999', fontSize: 15, fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  list: { padding: 10 },
  itemCard: { width: (width - 40) / 2, backgroundColor: '#FFF', borderRadius: 16, padding: 12, margin: 5, alignItems: 'center', overflow: 'hidden' },
  tryLabel: { position: 'absolute', top: 0, left: 0, backgroundColor: '#8E24AA', paddingHorizontal: 12, paddingVertical: 4, borderBottomRightRadius: 12 },
  tryText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  itemImage: { width: 100, height: 100, marginBottom: 8 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1A1438', marginBottom: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  currencyIcon: { width: 14, height: 14, marginRight: 4 },
  itemPrice: { fontSize: 15, color: '#FFB300', fontWeight: 'bold' },
  buyButton: { width: '100%', backgroundColor: '#4DB6AC', paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  buyText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { flex: 1, height: 300, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#0D0821', borderTopWidth: 1, borderTopColor: '#252525' },
  coinBalance: { flexDirection: 'row', alignItems: 'center' },
  balanceText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginLeft: 6 },
  footerButtons: { flexDirection: 'row' },
  footerBtn: { paddingHorizontal: 25, paddingVertical: 10, borderRadius: 25, marginLeft: 10 },
  sendBtnLayout: { backgroundColor: '#8E24AA' },
  buyBtnLayout: { backgroundColor: '#00C1BB' },
  footerButtonText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});

export default StoreScreen;
