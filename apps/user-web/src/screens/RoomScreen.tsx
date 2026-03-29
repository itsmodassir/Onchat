import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  Send, Mic, MicOff, LogOut, Gift, 
  Settings, Share2, Package, Gamepad2, 
  Smile, Volume2, ChevronLeft, Shield,
  TrendingUp, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

const AppLink = (Link as any);

const SOCKET_URL = 'http://13.126.135.253';
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

  const socketRef = useRef<Socket | null>(null);
  const agoraClient = useRef<IAgoraRTCClient | null>(null);
  const localTrack = useRef<IMicrophoneAudioTrack | null>(null);

  const setupAgora = useCallback(async (rtcToken: string) => {
    try {
      agoraClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      await agoraClient.current.join(
        AGORA_APP_ID, 
        roomId!, 
        rtcToken, 
        Number(user?.shortId?.slice(0, 8)) || null
      );

      if (room?.hostId === user?.id) {
        localTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
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

    socketRef.current = io(SOCKET_URL, { 
      auth: { token },
      transports: ['websocket']
    });

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

    return () => {
      socketRef.current?.emit('leave-room', { roomId, userId: user?.id });
      socketRef.current?.disconnect();
      localTrack.current?.stop();
      localTrack.current?.close();
      agoraClient.current?.leave();
    };
  }, [roomId, token, user?.id, fetchRoomDetails]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', { roomId, content: inputText });
    setInputText('');
  };

  const toggleMute = () => {
    if (!localTrack.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localTrack.current.setEnabled(!nextMute);
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
          <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
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
                    <div className="w-24 h-24 rounded-[2.5rem] border-4 border-indigo-500 overflow-hidden relative z-10 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
                       <img src={room.host?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.hostId}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-20">HOST</div>
                 </div>
                 <span className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase">{room.host?.name}</span>
              </div>

              {/* Guest Seats (Simulated empty or filled) */}
              {Array.from({ length: 7 }).map((_, i) => {
                 const p = participants[i + 1];
                 return (
                    <div key={i} className="flex flex-col items-center gap-4 group">
                       <div className="w-20 h-20 rounded-[2rem] border-2 border-white/5 bg-white/2 hover:border-indigo-500/30 transition-all flex items-center justify-center overflow-hidden">
                          {p ? (
                             <img src={p.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`} className="w-full h-full object-cover" />
                          ) : (
                             <Package className="w-6 h-6 text-slate-800 group-hover:text-indigo-500/20 transition-colors" />
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
                <span className="text-[10px] font-black text-slate-500 uppercase">Lv. 28 Auditor</span>
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
            <button className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95"><Gamepad2 className="w-6 h-6" /></button>
            <button className="px-8 h-14 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3">
               <Gift className="w-5 h-5" />
               Gift Shop
            </button>
         </div>
      </footer>
    </div>
  );
};
