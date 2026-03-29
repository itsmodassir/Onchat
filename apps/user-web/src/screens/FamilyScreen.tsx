import { useState, useEffect } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  ChevronLeft, 
  Search, 
  Calendar, 
  Check, 
  Gift, 
  Users, 
  Trophy,
  Plus,
  Shield,
  Star,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLink = (Link as any);

export const FamilyScreen = () => {
  const { user } = useStore();
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.familyId) {
      fetchFamily(user.familyId);
    } else {
      setLoading(false);
    }
  }, [user?.familyId]);

  const fetchFamily = async (id: string) => {
    try {
      const response = await api.get(`/shop/family/${id}`);
      setFamily(response.data);
    } catch (error) {
      console.error('Fetch family error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
        />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-6">
          <AppLink 
            to="/" 
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </AppLink>
          <h1 className="text-4xl font-black tracking-tight text-white">Family Registry</h1>
        </div>

        <div className="glass-card rounded-[3rem] p-20 flex flex-col items-center text-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group">
             <Users className="w-16 h-16 text-indigo-500 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-black text-white">No Family Found</h2>
            <p className="text-slate-500 font-bold leading-relaxed uppercase tracking-tighter text-sm">
              Unity is power. Join an existing family or establish your own dynasty to unlock exclusive rewards and voice rooms.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-4">
            <button className="flex-1 premium-gradient text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
              <Plus className="w-4 h-4" />
              Build Dynasty
            </button>
            <button className="flex-1 bg-slate-900 text-slate-400 font-black py-5 rounded-2xl border border-white/5 hover:bg-slate-800 transition-colors uppercase tracking-widest text-[11px]">
              Find Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Immersive Header */}
      <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl group">
        <img 
          src={family.image || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200'} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        
        <AppLink 
          to="/" 
          className="absolute top-8 left-8 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </AppLink>

        <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between z-10">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-2xl bg-slate-900">
               <img src={family.image} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black text-white tracking-tighter">{family.name}</h1>
                  <div className="px-4 py-1.5 rounded-full bg-amber-500 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                    Elite Tier III
                  </div>
               </div>
               <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                 <Shield className="w-4 h-4 text-indigo-400" />
                 ID: {family.id.slice(0, 8).toUpperCase()} • Founded {new Date(family.createdAt).getFullYear()}
               </p>
            </div>
          </div>
          
          <div className="hidden lg:flex gap-4">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                Family Hall
              </button>
              <button className="px-8 py-4 premium-gradient rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                Contribute
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6">
             <div className="glass-card p-8 rounded-[2rem] space-y-2 border-white/5">
                <Users className="w-6 h-6 text-indigo-500" />
                <p className="text-sm font-black text-white">{family.members.length} / 450</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Members</p>
             </div>
             <div className="glass-card p-8 rounded-[2rem] space-y-2 border-white/5">
                <Trophy className="w-6 h-6 text-amber-500" />
                <p className="text-sm font-black text-white">Top 2</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Ranking</p>
             </div>
             <div className="glass-card p-8 rounded-[2rem] space-y-2 border-white/5">
                <Activity className="w-6 h-6 text-emerald-500" />
                <p className="text-sm font-black text-white">98%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Activity Flow</p>
             </div>
          </div>

          {/* Level Progress */}
          <div className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]" />
             <div className="flex items-center justify-between relative z-10">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Star className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
                  Growth Trajectory
                </h3>
                <span className="text-xs font-black text-indigo-400 tabular-nums">52% Progress to Lv.4</span>
             </div>
             <div className="h-4 bg-slate-950 rounded-full border border-white/5 relative z-10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '52%' }}
                  className="h-full premium-gradient shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                />
             </div>
             <div className="flex items-center justify-between relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{family.exp.toLocaleString()} EXP EARNED</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">6,630,000 EXP CAP</p>
             </div>
          </div>

          {/* Top Contributors */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-3 px-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Family Stars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1, 2, 3].map((pos) => (
                 <div key={pos} className="glass-card p-6 rounded-[2rem] border-white/5 flex flex-col items-center gap-4 group hover:border-indigo-500/30 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${pos === 1 ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-white/5'}`}>
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${pos}`} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center text-white shadow-xl ${pos === 1 ? 'bg-amber-500' : 'bg-slate-800'}`}>
                        {pos}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-white uppercase group-hover:text-indigo-400 transition-colors">User_{Math.floor(Math.random() * 9000) + 1000}</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Contributor Elite</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                   <Calendar className="w-5 h-5 text-indigo-500" />
                   Daily Check-In
                </h3>
                <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Rewards</button>
             </div>
             
             <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[9, 10, 11, 12, 13, 14].map((day) => (
                  <div key={day} className="flex flex-col items-center gap-3 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${day < 14 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-700'}`}>
                       {day < 14 ? <Check size={18} /> : <Gift size={18} />}
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase">Day {day}</span>
                  </div>
                ))}
             </div>

             <button className="w-full h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-sm uppercase tracking-[0.2em] cursor-not-allowed">
               Checked In for Today
             </button>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Family Council</h3>
             <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xl border border-white/5">
                   <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">Dynasty Leader</p>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Founder & CEO</p>
                </div>
                <div className="ml-auto w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
             </div>
             
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed px-2">
               Access the council room to engage in family governance and resource allocation.
             </p>
             
             <button className="w-full py-4 text-xs font-black text-slate-500 uppercase tracking-widest border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
               Manage Dynasty
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
