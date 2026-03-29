import { useState } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  ChevronLeft, Coins, Sparkles, RefreshCw, 
  Trophy, Star, Zap, Gift, Target,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export const LuckyWheelScreen = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStake, setSelectedStake] = useState(100);
  const [result, setResult] = useState<any>(null);
  
  const controls = useAnimation();

  const stakes = [10, 100, 1000];

  const prizes = [
    { name: '10 Coins', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: '50 Coins', icon: Coins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: '100 Coins', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-600/10' },
    { name: '500 Coins', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Rare Headwear', icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Try Again', icon: RotateCcw, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  ];

  const handleSpin = async () => {
    if (isSpinning) return;
    try {
      const response = await api.post('/shop/spin', { stake: selectedStake });
      const win = response.data.prize;
      setIsSpinning(true);
      setResult(null);

      // Animation: Total rotation = multiples of 360 + extra to land on sector
      // Since we have 6 sectors (60 deg each)
      const randomRotation = 1800 + Math.random() * 360; 
      
      await controls.start({
        rotate: randomRotation,
        transition: { duration: 4, ease: [0.45, 0.05, 0.55, 0.95] }
      });

      setIsSpinning(false);
      setResult(win);
      
      // Update local wallet if coins won
      if (win.type === 'COIN') {
        const { data: updatedUser } = await api.get('/auth/me');
        setUser(updatedUser);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Insufficient coins for this stake frequency.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-4xl font-black tracking-tight text-white mb-1">Lucky Resonance</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Target className="w-3 h-3 text-rose-500" />
                  Stochastic Asset Distribution
               </p>
            </div>
         </div>

         <div className="px-8 py-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-4">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-black text-white tabular-nums">{user?.coins || 0}</span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 items-center justify-center pt-8">
         {/* Wheel Mechanism */}
         <div className="relative w-[400px] h-[400px] md:w-[600px] md:h-[600px]">
            {/* Pointer */}
            <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-50">
               <div className="w-8 h-12 bg-rose-500 clip-path-polygon-[50%_100%,0%_0%,100%_0%] shadow-2xl shadow-rose-500/50" />
            </div>

            {/* The Wheel */}
            <motion.div 
               animate={controls}
               className="w-full h-full rounded-full border-[12px] border-slate-800 bg-[#020617] shadow-[0_0_100px_rgba(79,70,229,0.1)] relative overflow-hidden"
            >
               {prizes.map((prize, i) => (
                 <div 
                   key={i}
                   className="absolute top-0 left-1/2 w-full h-1/2 origin-bottom -translate-x-1/2 flex flex-col items-center pt-12 border-l border-white/5"
                   style={{ transform: `translateX(-50%) rotate(${i * 60}deg)` }}
                 >
                    <div className={`p-4 rounded-2xl ${prize.bg} ${prize.color} border border-white/5 mb-4`}>
                       <prize.icon className="w-8 h-8" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${prize.color} writing-mode-vertical`}>{prize.name}</span>
                 </div>
               ))}
               
               {/* Center Hub */}
               <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-slate-800 border-[8px] border-[#020617] shadow-2xl z-20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_20px_rgba(99,102,241,1)]" />
               </div>
            </motion.div>

            {/* Inner Ring Decor */}
            <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-white/10 m-12 pointer-events-none" />
         </div>

         {/* Configuration & Action */}
         <div className="w-full max-w-md space-y-12">
            <div className="space-y-4">
               <h2 className="text-3xl font-black text-white tracking-tight">Select Stake Frequency</h2>
               <p className="text-slate-500 font-medium">Higher frequencies resonate with premium asset pools. Calibrate your luck signal.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
               {stakes.map((s) => (
                 <button
                   key={s}
                   onClick={() => setSelectedStake(s)}
                   className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-2 group ${
                     selectedStake === s 
                       ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/20' 
                       : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'
                   }`}
                 >
                    <Coins className={`w-6 h-6 ${selectedStake === s ? 'text-white' : 'text-amber-500'}`} />
                    <span className="text-lg font-black tracking-tighter tabular-nums">{s}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Frequency</span>
                 </button>
               ))}
            </div>

            <div className="space-y-6">
               <button 
                 onClick={handleSpin}
                 disabled={isSpinning}
                 className="w-full h-24 rounded-[2.5rem] premium-gradient text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-4"
               >
                  {isSpinning ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      Synchronizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-current" />
                      Initiate Spin Sequence
                    </>
                  )}
               </button>

               <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center gap-4 group cursor-help">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors">
                     <Trophy className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                     Probabilities are cryptographically generated. Guaranteed distribution within 100 cycles.
                  </p>
               </div>
            </div>

            {/* Result Overlay */}
            <AnimatePresence>
               {result && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="glass-card p-8 rounded-3xl border-emerald-500/20 bg-emerald-500/5 flex items-center gap-6"
                 >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                       <Gift className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-white uppercase tracking-tight">Signal Intercepted!</h4>
                       <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">You won: {result.name}</p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};
