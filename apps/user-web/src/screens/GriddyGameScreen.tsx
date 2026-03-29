import { useState } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  ChevronLeft, 
  HelpCircle, 
  Coins, 
  TrendingUp, 
  History, 
  AlertCircle,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AppLink = (Link as any);

export const GriddyGameScreen = () => {
  const { user, updateUser } = useStore();
  const [betAmount, setBetAmount] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultCell, setResultCell] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grid = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handlePlay = async () => {
    if (!user || user.coins < betAmount) {
      setError('Insufficient Coins. Please recharge!');
      return;
    }

    setError(null);
    setIsSpinning(true);
    setResultCell(null);
    setMultiplier(null);

    try {
      const { data } = await api.post('/luck/griddy/play', { betAmount });
      
      // Simulate "spinning" delay for UX
      setTimeout(() => {
        setIsSpinning(false);
        setResultCell(data.result);
        setMultiplier(data.multiplier);
        updateUser({ coins: data.newBalance });
      }, 1500);
    } catch (err: any) {
      setIsSpinning(false);
      setError(err.response?.data?.error || 'Game execution failure');
    }
  };

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
            <h1 className="text-4xl font-black tracking-tight text-white mb-1">Griddy Luck</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-indigo-500" />
              High Stakes Multiplier Game
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 px-6 py-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
            <Coins className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-black tabular-nums text-white">
              {user?.coins?.toLocaleString() || 0}
            </span>
          </div>
          <button className="premium-gradient text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-transform">
            Get Coins
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Game Board */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-3 gap-6">
            {grid.map((cell) => (
              <motion.div
                key={cell}
                initial={false}
                animate={{
                  scale: resultCell === cell ? 1.05 : 1,
                  backgroundColor: resultCell === cell 
                    ? (multiplier! > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                    : 'rgba(15, 23, 42, 0.4)',
                  borderColor: resultCell === cell
                    ? (multiplier! > 0 ? '#10b981' : '#ef4444')
                    : 'rgba(255, 255, 255, 0.05)'
                }}
                className={`
                  aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center relative overflow-hidden group/cell
                  ${!isSpinning && !resultCell ? 'hover:border-indigo-500/30' : ''}
                `}
              >
                {isSpinning ? (
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                    />
                    <HelpCircle className="w-8 h-8 text-indigo-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                ) : resultCell === cell ? (
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className={`text-6xl font-black ${multiplier! > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {multiplier}x
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Outcome Cell {cell}
                    </span>
                  </motion.div>
                ) : (
                  <HelpCircle className="w-16 h-16 text-slate-800 group-hover/cell:text-indigo-500/20 transition-colors duration-500" />
                )}
                
                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-1 h-1 rounded-full bg-white/5" />
                <div className="absolute bottom-4 right-4 text-[8px] font-black text-white/5 uppercase">Slot {cell}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            {/* Visual Flare */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[100px]" />
            
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">Set Your Stake</p>
                <div className="grid grid-cols-2 gap-3">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`
                        py-4 rounded-2xl font-black transition-all border-2
                        ${betAmount === amt 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                          : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}
                      `}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={isSpinning}
                onClick={handlePlay}
                className={`
                  w-full h-20 rounded-3xl font-black text-lg transition-all transform active:scale-95 shadow-2xl
                  ${isSpinning 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'premium-gradient text-white shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1'}
                `}
              >
                {isSpinning ? 'SPINNING ENGINE...' : 'INITIATE SPIN'}
              </button>

              <div className="pt-6 border-t border-white/5 space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Max Potential: 20.0x Return</span>
                </div>
                <p className="text-[9px] text-slate-600 font-bold px-4 leading-relaxed uppercase tracking-tighter">
                  Grid outcomes are generated via cryptographically secure RNG on Onchat Mainnet.
                </p>
              </div>
            </div>
          </div>

          {/* Mini Leaderboard Placeholder */}
          <div className="glass-card p-8 rounded-[2rem] border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Live Winners
              </h3>
              <History className="w-4 h-4 text-slate-700" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5">
                      {i}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">Player_{Math.floor(Math.random() * 9000) + 1000}</p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase">Won x5.0</p>
                    </div>
                  </div>
                  <span className="text-xs font-black tabular-nums text-slate-700">+500</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
