import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Users, UserPlus, Heart, Slash, Bell } from 'lucide-react-native';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const SOCKET_URL = 'https://api.onchat.fun';

const MessageScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const socketRef = useRef<any>(null);
  const [messages, setMessages] = useState<any[]>([
    // Real data will be populated by Socket.io and future REST endpoints
  ]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('register', user.id);

    socketRef.current.on('new-private-message', (data: any) => {
      setMessages((prev) => [{
        id: Math.random().toString(),
        name: 'Private Message',
        message: data.content,
        time: 'Now',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + data.fromUserId,
      }, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const socialCategories = [
    { id: '1', title: 'Friends', icon: <Users size={24} color="#F59E0B" />, bgColor: '#F59E0B20' },
    { id: '2', title: 'Following', icon: <UserPlus size={24} color="#6366F1" />, bgColor: '#6366F120' },
    { id: '3', title: 'Fans', icon: <Heart size={24} color="#EC4899" />, bgColor: '#EC489920' },
    { id: '4', title: 'Blocked List', icon: <Slash size={24} color="#94A3B8" />, bgColor: '#94A3B820' },
  ];

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
        {item.icon}
      </View>
      <Text style={styles.categoryText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.messageItem}
      onPress={() => item.id !== '3' && navigation.navigate('ChatDetail', { recipientId: item.id, recipientName: item.name })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={[styles.userName, item.isSystem && styles.systemName]}>{item.name}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Message</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => {
              Alert.prompt(
                'Add Friend',
                'Enter User ID (Short ID):',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Add',
                    onPress: async (shortId: string | undefined) => {
                      if (!shortId) return;
                      try {
                        await api.post('/social/follow', { targetId: shortId }); // Adjust endpoint if needed
                        Alert.alert('Success', 'Friend request sent!');
                      } catch (error: any) {
                        Alert.alert('Error', error.response?.data?.error || 'Could not find user');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <UserPlus size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Bell size={24} color="#F8FAFC" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categories}>
        <FlatList
          data={socialCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#00C1BB' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { marginLeft: 15 },
  categories: { marginVertical: 20 },
  categoryList: { paddingHorizontal: 15 },
  categoryItem: { alignItems: 'center', marginRight: 25 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryText: { color: '#94A3B8', fontSize: 12 },
  messageList: { paddingHorizontal: 20 },
  messageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#1E293B' },
  messageContent: { flex: 1, marginLeft: 15 },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 },
  userName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  systemName: { color: '#00C1BB' },
  timeText: { color: '#475569', fontSize: 12 },
  lastMessage: { color: '#94A3B8', fontSize: 14 },
});

export default MessageScreen;
