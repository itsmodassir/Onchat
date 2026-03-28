import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { roomApi } from '../utils/api';
import { Plus, Users, Mic2 } from 'lucide-react-native';

const HomeScreen = ({ navigation }: any) => {
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const { token, user, logout } = useAuthStore();

  const fetchRooms = async () => {
    try {
      const { data } = await roomApi.getRooms();
      setRooms(data);
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
      const { data } = await roomApi.createRoom(token!, { title: newRoomTitle });
      setModalVisible(false);
      setNewRoomTitle('');
      navigation.navigate('Room', { roomId: data.id });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not create room');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const renderRoom = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.roomCard} 
      onPress={() => navigation.navigate('Room', { roomId: item.id })}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomTitle}>{item.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Live</Text>
        </View>
      </View>
      
      <View style={styles.roomFooter}>
        <View style={styles.userInfo}>
          <Text style={styles.hostName}>By {item.host.name || 'User'}</Text>
        </View>
        <View style={styles.participantCount}>
          <Users size={14} color="#94A3B8" />
          <Text style={styles.participantText}>{item._count.participants}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.explorer}>Explore Voice Rooms</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Mic2 size={48} color="#1E293B" />
            <Text style={styles.emptyText}>No active rooms. Be the first to start one!</Text>
          </View>
        }
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  explorer: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  logoutBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 8 },
  logoutText: { color: '#EF4444', fontSize: 12 },
  list: { padding: 20 },
  roomCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 3 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  badge: { backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  roomFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  hostName: { color: '#94A3B8', fontSize: 14 },
  participantCount: { flexDirection: 'row', alignItems: 'center' },
  participantText: { color: '#94A3B8', fontSize: 14, marginLeft: 5 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#6366F1', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  empty: { flex: 1, height: 400, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 20, width: 200 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20 },
  modalInput: { backgroundColor: '#0F172A', borderRadius: 12, padding: 15, color: '#F8FAFC', fontSize: 16, marginBottom: 25 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 15 },
  cancelText: { color: '#94A3B8', fontSize: 16 },
  createBtn: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  createText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

export default HomeScreen;
