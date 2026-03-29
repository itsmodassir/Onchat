import { useState } from 'react';
import { 
  Check, ChevronLeft, Sparkles, Target, 
  Music, Gamepad2, Heart, MessageSquare, 
  Zap, Compass, Cpu, Trophy, 
  Film, Camera, Plane, Utensils,
  Dumbbell
} from 'lucide-react';
import { useStore } from '../store';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const INTERESTS = [
  { id: 'Music', icon: Music, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'Games', icon: Gamepad2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'Dating', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'Chat', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'Spiritual', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'Politics', icon: Compass, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  { id: 'Education', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'Technology', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'Sports', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'Movies', icon: Film, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'Anime', icon: Camera, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: 'Travel', icon: Plane, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { id: 'Food', icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'Fitness', icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
];

export const InterestsScreen = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [selected, setSelected] = useState<string[]>(user?.interests || []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      alert('Selection of at least one interest protocol is required.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put('/social/interests', selected);
      setUser(data);
      alert('Preference matrices updated successfully.');
      navigate(-1);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to sync preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header */}
      <div className="flex items-center gap-6">
         <button 
           onClick={() => navigate(-1)}
           className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
         >
            <ChevronLeft className="w-6 h-6" />
         </button>
         <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-1 uppercase tracking-tighter">Interest Calibration</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
               <Target className="w-3 h-3 text-indigo-400" />
               Signal Filtering & Match Optimization
            </p>
         </div>
      </div>

      <div className="space-y-12">
         <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight italic">What resonates with your identity?</h2>
            <p className="text-slate-500 font-medium max-w-xl">Selecting specific interests enhances the neural recommendation engine, ensuring portal matches align with your frequency.</p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {INTERESTS.map((interest) => {
               const isSelected = selected.includes(interest.id);
               return (
                 <motion.button
                   key={interest.id}
                   whileHover={{ y: -4 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => toggleInterest(interest.id)}
                   className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-4 group relative overflow-hidden ${
                     isSelected 
                       ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-600/20' 
                       : 'bg-slate-950 border-white/5 hover:border-white/10'
                   }`}
                 >
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-4 right-4"
                      >
                         <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-indigo-600">
                            <Check className="w-4 h-4 stroke-[4px]" />
                         </div>
                      </motion.div>
                    )}
                    
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-white text-indigo-600' : `${interest.bg} ${interest.color}`}`}>
                       <interest.icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-500'}`}>{interest.id}</span>
                 </motion.button>
               );
            })}
         </div>

         <div className="pt-8 flex flex-col items-center gap-8">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full max-w-sm h-20 rounded-[2rem] premium-gradient text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
               {loading ? 'Transmitting Data...' : 'Synchronize Preferences'}
            </button>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <Sparkles className="w-3 h-3" />
               Preferences are encrypted and stored in local identity vault
            </p>
         </div>
      </div>
    </div>
  );
};
