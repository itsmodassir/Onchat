import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  Send, Mic, MicOff, LogOut, Gift, 
  Settings, Package, Gamepad2, 
  Smile, Volume2, ChevronLeft, Shield,
  TrendingUp, MessageSquare, UserPlus,
  Check, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InviteFriendModal } from '../components/InviteFriendModal';
import { GiftModal } from '../components/GiftModal';
import { GriddyGameOverlay } from '../components/GriddyGameOverlay';


const AppLink = (Link as any);

const SOCKET_URL = 'https://api.onchat.fun';
const AGORA_APP_ID = '9d18a75d24414470bc079f500ea3a7a6';

export const RoomScreen = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useStore();
  
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [lockedSeatIndexes, setLockedSeatIndexes] = useState<Set<number>>(new Set());
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [giftAlert, setGiftAlert] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const agoraClient = useRef<IAgoraRTCClient | null>(null);
  const localTrack = useRef<IMicrophoneAudioTrack | null>(null);

  const fetchFollowing = useCallback(async () => {
    try {
      const { data } = await api.get(`/social/following/${user?.id}`);
      setFollowingIds(new Set(data.map((f: any) => f.followingId)));
    } catch (e) {
      console.error('Fetch following failed', e);
    }
  }, [user?.id]);

  const setupAgora = useCallback(async (rtcToken: string) => {
    try {
      agoraClient.current = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      
      const role = room?.hostId === user?.id ? 'host' : 'audience';
      await agoraClient.current.setClientRole(role);

      await agoraClient.current.join(
        AGORA_APP_ID, 
        roomId!, 
        rtcToken, 
        Number(user?.shortId?.slice(0, 8)) || null
      );

      if (role === 'host') {
        localTrack.current = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'music_standard'
        });
        await agoraClient.current.publish(localTrack.current);
      }

      agoraClient.current.on('user-published', async (remoteUser, mediaType) => {
        await agoraClient.current?.subscribe(remoteUser, mediaType);
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

    } catch (e) {
      console.error('Agora Web setup error:', e);
    }
  }, [roomId, user, room?.hostId]);

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return;
    try {
      const { data } = await api.get(`/rooms/${roomId}`);
      setRoom(data);
      setMessages(data.messages || []);
      setParticipants(data.participants || []);

      const rtcRes = await api.post(`/rooms/${roomId}/join`);
      if (rtcRes.data.rtcToken) {
        setupAgora(rtcRes.data.rtcToken);
      }
    } catch (error) {
      console.error('Fetch room failed:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate, setupAgora]);

  useEffect(() => {
    fetchRoomDetails();
    fetchFollowing();

    socketRef.current = io(SOCKET_URL, { 
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current.emit('join-room', { roomId });

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

    return () => {
      socketRef.current?.emit('leave-room', { roomId });
      socketRef.current?.disconnect();
      localTrack.current?.stop();
      localTrack.current?.close();
      agoraClient.current?.leave();
    };
  }, [roomId, token, user?.id, fetchRoomDetails, fetchFollowing]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('user-mute-updated', (data: { userId: string; isMuted: boolean }) => {
      setMutedUserIds(prev => {
        const next = new Set(prev);
        if (data.isMuted) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    socketRef.current.on('seat-locked', (data: { seatIndex: number }) => {
      setLockedSeatIndexes(prev => new Set(prev).add(data.seatIndex));
    });

    socketRef.current.on('seat-unlocked', (data: { seatIndex: number }) => {
      setLockedSeatIndexes(prev => {
        const next = new Set(prev);
        next.delete(data.seatIndex);
        return next;
      });
    });

    socketRef.current.on('seat-joined', (data: { userId: string; seatIndex: number }) => {
      // In a real app we'd fetch the user details, for now we let it sync
      fetchRoomDetails();
    });

    socketRef.current.on('new-gift-alert', (_data: any) => {
      setGiftAlert(_data);
      setTimeout(() => setGiftAlert(null), 3000);
    });

    return () => {
      socketRef.current?.off('user-mute-updated');
      socketRef.current?.off('seat-locked');
      socketRef.current?.off('seat-unlocked');
      socketRef.current?.off('new-gift-alert');
    };
  }, [socketRef.current]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', { roomId, content: inputText });
    setInputText('');
  };

  const handleSendGift = (giftId: string, points: number) => {
    if (!socketRef.current || !selectedRecipientId) return;
    socketRef.current.emit('send-gift', { 
        roomId, 
        toUserId: selectedRecipientId, 
        giftId, 
        points 
    });
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      await api.post('/social/follow', { userId: targetUserId });
      setFollowingIds(prev => new Set([...prev, targetUserId]));
    } catch (e) {
      console.error('Follow failed', e);
    }
  };

  const toggleMute = () => {
    if (!localTrack.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localTrack.current.setEnabled(!nextMute);
    socketRef.current?.emit('toggle-mute', { roomId, isMuted: nextMute });
  };

  if (loading || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
        />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Social Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* Immersive Background Blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 relative z-10 border-b border-white/5 backdrop-blur-xl bg-white/2">
        <div className="flex items-center gap-6">
          <AppLink to="/" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <ChevronLeft className="w-6 h-6" />
          </AppLink>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl border-2 border-indigo-500 overflow-hidden shadow-2xl">
                <img src={room.host?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.hostId}`} className="w-full h-full object-cover" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight leading-none mb-1">{room.title}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Shield className="w-3 h-3 text-indigo-400" />
                   Official Channel • {participants.length} Active
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="px-6 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/5 active:scale-95"
          >
             <UserPlus className="w-4 h-4" />
             Transmitting Invite
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Settings className="w-5 h-5" /></button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Leave Room
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Side: Stage (Participants) */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-none">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {/* Host Seat */}
              <div className="flex flex-col items-center gap-4 group">
                 <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" 
                    />
                    <div 
                      onClick={() => { setSelectedRecipientId(room.hostId); setIsGiftModalOpen(true); }}
                      className="w-24 h-24 rounded-[2.5rem] border-4 border-indigo-500 overflow-hidden relative z-10 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105 cursor-pointer"
                    >
                       <img src={room.host?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.hostId}`} className="w-full h-full object-cover" />
                       {mutedUserIds.has(room.hostId) && (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                            <MicOff className="w-8 h-8 text-rose-500" />
                         </div>
                       )}
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-20">HOST</div>
                 </div>
                 <span className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase">{room.host?.name}</span>
              </div>

              {/* Guest Seats (Simulated empty or filled) */}
              {Array.from({ length: 7 }).map((_, i) => {
                 const p = participants[i + 1];
                 const isFollowing = p ? followingIds.has(p.userId) : false;
                 const isLocked = lockedSeatIndexes.has(i);
                 
                 return (
                    <div key={i} className="flex flex-col items-center gap-4 group relative">
                       <div 
                         onClick={() => {
                           if (p) {
                             setSelectedRecipientId(p.userId);
                             setIsGiftModalOpen(true);
                           } else if (user?.id === room.hostId) {
                             const event = isLocked ? 'unlock-seat' : 'lock-seat';
                             socketRef.current?.emit(event, { roomId, seatIndex: i });
                           } else if (!isLocked) {
                             socketRef.current?.emit('join-seat', { roomId, seatIndex: i });
                           }
                         }}
                         className={`w-20 h-20 rounded-[2rem] border-2 border-white/5 bg-white/2 hover:border-indigo-500/30 transition-all flex items-center justify-center overflow-hidden relative ${(!p && (user?.id === room.hostId || !isLocked)) || p ? 'cursor-pointer' : ''}`}
                       >
                          {p ? (
                             <>
                               <img src={p.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`} className="w-full h-full object-cover" />
                               {mutedUserIds.has(p.userId) && (
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <MicOff className="w-6 h-6 text-rose-500" />
                                 </div>
                               )}
                               {p.userId !== user?.id && !isFollowing && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleFollow(p.userId); }}
                                   className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                 >
                                    <UserPlus className="w-6 h-6" />
                                 </button>
                               )}
                               {isFollowing && (
                                 <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                 </div>
                               )}
                             </>
                          ) : (
                             isLocked ? (
                               <Lock className="w-6 h-6 text-rose-500/50 group-hover:text-rose-500 transition-colors" />
                             ) : (
                               <Package className="w-6 h-6 text-slate-800 group-hover:text-indigo-500/20 transition-colors" />
                             )
                          )}
                       </div>
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {p ? p.user?.name : `Slot ${i + 2}`}
                       </span>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Right Side: Chat Sidebar */}
        <div className="w-[450px] border-l border-white/5 flex flex-col bg-white/1 backdrop-blur-2xl">
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <MessageSquare className="w-4 h-4 text-indigo-500" />
                 <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live Transmission</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[9px] font-black text-indigo-400 tabular-nums uppercase">{participants.length} online</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse scrollbar-none">
              {messages.map((msg, idx) => (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   key={idx} 
                   className="flex gap-4 items-start group"
                 >
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                       <img src={msg.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user?.id}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-indigo-400 truncate max-w-[120px]">{msg.user?.name}</span>
                          <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">12:34 PM</span>
                       </div>
                       <p className="text-sm text-slate-300 leading-relaxed bg-white/2 p-3 rounded-2xl rounded-tl-none border border-white/5 group-hover:border-white/10 transition-colors">
                          {msg.content}
                       </p>
                    </div>
                 </motion.div>
              ))}
           </div>

           <div className="p-6 pt-0">
              <form onSubmit={handleSendMessage} className="relative group">
                 <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Broadcast your thought..."
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                 />
                 <button 
                   type="submit"
                   className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-400 transition-all shadow-lg active:scale-95"
                 >
                    <Send className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>
      </main>

      {/* Persistent Bottom Controls */}
      <footer className="h-24 border-t border-white/5 backdrop-blur-3xl bg-white/2 px-8 flex items-center justify-between relative z-20">
         <div className="flex items-center gap-6">
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Volume2 className="w-6 h-6" /></button>
            <div className="h-8 w-[1px] bg-white/5" />
            <button 
              onClick={toggleMute}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl relative overflow-hidden group ${isMuted ? 'bg-rose-500/20 border-rose-500/30' : 'bg-indigo-600 border-indigo-500 shadow-indigo-600/30'}`}
            >
               {isMuted ? <MicOff className="w-6 h-6 text-rose-500" /> : <Mic className="w-6 h-6 text-white" />}
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Smile className="w-6 h-6" /></button>
         </div>

         <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-2xl border border-white/5 hidden md:flex">
            <div className="px-4 py-2 flex items-center gap-2 border-r border-white/5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase">Lv. {user?.level || 1} Auditor</span>
            </div>
            <div className="px-4 py-2 flex items-center gap-3">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-lg bg-slate-800 border-2 border-[#020617] overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${i}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">+1.17M REACH</span>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsGameModalOpen(true)}
              className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
              <Gamepad2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => { setSelectedRecipientId(room.hostId); setIsGiftModalOpen(true); }}
              className="px-8 h-14 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
            >
               <Gift className="w-5 h-5" />
               Gift Shop
            </button>
         </div>
      </footer>

      <InviteFriendModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        roomId={roomId!}
      />

      <GiftModal 
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        onSend={handleSendGift}
        recipientName={
          selectedRecipientId === room.hostId 
            ? room.host?.name 
            : participants.find(p => p.userId === selectedRecipientId)?.user?.name || 'User'
        }
      />

      <AnimatePresence>
        {giftAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-indigo-600/90 backdrop-blur-xl border border-indigo-400 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                🎁
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-widest">Gift Stream</p>
                <p className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mt-1">Sent a gift worth {giftAlert.points} LP!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GriddyGameOverlay 
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        roomId={roomId!}
      />
    </div>
  );
};
