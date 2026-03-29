import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  Image, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { roomApi } from '../utils/api';
import { Search, Globe, Home as HomeIcon, Trophy, Heart, Users, Music, Gamepad2, PartyPopper, Plus } from 'lucide-react-native';
import { Modal, TextInput, Alert } from 'react-native';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://api.onchat.fun';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const [rooms, setRooms] = useState([]);
  const [upcomingRooms, setUpcomingRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Hot');
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const tabs = ['Related', 'Upcoming', 'Hot', 'New'];

  const fetchRooms = async () => {
    try {
      if (activeTab === 'Upcoming') {
        const { data } = await roomApi.getUpcomingRooms();
        setUpcomingRooms(data);
      } else {
        const { data } = await roomApi.getRooms();
        setRooms(data);
        
        // Also fetch recommendations
        const recResponse = await roomApi.getRecommendedRooms();
        setRecommendedRooms(recResponse.data);
      }
    } catch (error) {
      console.error('Fetch rooms failed', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) return;
    try {
      const { data } = await roomApi.createRoom({ title: newRoomTitle });
      setModalVisible(false);
      setNewRoomTitle('');
      
      // Small timeout to ensure backend processing is complete if needed, 
      // but navigation should be immediate.
      setTimeout(() => {
        navigation.navigate('LiveRoom', { roomId: data.id });
      }, 500);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not create room');
    }
  };

  useEffect(() => {
    fetchRooms();

    const socket = io(SOCKET_URL, {
      auth: { token }
    });
    
    socket.on('new-room-active', (newRoom: any) => {
      setRooms((prevRooms: any) => {
        if (prevRooms.find((r: any) => r.id === newRoom.id)) return prevRooms;
        return [newRoom, ...prevRooms];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTab]);

  const formatCountdown = (dateString: string) => {
    const target = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) return 'Starting soon...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d left`;
    return `${hours}h ${mins}m left`;
  };

  const renderRoom = ({ item }: any) => {
    const isUpcoming = activeTab === 'Upcoming';

    return (
      <TouchableOpacity 
        style={styles.roomCard} 
        onPress={() => {
            if (isUpcoming) {
                Alert.alert('Upcoming Room', `This room starts at ${new Date(item.scheduledAt).toLocaleString()}`);
            } else {
                navigation.navigate('LiveRoom', { roomId: item.id });
            }
        }}
      >
        <Image 
          source={{ uri: item.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}` }} 
          style={styles.roomImage} 
        />
        <View style={styles.roomInfo}>
          <View style={styles.roomHeaderRow}>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.tagBadge, isUpcoming && { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.tagText, isUpcoming && { color: '#0EA5E9' }]}>
                {isUpcoming ? 'SCHEDULED' : (item.tags?.split(',')[0] || 'Party')}
              </Text>
            </View>
          </View>
          
          {isUpcoming ? (
              <View style={styles.countdownRow}>
                  <Text style={styles.countdownText}>{formatCountdown(item.scheduledAt)}</Text>
                  <Text style={styles.hostName}>By {item.host?.name || 'Host'}</Text>
              </View>
          ) : (
              <>
                <Text style={styles.welcomeMsg}>Welcome to my room</Text>
                <View style={styles.participantRow}>
                    <View style={styles.statItem}>
                       <View style={styles.barIcon} />
                       <Text style={styles.participantText}>{item._count?.participants || item.participants?.length || 0}</Text>
                    </View>
                </View>
              </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <View>
      {/* Recommended for You - Tier 3 */}
      {recommendedRooms.length > 0 && (
        <View style={styles.recommendationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleMain}>Recommended for You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Interests')}>
              <Text style={styles.seeAllText}>Interests {'>'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
            {recommendedRooms.map((room: any) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.recCard}
                onPress={() => navigation.navigate('LiveRoom', { roomId: room.id })}
              >
                <Image 
                  source={{ uri: room.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${room.id}` }} 
                  style={styles.recImage} 
                />
                <View style={styles.recOverlay}>
                   <Text style={styles.recTitle} numberOfLines={1}>{room.title}</Text>
                   <View style={styles.recStat}>
                      <Users size={10} color="#FFF" />
                      <Text style={styles.recStatText}>{room._count?.participants || 0}</Text>
                   </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Banner */}
      <TouchableOpacity style={styles.bannerContainer} onPress={() => navigation.navigate('Store')}>
        <Image 
          source={{ uri: 'https://img.freepik.com/free-vector/abstract-liquid-purple-banner-template_1017-31993.jpg' }} 
          style={styles.bannerImage}
          borderRadius={12}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Fragment Shop</Text>
        </View>
      </TouchableOpacity>

      {/* Shortcuts */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity 
          style={[styles.shortcutCard, { backgroundColor: '#F9731630' }]}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Trophy size={18} color="#F97316" />
          <Text style={styles.shortcutText}>Rank</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.shortcutCard, { backgroundColor: '#EC489930' }]}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Heart size={18} color="#EC4899" />
          <Text style={styles.shortcutText}>CP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.shortcutCard, { backgroundColor: '#3B82F630' }]}
          onPress={() => navigation.navigate('Family')}
        >
          <Users size={18} color="#3B82F6" />
          <Text style={styles.shortcutText}>Family</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
         <View style={styles.tabContainer}>
           {tabs.map(tab => (
             <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
               <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
               {activeTab === tab && <View style={styles.activeIndicator} />}
             </TouchableOpacity>
           ))}
         </View>
         <View style={styles.topIcons}>
           <TouchableOpacity style={styles.iconBtn}>
             <Globe size={20} color="#FFF" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.iconBtn}>
             <Search size={22} color="#FFF" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.iconBtn}>
             <HomeIcon size={22} color="#FFF" />
           </TouchableOpacity>
         </View>
      </View>

      <FlatList
        data={activeTab === 'Upcoming' ? upcomingRooms : rooms}
        renderItem={renderRoom}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00C1BB" />}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="#FFF" size={30} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Room</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Room Title"
              placeholderTextColor="#94A3B8"
              value={newRoomTitle}
              onChangeText={setNewRoomTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateRoom}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  listContent: { paddingBottom: 100 },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#00C1BB', 
    paddingHorizontal: 15, 
    paddingTop: 10,
    paddingBottom: 5 
  },
  tabContainer: { flexDirection: 'row', alignItems: 'center' },
  tabText: { color: '#B2F5F3', fontSize: 18, marginRight: 20, paddingBottom: 5 },
  activeTabText: { color: '#FFF', fontWeight: 'bold' },
  activeIndicator: { height: 3, backgroundColor: '#FFF', width: 25, borderRadius: 2, marginTop: -5 },
  topIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15 },
  bannerContainer: { margin: 15, height: 100, elevation: 2 },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', left: 20, top: 20 },
  bannerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  shortcutsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 15 },
  shortcutCard: { flex: 0.31, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  shortcutText: { marginLeft: 8, fontWeight: 'bold', color: '#475569' },
  roomCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    marginHorizontal: 15, 
    marginBottom: 10, 
    borderRadius: 12, 
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  roomImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F8FAFC' },
  roomInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-around' },
  roomHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  tagBadge: { backgroundColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { color: '#F97316', fontSize: 10, fontWeight: 'bold' },
  welcomeMsg: { color: '#94A3B8', fontSize: 14 },
  participantRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  barIcon: { width: 2, height: 10, backgroundColor: '#00C1BB', marginRight: 4 },
  participantText: { color: '#00C1BB', fontWeight: 'bold', fontSize: 14 },
  countdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countdownText: { color: '#0EA5E9', fontWeight: 'bold', fontSize: 13, backgroundColor: '#E0F2FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  hostName: { color: '#64748B', fontSize: 12 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#00C1BB', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
  modalInput: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 15, color: '#1E293B', fontSize: 16, marginBottom: 25 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 15 },
  cancelText: { color: '#94A3B8', fontSize: 16 },
  createBtn: { backgroundColor: '#00C1BB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  createText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  recommendationSection: { marginTop: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  sectionTitleMain: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  seeAllText: { color: '#00C1BB', fontSize: 13, fontWeight: '600' },
  recScroll: { paddingLeft: 15, paddingBottom: 5 },
  recCard: { width: 140, height: 180, marginRight: 12, borderRadius: 15, overflow: 'hidden', backgroundColor: '#F1F5F9' },
  recImage: { width: '100%', height: '100%' },
  recOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.4)' },
  recTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  recStat: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  recStatText: { color: '#FFF', fontSize: 10, marginLeft: 4, fontWeight: 'bold' },
});

export default HomeScreen;
