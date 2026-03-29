import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Send, History, Coins, User as UserIcon, 
  ShieldCheck, AlertCircle, CheckCircle2,
  TrendingUp, Wallet
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CoinSellerPanel = () => {
  const navigate = useNavigate();
  const [targetShortId, setTargetShortId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/reseller/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch reseller stats', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetShortId || !amount) {
      setError('Target UID and Transfer Volume are explicitly required.');
      return;
    }

    if (!window.confirm(`Establish secure transfer of ${amount} coins to ID:${targetShortId}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/reseller/transfer', {
        targetShortId,
        amount: parseInt(amount)
      });
      setSuccess('Transaction materialized. Assets transmitted successfully.');
      setTargetShortId('');
      setAmount('');
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terminal rejection. Balance or Target ID mismatch.');
    } finally {
      setLoading(false);
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
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-4xl font-black tracking-tight text-white mb-1 uppercase tracking-tighter">Reseller Terminal</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Secure Coin Distribution Protocol
               </p>
            </div>
         </div>

         <div className="flex items-center gap-4 px-6 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Reseller Status: Active</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Main Controls */}
         <div className="lg:col-span-2 space-y-12">
            {/* Balance Card */}
            <section className="glass-card p-12 rounded-[3.5rem] bg-slate-900/40 relative overflow-hidden group border border-white/5">
               <div className="absolute top-0 right-0 w-[40%] h-full bg-amber-500/5 blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Liquid Inventory</p>
                        <div className="flex items-baseline gap-4">
                           <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">
                              {stats?.coins?.toLocaleString() || '0'}
                           </h2>
                           <Coins className="w-10 h-10 text-amber-500 animate-float" />
                        </div>
                     </div>
                     <div className="w-24 h-24 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/10">
                        <TrendingUp className="w-10 h-10" />
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4 py-4 px-6 bg-slate-950/50 rounded-2xl border border-white/5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Reseller Network Synchronized</p>
                  </div>
               </div>
            </section>

            {/* Transfer Form */}
            <section className="glass-card p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
               
               <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Send className="w-5 h-5 text-indigo-500" />
                  Initiate Asset Transfer
               </h3>

               <form onSubmit={handleTransfer} className="space-y-8">
                  <AnimatePresence>
                     {error && (
                       <motion.div 
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center gap-4"
                       >
                         <AlertCircle className="w-4 h-4" />
                         {error}
                       </motion.div>
                     )}
                     {success && (
                       <motion.div 
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center gap-4"
                       >
                         <CheckCircle2 className="w-4 h-4" />
                         {success}
                       </motion.div>
                     )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Target Identity UID</label>
                        <div className="relative group">
                           <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                           <input 
                              type="text" 
                              value={targetShortId}
                              onChange={(e) => setTargetShortId(e.target.value)}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                              placeholder="Recieving Protocol ID"
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Transfer Volume</label>
                        <div className="relative group">
                           <Coins className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                           <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold tabular-nums"
                              placeholder="0.00"
                           />
                        </div>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full h-18 py-6 rounded-3xl premium-gradient text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4"
                  >
                     {loading ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                           Encrypting Assets...
                        </>
                     ) : (
                        <>
                           <ShieldCheck className="w-5 h-5" />
                           Finalize Transfer Handshake
                        </>
                     )}
                  </button>
               </form>
            </section>
         </div>

         {/* Sidebar Stats & History */}
         <aside className="space-y-12">
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 flex flex-col h-full">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                     <History className="w-5 h-5 text-slate-500" />
                     Recent Logs
                  </h3>
               </div>

               <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                  {stats?.transactions?.length > 0 ? (
                    stats.transactions.map((tx: any) => (
                      <div key={tx.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-slate-900 transition-all">
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-xs font-black text-white truncate max-w-[120px]">{tx.notes}</p>
                           <p className={`text-sm font-black tabular-nums ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                           </p>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                              {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </p>
                           <div className="px-2 py-0.5 rounded bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-tighter">Verified</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                       <History className="w-12 h-12 text-slate-800 mb-4" />
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Logs Detected</p>
                    </div>
                  )}
               </div>

               <button className="w-full py-4 bg-slate-900 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-2xl hover:text-white hover:border-white/10 transition-all">
                  Request Full Audit Report
               </button>
            </div>
         </aside>
      </div>
    </div>
  );
};
