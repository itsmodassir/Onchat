import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  Crown, Gem, Coins, Heart, 
  ShoppingBag, Briefcase, Flame,
  Settings, LogOut, Trophy, 
  ShieldCheck, Camera, Share2, Wallet,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLink = Link as any;

export const ProfileScreen = () => {
  const { user, logout, setUser } = useStore();
  const [cpStatus, setCpStatus] = useState<any>(null);
  const [agencyStats, setAgencyStats] = useState<any>(null);

  const fetchLiveProfile = useCallback(async () => {
    try {
      const [userRes, cpRes, agencyRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/cp/status'),
        api.get('/agency/stats')
      ]);
      setUser(userRes.data);
      setCpStatus(cpRes.data);
      setAgencyStats(agencyRes.data);
    } catch (error) {
      console.error('Failed to sync live profile:', error);
    }
  }, [setUser]);

  useEffect(() => {
    fetchLiveProfile();
  }, [fetchLiveProfile]);

  const statsList = [
    { title: 'Followers', count: user?._count?.followers ?? 0 },
    { title: 'Level', count: user?.level ?? 1 },
    { title: 'Following', count: user?._count?.following ?? 0 },
    { title: 'Rooms', count: user?._count?.rooms ?? 0 },
  ];

  const menuItems = [
    { id: '1', title: 'Daily Reward', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', path: '/daily-reward' },
    { id: '2', title: 'Leaderboard', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/leaderboard' },
    { id: '3', title: 'Vault Access', icon: Wallet, color: 'text-indigo-500', bg: 'bg-indigo-500/10', path: '/wallet' },
    { id: '4', title: 'Partner Zone', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', extra: cpStatus ? `Lv. ${cpStatus.level}` : 'Connect' },
    { id: '5', title: 'Outfits', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/store' },
    { id: '6', title: 'Creator Studio', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-600/10', extra: agencyStats?.name || 'Apply', path: '/creator' },
    { id: '7', title: 'Griddy Luck', icon: Trophy, color: 'text-cyan-500', bg: 'bg-cyan-500/10', path: '/griddy' },
    { id: '8', title: 'Settings', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-500/10', path: '/settings' },
  ];

  const handleUpdateAvatar = async () => {
    const url = prompt('Enter new avatar image URL:', user?.avatar || '');
    if (!url) return;
    try {
      const { data } = await api.patch('/auth/profile', { avatar: url });
      setUser(data);
    } catch (error) {
      alert('Failed to update neural avatar correlation.');
    }
  };

  const handleUpdateName = async () => {
    const newName = prompt('Enter new identifier alias:', user?.name || '');
    if (!newName) return;
    try {
      const { data } = await api.patch('/auth/profile', { name: newName });
      setUser(data);
    } catch (error) {
      alert('Failed to update identifier alias.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Identity Card */}
      <section className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-600/5 blur-[100px] pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 rounded-[3rem] border-4 border-indigo-500/30 overflow-hidden shadow-2xl relative bg-slate-900"
            >
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                alt={user?.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={handleUpdateAvatar}
                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm"
              >
                <Camera className="w-8 h-8" />
              </button>
            </motion.div>
            <div className="absolute -bottom-4 right-4 w-12 h-12 rounded-2xl bg-indigo-600 border-4 border-[#020617] flex items-center justify-center shadow-xl">
               <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <h2 onClick={handleUpdateName} className="text-5xl font-black tracking-tight text-white cursor-pointer hover:text-indigo-400 transition-colors">
                    {user?.name || 'Unknown User'}
                  </h2>
                  {user?.isReseller && (
                    <span className="px-4 py-1.5 bg-amber-500 text-[#020617] text-[10px] font-black uppercase rounded-full shadow-lg shadow-amber-500/20">Authorized Reseller</span>
                  )}
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Identifier UID: {user?.shortId || user?.id?.substring(0, 8)}</p>
            </div>

            <p className="text-slate-400 font-medium max-w-lg leading-relaxed">{user?.bio || 'No status message broadcasted.'}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-12 pt-4">
               {statsList.map((stat, i) => (
                 <div key={i} className="text-center md:text-left">
                    <p className="text-2xl font-black text-white tabular-nums">{stat.count}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.title}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <button onClick={logout} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5">
                <LogOut className="w-6 h-6" />
             </button>
             <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">
                <Share2 className="w-6 h-6" />
             </button>
          </div>
        </div>
      </section>

      {/* Assets Bar */}
      <section className="flex flex-col md:flex-row gap-8">
         <div className="flex-1 glass-card p-10 rounded-[2.5rem] border-white/5 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Coins className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-2xl font-black text-white tabular-nums">{user?.coins || 0}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Coins</p>
               </div>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-800 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
         </div>

         <div className="flex-1 glass-card p-10 rounded-[2.5rem] border-white/5 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Gem className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-2xl font-black text-white tabular-nums">{Number(user?.diamonds || 0).toFixed(1)}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Diamonds</p>
               </div>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-800 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
         </div>
      </section>

      {/* Menu Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {menuItems.map((item) => (
           <AppLink 
             key={item.id} 
             to={item.path || '#'}
             className="glass-card p-8 rounded-[2rem] border-white/5 hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all group"
           >
              <div className="flex items-center justify-between mb-6">
                 <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} border border-white/5`}>
                    <item.icon className="w-6 h-6" />
                 </div>
                 {item.extra && <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.extra}</span>}
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.title}</h3>
           </AppLink>
         ))}
      </section>

      {/* Identity Levels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-card p-10 rounded-[2.5rem] bg-indigo-950/20 border-indigo-500/10 flex items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/10 border border-amber-500/20">
                  <Crown className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-white">Aristocracy Protocol</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Level: {user?.aristocracyLevel || 0}</p>
               </div>
            </div>
            <AppLink to="/store" className="relative z-10 px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">Establish Rank</AppLink>
         </div>

         <div className="glass-card p-10 rounded-[2.5rem] bg-emerald-950/20 border-emerald-500/10 flex items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-emerald-600/5 blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
                  <Gem className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-white">SVIP Resonance</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resonance Tier: {user?.svipLevel || 0}</p>
               </div>
            </div>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">Stable Signal</span>
         </div>
      </section>
    </div>
  );
};
