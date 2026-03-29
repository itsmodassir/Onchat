import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  ChevronLeft, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Gem
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AppLink = (Link as any);

export const CreatorDashboardScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/monetization/creator/stats');
      setStats(data);
    } catch (error) {
      console.error('Fetch stats failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!withdrawAmount || !paymentMethod || !paymentDetails) {
      setError('Please fill in all security fields.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Invalid withdrawal volume.');
      return;
    }

    if (amount > (stats?.currentDiamonds || 0)) {
      setError('Insufficient diamond reserves.');
      return;
    }

    try {
      await api.post('/monetization/creator/withdraw', {
        amount,
        method: paymentMethod,
        details: paymentDetails
      });
      setSuccess('Withdrawal request queued for processing.');
      setWithdrawAmount('');
      setPaymentMethod('');
      setPaymentDetails('');
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Security verification failed.');
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <AppLink 
            to="/" 
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </AppLink>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-1">Creator Central</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-3 h-3" />
              Secure Monetization Terminal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-black tabular-nums text-white">
              ${((stats?.currentDiamonds || 0) / 100).toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 pr-4">Total Assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Stats Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] group-hover:bg-indigo-500/10 transition-colors" />
            <div className="relative z-10 space-y-8">
               <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Vault Liquidity</p>
                  <Gem className="w-6 h-6 text-indigo-500 animate-pulse" />
               </div>
               
               <div className="space-y-2">
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">
                      {(stats?.currentDiamonds || 0).toLocaleString()}
                    </h2>
                    <span className="text-2xl font-black text-indigo-400 uppercase tracking-widest">Diamonds</span>
                  </div>
                  <p className="text-slate-500 font-bold text-lg">≈ ${((stats?.currentDiamonds || 0) / 100).toFixed(2)} USD Liquid Value</p>
               </div>

               <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                       <TrendingUp className="w-3 h-3" />
                       Lifetime Revenue
                     </p>
                     <p className="text-2xl font-black text-white tabular-nums">{(stats?.lifetimeEarnings || 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3" />
                       Pending Audit
                     </p>
                     <p className="text-2xl font-black text-amber-500 tabular-nums">{(stats?.pendingDiamonds || 0).toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                   <ArrowUpRight className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Revenue Analysis</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Your current diamond velocity is up 14% compared to last cycle. Most earnings originated from 'Main Stage' voice rooms.
                </p>
             </div>
             <div className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Security Rating</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Excellent account standing. All major KYC verifications passed. Withdrawal limit expanded to 5,000 Diamonds/day.
                </p>
             </div>
          </div>
        </div>

        {/* Withdrawal Form Area */}
        <div className="lg:col-span-4 space-y-8">
           <form onSubmit={handleWithdraw} className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                 <Wallet className="w-5 h-5 text-indigo-500" />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Liquidate Assets</h3>
              </div>

              <div className="space-y-4">
                 <div className="relative group">
                    <DollarSign className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="number" 
                      placeholder="Amount to withdraw"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                 </div>

                 <div className="relative group">
                    <CreditCard className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Method (Bank/UPI)"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                 </div>

                 <textarea 
                    placeholder="Recipient Routing Details"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                 />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                className="w-full py-5 premium-gradient text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Initiate Transfer
              </button>
           </form>

           <div className="glass-card p-8 rounded-[2rem] border-white/5 space-y-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-4">Transfer Protocols</h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase tracking-tighter">Min Liquidation</span>
                    <span className="text-slate-300">100 Diamonds</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase tracking-tighter">Conversion Tier</span>
                    <span className="text-slate-300">100 : $1.00 USD</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase tracking-tighter">SLA Time</span>
                    <span className="text-slate-300">3-5 Business Days</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
