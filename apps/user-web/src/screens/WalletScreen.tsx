import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { 
  ChevronLeft, FileText, MessageCircle, ChevronRight, 
  Coins, Gem, Zap, ShieldCheck, ArrowUpRight, 
  CreditCard, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const WalletScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Wallet'); 
  const [wallet, setWallet] = useState({ coins: 0, diamonds: 0, crystals: 0 });

  const fetchWallet = useCallback(async () => {
    try {
      const response = await api.get('/shop/wallet');
      setWallet(response.data);
    } catch (error) {
      console.error('Fetch wallet error:', error);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleRecharge = async (amount: number) => {
    // Note: Razorpay Web integration would normally go here. 
    // For now, mirroring the logic with a secure placeholder or directing to support.
    alert(`Recharge protocol for ${amount} coins initiated. Terminal redirection to secure payment gateway is pending API configuration.`);
  };

  const rechargeOptions = [
    { coins: 900, bonus: 160, price: '$0.99', popular: false },
    { coins: 4500, bonus: 910, price: '$4.99', popular: false },
    { coins: 9100, bonus: 1910, price: '$9.99', popular: true },
    { coins: 18200, bonus: 4000, price: '$19.99', popular: false },
    { coins: 45400, bonus: 10500, price: '$49.99', popular: false },
    { coins: 90900, bonus: 21500, price: '$99.99', popular: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-4xl font-black tracking-tight text-white mb-1">Financial Vault</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Secure Asset Management Terminal
               </p>
            </div>
         </div>

         <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            {['Wallet', 'Diamonds', 'Crystals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
         </div>

         <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <History className="w-5 h-5" />
         </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Wallet' && (
          <motion.div 
            key="wallet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Balance Card */}
            <div className="glass-card p-12 rounded-[3.5rem] bg-indigo-600 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[60%] h-full bg-white/10 blur-[120px] pointer-events-none" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/20 mb-4">
                     <Coins className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Current Liquid Retain</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">
                     {wallet.coins.toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-black/20 rounded-full border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest text-emerald-100">Synchronized with Mainnet</span>
                  </div>
               </div>
            </div>

            {/* Recharge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {rechargeOptions.map((item, idx) => (
                 <div 
                   key={idx}
                   onClick={() => handleRecharge(item.coins)}
                   className={`glass-card p-10 rounded-[2.5rem] border-white/5 flex flex-col items-center gap-6 group cursor-pointer hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all relative overflow-hidden ${item.popular ? 'ring-2 ring-indigo-500' : ''}`}
                 >
                    {item.popular && (
                      <div className="absolute top-6 right-6 px-3 py-1 bg-indigo-500 text-white text-[8px] font-black uppercase rounded-full shadow-lg">Popular Choice</div>
                    )}
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
                       <Zap className="w-8 h-8 fill-current" />
                    </div>
                    <div className="text-center">
                       <h3 className="text-2xl font-black text-white tabular-nums tracking-tight">{item.coins.toLocaleString()} <span className="text-xs text-slate-500">Coins</span></h3>
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">+{item.bonus} Bonus Included</p>
                    </div>
                    <button className="w-full py-4 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95">
                       {item.price} Acquire
                    </button>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'Diamonds' && (
          <motion.div 
            key="diamonds"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="glass-card p-12 rounded-[3.5rem] bg-emerald-600 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[60%] h-full bg-white/10 blur-[120px] pointer-events-none" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/20 mb-4">
                     <Gem className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Neural Diamond Reserves</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">
                     {wallet.diamonds.toFixed(1)}
                  </h2>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass-card p-12 rounded-[3rem] border-white/5 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                     <ArrowUpRight className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Protocol: Receive & Earn</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Diamonds are synthesized when you receive gifts in voice portals or clusters. Higher engagement velocity accelerates core generation.
                  </p>
               </div>
               <div className="glass-card p-12 rounded-[3rem] border-white/5 flex flex-col justify-center gap-6">
                  <button className="w-full py-6 rounded-[2rem] border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-[0.98]">
                     Initiate Liquidation Exchange
                  </button>
                  <p className="text-center text-[10px] font-black text-slate-700 uppercase tracking-widest">Rate: 100 Diamonds = 100 Coins (Direct Peer Sync)</p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Crystals' && (
          <motion.div 
            key="crystals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="glass-card p-12 rounded-[3.5rem] bg-slate-900 border-indigo-500/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[60%] h-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center backdrop-blur-xl border border-indigo-500/20 mb-4">
                     <ShieldCheck className="w-10 h-10 text-indigo-400" />
                  </div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Elite Crystal Integrity</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">
                     {wallet.crystals}
                  </h2>
               </div>
            </div>

            <div className="glass-card p-12 rounded-[3rem] border-white/5 flex items-center justify-between group cursor-pointer hover:border-indigo-500/20 transition-all">
               <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400">
                     <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-white uppercase tracking-tight">Expand Crystal Capacity</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Protocol available for LV.50+ Identities</p>
                  </div>
               </div>
               <ChevronRight className="w-8 h-8 text-slate-800 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-12 text-center">
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-4">Secure Support Handshake</p>
         <div className="flex items-center justify-center gap-8">
            <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
               <MessageCircle className="w-4 h-4" />
               Signal Center
            </button>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
               <FileText className="w-4 h-4" />
               Audit Logs
            </button>
         </div>
      </div>
    </div>
  );
};
