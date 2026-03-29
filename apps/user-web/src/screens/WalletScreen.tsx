import { useState } from 'react';
import { useStore } from '../store';
import { 
  Diamond, 
  Coins, 
  Zap, 
  CreditCard, 
  History, 
  ArrowUpRight, 
  TrendingUp,
  RefreshCw,
  Gift
} from 'lucide-react';

const PACKAGES = [
  { coins: 2000, price: 0.99, tag: 'Starter' },
  { coins: 9000, price: 4.99, tag: 'Popular', highlight: true },
  { coins: 19000, price: 9.99, tag: 'Pro' },
  { coins: 40000, price: 19.99, tag: 'Legend' },
  { coins: 90000, price: 49.99, tag: 'Divine' },
  { coins: 200000, price: 99.99, tag: 'Protocol Overload' },
];

export const WalletScreen = () => {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('coins');

  if (!user) return <div className="p-12">Session Required.</div>;

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div>
           <h1 className="text-5xl font-black tracking-tighter mb-4">Asset Vault</h1>
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Financial Cluster Management</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-4 glass-card rounded-2xl hover:bg-white/10 transition-all">
          <History className="w-5 h-5 text-slate-400" />
          <span className="text-[11px] font-black uppercase tracking-widest">Flux History</span>
        </button>
      </section>

      {/* Main Balances */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {/* Coins */}
         <div className="premium-gradient p-1 rounded-[3.5rem] shadow-2xl shadow-indigo-600/20">
            <div className="bg-[#020617] h-full rounded-[3.2rem] p-10 flex flex-col justify-between">
               <div className="flex justify-between mb-12">
                  <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                    <Coins className="text-indigo-500 w-8 h-8" />
                  </div>
                  <div className="px-3 py-1 bg-indigo-500/10 rounded-full text-indigo-500 text-[10px] font-black uppercase tracking-widest">Utility Asset</div>
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gold Coins</h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-black tabular-nums">{user.coins.toLocaleString()}</p>
                    <span className="text-slate-600 text-sm font-bold">OCG</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Diamonds */}
         <div className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] flex flex-col justify-between group hover:border-pink-500/30 transition-all">
               <div className="flex justify-between mb-12">
                  <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Diamond className="text-pink-500 w-8 h-8" />
                  </div>
                  <div className="px-3 py-1 bg-pink-500/10 rounded-full text-pink-500 text-[10px] font-black uppercase tracking-widest">Premium Core</div>
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Diamonds</h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-black tabular-nums">{user.diamonds.toLocaleString()}</p>
                    <span className="text-slate-600 text-sm font-bold">OCD</span>
                  </div>
               </div>
         </div>

         {/* Crystals */}
         <div className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
               <div className="flex justify-between mb-12">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="text-emerald-500 w-8 h-8" />
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest">Cluster Energy</div>
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Crystals</h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-black tabular-nums">{user.crystals.toLocaleString()}</p>
                    <span className="text-slate-600 text-sm font-bold">OCC</span>
                  </div>
               </div>
         </div>
      </section>

      {/* Recharge Section */}
      <section className="glass-card p-12 rounded-[4rem] space-y-12">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
               <button onClick={() => setActiveTab('coins')} className={`text-sm font-black uppercase tracking-widest pb-4 transition-all relative ${activeTab === 'coins' ? 'text-white' : 'text-slate-600'}`}>
                 Coin Recharge
                 {activeTab === 'coins' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
               </button>
               <button onClick={() => setActiveTab('exchange')} className={`text-sm font-black uppercase tracking-widest pb-4 transition-all relative ${activeTab === 'exchange' ? 'text-white' : 'text-slate-600'}`}>
                 Crystal Swap
                 {activeTab === 'exchange' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full" />}
               </button>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-xl">
               <TrendingUp className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">+15% Bonus Active</span>
            </div>
         </div>

         {activeTab === 'coins' ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {PACKAGES.map((pkg, i) => (
                <button key={i} className={`p-10 rounded-[3rem] border-2 transition-all group relative overflow-hidden ${
                  pkg.highlight ? 'bg-indigo-600/10 border-indigo-600' : 'bg-slate-950/40 border-white/5 hover:border-indigo-500/30'
                }`}>
                   {pkg.highlight && (
                     <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-600 rotate-45 flex items-end justify-center pb-2 underline font-black text-[9px] uppercase tracking-widest">Hot</div>
                   )}
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <Coins className="w-6 h-6 text-indigo-500 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">{pkg.tag}</span>
                   </div>
                   <h4 className="text-3xl font-black mb-8">{pkg.coins.toLocaleString()} <span className="text-sm text-slate-500">OCG</span></h4>
                   <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-white">${pkg.price}</span>
                      <div className="px-6 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">
                         Inject Assets
                      </div>
                   </div>
                </button>
              ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-20 bg-slate-950/50 rounded-[3.5rem] border border-dashed border-white/5">
              <RefreshCw className="w-16 h-16 text-slate-800 mb-8 animate-spin-slow" />
              <h3 className="text-2xl font-black mb-4">Crystal Exchange Active</h3>
              <p className="text-slate-500 font-medium mb-12 text-center max-w-sm">
                 Swap your accumulated social crystals for premium gold assets. Initialized via the mainnet bridge.
              </p>
              <div className="flex gap-4">
                 <button className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-500/20">Swap Now</button>
                 <button className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl uppercase tracking-widest text-[11px]">View Rates</button>
              </div>
           </div>
         )}
      </section>

      {/* Perks Footer */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="glass-card p-12 rounded-[3.5rem] flex items-center gap-10 group cursor-pointer hover:bg-white/5 transition-all">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
               <Gift className="text-indigo-500 w-10 h-10" />
            </div>
            <div>
               <h4 className="text-xl font-black mb-2">Claim Daily Bonus</h4>
               <p className="text-sm text-slate-500 font-medium">Inject up to 500 gold coins daily.</p>
            </div>
            <ArrowUpRight className="ml-auto text-slate-800 group-hover:text-indigo-500 transition-colors" />
         </div>
         
         <div className="glass-card p-12 rounded-[3.5rem] flex items-center gap-10 group cursor-pointer hover:bg-white/5 transition-all">
            <div className="w-20 h-20 bg-emerald-600/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
               <CreditCard className="text-emerald-500 w-10 h-10" />
            </div>
            <div>
               <h4 className="text-xl font-black mb-2">Saved Methods</h4>
               <p className="text-sm text-slate-500 font-medium">Manage Razorpay secure vinculations.</p>
            </div>
            <ArrowUpRight className="ml-auto text-slate-800 group-hover:text-emerald-500 transition-colors" />
         </div>
      </section>
    </div>
  );
};
