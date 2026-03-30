import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Animated, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { roomApi } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, Mic, MicOff, LogOut, Gift, Users, 
  Settings, Share2, Package, Gamepad2, 
  MessageSquare, Smile, Volume2 
} from 'lucide-react-native';

const Icons = {
  Send: Send as any,
  Mic: Mic as any,
  MicOff: MicOff as any,
  LogOut: LogOut as any,
  Gift: Gift as any,
  Users: Users as any,
  Settings: Settings as any,
  Share2: Share2 as any,
  Package: Package as any,
  Gamepad2: Gamepad2 as any,
  MessageSquare: MessageSquare as any,
  Smile: Smile as any,
  Volume2: Volume2 as any
};
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  AudioProfileType,
  AudioScenarioType,
  IRtcEngine,
} from 'react-native-agora';
import LuckyGameOverlay from '../components/LuckyGameOverlay';
import GiftOverlay from '../components/GiftOverlay';

const { width } = Dimensions.get('window');
const SOCKET_URL = 'https://api.onchat.fun';
const AGORA_APP_ID = '9d18a75d24414470bc079f500ea3a7a6';

const RoomScreen = ({ route, navigation }: any) => {
  const { roomId } = route.params;
  const { user, token, setUser } = useAuthStore();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showGame, setShowGame] = useState(false);
  const [showGift, setShowGift] = useState(false);
  
  const socketRef = useRef<any>(null);
  const agoraEngine = useRef<IRtcEngine | null>(null);

  const setupVoice = async (rtcToken: string) => {
    try {
      agoraEngine.current = createAgoraRtcEngine();
      agoraEngine.current.initialize({ appId: AGORA_APP_ID });
      agoraEngine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
      
      // Standardize audio profile for web-mobile parity
      agoraEngine.current.setAudioProfile(
        AudioProfileType.AudioProfileMusicStandard, 
        AudioScenarioType.AudioScenarioMeeting
      );

      const role = room?.hostId === user.id ? ClientRoleType.ClientRoleBroadcaster : ClientRoleType.ClientRoleAudience;
      agoraEngine.current.setClientRole(role);

      agoraEngine.current.joinChannel(rtcToken, roomId, Number(user.shortId?.slice(0, 8)) || Math.floor(Math.random() * 10000), {
        publishMicrophoneTrack: role === ClientRoleType.ClientRoleBroadcaster,
      });

      console.log('Agora joined channel:', roomId);
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

      // Join room to get RTC token
      const rtcRes = await roomApi.joinRoom(roomId);
      if (rtcRes.data.rtcToken) {
          setupVoice(rtcRes.data.rtcToken);
      }
    } catch (error: any) {
      console.error('Fetch room failed:', error.message);
      navigation.goBack();
    }
  };

  useEffect(() => {
    fetchRoomDetails();

    socketRef.current = io(SOCKET_URL, { auth: { token } });
    socketRef.current.emit('join-room', roomId);

    socketRef.current.on('new-message', (message: any) => {
      setMessages((prev) => [message, ...prev]);
    });

    socketRef.current.on('user-joined', (data: any) => {
      if (data.roomId === roomId) {
        setParticipants(prev => {
          if (prev.find(p => p.userId === data.user.id)) return prev;
          return [...prev, { userId: data.user.id, user: data.user, role: 'LISTENER' }];
        });
      }
    });

    socketRef.current.on('user-left', (data: any) => {
      if (data.roomId === roomId) {
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      }
    });

    return () => {
      socketRef.current?.emit('leave-room', { roomId, userId: user.id });
      socketRef.current?.disconnect();
      agoraEngine.current?.leaveChannel();
      agoraEngine.current?.release();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    socketRef.current.emit('send-message', { roomId, content: inputText });
    setInputText('');
  };

  const handleSendGift = async (gift: any, quantity: number) => {
    try {
      const totalCost = gift.price * quantity;
      if (user.coins < totalCost) {
        Alert.alert('Insufficient Coins', 'Please recharge to send this gift.');
        return;
      }

      await roomApi.sendGift({
        roomId,
        giftId: gift.id,
        quantity,
        targetUserId: room.hostId // Default to host for now
      });

      setUser({ ...user, coins: user.coins - totalCost });
      setShowGift(false);
      
      // Emit socket event for local animation trigger
      socketRef.current.emit('gift-sent', { 
        roomId, 
        gift, 
        quantity, 
        userName: user.name 
      });

    } catch (error: any) {
      Alert.alert('Gifting Failed', error.response?.data?.error || 'Something went wrong');
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    agoraEngine.current?.muteLocalAudioStream(nextMute);
  };

  const renderSeat = (index: number) => {
    const participant = participants[index];
    const isHost = index === 0;

    return (
      <View style={styles.seatWrapper} key={index}>
        <TouchableOpacity style={[styles.seat, participant && styles.activeSeat]}>
          {participant ? (
            <Image 
              source={{ uri: participant.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userId}` }} 
              style={styles.seatAvatar} 
            />
          ) : (
            <View style={[styles.emptySeat, { opacity: 0.5 }]}>
              <Icons.Package size={20} color="#6366f1" />
            </View>
          )}
          {participant?.role === 'HOST' && <View style={styles.hostBadge}><Text style={styles.hostBadgeText}>HOST</Text></View>}
        </TouchableOpacity>
        <Text style={styles.seatName} numberOfLines={1}>
          {participant ? participant.user?.name : index + 1}
        </Text>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  if (!room) return <View style={styles.loading}><Text style={styles.loadingText}>Entering Room...</Text></View>;

  return (
    <LinearGradient colors={['#4c1d95', '#1e1b4b', '#0f172a']} style={styles.container}>
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
             <Image 
               source={{ uri: room.host?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.hostId}` }} 
               style={styles.headerAvatar} 
             />
             <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>{room.title}</Text>
                <Text style={styles.headerSub}>ID: {room.host?.shortId || '1662149'} Lv.5</Text>
             </View>
          </View>
          <View style={styles.headerRight}>
             <TouchableOpacity style={styles.headerIcon}><Icons.Package size={20} color="#FFF" /></TouchableOpacity>
             <TouchableOpacity style={styles.headerIcon}><Icons.Share2 size={20} color="#FFF" /></TouchableOpacity>
             <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}><Icons.LogOut size={20} color="#FFF" /></TouchableOpacity>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
           <View style={styles.badgeRow}>
              <View style={styles.coinBadge}>
                 <Text style={styles.badgeText}>🏆 1.17M</Text>
              </View>
              <View style={[styles.coinBadge, { backgroundColor: '#ea580c' }]}>
                 <Text style={styles.badgeText}>🔥 1</Text>
              </View>
           </View>
           <View style={styles.familyBadge}>
              <Text style={styles.familyText}>III IPC Family</Text>
           </View>
        </View>

        {/* Central Host Zone */}
        <View style={styles.centralZone}>
           <Image 
             source={{ uri: room.host?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.hostId}` }} 
             style={styles.centralAvatar} 
           />
           <Text style={styles.hostTag}>{room.host?.name}</Text>
        </View>

        {/* Seat Grid */}
        <View style={styles.seatGrid}>
           <View style={styles.seatRow}>
             {[0, 1, 2, 3].map(i => renderSeat(i))}
           </View>
           <View style={styles.seatRow}>
             {[4, 5, 6, 7].map(i => renderSeat(i))}
           </View>
        </View>

        {/* Level Bar */}
        <View style={styles.levelBarContainer}>
           <Text style={styles.levelText}>Lv.28</Text>
           <View style={styles.levelProgressBg}>
              <View style={[styles.levelProgressFill, { width: '40%' }]} />
           </View>
           <Text style={styles.expText}>1049462</Text>
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
           <FlatList
             data={messages}
             keyExtractor={(item, index) => index.toString()}
             renderItem={({ item }) => (
               <View style={styles.messageRow}>
                  <View style={styles.messageBubble}>
                     <Text style={styles.messageContent}>
                        <Text style={styles.messageSender}>{item.user?.name}: </Text>
                        {item.content}
                     </Text>
                  </View>
               </View>
             )}
             inverted
           />
        </View>

        {/* Bottom Actions */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
           <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.actionIcon}><Icons.Volume2 size={24} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={toggleMute}>
                 {isMuted ? <Icons.MicOff size={24} color="#EF4444" /> : <Icons.Mic size={24} color="#FFF" />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}><Icons.Smile size={24} color="#FFF" /></TouchableOpacity>
              
              <View style={styles.inputContainer}>
                 <TextInput 
                   style={styles.chatInput}
                   placeholder="Type to chat..."
                   placeholderTextColor="#94a3b8"
                   value={inputText}
                   onChangeText={setInputText}
                   onSubmitEditing={handleSendMessage}
                 />
              </View>

              <TouchableOpacity style={styles.actionIcon} onPress={() => setShowGame(true)}>
                 <Icons.Gamepad2 size={24} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}><Icons.Package size={24} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={styles.giftBtn}>
                 <Icons.Gift size={24} color="#FFF" />
              </TouchableOpacity>
           </View>
        </KeyboardAvoidingView>

        <LuckyGameOverlay 
           visible={showGame} 
           onClose={() => setShowGame(false)} 
           balance={user.coins || 0}
           onUpdateBalance={(newBalance: number) => {
              setUser({ ...user, coins: newBalance });
           }}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#FFF' },
  headerInfo: { marginLeft: 10 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', width: 120 },
  headerSub: { color: '#94a3b8', fontSize: 10 },
  headerRight: { flexDirection: 'row' },
  headerIcon: { marginLeft: 12 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center' },
  badgeRow: { flexDirection: 'row' },
  coinBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  familyBadge: { backgroundColor: '#ea580c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  familyText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  centralZone: { alignItems: 'center', marginTop: 10 },
  centralAvatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#F59E0B' },
  hostTag: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  seatGrid: { paddingHorizontal: 10, marginTop: 15 },
  seatRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  seatWrapper: { alignItems: 'center', width: '22%' },
  seat: { width: 48, height: 48, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  activeSeat: { backgroundColor: 'transparent' },
  seatAvatar: { width: 48, height: 48, borderRadius: 15 },
  emptySeat: { width: 48, height: 48, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  seatName: { color: '#94a3b8', fontSize: 9, marginTop: 4 },
  hostBadge: { position: 'absolute', top: -8, backgroundColor: '#F59E0B', paddingHorizontal: 4, borderRadius: 4 },
  hostBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  levelBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginVertical: 8, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 4, borderRadius: 10, marginHorizontal: 10 },
  levelText: { color: '#00C1BB', fontSize: 10, fontWeight: 'bold' },
  levelProgressBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginHorizontal: 8 },
  levelProgressFill: { height: '100%', backgroundColor: '#00C1BB', borderRadius: 2 },
  expText: { color: '#94a3b8', fontSize: 10 },
  chatArea: { flex: 1, paddingHorizontal: 15 },
  messageRow: { marginBottom: 8, maxWidth: '85%' },
  messageBubble: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 12 },
  messageContent: { color: '#FFF', fontSize: 13 },
  messageSender: { color: '#818cf8', fontWeight: 'bold' },
  bottomActions: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  actionIcon: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  inputContainer: { flex: 1, marginHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12 },
  chatInput: { color: '#FFF', fontSize: 13, height: 38 },
  giftBtn: { backgroundColor: '#db2777', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' }
});

export default RoomScreen;
