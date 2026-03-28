import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Animated, Easing } from 'react-native';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { roomApi } from '../utils/api';
import { Send, Mic, MicOff, LogOut, Gift, Users } from 'lucide-react-native';

// Note: In a real app, you would use react-native-agora here.
// For this demo, we'll simulate the voice states.

const SOCKET_URL = 'http://localhost:5000';

const RoomScreen = ({ route, navigation }: any) => {
  const { roomId } = route.params;
  const { user, token } = useAuthStore();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showGift, setShowGift] = useState(false);
  
  // Animations
  const giftOpacity = useRef(new Animated.Value(0)).current;
  const giftScale = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const socketRef = useRef<any>(null);

  const fetchRoomDetails = async () => {
    try {
      const { data } = await roomApi.getRoomById(roomId);
      setRoom(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Fetch room details failed', error);
      Alert.alert('Error', 'Could not load room details');
      navigation.goBack();
    }
  };

  useEffect(() => {
    fetchRoomDetails();

    // Initialize Socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join-room', roomId);

    socketRef.current.on('new-message', (message: any) => {
      setMessages((prev) => [message, ...prev]);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const messageData = {
      roomId,
      userId: user.id,
      content: inputText,
    };

    socketRef.current.emit('send-message', messageData);
    setInputText('');
  };

  const handleLeave = () => {
    navigation.goBack();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In real app: agoraEngine.current?.muteLocalAudioStream(!isMuted);
  };

  const handleSendGift = () => {
    setShowGift(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(giftOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(giftScale, { toValue: 1.5, friction: 3, useNativeDriver: true })
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(giftOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(giftScale, { toValue: 0.5, duration: 300, useNativeDriver: true })
      ])
    ]).start(() => setShowGift(false));
  };

  const renderMessage = ({ item }: any) => (
    <View style={styles.messageBubble}>
      <Text style={styles.messageUser}>{item.user?.name || 'User'}:</Text>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  const renderParticipant = ({ item }: any) => {
    // Mocking active speaker for the host to show animation
    const isActiveSpeaker = item.role === 'HOST';
    return (
      <View style={styles.participantItem}>
        <Animated.View style={[
          styles.avatar, 
          { backgroundColor: isActiveSpeaker ? '#818CF8' : '#334155' },
          isActiveSpeaker && { transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || 'U'}</Text>
        </Animated.View>
        <Text style={styles.participantName} numberOfLines={1}>{item.user?.name || 'User'}</Text>
      </View>
    );
  };

  if (!room) return <View style={styles.loading}><Text style={styles.loadingText}>Joining Room...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.roomTitle}>{room.title}</Text>
          <View style={styles.activeBadge}>
            <View style={styles.pulse} />
            <Text style={styles.activeText}>Live Audio</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveBtn}>
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Participants Grid */}
      <View style={styles.participantsContainer}>
        <FlatList
          data={room.participants}
          renderItem={renderParticipant}
          keyExtractor={(item: any) => item.id}
          numColumns={4}
          scrollEnabled={false}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Speakers & Listeners</Text>}
        />
      </View>

      {/* Chat History */}
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item: any) => item.id || Math.random().toString()}
          inverted
          contentContainerStyle={styles.messageList}
        />
      </View>

      {/* Controls & Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.bottomBar}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.controlBtn, isMuted && styles.mutedBtn]} onPress={toggleMute}>
              {isMuted ? <MicOff size={24} color="#FFF" /> : <Mic size={24} color="#FFF" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={handleSendGift}>
              <Gift size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Say something nice..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
              <Send size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Gift Overlay Animation */}
      {showGift && (
        <Animated.View style={[styles.giftOverlay, { opacity: giftOpacity, transform: [{ scale: giftScale }] }]}>
          <Text style={styles.giftEmoji}>🎁</Text>
          <Text style={styles.giftText}>Super Gift Sent!</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loading: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#F8FAFC', fontSize: 18 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerInfo: { flex: 1 },
  roomTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 6 },
  activeText: { color: '#22C55E', fontSize: 12, fontWeight: '600' },
  leaveBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 12 },
  participantsContainer: { padding: 20, height: 250 },
  sectionTitle: { color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  participantItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  participantName: { color: '#F8FAFC', fontSize: 12, width: '90%', textAlign: 'center' },
  chatContainer: { flex: 1, backgroundColor: '#020617', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  messageList: { paddingBottom: 10 },
  messageBubble: { flexDirection: 'row', marginBottom: 12, paddingRight: 20 },
  messageUser: { color: '#818CF8', fontWeight: 'bold', marginRight: 8 },
  messageText: { color: '#CBD5E1', fontSize: 15, lineHeight: 20 },
  bottomBar: { padding: 15, paddingBottom: Platform.OS === 'ios' ? 25 : 15, backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center' },
  actionButtons: { flexDirection: 'row', marginRight: 15 },
  controlBtn: { backgroundColor: '#334155', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  mutedBtn: { backgroundColor: '#EF4444' },
  inputWrapper: { flex: 1, flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 25, alignItems: 'center', paddingHorizontal: 15 },
  input: { flex: 1, height: 45, color: '#F8FAFC', fontSize: 15 },
  sendBtn: { marginLeft: 10 },
  giftOverlay: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center', zIndex: 100 },
  giftEmoji: { fontSize: 80 },
  giftText: { color: '#F59E0B', fontSize: 24, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3, marginTop: 10 }
});

export default RoomScreen;
