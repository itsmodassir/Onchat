import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Animated, Easing } from 'react-native';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { roomApi } from '../utils/api';
import { Send, Mic, MicOff, LogOut, Gift, Users } from 'lucide-react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
} from 'react-native-agora';

const APP_ID = '9d18a75d24414470bc079f500ea3a7a6';
const SOCKET_URL = 'https://api.onchat.fun';

const RoomScreen = ({ route, navigation }: any) => {
  const { roomId } = route.params;
  const { user, token } = useAuthStore();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  
  // Agora State
  const agoraEngine = useRef<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);

  // Animations
  const giftOpacity = useRef(new Animated.Value(0)).current;
  const giftScale = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const socketRef = useRef<any>(null);

  const setupVoice = async (rtcToken: string) => {
    try {
      agoraEngine.current = createAgoraRtcEngine();
      agoraEngine.current.initialize({ appId: APP_ID });
      agoraEngine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
      
      const role = room?.hostId === user.id ? ClientRoleType.ClientRoleBroadcaster : ClientRoleType.ClientRoleAudience;
      agoraEngine.current.setClientRole(role);

      agoraEngine.current.joinChannel(rtcToken, roomId, Number(user.shortId?.slice(0, 8)) || Math.floor(Math.random() * 10000), {
        publishMicrophoneTrack: role === ClientRoleType.ClientRoleBroadcaster,
      });

      setJoined(true);
    } catch (e) {
      console.error('Agora setup error:', e);
    }
  };

  const fetchRoomDetails = async () => {
    try {
      const { data } = await roomApi.getRoomById(roomId);
      setRoom(data);
      setMessages(data.messages || []);
      setParticipants(data.participants || []);
      
      // Get RTC Token from backend
      const rtcRes = await roomApi.joinRoom(token || '', roomId); 
      if (rtcRes.data.status === 'PENDING') {
        setIsPending(true);
      } else {
        setIsPending(false);
        setupVoice(rtcRes.data.rtcToken);
      }
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

    socketRef.current.on('new-gift', (data: any) => {
      if (data.roomId === roomId) {
        handleShowGiftAnimation(data.giftName);
      }
    });

    socketRef.current.on('user-joined', (data: any) => {
      if (data.roomId === roomId) {
        setParticipants(prev => {
          if (prev.find(p => p.userId === data.user.id)) return prev;
          return [...prev, { userId: data.user.id, user: data.user }];
        });
      }
    });

    socketRef.current.on('user-left', (data: any) => {
      if (data.roomId === roomId) {
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
        setPendingRequests(prev => prev.filter(p => p.userId !== data.userId));
      }
    });

    socketRef.current.on('join-approved', (data: any) => {
      if (data.roomId === roomId && data.userId === user.id) {
        setIsPending(false);
        // We'll need to fetch the token again or the approval event should include it.
        // For simplicity, re-fetch room details to get token.
        fetchRoomDetails();
      }
    });

    socketRef.current.on('new-join-request', (data: any) => {
      if (data.roomId === roomId) {
        setPendingRequests(prev => {
          if (prev.find(p => p.userId === data.userId)) return prev;
          return [...prev, data.user];
        });
      }
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    return () => {
      socketRef.current?.emit('leave-room', { roomId, userId: user.id });
      socketRef.current?.disconnect();
      agoraEngine.current?.leaveChannel();
      agoraEngine.current?.release();
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
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    agoraEngine.current?.muteLocalAudioStream(nextMute);
  };

  const handleShowGiftAnimation = (giftName: string) => {
    setShowGift(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(giftOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(giftScale, { toValue: 1.5, friction: 3, useNativeDriver: true })
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(giftOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(giftScale, { toValue: 0.5, duration: 300, useNativeDriver: true })
      ])
    ]).start(() => setShowGift(false));
  };

  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [giftAmount, setGiftAmount] = useState(100);

  const handleSendGift = () => {
    if (!selectedRecipientId) {
      Alert.alert('Select Recipient', 'Please tap on a participant to send a gift');
      return;
    }

    const giftData = {
      roomId,
      fromUserId: user.id,
      toUserId: selectedRecipientId,
      giftName: 'Diamond Ring',
      points: giftAmount,
    };
    socketRef.current.emit('send-gift', giftData);
    setShowGift(false);
  };

  const renderMessage = ({ item }: any) => (
    <View style={styles.messageBubble}>
      <Text style={styles.messageUser}>{item.user?.name || 'User'}:</Text>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  const renderParticipant = ({ item }: any) => {
    const isActiveSpeaker = item.role === 'HOST';
    const isSelected = selectedRecipientId === item.user?.id;

    return (
      <TouchableOpacity 
        style={styles.participantItem}
        onPress={() => setSelectedRecipientId(item.user?.id)}
      >
        <Animated.View style={[
          styles.avatar, 
          { backgroundColor: isActiveSpeaker ? '#818CF8' : '#334155' },
          isSelected && { borderWidth: 3, borderColor: '#F59E0B' },
          isActiveSpeaker && { transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || 'U'}</Text>
        </Animated.View>
        <Text style={[styles.participantName, isSelected && { color: '#F59E0B', fontWeight: 'bold' }]} numberOfLines={1}>
          {item.user?.name || 'User'}
        </Text>
      </TouchableOpacity>
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
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item: any) => item.id}
          numColumns={4}
          scrollEnabled={false}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Speakers & Listeners</Text>
              {room?.hostId === user.id && pendingRequests.length > 0 && (
                <TouchableOpacity style={styles.pendingBadge} onPress={() => setShowRequestsModal(true)}>
                  <Text style={styles.pendingCount}>{pendingRequests.length} Requests</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Pending Overlay */}
      {isPending && (
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>Waiting for Approval</Text>
            <Text style={styles.pendingText}>The host has been notified of your request to join.</Text>
            <TouchableOpacity style={styles.cancelPendingBtn} onPress={handleLeave}>
              <Text style={styles.cancelPendingText}>Leave Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Moderation Modal */}
      {showRequestsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Requests</Text>
            <FlatList
              data={pendingRequests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.requestItem}>
                  <Text style={styles.requestName}>{item.name}</Text>
                  <View style={styles.requestActions}>
                    <TouchableOpacity 
                      style={styles.rejectBtn} 
                      onPress={async () => {
                        await roomApi.rejectJoin(token!, roomId, item.id);
                        setPendingRequests(prev => prev.filter(p => p.id !== item.id));
                      }}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.approveBtn} 
                      onPress={async () => {
                        await roomApi.approveJoin(token!, roomId, item.id);
                        setPendingRequests(prev => prev.filter(p => p.id !== item.id));
                      }}
                    >
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowRequestsModal(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
          {selectedRecipientId && (
            <View style={styles.giftAmountSelector}>
              {[10, 100, 500, 1000].map(amt => (
                <TouchableOpacity 
                  key={amt} 
                  style={[styles.amtBtn, giftAmount === amt && styles.selectedAmtBtn]} 
                  onPress={() => setGiftAmount(amt)}
                >
                  <Text style={styles.amtText}>{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  pendingBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pendingCount: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  pendingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  pendingCard: { backgroundColor: '#1E293B', padding: 30, borderRadius: 20, alignItems: 'center', width: '80%' },
  pendingTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  pendingText: { color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  cancelPendingBtn: { backgroundColor: '#334155', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  cancelPendingText: { color: '#EF4444', fontWeight: 'bold' },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20, zIndex: 2000 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  requestItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  requestName: { color: '#FFF', fontSize: 16 },
  requestActions: { flexDirection: 'row' },
  approveBtn: { backgroundColor: '#00C1BB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 10 },
  approveText: { color: '#FFF', fontWeight: 'bold' },
  rejectBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rejectText: { color: '#EF4444' },
  closeModalBtn: { marginTop: 20, alignSelf: 'center' },
  closeModalText: { color: '#94A3B8', fontSize: 16 },

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
  giftAmountSelector: { position: 'absolute', top: -50, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1E293B', padding: 8, borderRadius: 15 },
  amtBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  selectedAmtBtn: { backgroundColor: '#F59E0B' },
  amtText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
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
