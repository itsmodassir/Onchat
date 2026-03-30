import { useState, useEffect } from 'react';
import { X, UserPlus, Search, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const InviteFriendModal = ({ isOpen, onClose, roomId }: InviteFriendModalProps) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/social/friends');
      setFriends(data);
    } catch (error) {
      console.error('Fetch friends failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (friendId: string) => {
    setInviting(friendId);
    try {
      // In a real app, this would emit a socket event or call an invite API
      await api.post(`/rooms/${roomId}/invite`, { userId: friendId });
      // Simulate success for feedback
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Invite failed', error);
    } finally {
      setInviting(null);
    }
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.shortId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#020617] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[600px]"
          >
            <div className="p-8 border-b border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white uppercase">Broadcast Invite</h2>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Neural Mesh Selection</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search identifiers..."
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-black text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-none">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scanning Signal Grids...</p>
                </div>
              ) : filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 group hover:border-indigo-500/20 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 overflow-hidden">
                          <img src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{friend.name}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">UID: {friend.shortId}</p>
                       </div>
                    </div>
                    <button 
                      disabled={inviting === friend.id}
                      onClick={() => handleInvite(friend.id)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                      {inviting === friend.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Transmit
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No matching frequencies found.</p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-slate-950/30">
               <p className="text-[9px] text-slate-500 font-bold leading-relaxed text-center uppercase tracking-tighter">
                  Invitations will be delivered via high-velocity neural notification to the target's transmission hub.
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
