import { useEffect, useState } from 'react';
import { RoomCard } from '../components/RoomCard';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { Flame, Sparkles, Clock, LayoutGrid, Plus, Search } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('hot');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'new' ? '/rooms?sort=new' : '/rooms';
      const { data } = await api.get(endpoint);
      
      // Transform backend data to match RoomCard interface
      const transformed = data.map((r: any) => ({
        id: r.id,
        name: r.title,
        host: { 
          name: r.host?.name || 'Unknown Host',
          avatar: r.host?.avatar
        },
        userCount: r._count?.participants || 0,
        category: r.tags?.split(',')[0] || 'Social',
        thumbnail: r.image
      }));
      
      setRooms(transformed);
    } catch (error) {
      console.error('Fetch rooms failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activeTab]);

  return (
    <div className="p-12 pb-24 space-y-16 animate-in fade-in duration-700">
      {/* Hero */}
      <section className="relative h-80 rounded-[3rem] overflow-hidden flex flex-col justify-center px-16 group">
        <div className="absolute inset-0 bg-slate-950">
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" 
            alt="Hero BG"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            Platform Spotlight
          </div>
          <h2 className="text-6xl font-black tracking-tighter mb-6 leading-[1.1]">
            Experience the <br/>
            <span className="premium-gradient bg-clip-text text-transparent italic">Future of Voice.</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium max-w-lg mb-8">
            Join thousands of communities in real-time. High fidelity audio, 
            virtual identities, and decentralized interaction.
          </p>
          
          <div className="flex gap-4">
             <button 
               onClick={() => setIsModalOpen(true)}
               className="px-8 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
             >
               <Plus className="w-4 h-4" />
               Host Signal
             </button>
             <button className="px-8 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
               <Search className="w-4 h-4" />
               Explore Cluster
             </button>
          </div>
        </div>
      </section>

      {/* Discovery Hub */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-12 border-b border-white/5 pb-2">
            {[
              { id: 'hot', label: 'Trending Feed', icon: Flame },
              { id: 'new', label: 'Recent Waves', icon: Clock },
              { id: 'all', label: 'Live Cluster', icon: LayoutGrid }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 pb-4 transition-all relative ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-500' : ''}`} />
                <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Channels:</span>
             <span className="text-[10px] font-black text-indigo-500 px-3 py-1 bg-indigo-500/10 rounded-lg tabular-nums">
               {rooms.length > 0 ? (rooms.length * 1.5).toFixed(0) : '0'}
             </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/3] rounded-[2rem] bg-slate-900 animate-pulse border border-white/5" />
              ))}
            </motion.div>
          ) : rooms.length > 0 ? (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </motion.div>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center py-40 bg-white/2 rounded-[3.5rem] border border-dashed border-white/10"
             >
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
                   <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Silence Detected</h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-tighter">No signals found on this frequency yet.</p>
             </motion.div>
          )}
        </AnimatePresence>
      </section>

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
