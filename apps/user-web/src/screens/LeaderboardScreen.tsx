import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  ChevronLeft, 
  Crown, 
  TrendingUp, 
  Medal,
  Users,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLink = (Link as any);

const TABS = ['COINS', 'LEVEL', 'ROOMS_HOSTED'] as const;
const TAB_LABELS = { 
  COINS: { label: 'Treasure', icon: '💰', color: '#fbbf24' }, 
  LEVEL: { label: 'Elite', icon: '⬆️', color: '#818cf8' }, 
  ROOMS_HOSTED: { label: 'Maestros', icon: '🎙️', color: '#22d3ee' } 
};

export const LeaderboardScreen = () => {
  const { user: me } = useStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('COINS');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get(`/luck/leaderboard/${activeTab}`);
      setData(res.data);
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <AppLink 
            to="/" 
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </AppLink>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-1">Hall of Fame</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Users className="w-3 h-3 text-indigo-500" />
              Top 100 Global Contenders
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-white/5 backdrop-blur-xl">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                ${activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              {TAB_LABELS[tab].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
          />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Podium Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto pt-10">
            {/* Rank 2 */}
            {top3[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-700/50 group-hover:border-slate-400 transition-colors shadow-2xl relative z-10">
                    <img 
                      src={top3[1].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].id}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-6 -right-2 z-20 text-3xl drop-shadow-lg">🥈</div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-white">{top3[1].name}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Lv.{top3[1].level}</p>
                </div>
                <div className="px-6 py-2 rounded-xl bg-slate-400/10 border border-slate-400/20 text-slate-400 font-black tabular-nums text-sm">
                  {top3[1].value?.toLocaleString()}
                </div>
              </motion.div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 group -translate-y-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                  >
                    <Crown className="w-10 h-10 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] fill-amber-500/20" />
                  </motion.div>
                  <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-amber-500 group-hover:border-amber-400 transition-colors shadow-[0_0_50px_rgba(245,158,11,0.2)] relative z-10">
                    <img 
                      src={top3[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].id}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-6 -right-4 z-20 text-4xl drop-shadow-xl animate-bounce">🥇</div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-white">{top3[0].name}</p>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Global Master • Lv.{top3[0].level}</p>
                </div>
                <div className="px-8 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black tabular-nums text-lg shadow-lg">
                   {top3[0].value?.toLocaleString()}
                </div>
              </motion.div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-[1.75rem] overflow-hidden border-4 border-amber-800/50 group-hover:border-amber-700 transition-colors shadow-2xl relative z-10">
                    <img 
                      src={top3[2].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].id}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-4 -right-2 z-20 text-2xl drop-shadow-lg">🥉</div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-white">{top3[2].name}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Lv.{top3[2].level}</p>
                </div>
                <div className="px-6 py-2 rounded-xl bg-amber-800/10 border border-amber-800/20 text-amber-700 font-black tabular-nums text-sm">
                  {top3[2].value?.toLocaleString()}
                </div>
              </motion.div>
            )}
          </div>

          {/* Table List Area */}
          <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Medal className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Global Rankings</span>
              </div>
              <div className="relative">
                 <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                  type="text" 
                  placeholder="Filter users..." 
                  className="bg-slate-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 transition-colors w-48"
                 />
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {rest.map((item, idx) => {
                const isMe = item.id === me?.id;
                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    key={item.id} 
                    className={`
                      flex items-center gap-6 p-6 hover:bg-white/5 transition-colors group cursor-pointer
                      ${isMe ? 'bg-indigo-600/5' : ''}
                    `}
                  >
                    <div className="w-12 text-center text-sm font-black text-slate-600 group-hover:text-indigo-500 transition-colors">
                      #{idx + 4}
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 bg-slate-900 flex-shrink-0">
                      <img 
                        src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${isMe ? 'text-indigo-400' : 'text-slate-200'}`}>
                          {item.name}
                        </p>
                        {isMe && <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded tracking-tighter uppercase">You</span>}
                      </div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Rank Contender</p>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-0.5">Experience</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-black text-slate-400">Lv.{item.level}</span>
                          </div>
                       </div>
                       
                       <div className="text-right min-w-[80px]">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-0.5">Asset Value</p>
                          <p className={`text-sm font-black tabular-nums transition-colors ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                            {item.value?.toLocaleString()}
                          </p>
                       </div>

                       <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-8 border-t border-white/5 text-center">
               <button className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors">
                  Load Full Report
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
