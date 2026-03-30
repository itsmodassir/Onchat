import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Users, UserPlus, Heart, Slash, Bell, 
  Search, MessageSquare, 
  ShieldCheck, Send, ArrowLeft, X, Loader2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useStore } from '../store';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = 'http://localhost:5000'; // Updated to local for dev

export const MessageScreen = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token: useStore.getState().token }
    });

    socketRef.current.on('new-private-message', (data: any) => {
      if (selectedUser && (data.senderId === selectedUser.id || data.receiverId === selectedUser.id)) {
        setMessages((prev) => [...prev, data]);
      }
      fetchConversations();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user?.id, selectedUser?.id]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessageHistory(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/social/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchMessageHistory = async (targetUserId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/social/history/${targetUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await api.get(`/users/search?q=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const messageData = {
      toUserId: selectedUser.id,
      content: inputText,
    };

    socketRef.current.emit('send-private-message', messageData);
    setInputText('');
  };

  const handleStartChat = (targetUser: any) => {
    // Normalize user object structure
    const normalizedUser = {
      id: targetUser.id,
      name: targetUser.name,
      avatar: targetUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.id}`,
      shortId: targetUser.shortId
    };
    
    setSelectedUser(normalizedUser);
    
    // Clear search and add to conversations if not present
    setSearchQuery('');
    setSearchResults([]);

    // Check if this user is already in our conversations locally
    const exists = conversations.find(c => c.id === normalizedUser.id);
    if (!exists) {
      setConversations(prev => [normalizedUser, ...prev]);
    }
  };

  const socialCategories = [
    { id: '1', title: 'Friends', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: '2', title: 'Following', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: '3', title: 'Fans', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: '4', title: 'Blocked', icon: Slash, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Social Sidebar */}
      <aside className={`w-full md:w-96 flex flex-col gap-8 ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header & Controls */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-white tracking-tight">Signals</h1>
              <div className="flex gap-2">
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
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />}
           </div>
        </div>

        {/* Search Results Overlay / Section */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-3xl border-indigo-500/20 bg-indigo-950/20 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Search</span>
                <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {searchResults.length === 0 && !isSearching ? (
                  <p className="text-center py-4 text-xs text-slate-600 font-bold uppercase tracking-tight">No identities found</p>
                ) : (
                  searchResults.map((u) => (
                    <div 
                      key={u.id}
                      onClick={() => handleStartChat(u)}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer group"
                    >
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-10 h-10 rounded-xl bg-slate-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UID: {u.shortId}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u.id}`); }}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-all text-indigo-400 hover:text-white"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
           {conversations.length === 0 && (
             <div className="text-center py-12 space-y-4 opacity-30">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No active signals detected</p>
             </div>
           )}
           {conversations.map((conv) => (
             <motion.div 
               whileHover={{ x: 4 }}
               key={conv.id}
               onClick={() => setSelectedUser(conv)}
               className={`glass-card p-4 rounded-3xl border-white/5 flex items-center gap-4 cursor-pointer transition-all relative ${selectedUser?.id === conv.id ? 'bg-indigo-600/20 border-indigo-500/40 shadow-2xl shadow-indigo-600/10' : 'hover:bg-slate-900/60'} ${conv.unread > 0 ? 'border-l-4 border-l-indigo-500' : ''}`}
             >
                <div className="relative">
                   <img src={conv.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.id}`} alt={conv.name} className="w-14 h-14 rounded-2xl bg-slate-800 object-cover" />
                   <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 bg-emerald-500`} />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-black truncate text-white">{conv.name}</h3>
                      <span className="text-[10px] text-slate-600 font-bold">
                        {conv.time ? new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                   </div>
                   <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {conv.unread}
                  </div>
                )}
             </motion.div>
           ))}
        </div>
      </aside>

      {/* Chat Terminal */}
      <main className="flex-1 glass-card rounded-[3.5rem] border-white/5 bg-slate-900/20 backdrop-blur-3xl overflow-hidden flex flex-col relative">
         <AnimatePresence mode="wait">
           {selectedUser ? (
             <motion.div 
               key="chat-active"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex flex-col h-full"
             >
                {/* Chat Header */}
                <header className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedUser(null)}
                        className="lg:hidden w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400"
                      >
                         <ArrowLeft className="w-5 h-5" />
                      </button>
                      <img src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} className="w-12 h-12 rounded-xl bg-slate-800" />
                      <div>
                         <h2 className="text-xl font-black text-white tracking-tight">{selectedUser.name}</h2>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-400" onClick={() => navigate(`/profile/${selectedUser.id}`)}>View Profile</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secure</span>
                      </div>
                   </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                   {loading ? (
                     <div className="flex items-center justify-center h-full opacity-30 animate-pulse">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Logs...</p>
                     </div>
                   ) : (
                     messages.map((msg, idx) => (
                       <div 
                        key={msg.id || idx}
                         className={`flex ${user && msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                       >
                          <div className={`max-w-[70%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                            user && msg.senderId === user.id 
                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/20' 
                            : 'bg-slate-900 border border-white/5 text-slate-100 rounded-tl-sm'
                          }`}>
                             {msg.content}
                             <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${user && msg.senderId === user.id ? 'text-indigo-200' : 'text-slate-600'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                       </div>
                     ))
                   )}
                   <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-slate-950/20">
                   <div className="relative">
                      <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Transmit signal..."
                        className="w-full bg-slate-900 border border-white/5 rounded-3xl py-6 pl-8 pr-24 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                      />
                      <button 
                        type="submit"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                      >
                         <Send className="w-5 h-5" />
                      </button>
                   </div>
                </form>
             </motion.div>
           ) : (
             <motion.div 
               key="chat-idle"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center h-full space-y-6"
             >
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                
                <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-2xl shadow-indigo-600/10">
                   <MessageSquare className="w-10 h-10" />
                 </div>
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black text-white tracking-tight uppercase">Terminal Offline</h2>
                   <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                      Select a frequency from the sidebar to establish a secure neural handshake.
                   </p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-4">
                   <div className="px-4 py-1.5 bg-slate-900 rounded-full border border-white/5 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-emerald-100">Encryption Active</span>
                   </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Backdrop Decor */}
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      </main>
    </div>
  );
};
