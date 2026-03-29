import { useState, useEffect } from 'react';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  ChevronLeft, ShoppingBag, Coins, 
  Sparkles, Zap, Package, 
  Heart, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const StoreScreen = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('HeadWear');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'HeadWear', label: 'Headwear', icon: Star },
    { id: 'Mounts', label: 'Mounts', icon: Zap },
    { id: 'Chat Bubble', label: 'Bubbles', icon: Sparkles },
    { id: 'Float', label: 'Floats', icon: Package },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      let category = activeTab.toUpperCase();
      if (category === 'MOUNTS') category = 'MOUNT';
      if (category === 'CHAT BUBBLE') category = 'BUBBLE';

      const response = await api.get('/shop/store', {
        params: { category }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleBuy = async (itemId: string) => {
    try {
      await api.post('/shop/store/buy', { itemId });
      alert('Asset acquired. Integration complete.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Acquisition protocol failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
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
               <h1 className="text-4xl font-black tracking-tight text-white mb-1 text-gradient">Asset Store</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3 text-indigo-400" />
                  Premium Virtual Enhancements
               </p>
            </div>
         </div>

         <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-4">
               <Coins className="w-5 h-5 text-amber-500" />
               <span className="text-sm font-black text-white tabular-nums">{user?.coins || 0}</span>
            </div>
            <button className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
               Recharge
            </button>
         </div>
      </div>

      {/* Featured Preview */}
      <section className="relative h-[400px] rounded-[3.5rem] overflow-hidden border border-white/5 group">
         <img 
           src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070" 
           className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
           alt="Featured Asset"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
         
         <div className="absolute bottom-12 left-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20">
               Featured Asset
            </div>
            <h2 className="text-6xl font-black text-white tracking-tight">Cyber-Ronin Mount</h2>
            <p className="text-slate-400 font-medium max-w-xl text-lg">Limited edition high-velocity mount with custom entry effects and resonance particles.</p>
            <div className="flex items-center gap-6 pt-4">
               <button className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95">
                  Acquire Now
               </button>
               <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-black text-white">45,000</span>
               </div>
            </div>
         </div>
      </section>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-4 py-8">
         {categories.map((cat) => (
           <button
             key={cat.id}
             onClick={() => setActiveTab(cat.id)}
             className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all ${
               activeTab === cat.id 
                 ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/20' 
                 : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
             }`}
           >
             <cat.icon className="w-5 h-5" />
             <span className="text-sm font-black uppercase tracking-widest">{cat.label}</span>
           </button>
         ))}
      </div>

      {/* Items Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-[2.5rem] bg-slate-900/50 animate-pulse border border-white/5" />
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -8 }}
                className="glass-card p-8 rounded-[2.5rem] border-white/5 group relative overflow-hidden flex flex-col items-center"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5 text-rose-500 cursor-pointer hover:fill-current" />
                 </div>

                 <div className="w-40 h-40 mb-6 relative group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-[40px] rounded-full group-hover:bg-indigo-500/20 transition-colors" />
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain relative z-10" />
                 </div>

                 <div className="text-center space-y-4 w-full">
                    <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{item.name}</h3>
                    
                    <div className="flex items-center justify-center gap-3 py-2 bg-slate-950/40 rounded-2xl border border-white/5">
                       <img 
                         src={item.currency === 'COIN' ? 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' : 'https://cdn-icons-png.flaticon.com/512/2312/2312739.png'} 
                         className="w-4 h-4" 
                         alt="currency"
                       />
                       <span className="text-lg font-black text-amber-500 tabular-nums">{item.price}</span>
                    </div>

                    <button 
                      onClick={() => handleBuy(item.id)}
                      className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                    >
                       Establish Connection
                    </button>
                 </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center space-y-4">
               <Package className="w-16 h-16 text-slate-800 mx-auto" />
               <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">No assets detected in this frequency</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Hint */}
      <div className="py-12 border-t border-white/5">
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Inventory re-sync every 300 seconds</p>
            <div className="flex items-center gap-8">
               <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Store Policies</button>
               <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Technical Support</button>
            </div>
         </div>
      </div>
    </div>
  );
};
