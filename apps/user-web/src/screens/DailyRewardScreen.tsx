import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Gift, 
  Flame, 
  Sparkles, 
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const REWARD_SCHEDULE = [
  { day: 1, coins: 50, diamonds: 0, icon: '🪙' },
  { day: 2, coins: 100, diamonds: 0, icon: '🪙' },
  { day: 3, coins: 150, diamonds: 1, icon: '💎' },
  { day: 4, coins: 200, diamonds: 0, icon: '🪙' },
  { day: 5, coins: 250, diamonds: 2, icon: '💎' },
  { day: 6, coins: 300, diamonds: 0, icon: '🪙' },
  { day: 7, coins: 500, diamonds: 5, icon: '🎁' },
];

export const DailyRewardScreen = () => {
  const { user, updateUser } = useStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/luck/daily-reward/status');
      setStatus(res.data);
    } catch (e) {
      console.error('Daily reward status error:', e);
      setError('Failed to load rewards status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const claimReward = async () => {
    if (claiming || status?.claimed) return;
    setClaiming(true);
    setError(null);
    try {
      const res = await api.post('/luck/daily-reward/claim');
      const { reward, streak } = res.data;
      setStatus((prev: any) => ({ ...prev, claimed: true, streak }));
      
      // Update local store balance
      updateUser({ 
        coins: (user?.coins || 0) + reward.coins,
        diamonds: (user?.diamonds || 0) + reward.diamonds 
      });

    } catch (err: any) {
      setError(err.response?.data?.error || 'Already claimed today!');
    } finally {
      setClaiming(false);
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

  const streak = status?.streak ?? 0;
  const currentDayIndex = streak % 7;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link 
          to="/" 
          className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-1">Daily Rewards</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 text-indigo-400">
            <Gift className="w-3 h-3" />
            Consistency Pays Off
          </p>
        </div>
      </div>

      {/* Streak Banner */}
      <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-colors" />
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black text-white">{streak} Day Streak</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              {streak >= 7 ? 'Maximum Streak Achievement!' : `${7 - (streak % 7)} days until next major bonus`}
            </p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center min-w-[100px]">
                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Total Coins</p>
                <p className="text-lg font-black text-amber-500 tabular-nums">{user?.coins?.toLocaleString()}</p>
             </div>
             <div className="px-6 py-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center min-w-[100px]">
                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Total Gems</p>
                <p className="text-lg font-black text-indigo-500 tabular-nums">{user?.diamonds?.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Reward Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {REWARD_SCHEDULE.map((item, idx) => {
          const isPassed = idx < currentDayIndex;
          const isCurrent = idx === currentDayIndex && !status?.claimed;
          const isActuallyClaimed = idx < currentDayIndex || (idx === currentDayIndex && status?.claimed);

          return (
            <motion.div
              key={item.day}
              whileHover={isCurrent ? { scale: 1.05, y: -5 } : {}}
              className={`
                p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 relative transition-all duration-500
                ${isCurrent ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-600/20' : 'bg-slate-900/50 border-white/5'}
                ${isPassed ? 'opacity-60 grayscale-[0.5]' : ''}
              `}
            >
              <div className="text-4xl">{item.icon}</div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day {item.day}</p>
                <p className="text-sm font-black text-white">{item.coins}🪙</p>
                {item.diamonds > 0 && (
                  <p className="text-[10px] font-black text-indigo-400">+{item.diamonds}💎</p>
                )}
              </div>

              {isActuallyClaimed && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}

              {isCurrent && (
                <div className="absolute -bottom-2 px-3 py-1 bg-indigo-500 rounded-lg text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                  Available
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Claim Button Area */}
      <div className="max-w-xl mx-auto space-y-6 pt-6 text-center">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          disabled={status?.claimed || claiming}
          onClick={claimReward}
          className={`
            w-full h-20 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all transform active:scale-95 shadow-2xl
            ${status?.claimed 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' 
              : 'premium-gradient text-white hover:shadow-indigo-600/30 hover:-translate-y-1'}
          `}
        >
          {claiming ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
            />
          ) : status?.claimed ? (
            <>
              <Clock className="w-6 h-6 opacity-40" />
              <span>STREAK ACTIVE • RETURN TOMORROW</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>CLAIM DAY {currentDayIndex + 1} REWARD</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
          Maintain your login streak to unlock massive multiplier bonuses on Day 7.<br/>
          Missed days will reset your progress to Day 1.
        </p>
      </div>

      {/* Recent Activity Mini-List */}
      <div className="glass-card p-10 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center gap-6 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
         <div className="flex -space-x-4 mb-2">
            {[1,2,3,4,5].map(i => (
              <img 
                key={i}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                className="w-12 h-12 rounded-2xl border-4 border-[#020617] bg-slate-800"
              />
            ))}
         </div>
         <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Join 14,203 players claiming rewards today</p>
      </div>
    </div>
  );
};
