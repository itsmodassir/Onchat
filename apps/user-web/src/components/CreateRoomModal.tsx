import { useState } from 'react';
import { X, Sparkles, Shield, Lock, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal = ({ isOpen, onClose }: CreateRoomModalProps) => {
  const [title, setTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', { 
        title, 
        requiresPermission: isPrivate 
      });
      onClose();
      navigate(`/room/${data.id}`);
    } catch (error) {
      console.error('Create room failed', error);
    } finally {
      setLoading(false);
    }
  };

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
            className="relative w-full max-w-xl bg-[#020617] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="p-12">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">Initialize Channel</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Voice Link v1.0</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Channel Designation</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter room frequency title..."
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-6 px-8 text-lg text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all ${
                      !isPrivate ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Open Link</p>
                      <p className="text-[9px] font-bold opacity-50">Public Discovery</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all ${
                      isPrivate ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Secure Link</p>
                      <p className="text-[9px] font-bold opacity-50">Invite Only</p>
                    </div>
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 flex items-center gap-4">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                    Your identity will be broadcasted as the Origin Point (Host) of this frequency.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full premium-gradient text-white font-black py-6 rounded-[2rem] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                >
                  {loading ? 'CALIBRATING FREQUENCY...' : 'ESTABLISH NEURAL LINK'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
