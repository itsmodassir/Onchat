import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Dimensions, TouchableOpacity, 
  FlatList, Image, Modal, Animated, Pressable, ActivityIndicator 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Package, Smartphone, Coins, Gem, ChevronRight, Briefcase } from 'lucide-react-native';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

interface GiftOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSend: (gift: any, quantity: number) => void;
  userBalance: { coins: number; crystals: number };
}

const CATEGORIES = ['Gift', 'Event', 'Lucky', 'CP', 'Classic'];
const QUANTITIES = [1, 10, 66, 99, 188, 520, 1314];

const GiftOverlay: React.FC<GiftOverlayProps> = ({ visible, onClose, onSend, userBalance }) => {
  const [activeTab, setActiveTab] = useState('Gift');
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [showQtyPicker, setShowQtyPicker] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).current.start();
      fetchGifts();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true
      }).current.start();
    }
  }, [visible]);

  const fetchGifts = async () => {
    try {
      // For now using mock high-res gifts as in the image
      const mockGifts = [
        { id: '1', name: 'Gold Watch', price: 4799, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/3003/3003225.png' },
        { id: '2', name: 'Rocket', price: 14999, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/1043/1043134.png' },
        { id: '3', name: 'Love You', price: 10000, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/3364/3364213.png' },
        { id: '4', name: 'Mystery Box', price: 300, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/2855/2855581.png' },
        { id: '5', name: 'Floating', price: 5000, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/411/411712.png' },
        { id: '6', name: 'Ferris Wheel', price: 599, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/1042/1042301.png' },
        { id: '7', name: 'Apple', price: 39, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/415/415733.png' },
        { id: '8', name: 'Blue Rose', price: 19, currency: 'COIN', image: 'https://cdn-icons-png.flaticon.com/512/188/188164.png' },
      ];
      setGifts(mockGifts);
      setLoading(false);
    } catch (error) {
      console.error('Fetch gifts error:', error);
      setLoading(false);
    }
  };

  const renderGiftItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.giftItem, selectedGift?.id === item.id && styles.selectedGiftItem]}
      onPress={() => setSelectedGift(item)}
    >
      <Image source={{ uri: item.image }} style={styles.giftImage} />
      <Text style={styles.giftName}>{item.name}</Text>
      <View style={styles.priceContainer}>
        <Coins size={12} color="#FFD700" />
        <Text style={styles.giftPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          style={[styles.content, { transform: [{ translateY: slideAnim }] }]}
          onStartShouldSetResponder={() => true}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            {/* Tabs */}
            <View style={styles.header}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    onPress={() => setActiveTab(cat)}
                    style={[styles.tab, activeTab === cat && styles.activeTab]}
                  >
                    <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.bagBtn}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2950/2950334.png' }} style={styles.bagIcon} />
                <Text style={styles.bagText}>Bag</Text>
              </TouchableOpacity>
            </View>

            {/* Gift List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#db2777" />
              </View>
            ) : (
              <FlatList
                data={gifts}
                renderItem={renderGiftItem}
                keyExtractor={item => item.id}
                numColumns={4}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.balanceContainer}>
                <View style={styles.balanceItem}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }} style={styles.currencyIcon} />
                  <Text style={styles.balanceValue}>{userBalance.coins}</Text>
                  <ChevronRight size={14} color="#FFF" />
                </View>
                <View style={[styles.balanceItem, { marginLeft: 12 }]}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2312/2312739.png' }} style={styles.currencyIcon} />
                  <Text style={styles.balanceValue}>{userBalance.crystals}</Text>
                  <ChevronRight size={14} color="#FFF" />
                </View>
              </View>

              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  style={styles.qtyPicker} 
                  onPress={() => setShowQtyPicker(!showQtyPicker)}
                >
                  <Text style={styles.qtyText}>{selectedQty}</Text>
                  <ChevronRight size={16} color="#FFF" style={{ transform: [{ rotate: showQtyPicker ? '-90deg' : '90deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sendBtn, !selectedGift && styles.disabledSendBtn]}
                  disabled={!selectedGift}
                  onPress={() => onSend(selectedGift, selectedQty)}
                >
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Qty Picker Overlay */}
            {showQtyPicker && (
              <View style={styles.qtyOverlay}>
                {QUANTITIES.map(qty => (
                  <TouchableOpacity 
                    key={qty} 
                    style={styles.qtyItem}
                    onPress={() => {
                      setSelectedQty(qty);
                      setShowQtyPicker(false);
                    }}
                  >
                    <Text style={styles.qtyItemText}>{qty}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </BlurView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ... keep styles updated for premium look ...
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  content: { height: height * 0.45, width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  blurContainer: { flex: 1, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  tabsScroll: { flex: 1 },
  tab: { paddingVertical: 10, marginRight: 20 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#db2777' },
  tabText: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  bagBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  bagIcon: { width: 16, height: 16, marginRight: 5 },
  bagText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  listContent: { padding: 10 },
  giftItem: { width: (width - 20) / 4, alignItems: 'center', padding: 5, marginBottom: 10 },
  selectedGiftItem: { backgroundColor: 'rgba(219, 39, 119, 0.2)', borderRadius: 12, borderWidth: 1, borderColor: '#db2777' },
  giftImage: { width: 50, height: 50, marginBottom: 5 },
  giftName: { color: '#94a3b8', fontSize: 10, marginBottom: 2 },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  giftPrice: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10 },
  balanceContainer: { flexDirection: 'row' },
  balanceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 15 },
  currencyIcon: { width: 14, height: 14, marginRight: 4 },
  balanceValue: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginRight: 2 },
  actionContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  qtyText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginRight: 5 },
  sendBtn: { backgroundColor: '#00C1BB', paddingHorizontal: 25, paddingVertical: 8, borderRadius: 20 },
  disabledSendBtn: { backgroundColor: '#475569', opacity: 0.5 },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  qtyOverlay: { position: 'absolute', bottom: 70, right: 100, backgroundColor: '#1e293b', borderRadius: 12, padding: 5, borderWidth: 1, borderColor: '#334155', elevation: 5 },
  qtyItem: { paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  qtyItemText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});

import { ScrollView } from 'react-native-gesture-handler';

export default GiftOverlay;
