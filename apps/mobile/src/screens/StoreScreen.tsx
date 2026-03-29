import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const StoreScreen = () => {
  const navigation = useNavigation();
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
      <Image source={{ uri: item.image }} style={styles.itemImage} />
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Store</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Wallet')}>
          <View style={styles.bagIcon}>
            <Ionicons name="briefcase" size={20} color="#FFF" />
            <Text style={styles.bagText}>Wallet</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.userPreview}>
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
          <Text style={styles.balanceText}>0</Text>
        </View>
        <View style={styles.footerButtons}>
           <TouchableOpacity style={styles.sendButton}>
             <Text style={styles.footerButtonText}>Send</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#4DB6AC' }]}>
             <Text style={styles.footerButtonText}>Buy</Text>
           </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0821',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bagIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bagText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 4,
  },
  userPreview: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1438',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  tab: {
    marginRight: 20,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  list: {
    padding: 12,
  },
  itemCard: {
    width: (width - 40) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#4DB6AC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  buyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1A1438',
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  footerButtons: {
    flexDirection: 'row',
  },
  sendButton: {
    backgroundColor: '#8E24AA',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  footerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default StoreScreen;
