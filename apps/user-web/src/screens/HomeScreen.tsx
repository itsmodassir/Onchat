import { useEffect, useState } from 'react';
import { RoomCard } from '../components/RoomCard';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { 
  Flame, Clock, LayoutGrid, 
  Plus, Search, ArrowRight, Crown, 
  Zap
} from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const HomeScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hot');
  const [rooms, setRooms] = useState<any[]>([]);
  const [topCreators, setTopCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const roomEndpoint = activeTab === 'new' ? '/rooms?sort=new' : '/rooms';
      const [roomsRes, creatorsRes] = await Promise.all([
        api.get(roomEndpoint),
        api.get('/users/top-creators')
      ]);
      
      const transformedRooms = roomsRes.data.map((r: any) => ({
        id: r.id,
        name: r.title,
        host: { 
          name: r.host?.name || 'Unknown Host',
          avatar: r.host?.avatar,
          svip: r.host?.svipLevel,
          level: r.host?.level
        },
        userCount: r._count?.participants || 0,
        category: r.tags?.split(',')[0] || 'Social',
        thumbnail: r.image
      }));
      
      setRooms(transformedRooms);
      setTopCreators(creatorsRes.data);
    } catch (error) {
      console.error('Fetch dashboard failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  return (
    <div className="p-6 md:p-12 pb-24 space-y-16 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Premium Hero Section */}
      <section className="relative h-[450px] rounded-[3.5rem] overflow-hidden flex flex-col justify-center px-12 md:px-20 group shadow-2xl">
        <div className="absolute inset-0 bg-slate-950">
          <img 
            src="https://images.unsplash.com/photo-1614850523296-d8c1af03d400?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000" 
            alt="Hero BG"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-[0.2em] shadow-xl"
          >
            <Zap className="w-4 h-4 fill-indigo-400" />
            Neural Network v2.0 Live
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9] text-white"
          >
            THE FUTURE OF <br/>
            <span className="premium-gradient bg-clip-text text-transparent italic drop-shadow-sm font-serif">Deep Voice.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 font-medium max-w-xl leading-relaxed"
          >
            Establish your neural link. High-fidelity spatial audio, 
            encrypted identities, and global cluster synchronization.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-6 pt-4"
          >
             <button 
               onClick={() => setIsModalOpen(true)}
               className="px-10 h-16 rounded-[1.5rem] bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-4 shadow-2xl shadow-indigo-600/40 active:scale-95 border border-indigo-400/20"
             >
               <Plus className="w-5 h-5 stroke-[3]" />
               Open Frequency
             </button>
             <button className="px-10 h-16 rounded-[1.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-4 active:scale-95 group/btn">
               <Search className="w-5 h-5 group-hover/btn:text-indigo-400 transition-colors" />
               Explore Cluster
             </button>
          </motion.div>
        </div>

        {/* Hero Stats Floating Card */}
        <div className="absolute bottom-12 right-12 hidden xl:block">
           <div className="glass-card p-6 rounded-[2rem] bg-white/5 border-white/10 backdrop-blur-3xl grid grid-cols-2 gap-8 shadow-3xl">
              <div>
                 <p className="text-3xl font-black text-white">{rooms.length * 42}+</p>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Handshakes</p>
              </div>
              <div className="border-l border-white/5 pl-8">
                 <p className="text-3xl font-black text-indigo-400">99.9%</p>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Signal Integrity</p>
              </div>
           </div>
        </div>
      </section>

      {/* Top Creators Scroller */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Crown className="w-6 h-6 text-amber-500" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tight">Elite Transmitters</h3>
          </div>
          <button className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors group">
             View Protocol Members <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar">
          {topCreators.map((creator, i) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/profile/${creator.id}`)}
              className="flex flex-col items-center gap-4 min-w-[120px] group cursor-pointer"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] border-2 border-white/5 group-hover:border-indigo-500/50 transition-all p-1.5 bg-slate-900 group-hover:rotate-6">
                  <img 
                    src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} 
                    className="w-full h-full object-cover rounded-[1.5rem]" 
                    alt={creator.name} 
                  />
                </div>
                <div className="absolute -bottom-2 right-0 px-2 py-0.5 rounded-lg bg-indigo-600 text-[8px] font-black text-white border-2 border-slate-950">
                  LV.{creator.level}
                </div>
              </div>
              <span className="text-xs font-black text-slate-400 group-hover:text-white transition-colors truncate w-full text-center">{creator.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Discovery Hub */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-10 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
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
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" 
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-900 border border-white/5 rounded-2xl">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-slate-900" alt="user" />
               ))}
               <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-white">+82k</div>
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Transmitting Now</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[16/10] rounded-[2.5rem] bg-slate-900/50 animate-pulse border border-white/5" />
              ))}
            </motion.div>
          ) : rooms.length > 0 ? (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </motion.div>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center py-32 glass-card rounded-[3.5rem] border border-dashed border-white/10 bg-slate-900/20"
             >
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 border border-white/5">
                   <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Silence Detected</h3>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">No active signals found on this frequency.</p>
             </motion.div>
          )}
        </AnimatePresence>
      </section>

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
