import { useState } from 'react';
import { 
  ShoppingBag, 
  Crown, 
  Ghost as GhostIcon, 
  MessageCircle, 
  Car, 
  Sparkles,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';

const CATEGORIES = [
  { id: 'mounts', label: 'Mounts', icon: Car },
  { id: 'headwear', label: 'Headwear', icon: Crown },
  { id: 'bubbles', label: 'Bubbles', icon: MessageCircle },
  { id: 'effects', label: 'Effects', icon: Sparkles },
  { id: 'special', label: 'Special', icon: GhostIcon },
];

const MOCK_ITEMS = [
  { id: '1', name: 'Cyber Dragon', category: 'mounts', price: 50000, rarity: 'Legendary' },
  { id: '2', name: 'Neon Crown', category: 'headwear', price: 15000, rarity: 'Epic' },
  { id: '3', name: 'Hologram Wings', category: 'effects', price: 25000, rarity: 'Rare' },
  { id: '4', name: 'Pixel Bubble', category: 'bubbles', price: 5000, rarity: 'Common' },
  { id: '5', name: 'Imperial Throne', category: 'special', price: 100000, rarity: 'Mythic' },
  { id: '6', name: 'Starship', category: 'mounts', price: 75000, rarity: 'Legendary' },
];

export const StoreScreen = () => {
  const [activeCat, setActiveCat] = useState('mounts');

  return (
    <div className="p-12 pb-24 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <section className="flex justify-between items-end bg-slate-950/40 p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-widest mb-6">
              <ShoppingBag className="w-3 h-3" />
              Premium Marketplace
           </div>
           <h1 className="text-5xl font-black tracking-tighter mb-4">Virtual Outfitter</h1>
           <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px]">Customize your digital presence</p>
        </div>
        <div className="relative z-10">
           <button className="flex items-center gap-4 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-indigo-50 transition-all">
              <ShoppingCart className="w-5 h-5" />
              My Bag
           </button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent" />
      </section>

      {/* Categories */}
      <section className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar">
         {CATEGORIES.map(cat => (
           <button
             key={cat.id}
             onClick={() => setActiveCat(cat.id)}
             className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all whitespace-nowrap border-2 ${
               activeCat === cat.id 
                 ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' 
                 : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/10'
             }`}
           >
             <cat.icon className="w-4 h-4" />
             {cat.label}
           </button>
         ))}
      </section>

      {/* Items Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
         {MOCK_ITEMS.filter(i => i.category === activeCat).map(item => (
           <div key={item.id} className="glass-card rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="aspect-square bg-slate-800/50 p-12 relative flex items-center justify-center">
                 <div className="w-full h-full border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center">
                    <Sparkles className="w-20 h-20 text-slate-700 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                 </div>
                 
                 <div className="absolute top-6 right-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      item.rarity === 'Legendary' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      item.rarity === 'Epic' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      'bg-slate-500/10 text-slate-500 border-white/5'
                    }`}>
                      {item.rarity}
                    </span>
                 </div>
              </div>
              
              <div className="p-10">
                 <h3 className="text-xl font-black mb-6">{item.name}</h3>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Crown className="w-4 h-4" />
                       </div>
                       <span className="text-lg font-black tabular-nums">{item.price.toLocaleString()}</span>
                    </div>
                    <button className="px-6 py-3 bg-white/5 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                       Buy Now
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </section>
      
      {/* Banner */}
      <section className="premium-gradient p-16 rounded-[4rem] text-center space-y-6">
         <h2 className="text-4xl font-black tracking-tighter">Aristocracy Collection Drop</h2>
         <p className="text-slate-100/60 font-medium max-w-xl mx-auto">
           Unlock limited edition mounts and headwear only available for Tier 3 verification members.
         </p>
         <button className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-transform">
           Explore Collection <ChevronRight className="inline-block ml-2 w-4 h-4" />
         </button>
      </section>
    </div>
  );
};
