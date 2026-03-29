import { useEffect, useState, useRef } from 'react';
import { 
  Users, UserPlus, Heart, Slash, Bell, 
  Search, MessageSquare, 
  ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useStore } from '../store';
import api from '../utils/api';
import { motion } from 'framer-motion';

const SOCKET_URL = 'https://api.onchat.fun';

export const MessageScreen = () => {
  const { user } = useStore();
  const socketRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'system-1',
      name: 'Onchat Protocol',
      message: 'Welcome to the secure messaging terminal. End-to-end encryption is active.',
      time: 'Just now',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=onchat',
      isSystem: true,
      unread: 1
    }
  ]);

  useEffect(() => {
    if (!user?.id) return;
    
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('register', user.id);

    socketRef.current.on('new-private-message', (data: any) => {
      setMessages((prev) => [{
        id: Math.random().toString(),
        name: data.fromUserName || 'Private Signal',
        message: data.content,
        time: 'Now',
        avatar: data.fromUserAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + data.fromUserId,
        unread: 1
      }, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user?.id]);

  const socialCategories = [
    { id: '1', title: 'Friends', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: '2', title: 'Following', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: '3', title: 'Fans', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: '4', title: 'Blocked', icon: Slash, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  ];

  const handleAddFriend = async () => {
    const shortId = prompt('Enter User Protocol ID (Short ID):');
    if (!shortId) return;
    try {
      await api.post('/social/follow', { targetId: shortId });
      alert('Handshake request transmitted.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Target identity not found.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-8 p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Social Sidebar */}
      <aside className="w-96 flex flex-col gap-8">
        {/* Header & Controls */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-white tracking-tight">Signals</h1>
              <div className="flex gap-2">
                 <button 
                  onClick={handleAddFriend}
                  className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                 >
                    <UserPlus className="w-5 h-5" />
                 </button>
                 <button className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <Bell className="w-5 h-5" />
                 </button>
              </div>
           </div>

           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search frequencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold"
              />
           </div>
        </div>

        {/* Categories Horizontal */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
           {socialCategories.map((cat) => (
             <button 
                key={cat.id}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
             >
                <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} border border-white/5 group-hover:scale-105 transition-all`}>
                   <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cat.title}</span>
             </button>
           ))}
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
           {messages.map((msg) => (
             <motion.div 
               whileHover={{ x: 4 }}
               key={msg.id}
               className={`glass-card p-4 rounded-3xl border-white/5 flex items-center gap-4 cursor-pointer hover:bg-slate-900/60 transition-all relative ${msg.unread ? 'border-l-4 border-l-indigo-500' : ''}`}
             >
                <div className="relative">
                   <img src={msg.avatar} alt={msg.name} className="w-14 h-14 rounded-2xl bg-slate-800" />
                   {msg.unread > 0 && (
                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-950">
                        {msg.unread}
                     </div>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-black truncate ${msg.isSystem ? 'text-indigo-400' : 'text-white'}`}>{msg.name}</h3>
                      <span className="text-[10px] text-slate-600 font-bold">{msg.time}</span>
                   </div>
                   <p className="text-xs text-slate-500 truncate font-medium">{msg.message}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </aside>

      {/* Chat Terminal Placeholder */}
      <main className="flex-1 glass-card rounded-[3.5rem] border-white/5 bg-slate-900/20 backdrop-blur-3xl overflow-hidden flex flex-col items-center justify-center relative">
         <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
         
         <div className="text-center space-y-6 max-w-sm">
            <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-2xl shadow-indigo-600/10">
               <MessageSquare className="w-10 h-10" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-white tracking-tight uppercase">Terminal Offline</h2>
               <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                  Select a frequency from the sidebar to establish a secure neural handshake.
               </p>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
               <div className="px-4 py-1.5 bg-slate-900 rounded-full border border-white/5 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-emerald-100">Encryption Active</span>
               </div>
            </div>
         </div>

         {/* Backdrop Decor */}
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      </main>
    </div>
  );
};
